'use client';

import { useState } from 'react';

interface Props {
  onComplete: (name: string) => void;
}

export default function WelcomeModal({ onComplete }: Props) {
  const [step, setStep] = useState<'welcome' | 'name'>('welcome');
  const [name, setName] = useState('');
  const [animating, setAnimating] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    setAnimating(true);
    setTimeout(() => onComplete(trimmed), 600);
  }

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(4px)',
        opacity: animating ? 0 : 1, transition: 'opacity 0.5s',
      }}
    >
      <div style={{ width: '100%', maxWidth: '400px', margin: '0 16px' }}>
        {step === 'welcome' ? (
          <div style={{ borderRadius: '16px', padding: '32px', textAlign: 'center', background: '#0f0800', border: '1px solid rgba(255,107,0,0.2)', boxShadow: '0 0 40px rgba(255,107,0,0.1)', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', background: '#FF6B00', boxShadow: '0 0 30px rgba(255,107,0,0.5)' }}>
                🎃
              </div>
            </div>
            <div>
              <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'white', margin: '0 0 8px' }}>Enter ModDeck 🕸️</h1>
              <p style={{ fontSize: '14px', lineHeight: 1.5, color: 'rgba(255,255,255,0.45)', margin: 0 }}>
                Free game trainer for Supermarket Together. Cast real cheats — powered by a local companion that runs on your PC.
              </p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', textAlign: 'left' }}>
              {[
                { icon: '🎮', text: 'Launch & attach to Supermarket Together directly' },
                { icon: '🔮', text: 'Real-time cheats — funds, franchise level, god mode' },
                { icon: '👻', text: 'No account required. No credit card. No soul-selling.' },
              ].map((f, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', borderRadius: '12px', padding: '12px 16px', background: 'rgba(255,107,0,0.07)', border: '1px solid rgba(255,107,0,0.12)' }}>
                  <span style={{ fontSize: '18px' }}>{f.icon}</span>
                  <span style={{ fontSize: '14px', color: 'rgba(255,255,255,0.65)' }}>{f.text}</span>
                </div>
              ))}
            </div>
            <button
              onClick={() => setStep('name')}
              style={{ width: '100%', fontWeight: 700, padding: '14px', borderRadius: '12px', fontSize: '14px', background: '#FF6B00', color: '#000', border: 'none', cursor: 'pointer', boxShadow: '0 0 20px rgba(255,107,0,0.4)' }}
            >
              Begin Your Haunting 🕯️
            </button>
          </div>
        ) : (
          <div style={{ borderRadius: '16px', padding: '32px', background: '#0f0800', border: '1px solid rgba(255,107,0,0.2)', boxShadow: '0 0 40px rgba(255,107,0,0.1)', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '32px', marginBottom: '12px' }}>🦇</div>
              <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'white', margin: '0 0 4px' }}>What shall we call you?</h2>
              <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.35)', margin: 0 }}>You can change this anytime in Settings</p>
            </div>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Your name or gamer tag"
                autoFocus
                maxLength={32}
                style={{ width: '100%', borderRadius: '12px', padding: '12px 16px', color: 'white', fontSize: '14px', outline: 'none', background: 'rgba(255,107,0,0.06)', border: '1px solid rgba(255,107,0,0.2)', boxSizing: 'border-box' }}
              />
              <button
                type="submit"
                disabled={!name.trim()}
                style={{ width: '100%', fontWeight: 700, padding: '14px', borderRadius: '12px', fontSize: '14px', border: 'none', cursor: name.trim() ? 'pointer' : 'default', background: name.trim() ? '#FF6B00' : 'rgba(255,255,255,0.08)', color: name.trim() ? '#000' : 'rgba(255,255,255,0.25)', boxShadow: name.trim() ? '0 0 20px rgba(255,107,0,0.4)' : 'none' }}
              >
                {name.trim() ? `Into the darkness, ${name.trim().split(' ')[0]}! 🎃` : 'Enter your name to continue'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
