"use client";

import { Heart, Gamepad2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GameCard } from "@/components/moddeck/game-card";
import { GAMES } from "@/data/games";
import { useModDeck } from "@/lib/moddeck-store";

export function FavoritesView() {
  const { favorites, navigate } = useModDeck();
  const games = favorites.map((id) => GAMES.find((g) => g.id === id)).filter((g) => g !== undefined);

  return (
    <div className="mx-auto max-w-6xl px-5 py-6 md:px-8 md:py-8">
      <h1 className="text-xl font-bold tracking-tight text-foreground md:text-2xl">Favorites</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {games.length} trainer{games.length === 1 ? "" : "s"} in your watchlist
      </p>

      {games.length > 0 ? (
        <div className="mt-6 grid grid-cols-2 gap-4 pb-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {games.map((game) => (
            <GameCard key={game.id} game={game} />
          ))}
        </div>
      ) : (
        <div className="mt-16 flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 py-20 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/10">
            <Heart className="h-7 w-7 text-red-400/70" />
          </div>
          <p className="mt-4 text-sm font-semibold text-foreground">No favorites yet</p>
          <p className="mt-1 max-w-xs text-xs text-muted-foreground">
            Tap the heart on any trainer to keep it one click away. WeMod-style convenience, zero clutter.
          </p>
          <Button className="mt-5 gap-2 bg-primary font-bold text-primary-foreground hover:bg-primary/90" onClick={() => navigate("library")}>
            <Gamepad2 className="h-4 w-4" /> Browse trainers
          </Button>
        </div>
      )}
    </div>
  );
}
