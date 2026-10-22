"use client";

import { useEffect, useState } from "react";
import {
  Bot,
  CircleStop,
  Crown,
  Download,
  Gamepad2,
  Home,
  LayoutGrid,
  Menu,
  Radio,
  Settings as SettingsIcon,
  ShieldCheck,
  Sparkles,
  Timer,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { TOTAL_CHEATS, TOTAL_TRAINERS, GAMES, coverOf, getGame } from "@/data/games";
import {
  useModDeck,
  formatUsage,
  dailyCapMinutes,
  limitApplies,
  DEFAULT_ACCENT,
  type View,
} from "@/lib/moddeck-store";
import { cn } from "@/lib/utils";
import { GoogleIcon } from "@/components/moddeck/brand";
import { PwaProvider } from "@/components/moddeck/pwa-provider";

const MY_GAME_IDS = [
  "supermarket-together",
  "supermarket-simulator",
  "mall-simulator",
  "gym-simulator-24",
  "planet-crafter",
  "gta-v",
  "cyberpunk-2077",
  "elden-ring",
  "rdr2",
  "palworld",
];

function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex h-8 w-11 shrink-0 items-center justify-center rounded-md bg-primary shadow-[0_0_18px_-4px_color-mix(in_srgb,var(--primary)_55%,transparent)]">
        <span className="text-[15px] font-black tracking-tighter text-primary-foreground">M</span>
        <span className="-ml-0.5 text-[15px] font-black tracking-tighter text-primary-foreground/70">D</span>
      </div>
      {!compact && (
        <div className="leading-none">
          <p className="text-[15px] font-black tracking-tight text-foreground">
            MOD<span className="text-primary">DECK</span>
          </p>
          <p className="mt-0.5 text-[10px] font-medium text-muted-foreground">Trainers &amp; Mods for PC</p>
        </div>
      )}
    </div>
  );
}

function NavList({ onNavigate }: { onNavigate?: () => void }) {
  const { view, navigate } = useModDeck();

  const goHighlights = () => {
    navigate("home");
    onNavigate?.();
    setTimeout(() => {
      document.getElementById("most-popular")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 140);
  };

  const items: { view?: View; label: string; icon: typeof Home; badge?: string; onClick?: () => void }[] = [
    { view: "home", label: "Mods", icon: LayoutGrid },
    { label: "Highlights", icon: Sparkles, onClick: goHighlights },
    { view: "ai", label: "Mod AI", icon: Bot, badge: "BOOST" },
    { view: "pro", label: "ModDeck Pro", icon: Crown },
    { view: "library", label: "Library", icon: Gamepad2 },
    { view: "dashboard", label: "Pulse", icon: Radio, badge: "NEW" },
    { view: "settings", label: "Settings", icon: SettingsIcon },
  ];

  return (
    <nav className="flex flex-col gap-0.5" aria-label="Main navigation">
      {items.map((item) => {
        const active = item.view !== undefined && view === item.view;
        return (
          <button
            key={item.label}
            onClick={item.onClick ?? (item.view ? () => { navigate(item.view!); onNavigate?.(); } : undefined)}
            className={cn(
              "group flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-semibold transition-all",
              active
                ? "bg-white/10 text-foreground shadow-[inset_2px_0_0_0_var(--primary)]"
                : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
            )}
            aria-current={active ? "page" : undefined}
          >
            <item.icon className={cn("h-4 w-4", active ? "text-primary" : "")} />
            <span className="flex-1 text-left">{item.label}</span>
            {item.badge && (
              <span className="rounded-full bg-fuchsia-500 px-1.5 py-px text-[8px] font-black tracking-wide text-white">
                {item.badge}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );
}

function MyGamesList({ onNavigate }: { onNavigate?: () => void }) {
  const { view, gameId, openTrainer } = useModDeck();
  const games = MY_GAME_IDS.map((id) => getGame(id)).filter((g): g is NonNullable<typeof g> => !!g);

  return (
    <div className="mt-5">
      <p className="mb-1.5 px-3 text-[10px] font-black tracking-[0.14em] text-muted-foreground/70 uppercase">
        My Games ({games.length})
      </p>
      <div className="scrollbar-slim max-h-[264px] space-y-0.5 overflow-y-auto pr-1">
        {games.map((game) => {
          const active = view === "trainer" && gameId === game.id;
          return (
            <button
              key={game.id}
              onClick={() => {
                openTrainer(game.id);
                onNavigate?.();
              }}
              className={cn(
                "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-left transition-colors",
                active ? "bg-white/10" : "hover:bg-white/5"
              )}
              aria-current={active ? "page" : undefined}
            >
              <span
                className="relative flex h-5 w-8 shrink-0 items-center justify-center overflow-hidden rounded"
                style={{ background: `linear-gradient(135deg, ${game.gradient[0]}, ${game.gradient[1]})` }}
              >
                {game.cover && (
                  <Image src={coverOf(game)!} alt="" fill sizes="32px" className="object-cover" />
                )}
                <game.icon className="relative h-3 w-3 text-white/90 drop-shadow" />
              </span>
              <span className={cn("truncate text-[12px]", active ? "font-bold text-foreground" : "font-medium text-muted-foreground")}>
                {game.title}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function UsageMeter() {
  const usageSeconds = useModDeck((s) => s.usageSeconds);
  const capMinutes = useModDeck((s) => dailyCapMinutes(s));
  const applies = useModDeck((s) => limitApplies(s));
  if (!applies) return null;
  const pct = Math.min(100, (usageSeconds / (capMinutes * 60)) * 100);
  return (
    <div className="mt-2.5">
      <div className="flex items-center justify-between text-[9px] font-bold tracking-wide text-muted-foreground">
        <span>USED</span>
        <span className="font-mono">{formatUsage(usageSeconds)}/{formatUsage(capMinutes * 60)}</span>
      </div>
      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-white/10">
        <div className="h-full rounded-full bg-lime-300 transition-all duration-500" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function ProCard({ onNavigate }: { onNavigate?: () => void }) {
  const { pro, ownerMode, navigate } = useModDeck();
  if (pro) {
    return (
      <div className="rounded-xl border border-primary/25 bg-gradient-to-br from-primary/15 to-primary/5 p-3.5">
        <div className="flex items-center gap-2">
          <Crown className="h-4 w-4 fill-primary text-primary" />
          <p className="text-[13px] font-semibold text-primary">ModDeck Pro</p>
        </div>
        <p className="mt-1 text-[11px] leading-snug text-muted-foreground">
          No time limits, unlimited Mod AI, 2× Boost, priority injection — all {TOTAL_CHEATS} cheats unlocked. Thanks for the support.
        </p>
      </div>
    );
  }
  return (
    <div className="rounded-xl border border-primary/25 bg-gradient-to-br from-primary/15 to-primary/5 p-3.5">
      <div className="flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-primary" />
        <p className="text-[13px] font-semibold text-foreground">
          {ownerMode ? "Owner mode active" : "Free plan"}
        </p>
      </div>
      <p className="mt-1 text-[11px] leading-snug text-muted-foreground">
        {ownerMode
          ? "Daily limits never apply to you. Members get 5 hours free."
          : "5 hours free daily — stretch it with Boost, or go unlimited with Pro."}
      </p>
      <UsageMeter />
      <Button
        size="sm"
        className="mt-2.5 h-7 w-full bg-primary text-xs font-black text-primary-foreground hover:bg-primary/90"
        onClick={() => {
          navigate("pro");
          onNavigate?.();
        }}
      >
        Upgrade to Pro
      </Button>
    </div>
  );
}

function GetAppCard() {
  const { installed, setDownloadOpen } = useModDeck();
  if (installed) return null;
  return (
    <button
      onClick={() => setDownloadOpen(true)}
      className="mt-3 flex w-full items-center gap-2.5 rounded-xl border border-white/8 bg-white/[0.03] p-2.5 text-left transition-colors hover:bg-white/[0.06]"
      aria-label="Get the ModDeck desktop app"
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/15">
        <Download className="h-4 w-4 text-primary" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[12px] font-bold text-foreground">Get the desktop app</span>
        <span className="block text-[10px] text-muted-foreground">Own window · Start menu icon</span>
      </span>
      <Download className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
    </button>
  );
}

function UserCard() {
  const { navigate, pro, plan, ownerMode, boosts, username, auth, setAuthOpen } = useModDeck();
  const initial = (username.trim()[0] ?? "P").toUpperCase();

  /* signed out → the whole card is a Google sign-in button */
  if (!auth.signedIn) {
    return (
      <button
        onClick={() => setAuthOpen(true)}
        className="flex w-full items-center gap-3 rounded-xl border border-white/5 bg-white/[0.03] p-2.5 text-left transition-colors hover:bg-white/[0.06]"
        aria-label="Sign in with Google"
      >
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white">
          <GoogleIcon className="h-4.5 w-4.5" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[13px] font-bold text-foreground">Sign in with Google</span>
          <span className="block text-[11px] text-muted-foreground">Free — pick your username after</span>
        </span>
      </button>
    );
  }

  return (
    <button
      onClick={() => navigate("settings")}
      className="flex w-full items-center gap-3 rounded-xl border border-white/5 bg-white/[0.03] p-2.5 text-left transition-colors hover:bg-white/[0.06]"
      aria-label="Open settings"
    >
      {auth.picture ? (
        <img
          src={auth.picture}
          alt=""
          className="h-9 w-9 shrink-0 rounded-full object-cover"
        />
      ) : (
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-amber-500 text-[13px] font-black text-primary-foreground">
          {initial}
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className="flex items-center gap-1.5 truncate text-[13px] font-semibold text-foreground">
          {username}
          {ownerMode && (
            <span className="rounded bg-primary px-1 py-px text-[8px] font-black tracking-wide text-primary-foreground">
              OWNER
            </span>
          )}
        </p>
        <p className="truncate text-[11px] text-muted-foreground">
          {auth.email || (pro ? (plan === "yearly" ? "Pro yearly" : "Pro member") : "Free plan")} ·{" "}
          <span
            className="inline-flex items-center gap-0.5 font-semibold text-lime-300"
            title="Boost — ModDeck's reward points. Your 1,250 starting points were free, on us. Spend them on trainer time and AI-built mods, earn more free (votes, crates, referrals, ads), or buy a pack on the Mods page."
          >
            <Zap className="h-2.5 w-2.5 shrink-0 fill-lime-300" /> {boosts.toLocaleString()}
          </span>
        </p>
      </div>
      <SettingsIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
    </button>
  );
}

function StatusBar() {
  const { runningGameId, stopGame, activations, pro, ownerMode, usageSeconds } = useModDeck();
  const running = getGame(runningGameId);
  const totalActivations = Object.values(activations).reduce((a, b) => a + b, 0);
  const capMinutes = useModDeck((s) => dailyCapMinutes(s));
  const applies = limitApplies({ pro, ownerMode });

  return (
    <footer className="mt-auto flex h-9 shrink-0 items-center justify-between border-t border-white/5 bg-sidebar px-4 text-[11px] text-muted-foreground">
      <div className="flex items-center gap-4">
        <span className="flex items-center gap-1.5">
          <ShieldCheck className="h-3.5 w-3.5 text-success" />
          v2.4.1 — all trainers up to date
        </span>
        <span className="hidden sm:inline">
          {TOTAL_TRAINERS} trainers · {TOTAL_CHEATS} cheats
        </span>
        {applies && (
          <span className="hidden items-center gap-1.5 lg:flex">
            <Timer className="h-3.5 w-3.5 text-lime-300" />
            <span className="font-mono font-semibold">
              {formatUsage(usageSeconds)} / {formatUsage(capMinutes * 60)}
            </span>
            today
          </span>
        )}
      </div>

      {running ? (
        <div className="flex items-center gap-2.5 font-medium text-success">
          <span className="anim-pulse-dot h-2 w-2 rounded-full bg-success" />
          <span className="hidden md:inline">{running.title} is running — trainer attached</span>
          <span className="md:hidden">Trainer attached</span>
          <button
            onClick={stopGame}
            className="flex items-center gap-1 rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-semibold text-foreground/80 transition-colors hover:border-red-400/40 hover:text-red-300"
            aria-label="Stop game session"
          >
            <CircleStop className="h-3 w-3" /> Stop
          </button>
        </div>
      ) : (
        <span className="hidden sm:inline">No game running</span>
      )}

      <div className="flex items-center gap-3">
        {ownerMode && (
          <span className="rounded bg-primary px-1.5 py-0.5 font-black text-primary-foreground">OWNER</span>
        )}
        <span className="hidden items-center gap-1 md:flex">
          <Zap className="h-3 w-3" />
          {totalActivations} cheats activated
        </span>
        <span className={cn("rounded px-1.5 py-0.5 font-semibold", pro ? "bg-primary/15 text-primary" : "bg-white/5")}>
          {pro ? "PRO" : "FREE"}
        </span>
      </div>
    </footer>
  );
}

export function Shell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { view } = useModDeck();
  const pro = useModDeck((s) => s.pro);
  const accent = useModDeck((s) => s.settings.accent);

  /* Pro accent theme — recolor the whole app at runtime (Pro members only) */
  useEffect(() => {
    const el = document.documentElement;
    const vars = ["--primary", "--ring", "--neon", "--neon-soft", "--sidebar-primary", "--sidebar-ring"];
    if (!pro || !accent || accent === DEFAULT_ACCENT) {
      vars.forEach((v) => el.style.removeProperty(v));
      return;
    }
    el.style.setProperty("--primary", accent);
    el.style.setProperty("--ring", accent);
    el.style.setProperty("--neon", accent);
    el.style.setProperty("--neon-soft", `color-mix(in srgb, ${accent} 14%, transparent)`);
    el.style.setProperty("--sidebar-primary", accent);
    el.style.setProperty("--sidebar-ring", accent);
  }, [pro, accent]);

  /* a cancelled subscription whose paid period has ended flips to free on mount */
  useEffect(() => {
    useModDeck.getState().checkProExpiry();
  }, []);

  const activeLabel =
    view === "dashboard" ? "Pulse" : view === "home" ? "Mods" : view === "pro" ? "ModDeck Pro" : view === "library" ? "Library" : view === "ai" ? "Mod AI" : "ModDeck";

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      {/* ---- desktop sidebar ---- */}
      <aside className="hidden w-[248px] shrink-0 flex-col overflow-y-auto border-r border-white/5 bg-sidebar p-4 scrollbar-slim md:flex">
        <Logo />
        <div className="mt-5 flex-1">
          <NavList />
          <MyGamesList />
        </div>
        <div className="mt-4">
          <ProCard />
        </div>
        <GetAppCard />
        <div className="mt-3">
          <UserCard />
        </div>
      </aside>

      {/* ---- main column ---- */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* mobile top bar */}
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-white/5 bg-sidebar px-4 md:hidden">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Open menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[280px] border-white/10 bg-sidebar p-4 pb-24">
              <SheetHeader className="p-0 pb-4">
                <SheetTitle asChild>
                  <div>
                    <Logo />
                  </div>
                </SheetTitle>
              </SheetHeader>
              <NavList onNavigate={() => setMobileOpen(false)} />
              <MyGamesList onNavigate={() => setMobileOpen(false)} />
              <div className="mt-5">
                <ProCard onNavigate={() => setMobileOpen(false)} />
              </div>
              <GetAppCard />
              <div className="absolute inset-x-4 bottom-4">
                <UserCard />
              </div>
            </SheetContent>
          </Sheet>
          <p className="text-sm font-semibold">{activeLabel}</p>
          <div className="h-8 w-8" aria-hidden />
        </header>

        <main className="scrollbar-slim flex-1 overflow-y-auto">{children}</main>
        <StatusBar />
      </div>

      {/* desktop-app plumbing + download / referral dialogs */}
      <PwaProvider />
    </div>
  );
}
