"use client";

import { Heart, Layers, Play } from "lucide-react";
import { CoverArt } from "@/components/moddeck/cover-art";
import { gameCheatCount, type Game } from "@/data/games";
import { useModDeck } from "@/lib/moddeck-store";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export function GameCard({ game, className }: { game: Game; className?: string }) {
  const { openTrainer, toggleFavorite, favorites } = useModDeck();
  const fav = favorites.includes(game.id);
  const cheats = gameCheatCount(game);

  return (
    <div
      className={cn(
        "card-hover group relative cursor-pointer overflow-hidden rounded-xl border border-white/8 bg-panel",
        className
      )}
      onClick={() => openTrainer(game.id)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          openTrainer(game.id);
        }
      }}
      aria-label={`Open ${game.title} trainer`}
    >
      <CoverArt game={game} className="aspect-[3/4] w-full" iconClass="h-12 w-12" titleClass="text-[13px]" showMeta />

      {/* hover overlay */}
      <div className="absolute inset-0 flex items-end justify-center bg-gradient-to-t from-black/85 via-black/30 to-transparent pb-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        <span className="glow-cyan flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-xs font-bold text-primary-foreground">
          <Play className="h-3.5 w-3.5 fill-current" /> Open trainer
        </span>
      </div>

      {/* cheat count badge */}
      <div className="absolute top-2 left-2 flex items-center gap-1 rounded-md bg-black/55 px-1.5 py-1 text-[10px] font-semibold text-white/90 backdrop-blur-sm">
        <Layers className="h-3 w-3" />
        {cheats} cheats
      </div>

      {/* favorite */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          toggleFavorite(game.id);
          toast(fav ? "Removed from favorites" : "Added to favorites", {
            description: game.title,
          });
        }}
        className={cn(
          "absolute top-2 right-2 rounded-md bg-black/55 p-1.5 backdrop-blur-sm transition-all hover:scale-110",
          fav ? "text-red-400" : "text-white/70 hover:text-white"
        )}
        aria-label={fav ? "Remove from favorites" : "Add to favorites"}
        aria-pressed={fav}
      >
        <Heart className={cn("h-3.5 w-3.5", fav && "fill-current")} />
      </button>
    </div>
  );
}
