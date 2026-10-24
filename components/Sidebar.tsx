'use client';

import { useStore } from '@/lib/store';
import { GAMES } from '@/data/games';
import { useCompanion } from '@/hooks/useCompanion';
import Image from 'next/image';

const NAV = [
  { id: 'home', label: 'Mods', icon: '⚡' },
  { id: 'library', label: 'Library', icon: '📚' },
  { id: 'pulse', label: 'Pulse', icon: '📡', badge: 'NEW' },
];

interface Props {
  companion: ReturnType<typeof useCompanion>;
}

export default function Sidebar({ companion }: Props) {
  const { view, setView, selectedGameId, setSelectedGame, myGameIds, user } = useStore();

  const myGames = GAMES.filter(g => myGameIds.includes(g.id));
  const installedIds = new Set(companion.installed.map(i => i.gameId));

  function selectGame(id: string) {
    setSelectedGame(id);
    setView('trainer');
  }

  return (
    <aside className="w-[160px] flex-shrink-0 bg-[#111111] border-r border-white/5 flex flex-col select-none">
      {/* Logo */}
      <div className="px-4 py-4 border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-amber-400 rounded-md flex items-center justify-center text-black font-black text-xs">MD</div>
          <div>
            <div className="text-white font-bold text-sm leading-none">MODDECK</div>
            <div className="text-white/30 text-[10px] leading-none mt-0.5">Trainers & Mods for PC</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="p-2 space-y-0.5">
        {NAV.map(item => (
          <button
            key={item.id}
            onClick={() => setView(item.id as any)}
            className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md text-sm transition-colors ${
              view === item.id
                ? 'bg-white/10 text-white'
                : 'text-white/50 hover:text-white hover:bg-white/5'
            }`}
          >
            <span className="text-base leading-none">{item.icon}</span>
            <span className="font-medium">{item.label}</span>
            {item.badge && (
              <span className="ml-auto text-[9px] font-bold bg-amber-400 text-black px-1.5 py-0.5 rounded-full">
                {item.badge}
              </span>
            )}
          </button>
        ))}

        {/* AI button */}
        <button
          onClick={() => setView('ai' as any)}
          className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md text-sm transition-colors ${
            view === 'ai'
              ? 'bg-white/10 text-white'
              : 'text-white/50 hover:text-white hover:bg-white/5'
          }`}
        >
          <span className="text-base leading-none">🤖</span>
          <span className="font-medium">Mod AI</span>
          <span className="ml-auto text-[9px] font-bold bg-purple-500 text-white px-1.5 py-0.5 rounded-full">BETA</span>
        </button>

        {/* Pro button */}
        {user?.plan !== 'pro' && (
          <button
            onClick={() => setView('pro')}
            className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md text-sm transition-colors ${
              view === 'pro'
                ? 'bg-amber-400/20 text-amber-400'
                : 'text-amber-400/70 hover:text-amber-400 hover:bg-amber-400/10'
            }`}
          >
            <span className="text-base leading-none">👑</span>
            <span className="font-medium">ModDeck Pro</span>
          </button>
        )}
      </nav>

      <div className="px-3 py-2">
        <div className="h-px bg-white/5" />
      </div>

      {/* My Games */}
      <div className="flex-1 overflow-y-auto px-2 pb-2">
        <div className="px-2 py-1.5 text-[10px] font-semibold text-white/30 uppercase tracking-widest">
          My Games ({myGames.length})
        </div>
        <div className="space-y-0.5">
          {myGames.map(game => {
            const isInstalled = installedIds.has(game.id);
            const isActive = selectedGameId === game.id && view === 'trainer';
            return (
              <button
                key={game.id}
                onClick={() => selectGame(game.id)}
                className={`w-full flex items-center gap-2.5 px-2 py-1.5 rounded-md transition-colors group ${
                  isActive ? 'bg-white/10' : 'hover:bg-white/5'
                }`}
              >
                {/* Game icon */}
                <div className="w-6 h-6 rounded overflow-hidden flex-shrink-0 bg-white/5">
                  <img
                    src={game.coverUrl}
                    alt={game.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
                <span className={`text-xs font-medium truncate ${isActive ? 'text-white' : 'text-white/60 group-hover:text-white/90'}`}>
                  {game.name}
                </span>
                {isInstalled && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" title="Installed" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom: Settings + User */}
      <div className="border-t border-white/5 p-2 space-y-0.5">
        <button
          onClick={() => setView('settings')}
          className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md text-sm transition-colors ${
            view === 'settings'
              ? 'bg-white/10 text-white'
              : 'text-white/50 hover:text-white hover:bg-white/5'
          }`}
        >
          <span className="text-base leading-none">⚙️</span>
          <span className="font-medium">Settings</span>
        </button>

        {/* User chip */}
        {user && (
          <button
            onClick={() => setView('settings')}
            className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-white/5 transition-colors"
          >
            <div className="w-6 h-6 rounded-full bg-amber-400 flex items-center justify-center text-black font-bold text-[10px] flex-shrink-0">
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover rounded-full" />
              ) : (
                user.name.charAt(0).toUpperCase()
              )}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-medium text-white/80 truncate">{user.name}</div>
              <div className="text-[10px] text-white/30 truncate">{user.email || (user.plan === 'pro' ? '👑 Pro' : 'Free')}</div>
            </div>
          </button>
        )}
      </div>
    </aside>
  );
}
