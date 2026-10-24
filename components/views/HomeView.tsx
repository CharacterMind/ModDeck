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
        <div className="absolute inset-0 bg-gradient-to-br from-amber-400/10 via-transparent to-purple-600/10" />
        <div className="relative z-10 p-8 flex items-end h-full">
          <div>
            {user ? (
              <>
                <div className="text-white/50 text-sm mb-1">Welcome back,</div>
                <h1 className="text-3xl font-black text-white">{user.name} 👋</h1>
                <div className="flex items-center gap-3 mt-2">
                  <div className="flex items-center gap-1.5 bg-amber-400/15 border border-amber-400/20 rounded-full px-3 py-1">
                    <span className="text-amber-400 text-sm">🪙</span>
                    <span className="text-amber-400 text-sm font-semibold">{user.deckPoints} DP</span>
                  </div>
                  {user.plan === 'pro' ? (
                    <div className="flex items-center gap-1.5 bg-amber-400/15 border border-amber-400/20 rounded-full px-3 py-1">
                      <span className="text-amber-400 text-sm">👑</span>
                      <span className="text-amber-400 text-sm font-semibold">Pro</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => setView('pro')}
                      className="flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-full px-3 py-1 hover:bg-amber-400/10 hover:border-amber-400/20 transition-colors"
                    >
                      <span className="text-white/50 text-sm">👑</span>
                      <span className="text-white/50 text-sm">Upgrade to Pro</span>
                    </button>
                  )}
                </div>
              </>
            ) : (
              <h1 className="text-3xl font-black text-white">What are you modding today?</h1>
            )}
          </div>
        </div>
      </div>

      <div className="p-6 space-y-8">
        {/* My Games */}
        {myGames.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-white/60 uppercase tracking-widest">My Games</h2>
              <button onClick={() => setView('library')} className="text-xs text-white/30 hover:text-white/60 transition-colors">
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
                    className="group relative aspect-[2/3] rounded-xl overflow-hidden bg-white/5 border border-white/5 hover:border-white/20 transition-all hover:scale-[1.02]"
                  >
                    <img
                      src={game.coverUrl}
                      alt={game.name}
                      className="w-full h-full object-cover"
                      onError={e => { (e.target as HTMLImageElement).src = ''; }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="absolute bottom-0 left-0 right-0 p-2 translate-y-full group-hover:translate-y-0 transition-transform">
                      <div className="text-white text-xs font-semibold truncate">{game.name}</div>
                      <div className="text-white/60 text-[10px]">{game.cheats.length} cheats</div>
                    </div>
                    {installed && (
                      <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-emerald-400" title="Installed" />
                    )}
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {/* Companion status card */}
        {!companion.isOnline && (
          <div className="bg-[#161616] border border-white/5 rounded-2xl p-5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-xl flex-shrink-0">🔌</div>
            <div className="flex-1">
              <div className="text-white font-semibold text-sm">Start the ModDeck Companion</div>
              <div className="text-white/40 text-xs mt-0.5">
                Run <span className="font-mono text-white/60">Start ModDeck Companion.bat</span> to enable real game launching & cheats
              </div>
            </div>
            <div className="w-2 h-2 rounded-full bg-white/20 flex-shrink-0" />
          </div>
        )}

        {/* Featured games */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-white/60 uppercase tracking-widest">Popular Trainers</h2>
            <button onClick={() => setView('library')} className="text-xs text-white/30 hover:text-white/60 transition-colors">
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
                  className="w-full flex items-center gap-3 bg-[#141414] hover:bg-[#1a1a1a] border border-white/5 hover:border-white/10 rounded-xl p-3 transition-all text-left group"
                >
                  <img
                    src={game.coverUrl}
                    alt={game.name}
                    className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-white text-sm font-medium truncate">{game.name}</div>
                    <div className="text-white/30 text-xs">{game.cheats.length} cheats · {game.platform}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    {installed && (
                      <span className="text-[10px] bg-emerald-400/10 text-emerald-400 px-2 py-0.5 rounded-full font-medium">Installed</span>
                    )}
                    <span className="text-white/20 group-hover:text-white/50 transition-colors text-xs">→</span>
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
