"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Check, Crown, Keyboard, MousePointerClick, Play, Zap } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { ProDialog } from "@/components/moddeck/pro-dialog";
import type { CheatCategoryDef, CheatDef, Game } from "@/data/games";
import { fmtCompact, fmtFull, fmtMoney, fmtNum } from "@/lib/format";
import { isOverLimit, useModDeck } from "@/lib/moddeck-store";
import { blip } from "@/lib/sound";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

function HotkeyChip({ hotkey }: { hotkey: string }) {
  return (
    <span className="hidden items-center gap-0.5 sm:inline-flex" title={`Hotkey: ${hotkey}`}>
      {hotkey.split("+").map((k, i) => (
        <kbd
          key={i}
          className="rounded border border-white/15 bg-white/5 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-foreground/75 shadow-[0_1px_0_rgba(255,255,255,0.06)_inset]"
        >
          {k}
        </kbd>
      ))}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Typed value input — click the readout, type the exact amount you    */
/* want (decimals supported), Enter/blur commits, Escape cancels.      */
/* ------------------------------------------------------------------ */
function SliderValueInput({
  value,
  min,
  max,
  decimals,
  unit,
  label,
  locked,
  active,
  onCommit,
}: {
  value: number;
  min: number;
  max: number;
  decimals: number;
  unit: string;
  label: string;
  locked: boolean;
  active: boolean;
  onCommit: (value: number, requested: number) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const isMoney = unit === "$";

  const startEditing = () => {
    if (locked) return;
    setDraft(decimals === 0 ? String(Math.round(value)) : String(Math.round(value * 100) / 100));
    setEditing(true);
  };

  /* digits + a single decimal point, capped to the allowed decimals */
  const sanitize = (raw: string) => {
    let cleaned = raw.replace(/[^0-9.]/g, "");
    const parts = cleaned.split(".");
    if (parts.length > 2) cleaned = `${parts[0]}.${parts.slice(1).join("")}`;
    const dot = cleaned.indexOf(".");
    if (dot !== -1) cleaned = cleaned.slice(0, dot + 1 + Math.max(decimals, 0));
    return cleaned.slice(0, 16);
  };

  const commit = () => {
    if (!editing) return;
    setEditing(false);
    const cleaned = draft.replace(/,/g, "").trim();
    const n = parseFloat(cleaned);
    if (cleaned === "" || Number.isNaN(n)) return; // empty/invalid -> revert
    const rounded =
      decimals === 0 ? Math.round(n) : Math.round(n * 10 ** decimals) / 10 ** decimals;
    const clamped = Math.min(max, Math.max(min, rounded));
    onCommit(clamped, n);
  };

  if (editing) {
    return (
      <input
        autoFocus
        value={draft}
        inputMode="decimal"
        spellCheck={false}
        aria-label={`${label} — type the exact amount`}
        onChange={(e) => setDraft(sanitize(e.target.value))}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            (e.target as HTMLInputElement).blur();
          }
          if (e.key === "Escape") setEditing(false);
        }}
        className={cn(
          "h-7 w-20 shrink-0 rounded-md border border-primary/60 bg-primary/10 px-1.5 text-right font-mono text-[11px] font-bold tabular-nums text-primary outline-none ring-1 ring-primary/40 sm:w-24"
        )}
      />
    );
  }

  return (
    <button
      type="button"
      onClick={startEditing}
      disabled={locked}
      aria-label={`${label} — click to type an exact value (max ${isMoney ? `$${fmtCompact(max, 0)}` : `${fmtNum(max)}${unit}`})`}
      title={
        isMoney
          ? `Click to type any amount up to $${fmtCompact(max, 0)} — decimals allowed`
          : `Click to type an exact value (${fmtNum(min)}–${fmtNum(max)}${unit})`
      }
      className={cn(
        "h-7 w-20 shrink-0 truncate rounded-md border px-1.5 text-right font-mono text-[11px] font-bold tabular-nums transition-colors sm:w-24",
        active
          ? "border-primary/40 bg-primary/10 text-primary"
          : "border-white/12 bg-white/5 text-foreground/85 hover:border-primary/50 hover:text-primary",
        locked && "cursor-pointer opacity-70"
      )}
    >
      {isMoney ? fmtMoney(value) : `${fmtNum(value)}${unit}`}
    </button>
  );
}

function CheatRow({ game, cheat }: { game: Game; cheat: CheatDef }) {
  const { cheatStates, sliderValues, toggleCheat, setSlider, fireAction, pro, settings } = useModDeck();
  const [lockOpen, setLockOpen] = useState(false);
  const [fired, setFired] = useState(false);

  const on = !!cheatStates[game.id]?.[cheat.id];
  const locked = !!cheat.pro && !pro;
  const sliderVal = sliderValues[game.id]?.[cheat.id] ?? cheat.slider?.default ?? 1;
  const decimals = cheat.slider?.decimals ?? (cheat.slider && cheat.slider.step < 1 ? 1 : 0);

  const withSound = () => {
    if (settings.hotkeySound) blip(on ? 520 : 880);
  };

  /* free users who hit the 5h daily cap can't customize anymore */
  const limitBlocked = () => {
    const s = useModDeck.getState();
    if (isOverLimit(s)) {
      s.flagLimit();
      return true;
    }
    return false;
  };

  /* push a precision value into the running game (raw dollars for money) */
  const applyEffect = (value: number) => {
    if (cheat.effect === "setmoney") {
      window.dispatchEvent(
        new CustomEvent("moddeck:set-money", { detail: { gameId: game.id, value } })
      );
    }
    if (cheat.effect === "setxp") {
      window.dispatchEvent(
        new CustomEvent("moddeck:set-level", { detail: { gameId: game.id, value } })
      );
    }
  };

  const handleToggle = () => {
    if (locked) {
      setLockOpen(true);
      return;
    }
    if (limitBlocked()) return;
    withSound();
    const next = toggleCheat(game.id, cheat);
    toast(`${cheat.name} — ${next ? "ON" : "OFF"}`, {
      description: next ? cheat.desc : "Cheat deactivated.",
    });
  };

  const handleAction = () => {
    if (locked) {
      setLockOpen(true);
      return;
    }
    if (limitBlocked()) return;
    withSound();
    fireAction(game.id, cheat);
    if (cheat.effect === "addmoney") {
      window.dispatchEvent(new CustomEvent<string>("moddeck:add-money", { detail: game.id }));
    }
    setFired(true);
    setTimeout(() => setFired(false), 900);
    toast(cheat.name, { description: `${cheat.desc} — applied instantly.` });
  };

  const handleSlider = (value: number) => {
    if (locked || limitBlocked()) return;
    setSlider(game.id, cheat, value);
    /* precision mods apply live to the running game */
    applyEffect(value);
  };

  /* typed input / preset chip committed an exact amount */
  const handleValueCommit = (value: number, requested: number) => {
    if (locked) {
      setLockOpen(true);
      return;
    }
    if (limitBlocked()) return;
    if (settings.hotkeySound) blip(760);
    setSlider(game.id, cheat, value);
    applyEffect(value);

    const max = cheat.slider?.max ?? Number.MAX_SAFE_INTEGER;
    const capped = requested > max || requested < (cheat.slider?.min ?? 0);
    if (cheat.effect === "setmoney") {
      toast("Funds set", { description: `Wallet set to ${fmtMoney(value)} — ${fmtFull(value)}` });
      if (requested > max) {
        toast.info("Number space caps at $1T", {
          description: "The money editor accepts up to one trillion dollars.",
        });
      }
      return;
    }
    if (capped) return; // clamped to slider bounds — the control already reflects it
    toast(cheat.name, { description: `Value set to ${fmtNum(value)}${cheat.slider?.unit ?? ""}` });
  };

  return (
    <>
      <motion.div
        layout
        className={cn(
          "flex items-center gap-3 rounded-xl border p-3.5 transition-colors",
          on && !locked
            ? "border-primary/35 bg-primary/[0.07] shadow-[0_0_18px_-8px_rgba(0,200,255,0.5)]"
            : "border-white/6 bg-panel hover:border-white/15",
          locked && "opacity-90"
        )}
      >
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className={cn("text-[13px] font-semibold", on && !locked ? "text-primary" : "text-foreground")}>
              {cheat.name}
            </p>
            {cheat.pro && (
              <span className="flex items-center gap-0.5 rounded bg-amber-400/15 px-1.5 py-0.5 text-[9px] font-bold tracking-wide text-amber-300">
                <Crown className="h-2.5 w-2.5 fill-amber-300" /> PRO
              </span>
            )}
            {cheat.hotkey && <HotkeyChip hotkey={cheat.hotkey} />}
          </div>
          <p className="mt-0.5 truncate text-[11px] text-muted-foreground">{cheat.desc}</p>
        </div>

        <div className="shrink-0" onClick={() => locked && setLockOpen(true)}>
          {cheat.type === "toggle" && (
            <Switch
              checked={on}
              onCheckedChange={handleToggle}
              disabled={locked}
              aria-label={`${cheat.name} — ${on ? "on" : "off"}`}
              className={cn("data-[state=checked]:bg-primary", locked && "cursor-pointer opacity-70")}
            />
          )}

          {cheat.type === "slider" && cheat.slider && (
            <div className="flex w-44 flex-col gap-1.5 sm:w-64">
              <div className="flex items-center gap-2">
                <Slider
                  value={[sliderVal]}
                  min={cheat.slider.min}
                  max={cheat.slider.max}
                  step={cheat.slider.step}
                  disabled={locked}
                  onValueChange={(v) => handleSlider(v[0])}
                  aria-label={cheat.name}
                  className={cn("min-w-0 flex-1", locked && "pointer-events-none opacity-70")}
                />
                <SliderValueInput
                  value={sliderVal}
                  min={cheat.slider.min}
                  max={cheat.slider.max}
                  decimals={decimals}
                  unit={cheat.slider.unit}
                  label={cheat.name}
                  locked={locked}
                  active={on && !locked}
                  onCommit={handleValueCommit}
                />
              </div>
              {cheat.slider.presets && (
                <div className={cn("flex flex-wrap justify-end gap-1", locked && "opacity-50")}>
                  {cheat.slider.presets.map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => handleValueCommit(p, p)}
                      title={`Set ${fmtFull(p)}`}
                      className="rounded border border-white/10 bg-white/5 px-1.5 py-0.5 font-mono text-[9px] font-bold text-foreground/70 transition-colors hover:border-primary/50 hover:text-primary"
                    >
                      {cheat.slider!.unit === "$" ? `$${fmtCompact(p, 0)}` : `${fmtNum(p)}${cheat.slider!.unit}`}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {cheat.type === "action" && (
            <button
              onClick={handleAction}
              className={cn(
                "flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-[11px] font-bold transition-all active:scale-95",
                fired
                  ? "border-success/50 bg-success/15 text-success"
                  : "border-white/12 bg-white/5 text-foreground hover:border-primary/50 hover:text-primary"
              )}
              aria-label={cheat.name}
            >
              {fired ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : <Zap className="h-3.5 w-3.5" />}
              {fired ? "Applied" : "Activate"}
            </button>
          )}
        </div>
      </motion.div>

      <ProDialog open={lockOpen} onOpenChange={setLockOpen} />
    </>
  );
}

export function CheatList({ game }: { game: Game }) {
  const cheatStates = useModDeck((s) => s.cheatStates);
  const states = cheatStates[game.id] ?? {};
  return (
    <div className="space-y-5">
      {game.categories.map((cat: CheatCategoryDef) => {
        const activeCount = cat.cheats.filter((c) => states[c.id]).length;
        const Icon = cat.icon;
        return (
          <section key={cat.id}>
            <div className="mb-2.5 flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/10 text-primary">
                <Icon className="h-3.5 w-3.5" />
              </div>
              <h3 className="text-[13px] font-bold tracking-wide text-foreground uppercase">{cat.name}</h3>
              <span className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                {activeCount}/{cat.cheats.length} active
              </span>
              <div className="h-px flex-1 bg-white/5" />
            </div>
            <div className="space-y-2">
              {cat.cheats.map((cheat) => (
                <CheatRow key={cheat.id} game={game} cheat={cheat} />
              ))}
            </div>
          </section>
        );
      })}

      <div className="flex items-center justify-center gap-4 pt-1 text-[10px] text-muted-foreground">
        <span className="flex items-center gap-1">
          <Keyboard className="h-3 w-3" /> Hotkeys work while this page is open
        </span>
        <span className="flex items-center gap-1">
          <MousePointerClick className="h-3 w-3" /> Space attacks in the simulator
        </span>
        <span className="hidden items-center gap-1 sm:flex">
          <Play className="h-3 w-3" /> Launch the game to see effects live
        </span>
      </div>
    </div>
  );
}
