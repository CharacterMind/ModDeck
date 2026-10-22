"use client";

import { useSyncExternalStore } from "react";
import { motion } from "framer-motion";
import {
  Activity,
  BarChart3,
  Clock,
  Flame,
  Gamepad2,
  Heart,
  Timer,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { getGame } from "@/data/games";
import { useModDeck } from "@/lib/moddeck-store";
import { cn } from "@/lib/utils";

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  tint,
}: {
  icon: typeof Flame;
  label: string;
  value: string;
  sub: string;
  tint: string;
}) {
  return (
    <div className="glass card-hover rounded-xl border border-white/8 p-4">
      <div className={cn("flex h-9 w-9 items-center justify-center rounded-lg", tint)}>
        <Icon className="h-4 w-4" />
      </div>
      <p className="mt-3 text-2xl font-extrabold tracking-tight text-foreground tabular-nums">{value}</p>
      <p className="text-xs font-medium text-foreground/70">{label}</p>
      <p className="mt-0.5 text-[11px] text-muted-foreground">{sub}</p>
    </div>
  );
}

export function DashboardView() {
  const { activations, sessions, favorites, activity, navigate } = useModDeck();
  const emptySubscribe = () => () => {};
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  const totalActivations = Object.values(activations).reduce((a, b) => a + b, 0);
  const hoursSaved = (totalActivations * 0.08).toFixed(1);

  /* last 7 days of activations derived from activity log */
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const start = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
    const end = start + 86_400_000;
    const count = activity.filter((a) => a.time >= start && a.time < end && a.kind === "activate").length;
    return { label: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][d.getDay()], count };
  });
  const maxDay = Math.max(...days.map((d) => d.count), 4);

  /* top cheats */
  const topCheats = Object.entries(activations)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([key, count]) => {
      const [gameId, cheatId] = key.split(":");
      const game = getGame(gameId);
      const cheat = game?.categories.flatMap((c) => c.cheats).find((c) => c.id === cheatId);
      return { name: cheat?.name ?? cheatId, game: game?.title ?? gameId, count };
    });

  return (
    <div className="mx-auto max-w-6xl px-5 py-6 md:px-8 md:py-8">
      <h1 className="text-xl font-bold tracking-tight text-foreground md:text-2xl">Pulse</h1>
      <p className="mt-1 text-sm text-muted-foreground">Your trainer usage at a glance</p>

      {/* stats */}
      <div className="mt-5 grid grid-cols-2 gap-3.5 lg:grid-cols-4">
        <StatCard
          icon={TrendingUp}
          label="Cheats activated"
          value={mounted ? totalActivations.toLocaleString() : "—"}
          sub="All-time toggles & actions"
          tint="bg-primary/10 text-primary"
        />
        <StatCard
          icon={Gamepad2}
          label="Game sessions"
          value={mounted ? sessions.toLocaleString() : "—"}
          sub="Trainer attachments"
          tint="bg-emerald-500/10 text-emerald-400"
        />
        <StatCard
          icon={Heart}
          label="Favorites"
          value={mounted ? favorites.length.toLocaleString() : "—"}
          sub="Trainers in your watchlist"
          tint="bg-rose-500/10 text-rose-400"
        />
        <StatCard
          icon={Timer}
          label="Hours saved"
          value={mounted ? hoursSaved : "—"}
          sub="Grinding avoided, roughly"
          tint="bg-amber-500/10 text-amber-400"
        />
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        {/* weekly chart */}
        <section className="rounded-2xl border border-white/8 bg-panel/60 p-5">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-sm font-bold text-foreground">
              <BarChart3 className="h-4 w-4 text-primary" /> Cheat activity — last 7 days
            </h2>
          </div>
          <div className="mt-6 flex h-40 items-end justify-between gap-2.5">
            {days.map((d, i) => (
              <div key={i} className="flex flex-1 flex-col items-center gap-2">
                <span className="font-mono text-[10px] font-bold text-muted-foreground tabular-nums">
                  {mounted ? d.count : ""}
                </span>
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: mounted ? `${Math.max((d.count / maxDay) * 100, 6)}%` : 0 }}
                  transition={{ delay: i * 0.05, duration: 0.5, ease: "easeOut" }}
                  className={cn(
                    "w-full max-w-9 rounded-t-md",
                    i === 6 ? "glow-cyan bg-primary" : "bg-primary/35"
                  )}
                />
                <span className="text-[10px] font-medium text-muted-foreground">{d.label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* top cheats */}
        <section className="rounded-2xl border border-white/8 bg-panel/60 p-5">
          <h2 className="flex items-center gap-2 text-sm font-bold text-foreground">
            <Flame className="h-4 w-4 text-orange-400" /> Most used cheats
          </h2>
          {topCheats.length > 0 ? (
            <div className="mt-4 space-y-3">
              {topCheats.map((c, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 font-mono text-[11px] font-bold text-primary">
                    {i + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-semibold text-foreground">{c.name}</p>
                    <p className="truncate text-[11px] text-muted-foreground">{c.game}</p>
                  </div>
                  <div className="w-24">
                    <div className="h-1.5 overflow-hidden rounded-full bg-white/5">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-primary to-amber-300"
                        style={{ width: `${(c.count / topCheats[0].count) * 100}%` }}
                      />
                    </div>
                  </div>
                  <span className="w-8 text-right font-mono text-xs font-bold text-foreground tabular-nums">{c.count}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-8 flex flex-col items-center pb-6 text-center">
              <Activity className="h-8 w-8 text-muted-foreground/40" />
              <p className="mt-3 text-xs text-muted-foreground">
                No cheat usage yet — launch a trainer and flip some switches.
              </p>
              <Button size="sm" className="mt-4 h-8 bg-primary text-xs font-bold text-primary-foreground" onClick={() => navigate("library")}>
                Find a trainer
              </Button>
            </div>
          )}
        </section>
      </div>

      {/* activity log */}
      <section className="mt-6 rounded-2xl border border-white/8 bg-panel/60 p-5 pb-6">
        <h2 className="flex items-center gap-2 text-sm font-bold text-foreground">
          <Clock className="h-4 w-4 text-muted-foreground" /> Recent activity
        </h2>
        {activity.length > 0 ? (
          <div className="mt-4 space-y-1">
            {activity.slice(0, 8).map((a) => {
              const game = getGame(a.gameId);
              return (
                <div key={a.id} className="flex items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-white/[0.03]">
                  <span
                    className={cn(
                      "h-1.5 w-1.5 shrink-0 rounded-full",
                      a.kind === "activate" && "bg-primary",
                      a.kind === "deactivate" && "bg-white/30",
                      a.kind === "launch" && "bg-success",
                      a.kind === "purchase" && "bg-amber-400"
                    )}
                  />
                  <p className="min-w-0 flex-1 truncate text-xs text-foreground/85">
                    {a.label}
                    {game && <span className="text-muted-foreground"> · {game.title}</span>}
                  </p>
                  <span className="shrink-0 text-[10px] text-muted-foreground">
                    {mounted ? new Date(a.time).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }) : ""}
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="mt-4 text-xs text-muted-foreground">Your activations, launches and purchases will appear here.</p>
        )}
      </section>
    </div>
  );
}
