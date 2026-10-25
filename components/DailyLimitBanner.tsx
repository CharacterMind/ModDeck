'use client';

import { useState, useEffect, useRef } from 'react';
import { useStore } from '@/lib/store';

const FREE_LIMIT_MINUTES = 5 * 60;

export default function DailyLimitBanner() {
  const { user, sessionStart, setView, getSessionMinutes } = useStore();
  const [showModal, setShowModal] = useState(false);
  const [sessionMinutes, setSessionMinutes] = useState(0);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sessionStart) { setSessionMinutes(0); return; }
    const tick = () => setSessionMinutes(getSessionMinutes());
    tick();
    const id = setInterval(tick, 10000);
    return () => clearInterval(id);
  }, [sessionStart]);

  useEffect(() => {
    if (!showModal) return;
    function onDown(e: MouseEvent) {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        setShowModal(false);
      }
    }
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [showModal]);

  if (!user || user.plan === 'pro') return null;

  const used = Math.min(sessionMinutes, FREE_LIMIT_MINUTES);
  const remaining = Math.max(0, FREE_LIMIT_MINUTES - used);
  const pct = Math.min(100, (used / FREE_LIMIT_MINUTES) * 100);
  const isNear = used >= FREE_LIMIT_MINUTES * 0.8;
  const isOut = used >= FREE_LIMIT_MINUTES;

  const fmtMins = (m: number) => {
    const h = Math.floor(m / 60);
    const min = m % 60;
    return h > 0 ? (min > 0 ? `${h}h ${min}m` : `${h}h`) : `${min}m`;
  };

  const barColor = isOut
    ? 'linear-gradient(90deg, #dc2626, #ef4444)'
    : 'linear-gradient(90deg, #FF6B00, #FF9500)';

  const accentColor = isOut ? '#ef4444' : isNear ? '#FF8C42' : '#FF6B00';

  return (
    <div className="relative flex-shrink-0">
      {/* Banner */}
      <button
        onClick={() => setShowModal(v => !v)}
        className="w-full flex items-center gap-5 px-6 text-left transition-all"
        style={{
          height: 52,
          background: isOut
            ? 'rgba(239,68,68,0.07)'
            : 'rgba(255,107,0,0.06)',
          borderBottom: `1px solid ${isOut ? 'rgba(239,68,68,0.2)' : 'rgba(255,107,0,0.15)'}`,
        }}
      >
        {/* Label */}
        <div className="flex items-center gap-2 flex-shrink-0 w-36">
          <span className="text-base">⏳</span>
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider" style={{ color: accentColor }}>
              Daily Limit
            </div>
            <div className="text-[10px]" style={{ color: 'rgba(255,255,255,0.3)' }}>
              Free plan
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.35)' }}>
              {isOut ? 'Limit reached' : `${fmtMins(used)} used`}
            </span>
            <span className="text-[10px] font-semibold" style={{ color: accentColor }}>
              {isOut ? '0m remaining' : `${fmtMins(remaining)} remaining`}
            </span>
          </div>
          <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.07)' }}>
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${pct}%`,
                background: barColor,
                boxShadow: isOut ? '0 0 6px rgba(239,68,68,0.5)' : '0 0 6px rgba(255,107,0,0.4)',
                minWidth: pct > 0 ? 8 : 0,
              }}
            />
          </div>
        </div>

        {/* Remaining time + upgrade */}
        <div className="flex items-center gap-4 flex-shrink-0">
          <div className="text-right">
            <div className="font-black text-lg leading-none" style={{ color: isOut ? '#ef4444' : '#fff' }}>
              {isOut ? '0h' : fmtMins(remaining)}
            </div>
            <div className="text-[10px]" style={{ color: 'rgba(255,255,255,0.3)' }}>left today</div>
          </div>
          <div
            className="px-3 py-1.5 rounded-lg text-xs font-bold"
            style={{ background: '#FF6B00', color: '#000' }}
          >
            Upgrade
          </div>
        </div>
      </button>

      {/* Drop-down modal */}
      {showModal && (
        <div
          ref={modalRef}
          className="absolute top-full left-0 right-0 z-50 overflow-hidden"
          style={{
            background: '#110900',
            borderBottom: '1px solid rgba(255,107,0,0.2)',
            boxShadow: '0 12px 40px rgba(0,0,0,0.6)',
          }}
        >
          <div className="max-w-2xl mx-auto px-8 py-6">
            <div className="flex items-start justify-between gap-8">
              {/* Left: details */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xl">⏳</span>
                  <span className="font-bold text-white text-base">Daily Play Time</span>
                </div>
                <p className="text-sm mb-4" style={{ color: 'rgba(255,255,255,0.45)' }}>
                  {isOut
                    ? "You've reached your 5-hour free limit for today. Come back tomorrow or upgrade."
                    : `You have ${fmtMins(remaining)} of free trainer time left today.`}
                </p>

                {/* Large progress bar */}
                <div className="mb-2">
                  <div className="flex justify-between text-xs mb-2 font-semibold" style={{ color: 'rgba(255,255,255,0.35)' }}>
                    <span>USED — {fmtMins(used)}</span>
                    <span style={{ color: accentColor }}>{fmtMins(remaining)} LEFT</span>
                  </div>
                  <div className="h-3 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${pct}%`,
                        background: barColor,
                        boxShadow: isOut ? '0 0 10px rgba(239,68,68,0.5)' : '0 0 10px rgba(255,107,0,0.5)',
                        minWidth: pct > 0 ? 10 : 0,
                      }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] mt-1" style={{ color: 'rgba(255,255,255,0.2)' }}>
                    <span>0h</span>
                    <span>5h</span>
                  </div>
                </div>
              </div>

              {/* Right: upgrade CTA */}
              <div
                className="w-56 rounded-2xl p-5 flex-shrink-0"
                style={{ background: 'rgba(255,107,0,0.08)', border: '1px solid rgba(255,107,0,0.2)' }}
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <span>💀</span>
                  <span className="font-black text-xs tracking-wider" style={{ color: '#FF8C42' }}>MODDECK COVEN</span>
                </div>
                <p className="text-xs mb-4" style={{ color: 'rgba(255,255,255,0.4)' }}>
                  Unlimited trainer time every day, plus 10× CP earning.
                </p>
                <button
                  onClick={() => { setView('pro'); setShowModal(false); }}
                  className="w-full py-2.5 rounded-xl font-bold text-sm"
                  style={{ background: '#FF6B00', color: '#000' }}
                >
                  Upgrade to Coven →
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
