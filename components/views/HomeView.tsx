'use client';

import { useStore } from '@/lib/store';
import { useCompanion } from '@/hooks/useCompanion';
import { GAMES } from '@/data/games';

interface Props {
  companion: ReturnType<typeof useCompanion>;
}

const A = '#7c5cfc';

export default function HomeView({ companion }: Props) {
  const { setSelectedGame, plan, candyPoints, limitReached, secondsRemaining } = useStore();

  const installed = GAMES.filter(g =>
    companion.installed.some(i => i.gameId === g.id) ||
    companion.isOnline  // show all as installed if companion is up
  );

  function fmtRemaining(secs: number) {
    if (!isFinite(secs)) return 'Unlimited';
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m`;
  }

  return (
    <div style={{ height: '100%', overflowY: 'auto', background: '#0d0d12', color: 'white' }}>
      {/* Hero banner */}
      <div style={{ position: 'relative', padding: '40px 32px 32px', background: 'linear-gradient(180deg, rgba(124,92,252,0.08) 0%, transparent 100%)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ margin: '0 0 6px', fontSize: '26px', fontWeight: 800, letterSpacing: '-0.5px' }}>Game Library</h1>
            <p style={{ margin: 0, fontSize: '13px', color: 'rgba(255,255,255,0.4)' }}>
              {GAMES.length} games · {GAMES.reduce((a, g) => a + g.cheats.length, 0)} cheats available
            </p>
          </div>

          {/* Plan + stats row */}
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <div style={{ padding: '10px 16px', borderRadius: '10px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', textAlign: 'center' }}>
              <div style={{ fontSize: '18px', fontWeight: 700, color: '#f472b6', lineHeight: 1 }}>🍬 {candyPoints}</div>
              <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', marginTop: '3px' }}>Candy Points</div>
            </div>
            <div style={{ padding: '10px 16px', borderRadius: '10px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', textAlign: 'center' }}>
              <div style={{ fontSize: '16px', fontWeight: 700, color: limitReached ? '#ef4444' : 'white', lineHeight: 1 }}>
                {limitReached ? '0m' : fmtRemaining(secondsRemaining)}
              </div>
              <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', marginTop: '3px' }}>Today remaining</div>
            </div>
            <div style={{ padding: '10px 16px', borderRadius: '10px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', textAlign: 'center' }}>
              <div style={{ fontSize: '14px', fontWeight: 800, color: plan === 'pro' ? '#10b981' : plan === 'plus' ? A : plan === 'starter' ? '#f59e0b' : 'rgba(255,255,255,0.4)', letterSpacing: '0.05em', lineHeight: 1 }}>
                {plan.toUpperCase()}
              </div>
              <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', marginTop: '3px' }}>Plan</div>
            </div>
          </div>
        </div>
      </div>

      {/* Limit warning */}
      {limitReached && (
        <div style={{ margin: '20px 32px 0', padding: '12px 16px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '18px' }}>⏱</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '13px', fontWeight: 600, color: 'white' }}>Daily limit reached</div>
            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginTop: '2px' }}>Upgrade to Plus for unlimited hours, or spend 50 🍬 for +1hr</div>
          </div>
          <button
            onClick={() => useStore().setView('settings')}
            style={{ padding: '6px 14px', borderRadius: '7px', background: A, color: 'white', border: 'none', fontSize: '12px', fontWeight: 700, cursor: 'pointer', flexShrink: 0 }}
          >
            Upgrade
          </button>
        </div>
      )}

      {/* Game grid */}
      <div style={{ padding: '24px 32px 32px' }}>
        <div style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.25)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '14px' }}>
          Supported Games
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '12px' }}>
          {GAMES.map(game => {
            const isInstalled = installed.some(g => g.id === game.id);
            return (
              <div
                key={game.id}
                onClick={() => setSelectedGame(game.id)}
                style={{ cursor: 'pointer', borderRadius: '10px', overflow: 'hidden', background: '#161620', border: '1px solid rgba(255,255,255,0.07)', transition: 'transform 0.15s, border-color 0.15s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(124,92,252,0.4)'; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(255,255,255,0.07)'; (e.currentTarget as HTMLDivElement).style.transform = 'none'; }}
              >
                <div style={{ position: 'relative', paddingTop: '150%', background: '#0d0d12' }}>
                  <img
                    src={game.coverUrl}
                    alt={game.name}
                    style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  {isInstalled && (
                    <div style={{ position: 'absolute', top: '8px', left: '8px', background: 'rgba(16,185,129,0.9)', color: 'white', fontSize: '9px', fontWeight: 700, padding: '2px 6px', borderRadius: '4px', letterSpacing: '0.05em' }}>
                      INSTALLED
                    </div>
                  )}
                </div>
                <div style={{ padding: '10px 10px 8px' }}>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: 'white', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: '3px' }}>
                    {game.name}
                  </div>
                  <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)' }}>
                    {game.cheats.length} cheats · {game.genre}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
