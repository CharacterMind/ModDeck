'use client';

import { useStore } from '@/lib/store';
import { GAMES, getFeaturedGames, GENRES } from '@/data/games';
import { useCompanion } from '@/hooks/useCompanion';

interface Props {
  companion: ReturnType<typeof useCompanion>;
}

const TOTAL_PLAYERS = GAMES.reduce((sum, g) => {
  const n = parseFloat(g.players.replace('K', '').replace('M', ''));
  const mult = g.players.includes('M') ? 1000 : 1;
  return sum + n * mult;
}, 0);

const PLAYER_COUNT_LABEL = TOTAL_PLAYERS >= 1000
  ? `${(TOTAL_PLAYERS / 1000).toFixed(1)}M`
  : `${Math.round(TOTAL_PLAYERS)}K`;

export default function HomeView({ companion }: Props) {
  const { user, myGameIds, setView, setSelectedGame } = useStore();
  const installedIds = new Set(companion.installed.map(i => i.gameId));

  const myGames = GAMES.filter(g => myGameIds.includes(g.id));
  const featured = getFeaturedGames();
  const popularGames = GAMES.filter(g => !g.featured).slice(0, 8);

  function openTrainer(id: string) {
    setSelectedGame(id);
    setView('trainer');
  }

  return (
    <div className="h-full overflow-y-auto">
      {/* Hero */}
      <div className="relative h-52 overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(135deg, rgba(255,107,0,0.15) 0%, transparent 50%, rgba(155,89,182,0.12) 100%)',
          }}
        />
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: 'radial-gradient(circle at 20% 80%, rgba(255,107,0,0.4) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(155,89,182,0.3) 0%, transparent 50%)',
          }}
        />
        <div className="relative z-10 p-8 flex flex-col justify-end h-full">
          {user ? (
            <>
              <div className="text-sm mb-1" style={{ color: 'rgba(255,140,66,0.6)' }}>Welcome back, haunter</div>
              <h1 className="text-3xl font-black text-white">{user.name} 🎃</h1>
              <div className="flex items-center gap-3 mt-2">
                <div
                  className="flex items-center gap-1.5 rounded-full px-3 py-1"
                  style={{ background: 'rgba(255,107,0,0.15)', border: '1px solid rgba(255,107,0,0.25)' }}
                >
                  <span className="text-sm">🍬</span>
                  <span className="text-sm font-semibold" style={{ color: '#FF8C42' }}>{user.deckPoints} DP</span>
                </div>
                {user.plan === 'pro' ? (
                  <div
                    className="flex items-center gap-1.5 rounded-full px-3 py-1"
                    style={{ background: 'rgba(255,107,0,0.15)', border: '1px solid rgba(255,107,0,0.25)' }}
                  >
                    <span className="text-sm">💀</span>
                    <span className="text-sm font-semibold" style={{ color: '#FF8C42' }}>Coven</span>
                  </div>
                ) : (
                  <button
                    onClick={() => setView('pro')}
                    className="flex items-center gap-1.5 rounded-full px-3 py-1 transition-all"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
                  >
                    <span className="text-sm">💀</span>
                    <span className="text-sm" style={{ color: 'rgba(255,255,255,0.45)' }}>Join the Coven</span>
                  </button>
                )}
              </div>
            </>
          ) : (
            <h1 className="text-3xl font-black text-white">What are you haunting tonight? 🎃</h1>
          )}
        </div>
      </div>

      {/* Stats bar */}
      <div
        className="flex items-center gap-0"
        style={{ borderBottom: '1px solid rgba(255,107,0,0.08)', background: 'rgba(255,107,0,0.03)' }}
      >
        {[
          { label: 'Trainers', value: GAMES.length.toString() },
          { label: 'Active players', value: PLAYER_COUNT_LABEL },
          { label: 'Avg rating', value: '4.7 ⭐' },
          { label: 'Free cheats', value: `${GAMES.reduce((s, g) => s + g.cheats.filter(c => !c.proOnly).length, 0)}+` },
        ].map(({ label, value }, i) => (
          <div
            key={label}
            className="flex-1 flex flex-col items-center py-3 px-2 text-center"
            style={{ borderRight: i < 3 ? '1px solid rgba(255,107,0,0.06)' : 'none' }}
          >
            <div className="text-base font-black" style={{ color: '#FF8C42' }}>{value}</div>
            <div className="text-[10px] mt-0.5" style={{ color: 'rgba(255,255,255,0.3)' }}>{label}</div>
          </div>
        ))}
      </div>

      <div className="p-6 space-y-8">
        {/* My Games */}
        {myGames.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold uppercase tracking-widest" style={{ color: 'rgba(255,107,0,0.55)' }}>🦇 My Haunted Games</h2>
              <button onClick={() => setView('library')} className="text-xs transition-colors" style={{ color: 'rgba(255,255,255,0.3)' }}>
                View all →
              </button>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-3">
              {myGames.map(game => {
                const installed = installedIds.has(game.id);
                return (
                  <button
                    key={game.id}
                    onClick={() => openTrainer(game.id)}
                    className="group relative aspect-[2/3] rounded-xl overflow-hidden transition-all hover:scale-[1.02]"
                    style={{
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,107,0,0.1)',
                    }}
                  >
                    <img
                      src={game.coverUrl}
                      alt={game.name}
                      className="w-full h-full object-cover"
                      onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.85), transparent)' }} />
                    <div className="absolute bottom-0 left-0 right-0 p-2 translate-y-full group-hover:translate-y-0 transition-transform">
                      <div className="text-white text-xs font-semibold truncate">{game.name}</div>
                      <div className="text-xs" style={{ color: 'rgba(255,255,255,0.55)' }}>{game.cheats.length} cheats</div>
                    </div>
                    {installed && (
                      <div
                        className="absolute top-2 right-2 w-2 h-2 rounded-full"
                        style={{ background: '#FF6B00', boxShadow: '0 0 6px rgba(255,107,0,0.8)' }}
                        title="Installed"
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {/* Companion status card */}
        {!companion.isOnline && (
          <div
            className="rounded-2xl p-5 flex items-center gap-4"
            style={{ background: '#140a00', border: '1px solid rgba(255,107,0,0.15)' }}
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
              style={{ background: 'rgba(255,107,0,0.1)' }}
            >
              👻
            </div>
            <div className="flex-1">
              <div className="text-white font-semibold text-sm">Companion is dormant</div>
              <div className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>
                Run <span className="font-mono" style={{ color: 'rgba(255,140,66,0.7)' }}>Start ModDeck Companion.bat</span> to summon real-time cheats
              </div>
            </div>
            <div className="w-2 h-2 rounded-full" style={{ background: 'rgba(255,255,255,0.2)' }} />
          </div>
        )}

        {/* Featured trainers — cover grid */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold uppercase tracking-widest" style={{ color: 'rgba(255,107,0,0.55)' }}>🎃 Featured Trainers</h2>
            <button onClick={() => setView('library')} className="text-xs transition-colors" style={{ color: 'rgba(255,255,255,0.3)' }}>
              Browse all →
            </button>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3">
            {featured.map(game => {
              const installed = installedIds.has(game.id);
              return (
                <button
                  key={game.id}
                  onClick={() => openTrainer(game.id)}
                  className="group relative aspect-[2/3] rounded-xl overflow-hidden transition-all hover:scale-[1.02]"
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,107,0,0.1)',
                  }}
                >
                  <img
                    src={game.coverUrl}
                    alt={game.name}
                    className="w-full h-full object-cover"
                    onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.9), transparent 60%)' }}
                  />
                  <div className="absolute bottom-0 left-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="text-white text-[10px] font-semibold leading-tight truncate">{game.name}</div>
                    <div className="text-[9px] mt-0.5" style={{ color: 'rgba(255,140,66,0.8)' }}>
                      {game.cheats.length} cheats · ⭐{game.rating}
                    </div>
                  </div>
                  {installed && (
                    <div
                      className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full"
                      style={{ background: '#FF6B00', boxShadow: '0 0 5px rgba(255,107,0,0.9)' }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </section>

        {/* Popular games — list style */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold uppercase tracking-widest" style={{ color: 'rgba(255,107,0,0.55)' }}>💀 Popular Trainers</h2>
            <button onClick={() => setView('library')} className="text-xs transition-colors" style={{ color: 'rgba(255,255,255,0.3)' }}>
              View all →
            </button>
          </div>
          <div className="space-y-1.5">
            {popularGames.map((game, idx) => {
              const installed = installedIds.has(game.id);
              return (
                <button
                  key={game.id}
                  onClick={() => openTrainer(game.id)}
                  className="w-full flex items-center gap-3 rounded-xl p-3 transition-all text-left"
                  style={{
                    background: '#110800',
                    border: '1px solid rgba(255,107,0,0.07)',
                  }}
                >
                  <div className="text-xs w-5 text-center font-bold" style={{ color: 'rgba(255,107,0,0.3)' }}>
                    {idx + 1}
                  </div>
                  <img
                    src={game.coverUrl}
                    alt={game.name}
                    className="w-9 h-9 rounded-lg object-cover flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-white text-sm font-medium truncate">{game.name}</div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>{game.cheats.length} cheats</span>
                      <span className="text-xs" style={{ color: 'rgba(255,255,255,0.15)' }}>·</span>
                      <span
                        className="text-[10px] px-1.5 py-0.5 rounded"
                        style={{ background: 'rgba(255,107,0,0.08)', color: 'rgba(255,140,66,0.6)' }}
                      >
                        {game.genre}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-0.5">
                    <div className="text-xs" style={{ color: 'rgba(255,140,66,0.7)' }}>⭐ {game.rating}</div>
                    <div className="text-[10px]" style={{ color: 'rgba(255,255,255,0.25)' }}>👥 {game.players}</div>
                    {installed && (
                      <div className="w-1.5 h-1.5 rounded-full mt-0.5" style={{ background: '#FF6B00' }} />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* Genre quick-nav */}
        <section>
          <h2 className="text-sm font-semibold uppercase tracking-widest mb-3" style={{ color: 'rgba(255,107,0,0.55)' }}>🔮 Browse by Genre</h2>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {GENRES.filter(g => g !== 'All').map(g => {
              const count = GAMES.filter(game => game.genre === g).length;
              const emoji: Record<string, string> = {
                RPG: '⚔️', Action: '💥', Simulation: '🏗️', Survival: '🌿',
                Strategy: '♟️', Adventure: '🗺️', 'Co-op': '🤝',
              };
              return (
                <button
                  key={g}
                  onClick={() => { setView('library'); }}
                  className="rounded-xl p-3 text-left transition-all"
                  style={{
                    background: '#110800',
                    border: '1px solid rgba(255,107,0,0.08)',
                  }}
                >
                  <div className="text-lg mb-1">{emoji[g] ?? '🎮'}</div>
                  <div className="text-white text-xs font-semibold">{g}</div>
                  <div className="text-[10px] mt-0.5" style={{ color: 'rgba(255,255,255,0.3)' }}>{count} trainers</div>
                </button>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
