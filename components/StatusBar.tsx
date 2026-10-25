'use client';

import { useStore } from '@/lib/store';
import { useCompanion } from '@/hooks/useCompanion';
import { GAMES } from '@/data/games';

interface Props {
  companion: ReturnType<typeof useCompanion>;
}

export default function StatusBar({ companion }: Props) {
  const { user, selectedGameId, view } = useStore();
  const { status, health, isAttached, attachedGameId } = companion;

  const attachedGame = GAMES.find(g => g.id === attachedGameId);
  const version = health?.version ?? '—';

  return (
    <div
      className="h-8 border-t flex items-center px-4 gap-6 text-[11px] flex-shrink-0"
      style={{ background: '#0a0600', borderColor: 'rgba(255,107,0,0.1)' }}
    >
      {/* Companion status */}
      <div className="flex items-center gap-1.5">
        <div
          className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${status === 'online' || status === 'checking' ? 'animate-pulse' : ''}`}
          style={{
            background: status === 'online' ? '#4ade80' :
              status === 'checking' ? '#FF8C42' :
              'rgba(255,255,255,0.2)',
          }}
        />
        <span style={{
          color: status === 'online' ? '#4ade80' :
            status === 'checking' ? '#FF8C42' :
            'rgba(255,107,0,0.35)',
        }}>
          {status === 'online'
            ? `🕸️ Companion v${version} · summoned`
            : status === 'checking'
            ? '🕯️ Companion · awakening…'
            : '👻 Companion · dormant'}
        </span>
      </div>

      {/* Attached game */}
      {isAttached && attachedGame && (
        <>
          <div className="w-px h-3" style={{ background: 'rgba(255,107,0,0.15)' }} />
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#FF6B00' }} />
            <span style={{ color: '#FF8C42' }}>
              {attachedGame.name} · spell active
            </span>
          </div>
        </>
      )}

      {/* Spacer */}
      <div className="flex-1" />

      {/* Game running */}
      {isAttached ? (
        <span style={{ color: 'rgba(74,222,128,0.6)' }}>Game running</span>
      ) : (
        <span style={{ color: 'rgba(255,107,0,0.25)' }}>No game running</span>
      )}

      {/* Divider */}
      <div className="w-px h-3" style={{ background: 'rgba(255,107,0,0.12)' }} />

      {/* Candy Points balance */}
      {user && (
        <div className="flex items-center gap-1" style={{ color: 'rgba(255,140,66,0.65)' }}>
          <span>🍬</span>
          <span>{user.deckPoints.toLocaleString()} CP</span>
        </div>
      )}

      {/* Divider */}
      <div className="w-px h-3" style={{ background: 'rgba(255,107,0,0.12)' }} />

      {/* Plan badge */}
      {user && (
        <div
          className="px-1.5 py-0.5 rounded text-[10px] font-bold"
          style={user.plan === 'pro' ? {
            background: 'rgba(255,107,0,0.2)',
            color: '#FF8C42',
          } : {
            background: 'rgba(255,255,255,0.08)',
            color: 'rgba(255,255,255,0.35)',
          }}
        >
          {user.plan === 'pro' ? '💀 COVEN' : 'FREE'}
        </div>
      )}
    </div>
  );
}
