import { promises as fs } from "node:fs";
import path from "node:path";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * Automated platform email — cancellation confirmations, payment receipts,
 * password-less notices. Members never email support: everything transactional
 * is sent FROM the platform's no-reply address (no-reply@moddeck.app) automatically.
 *
 * Today each message is written to a server-side outbox file so the flow is
 * fully testable (GET returns the total, the JSON file holds the messages).
 * To deliver for real, drop in a provider key — e.g. Resend:
 *   const resend = new Resend(process.env.RESEND_API_KEY);
 *   await resend.emails.send({ from: "ModDeck <no-reply@moddeck.app>", to, subject, text: body });
 * (a free Resend account + domain verify — no Google account involved).
 */

interface EmailRecord {
  id: string;
  to: string;
  subject: string;
  body: string;
  ts: number;
}

interface OutboxDB {
  messages: EmailRecord[];
}

const STORE_PATH =
  process.env.EMAIL_STORE ?? path.join(process.cwd(), ".data", "emails.json");

/* serialize read-modify-write cycles within this server instance */
let queue: Promise<unknown> = Promise.resolve();

async function readDB(): Promise<OutboxDB> {
  try {
    const raw = await fs.readFile(STORE_PATH, "utf8");
    const parsed = JSON.parse(raw) as OutboxDB;
    if (Array.isArray(parsed.messages)) return { messages: parsed.messages };
  } catch {
    /* first run or wiped disk */
  }
  return { messages: [] };
}

async function writeDB(db: OutboxDB) {
  await fs.mkdir(path.dirname(STORE_PATH), { recursive: true });
  await fs.writeFile(STORE_PATH, JSON.stringify(db, null, 2), "utf8");
}

/** POST { to, subject, body } — queue one automated email */
export async function POST(req: Request) {
  let body: { to?: string; subject?: string; body?: string };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "invalid JSON" }, { status: 400 });
  }

  const to = (body.to ?? "").trim().slice(0, 200);
  const subject = (body.subject ?? "").trim().slice(0, 200);
  const text = (body.body ?? "").trim().slice(0, 4000);

  if (!to || !subject || !text) {
    return NextResponse.json({ error: "to, subject and body are required" }, { status: 400 });
  }

  const record: EmailRecord = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    to,
    subject,
    body: text,
    ts: Date.now(),
  };

  queue = queue.then(async () => {
    const db = await readDB();
    db.messages.unshift(record);
    db.messages = db.messages.slice(0, 200); // cap the outbox
    await writeDB(db);
    return db.messages.length;
  });

  try {
    const total = (await queue) as number;
    /* provider plug-in point (see comment above) — queued + counted for now */
    return NextResponse.json({ ok: true, queued: true, id: record.id, total });
  } catch {
    return NextResponse.json({ error: "could not queue email" }, { status: 500 });
  }
}

/** GET — outbox size (handy for the owner dashboard) */
export async function GET() {
  const db = await readDB();
  return NextResponse.json({ total: db.messages.length });
}
