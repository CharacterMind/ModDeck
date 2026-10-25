'use client';

import { useStore } from '@/lib/store';
import { GAMES } from '@/data/games';
import { useCompanion } from '@/hooks/useCompanion';
import { CHANGELOG } from '@/data/changelog';

const NAV = [
  { id: 'home', label: 'Trainers', icon: '🎃' },
  { id: 'library', label: 'Grimoire', icon: '📖' },
  { id: 'pulse', label: 'Séance', icon: '🔮', badge: 'NEW' },
];

function getInitials(name: string): string {
  const words = name.trim().split(/\s+/);
  if (words.length > 1) {
    return words.slice(0, 2).map(w => w[0].toUpperCase()).join('');
  }
  const camelParts = name.replace(/([A-Z])/g, ' $1').trim().split(/\s+/);
  if (camelParts.length > 1) {
    return camelParts.slice(0, 2).map(w => w[0].toUpperCase()).join('');
  }
  return name.slice(0, Math.min(2, name.length)).toUpperCase();
}

interface Props {
  companion: ReturnType<typeof useCompanion>;
  onWhatsNew: () => void;
  hasUnreadWN?: boolean;
}

export default function Sidebar({ companion, onWhatsNew, hasUnreadWN }: Props) {
  const { view, setView, selectedGameId, setSelectedGame, myGameIds, user } = useStore();

  const myGames = GAMES.filter(g => myGameIds.includes(g.id));
  const installedIds = new Set(companion.installed.map(i => i.gameId));

  function selectGame(id: string) {
    setSelectedGame(id);
    setView('trainer');
  }

  return (
    <aside className="w-[160px] flex-shrink-0 border-r flex flex-col select-none" style={{ width: '160px', flexShrink: 0, display: 'flex', flexDirection: 'column', background: '#0f0800', borderColor: 'rgba(255,107,0,0.12)', borderRightWidth: '1px', borderRightStyle: 'solid' }}>
      {/* Logo */}
      <div className="px-4 py-4 border-b" style={{ borderColor: 'rgba(255,107,0,0.12)' }}>
        <div className="flex items-center gap-2">
          <div
            className="w-7 h-7 rounded-md flex items-center justify-center text-sm font-black"
            style={{ background: '#FF6B00', color: '#000', boxShadow: '0 0 10px rgba(255,107,0,0.5)' }}
          >
            🎃
          </div>
          <div>
            <div className="font-bold text-sm leading-none" style={{ color: '#FF8C42' }}>MODDECK</div>
            <div className="text-[10px] leading-none mt-0.5" style={{ color: 'rgba(255,107,0,0.4)' }}>Spells &amp; Trainers</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="p-2 space-y-0.5">
        {NAV.map(item => (
          <button
            key={item.id}
            onClick={() => setView(item.id as any)}
            className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md text-sm transition-all"
            style={view === item.id ? {
              background: 'rgba(255,107,0,0.15)',
              color: '#FF8C42',
              boxShadow: 'inset 0 0 8px rgba(255,107,0,0.1)'
            } : {
              color: 'rgba(255,255,255,0.45)',
            }}
          >
            <span className="text-base leading-none">{item.icon}</span>
            <span className="font-medium">{item.label}</span>
            {item.badge && (
              <span className="ml-auto text-[9px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: '#FF6B00', color: '#000' }}>
                {item.badge}
              </span>
            )}
          </button>
        ))}

        {/* Mod AI */}
        <button
          onClick={() => setView('ai' as any)}
          className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md text-sm transition-all"
          style={view === 'ai' ? {
            background: 'rgba(155,89,182,0.2)',
            color: '#c084fc',
          } : {
            color: 'rgba(255,255,255,0.45)',
          }}
        >
          <span className="text-base leading-none">🧙</span>
          <span className="font-medium">Hex AI</span>
          <span className="ml-auto text-[9px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: '#9B59B6', color: '#fff' }}>BETA</span>
        </button>

        {/* Pro */}
        {user?.plan !== 'pro' && (
          <button
            onClick={() => setView('pro')}
            className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md text-sm transition-all"
            style={view === 'pro' ? {
              background: 'rgba(255,107,0,0.2)',
              color: '#FF8C42',
            } : {
              color: 'rgba(255,140,66,0.6)',
            }}
          >
            <span className="text-base leading-none">💀</span>
            <span className="font-medium">Coven Pro</span>
          </button>
        )}
      </nav>

      <div className="px-3 py-2">
        <div className="h-px" style={{ background: 'rgba(255,107,0,0.08)' }} />
      </div>

      {/* My Games */}
      <div className="flex-1 overflow-y-auto px-2 pb-2">
        <div className="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'rgba(255,107,0,0.4)' }}>
          🦇 Haunted Games ({myGames.length})
        </div>
        <div className="space-y-0.5">
          {myGames.map(game => {
            const isInstalled = installedIds.has(game.id);
            const isActive = selectedGameId === game.id && view === 'trainer';
            return (
              <button
                key={game.id}
                onClick={() => selectGame(game.id)}
                className="w-full flex items-center gap-2.5 px-2 py-1.5 rounded-md transition-all group"
                style={isActive ? { background: 'rgba(255,107,0,0.12)' } : {}}
              >
                <div className="w-6 h-6 rounded overflow-hidden flex-shrink-0" style={{ background: 'rgba(255,255,255,0.05)' }}>
                  <img
                    src={game.coverUrl}
                    alt={game.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
                <span className="text-xs font-medium truncate" style={{ color: isActive ? '#FF8C42' : 'rgba(255,255,255,0.55)' }}>
                  {game.name}
                </span>
                {isInstalled && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: '#FF6B00' }} title="Installed" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom: What's New + Settings + User */}
      <div className="border-t p-2 space-y-0.5" style={{ borderColor: 'rgba(255,107,0,0.12)' }}>
        <button
          onClick={onWhatsNew}
          className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md text-sm transition-all"
          style={{ color: 'rgba(255,255,255,0.45)' }}
        >
          <span className="text-base leading-none">🆕</span>
          <span className="font-medium">What&apos;s New</span>
          <span className="ml-auto flex items-center gap-1">
            {hasUnreadWN && (
              <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: '#e53030' }} />
            )}
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: '#FF6B00', color: '#000' }}>
              {CHANGELOG[0]?.version ?? 'V1'}
            </span>
          </span>
        </button>
        <button
          onClick={() => setView('settings')}
          className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md text-sm transition-all"
          style={view === 'settings' ? {
            background: 'rgba(255,107,0,0.12)',
            color: '#FF8C42',
          } : {
            color: 'rgba(255,255,255,0.45)',
          }}
        >
          <span className="text-base leading-none">🕷️</span>
          <span className="font-medium">Settings</span>
        </button>

        {user && (
          <button
            onClick={() => setView('settings')}
            className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md transition-all"
            style={{ ':hover': { background: 'rgba(255,107,0,0.08)' } } as any}
          >
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center font-bold text-[9px] flex-shrink-0"
              style={{ background: '#FF6B00', color: '#000', boxShadow: '0 0 8px rgba(255,107,0,0.5)' }}
            >
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover rounded-full" />
              ) : (
                getInitials(user.name)
              )}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-medium truncate" style={{ color: 'rgba(255,255,255,0.75)' }}>{user.name}</div>
              <div className="text-[10px] truncate" style={{ color: 'rgba(255,107,0,0.5)' }}>
                {user.email || (user.plan === 'pro' ? '💀 Coven' : 'Free')}
              </div>
            </div>
          </button>
        )}
      </div>
    </aside>
  );
}
