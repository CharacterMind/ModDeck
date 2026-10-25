'use client';

import { useState } from 'react';

interface Props {
  onComplete: (name: string) => void;
}

export default function WelcomeModal({ onComplete }: Props) {
  const [step, setStep] = useState<'welcome' | 'name'>('welcome');
  const [name, setName] = useState('');
  const [animating, setAnimating] = useState(false);

  function handleStart() {
    setStep('name');
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    setAnimating(true);
    setTimeout(() => onComplete(trimmed), 600);
  }

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm transition-opacity duration-500 ${animating ? 'opacity-0' : 'opacity-100'}`}
      style={{ background: 'rgba(0,0,0,0.85)' }}
    >
      <div className="w-full max-w-md mx-4">
        {step === 'welcome' ? (
          <div
            className="rounded-2xl p-8 text-center space-y-6 shadow-2xl"
            style={{
              background: '#0f0800',
              border: '1px solid rgba(255,107,0,0.2)',
              boxShadow: '0 0 40px rgba(255,107,0,0.1)',
            }}
          >
            {/* Logo */}
            <div className="flex justify-center">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl"
                style={{
                  background: '#FF6B00',
                  boxShadow: '0 0 30px rgba(255,107,0,0.5)',
                }}
              >
                🎃
              </div>
            </div>

            <div>
              <h1 className="text-2xl font-bold text-white mb-2">Enter ModDeck 🕸️</h1>
              <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.45)' }}>
                The free, open alternative to WeMod. Cast real trainer spells — powered by a local companion that runs on your PC.
              </p>
            </div>

            {/* Feature highlights */}
            <div className="space-y-3 text-left">
              {[
                { icon: '🎮', text: 'Launch & haunt your Steam games directly' },
                { icon: '🍬', text: '50 Candy Points on us to get you started' },
                { icon: '⏱️', text: '5 free hours per game — no soul required' },
                { icon: '💀', text: 'Join the Coven for unlimited time & 10x CP' },
              ].map((f, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 rounded-xl px-4 py-3"
                  style={{ background: 'rgba(255,107,0,0.07)', border: '1px solid rgba(255,107,0,0.12)' }}
                >
                  <span className="text-lg">{f.icon}</span>
                  <span className="text-sm" style={{ color: 'rgba(255,255,255,0.65)' }}>{f.text}</span>
                </div>
              ))}
            </div>

            <button
              onClick={handleStart}
              className="w-full font-bold py-3.5 rounded-xl transition-all text-sm"
              style={{ background: '#FF6B00', color: '#000', boxShadow: '0 0 20px rgba(255,107,0,0.4)' }}
            >
              Begin Your Haunting 🕯️
            </button>

            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.2)' }}>
              No account required · No credit card · No soul-selling
            </p>
          </div>
        ) : (
          <div
            className="rounded-2xl p-8 space-y-6 shadow-2xl"
            style={{
              background: '#0f0800',
              border: '1px solid rgba(255,107,0,0.2)',
              boxShadow: '0 0 40px rgba(255,107,0,0.1)',
            }}
          >
            <div className="text-center">
              <div className="text-3xl mb-3">🦇</div>
              <h2 className="text-xl font-bold text-white">What shall we call you?</h2>
              <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.35)' }}>You can change this anytime in Settings</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Your name or gamer tag"
                autoFocus
                maxLength={32}
                className="w-full rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none transition-all text-sm"
                style={{
                  background: 'rgba(255,107,0,0.06)',
                  border: '1px solid rgba(255,107,0,0.2)',
                }}
              />

              <button
                type="submit"
                disabled={!name.trim()}
                className="w-full font-bold py-3.5 rounded-xl transition-all text-sm"
                style={name.trim() ? {
                  background: '#FF6B00',
                  color: '#000',
                  boxShadow: '0 0 20px rgba(255,107,0,0.4)',
                } : {
                  background: 'rgba(255,255,255,0.08)',
                  color: 'rgba(255,255,255,0.25)',
                }}
              >
                {name.trim() ? `Into the darkness, ${name.trim().split(' ')[0]}! 🎃` : 'Enter your name to continue'}
              </button>
            </form>

            {/* DP gift */}
            <div
              className="flex items-center gap-3 rounded-xl px-4 py-3"
              style={{ background: 'rgba(255,107,0,0.1)', border: '1px solid rgba(255,107,0,0.2)' }}
            >
              <span className="text-xl">🍬</span>
              <div>
                <div className="font-semibold text-sm" style={{ color: '#FF8C42' }}>50 Candy Points on us</div>
                <div className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>Your welcome treat is ready to claim</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
