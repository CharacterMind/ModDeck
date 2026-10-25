'use client';

import { useState, useCallback } from 'react';
import { useStore } from '@/lib/store';
import { GAMES, GENRES } from '@/data/games';
import { useCompanion } from '@/hooks/useCompanion';

interface Props {
  companion: ReturnType<typeof useCompanion>;
}

export default function LibraryView({ companion }: Props) {
  const { setView, setSelectedGame, myGameIds, addMyGame, removeMyGame } = useStore();
  const [search, setSearch] = useState('');
  const [genre, setGenre] = useState('All');
  const [scanning, setScanning] = useState(false);
  const [steamDetected, setSteamDetected] = useState<string[]>([]);
  const [scanDone, setScanDone] = useState(false);
  const installedIds = new Set(companion.installed.map(i => i.gameId));

  const scanSteam = useCallback(async () => {
    setScanning(true);
    try {
      const res = await fetch('/api/steam-library');
      const data = await res.json();
      if (data.ok && data.games) {
        const detectedIds: string[] = [];
        for (const { appId } of data.games) {
          const match = GAMES.find(g => g.steamAppId === appId);
          if (match) detectedIds.push(match.id);
        }
        setSteamDetected(detectedIds);
        // Auto-add them all
        for (const id of detectedIds) addMyGame(id);
      }
    } catch {
      // Server not local (Render deploy) — silently skip
    }
    setScanDone(true);
    setScanning(false);
  }, [addMyGame]);

  const filtered = GAMES.filter(g => {
    const matchesSearch = g.name.toLowerCase().includes(search.toLowerCase());
    const matchesGenre = genre === 'All' || g.genre === genre;
    return matchesSearch && matchesGenre;
  });

  function openTrainer(id: string) {
    setSelectedGame(id);
    setView('trainer');
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-6 flex-shrink-0" style={{ borderBottom: '1px solid rgba(255,107,0,0.1)' }}>
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-white">📖 Grimoire</h1>
          <div className="flex items-center gap-2">
            <div className="text-sm" style={{ color: 'rgba(255,107,0,0.45)' }}>{GAMES.length} trainers</div>
            <button
              onClick={scanSteam}
              disabled={scanning}
              className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg transition-all disabled:opacity-50"
              style={{ background: scanning ? 'rgba(255,107,0,0.12)' : '#FF6B00', color: scanning ? '#FF8C42' : '#000' }}
            >
              {scanning ? '⟳ Scanning…' : '🔍 Scan Steam'}
            </button>
          </div>
        </div>

        {/* Steam scan result banner */}
        {scanDone && (
          <div className="mb-3 rounded-xl px-4 py-3 flex items-center gap-3 text-sm" style={{
            background: steamDetected.length > 0 ? 'rgba(255,107,0,0.08)' : 'rgba(255,255,255,0.04)',
            border: `1px solid ${steamDetected.length > 0 ? 'rgba(255,107,0,0.25)' : 'rgba(255,255,255,0.08)'}`,
          }}>
            <span className="text-lg">{steamDetected.length > 0 ? '🎮' : '🕸️'}</span>
            <span style={{ color: steamDetected.length > 0 ? '#FF8C42' : 'rgba(255,255,255,0.35)' }}>
              {steamDetected.length > 0
                ? `Found ${steamDetected.length} game${steamDetected.length !== 1 ? 's' : ''} from your Steam library — added to your sidebar`
                : 'No matching games found in your Steam library'}
            </span>
            <button onClick={() => setScanDone(false)} className="ml-auto text-white/20 hover:text-white/50 text-xs">✕</button>
          </div>
        )}
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search the grimoire..."
          className="w-full rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none transition-all"
          style={{
            background: 'rgba(255,107,0,0.06)',
            border: '1px solid rgba(255,107,0,0.15)',
            color: 'white',
          }}
        />

        {/* Genre filter chips */}
        <div className="flex gap-2 mt-3 flex-wrap">
          {GENRES.map(g => (
            <button
              key={g}
              onClick={() => setGenre(g)}
              className="text-xs px-3 py-1 rounded-full transition-all"
              style={genre === g ? {
                background: '#FF6B00',
                color: '#000',
                fontWeight: 600,
              } : {
                background: 'rgba(255,107,0,0.08)',
                border: '1px solid rgba(255,107,0,0.15)',
                color: 'rgba(255,140,66,0.6)',
              }}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      {/* Installed section */}
      {companion.installed.length > 0 && !search && genre === 'All' && (
        <div className="px-6 pt-4 flex-shrink-0">
          <div className="text-[10px] font-semibold uppercase tracking-widest mb-2" style={{ color: 'rgba(255,107,0,0.4)' }}>
            🕷️ Detected on your PC ({companion.installed.length})
          </div>
          <div className="flex flex-wrap gap-2">
            {companion.installed.map(inst => {
              const game = GAMES.find(g => g.id === inst.gameId);
              if (!game) return null;
              return (
                <button
                  key={inst.gameId}
                  onClick={() => openTrainer(inst.gameId)}
                  className="flex items-center gap-2 rounded-full px-3 py-1.5 transition-all"
                  style={{
                    background: 'rgba(255,107,0,0.08)',
                    border: '1px solid rgba(255,107,0,0.25)',
                  }}
                >
                  <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#FF6B00' }} />
                  <span className="text-xs font-medium" style={{ color: '#FF8C42' }}>{game.name}</span>
                </button>
              );
            })}
          </div>
          <div className="h-px mt-4" style={{ background: 'rgba(255,107,0,0.08)' }} />
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
                className="flex items-center gap-3 rounded-xl p-3 transition-all group"
                style={{
                  background: '#110800',
                  border: '1px solid rgba(255,107,0,0.07)',
                }}
              >
                <img
                  src={game.coverUrl}
                  alt={game.name}
                  className="w-12 h-12 rounded-lg object-cover flex-shrink-0 cursor-pointer"
                  onClick={() => openTrainer(game.id)}
                />
                <div className="flex-1 min-w-0 cursor-pointer" onClick={() => openTrainer(game.id)}>
                  <div className="text-white text-sm font-medium">{game.name}</div>
                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    <span
                      className="text-[10px] px-1.5 py-0.5 rounded"
                      style={{ background: 'rgba(255,107,0,0.1)', color: 'rgba(255,140,66,0.7)' }}
                    >
                      {game.genre}
                    </span>
                    <span className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>{game.cheats.length} cheats</span>
                    <span className="text-xs" style={{ color: 'rgba(255,255,255,0.15)' }}>·</span>
                    <span className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>⭐ {game.rating}</span>
                    <span className="text-xs" style={{ color: 'rgba(255,255,255,0.15)' }}>·</span>
                    <span className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>👥 {game.players}</span>
                    {installed && (
                      <>
                        <span className="text-xs" style={{ color: 'rgba(255,255,255,0.15)' }}>·</span>
                        <span className="text-xs" style={{ color: '#FF8C42' }}>🔥 Installed</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => inMyGames ? removeMyGame(game.id) : addMyGame(game.id)}
                    className="text-xs px-2.5 py-1.5 rounded-lg transition-all"
                    style={inMyGames ? {
                      background: 'rgba(255,255,255,0.08)',
                      color: 'rgba(255,255,255,0.35)',
                    } : {
                      background: 'rgba(255,107,0,0.06)',
                      color: 'rgba(255,140,66,0.5)',
                    }}
                  >
                    {inMyGames ? '✓ Added' : '+ Add'}
                  </button>
                  <button
                    onClick={() => openTrainer(game.id)}
                    className="text-xs font-medium px-3 py-1.5 rounded-lg transition-all"
                    style={{
                      background: 'rgba(255,107,0,0.12)',
                      color: '#FF8C42',
                    }}
                  >
                    Open →
                  </button>
                </div>
              </div>
            );
          })}

          {filtered.length === 0 && (
            <div className="text-center py-16" style={{ color: 'rgba(255,255,255,0.25)' }}>
              <div className="text-3xl mb-2">🕸️</div>
              <div className="text-sm">No trainers found{search ? ` for "${search}"` : ` in ${genre}`}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
