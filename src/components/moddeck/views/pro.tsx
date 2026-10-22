"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Check,
  Crown,
  FolderDown,
  Gauge,
  Infinity as InfinityIcon,
  Layers,
  Palette,
  Rocket,
  Shield,
  ShieldOff,
  SlidersHorizontal,
  Smartphone,
  TrendingUp,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProDialog } from "@/components/moddeck/pro-dialog";
import { useCurrency } from "@/lib/currency";
import { GAMES, TOTAL_TRAINERS, coverOf } from "@/data/games";
import { useModDeck } from "@/lib/moddeck-store";
import { cn } from "@/lib/utils";

const FEATURES = [
  {
    icon: InfinityIcon,
    title: "No Mod Time Limits",
    desc: "The 5-hour daily limit? Gone. Pro members customize as long as they want — every day, every game.",
    green: true,
  },
  {
    icon: Layers,
    title: "All Cheats Unlocked",
    desc: `Every PRO-marked cheat on all ${TOTAL_TRAINERS} trainers — money multipliers, free purchasing, XP boosters — live from day one.`,
    green: false,
  },
  {
    icon: Gauge,
    title: "Priority Injection",
    desc: "Skip the queue. Pro trainers attach to your game twice as fast with a dedicated injection lane.",
    green: false,
  },
  {
    icon: FolderDown,
    title: "Unlimited Cloud Profiles",
    desc: "Save your whole setup — toggles, sliders, typed values — as a named preset, synced across devices. Free members get 3 per game.",
    green: false,
  },
  {
    icon: SlidersHorizontal,
    title: "Precision Mods",
    desc: "Type the exact amount you want — funds up to $1 trillion, decimals included. Sliders become scalpel-sharp.",
    green: false,
    slider: true,
  },
  {
    icon: Palette,
    title: "Custom Accent Themes",
    desc: "Recolor the entire app — cyan, lime, violet, rose and more. Your ModDeck, your signature color.",
    green: false,
    swatches: true,
  },
  {
    icon: Rocket,
    title: "Boost Games",
    desc: "PRO users can Boost games, which directly influences our roadmap.",
    green: false,
    covers: true,
  },
  {
    icon: TrendingUp,
    title: "2× Boost Earning",
    desc: "Every vote, crate and referral pays double. Stack Boost twice as fast and pull the next trainer forward.",
    green: false,
  },
  {
    icon: Smartphone,
    title: "Remote Mobile App",
    desc: "Manage your mods, browse maps, and ask the intelligent Game Guide with just a tap.",
    green: false,
  },
];

const PLANS = [
  {
    id: "free" as const,
    name: "Free",
    usd: 0,
    period: "",
    blurb: "Everything you need to try mods",
    cta: "Current plan",
    features: [
      [true, `All ${TOTAL_TRAINERS} trainers`],
      [true, "Basic cheats (toggles & actions)"],
      [true, "5 hours of customization per day"],
      [true, "3 cheat profiles per game"],
      [true, "Earn Boost by voting & watching ads"],
      [false, "No mod time limits"],
      [false, "Pro-exclusive cheats"],
      [false, "Unlimited cloud-synced profiles"],
      [false, "Priority injection — 2× attach speed"],
      [false, "Custom accent themes"],
      [false, "2× Boost earning"],
      [false, "Precision typed editing to $1T"],
    ],
  },
  {
    id: "monthly" as const,
    name: "Pro — Monthly",
    usd: 9.99,
    period: "/month",
    blurb: "Unlimited customization, cancel anytime",
    cta: "Upgrade to Pro",
    highlight: true,
    features: [
      [true, "No mod time limits — mod all day"],
      [true, "All Pro-exclusive cheats unlocked"],
      [true, "Unlimited cloud-synced cheat profiles"],
      [true, "Priority injection — attach 2× faster"],
      [true, "Custom accent themes"],
      [true, "Precision typed editing to $1 trillion"],
      [true, "100% ad-free"],
      [true, "Priority trainer updates"],
    ],
  },
  {
    id: "yearly" as const,
    name: "Pro — Yearly",
    usd: 75.99,
    period: "/year",
    blurb: "Save 37% vs monthly — billed once a year",
    cta: "Get Yearly",
    features: [
      [true, "Everything in Pro Monthly"],
      [true, "Save 37% vs monthly"],
      [true, "2× Boost from every source"],
      [true, "Early access to new trainers"],
      [true, "Founder badge on Pulse"],
      [true, "Priority support"],
    ],
  },
];

export function ProView() {
  const { pro, plan } = useModDeck();
  const { fmt } = useCurrency();
  const [checkout, setCheckout] = useState(false);

  return (
    <div className="mx-auto max-w-5xl px-5 pb-10 md:px-8">
      {/* ---- space hero (Wand Pro style) ---- */}
      <div
        className="relative mt-6 overflow-hidden rounded-2xl border border-white/8 px-6 py-14 text-center"
        style={{
          background:
            "radial-gradient(140% 100% at 50% 0%, #17181f 0%, #0a0b0d 60%), radial-gradient(60% 45% at 78% 22%, rgba(255,230,0,0.10), transparent 70%)",
        }}
      >
        <div className="cover-pattern absolute inset-0 opacity-20" />
        <Rocket className="anim-float absolute top-8 left-8 h-10 w-10 text-white/10" />
        <Smartphone className="anim-float absolute right-8 bottom-8 h-10 w-10 text-white/10" style={{ animationDelay: "0.8s" }} />
        <div className="relative">
          <p className="text-sm font-black tracking-[0.2em] text-primary">
            MOD<span className="text-foreground">DECK</span> PRO
          </p>
          <h1 className="mx-auto mt-3 max-w-2xl text-3xl leading-tight font-black tracking-tight text-white uppercase md:text-5xl">
            Make gaming even more magical
          </h1>
          <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-muted-foreground">
            Ready to experience everything ModDeck has to offer? Upgrade to Pro and unlock the advanced
            features you&apos;ve been waiting for.
          </p>
          <Button
            onClick={() => setCheckout(true)}
            className="mt-6 h-11 gap-2 rounded-full bg-white px-8 font-black text-black hover:bg-white/90"
          >
            Start now <Zap className="h-4 w-4 fill-current" />
          </Button>
          <p className="mt-3 text-[11px] text-muted-foreground">
            Plans start at only {fmt(6.33)}/month, billed annually ({fmt(75.99)}/year). Cancel at any time.
          </p>
        </div>
      </div>

      {/* ---- nine feature cards ---- */}
      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((f) => (
          <div
            key={f.title}
            className={cn(
              "card-hover flex flex-col rounded-2xl border p-5",
              f.green ? "border-lime-300/40 bg-lime-300 text-black" : "border-white/8 bg-panel/70"
            )}
          >
            <div className="flex items-center justify-between">
              <p className={cn("text-sm font-black", f.green ? "text-black" : "text-foreground")}>{f.title}</p>
              {!f.green && <f.icon className="h-5 w-5 text-muted-foreground" />}
            </div>
            <p className={cn("mt-1.5 flex-1 text-xs leading-relaxed", f.green ? "text-black/75" : "text-muted-foreground")}>
              {f.desc}
            </p>

            {/* No Mod Time Limits — limit removed visual */}
            {f.green && (
              <div className="mt-4 space-y-1.5 rounded-xl bg-black/20 px-3.5 py-2.5">
                <div className="flex items-center justify-between text-[11px] font-bold">
                  <span className="flex items-center gap-1.5 text-black/50 line-through">
                    <ShieldOff className="h-3.5 w-3.5" /> 5H / DAY LIMIT
                  </span>
                  <span className="flex items-center gap-1 text-black">
                    <InfinityIcon className="h-4 w-4" strokeWidth={3} /> UNLIMITED
                  </span>
                </div>
                <div className="relative h-1.5 overflow-hidden rounded-full bg-black/30">
                  <div className="h-full w-full rounded-full bg-black/80" />
                </div>
              </div>
            )}

            {/* Precision Mods — mini slider visual */}
            {f.slider && (
              <div className="mt-4 flex items-center gap-3 rounded-xl border border-white/8 bg-background/60 px-3.5 py-2.5">
                <span className="text-[11px] font-bold text-foreground">Set Funds</span>
                <div className="relative h-1.5 flex-1 rounded-full bg-white/10">
                  <div className="h-full w-[86%] rounded-full bg-primary" />
                  <span className="absolute top-1/2 left-[86%] h-3.5 w-3.5 -translate-y-1/2 rounded-full bg-primary shadow" />
                </div>
                <span className="font-mono text-[11px] font-bold text-primary">$1.00T</span>
              </div>
            )}

            {/* Custom Accent Themes — live swatch row */}
            {f.swatches && (
              <div className="mt-4 flex items-center gap-2 rounded-xl border border-white/8 bg-background/60 px-3.5 py-2.5">
                {["#ffe600", "#00c8ff", "#a3e635", "#a78bfa", "#fb7185", "#fb923c"].map((c, i) => (
                  <span
                    key={c}
                    className={cn(
                      "h-5 w-5 rounded-full border-2",
                      i === 1 ? "scale-110 border-white" : "border-transparent"
                    )}
                    style={{ background: c }}
                  />
                ))}
                <span className="ml-auto text-[10px] font-bold text-muted-foreground">6 themes</span>
              </div>
            )}

            {/* Boost Games — real cover visual */}
            {f.covers && (
              <div className="mt-4 flex gap-1.5">
                {[3, 7, 11].map((idx) => {
                  const g = GAMES[idx % GAMES.length];
                  return (
                    <span key={idx} className="relative h-12 flex-1 overflow-hidden rounded-md border border-white/10" style={{ background: `linear-gradient(135deg, ${g.gradient[0]}, ${g.gradient[1]})` }}>
                      {g.cover && <Image src={coverOf(g)!} alt="" fill sizes="140px" className="object-cover" />}
                    </span>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* ---- pricing ---- */}
      <div className="mt-10 text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[11px] font-black text-primary">
          <Crown className="h-3.5 w-3.5 fill-primary" /> PLANS
        </span>
        <h2 className="mt-3 text-2xl font-black tracking-tight text-foreground">
          {pro ? "You're rocking Pro" : "Pick your plan"}
        </h2>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {PLANS.map((p) => {
          const current = (pro && p.id === plan) || (!pro && p.id === "free");
          return (
            <div
              key={p.id}
              className={cn(
                "relative flex flex-col rounded-2xl border p-5",
                p.highlight ? "glow-cyan border-primary/50 bg-gradient-to-b from-primary/10 to-panel" : "border-white/8 bg-panel/60"
              )}
            >
              {p.highlight && (
                <span className="absolute -top-2.5 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-full bg-primary px-2.5 py-0.5 text-[10px] font-black text-primary-foreground">
                  <Zap className="h-2.5 w-2.5 fill-current" /> MOST POPULAR
                </span>
              )}
              <p className="text-sm font-black text-foreground">{p.name}</p>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-3xl font-black tracking-tight text-foreground">
                  {p.usd === 0 ? "Free" : fmt(p.usd)}
                </span>
                <span className="text-xs text-muted-foreground">{p.period}</span>
              </div>
              <p className="mt-1.5 text-xs text-muted-foreground">{p.blurb}</p>

              <div className="mt-4 flex-1 space-y-2.5">
                {p.features.map(([has, label], i) => (
                  <div key={i} className="flex items-start gap-2">
                    {has ? (
                      <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-success" strokeWidth={3} />
                    ) : (
                      <Shield className="mt-0.5 h-3.5 w-3.5 shrink-0 text-white/20" />
                    )}
                    <span className={cn("text-xs", has ? "text-foreground/85" : "text-muted-foreground/50 line-through")}>
                      {label}
                    </span>
                  </div>
                ))}
              </div>

              <Button
                className={cn(
                  "mt-5 h-10 w-full font-black",
                  p.highlight
                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                    : "bg-white/8 text-foreground hover:bg-white/12"
                )}
                disabled={current || (pro && p.id !== "free")}
                onClick={() => !pro && p.id !== "free" && setCheckout(true)}
              >
                {current ? "Current plan" : pro ? "Already Pro" : p.cta}
              </Button>
            </div>
          );
        })}
      </div>

      <div className="mt-8 flex items-start gap-3 rounded-xl border border-white/8 bg-panel/60 p-4">
        <Zap className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
        <p className="text-xs leading-relaxed text-muted-foreground">
          <b className="text-foreground">Fair-use promise:</b> ModDeck trainers are for single-player and co-op
          games only and never touch anti-cheat protected multiplayer. Checkout takes cards, PayPal, Apple Pay and
          Google Pay, Pro activates instantly, and cancelling is self-serve in Settings — confirmed by an automated
          email from no-reply@moddeck.app.
        </p>
      </div>

      <ProDialog open={checkout} onOpenChange={setCheckout} />
    </div>
  );
}
