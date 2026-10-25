'use client';

import { useStore } from '@/lib/store';
import { GAMES, STEAM_ID_MAP } from '@/data/games';
import { useCompanion } from '@/hooks/useCompanion';

interface Props {
  companion: ReturnType<typeof useCompanion>;
}

const BG = '#0d0d10';
const BORDER = 'rgba(255,255,255,0.06)';

function NavBtn({ icon, label, active, onClick }: { icon: React.ReactNode; label: string; active?: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      title={label}
      style={{
        display: 'flex', alignItems: 'center', gap: '10px',
        width: '100%', padding: '7px 12px', borderRadius: '6px',
        border: 'none', cursor: 'pointer', textAlign: 'left',
        background: active ? 'rgba(255,255,255,0.07)' : 'transparent',
        color: active ? 'white' : 'rgba(255,255,255,0.45)',
        fontSize: '13px', fontWeight: active ? 600 : 400,
      }}
    >
      <span style={{ opacity: active ? 1 : 0.7, flexShrink: 0 }}>{icon}</span>
      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{label}</span>
    </button>
  );
}

export default function Sidebar({ companion }: Props) {
  const { view, setView, setSelectedGame, selectedGameId, steamGames, steamScanDone } = useStore();

  const installedSupportedIds = new Set(
    steamGames.filter(sg => STEAM_ID_MAP[sg.appId]).map(sg => STEAM_ID_MAP[sg.appId])
  );

  const catalogGames = GAMES.map(g => ({ ...g, installed: installedSupportedIds.has(g.id) }));

  return (
    <aside style={{ width: '158px', flexShrink: 0, display: 'flex', flexDirection: 'column', background: BG, borderRight: `1px solid ${BORDER}`, userSelect: 'none' }}>
      {/* Logo */}
      <div style={{ padding: '14px 14px 10px', borderBottom: `1px solid ${BORDER}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '26px', height: '26px', borderRadius: '6px', background: '#7c5cfc', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
              <polygon points="6.5,1 12,4.5 12,10 6.5,13 1,10 1,4.5" stroke="white" strokeWidth="1.2" fill="none"/>
              <circle cx="6.5" cy="7" r="2" fill="white"/>
            </svg>
          </div>
          <span style={{ fontWeight: 800, fontSize: '12px', letterSpacing: '0.08em', color: 'white' }}>MODDECK</span>
        </div>
      </div>

      {/* Top nav */}
      <nav style={{ padding: '8px 6px 4px' }}>
        <NavBtn
          icon={<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="1" y="1" width="5" height="5" rx="1" fill="currentColor" opacity=".7"/><rect x="8" y="1" width="5" height="5" rx="1" fill="currentColor" opacity=".7"/><rect x="1" y="8" width="5" height="5" rx="1" fill="currentColor" opacity=".7"/><rect x="8" y="8" width="5" height="5" rx="1" fill="currentColor" opacity=".7"/></svg>}
          label="Library"
          active={view === 'home'}
          onClick={() => setView('home')}
        />
        <NavBtn
          icon={<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1.5L8.5 5H12L9 7.5L10 11L7 9L4 11L5 7.5L2 5H5.5L7 1.5Z" fill="currentColor" opacity=".7"/></svg>}
          label="ModDeck Pro"
          onClick={() => {}}
        />
      </nav>

      <div style={{ margin: '2px 10px', height: '1px', background: BORDER }} />

      {/* My Games */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ padding: '8px 14px 4px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.28)' }}>
            My Games {catalogGames.length}
          </span>
          <button style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.28)', cursor: 'pointer', fontSize: '16px', lineHeight: 1, padding: 0 }}>+</button>
        </div>

        <div style={{ overflowY: 'auto', flex: 1, padding: '0 6px 8px' }}>
          {catalogGames.map(game => {
            const isSelected = selectedGameId === game.id && (view === 'trainer');
            return (
              <button
                key={game.id}
                onClick={() => setSelectedGame(game.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '9px',
                  width: '100%', padding: '5px 8px', borderRadius: '6px',
                  border: 'none', cursor: 'pointer', textAlign: 'left',
                  background: isSelected ? 'rgba(255,255,255,0.08)' : 'transparent',
                  color: isSelected ? 'white' : 'rgba(255,255,255,0.55)',
                  marginBottom: '1px',
                  borderLeft: isSelected ? '2px solid #7c5cfc' : '2px solid transparent',
                }}
              >
                <div style={{ width: '26px', height: '26px', borderRadius: '4px', overflow: 'hidden', flexShrink: 0, background: '#222' }}>
                  <img src={game.coverUrl} alt={game.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <span style={{ fontSize: '12px', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                  {game.name}
                </span>
                {steamScanDone && game.installed && (
                  <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#00c94f', flexShrink: 0 }} />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom */}
      <div style={{ borderTop: `1px solid ${BORDER}`, padding: '8px 6px' }}>
        <NavBtn
          icon={<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.2"/><circle cx="7" cy="7" r="2" fill="currentColor" opacity=".7"/></svg>}
          label="Settings"
          active={view === 'settings'}
          onClick={() => setView('settings')}
        />
      </div>
    </aside>
  );
}
