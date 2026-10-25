'use client';

import { useStore } from '@/lib/store';
import { GAMES, STEAM_ID_MAP } from '@/data/games';
import { useCompanion } from '@/hooks/useCompanion';

interface Props {
  companion: ReturnType<typeof useCompanion>;
}

const A = '#7c5cfc';
const A_DIM = 'rgba(124,92,252,0.15)';
const BORDER = 'rgba(124,92,252,0.1)';

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
    <aside style={{ width: '176px', flexShrink: 0, display: 'flex', flexDirection: 'column', background: '#0d0d12', borderRight: `1px solid ${BORDER}` }}>
      {/* Logo */}
      <div style={{ padding: '16px', borderBottom: `1px solid ${BORDER}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: A, boxShadow: `0 0 12px rgba(124,92,252,0.4)`, flexShrink: 0 }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 1L14 4.5V11.5L8 15L2 11.5V4.5L8 1Z" stroke="white" strokeWidth="1.5" fill="none"/>
              <circle cx="8" cy="8" r="2.5" fill="white"/>
            </svg>
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '13px', lineHeight: 1, color: 'white', letterSpacing: '0.05em' }}>MODDECK</div>
            <div style={{ fontSize: '10px', lineHeight: 1, marginTop: '3px', color: 'rgba(255,255,255,0.3)' }}>Game Trainers</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ padding: '8px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
        <button
          onClick={() => setView('trainer')}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: '10px',
            padding: '8px 10px', borderRadius: '8px', border: 'none', cursor: 'pointer',
            fontSize: '13px', fontWeight: 500, textAlign: 'left',
            background: view === 'trainer' ? A_DIM : 'transparent',
            color: view === 'trainer' ? A : 'rgba(255,255,255,0.45)',
            boxShadow: view === 'trainer' ? `inset 0 0 0 1px ${A}30` : 'none',
          }}
        >
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none" style={{ flexShrink: 0 }}>
            <rect x="1" y="1" width="13" height="13" rx="2" stroke="currentColor" strokeWidth="1.3" fill="none"/>
            <circle cx="7.5" cy="7.5" r="2.5" fill="currentColor"/>
          </svg>
          <span>Trainers</span>
        </button>
      </nav>

      <div style={{ margin: '0 12px', height: '1px', background: BORDER }} />

      {/* Game list */}
      <div style={{ flex: 1, padding: '0 8px 8px', overflowY: 'auto', marginTop: '6px' }}>
        <div style={{ padding: '6px 8px', fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.25)' }}>
          Games ({catalogGames.length})
        </div>
        {catalogGames.map(game => {
          const isSelected = selectedGameId === game.id;
          return (
            <button
              key={game.id}
              onClick={() => setSelectedGame(game.id)}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: '10px',
                padding: '6px 8px', borderRadius: '7px', border: 'none', cursor: 'pointer',
                background: isSelected ? A_DIM : 'transparent',
                marginBottom: '2px',
                boxShadow: isSelected ? `inset 0 0 0 1px ${A}25` : 'none',
              }}
            >
              <div style={{ width: '28px', height: '28px', borderRadius: '5px', overflow: 'hidden', flexShrink: 0, background: 'rgba(255,255,255,0.05)' }}>
                <img src={game.coverUrl} alt={game.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <span style={{ fontSize: '12px', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: isSelected ? A : 'rgba(255,255,255,0.55)', flex: 1, textAlign: 'left' }}>
                {game.name}
              </span>
              {steamScanDone && game.installed && (
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', flexShrink: 0, background: '#00c94f' }} />
              )}
            </button>
          );
        })}
      </div>

      {/* Settings */}
      <div style={{ borderTop: `1px solid ${BORDER}`, padding: '8px' }}>
        <button
          onClick={() => setView('settings')}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: '10px',
            padding: '8px 10px', borderRadius: '8px', border: 'none', cursor: 'pointer',
            fontSize: '13px', fontWeight: 500, textAlign: 'left',
            background: view === 'settings' ? A_DIM : 'transparent',
            color: view === 'settings' ? A : 'rgba(255,255,255,0.4)',
          }}
        >
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none" style={{ flexShrink: 0 }}>
            <circle cx="7.5" cy="7.5" r="6" stroke="currentColor" strokeWidth="1.3"/>
            <circle cx="7.5" cy="7.5" r="2" fill="currentColor"/>
          </svg>
          <span>Settings</span>
        </button>
      </div>
    </aside>
  );
}
