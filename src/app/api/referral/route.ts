import { promises as fs } from "node:fs";
import path from "node:path";
import { NextResponse } from "next/server";
import { isValidSource } from "@/lib/referral";

export const dynamic = "force-dynamic";

/**
 * Referral survey store — a small JSON file on the server.
 * Every visitor's "How did you hear about us?" answer lands here, keyed by an
 * anonymous clientId so re-answers update instead of duplicating.
 * NOTE: on Render's free tier the disk is ephemeral — data survives until the
 * next redeploy. Set REFERRAL_STORE to a mounted-disk path to persist longer.
 */

interface ReferralRecord {
  clientId: string;
  source: string;
  detail: string;
  ts: number;
  ua: string;
}

interface ReferralDB {
  records: ReferralRecord[];
}

const STORE_PATH =
  process.env.REFERRAL_STORE ?? path.join(process.cwd(), ".data", "referrals.json");

/* serialize read-modify-write cycles within this server instance */
let queue: Promise<unknown> = Promise.resolve();

async function readDB(): Promise<ReferralDB> {
  try {
    const raw = await fs.readFile(STORE_PATH, "utf8");
    const parsed = JSON.parse(raw) as ReferralDB;
    if (Array.isArray(parsed.records)) return { records: parsed.records };
  } catch {
    /* first run or wiped disk */
  }
  return { records: [] };
}

async function writeDB(db: ReferralDB) {
  await fs.mkdir(path.dirname(STORE_PATH), { recursive: true });
  await fs.writeFile(STORE_PATH, JSON.stringify(db, null, 2), "utf8");
}

/** POST { clientId, source, detail? } — upsert one answer per device */
export async function POST(req: Request) {
  let body: { clientId?: string; source?: string; detail?: string };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "invalid JSON" }, { status: 400 });
  }

  const clientId = (body.clientId ?? "").trim();
  const source = (body.source ?? "").trim();
  const detail = (body.detail ?? "").toString().slice(0, 300);

  if (clientId.length < 8 || clientId.length > 64) {
    return NextResponse.json({ error: "invalid clientId" }, { status: 400 });
  }
  if (!isValidSource(source)) {
    return NextResponse.json({ error: "unknown source" }, { status: 400 });
  }

  const ua = (req.headers.get("user-agent") ?? "").slice(0, 180);
  const ts = Date.now();

  queue = queue.then(async () => {
    const db = await readDB();
    const existing = db.records.findIndex((r) => r.clientId === clientId);
    const record: ReferralRecord = { clientId, source, detail, ts, ua };
    if (existing >= 0) db.records[existing] = record;
    else db.records.push(record);
    await writeDB(db);
    return db.records.length;
  });

  try {
    const total = (await queue) as number;
    return NextResponse.json({ ok: true, total });
  } catch {
    return NextResponse.json({ error: "could not save answer" }, { status: 500 });
  }
}

/** GET — aggregate counts for the owner dashboard */
export async function GET() {
  const db = await readDB();
  const counts: Record<string, number> = {};
  for (const r of db.records) counts[r.source] = (counts[r.source] ?? 0) + 1;
  return NextResponse.json({ total: db.records.length, counts });
}
