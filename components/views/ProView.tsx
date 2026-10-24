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
          <div className="text-5xl mb-4">👑</div>
          <h2 className="text-2xl font-bold text-white mb-2">You're on Pro!</h2>
          <p className="text-white/50 text-sm mb-6">Unlimited trainer time, 10x DP earning, all cheats unlocked. Thanks for supporting ModDeck.</p>
          <button onClick={() => setView('home')} className="bg-amber-400 text-black font-bold px-6 py-3 rounded-xl text-sm hover:bg-amber-300 transition-colors">
            Back to modding →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      {/* Hero */}
      <div className="relative bg-gradient-to-br from-amber-400/10 via-[#0f0f0f] to-[#0f0f0f] border-b border-white/5 p-8 pb-10">
        <div className="max-w-2xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-amber-400/10 border border-amber-400/20 rounded-full px-4 py-1.5 text-amber-400 text-sm font-semibold mb-4">
            👑 ModDeck Pro
          </div>
          <h1 className="text-3xl font-black text-white mb-3">Unlock everything. Pay less than WeMod.</h1>
          <p className="text-white/50 text-sm leading-relaxed">
            No time limits, no Pro-only locks, 10x faster Deck Points — and you're helping keep ModDeck free for everyone.
          </p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-8 space-y-8">
        {/* Pricing cards */}
        <div className="grid grid-cols-2 gap-4">
          {/* Monthly */}
          <div className="bg-[#141414] border border-white/10 rounded-2xl p-5">
            <div className="text-white/50 text-xs font-semibold uppercase tracking-widest mb-3">Monthly</div>
            <div className="text-3xl font-black text-white mb-0.5">${MONTHLY_PRICE}</div>
            <div className="text-white/30 text-xs mb-4">per month, cancel anytime</div>
            <button className="w-full bg-white/10 hover:bg-white/15 text-white font-semibold py-2.5 rounded-xl text-sm transition-colors">
              Get Monthly
            </button>
          </div>

          {/* Yearly - highlighted */}
          <div className="bg-amber-400/5 border border-amber-400/30 rounded-2xl p-5 relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-400 text-black text-[10px] font-black px-3 py-1 rounded-full">
              BEST VALUE · SAVE 35%
            </div>
            <div className="text-amber-400 text-xs font-semibold uppercase tracking-widest mb-3">Yearly</div>
            <div className="text-3xl font-black text-white mb-0.5">${YEARLY_PRICE}</div>
            <div className="text-white/30 text-xs mb-4">per year · ~$2.92/mo</div>
            <button className="w-full bg-amber-400 hover:bg-amber-300 text-black font-bold py-2.5 rounded-xl text-sm transition-colors">
              Get Pro Yearly
            </button>
          </div>
        </div>

        {/* Features comparison */}
        <div className="bg-[#141414] border border-white/5 rounded-2xl overflow-hidden">
          <div className="grid grid-cols-3 text-center">
            <div className="p-4 border-b border-white/5" />
            <div className="p-4 border-b border-l border-white/5 text-white/40 text-xs font-semibold uppercase tracking-widest">Free</div>
            <div className="p-4 border-b border-l border-white/5 text-amber-400 text-xs font-semibold uppercase tracking-widest">Pro 👑</div>
          </div>

          {[
            ['Trainer time per game', '5 hours', 'Unlimited'],
            ['Deck Points earned', '2 DP/hour', '10 DP/hour'],
            ['Monthly DP bonus', '—', '+100 DP/month'],
            ['Starting balance', '50 DP', '50 DP + 100 bonus'],
            ['All cheats unlocked', '✗', '✓'],
            ['Priority game updates', '✗', '✓'],
            ['Early access trainers', '✗', '✓'],
            ['DP toward free months', '✓', '✓ (10x faster)'],
          ].map(([feature, free, pro], i) => (
            <div key={i} className="grid grid-cols-3 text-center border-b border-white/5 last:border-0">
              <div className="p-3 text-left text-white/60 text-xs">{feature}</div>
              <div className={`p-3 border-l border-white/5 text-xs ${free === '✗' ? 'text-white/20' : 'text-white/50'}`}>{free}</div>
              <div className={`p-3 border-l border-white/5 text-xs font-medium ${pro === '✓' ? 'text-emerald-400' : 'text-amber-400'}`}>{pro}</div>
            </div>
          ))}
        </div>

        {/* DP calculator */}
        <div className="bg-[#141414] border border-white/5 rounded-2xl p-5">
          <h3 className="text-white font-semibold text-sm mb-1">Earn back your subscription with Deck Points</h3>
          <p className="text-white/40 text-xs mb-4">
            Pro users earn 10 DP/hour + 100 DP/month. At 449 DP = 1 free month, heavy players earn 1–2 free months per year.
          </p>
          <div className="grid grid-cols-3 gap-3">
            {[
              { hours: 5, label: 'Casual (5 hrs/mo)', dp: 5 * 10 + 100, months: ((5 * 10 + 100) / 449 * 12).toFixed(1) },
              { hours: 20, label: 'Regular (20 hrs/mo)', dp: 20 * 10 + 100, months: ((20 * 10 + 100) / 449 * 12).toFixed(1) },
              { hours: 50, label: 'Heavy (50 hrs/mo)', dp: 50 * 10 + 100, months: ((50 * 10 + 100) / 449 * 12).toFixed(1) },
            ].map(({ label, dp, months }) => (
              <div key={label} className="bg-white/5 rounded-xl p-3 text-center">
                <div className="text-white/40 text-[10px] mb-1">{label}</div>
                <div className="text-amber-400 font-bold text-sm">{dp} DP/mo</div>
                <div className="text-white/30 text-[10px] mt-0.5">~{months} free months/yr</div>
              </div>
            ))}
          </div>
        </div>

        <p className="text-center text-white/20 text-xs">
          Payments are processed securely. Cancel anytime — no questions asked.
        </p>
      </div>
    </div>
  );
}
