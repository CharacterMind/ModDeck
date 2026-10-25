'use client';

import { useStore } from '@/lib/store';
import { GAMES, STEAM_ID_MAP } from '@/data/games';
import { useCompanion } from '@/hooks/useCompanion';

interface Props {
  companion: ReturnType<typeof useCompanion>;
}

const BORDER = 'rgba(255,255,255,0.06)';
const A = '#7c5cfc';

export default function HomeView({ companion }: Props) {
  const { setSelectedGame, steamGames, steamScanDone } = useStore();

  const installedIds = new Set(
    steamGames.filter(sg => STEAM_ID_MAP[sg.appId]).map(sg => STEAM_ID_MAP[sg.appId])
  );

  return (
    <div style={{ flex: 1, overflowY: 'auto', background: '#0f0f12', padding: '32px 32px 48px' }}>
      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ margin: 0, fontSize: '22px', fontWeight: 700, color: 'white' }}>My Games</h1>
        <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'rgba(255,255,255,0.35)' }}>
          Select a game to open its trainer and apply cheats in real time
        </p>
      </div>

      {/* Game cards grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '14px', marginBottom: '40px' }}>
        {GAMES.map(game => {
          const installed = steamScanDone && installedIds.has(game.id);
          return (
            <button
              key={game.id}
              onClick={() => setSelectedGame(game.id)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, textAlign: 'left', borderRadius: '10px', overflow: 'hidden', display: 'block' }}
            >
              <div style={{ position: 'relative', borderRadius: '10px', overflow: 'hidden', border: `1px solid ${BORDER}`, transition: 'transform 0.15s' }}>
                {/* Banner */}
                <div style={{ height: '120px', overflow: 'hidden', position: 'relative' }}>
                  <img
                    src={game.heroUrl ?? game.coverUrl}
                    alt={game.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  />
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 40%, rgba(13,13,18,0.9))' }} />
                  {installed && (
                    <div style={{ position: 'absolute', top: '8px', right: '8px', display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(0,201,79,0.15)', border: '1px solid rgba(0,201,79,0.3)', borderRadius: '20px', padding: '2px 8px' }}>
                      <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#00c94f', display: 'block' }} />
                      <span style={{ fontSize: '10px', fontWeight: 600, color: '#00c94f' }}>Installed</span>
                    </div>
                  )}
                </div>
                {/* Info */}
                <div style={{ padding: '10px 12px 12px', background: '#16161c' }}>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: 'white', marginBottom: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{game.name}</div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)' }}>{game.cheats.length} cheats</span>
                    <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.25)', background: 'rgba(255,255,255,0.05)', padding: '1px 6px', borderRadius: '4px' }}>{game.genre}</span>
                  </div>
                </div>
              </div>
            </button>
          );
        })}

        {/* More coming soon card */}
        <div style={{ borderRadius: '10px', border: `1px dashed rgba(255,255,255,0.1)`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px', minHeight: '160px', cursor: 'default' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', color: 'rgba(255,255,255,0.15)' }}>+</div>
          <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.2)', textAlign: 'center', padding: '0 16px' }}>More games coming soon</span>
        </div>
      </div>

      {/* Stats bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '32px' }}>
        {[
          { label: 'Supported games', value: GAMES.length.toString() },
          { label: 'Total cheats', value: GAMES.reduce((n, g) => n + g.cheats.length, 0).toString() },
          { label: 'Platform', value: 'Steam / PC' },
        ].map(stat => (
          <div key={stat.label} style={{ padding: '14px 18px', borderRadius: '8px', background: 'rgba(255,255,255,0.03)', border: `1px solid ${BORDER}` }}>
            <div style={{ fontSize: '20px', fontWeight: 700, color: 'white', marginBottom: '2px' }}>{stat.value}</div>
            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)' }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Companion status */}
      <div style={{ padding: '14px 18px', borderRadius: '8px', background: 'rgba(255,255,255,0.02)', border: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ width: '8px', height: '8px', borderRadius: '50%', flexShrink: 0, background: companion.isOnline ? '#00c94f' : 'rgba(255,255,255,0.15)', boxShadow: companion.isOnline ? '0 0 6px #00c94f' : 'none' }} />
        <div>
          <div style={{ fontSize: '13px', fontWeight: 500, color: companion.isOnline ? 'white' : 'rgba(255,255,255,0.4)', marginBottom: '1px' }}>
            {companion.isOnline ? `ModDeck Companion v${companion.health?.version ?? '?'} · Connected` : 'ModDeck Companion · Offline'}
          </div>
          <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.25)' }}>
            {companion.isOnline ? 'Real-time memory editing ready' : 'Download the companion app for real-time cheats'}
          </div>
        </div>
        {!companion.isOnline && (
          <button style={{ marginLeft: 'auto', fontSize: '12px', fontWeight: 600, padding: '6px 14px', borderRadius: '6px', background: A, color: 'white', border: 'none', cursor: 'pointer', flexShrink: 0 }}>
            Download
          </button>
        )}
      </div>
    </div>
  );
}
