"use client";

import { useEffect, useRef, useState } from "react";
import {
  Bot,
  Check,
  Copy,
  Crown,
  Hammer,
  SendHorizonal,
  Sparkles,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  AI_BUILD_TIERS,
  AI_FREE_PER_DAY,
  AI_QUESTION_COST,
  aiFreeRemaining,
  useModDeck,
  type AiBuildTierId,
} from "@/lib/moddeck-store";
import { GAMES } from "@/data/games";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

/* ---------- tiny fenced-code renderer (no markdown dependency) ---------- */

function MessageBody({ content, isUser }: { content: string; isUser: boolean }) {
  if (isUser) return <p className="whitespace-pre-wrap text-[13px] leading-relaxed">{content}</p>;
  const parts = content.split(/```(?:\w*\n)?/g);
  return (
    <div className="space-y-2 text-[13px] leading-relaxed">
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <pre
            key={i}
            className="scrollbar-slim overflow-x-auto rounded-lg border border-white/10 bg-black/40 p-3 font-mono text-[11px] leading-relaxed text-lime-200"
          >
            {part.replace(/\n$/, "")}
          </pre>
        ) : (
          part.trim() && (
            <p key={i} className="whitespace-pre-wrap">
              {part.trim().replace(/\*\*([^*]+)\*\*/g, "$1")}
            </p>
          )
        )
      )}
    </div>
  );
}

function wordCount(text: string) {
  return text.trim() ? text.trim().split(/\s+/).length : 0;
}

/* ------------------------------- ask pane ------------------------------- */

const SUGGESTIONS = [
  "Make me a God Mode + Infinite Money cheat table plan for Elden Ring",
  "Write a Lua script for Supermarket Together that keeps money at 99,999",
  "How do I find a health address with a pointer scan in Cheat Engine?",
];

function AskPane() {
  const { aiMessages, setAiMessages, boosts, pro, ownerMode, auth, setAuthOpen, navigate } =
    useModDeck();
  const aiDate = useModDeck((s) => s.aiDate);
  const aiFreeUsed = useModDeck((s) => s.aiFreeUsed);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  const freeLeft = aiFreeRemaining({ aiDate, aiFreeUsed });
  const unlimited = pro || ownerMode;
  const usesFreeSlot = unlimited || freeLeft > 0;
  void usesFreeSlot;

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [aiMessages.length, busy]);

  const send = async (text: string) => {
    const content = text.trim();
    if (!content || busy) return;
    if (!auth.signedIn) {
      setAuthOpen(true);
      return;
    }

    /* Boost cost — free daily slots first, then 25 Boost per question */
    let spent = 0;
    if (!unlimited && freeLeft <= 0) {
      if (!useModDeck.getState().spendBoosts(AI_QUESTION_COST, "Mod AI question")) {
        toast.error(`Not enough Boost — a question costs ${AI_QUESTION_COST}`, {
          description: "Earn Boost free on the Mods page, or grab a pack.",
        });
        return;
      }
      spent = AI_QUESTION_COST;
    }
    if (!unlimited && freeLeft > 0) useModDeck.getState().recordAiUse();

    const history = [...aiMessages, { role: "user" as const, content }];
    setAiMessages(history);
    setDraft("");
    setBusy(true);
    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history.slice(-10) }),
      });
      const data = (await res.json()) as { text?: string; error?: string };
      if (!res.ok || !data.text) throw new Error(data.error ?? "request failed");
      setAiMessages([...history, { role: "assistant", content: data.text }]);
    } catch {
      /* the question didn't get an answer — give the Boost back */
      if (spent) useModDeck.getState().addBoosts(spent);
      toast.error("ModDeck AI couldn't answer that one — try again", {
        description: spent ? `${spent} Boost refunded to your balance.` : undefined,
      });
      setAiMessages(history.slice(0, -1));
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      {/* messages */}
      <div className="scrollbar-slim mt-4 min-h-0 flex-1 space-y-3 overflow-y-auto pb-4">
        {aiMessages.length === 0 && (
          <div className="mt-6 text-center">
            <Bot className="mx-auto h-10 w-10 text-muted-foreground/40" strokeWidth={1.25} />
            <p className="mt-3 text-[13px] font-bold text-foreground">Build a mod with a sentence</p>
            <p className="mx-auto mt-1 max-w-sm text-[11px] leading-relaxed text-muted-foreground">
              ModDeck AI designs cheat tables, writes Lua, and explains trainer techniques —
              single-player only.{" "}
              {!unlimited && `${AI_FREE_PER_DAY} questions free every day, then Boost.`}
            </p>
            <div className="mt-4 space-y-1.5">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="mx-auto block w-full max-w-md rounded-lg border border-white/8 bg-panel/70 px-3 py-2 text-left text-[11px] font-semibold text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
                >
                  <Sparkles className="mr-1.5 inline h-3 w-3 text-primary" />
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {aiMessages.map((m, i) => (
          <div key={i} className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}>
            <div
              className={cn(
                "max-w-[85%] rounded-2xl px-3.5 py-2.5",
                m.role === "user"
                  ? "rounded-br-md bg-primary font-bold text-primary-foreground"
                  : "rounded-bl-md border border-white/8 bg-panel/80 text-foreground"
              )}
            >
              <MessageBody content={m.content} isUser={m.role === "user"} />
            </div>
          </div>
        ))}

        {busy && (
          <div className="flex justify-start">
            <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-md border border-white/8 bg-panel/80 px-3.5 py-3">
              {[0, 1, 2].map((d) => (
                <span
                  key={d}
                  className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground"
                  style={{ animationDelay: `${d * 140}ms` }}
                />
              ))}
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* composer */}
      <div className="shrink-0 border-t border-white/8 py-4">
        <div className="flex items-center gap-2">
          <Input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send(draft);
              }
            }}
            placeholder={
              auth.signedIn
                ? unlimited
                  ? "Ask for any single-player mod…"
                  : freeLeft > 0
                    ? `Ask for any single-player mod… (${freeLeft} free left today)`
                    : `Next question costs ${AI_QUESTION_COST} Boost…`
                : "Sign in to build mods with ModDeck AI…"
            }
            aria-label="Ask ModDeck AI"
            disabled={busy}
            maxLength={2000}
            className="h-11 flex-1"
          />
          <Button
            onClick={() => send(draft)}
            disabled={busy || !draft.trim()}
            className="h-11 bg-primary px-4 font-black text-primary-foreground hover:bg-primary/90"
            aria-label="Send question to ModDeck AI"
          >
            <SendHorizonal className="h-4 w-4" />
          </Button>
        </div>
        <p className="mt-2 text-center text-[10px] text-muted-foreground">
          {unlimited ? (
            "Unlimited questions with Pro — single-player mods only."
          ) : freeLeft > 0 ? (
            <>
              {freeLeft} free question{freeLeft === 1 ? "" : "s"} left today — then{" "}
              <span className="font-bold text-lime-300">{AI_QUESTION_COST} Boost each</span>.{" "}
              <button onClick={() => navigate("home")} className="font-bold text-lime-300 hover:underline">
                Earn free Boost →
              </button>
            </>
          ) : (
            <>
              Free questions used up —{" "}
              <span className="font-bold text-lime-300">{AI_QUESTION_COST} Boost per question</span>.{" "}
              <button onClick={() => navigate("home")} className="font-bold text-lime-300 hover:underline">
                Get more Boost →
              </button>
            </>
          )}
        </p>
      </div>
    </>
  );
}

/* ------------------------------ build pane ------------------------------ */

function BuildPane() {
  const { aiBuild, setAiBuild, boosts, pro, ownerMode, auth, setAuthOpen, navigate } = useModDeck();
  const [gameId, setGameId] = useState<string>("supermarket-together");
  const [prompt, setPrompt] = useState("");
  const [tier, setTier] = useState<AiBuildTierId>("smart");
  const [busy, setBusy] = useState(false);

  const unlimited = pro || ownerMode;
  const tierDef = AI_BUILD_TIERS.find((t) => t.id === tier) ?? AI_BUILD_TIERS[1];

  const build = async () => {
    const desc = prompt.trim();
    if (!desc || busy) return;
    if (!auth.signedIn) {
      setAuthOpen(true);
      return;
    }
    const game = gameId === "other" ? null : GAMES.find((g) => g.id === gameId);

    /* Boost cost — Pro/owner build free */
    let spent = 0;
    if (!unlimited) {
      if (!useModDeck.getState().spendBoosts(tierDef.cost, `${tierDef.name} — mod builder`)) {
        toast.error(`Not enough Boost — a ${tierDef.name.toLowerCase()} costs ${tierDef.cost}`, {
          description: "Earn Boost free on the Mods page, or grab a pack.",
        });
        return;
      }
      spent = tierDef.cost;
    }

    setBusy(true);
    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "build", tier, game: game?.title ?? "", prompt: desc }),
      });
      const data = (await res.json()) as { text?: string; error?: string };
      if (!res.ok || !data.text) throw new Error(data.error ?? "request failed");
      setAiBuild({
        gameId: gameId,
        gameTitle: game?.title ?? "Custom mod",
        prompt: desc,
        tier,
        cost: unlimited ? 0 : spent,
        text: data.text,
        at: Date.now(),
      });
      toast.success(
        unlimited
          ? `${tierDef.name} delivered — free with your plan`
          : `${tierDef.name} delivered — ${spent} Boost`,
        { description: `${wordCount(data.text)} words of ready-to-use mod code.` }
      );
    } catch {
      /* the build didn't happen — give the Boost back */
      if (spent) useModDeck.getState().addBoosts(spent);
      toast.error("ModDeck AI couldn't build that one — try again", {
        description: spent ? `${spent} Boost refunded to your balance.` : undefined,
      });
    } finally {
      setBusy(false);
    }
  };

  const copyResult = async () => {
    if (!aiBuild) return;
    try {
      await navigator.clipboard.writeText(aiBuild.text);
      toast.success("Mod copied to clipboard");
    } catch {
      toast.error("Couldn't copy — select the text manually");
    }
  };

  return (
    <>
      <div className="scrollbar-slim mt-4 min-h-0 flex-1 space-y-4 overflow-y-auto pb-4">
        {/* game + request */}
        <div className="rounded-xl border border-white/8 bg-panel/70 p-4">
          <p className="text-[13px] font-bold text-foreground">
            <Hammer className="mr-1.5 inline h-3.5 w-3.5 text-primary" />
            Build a mod
          </p>
          <p className="mt-0.5 text-[11px] leading-snug text-muted-foreground">
            Describe what the mod should do — ModDeck AI writes the script, table and install notes.
            Single-player games only.
          </p>

          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black tracking-wide text-muted-foreground uppercase">
                Game
              </label>
              <Select value={gameId} onValueChange={setGameId}>
                <SelectTrigger className="h-10 w-full text-[12px]" aria-label="Game to build the mod for">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-h-72">
                  {GAMES.map((g) => (
                    <SelectItem key={g.id} value={g.id} className="text-[12px]">
                      {g.title}
                    </SelectItem>
                  ))}
                  <SelectItem value="other" className="text-[12px]">
                    Other game (name it in the description)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black tracking-wide text-muted-foreground uppercase">
                What should the mod do?
              </label>
              <Textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g. Infinite money plus a hotkey to multiply it by 10, keep it save-safe…"
                aria-label="Describe the mod you want"
                maxLength={2000}
                rows={3}
                className="resize-none text-[12px]"
              />
            </div>
          </div>

          {/* tiers — better coding / longer requests cost more Boost */}
          <p className="mt-4 text-[10px] font-black tracking-wide text-muted-foreground uppercase">
            Pick your build tier
          </p>
          <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-3">
            {AI_BUILD_TIERS.map((t) => {
              const active = t.id === tier;
              return (
                <button
                  key={t.id}
                  onClick={() => setTier(t.id)}
                  aria-pressed={active}
                  className={cn(
                    "rounded-xl border p-3 text-left transition-colors",
                    active
                      ? "border-lime-300/60 bg-lime-300/10"
                      : "border-white/8 bg-white/[0.02] hover:border-white/20"
                  )}
                >
                  <span className="flex items-center justify-between">
                    <span className="text-[12px] font-black text-foreground">{t.name}</span>
                    {unlimited ? (
                      <span className="inline-flex items-center gap-0.5 text-[10px] font-black text-lime-300">
                        <Crown className="h-3 w-3 fill-lime-300" /> Free
                      </span>
                    ) : (
                      <span className="text-[10px] font-black text-lime-300">{t.cost} ⚡</span>
                    )}
                  </span>
                  <span className="mt-1 block text-[10px] leading-snug text-muted-foreground">
                    {t.blurb}
                  </span>
                  <span className="mt-1.5 block text-[9px] font-bold tracking-wide text-muted-foreground/70 uppercase">
                    {t.spec}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="mt-3 flex items-center gap-2">
            <Button
              onClick={build}
              disabled={busy || !prompt.trim()}
              className="h-10 flex-1 bg-lime-300 font-black text-neutral-900 hover:bg-lime-300/90"
            >
              {busy ? (
                "Building your mod…"
              ) : unlimited ? (
                <>
                  <Crown className="mr-1.5 h-3.5 w-3.5 fill-neutral-900" /> Build free
                </>
              ) : (
                <>
                  <Zap className="mr-1.5 h-3.5 w-3.5 fill-neutral-900" /> Build for{" "}
                  {tierDef.cost} Boost
                </>
              )}
            </Button>
          </div>
          <p className="mt-2 text-center text-[10px] text-muted-foreground">
            {unlimited ? (
              "Mod Builder is unlimited with your plan."
            ) : (
              <>
                Balance: <span className="font-bold text-lime-300">{boosts.toLocaleString()} Boost</span> ·{" "}
                <button onClick={() => navigate("home")} className="font-bold text-lime-300 hover:underline">
                  Earn free Boost →
                </button>
              </>
            )}
          </p>
        </div>

        {/* result */}
        {aiBuild && (
          <div className="rounded-xl border border-lime-300/25 bg-panel/80 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-[13px] font-black text-foreground">
                  <Check className="mr-1.5 inline h-3.5 w-3.5 text-lime-300" />
                  Your mod — {aiBuild.gameTitle}
                </p>
                <p className="mt-0.5 text-[10px] text-muted-foreground">
                  {AI_BUILD_TIERS.find((t) => t.id === aiBuild.tier)?.name} ·{" "}
                  {aiBuild.cost ? `${aiBuild.cost} Boost` : "Free"} · {wordCount(aiBuild.text)} words ·{" "}
                  {new Date(aiBuild.at).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                </p>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="h-8 border-white/15 px-3 text-[11px] font-bold hover:bg-white/5"
                onClick={copyResult}
              >
                <Copy className="mr-1 h-3 w-3" /> Copy
              </Button>
            </div>
            <div className="mt-3 rounded-lg border border-white/8 bg-black/20 p-3">
              <MessageBody content={aiBuild.text} isUser={false} />
            </div>
          </div>
        )}
      </div>
    </>
  );
}

/* ------------------------------- the view ------------------------------- */

export function AiView() {
  const { pro, ownerMode } = useModDeck();
  const aiTab = useModDeck((s) => s.aiTab);
  const setAiTab = useModDeck((s) => s.setAiTab);
  const aiDate = useModDeck((s) => s.aiDate);
  const aiFreeUsed = useModDeck((s) => s.aiFreeUsed);
  const boosts = useModDeck((s) => s.boosts);

  const freeLeft = aiFreeRemaining({ aiDate, aiFreeUsed });
  const unlimited = pro || ownerMode;

  return (
    <div className="mx-auto flex h-full max-w-3xl flex-col px-5 pt-6 md:px-8">
      {/* header */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/15">
            <Bot className="h-5 w-5 text-primary" />
          </span>
          <div>
            <h1 className="text-[15px] font-bold tracking-tight text-foreground">Mod AI</h1>
            <p className="text-[11px] text-muted-foreground">
              Ask anything, or have a mod built for you — tables, Lua and trainer logic.
            </p>
          </div>
        </div>
        {aiTab === "ask" ? (
          unlimited ? (
            <span className="inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-0.5 text-[11px] font-black text-primary">
              <Crown className="h-3 w-3 fill-primary" /> Unlimited — included with Pro
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full border border-lime-300/25 bg-lime-300/10 px-2.5 py-0.5 text-[11px] font-black text-lime-300">
              <Zap className="h-3 w-3 fill-lime-300" />
              {freeLeft > 0
                ? `${freeLeft} of ${AI_FREE_PER_DAY} free today`
                : `${AI_QUESTION_COST} Boost / question · ${boosts.toLocaleString()} left`}
            </span>
          )
        ) : (
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-black",
              unlimited
                ? "border border-primary/30 bg-primary/10 text-primary"
                : "border border-lime-300/25 bg-lime-300/10 text-lime-300"
            )}
          >
            {unlimited ? (
              <>
                <Crown className="h-3 w-3 fill-primary" /> Builds free with Pro
              </>
            ) : (
              <>
                <Zap className="h-3 w-3 fill-lime-300" /> Builds 100–500 ⚡ · {boosts.toLocaleString()} left
              </>
            )}
          </span>
        )}
      </div>

      {/* ask / build tabs */}
      <div className="mt-4 grid shrink-0 grid-cols-2 gap-1 rounded-xl border border-white/8 bg-white/[0.03] p-1">
        {(
          [
            { id: "ask", label: "Ask Mod AI", icon: Bot },
            { id: "build", label: "Build a mod", icon: Hammer },
          ] as const
        ).map((t) => (
          <button
            key={t.id}
            onClick={() => setAiTab(t.id)}
            aria-pressed={aiTab === t.id}
            className={cn(
              "flex h-9 items-center justify-center gap-1.5 rounded-lg text-[12px] font-black transition-colors",
              aiTab === t.id
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <t.icon className="h-3.5 w-3.5" />
            {t.label}
          </button>
        ))}
      </div>

      {aiTab === "ask" ? <AskPane /> : <BuildPane />}
    </div>
  );
}

