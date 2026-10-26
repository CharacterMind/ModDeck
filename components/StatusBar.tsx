'use client';

import { useStore } from '@/lib/store';

export default function StatusBar() {
  const { trainerRunning, plan, candyPoints, secondsRemaining } = useStore();

  return (
    <div style={{
      height: '28px', flexShrink: 0,
      borderTop: '1px solid rgba(255,255,255,0.05)',
      background: '#090911',
      display: 'flex', alignItems: 'center',
      padding: '0 16px', gap: '16px',
      fontSize: '11px', color: 'rgba(255,255,255,0.2)',
    }}>
      <span>ModDeck v1.0</span>
      <span style={{ color: 'rgba(255,255,255,0.1)' }}>·</span>
      <span style={{ color: trainerRunning ? '#10b981' : 'rgba(255,255,255,0.2)' }}>
        {trainerRunning ? '● Trainer running' : '○ No trainer active'}
      </span>
    </div>
  );
}
