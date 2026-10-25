'use client';

import { useCompanion } from '@/hooks/useCompanion';
import { GAMES } from '@/data/games';

interface Props {
  companion: ReturnType<typeof useCompanion>;
}

export default function StatusBar({ companion }: Props) {
  const { status, health, isAttached, attachedGameId } = companion;
  const attachedGame = GAMES.find(g => g.id === attachedGameId);
  const version = health?.version ?? '—';

  const dotColor = status === 'online' ? '#00c94f' : status === 'checking' ? '#7c5cfc' : 'rgba(255,255,255,0.2)';
  const textColor = status === 'online' ? '#00c94f' : status === 'checking' ? '#7c5cfc' : 'rgba(255,255,255,0.25)';

  return (
    <div style={{ height: '30px', borderTop: '1px solid rgba(124,92,252,0.1)', display: 'flex', alignItems: 'center', padding: '0 16px', gap: '20px', fontSize: '11px', flexShrink: 0, background: '#0a0a10', color: 'rgba(255,255,255,0.35)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <div style={{ width: '6px', height: '6px', borderRadius: '50%', flexShrink: 0, background: dotColor }} />
        <span style={{ color: textColor }}>
          {status === 'online'
            ? `Companion v${version} · connected`
            : status === 'checking'
            ? 'Companion · connecting…'
            : 'Companion · offline'}
        </span>
      </div>

      {isAttached && attachedGame && (
        <>
          <div style={{ width: '1px', height: '12px', background: 'rgba(124,92,252,0.15)' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#00c94f' }} />
            <span style={{ color: '#00c94f' }}>{attachedGame.name} · trainer active</span>
          </div>
        </>
      )}

      <div style={{ flex: 1 }} />

      <span>{isAttached ? 'Game running' : 'No game running'}</span>
      <div style={{ width: '1px', height: '12px', background: 'rgba(124,92,252,0.12)' }} />
      <span style={{ color: 'rgba(124,92,252,0.5)', fontWeight: 600 }}>FREE</span>
    </div>
  );
}
