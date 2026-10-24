'use client';

import { useState, useRef } from 'react';
import { useStore } from '@/lib/store';

export default function SettingsView() {
  const { user, updateUser, setUser } = useStore();
  const [tab, setTab] = useState<'account' | 'subscription' | 'deckpoints' | 'preferences' | 'privacy' | 'danger'>('account');
  const [name, setName] = useState(user?.name ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [saved, setSaved] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  function handleSave() {
    updateUser({ name: name.trim() || user?.name, email: email.trim() });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      updateUser({ avatarUrl: ev.target?.result as string });
    };
    reader.readAsDataURL(file);
  }

  function handleRemoveAvatar() {
    updateUser({ avatarUrl: undefined });
  }

  const TABS = [
    { id: 'account', label: 'Account' },
    { id: 'subscription', label: 'Subscription' },
    { id: 'deckpoints', label: 'Deck Points' },
    { id: 'preferences', label: 'Preferences' },
    { id: 'privacy', label: 'Privacy' },
    { id: 'danger', label: 'Danger Zone' },
  ] as const;

  return (
    <div className="h-full flex overflow-hidden">
      {/* Side nav */}
      <div className="w-44 border-r border-white/5 p-3 flex-shrink-0">
        <div className="text-[10px] font-semibold text-white/30 uppercase tracking-widest px-2 py-2">Settings</div>
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors mb-0.5 ${
              tab === t.id
                ? 'bg-white/10 text-white'
                : t.id === 'danger' ? 'text-red-400/60 hover:text-red-400 hover:bg-red-400/5'
                : 'text-white/50 hover:text-white hover:bg-white/5'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-8">
        {tab === 'account' && (
          <div className="max-w-md space-y-6">
            <h2 className="text-lg font-bold text-white">Account</h2>

            {/* Avatar */}
            <div>
              <label className="block text-sm text-white/60 mb-3">Profile Picture</label>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-amber-400 flex items-center justify-center overflow-hidden flex-shrink-0">
                  {user?.avatarUrl ? (
                    <img src={user.avatarUrl} alt="avatar" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-black font-black text-xl">{(user?.name ?? 'U').charAt(0).toUpperCase()}</span>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => fileRef.current?.click()}
                    className="text-xs bg-white/10 hover:bg-white/15 text-white px-3 py-1.5 rounded-lg transition-colors"
                  >
                    Upload picture
                  </button>
                  {user?.avatarUrl && (
                    <button
                      onClick={handleRemoveAvatar}
                      className="text-xs text-white/30 hover:text-white/60 transition-colors text-left"
                    >
                      Remove picture
                    </button>
                  )}
                  <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                </div>
              </div>
            </div>

            {/* Name */}
            <div>
              <label className="block text-sm text-white/60 mb-2">Display Name</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                maxLength={32}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-amber-400/50 transition-colors"
              />
              <p className="text-white/20 text-xs mt-1">This is how you appear across ModDeck. Change it anytime.</p>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm text-white/60 mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-amber-400/50 transition-colors placeholder-white/20"
              />
            </div>

            <button
              onClick={handleSave}
              className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                saved ? 'bg-emerald-400/20 text-emerald-400 border border-emerald-400/30' : 'bg-amber-400 text-black hover:bg-amber-300'
              }`}
            >
              {saved ? '✓ Saved' : 'Save changes'}
            </button>
          </div>
        )}

        {tab === 'subscription' && (
          <div className="max-w-md space-y-6">
            <h2 className="text-lg font-bold text-white">Subscription</h2>
            <div className={`border rounded-2xl p-5 ${user?.plan === 'pro' ? 'bg-amber-400/5 border-amber-400/20' : 'bg-white/5 border-white/10'}`}>
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl">{user?.plan === 'pro' ? '👑' : '🆓'}</span>
                <div>
                  <div className="text-white font-semibold">{user?.plan === 'pro' ? 'ModDeck Pro' : 'Free Plan'}</div>
                  <div className="text-white/40 text-xs">{user?.plan === 'pro' ? 'Unlimited access, all features' : '5 hours per game trainer'}</div>
                </div>
              </div>
              {user?.plan !== 'pro' && (
                <button className="w-full bg-amber-400 text-black font-bold py-2.5 rounded-xl text-sm hover:bg-amber-300 transition-colors">
                  Upgrade to Pro — $4.49/month
                </button>
              )}
            </div>
          </div>
        )}

        {tab === 'deckpoints' && (
          <div className="max-w-md space-y-6">
            <h2 className="text-lg font-bold text-white">Deck Points</h2>
            <div className="bg-amber-400/5 border border-amber-400/20 rounded-2xl p-5">
              <div className="text-amber-400/60 text-xs font-semibold uppercase tracking-widest mb-1">Current Balance</div>
              <div className="text-4xl font-black text-amber-400">{user?.deckPoints ?? 0} DP</div>
              <div className="text-white/30 text-xs mt-1">449 DP = 1 free month of Pro</div>
            </div>
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-white/60">How to earn</h3>
              {[
                { label: 'Playing games (Free)', value: '2 DP / hour' },
                { label: 'Playing games (Pro)', value: '10 DP / hour' },
                { label: 'Monthly bonus (Pro)', value: '+100 DP / month' },
                { label: 'Welcome gift', value: '50 DP (one time)' },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between bg-white/5 rounded-xl px-4 py-3">
                  <span className="text-sm text-white/60">{label}</span>
                  <span className="text-sm text-amber-400 font-semibold">{value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'preferences' && (
          <div className="max-w-md space-y-6">
            <h2 className="text-lg font-bold text-white">Preferences</h2>
            <div className="space-y-3">
              {[
                { label: 'Dark mode', sub: 'Always on — it just looks better', active: true, disabled: true },
                { label: 'Sound effects', sub: 'Play sounds on cheat activation', active: false },
                { label: 'New trainer notifications', sub: 'Notify when a trainer for your games is added', active: true },
                { label: 'Deck Points milestones', sub: 'Notify when you hit DP thresholds', active: true },
              ].map(({ label, sub, active, disabled }) => (
                <div key={label} className="flex items-center gap-4 bg-[#141414] border border-white/5 rounded-xl px-4 py-3">
                  <div className="flex-1">
                    <div className="text-white text-sm font-medium">{label}</div>
                    <div className="text-white/30 text-xs">{sub}</div>
                  </div>
                  <div className={`relative w-10 h-5 rounded-full transition-colors ${disabled ? 'opacity-40' : 'cursor-pointer'} ${active ? 'bg-amber-400' : 'bg-white/10'}`}>
                    <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${active ? 'translate-x-5' : ''}`} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'privacy' && (
          <div className="max-w-md space-y-6">
            <h2 className="text-lg font-bold text-white">Privacy</h2>
            <div className="space-y-3">
              <div className="bg-[#141414] border border-white/5 rounded-xl p-4">
                <div className="text-white text-sm font-medium mb-1">Profile visibility</div>
                <div className="text-white/30 text-xs mb-3">Control who can see your profile and activity</div>
                <select className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none">
                  <option>Private (only me)</option>
                  <option>Public</option>
                </select>
              </div>
              <button className="w-full border border-white/10 text-white/50 hover:text-white hover:border-white/20 py-3 rounded-xl text-sm transition-colors">
                Clear playtime history
              </button>
            </div>
          </div>
        )}

        {tab === 'danger' && (
          <div className="max-w-md space-y-6">
            <h2 className="text-lg font-bold text-white">Danger Zone</h2>
            <div className="bg-red-400/5 border border-red-400/20 rounded-2xl p-5 space-y-4">
              <div>
                <div className="text-red-400 font-semibold text-sm">Delete Account</div>
                <div className="text-white/40 text-xs mt-0.5">
                  Permanently delete your account and all data. This cannot be undone.
                </div>
              </div>
              <button
                onClick={() => {
                  if (confirm('Are you sure? This will delete your account and all Deck Points permanently.')) {
                    setUser(null);
                  }
                }}
                className="border border-red-400/30 text-red-400 hover:bg-red-400/10 text-sm px-4 py-2 rounded-lg transition-colors"
              >
                Delete my account
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
