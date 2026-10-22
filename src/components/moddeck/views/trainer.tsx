"use client";

import { useEffect } from "react";
import {
  ArrowLeft,
  CircleStop,
  Download,
  Heart,
  Layers,
  MonitorPlay,
  RefreshCw,
  Star,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { CoverArt } from "@/components/moddeck/cover-art";
import { GameHud } from "@/components/moddeck/trainer/hud";
import { CheatList } from "@/components/moddeck/trainer/cheat-list";
import { CheatProfiles } from "@/components/moddeck/trainer/profiles-bar";
import { gameCheatCount, getGame } from "@/data/games";
import { isOverLimit, useModDeck } from "@/lib/moddeck-store";
import { blip } from "@/lib/sound";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

function parseHotkeyMatch(e: KeyboardEvent, hotkey: string): boolean {
  const parts = hotkey.split("+");
  const key = parts[parts.length - 1].toLowerCase();
  const needCtrl = parts.some((p) => p.toLowerCase() === "ctrl");
  const needShift = parts.some((p) => p.toLowerCase() === "shift");
  const needAlt = parts.some((p) => p.toLowerCase() === "alt");

  const eKey = e.key.toLowerCase();
  if (eKey !== key) return false;
  return e.ctrlKey === needCtrl && e.shiftKey === needShift && e.altKey === needAlt;
}

export function TrainerView() {
  const { gameId, navigate, openTrainer, favorites, toggleFavorite, toggleCheat, launchGame, stopGame, runningGameId, pro, settings } =
    useModDeck();
  const game = getGame(gameId);

  /* keyboard hotkeys — F1..F12 / combos toggle matching cheats */
  useEffect(() => {
    if (!game) return;
    const allCheats = game.categories.flatMap((c) => c.cheats);
    const onKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;

      for (const cheat of allCheats) {
        if (!cheat.hotkey) continue;
        if (parseHotkeyMatch(e, cheat.hotkey)) {
          e.preventDefault();
          if (cheat.pro && !pro) {
            toast.error(`${cheat.name} is a Pro cheat`, {
              description: "Upgrade to ModDeck Pro to unlock it.",
            });
            return;
          }
          const s = useModDeck.getState();
          if (isOverLimit(s)) {
            s.flagLimit();
            toast.error("Daily limit reached", {
              description: "Free customization is capped at 5 hours a day — Pro removes the limit.",
            });
            return;
          }
          if (settings.hotkeySound) blip(760);
          toggleCheat(game.id, cheat);
          return;
        }
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [game, pro, toggleCheat, settings.hotkeySound]);

  if (!game) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 p-10 text-center">
        <p className="text-sm text-muted-foreground">No trainer selected.</p>
        <Button onClick={() => navigate("library")} variant="outline">
          Browse trainers
        </Button>
      </div>
    );
  }

  const fav = favorites.includes(game.id);
  const running = runningGameId === game.id;

  const related = useModDeck
    .getState()
    .recentlyPlayed.filter((id) => id !== game.id)
    .slice(0, 3);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 md:px-8 md:py-7">
      {/* breadcrumb */}
      <div className="mb-4 flex items-center justify-between">
        <button
          onClick={() => navigate("library")}
          className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:text-primary"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Library
        </button>
        {related.length > 0 && (
          <div className="hidden items-center gap-1.5 sm:flex">
            <span className="text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">Recent:</span>
            {related.map((id) => {
              const rg = getGame(id);
              if (!rg) return null;
              return (
                <button
                  key={id}
                  onClick={() => openTrainer(id)}
                  className={cn(
                    "rounded-md border px-2 py-1 text-[10px] font-semibold transition-colors",
                    "border-white/10 bg-panel text-muted-foreground hover:border-primary/40 hover:text-primary"
                  )}
                >
                  {rg.title}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* header */}
      <div className="flex flex-col gap-5 rounded-2xl border border-white/8 bg-panel/60 p-5 md:flex-row md:items-center">
        <CoverArt
          game={game}
          className="h-32 w-24 shrink-0 rounded-xl border border-white/10"
          iconClass="h-8 w-8"
          titleClass="text-[10px]"
          pattern="diagonal"
        />

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl font-extrabold tracking-tight text-foreground md:text-2xl">{game.title}</h1>
            <span className="rounded-md border border-primary/30 bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
              TRAINER v{game.version}
            </span>
            {running && (
              <span className="flex items-center gap-1.5 rounded-md border border-success/40 bg-success/10 px-2 py-0.5 text-[10px] font-bold text-success">
                <span className="anim-pulse-dot h-1.5 w-1.5 rounded-full bg-success" /> ATTACHED
              </span>
            )}
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              <b className="text-foreground">{game.rating.toFixed(1)}</b>
            </span>
            <span className="flex items-center gap-1">
              <Layers className="h-3.5 w-3.5" /> {gameCheatCount(game)} cheats
            </span>
            <span className="flex items-center gap-1">
              <Download className="h-3.5 w-3.5" /> {game.downloads}
            </span>
            <span className="flex items-center gap-1">
              <Users className="h-3.5 w-3.5" /> {game.players} playing
            </span>
            <span className="hidden items-center gap-1 sm:flex">
              <RefreshCw className="h-3.5 w-3.5" /> Updated {game.updated}
            </span>
          </div>

          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {game.platforms.map((p) => (
              <span key={p} className="rounded border border-white/10 bg-white/[0.04] px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground">
                {p}
              </span>
            ))}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2.5">
          <Button
            variant="outline"
            size="icon"
            className={cn("h-10 w-10", fav && "border-red-400/40 text-red-400")}
            onClick={() => toggleFavorite(game.id)}
            aria-label={fav ? "Remove from favorites" : "Add to favorites"}
          >
            <Heart className={cn("h-4 w-4", fav && "fill-current")} />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-10 w-10"
            aria-label="Download trainer"
            onClick={() =>
              toast.success("Trainer downloaded", { description: `${game.title} v${game.version} · 12.4 MB` })
            }
          >
            <Download className="h-4 w-4" />
          </Button>
          {running ? (
            <Button
              onClick={stopGame}
              variant="outline"
              className="h-10 gap-2 border-red-400/40 px-5 font-bold text-red-300 hover:bg-red-500/10"
            >
              <CircleStop className="h-4 w-4" /> Stop
            </Button>
          ) : (
            <Button
              onClick={() => launchGame(game.id)}
              className="glow-cyan h-10 gap-2 bg-primary px-6 font-bold text-primary-foreground hover:bg-primary/90"
            >
              <MonitorPlay className="h-4 w-4" /> Launch game
            </Button>
          )}
        </div>
      </div>

      {/* HUD + cheats */}
      <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
        <div className="space-y-4">
          <GameHud game={game} />
          <div className="rounded-xl border border-white/8 bg-panel/60 p-4">
            <p className="text-xs leading-relaxed text-muted-foreground">
              <b className="text-foreground">How it works:</b> flip any cheat toggle (or press its hotkey) and watch
              the live simulator react — God Mode pins your health, Infinite Money fills your wallet, One-Hit Kills
              deletes enemies, sliders change speed and XP gain instantly. Everything resets when you press Stop.
            </p>
          </div>
        </div>

        <div className="min-w-0 space-y-4">
          <CheatProfiles game={game} />
          <CheatList game={game} />
        </div>
      </div>
    </div>
  );
}
