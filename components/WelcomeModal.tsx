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
    <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm transition-opacity duration-500 ${animating ? 'opacity-0' : 'opacity-100'}`}>
      <div className="w-full max-w-md mx-4">
        {step === 'welcome' ? (
          <div className="bg-[#141414] border border-white/10 rounded-2xl p-8 text-center space-y-6 shadow-2xl">
            {/* Logo */}
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-amber-400 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-400/20">
                <span className="text-black font-black text-2xl">MD</span>
              </div>
            </div>

            <div>
              <h1 className="text-2xl font-bold text-white mb-2">Welcome to ModDeck</h1>
              <p className="text-white/50 text-sm leading-relaxed">
                The free, open alternative to WeMod. Real game trainers, real cheats — powered by a local companion that runs on your PC.
              </p>
            </div>

            {/* Feature highlights */}
            <div className="space-y-3 text-left">
              {[
                { icon: '🎮', text: 'Launch & mod your Steam games directly' },
                { icon: '🪙', text: '50 Deck Points on us to get you started' },
                { icon: '⏱️', text: '5 free hours per game — no card required' },
                { icon: '👑', text: 'Go Pro for unlimited time & 10x DP earning' },
              ].map((f, i) => (
                <div key={i} className="flex items-center gap-3 bg-white/5 rounded-xl px-4 py-3">
                  <span className="text-lg">{f.icon}</span>
                  <span className="text-sm text-white/70">{f.text}</span>
                </div>
              ))}
            </div>

            <button
              onClick={handleStart}
              className="w-full bg-amber-400 hover:bg-amber-300 text-black font-bold py-3.5 rounded-xl transition-colors text-sm"
            >
              Get Started — It's Free
            </button>

            <p className="text-white/20 text-xs">
              No account required · No credit card · No BS
            </p>
          </div>
        ) : (
          <div className="bg-[#141414] border border-white/10 rounded-2xl p-8 space-y-6 shadow-2xl">
            <div className="text-center">
              <div className="text-3xl mb-3">👋</div>
              <h2 className="text-xl font-bold text-white">What should we call you?</h2>
              <p className="text-white/40 text-sm mt-1">You can change this anytime in Settings</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Your name or gamer tag"
                autoFocus
                maxLength={32}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-amber-400/50 focus:bg-white/8 transition-all text-sm"
              />

              <button
                type="submit"
                disabled={!name.trim()}
                className="w-full bg-amber-400 hover:bg-amber-300 disabled:bg-white/10 disabled:text-white/30 text-black font-bold py-3.5 rounded-xl transition-colors text-sm"
              >
                {name.trim() ? `Let's go, ${name.trim().split(' ')[0]}! 🚀` : 'Enter your name to continue'}
              </button>
            </form>

            {/* DP gift reminder */}
            <div className="flex items-center gap-3 bg-amber-400/10 border border-amber-400/20 rounded-xl px-4 py-3">
              <span className="text-xl">🎁</span>
              <div>
                <div className="text-amber-400 font-semibold text-sm">50 DP on us</div>
                <div className="text-white/40 text-xs">Your welcome gift is ready to claim</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
