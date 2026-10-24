'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store';
import { GAMES } from '@/data/games';
import { useCompanion } from '@/hooks/useCompanion';

interface Props {
  companion: ReturnType<typeof useCompanion>;
}

export default function LibraryView({ companion }: Props) {
  const { setView, setSelectedGame, myGameIds, addMyGame, removeMyGame } = useStore();
  const [search, setSearch] = useState('');
  const installedIds = new Set(companion.installed.map(i => i.gameId));

  const filtered = GAMES.filter(g =>
    g.name.toLowerCase().includes(search.toLowerCase())
  );

  function openTrainer(id: string) {
    setSelectedGame(id);
    setView('trainer');
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-white/5 flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-white">Library</h1>
          <div className="text-sm text-white/30">{GAMES.length} trainers</div>
        </div>
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search games..."
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-white/30 text-sm focus:outline-none focus:border-amber-400/50 transition-colors"
        />
      </div>

      {/* Installed section */}
      {companion.installed.length > 0 && !search && (
        <div className="px-6 pt-4 flex-shrink-0">
          <div className="text-[10px] font-semibold text-white/30 uppercase tracking-widest mb-2">
            Detected on your PC ({companion.installed.length})
          </div>
          <div className="flex flex-wrap gap-2">
            {companion.installed.map(inst => {
              const game = GAMES.find(g => g.id === inst.gameId);
              if (!game) return null;
              return (
                <button
                  key={inst.gameId}
                  onClick={() => openTrainer(inst.gameId)}
                  className="flex items-center gap-2 bg-emerald-400/5 border border-emerald-400/20 hover:border-emerald-400/40 rounded-full px-3 py-1.5 transition-colors"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span className="text-emerald-400 text-xs font-medium">{game.name}</span>
                </button>
              );
            })}
          </div>
          <div className="h-px bg-white/5 mt-4" />
        </div>
      )}

      {/* All games */}
      <div className="flex-1 overflow-y-auto p-6 pt-4">
        <div className="space-y-2">
          {filtered.map(game => {
            const installed = installedIds.has(game.id);
            const inMyGames = myGameIds.includes(game.id);
            return (
              <div
                key={game.id}
                className="flex items-center gap-3 bg-[#141414] hover:bg-[#1a1a1a] border border-white/5 hover:border-white/10 rounded-xl p-3 transition-all group"
              >
                <img
                  src={game.coverUrl}
                  alt={game.name}
                  className="w-12 h-12 rounded-lg object-cover flex-shrink-0 cursor-pointer"
                  onClick={() => openTrainer(game.id)}
                />
                <div className="flex-1 min-w-0 cursor-pointer" onClick={() => openTrainer(game.id)}>
                  <div className="text-white text-sm font-medium">{game.name}</div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-white/30 text-xs">{game.cheats.length} cheats</span>
                    <span className="text-white/20 text-xs">·</span>
                    <span className="text-white/30 text-xs capitalize">{game.platform}</span>
                    {installed && (
                      <>
                        <span className="text-white/20 text-xs">·</span>
                        <span className="text-emerald-400 text-xs">✓ Installed</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => inMyGames ? removeMyGame(game.id) : addMyGame(game.id)}
                    className={`text-xs px-2.5 py-1.5 rounded-lg transition-colors ${
                      inMyGames
                        ? 'bg-white/10 text-white/40 hover:bg-white/5'
                        : 'bg-white/5 text-white/40 hover:bg-white/10 hover:text-white/70'
                    }`}
                  >
                    {inMyGames ? '✓ Added' : '+ Add'}
                  </button>
                  <button
                    onClick={() => openTrainer(game.id)}
                    className="bg-amber-400/10 hover:bg-amber-400/20 text-amber-400 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
                  >
                    Open →
                  </button>
                </div>
              </div>
            );
          })}

          {filtered.length === 0 && (
            <div className="text-center py-16 text-white/30">
              <div className="text-3xl mb-2">🔍</div>
              <div className="text-sm">No games found for "{search}"</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
