'use client';

import { useStore } from '@/lib/store';
import { GAMES } from '@/data/games';
import { useCompanion } from '@/hooks/useCompanion';

interface Props {
  companion: ReturnType<typeof useCompanion>;
}

export default function HomeView({ companion }: Props) {
  const { user, myGameIds, setView, setSelectedGame } = useStore();
  const installedIds = new Set(companion.installed.map(i => i.gameId));

  const myGames = GAMES.filter(g => myGameIds.includes(g.id));
  const featuredGames = GAMES.slice(0, 6);

  function openTrainer(id: string) {
    setSelectedGame(id);
    setView('trainer');
  }

  return (
    <div className="h-full overflow-y-auto">
      {/* Hero */}
      <div className="relative h-48 overflow-hidden">
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
        <div className="relative z-10 p-8 flex items-end h-full">
          <div>
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
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
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
                      onError={e => { (e.target as HTMLImageElement).src = ''; }}
                    />
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.85), transparent)' }} />
                    <div className="absolute bottom-0 left-0 right-0 p-2 translate-y-full group-hover:translate-y-0 transition-transform">
                      <div className="text-white text-xs font-semibold truncate">{game.name}</div>
                      <div className="text-xs" style={{ color: 'rgba(255,255,255,0.55)' }}>{game.cheats.length} spells</div>
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

        {/* Featured games */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold uppercase tracking-widest" style={{ color: 'rgba(255,107,0,0.55)' }}>💀 Cursed Trainers</h2>
            <button onClick={() => setView('library')} className="text-xs transition-colors" style={{ color: 'rgba(255,255,255,0.3)' }}>
              Browse all →
            </button>
          </div>
          <div className="space-y-2">
            {featuredGames.map(game => {
              const installed = installedIds.has(game.id);
              return (
                <button
                  key={game.id}
                  onClick={() => openTrainer(game.id)}
                  className="w-full flex items-center gap-3 rounded-xl p-3 transition-all text-left group"
                  style={{
                    background: '#110800',
                    border: '1px solid rgba(255,107,0,0.08)',
                  }}
                >
                  <img
                    src={game.coverUrl}
                    alt={game.name}
                    className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-white text-sm font-medium truncate">{game.name}</div>
                    <div className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>{game.cheats.length} spells · {game.platform}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    {installed && (
                      <span
                        className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                        style={{ background: 'rgba(255,107,0,0.12)', color: '#FF8C42' }}
                      >
                        Installed
                      </span>
                    )}
                    <span className="text-xs transition-colors" style={{ color: 'rgba(255,255,255,0.2)' }}>→</span>
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
