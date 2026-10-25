'use client';

import { useState, useRef } from 'react';
import { useStore } from '@/lib/store';

export default function SettingsView() {
  const { user, setUser } = useStore();
  const [name, setName] = useState(user?.name ?? '');
  const [saved, setSaved] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  function handleSave() {
    if (!user) return;
    setUser({ ...user, name: name.trim() || user.name });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    const reader = new FileReader();
    reader.onload = ev => setUser({ ...user, avatarUrl: ev.target?.result as string });
    reader.readAsDataURL(file);
  }

  function handleRemoveAvatar() {
    if (!user) return;
    const { avatarUrl: _, ...rest } = user;
    setUser(rest);
  }

  const initials = (user?.name ?? 'U')
    .replace(/([A-Z])/g, ' $1').trim().split(/\s+/).slice(0, 2)
    .map(w => w[0].toUpperCase()).join('');

  return (
    <div style={{ height: '100%', overflowY: 'auto', padding: '40px' }}>
      <div style={{ maxWidth: '400px', display: 'flex', flexDirection: 'column', gap: '32px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'white', margin: 0 }}>🕷️ Settings</h2>

        {/* Avatar */}
        <div>
          <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)', marginBottom: '12px' }}>Profile Picture</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0, background: '#FF6B00', boxShadow: '0 0 15px rgba(255,107,0,0.4)' }}>
              {user?.avatarUrl
                ? <img src={user.avatarUrl} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <span style={{ color: 'black', fontWeight: 900, fontSize: '20px' }}>{initials}</span>}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button onClick={() => fileRef.current?.click()} style={{ fontSize: '12px', background: 'rgba(255,255,255,0.1)', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer' }}>
                Upload picture
              </button>
              {user?.avatarUrl && (
                <button onClick={handleRemoveAvatar} style={{ fontSize: '12px', background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer', textAlign: 'left' }}>
                  Remove picture
                </button>
              )}
              <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatarChange} />
            </div>
          </div>
        </div>

        {/* Display Name */}
        <div>
          <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)', marginBottom: '8px' }}>Display Name</div>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            maxLength={32}
            style={{ width: '100%', borderRadius: '12px', padding: '10px 16px', color: 'white', fontSize: '14px', outline: 'none', background: 'rgba(255,107,0,0.06)', border: '1px solid rgba(255,107,0,0.15)', boxSizing: 'border-box' }}
          />
          <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.2)', marginTop: '4px' }}>How you appear in ModDeck. Change anytime.</div>
        </div>

        <button
          onClick={handleSave}
          style={{ padding: '10px 20px', borderRadius: '12px', fontSize: '14px', fontWeight: 600, border: 'none', cursor: 'pointer', alignSelf: 'flex-start', background: saved ? 'rgba(74,222,128,0.15)' : '#FF6B00', color: saved ? '#4ade80' : '#000', boxShadow: saved ? '0 0 0 1px rgba(74,222,128,0.25)' : 'none' }}
        >
          {saved ? '✓ Saved' : 'Save changes'}
        </button>

        {/* Danger Zone */}
        <div style={{ borderRadius: '16px', padding: '20px', background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.2)' }}>
          <div style={{ color: '#ef4444', fontWeight: 600, fontSize: '14px', marginBottom: '4px' }}>Reset Everything</div>
          <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', marginBottom: '16px' }}>Clears your name and returns to the welcome screen.</div>
          <button
            onClick={() => {
              if (confirm('Reset everything and start over?')) setUser(null);
            }}
            style={{ border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444', fontSize: '14px', padding: '8px 16px', borderRadius: '8px', background: 'transparent', cursor: 'pointer' }}
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}
