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

  return (
    <div style={{ height: '32px', borderTop: '1px solid rgba(255,107,0,0.1)', display: 'flex', alignItems: 'center', padding: '0 16px', gap: '24px', fontSize: '11px', flexShrink: 0, background: '#0a0600' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <div style={{
          width: '6px', height: '6px', borderRadius: '50%', flexShrink: 0,
          background: status === 'online' ? '#4ade80' : status === 'checking' ? '#FF8C42' : 'rgba(255,255,255,0.2)',
        }} />
        <span style={{ color: status === 'online' ? '#4ade80' : status === 'checking' ? '#FF8C42' : 'rgba(255,107,0,0.35)' }}>
          {status === 'online'
            ? `🕸️ Companion v${version} · summoned`
            : status === 'checking'
            ? '🕯️ Companion · awakening…'
            : '👻 Companion · dormant'}
        </span>
      </div>

      {isAttached && attachedGame && (
        <>
          <div style={{ width: '1px', height: '12px', background: 'rgba(255,107,0,0.15)' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#FF6B00' }} />
            <span style={{ color: '#FF8C42' }}>{attachedGame.name} · spell active</span>
          </div>
        </>
      )}

      <div style={{ flex: 1 }} />

      <span style={{ color: isAttached ? 'rgba(74,222,128,0.6)' : 'rgba(255,107,0,0.25)' }}>
        {isAttached ? 'Game running' : 'No game running'}
      </span>

      <div style={{ width: '1px', height: '12px', background: 'rgba(255,107,0,0.12)' }} />
      <span style={{ color: 'rgba(255,107,0,0.4)' }}>FREE</span>
    </div>
  );
}
