"use client";

import Image from "next/image";
import { Star } from "lucide-react";
import type { Game } from "@/data/games";
import { coverOf } from "@/data/games";
import { cn } from "@/lib/utils";

interface CoverArtProps {
  game: Game;
  className?: string;
  iconClass?: string;
  titleClass?: string;
  showMeta?: boolean;
  pattern?: "dots" | "diagonal" | "none";
}

export function CoverArt({
  game,
  className,
  iconClass = "h-10 w-10",
  titleClass = "text-sm",
  showMeta = false,
  pattern = "dots",
}: CoverArtProps) {
  const Icon = game.icon;
  return (
    <div
      className={cn(
        "relative overflow-hidden select-none",
        className
      )}
      style={{
        background: `linear-gradient(135deg, ${game.gradient[0]}, ${game.gradient[1]})`,
      }}
      aria-label={`${game.title} cover art`}
      role="img"
    >
      {game.cover ? (
        /* real cover art — title/meta overlay stays for readability */
        <Image
          src={coverOf(game)!}
          alt=""
          fill
          sizes="(max-width: 768px) 50vw, 300px"
          className="object-cover"
          draggable={false}
        />
      ) : (
        <>
          {pattern === "dots" && <div className="cover-pattern absolute inset-0 opacity-60" />}
          {pattern === "diagonal" && <div className="cover-diagonal absolute inset-0" />}
          {/* glow orb */}
          <div
            className="absolute -top-6 -right-6 h-24 w-24 rounded-full opacity-40 blur-2xl"
            style={{ background: game.scene.accent }}
          />
          <Icon
            className={cn("absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[60%] text-white/85 drop-shadow-[0_4px_18px_rgba(0,0,0,0.45)]", iconClass)}
            strokeWidth={1.4}
          />
        </>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-white/10" />

      <div className="absolute right-2 bottom-2 left-2">
        <p className={cn("font-semibold leading-tight text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.8)] line-clamp-2", titleClass)}>
          {game.title}
        </p>
        {showMeta && (
          <div className="mt-1 flex items-center gap-1.5 text-[10px] font-medium text-white/80">
            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
            <span>{game.rating.toFixed(1)}</span>
            <span className="text-white/40">•</span>
            <span>{game.genre}</span>
          </div>
        )}
      </div>
    </div>
  );
}
