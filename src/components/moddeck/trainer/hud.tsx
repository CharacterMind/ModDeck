"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowUp,
  Coins,
  Crosshair,
  Gauge,
  Heart,
  Play,
  Shield,
  Snowflake,
  Sparkles,
  Swords,
  Timer,
  TrendingUp,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { LaunchOverlay } from "@/components/moddeck/trainer/launch-overlay";
import type { Effect, Game } from "@/data/games";
import { fmtFull, fmtMoney } from "@/lib/format";
import { formatUsage, isOverLimit, dailyCapMinutes, timePurchaseOutcome, BOOST_HOUR_COST, useModDeck } from "@/lib/moddeck-store";
import { cn } from "@/lib/utils";

interface FeedMsg {
  id: number;
  text: string;
  tone: "kill" | "level" | "info";
}

interface Floater {
  id: number;
  text: string;
}

/* deterministic scene props */
const STARS = Array.from({ length: 14 }, (_, i) => ({
  left: `${(i * 67) % 96 + 2}%`,
  top: `${(i * 37) % 45 + 4}%`,
  delay: `${(i % 5) * 0.6}s`,
  size: i % 3 === 0 ? 3 : 2,
}));
const BUILDINGS = [
  { x: "2%", w: 42, h: 96 }, { x: "9%", w: 30, h: 64 }, { x: "16%", w: 52, h: 120 },
  { x: "26%", w: 36, h: 78 }, { x: "55%", w: 44, h: 104 }, { x: "63%", w: 30, h: 70 },
  { x: "70%", w: 56, h: 128 }, { x: "80%", w: 34, h: 88 }, { x: "88%", w: 40, h: 110 },
];

export function GameHud({ game }: { game: Game }) {
  const {
    runningGameId,
    launchingGameId,
    launchGame,
    cheatStates,
    sliderValues,
    navigate,
    tickUsage,
    spendBoosts,
    grantTimeMinutes,
    boosts,
    bonusMinutes,
    usageDate,
    limitMinutes,
  } = useModDeck();

  const overLimit = useModDeck((s) => isOverLimit(s));

  /* +1h quick-buy respects the 5h daily Boost cap — the label says exactly what it adds */
  const todayBonus = usageDate === new Date().toDateString() ? bonusMinutes : 0;
  const hourOutcome = timePurchaseOutcome(todayBonus, 60);

  const running = runningGameId === game.id;
  const launching = launchingGameId === game.id;

  /* effect-based cheat detection — works for every game's cheat ids */
  const allCheats = game.categories.flatMap((c) => c.cheats);
  const states = cheatStates[game.id] ?? {};
  const activeIds = new Set(Object.keys(states).filter((id) => states[id]));
  const activeEffects = new Set(
    allCheats.filter((c) => activeIds.has(c.id) && c.effect).map((c) => c.effect as Effect)
  );
  const god = activeEffects.has("god");
  const infHealth = activeEffects.has("infhealth");
  const oneHit = activeEffects.has("onehit");
  const infMoney = activeEffects.has("infmoney");
  const infAmmo = activeEffects.has("infammo");
  const frozen = activeEffects.has("freeze");
  const jump = activeEffects.has("jump");

  /* slider values are live (no toggle needed), resolved by effect */
  const sv = sliderValues[game.id] ?? {};
  const sliderOf = (effect: Effect) => {
    const cheat = allCheats.find((c) => c.effect === effect);
    return cheat ? (sv[cheat.id] ?? cheat.slider?.default ?? 1) : 1;
  };
  const speed = sliderOf("speed");
  const xpMult = sliderOf("xp");
  const moneyMult = sliderOf("moneyx");

  /* ------- simulation state ------- */
  const [hp, setHp] = useState(100);
  const [enemyHp, setEnemyHp] = useState(100);
  const [money, setMoney] = useState(4250);
  const [ammo, setAmmo] = useState(96);
  const [xp, setXp] = useState(0);
  const [level, setLevel] = useState(1);
  const [feed, setFeed] = useState<FeedMsg[]>([]);
  const [floaters, setFloaters] = useState<Floater[]>([]);
  const [hitFlash, setHitFlash] = useState(false);
  const [enemyDead, setEnemyDead] = useState(false);

  const tickRef = useRef(0);
  const seqRef = useRef(0);
  const respawnAtRef = useRef(0);
  const xpRef = useRef(0);
  const enemyHpRef = useRef(100);
  const enemyDeadRef = useRef(false);

  const pushFeed = useCallback((text: string, tone: FeedMsg["tone"] = "info") => {
    const id = seqRef.current++;
    setFeed((f) => [...f.slice(-2), { id, text, tone }]);
    setTimeout(() => setFeed((f) => f.filter((m) => m.id !== id)), 2600);
  }, []);

  const pushFloater = useCallback((text: string) => {
    const id = seqRef.current++;
    setFloaters((f) => [...f.slice(-4), { id, text }]);
    setTimeout(() => setFloaters((f) => f.filter((m) => m.id !== id)), 1100);
  }, []);

  /* ------- main sim loop (paused when the daily limit is hit) ------- */
  useEffect(() => {
    if (!running || overLimit) return;
    const iv = setInterval(() => {
      tickRef.current++;
      const t = tickRef.current;

      if (!frozen && t % 14 === 0 && !god) {
        setHp((h) => Math.max(0, h - (3 + Math.random() * 5)));
        setHitFlash(true);
        setTimeout(() => setHitFlash(false), 170);
      }
      if (god) setHp(100);
      else if (infHealth) setHp((h) => Math.min(100, h + 5));

      if (infMoney) {
        const gain = (60 + Math.random() * 240) * moneyMult;
        setMoney((m) => m + gain);
      }

      xpRef.current += 0.8 * xpMult;
      if (xpRef.current >= 100) {
        xpRef.current -= 100;
        setLevel((l) => l + 1);
        pushFeed("LEVEL UP", "level");
      }
      setXp(xpRef.current);

      /* enemy death + respawn handled here to avoid cascading effects */
      if (enemyDeadRef.current && Date.now() > respawnAtRef.current) {
        enemyDeadRef.current = false;
        enemyHpRef.current = 100;
        setEnemyDead(false);
        setEnemyHp(100);
        pushFeed("New enemy appeared", "info");
      }
      if (!enemyDeadRef.current && enemyHpRef.current <= 0) {
        enemyDeadRef.current = true;
        respawnAtRef.current = Date.now() + 1500;
        setEnemyDead(true);
        pushFeed(oneHit ? "ONE-HIT KILL" : "Enemy eliminated", "kill");
        xpRef.current = Math.min(99.9, xpRef.current + 25 * xpMult);
        setXp(xpRef.current);
        pushFloater("+25 XP");
      }
    }, 120);
    return () => clearInterval(iv);
  }, [running, overLimit, god, infHealth, infMoney, frozen, xpMult, oneHit, moneyMult, pushFeed, pushFloater]);

  /* ------- daily usage ticking (free users only, capped in store) ------- */
  useEffect(() => {
    if (!running) return;
    const iv = setInterval(() => tickUsage(), 1000);
    return () => clearInterval(iv);
  }, [running, tickUsage]);

  /* ------- add-money action bridge (event based, no effect cascades) ------- */
  useEffect(() => {
    const onAddMoney = (e: Event) => {
      const detail = (e as CustomEvent<string>).detail;
      if (detail !== game.id) return;
      setMoney((m) => m + 10000);
      pushFloater("+$10,000");
      pushFeed("$10,000 added to wallet", "info");
    };
    window.addEventListener("moddeck:add-money", onAddMoney);
    return () => window.removeEventListener("moddeck:add-money", onAddMoney);
  }, [game.id, pushFeed, pushFloater]);

  /* ------- precision edits: Set Funds / Set Level sliders (live) ------- */
  useEffect(() => {
    const onSetMoney = (e: Event) => {
      const d = (e as CustomEvent<{ gameId: string; value: number }>).detail;
      if (d.gameId !== game.id) return;
      setMoney(Math.max(0, d.value));
      pushFloater(fmtMoney(d.value));
      pushFeed(`Funds set → ${fmtMoney(d.value)}`, "info");
    };
    const onSetLevel = (e: Event) => {
      const d = (e as CustomEvent<{ gameId: string; value: number }>).detail;
      if (d.gameId !== game.id) return;
      setLevel(Math.max(1, Math.round(d.value)));
      xpRef.current = 0;
      setXp(0);
      pushFeed(`LEVEL SET → ${Math.round(d.value)}`, "level");
    };
    window.addEventListener("moddeck:set-money", onSetMoney);
    window.addEventListener("moddeck:set-level", onSetLevel);
    return () => {
      window.removeEventListener("moddeck:set-money", onSetMoney);
      window.removeEventListener("moddeck:set-level", onSetLevel);
    };
  }, [game.id, pushFeed, pushFloater]);

  /* ------- attack ------- */
  const attack = useCallback(() => {
    if (!running || enemyDeadRef.current) return;
    if (oneHit) {
      enemyHpRef.current = 0;
      setEnemyHp(0);
    } else {
      if (!infAmmo) setAmmo((a) => Math.max(0, a - 3));
      const dmg = 10 + Math.random() * 14;
      enemyHpRef.current = Math.max(0, enemyHpRef.current - dmg);
      setEnemyHp(enemyHpRef.current);
    }
  }, [running, oneHit, infAmmo]);

  /* space to attack */
  useEffect(() => {
    if (!running) return;
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || tag === "BUTTON") return;
      if (e.code === "Space") {
        e.preventDefault();
        attack();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [running, attack]);

  const hpColor = hp > 50 ? "bg-emerald-400" : hp > 25 ? "bg-amber-400" : "bg-red-400";
  const moneyStr = fmtMoney(money);
  const moneyFull = fmtFull(Math.floor(money));

  /* active cheat chips — generic, derived from this game's own cheat defs */
  const chipPalette = [
    "text-amber-300 border-amber-400/40 bg-amber-400/10",
    "text-rose-300 border-rose-400/40 bg-rose-400/10",
    "text-emerald-300 border-emerald-400/40 bg-emerald-400/10",
    "text-cyan-300 border-cyan-400/40 bg-cyan-400/10",
    "text-violet-300 border-violet-400/40 bg-violet-400/10",
    "text-lime-300 border-lime-400/40 bg-lime-400/10",
    "text-orange-300 border-orange-400/40 bg-orange-400/10",
    "text-fuchsia-300 border-fuchsia-400/40 bg-fuchsia-400/10",
  ];
  const chipIconFor = (effect?: Effect) => {
    switch (effect) {
      case "god": return Shield;
      case "infhealth": return Heart;
      case "onehit": return Zap;
      case "infmoney":
      case "moneyx":
      case "setmoney": return Coins;
      case "infammo": return Crosshair;
      case "freeze": return Snowflake;
      case "jump": return ArrowUp;
      case "speed": return Gauge;
      case "xp":
      case "setxp": return TrendingUp;
      default: return Sparkles;
    }
  };
  const activeChips: { icon: typeof Shield; label: string; color: string }[] = [
    ...allCheats.filter((c) => activeIds.has(c.id)).map((c) => ({ label: c.name, icon: chipIconFor(c.effect) })),
    ...(speed > 1 ? [{ label: `${speed}x Speed`, icon: Gauge }] : []),
    ...(xpMult > 1 ? [{ label: `${xpMult}x XP`, icon: TrendingUp }] : []),
    ...(moneyMult > 1 ? [{ label: `${moneyMult}x Money`, icon: Coins }] : []),
  ]
    .slice(0, 8)
    .map((c, i) => ({ ...c, color: chipPalette[i % chipPalette.length] }));

  return (
    <div
      className={cn(
        "scanlines vignette relative aspect-video w-full overflow-hidden rounded-2xl border border-white/10",
        !running && "border-white/5"
      )}
      style={{ background: `linear-gradient(180deg, ${game.scene.sky[0]} 0%, ${game.scene.sky[1]} 100%)` }}
      role="img"
      aria-label={`${game.title} live simulation`}
    >
      {/* stars / particles */}
      {STARS.map((s, i) => (
        <div
          key={i}
          className="anim-float absolute rounded-full bg-white/70"
          style={{ left: s.left, top: s.top, width: s.size, height: s.size, animationDelay: s.delay, opacity: 0.5 }}
        />
      ))}

      {/* skyline */}
      <div className="absolute bottom-[20%] left-0 right-0 h-[40%]">
        {BUILDINGS.map((b, i) => (
          <div
            key={i}
            className="absolute bottom-0 rounded-t-sm"
            style={{ left: b.x, width: b.w, height: b.h, background: "rgba(0,0,0,0.35)" }}
          >
            <div className="mt-2 grid grid-cols-3 gap-1 px-1.5 opacity-50">
              {Array.from({ length: Math.max(3, Math.floor(b.h / 22) * 3) }).map((_, w) => (
                <div key={w} className="h-1.5 rounded-[1px] bg-white/25" />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* ground */}
      <div className="absolute bottom-0 left-0 right-0 h-[20%] border-t-2 border-white/10" style={{ background: game.scene.ground }}>
        <div className="absolute top-1/2 left-0 right-0 h-px bg-white/8" />
        <div className="absolute top-0 left-[12%] h-1 w-16 rounded-full bg-white/10" />
        <div className="absolute top-0 right-[14%] h-1 w-16 rounded-full bg-white/10" />
      </div>

      {/* speed lines */}
      {speed > 1 && running && (
        <>
          <div className="anim-shimmer absolute top-[38%] left-0 h-0.5 w-full bg-gradient-to-r from-transparent via-white/50 to-transparent" style={{ animationDuration: `${1.2 / speed}s` }} />
          <div className="anim-shimmer absolute top-[46%] left-0 h-0.5 w-full bg-gradient-to-r from-transparent via-white/35 to-transparent" style={{ animationDuration: `${0.9 / speed}s` }} />
        </>
      )}

      {/* damage flash */}
      {hitFlash && <div className="absolute inset-0 bg-red-500/25 transition-opacity" />}

      {/* player */}
      <div className={cn("absolute transition-all duration-500", jump ? "bottom-[34%]" : "bottom-[21%]", "left-[16%]")}>
        <div className="mb-1.5 w-20">
          <div className="h-1.5 overflow-hidden rounded-full bg-black/60">
            <div className={cn("h-full rounded-full transition-all duration-200", hpColor)} style={{ width: `${hp}%` }} />
          </div>
        </div>
        <div
          className={cn(
            "anim-bob flex h-14 w-14 items-center justify-center rounded-full border-2 shadow-[0_0_24px_rgba(0,200,255,0.5)]",
            speed > 1 ? "border-lime-300/80" : "border-white/70"
          )}
          style={{
            background: `radial-gradient(circle at 35% 30%, ${game.scene.accent}, rgba(0,0,0,0.6))`,
            animationDuration: `${1.6 / Math.max(speed, 0.4)}s`,
          }}
        >
          <game.scene.hero className="h-7 w-7 text-white drop-shadow" />
        </div>
        <p className="mt-1 text-center text-[9px] font-bold tracking-widest text-white/80">PLAYER</p>
      </div>

      {/* enemy */}
      <div className="absolute bottom-[21%] right-[16%]">
        <div className="mb-1.5 w-20">
          <div className="h-1.5 overflow-hidden rounded-full bg-black/60">
            <div
              className={cn("h-full rounded-full bg-red-400 transition-all duration-200", enemyDead && "opacity-0")}
              style={{ width: `${enemyHp}%` }}
            />
          </div>
        </div>
        {enemyDead ? (
          <div className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-white/20 bg-black/40 opacity-50">
            <span className="text-[9px] font-bold tracking-widest text-white/60">DOWN</span>
          </div>
        ) : (
          <div
            className={cn(
              "anim-bob flex h-14 w-14 items-center justify-center rounded-full border-2 border-red-400/70 shadow-[0_0_24px_rgba(239,68,68,0.45)]",
              frozen && "anim-blink opacity-70"
            )}
            style={{ background: "radial-gradient(circle at 35% 30%, #7f1d1d, rgba(0,0,0,0.7))", animationDuration: `${1.6 / Math.max(speed, 0.4)}s` }}
          >
            <game.scene.enemy className={cn("h-7 w-7 text-red-200 drop-shadow", frozen && "text-sky-200")} />
          </div>
        )}
        <p className="mt-1 text-center text-[9px] font-bold tracking-widest text-white/80">
          {frozen && !enemyDead ? "FROZEN" : "ENEMY"}
        </p>
      </div>

      {/* top-left: player status */}
      <div className="absolute top-3 left-3 flex items-center gap-2.5 rounded-lg border border-white/10 bg-black/45 px-3 py-2 backdrop-blur-sm">
        <div className="w-28">
          <div className="flex items-center justify-between text-[9px] font-bold text-white/70">
            <span>HEALTH</span>
            <span className="font-mono">{god ? "∞" : Math.round(hp)}</span>
          </div>
          <div className="mt-1 h-2 overflow-hidden rounded-full bg-black/60">
            <div className={cn("h-full rounded-full transition-all duration-200", hpColor)} style={{ width: `${hp}%` }} />
          </div>
        </div>
        {god && (
          <span className="flex items-center gap-1 rounded bg-amber-400/15 px-1.5 py-0.5 text-[9px] font-bold text-amber-300">
            <Shield className="h-2.5 w-2.5" /> GOD
          </span>
        )}
      </div>

      {/* top-right: money */}
      <div className="absolute top-3 right-3 rounded-lg border border-white/10 bg-black/45 px-3 py-2 text-right backdrop-blur-sm">
        <p className="text-[9px] font-bold tracking-widest text-white/60">WALLET</p>
        <p className="font-mono text-base leading-tight font-bold text-emerald-300 tabular-nums" title={moneyFull}>
          {moneyStr}
        </p>
        <div className="pointer-events-none absolute -left-2 top-1/2 -translate-y-1/2">
          {floaters.map((f) => (
            <p key={f.id} className="anim-float whitespace-nowrap font-mono text-[10px] font-bold text-emerald-300">
              {f.text}
            </p>
          ))}
        </div>
      </div>

      {/* active cheat chips */}
      {running && activeChips.length > 0 && (
        <div className="absolute top-14 left-1/2 flex max-w-[70%] -translate-x-1/2 flex-wrap justify-center gap-1.5">
          {activeChips.map((c) => (
            <span key={c.label} className={cn("flex items-center gap-1 rounded-full border px-2 py-0.5 text-[9px] font-bold backdrop-blur-sm", c.color)}>
              <c.icon className="h-2.5 w-2.5" /> {c.label}
            </span>
          ))}
        </div>
      )}

      {/* kill feed */}
      <div className="pointer-events-none absolute top-24 left-1/2 flex -translate-x-1/2 flex-col items-center gap-1">
        {feed.map((m) => (
          <span
            key={m.id}
            className={cn(
              "rounded-md border px-2.5 py-1 text-[10px] font-extrabold tracking-wider backdrop-blur-sm",
              m.tone === "kill" && "border-orange-400/50 bg-orange-500/15 text-orange-300",
              m.tone === "level" && "border-cyan-400/50 bg-cyan-500/15 text-cyan-300 text-glow",
              m.tone === "info" && "border-white/20 bg-black/50 text-white/80"
            )}
          >
            {m.text}
          </span>
        ))}
      </div>

      {/* minimap */}
      <div className="absolute bottom-3 left-3 h-20 w-20 overflow-hidden rounded-full border-2 border-white/15 bg-black/50">
        <div
          className="anim-radar absolute inset-0"
          style={{ background: "conic-gradient(from 0deg, rgba(0,200,255,0.5), transparent 60deg, transparent)" }}
        />
        <div className="absolute top-1/2 left-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-300" />
        <div className="absolute top-[30%] left-[62%] h-1 w-1 rounded-full bg-red-400" />
        <div className="absolute top-[70%] left-[30%] h-1 w-1 rounded-full bg-red-400" />
        <div className="absolute top-[55%] left-[75%] h-1 w-1 rounded-full bg-red-400" />
      </div>

      {/* xp + level */}
      <div className="absolute bottom-4 left-1/2 flex w-44 -translate-x-1/2 items-center gap-2 rounded-lg border border-white/10 bg-black/45 px-3 py-1.5 backdrop-blur-sm">
        <span className="rounded bg-primary/20 px-1.5 py-0.5 font-mono text-[9px] font-bold text-primary">LV {level}</span>
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-black/60">
          <div className="h-full rounded-full bg-primary transition-all duration-200" style={{ width: `${xp}%` }} />
        </div>
      </div>

      {/* ammo */}
      <div className="absolute right-3 bottom-3 flex items-center gap-1.5 rounded-lg border border-white/10 bg-black/45 px-2.5 py-1.5 backdrop-blur-sm">
        <Crosshair className={cn("h-3.5 w-3.5", infAmmo ? "text-cyan-300" : "text-white/60")} />
        <span className="font-mono text-xs font-bold text-white/90 tabular-nums">{infAmmo ? "999+" : ammo}</span>
      </div>

      {/* attack button */}
      {running && (
        <div className="absolute bottom-16 left-1/2 -translate-x-1/2">
          <button
            onClick={attack}
            disabled={enemyDead}
            className={cn(
              "flex h-12 w-12 items-center justify-center rounded-full border-2 font-bold transition-all active:scale-90",
              oneHit
                ? "glow-cyan border-orange-400/60 bg-orange-500/25 text-orange-200"
                : "border-white/25 bg-white/10 text-white hover:bg-white/20",
              enemyDead && "opacity-40"
            )}
            aria-label="Attack enemy (Space)"
            title="Attack (Space)"
          >
            <Swords className="h-5 w-5" />
          </button>
        </div>
      )}

      {/* daily limit reached — free users only, mods paused */}
      {overLimit && running && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/80 text-center backdrop-blur-[6px]">
          <Timer className="h-10 w-10 text-lime-300" />
          <p className="mt-3 text-base font-extrabold text-foreground">Daily limit reached</p>
          <p className="mt-1 max-w-xs text-xs text-muted-foreground">
            You&apos;ve used all {formatUsage(dailyCapMinutes({ limitMinutes, bonusMinutes, usageDate }) * 60)} of free
            customization today. Spend Boost for another hour, or go unlimited with Pro.
          </p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2.5">
            <Button
              onClick={() => {
                if (hourOutcome.atCap) return;
                if (spendBoosts(BOOST_HOUR_COST, "+1 hour of trainer time")) {
                  grantTimeMinutes(hourOutcome.added);
                } else {
                  navigate("home");
                }
              }}
              disabled={hourOutcome.atCap}
              className="bg-lime-300 font-black text-neutral-900 hover:bg-lime-300/90 disabled:opacity-40"
            >
              <Zap className="mr-1.5 h-4 w-4 fill-neutral-900" />
              {hourOutcome.atCap
                ? "Boost time maxed today"
                : hourOutcome.added < 60
                  ? `+${hourOutcome.added}m — ${BOOST_HOUR_COST} Boost (today's cap)`
                  : `+1 hour — ${BOOST_HOUR_COST} Boost`}
            </Button>
            <Button
              onClick={() => navigate("pro")}
              className="bg-primary font-black text-primary-foreground hover:bg-primary/90"
            >
              Upgrade to Pro
            </Button>
          </div>
          {boosts < BOOST_HOUR_COST && (
            <button
              onClick={() => navigate("home")}
              className="mt-2 text-[11px] font-bold text-lime-300 transition-colors hover:underline"
            >
              Earn free Boost on the Mods page →
            </button>
          )}
        </div>
      )}

      {/* launch / launching overlays */}
      {!running && !launching && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/65 backdrop-blur-[6px]">
          <game.icon className="h-12 w-12 text-white/25" strokeWidth={1.2} />
          <p className="mt-3 text-sm font-bold text-foreground">Game not running</p>
          <p className="mt-1 max-w-xs text-center text-xs text-muted-foreground">
            Launch {game.title} to attach the trainer and watch your cheats work in real time.
          </p>
          <Button
            onClick={() => launchGame(game.id)}
            className="glow-cyan mt-4 gap-2 bg-primary font-bold text-primary-foreground hover:bg-primary/90"
          >
            <Play className="h-4 w-4 fill-current" /> Launch game
          </Button>
        </div>
      )}
      {launching && <LaunchOverlay key={game.id} game={game} />}
    </div>
  );
}
