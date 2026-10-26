'use client';

import { useStore, Plan, PLAN_LIMITS, CANDY_EARN_RATE } from '@/lib/store';

const A = '#7c5cfc';

interface Tier {
  id: Plan;
  label: string;
  price: string;
  period: string;
  color: string;
  glow: string;
  badge?: string;
  features: string[];
}

const TIERS: Tier[] = [
  {
    id: 'free',
    label: 'Free',
    price: '$0',
    period: 'forever',
    color: 'rgba(255,255,255,0.3)',
    glow: 'rgba(255,255,255,0.05)',
    features: [
      '5 hours / day',
      '1 Candy Point per 5 min',
      'All games & cheats',
      'Memory scan trainer',
    ],
  },
  {
    id: 'starter',
    label: 'Starter',
    price: '$0.99',
    period: '/mo',
    color: '#f59e0b',
    glow: 'rgba(245,158,11,0.08)',
    features: [
      '10 hours / day',
      '1 Candy Point per 2.5 min',
      'All games & cheats',
      'Priority support',
    ],
  },
  {
    id: 'plus',
    label: 'Plus',
    price: '$1.99',
    period: '/mo',
    color: A,
    glow: 'rgba(124,92,252,0.1)',
    badge: 'RECOMMENDED',
    features: [
      'Unlimited hours',
      '1 Candy Point per minute',
      'All games & cheats',
      'Early access to new mods',
    ],
  },
  {
    id: 'pro',
    label: 'Pro',
    price: '$3.99',
    period: '/mo',
    color: '#10b981',
    glow: 'rgba(16,185,129,0.08)',
    features: [
      'Unlimited hours',
      '5 Candy Points per minute',
      'All games & cheats',
      'Early access + Discord role',
    ],
  },
];

function fmtRate(plan: Plan): string {
  const rate = CANDY_EARN_RATE[plan];
  if (rate <= 12) return '5 pts / min';
  if (rate <= 60) return `1 pt / ${rate / 60 < 1 ? `${rate}s` : `${rate / 60} min`}`;
  return `1 pt / ${rate / 60} min`;
}

export default function SettingsView() {
  const { plan, setPlan } = useStore();

  return (
    <div style={{ height: '100%', overflowY: 'auto', background: '#0d0d12', color: 'white' }}>
      {/* Header */}
      <div style={{ padding: '32px 32px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <h1 style={{ margin: '0 0 6px', fontSize: '22px', fontWeight: 800, letterSpacing: '-0.3px' }}>Settings</h1>
        <p style={{ margin: 0, fontSize: '13px', color: 'rgba(255,255,255,0.35)' }}>
          Manage your plan and preferences
        </p>
      </div>

      {/* Subscription section */}
      <div style={{ padding: '28px 32px 32px' }}>
        <div style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.25)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '16px' }}>
          Subscription
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
          {TIERS.map(tier => {
            const isCurrent = plan === tier.id;
            return (
              <div
                key={tier.id}
                style={{
                  position: 'relative',
                  borderRadius: '12px',
                  background: isCurrent ? tier.glow : 'rgba(255,255,255,0.025)',
                  border: isCurrent
                    ? `1px solid ${tier.color}`
                    : tier.badge
                    ? `1px solid rgba(124,92,252,0.25)`
                    : '1px solid rgba(255,255,255,0.07)',
                  padding: '18px 18px 16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0',
                  transition: 'border-color 0.15s',
                }}
              >
                {tier.badge && (
                  <div style={{
                    position: 'absolute', top: '-10px', left: '50%', transform: 'translateX(-50%)',
                    background: A, color: 'white', fontSize: '9px', fontWeight: 800,
                    padding: '2px 8px', borderRadius: '99px', letterSpacing: '0.08em', whiteSpace: 'nowrap',
                  }}>
                    {tier.badge}
                  </div>
                )}

                {/* Plan name + price */}
                <div style={{ marginBottom: '14px' }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: tier.color, letterSpacing: '0.08em', marginBottom: '4px' }}>
                    {tier.label.toUpperCase()}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '2px' }}>
                    <span style={{ fontSize: '24px', fontWeight: 800, color: 'white', lineHeight: 1 }}>{tier.price}</span>
                    <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.35)' }}>{tier.period}</span>
                  </div>
                </div>

                {/* Feature list */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '16px', flex: 1 }}>
                  {tier.features.map((f, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '7px', fontSize: '12px', color: 'rgba(255,255,255,0.6)', lineHeight: '1.3' }}>
                      <span style={{ color: tier.color, flexShrink: 0, marginTop: '1px', fontSize: '10px' }}>✓</span>
                      {f}
                    </div>
                  ))}
                </div>

                {/* CTA */}
                <button
                  onClick={() => setPlan(tier.id)}
                  disabled={isCurrent}
                  style={{
                    width: '100%', padding: '8px', borderRadius: '7px', border: 'none',
                    background: isCurrent
                      ? 'rgba(255,255,255,0.06)'
                      : tier.id === 'plus'
                      ? A
                      : 'rgba(255,255,255,0.07)',
                    color: isCurrent ? 'rgba(255,255,255,0.4)' : 'white',
                    fontSize: '12px', fontWeight: 700, cursor: isCurrent ? 'default' : 'pointer',
                    boxShadow: !isCurrent && tier.id === 'plus' ? '0 0 14px rgba(124,92,252,0.25)' : 'none',
                    transition: 'background 0.15s',
                  }}
                >
                  {isCurrent ? 'Current Plan' : `Get ${tier.label}`}
                </button>
              </div>
            );
          })}
        </div>

        {/* Candy Points info */}
        <div style={{ marginTop: '28px', padding: '20px', borderRadius: '12px', background: 'rgba(244,114,182,0.05)', border: '1px solid rgba(244,114,182,0.12)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <span style={{ fontSize: '20px' }}>🍬</span>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: 'white' }}>Candy Points</div>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginTop: '1px' }}>Earn while playing. Spend to extend your daily limit.</div>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '8px' }}>
            {(['free', 'starter', 'plus', 'pro'] as Plan[]).map(p => (
              <div key={p} style={{ padding: '10px 12px', borderRadius: '8px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ fontSize: '10px', fontWeight: 700, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.08em', marginBottom: '4px' }}>{p.toUpperCase()}</div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#f472b6' }}>{fmtRate(p)}</div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: '12px', padding: '10px 12px', borderRadius: '8px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', fontSize: '11px', color: 'rgba(255,255,255,0.35)', lineHeight: '1.5' }}>
            Spend <strong style={{ color: '#f472b6' }}>50 🍬</strong> to extend your daily limit by 1 hour. Points are earned automatically while any trainer is running.
          </div>
        </div>
      </div>
    </div>
  );
}
