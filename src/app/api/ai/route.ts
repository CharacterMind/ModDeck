import { NextResponse } from "next/server";
import ZAI from "z-ai-web-dev-sdk";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * ModDeck AI — the Boost-powered mod builder.
 *
 * Members chat with a game-trainer modding assistant: describe a mod and it
 * designs the cheat table, writes the Lua/trainer logic, or explains how a
 * technique works. Free members get 3 questions a day; extra questions are
 * spent with Boost (25 per question, enforced client-side before the call —
 * the quota lives in the persisted member store). Pro members have it
 * unlimited as a Pro feature.
 */

const SYSTEM_PROMPT = [
  "You are ModDeck AI, the built-in mod-building assistant of ModDeck, a WeMod-style PC game trainer platform.",
  "You help members design and build single-player game mods and trainers: Cheat Engine tables, Lua scripts, trainer features (God Mode, Infinite Money, multipliers, time controls, teleports), memory-scanning approaches, and modding-tool workflows.",
  "Rules you never break:",
  "- Single-player and co-op only. Refuse anything that touches online multiplayer, ranked matchmaking, anti-cheat circumvention, or cheating other real players out of fairness. Offer a single-player alternative instead.",
  "- Be practical and concise: give concrete steps, tables, or code (Lua / C / Python / Cheat Engine auto-assembler) in fenced code blocks.",
  "- When memory offsets are game-specific, explain how to find them (pointer scans, AOB scans) instead of inventing fake addresses.",
  "- Keep answers under ~350 words unless the user explicitly asks for a full script or deep dive.",
].join("\n");

/** build-mode prompts — paying more Boost buys better coding and longer requests */
const BUILD_RULES = [
  "You are ModDeck AI, the mod-building engine of ModDeck, a WeMod-style PC game trainer platform.",
  "The member is building a mod for a specific single-player game. Deliver a finished, ready-to-use artifact — not an interview or a list of questions.",
  "Rules you never break:",
  "- Single-player and co-op only. Refuse anything that touches online multiplayer, ranked matchmaking, anti-cheat circumvention, or cheating other real players out of fairness. Offer a single-player alternative instead.",
  "- Never invent fake memory addresses — if offsets are game-specific, explain exactly how to find them (pointer scans, AOB scans) and leave clearly marked placeholders.",
  "- Always format code in fenced code blocks with the language tag, and finish with short install/use notes.",
].join("\n");

const BUILD_TIER_PROMPTS: Record<string, string> = {
  quick: [
    BUILD_RULES,
    "TIER: QUICK BUILD (~150 words). Produce one compact script or cheat-table entry that implements exactly the effect the member described.",
    "Keep it minimal but working: one code block, one or two lines of setup notes. No alternatives, no extras.",
  ].join("\n"),
  smart: [
    BUILD_RULES,
    "TIER: SMART BUILD (~350 words). Produce clean, production-quality code: sensible defaults, edge cases handled (value clamping, save safety, hotkey conflicts), brief inline comments, and numbered install/use notes.",
    "If the game makes a memory approach risky, prefer a safe technique and say why in one sentence.",
  ].join("\n"),
  deep: [
    BUILD_RULES,
    "TIER: DEEP BUILD (no word cap — this is the longest, best-coding request). Produce a complete trainer plan plus the full implementation:",
    "1) approach summary, 2) the complete code (Lua script or Cheat Engine table/auto-assembler — as many fenced blocks as needed), 3) how to find the game-specific addresses, 4) numbered install/use notes, 5) two or three suggested extensions the member could ask for next.",
    "Code must be robust: guard against nil lookups, clamp slider ranges, avoid save corruption, include configurable constants at the top of scripts.",
  ].join("\n"),
};


interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

function sanitizeMessages(input: unknown): ChatMessage[] {
  if (!Array.isArray(input)) return [];
  return input
    .filter(
      (m): m is ChatMessage =>
        !!m &&
        typeof m === "object" &&
        ((m as ChatMessage).role === "user" || (m as ChatMessage).role === "assistant") &&
        typeof (m as ChatMessage).content === "string" &&
        (m as ChatMessage).content.trim().length > 0
    )
    .slice(-10)
    .map((m) => ({ role: m.role, content: m.content.slice(0, 2000) }));
}

export async function POST(req: Request) {
  let body: {
    messages?: unknown;
    mode?: unknown;
    tier?: unknown;
    game?: unknown;
    prompt?: unknown;
  };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "invalid JSON" }, { status: 400 });
  }

  try {
    const zai = await ZAI.create();

    /* build mode — one shot: game + description + tier prompt */
    if (body.mode === "build") {
      const tier = typeof body.tier === "string" && BUILD_TIER_PROMPTS[body.tier] ? body.tier : null;
      if (!tier) {
        return NextResponse.json({ error: "unknown build tier" }, { status: 400 });
      }
      const game = typeof body.game === "string" ? body.game.trim().slice(0, 80) : "";
      const prompt = typeof body.prompt === "string" ? body.prompt.trim().slice(0, 2000) : "";
      if (!prompt) {
        return NextResponse.json({ error: "describe what the mod should do" }, { status: 400 });
      }
      const ask = game
        ? `Game: ${game}\nMod request: ${prompt}`
        : `Mod request: ${prompt}`;
      const completion = await zai.chat.completions.create({
        messages: [
          { role: "assistant", content: BUILD_TIER_PROMPTS[tier] },
          { role: "user", content: ask },
        ],
        thinking: { type: "disabled" },
      });
      const text = completion.choices[0]?.message?.content?.trim() ?? "";
      if (!text) {
        return NextResponse.json({ error: "empty response" }, { status: 502 });
      }
      return NextResponse.json({ text });
    }

    /* chat mode — the multi-turn assistant */
    const messages = sanitizeMessages(body.messages);
    if (messages.length === 0 || messages[messages.length - 1].role !== "user") {
      return NextResponse.json({ error: "at least one user message is required" }, { status: 400 });
    }

    const completion = await zai.chat.completions.create({
      messages: [{ role: "assistant", content: SYSTEM_PROMPT }, ...messages],
      thinking: { type: "disabled" },
    });
    const text = completion.choices[0]?.message?.content?.trim() ?? "";
    if (!text) {
      return NextResponse.json({ error: "empty response" }, { status: 502 });
    }
    return NextResponse.json({ text });
  } catch (err) {
    console.error("[api/ai] completion failed:", err);
    return NextResponse.json({ error: "ModDeck AI is unavailable right now" }, { status: 500 });
  }
}
