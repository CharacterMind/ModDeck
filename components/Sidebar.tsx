'use client';

import { useStore } from '@/lib/store';
import { GAMES, STEAM_ID_MAP } from '@/data/games';
import { useCompanion } from '@/hooks/useCompanion';

interface Props {
  companion: ReturnType<typeof useCompanion>;
}

export default function Sidebar({ companion }: Props) {
  const { view, setView, setSelectedGame, selectedGameId, steamGames, steamScanDone } = useStore();

  const installedSupportedIds = new Set(
    steamGames
      .filter(sg => STEAM_ID_MAP[sg.appId])
      .map(sg => STEAM_ID_MAP[sg.appId])
  );

  const catalogGames = GAMES.map(g => ({
    ...g,
    installed: installedSupportedIds.has(g.id),
  }));

  return (
    <aside style={{ width: '160px', flexShrink: 0, display: 'flex', flexDirection: 'column', background: '#0f0800', borderRight: '1px solid rgba(255,107,0,0.12)' }}>
      {/* Logo */}
      <div style={{ padding: '16px', borderBottom: '1px solid rgba(255,107,0,0.12)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '28px', height: '28px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 900, background: '#FF6B00', color: '#000', boxShadow: '0 0 10px rgba(255,107,0,0.5)' }}>
            🎃
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '14px', lineHeight: 1, color: '#FF8C42' }}>MODDECK</div>
            <div style={{ fontSize: '10px', lineHeight: 1, marginTop: '2px', color: 'rgba(255,107,0,0.4)' }}>Game Trainers</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ padding: '8px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
        <button
          onClick={() => setView('trainer')}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: '10px',
            padding: '8px 10px', borderRadius: '6px', border: 'none', cursor: 'pointer',
            fontSize: '14px', fontWeight: 500, textAlign: 'left',
            background: view === 'trainer' ? 'rgba(255,107,0,0.15)' : 'transparent',
            color: view === 'trainer' ? '#FF8C42' : 'rgba(255,255,255,0.45)',
            boxShadow: view === 'trainer' ? 'inset 0 0 8px rgba(255,107,0,0.1)' : 'none',
          }}
        >
          <span style={{ fontSize: '16px', lineHeight: 1 }}>🎮</span>
          <span>Trainers</span>
        </button>
      </nav>

      <div style={{ padding: '4px 12px' }}>
        <div style={{ height: '1px', background: 'rgba(255,107,0,0.08)' }} />
      </div>

      {/* Game list */}
      <div style={{ flex: 1, padding: '0 8px 8px' }}>
        <div style={{ padding: '6px 8px', fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,107,0,0.4)' }}>
          🦇 Haunted ({catalogGames.length})
        </div>
        {catalogGames.map(game => {
          const isSelected = selectedGameId === game.id;
          return (
            <button
              key={game.id}
              onClick={() => setSelectedGame(game.id)}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: '10px',
                padding: '6px 8px', borderRadius: '6px', border: 'none', cursor: 'pointer',
                background: isSelected ? 'rgba(255,107,0,0.12)' : 'transparent',
                marginBottom: '2px',
              }}
            >
              <div style={{ width: '24px', height: '24px', borderRadius: '4px', overflow: 'hidden', flexShrink: 0, background: 'rgba(255,255,255,0.05)' }}>
                <img src={game.coverUrl} alt={game.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <span style={{ fontSize: '12px', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: isSelected ? '#FF8C42' : 'rgba(255,255,255,0.55)' }}>
                {game.name}
              </span>
              {steamScanDone && game.installed && (
                <div style={{ marginLeft: 'auto', width: '6px', height: '6px', borderRadius: '50%', flexShrink: 0, background: '#FF6B00' }} />
              )}
            </button>
          );
        })}
      </div>

      {/* Bottom: Settings */}
      <div style={{ borderTop: '1px solid rgba(255,107,0,0.12)', padding: '8px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
        <button
          onClick={() => setView('settings')}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: '10px',
            padding: '8px 10px', borderRadius: '6px', border: 'none', cursor: 'pointer',
            fontSize: '14px', fontWeight: 500, textAlign: 'left',
            background: view === 'settings' ? 'rgba(255,107,0,0.12)' : 'transparent',
            color: view === 'settings' ? '#FF8C42' : 'rgba(255,255,255,0.45)',
          }}
        >
          <span style={{ fontSize: '16px', lineHeight: 1 }}>🕷️</span>
          <span>Settings</span>
        </button>
      </div>
    </aside>
  );
}
