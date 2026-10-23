"use client";

import { useEffect, useState } from "react";
import { Check, Loader2, ShieldCheck, Zap } from "lucide-react";
import Image from "next/image";
import { coverOf, type Game } from "@/data/games";
import { useModDeck } from "@/lib/moddeck-store";
import { cn } from "@/lib/utils";

const STEPS = ["Locating game installation", "Verifying game version", "Injecting ModDeck trainer", "Attached successfully"];

export function LaunchOverlay({ game }: { game: Game }) {
  const { finishLaunch } = useModDeck();
  const pro = useModDeck((s) => s.pro);
  const [step, setStep] = useState(0);

  /* Priority Injection — Pro members skip the queue and attach twice as fast */
  const speed = pro ? 280 : 600;

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    STEPS.forEach((_, i) => {
      timers.push(setTimeout(() => setStep(i + 1), speed * (i + 1)));
    });
    timers.push(setTimeout(() => finishLaunch(), speed * STEPS.length + 500));
    return () => timers.forEach(clearTimeout);
  }, [finishLaunch, game.id, speed]);

  return (
    <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/80 backdrop-blur-md">
      <div
        className="glow-cyan-lg relative flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl"
        style={{ background: `linear-gradient(135deg, ${game.gradient[0]}, ${game.gradient[1]})` }}
      >
        {game.cover && (
          <Image src={coverOf(game)!} alt="" fill sizes="64px" className="object-cover" />
        )}
        <game.icon className="relative h-8 w-8 text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.8)]" />
      </div>
      <p className="mt-4 text-sm font-bold text-foreground">Preparing {game.title}</p>
      {pro && (
        <p className="mt-1 flex items-center gap-1 rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-[9px] font-black tracking-widest text-primary">
          <Zap className="h-2.5 w-2.5 fill-current" /> PRIORITY INJECTION
        </p>
      )}

      <div className="mt-5 w-64 space-y-2.5">
        {STEPS.map((label, i) => {
          const done = step > i;
          const active = step === i;
          return (
            <div key={label} className="flex items-center gap-2.5 text-xs">
              {done ? (
                <Check className="h-3.5 w-3.5 text-success" strokeWidth={3} />
              ) : active ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
              ) : (
                <div className="h-3.5 w-3.5 rounded-full border border-white/15" />
              )}
              <span className={cn(done ? "text-muted-foreground line-through" : active ? "font-semibold text-foreground" : "text-muted-foreground/60")}>
                {label}
              </span>
            </div>
          );
        })}
      </div>

      <div className="mt-5 h-1 w-64 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-primary transition-all duration-500 ease-out"
          style={{ width: `${Math.min((step / STEPS.length) * 100, 100)}%` }}
        />
      </div>
      <p className="mt-3 flex items-center gap-1 text-[10px] text-muted-foreground">
        <ShieldCheck className="h-3 w-3 text-success" /> Single-player only — anti-cheat safe
        {pro && <span className="text-primary">· Pro speed</span>}
      </p>
    </div>
  );
}
