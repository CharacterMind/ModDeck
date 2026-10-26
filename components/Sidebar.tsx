'use client';

import { useStore } from '@/lib/store';
import { GAMES } from '@/data/games';

const BG     = '#0d0d10';
const BG2    = '#131318';
const BORDER = 'rgba(255,255,255,0.07)';
const A      = '#7c5cfc';

const PLAN_LABELS: Record<string, { label: string; color: string }> = {
  free:    { label: 'FREE',    color: 'rgba(255,255,255,0.3)' },
  starter: { label: 'STARTER', color: '#f59e0b' },
  plus:    { label: 'PLUS',    color: '#7c5cfc' },
  pro:     { label: 'PRO',     color: '#10b981' },
};

function fmtTime(secs: number): string {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

export default function Sidebar() {
  const {
    view, setView, selectedGameId, setSelectedGame,
    plan, candyPoints, dailySecondsUsed, secondsRemaining, limitReached,
  } = useStore();

  const planMeta = PLAN_LABELS[plan];
  const limit = plan === 'free' ? 5 * 3600 : plan === 'starter' ? 10 * 3600 : 0;
  const pct = limit > 0 ? Math.min(1, dailySecondsUsed / limit) : 0;

  return (
    <aside style={{
      width: '210px', flexShrink: 0, display: 'flex', flexDirection: 'column',
      background: BG, borderRight: `1px solid ${BORDER}`,
    }}>
      {/* Logo */}
      <div style={{ padding: '16px 14px 12px', borderBottom: `1px solid ${BORDER}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
          <div style={{ width: '28px', height: '28px', borderRadius: '7px', background: A, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <polygon points="7,1 13,4.5 13,10.5 7,14 1,10.5 1,4.5" stroke="white" strokeWidth="1.3" fill="none"/>
              <circle cx="7" cy="7.5" r="2.2" fill="white"/>
            </svg>
          </div>
          <span style={{ fontWeight: 800, fontSize: '13px', letterSpacing: '0.1em', color: 'white' }}>MODDECK</span>
        </div>
      </div>

      {/* Nav + game library */}
      <nav style={{ flex: 1, overflowY: 'auto', padding: '10px 0' }}>
        {/* Home */}
        <div style={{ padding: '0 8px', marginBottom: '4px' }}>
          <button
            onClick={() => setView('home')}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: '8px',
              padding: '7px 8px', borderRadius: '6px', border: 'none',
              background: view === 'home' ? 'rgba(124,92,252,0.12)' : 'transparent',
              color: view === 'home' ? 'white' : 'rgba(255,255,255,0.4)',
              fontSize: '12px', fontWeight: view === 'home' ? 700 : 400, cursor: 'pointer',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" opacity=".7">
              <path d="M2 6l5-4 5 4v6a1 1 0 01-1 1H9v-3H5v3H3a1 1 0 01-1-1z" stroke="currentColor" strokeWidth="1.2" fill="none"/>
            </svg>
            Library
          </button>
        </div>

        {/* Section: My Games */}
        <div style={{ padding: '10px 14px 4px', fontSize: '10px', fontWeight: 700, color: 'rgba(255,255,255,0.2)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          My Games
        </div>

        {GAMES.map(game => {
          const isActive = selectedGameId === game.id && view === 'trainer';
          return (
            <div
              key={game.id}
              onClick={() => setSelectedGame(game.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: '9px',
                padding: '5px 8px', margin: '1px 8px', borderRadius: '6px',
                cursor: 'pointer',
                background: isActive ? 'rgba(124,92,252,0.12)' : 'transparent',
                borderLeft: isActive ? '2px solid #7c5cfc' : '2px solid transparent',
                transition: 'background 0.1s',
              }}
            >
              <img
                src={game.coverUrl}
                alt={game.name}
                style={{ width: '32px', height: '44px', borderRadius: '4px', objectFit: 'cover', flexShrink: 0 }}
              />
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontSize: '12px', fontWeight: isActive ? 600 : 400, color: isActive ? 'white' : 'rgba(255,255,255,0.6)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', lineHeight: '1.3' }}>
                  {game.name}
                </div>
                <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.25)', marginTop: '2px' }}>
                  {game.cheats.length} cheats
                </div>
              </div>
            </div>
          );
        })}
      </nav>

      {/* Daily timer bar */}
      {limit > 0 && (
        <div style={{ padding: '8px 12px', borderTop: `1px solid ${BORDER}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
            <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)' }}>Daily limit</span>
            <span style={{ fontSize: '10px', color: limitReached ? '#ef4444' : 'rgba(255,255,255,0.5)', fontVariantNumeric: 'tabular-nums' }}>
              {limitReached ? 'Limit hit' : fmtTime(secondsRemaining) + ' left'}
            </span>
          </div>
          <div style={{ height: '3px', borderRadius: '9999px', background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
            <div style={{ height: '100%', borderRadius: '9999px', width: `${pct * 100}%`, background: pct > 0.85 ? '#ef4444' : A, transition: 'width 1s linear' }} />
          </div>
        </div>
      )}

      {/* Bottom: candy + plan + settings */}
      <div style={{ borderTop: `1px solid ${BORDER}`, padding: '8px' }}>
        {/* Candy points */}
        <div
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 6px', marginBottom: '2px', borderRadius: '6px', background: 'rgba(255,255,255,0.025)', cursor: 'default' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '16px', lineHeight: 1 }}>🍬</span>
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'rgba(255,255,255,0.7)' }}>Candy Points</span>
          </div>
          <span style={{ fontSize: '13px', fontWeight: 700, color: '#f472b6' }}>{candyPoints.toLocaleString()}</span>
        </div>

        {/* Plan badge + settings */}
        <div style={{ display: 'flex', gap: '4px', marginTop: '4px' }}>
          <button
            onClick={() => setView('settings')}
            style={{
              flex: 1, padding: '6px 8px', borderRadius: '6px', border: 'none',
              background: view === 'settings' ? 'rgba(255,255,255,0.07)' : 'transparent',
              color: 'rgba(255,255,255,0.4)', fontSize: '12px', cursor: 'pointer', textAlign: 'left',
            }}
          >
            ⚙ Settings
          </button>
          <div style={{
            padding: '5px 8px', borderRadius: '6px',
            background: 'rgba(255,255,255,0.04)',
            fontSize: '10px', fontWeight: 700, letterSpacing: '0.05em',
            color: planMeta.color, alignSelf: 'center',
          }}>
            {planMeta.label}
          </div>
        </div>
      </div>
    </aside>
  );
}
