'use client';

import { useStore } from '@/lib/store';

const MONTHLY_PRICE = 4.49;
const YEARLY_PRICE = 34.99;

export default function ProView() {
  const { user, setView } = useStore();

  if (user?.plan === 'pro') {
    return (
      <div className="h-full flex items-center justify-center p-8">
        <div className="text-center max-w-sm">
          <div className="text-5xl mb-4">💀</div>
          <h2 className="text-2xl font-bold text-white mb-2">You're in the Coven!</h2>
          <p className="text-sm mb-6" style={{ color: 'rgba(255,255,255,0.45)' }}>Unlimited trainer time, 10x DP earning, all spells unlocked. Thanks for supporting ModDeck.</p>
          <button
            onClick={() => setView('home')}
            className="font-bold px-6 py-3 rounded-xl text-sm transition-all"
            style={{ background: '#FF6B00', color: '#000' }}
          >
            Back to haunting →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      {/* Hero */}
      <div
        className="relative border-b p-8 pb-10"
        style={{
          background: 'linear-gradient(135deg, rgba(255,107,0,0.1) 0%, #0a0600 50%, rgba(155,89,182,0.08) 100%)',
          borderColor: 'rgba(255,107,0,0.12)',
        }}
      >
        <div className="max-w-2xl mx-auto text-center">
          <div
            className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-semibold mb-4"
            style={{
              background: 'rgba(255,107,0,0.1)',
              border: '1px solid rgba(255,107,0,0.25)',
              color: '#FF8C42',
            }}
          >
            💀 ModDeck Coven
          </div>
          <h1 className="text-3xl font-black text-white mb-3">Unlock everything. Pay less than WeMod.</h1>
          <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.45)' }}>
            No time limits, no Coven-only locks, 10x faster Candy Points — and you're helping keep ModDeck free for everyone.
          </p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-8 space-y-8">
        {/* Pricing cards */}
        <div className="grid grid-cols-2 gap-4">
          {/* Monthly */}
          <div className="rounded-2xl p-5" style={{ background: '#0f0800', border: '1px solid rgba(255,107,0,0.12)' }}>
            <div className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'rgba(255,255,255,0.4)' }}>Monthly</div>
            <div className="text-3xl font-black text-white mb-0.5">${MONTHLY_PRICE}</div>
            <div className="text-xs mb-4" style={{ color: 'rgba(255,255,255,0.25)' }}>per month, cancel anytime</div>
            <button className="w-full font-semibold py-2.5 rounded-xl text-sm transition-all" style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.7)' }}>
              Get Monthly
            </button>
          </div>

          {/* Yearly - highlighted */}
          <div className="rounded-2xl p-5 relative" style={{ background: 'rgba(255,107,0,0.06)', border: '1px solid rgba(255,107,0,0.3)' }}>
            <div
              className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] font-black px-3 py-1 rounded-full"
              style={{ background: '#FF6B00', color: '#000' }}
            >
              BEST VALUE · SAVE 35%
            </div>
            <div className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: '#FF8C42' }}>Yearly</div>
            <div className="text-3xl font-black text-white mb-0.5">${YEARLY_PRICE}</div>
            <div className="text-xs mb-4" style={{ color: 'rgba(255,255,255,0.25)' }}>per year · ~$2.92/mo</div>
            <button
              className="w-full font-bold py-2.5 rounded-xl text-sm transition-all"
              style={{ background: '#FF6B00', color: '#000', boxShadow: '0 0 15px rgba(255,107,0,0.3)' }}
            >
              Join the Coven 🎃
            </button>
          </div>
        </div>

        {/* Features comparison */}
        <div className="rounded-2xl overflow-hidden" style={{ background: '#0f0800', border: '1px solid rgba(255,107,0,0.1)' }}>
          <div className="grid grid-cols-3 text-center">
            <div className="p-4 border-b" style={{ borderColor: 'rgba(255,107,0,0.08)' }} />
            <div className="p-4 border-b border-l text-xs font-semibold uppercase tracking-widest" style={{ borderColor: 'rgba(255,107,0,0.08)', color: 'rgba(255,255,255,0.35)' }}>Free</div>
            <div className="p-4 border-b border-l text-xs font-semibold uppercase tracking-widest" style={{ borderColor: 'rgba(255,107,0,0.08)', color: '#FF8C42' }}>Coven 💀</div>
          </div>

          {[
            ['Trainer time per game', '5 hours', 'Unlimited'],
            ['Candy Points earned', '2 CP/hour', '10 CP/hour'],
            ['Monthly CP bonus', '—', '+100 CP/month'],
            ['Starting balance', '50 CP', '50 CP + 100 bonus'],
            ['All spells unlocked', '✗', '✓'],
            ['Priority game updates', '✗', '✓'],
            ['Early access trainers', '✗', '✓'],
            ['CP toward free months', '✓', '✓ (10x faster)'],
          ].map(([feature, free, pro], i) => (
            <div key={i} className="grid grid-cols-3 text-center border-b last:border-0" style={{ borderColor: 'rgba(255,107,0,0.06)' }}>
              <div className="p-3 text-left text-xs" style={{ color: 'rgba(255,255,255,0.55)' }}>{feature}</div>
              <div className="p-3 border-l text-xs" style={{ borderColor: 'rgba(255,107,0,0.06)', color: free === '✗' ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.45)' }}>{free}</div>
              <div className="p-3 border-l text-xs font-medium" style={{ borderColor: 'rgba(255,107,0,0.06)', color: pro === '✓' ? '#4ade80' : '#FF8C42' }}>{pro}</div>
            </div>
          ))}
        </div>

        {/* DP calculator */}
        <div className="rounded-2xl p-5" style={{ background: '#0f0800', border: '1px solid rgba(255,107,0,0.1)' }}>
          <h3 className="text-white font-semibold text-sm mb-1">🍬 Earn back your subscription with Candy Points</h3>
          <p className="text-xs mb-4" style={{ color: 'rgba(255,255,255,0.35)' }}>
            Coven members earn 10 CP/hour + 100 CP/month. At 449 CP = 1 free month, heavy haunters earn 1–2 free months per year.
          </p>
          <div className="grid grid-cols-3 gap-3">
            {[
              { hours: 5, label: 'Casual (5 hrs/mo)', dp: 5 * 10 + 100, months: ((5 * 10 + 100) / 449 * 12).toFixed(1) },
              { hours: 20, label: 'Regular (20 hrs/mo)', dp: 20 * 10 + 100, months: ((20 * 10 + 100) / 449 * 12).toFixed(1) },
              { hours: 50, label: 'Heavy (50 hrs/mo)', dp: 50 * 10 + 100, months: ((50 * 10 + 100) / 449 * 12).toFixed(1) },
            ].map(({ label, dp, months }) => (
              <div key={label} className="rounded-xl p-3 text-center" style={{ background: 'rgba(255,107,0,0.07)' }}>
                <div className="text-[10px] mb-1" style={{ color: 'rgba(255,255,255,0.35)' }}>{label}</div>
                <div className="font-bold text-sm" style={{ color: '#FF8C42' }}>{dp} CP/mo</div>
                <div className="text-[10px] mt-0.5" style={{ color: 'rgba(255,255,255,0.25)' }}>~{months} free months/yr</div>
              </div>
            ))}
          </div>
        </div>

        <p className="text-center text-xs" style={{ color: 'rgba(255,255,255,0.15)' }}>
          Payments are processed securely. Cancel anytime — no questions asked. 🕸️
        </p>
      </div>
    </div>
  );
}
