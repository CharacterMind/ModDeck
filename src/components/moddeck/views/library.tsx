"use client";

import { useState } from "react";
import { Gamepad2, Heart, Search, SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { GameCard } from "@/components/moddeck/game-card";
import { GAMES, GENRES, PLATFORMS } from "@/data/games";
import { useModDeck } from "@/lib/moddeck-store";
import { cn } from "@/lib/utils";

export function LibraryView() {
  const { search, setSearch, platformFilter, setPlatformFilter, genreFilter, setGenreFilter, sort, setSort, favorites } =
    useModDeck();
  const [favOnly, setFavOnly] = useState(false);

  const filtered = GAMES.filter((g) => {
    const q = search.trim().toLowerCase();
    if (q && !g.title.toLowerCase().includes(q) && !g.genre.toLowerCase().includes(q)) return false;
    if (platformFilter !== "All" && !g.platforms.includes(platformFilter)) return false;
    if (genreFilter !== "All" && g.genre !== genreFilter) return false;
    if (favOnly && !favorites.includes(g.id)) return false;
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sort === "name") return a.title.localeCompare(b.title);
    if (sort === "newest") return a.updated.localeCompare(b.updated) * -1;
    return parseFloat(b.downloads) - parseFloat(a.downloads);
  });

  const hasFilters = search !== "" || platformFilter !== "All" || genreFilter !== "All";

  return (
    <div className="mx-auto max-w-6xl px-5 py-6 md:px-8 md:py-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground md:text-2xl">All trainers</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {sorted.length} of {GAMES.length} trainers — every one free to download
          </p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search games or genres..."
            className="border-white/10 bg-panel pl-9"
            aria-label="Search trainers"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute top-1/2 right-2.5 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-2.5">
        <button
          onClick={() => setFavOnly((v) => !v)}
          className={cn(
            "flex h-9 items-center gap-1.5 rounded-md border px-3 text-xs font-semibold transition-colors",
            favOnly
              ? "border-primary/50 bg-primary/10 text-primary"
              : "border-white/10 bg-panel text-muted-foreground hover:text-foreground"
          )}
          aria-pressed={favOnly}
        >
          <Heart className={cn("h-3.5 w-3.5", favOnly && "fill-current")} /> Favorites ({favorites.length})
        </button>

        <Select value={platformFilter} onValueChange={setPlatformFilter}>
          <SelectTrigger className="h-9 w-[150px] border-white/10 bg-panel" aria-label="Platform filter">
            <SelectValue placeholder="Platform" />
          </SelectTrigger>
          <SelectContent>
            {PLATFORMS.map((p) => (
              <SelectItem key={p} value={p}>
                {p === "All" ? "All platforms" : p}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={genreFilter} onValueChange={setGenreFilter}>
          <SelectTrigger className="h-9 w-[160px] border-white/10 bg-panel" aria-label="Genre filter">
            <SelectValue placeholder="Genre" />
          </SelectTrigger>
          <SelectContent>
            {GENRES.map((g) => (
              <SelectItem key={g} value={g}>
                {g === "All" ? "All genres" : g}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={sort} onValueChange={(v) => setSort(v as typeof sort)}>
          <SelectTrigger className="h-9 w-[150px] border-white/10 bg-panel" aria-label="Sort order">
            <SlidersHorizontal className="mr-1 h-3.5 w-3.5 text-muted-foreground" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="popular">Most popular</SelectItem>
            <SelectItem value="newest">Recently updated</SelectItem>
            <SelectItem value="name">Name A–Z</SelectItem>
          </SelectContent>
        </Select>

        {hasFilters && (
          <Button
            variant="ghost"
            size="sm"
            className="h-9 text-xs text-muted-foreground"
            onClick={() => {
              setSearch("");
              setPlatformFilter("All");
              setGenreFilter("All");
              setFavOnly(false);
            }}
          >
            <X className="mr-1 h-3.5 w-3.5" /> Clear filters
          </Button>
        )}
      </div>

      {/* grid */}
      {sorted.length > 0 ? (
        <div className={cn("mt-6 grid grid-cols-2 gap-4 pb-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5")}>
          {sorted.map((game) => (
            <GameCard key={game.id} game={game} />
          ))}
        </div>
      ) : (
        <div className="mt-16 flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 py-16 text-center">
          <Gamepad2 className="h-10 w-10 text-muted-foreground/50" />
          <p className="mt-4 text-sm font-semibold text-foreground">No trainers found</p>
          <p className="mt-1 max-w-xs text-xs text-muted-foreground">
            Try a different search term or clear the filters — new trainers are added every week.
          </p>
        </div>
      )}
    </div>
  );
}
