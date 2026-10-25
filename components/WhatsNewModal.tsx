'use client';

import { useEffect, useRef } from 'react';
import { CHANGELOG } from '@/data/changelog';

interface Props {
  onClose: () => void;
}

const LABEL_COLORS: Record<string, string> = {
  ADDED: '#4ade80',
  FIXED: '#FF8C42',
  CHANGED: '#60a5fa',
  REMOVED: '#f87171',
};

export default function WhatsNewModal({ onClose }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        onClose();
      }
    }
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [onClose]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
    >
      <div
        ref={containerRef}
        className="relative flex flex-col rounded-2xl overflow-hidden shadow-2xl"
        style={{
          width: 560,
          maxWidth: 'calc(100vw - 32px)',
          maxHeight: 'calc(100vh - 80px)',
          background: '#141414',
          border: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4 flex-shrink-0"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}
        >
          <span className="text-xs font-bold tracking-widest uppercase" style={{ color: 'rgba(255,255,255,0.4)' }}>
            What&apos;s New
          </span>
          <button
            onClick={onClose}
            className="text-sm transition-opacity hover:opacity-100"
            style={{ color: 'rgba(255,255,255,0.35)' }}
          >
            ✕
          </button>
        </div>

        {/* Scrollable content */}
        <div className="overflow-y-auto flex-1 px-6 py-2">
          {CHANGELOG.map((entry, i) => (
            <div
              key={entry.version}
              className="py-6"
              style={i < CHANGELOG.length - 1 ? { borderBottom: '1px solid rgba(255,255,255,0.06)' } : undefined}
            >
              {/* Version + date */}
              <div className="flex items-center gap-3 mb-3">
                <span
                  className="px-2 py-0.5 rounded text-xs font-bold"
                  style={{ background: '#FF6B00', color: '#000' }}
                >
                  {entry.version}
                </span>
                <span className="text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>
                  {entry.date}
                </span>
              </div>

              {/* Title */}
              <h2 className="text-xl font-bold text-white mb-1">{entry.title}</h2>

              {/* Summary */}
              <p className="text-sm mb-4" style={{ color: 'rgba(255,255,255,0.45)', lineHeight: 1.6 }}>
                {entry.summary}
              </p>

              {/* Sections */}
              {entry.sections.map(section => (
                <div key={section.label} className="mb-3">
                  <div
                    className="text-[11px] font-bold tracking-widest uppercase mb-2"
                    style={{ color: LABEL_COLORS[section.label] ?? '#fff' }}
                  >
                    {section.label}
                  </div>
                  <ul className="space-y-1.5">
                    {section.items.map((item, j) => (
                      <li key={j} className="flex gap-2 text-sm" style={{ color: 'rgba(255,255,255,0.65)', lineHeight: 1.55 }}>
                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: 'rgba(255,255,255,0.25)' }} />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
