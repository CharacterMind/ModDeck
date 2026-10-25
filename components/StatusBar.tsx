'use client';

import { useState, useEffect, useRef } from 'react';
import { useStore } from '@/lib/store';
import { useCompanion } from '@/hooks/useCompanion';
import { GAMES } from '@/data/games';

interface Props {
  companion: ReturnType<typeof useCompanion>;
}

const FREE_LIMIT_MINUTES = 5 * 60;

export default function StatusBar({ companion }: Props) {
  const { user, sessionStart, setView, getSessionMinutes } = useStore();
  const { status, health, isAttached, attachedGameId } = companion;
  const [showLimit, setShowLimit] = useState(false);
  const [sessionMinutes, setSessionMinutes] = useState(0);
  const popoverRef = useRef<HTMLDivElement>(null);

  const attachedGame = GAMES.find(g => g.id === attachedGameId);
  const version = health?.version ?? '—';
  const isPro = user?.plan === 'pro';

  // Keep session minutes ticking while a session is active
  useEffect(() => {
    if (!sessionStart) { setSessionMinutes(0); return; }
    const tick = () => setSessionMinutes(getSessionMinutes());
    tick();
    const id = setInterval(tick, 10000);
    return () => clearInterval(id);
  }, [sessionStart]);

  // Close popover on outside click
  useEffect(() => {
    if (!showLimit) return;
    function onDown(e: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setShowLimit(false);
      }
    }
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [showLimit]);

  const usedMinutes = Math.min(sessionMinutes, FREE_LIMIT_MINUTES);
  const usedH = Math.floor(usedMinutes / 60);
  const usedM = usedMinutes % 60;
  const usedLabel = usedH > 0 ? `${usedH}H ${usedM}M` : `${usedM}M`;
  const limitLabel = `${FREE_LIMIT_MINUTES / 60}H`;
  const pct = Math.min(100, (usedMinutes / FREE_LIMIT_MINUTES) * 100);
  const isNearLimit = !isPro && usedMinutes >= FREE_LIMIT_MINUTES * 0.8;
  const isAtLimit = !isPro && usedMinutes >= FREE_LIMIT_MINUTES;

  return (
    <div
      className="h-8 border-t flex items-center px-4 gap-6 text-[11px] flex-shrink-0 relative"
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
            <span style={{ color: '#FF8C42' }}>{attachedGame.name} · spell active</span>
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

      <div className="w-px h-3" style={{ background: 'rgba(255,107,0,0.12)' }} />

      {/* Daily limit widget — free users only */}
      {user && !isPro && (
        <div ref={popoverRef} className="relative">
          <button
            onClick={() => setShowLimit(v => !v)}
            className="flex items-center gap-1.5 transition-all"
            style={{ color: isAtLimit ? '#ef4444' : isNearLimit ? '#FF8C42' : 'rgba(255,140,66,0.55)' }}
          >
            <span>⏳</span>
            <span>{sessionStart ? `${usedLabel} / ${limitLabel}` : `${limitLabel} free`}</span>
            {isAtLimit && <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#ef4444' }} />}
          </button>

          {showLimit && (
            <div
              className="absolute bottom-10 right-0 w-72 rounded-2xl shadow-2xl overflow-hidden"
              style={{ background: '#1a0e00', border: '1px solid rgba(255,107,0,0.2)', zIndex: 50 }}
            >
              {/* Header */}
              <div className="px-5 pt-5 pb-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-base">⏳</span>
                  <span className="font-bold text-white text-sm">Daily Limit</span>
                </div>
                <p className="text-xs" style={{ color: 'rgba(255,255,255,0.45)' }}>
                  {isAtLimit
                    ? "You've used your free trainer time for today."
                    : `${FREE_LIMIT_MINUTES / 60} hours of free trainer time available today.`}
                </p>
              </div>

              {/* Progress bar */}
              <div className="px-5 pb-4">
                <div
                  className="rounded-xl px-4 py-3"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
                >
                  <div className="flex items-center justify-between text-[10px] mb-2 font-semibold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.3)' }}>
                    <span>Used</span>
                    <span style={{ color: isAtLimit ? '#ef4444' : 'rgba(255,140,66,0.7)' }}>
                      {usedLabel} / {limitLabel}
                    </span>
                  </div>
                  <div className="h-2.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${pct}%`,
                        background: isAtLimit
                          ? 'linear-gradient(90deg, #ef4444, #dc2626)'
                          : isNearLimit
                          ? 'linear-gradient(90deg, #FF6B00, #FF8C42)'
                          : 'linear-gradient(90deg, #FF6B00, #FF8C42)',
                        boxShadow: isAtLimit ? '0 0 8px rgba(239,68,68,0.5)' : '0 0 8px rgba(255,107,0,0.4)',
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div style={{ height: '1px', background: 'rgba(255,107,0,0.08)' }} />

              {/* Pro CTA */}
              <div className="px-5 py-4">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-sm">💀</span>
                  <span className="font-black text-xs tracking-wider" style={{ color: '#FF8C42' }}>MODDECK COVEN</span>
                </div>
                <p className="text-xs mb-3" style={{ color: 'rgba(255,255,255,0.4)' }}>
                  Upgrade for unlimited trainer time and 10× CP earning.
                </p>
                <button
                  onClick={() => { setView('pro'); setShowLimit(false); }}
                  className="w-full py-2.5 rounded-xl font-bold text-sm transition-all"
                  style={{ background: '#FF6B00', color: '#000' }}
                >
                  Upgrade to Coven →
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Candy Points balance */}
      {user && (
        <>
          <div className="w-px h-3" style={{ background: 'rgba(255,107,0,0.12)' }} />
          <div className="flex items-center gap-1" style={{ color: 'rgba(255,140,66,0.65)' }}>
            <span>🍬</span>
            <span>{user.deckPoints.toLocaleString()} CP</span>
          </div>
        </>
      )}

      {/* Divider */}
      <div className="w-px h-3" style={{ background: 'rgba(255,107,0,0.12)' }} />

      {/* Plan badge */}
      {user && (
        <div
          className="px-1.5 py-0.5 rounded text-[10px] font-bold"
          style={isPro ? {
            background: 'rgba(255,107,0,0.2)',
            color: '#FF8C42',
          } : {
            background: 'rgba(255,255,255,0.08)',
            color: 'rgba(255,255,255,0.35)',
          }}
        >
          {isPro ? '💀 COVEN' : 'FREE'}
        </div>
      )}
    </div>
  );
}
