'use client';

import { useState, useEffect } from 'react';
import { useStore } from '@/lib/store';
import { useCompanion } from '@/hooks/useCompanion';
import { GAMES, Cheat } from '@/data/games';

interface Props {
  companion: ReturnType<typeof useCompanion>;
}

const A = '#7c5cfc';
const A_DIM = 'rgba(124,92,252,0.14)';
const A_BORDER = 'rgba(124,92,252,0.3)';
const GREEN = '#00c94f';
const BORDER = 'rgba(255,255,255,0.06)';

const TABS = ['ALL', 'ECONOMY', 'STORE', 'GAME'];

function CategoryIcon({ cat }: { cat: string }) {
  if (cat === 'ECONOMY') return (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="currentColor" opacity=".5">
      <circle cx="6.5" cy="6.5" r="5.5" stroke="currentColor" strokeWidth="1.1" fill="none"/>
      <text x="6.5" y="10" textAnchor="middle" fontSize="8" fontWeight="700">$</text>
    </svg>
  );
  if (cat === 'STORE') return (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none" opacity=".5">
      <rect x="1.5" y="1.5" width="10" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.1"/>
      <path d="M4 6.5h5M4 8.5h3" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
    </svg>
  );
  return (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none" opacity=".5">
      <path d="M2 10L5 7L7.5 9L11 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
  );
}

export default function TrainerView({ companion }: Props) {
  const { selectedGameId } = useStore();
  const game = GAMES.find(g => g.id === selectedGameId) ?? GAMES[0];

  const [activeTab, setActiveTab] = useState('ALL');
  const [isLaunching, setIsLaunching] = useState(false);
  const [launchStep, setLaunchStep] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [cheatStates, setCheatStates] = useState<Record<string, boolean>>({});
  const [scanCheat, setScanCheat] = useState<string | null>(null);
  const [scanValue, setScanValue] = useState('');
  const [scanStep, setScanStep] = useState<'first' | 'next' | 'write'>('first');
  const [scanMsg, setScanMsg] = useState('');
  const [valueInputs, setValueInputs] = useState<Record<string, string>>({});

  useEffect(() => {
    setCheatStates({});
    setScanCheat(null);
    setScanValue('');
    setScanStep('first');
    setScanMsg('');
    setValueInputs({});
    setActiveTab('ALL');
  }, [selectedGameId]);

  useEffect(() => {
    if (companion.isAttached && companion.attachedGameId === selectedGameId) setIsRunning(true);
    else if (isRunning) setIsRunning(false);
  }, [companion.isAttached, companion.attachedGameId, selectedGameId]);

  const LAUNCH_STEPS = ['Locating game installation', 'Verifying game version', 'Launching via Steam', 'Waiting for game process', 'Trainer ready'];

  async function handleLaunch() {
    if (!companion.isOnline) { window.open(`steam://rungameid/${game.steamAppId}`); return; }
    setIsLaunching(true);
    setLaunchStep(0);
    for (let i = 0; i <= 2; i++) { await new Promise(r => setTimeout(r, 600)); setLaunchStep(i + 1); }
    const result = await companion.launch(game.id);
    if (!result.started) { setIsLaunching(false); setScanMsg(result.error ?? 'Failed to launch.'); return; }
    setLaunchStep(3);
    const attach = await companion.attach(game.id, game.processes);
    setLaunchStep(4);
    if (attach.found) setIsRunning(true);
    setIsLaunching(false);
  }

  async function handleToggle(cheat: Cheat) {
    if (!companion.isAttached) return;
    const current = cheatStates[cheat.id] ?? false;
    if (!current) { setScanCheat(cheat.id); setScanStep('first'); setScanMsg(`Enter your current ${cheat.label.toLowerCase()} value in-game`); }
    else { await companion.scan('undo'); setCheatStates(s => ({ ...s, [cheat.id]: false })); }
  }

  async function handleScanSubmit() {
    const val = parseFloat(scanValue);
    if (isNaN(val)) return;
    if (scanStep === 'first') {
      const res = await companion.scan('first', val);
      if (res.ok) { if (res.ready) { setScanStep('write'); setScanMsg('Found! Enter the value you WANT'); } else { setScanStep('next'); setScanMsg('Change the value in-game, enter the NEW value'); } setScanValue(''); }
    } else if (scanStep === 'next') {
      const res = await companion.scan('next', val);
      if (res.ok) { if (res.ready) { setScanStep('write'); setScanMsg('Narrowed down! Enter the value you WANT'); } else setScanMsg('Change the value again and enter the new one'); setScanValue(''); }
    } else {
      const res = await companion.scan('write', val, true);
      if (res.ok && res.written && res.written > 0) { if (scanCheat) setCheatStates(s => ({ ...s, [scanCheat]: true })); setScanCheat(null); setScanValue(''); setScanMsg(''); await companion.scan('reset'); }
    }
  }

  const categories = [...new Set(game.cheats.map(c => c.category))];
  const visibleCheats = activeTab === 'ALL' ? game.cheats : game.cheats.filter(c => c.category === activeTab);
  const visibleCategories = activeTab === 'ALL' ? categories : categories.filter(c => c === activeTab);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', background: '#0f0f12' }}>
      {/* Game header */}
      <div style={{ position: 'relative', flexShrink: 0, overflow: 'hidden' }}>
        {/* Blurred hero bg */}
        <div style={{ position: 'absolute', inset: 0 }}>
          <img src={game.heroUrl ?? game.coverUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.18, filter: 'blur(12px)', transform: 'scale(1.1)' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(15,15,18,0.5), #0f0f12)' }} />
        </div>

        <div style={{ position: 'relative', zIndex: 1, padding: '20px 24px 0' }}>
          {/* Title row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
            <img src={game.coverUrl} alt={game.name} style={{ width: '52px', height: '52px', borderRadius: '8px', objectFit: 'cover', flexShrink: 0, boxShadow: '0 4px 16px rgba(0,0,0,0.5)' }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <h1 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: 'white', whiteSpace: 'nowrap' }}>{game.name}</h1>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ opacity: 0.3, cursor: 'pointer' }}><path d="M8 1.5l1.6 3.4 3.6.5-2.6 2.6.6 3.6L8 9.6l-3.2 2-.4-.4.6-3.6-2.6-2.6 3.6-.5L8 1.5z" stroke="white" strokeWidth="1.2"/></svg>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ opacity: 0.3, cursor: 'pointer' }}><path d="M8 2a4 4 0 014 4c0 3-4 8-4 8S4 9 4 6a4 4 0 014-4z" stroke="white" strokeWidth="1.2"/><circle cx="8" cy="6" r="1.5" fill="white" opacity=".5"/></svg>
              </div>
              <div style={{ display: 'flex', gap: '6px', marginTop: '3px', fontSize: '11px', color: 'rgba(255,255,255,0.35)' }}>
                <span>Installed on Steam</span>
                <span>·</span>
                <span>{game.genre}</span>
                <span>·</span>
                <span>{game.cheats.length} mods</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px', flexShrink: 0, alignItems: 'center' }}>
              {isRunning ? (
                <button
                  onClick={async () => { await companion.detach(); setIsRunning(false); }}
                  style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '8px 16px', borderRadius: '7px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.6)', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
                >
                  ■ Stop Trainer
                </button>
              ) : (
                <button
                  onClick={handleLaunch}
                  disabled={isLaunching}
                  style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '8px 20px', borderRadius: '7px', border: 'none', background: isLaunching ? 'rgba(255,255,255,0.08)' : '#7c5cfc', color: 'white', fontSize: '13px', fontWeight: 700, cursor: isLaunching ? 'default' : 'pointer', boxShadow: isLaunching ? 'none' : '0 0 16px rgba(124,92,252,0.3)' }}
                >
                  {isLaunching ? `${LAUNCH_STEPS[launchStep] ?? '…'}` : '▶ Play'}
                </button>
              )}
            </div>
          </div>

          {/* Status / scan panel */}
          {scanCheat && (
            <div style={{ marginBottom: '12px', background: A_DIM, border: `1px solid ${A_BORDER}`, borderRadius: '8px', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', flex: 1 }}>{scanMsg}</span>
              <input
                type="number" value={scanValue} onChange={e => setScanValue(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleScanSubmit()}
                placeholder="Value…"
                style={{ width: '100px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', padding: '6px 8px', color: 'white', fontSize: '12px', outline: 'none' }}
              />
              <button onClick={handleScanSubmit} style={{ background: A, color: 'white', border: 'none', borderRadius: '6px', padding: '6px 12px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>
                {scanStep === 'write' ? 'Apply' : 'Scan'}
              </button>
              <button onClick={() => { setScanCheat(null); companion.scan('reset'); }} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer', fontSize: '18px', lineHeight: 1 }}>×</button>
            </div>
          )}
          {scanMsg && !scanCheat && (
            <div style={{ marginBottom: '12px', padding: '8px 12px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '8px', fontSize: '12px', color: 'rgba(239,68,68,0.8)' }}>{scanMsg}</div>
          )}

          {/* Tabs */}
          <div style={{ display: 'flex', gap: '0', borderBottom: `1px solid ${BORDER}` }}>
            {['ALL', ...categories].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: '8px 14px', border: 'none', background: 'transparent', cursor: 'pointer',
                  fontSize: '12px', fontWeight: 600, letterSpacing: '0.04em',
                  color: activeTab === tab ? 'white' : 'rgba(255,255,255,0.35)',
                  borderBottom: activeTab === tab ? `2px solid ${A}` : '2px solid transparent',
                  marginBottom: '-1px',
                }}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Not running banner */}
      {!isRunning && !isLaunching && !scanCheat && (
        <div style={{ flexShrink: 0, margin: '12px 24px 0', padding: '10px 16px', background: 'rgba(124,92,252,0.06)', border: `1px solid ${A_BORDER}`, borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', flexShrink: 0 }} />
          <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', flex: 1 }}>Game not running — launch the game to activate cheats in real time</span>
          <button onClick={handleLaunch} style={{ fontSize: '12px', fontWeight: 600, padding: '5px 12px', borderRadius: '6px', background: A, color: 'white', border: 'none', cursor: 'pointer' }}>Launch</button>
        </div>
      )}

      {isRunning && (
        <div style={{ flexShrink: 0, margin: '12px 24px 0', padding: '8px 14px', background: 'rgba(0,201,79,0.07)', border: '1px solid rgba(0,201,79,0.2)', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: GREEN, boxShadow: `0 0 6px ${GREEN}`, flexShrink: 0 }} />
          <span style={{ fontSize: '12px', color: GREEN, fontWeight: 500 }}>Trainer active — cheats apply in real time</span>
        </div>
      )}

      {/* Cheat grid */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px 24px' }}>
        {visibleCategories.map(category => {
          const cheats = visibleCheats.filter(c => c.category === category);
          if (!cheats.length) return null;
          return (
            <div key={category} style={{ marginBottom: '24px' }}>
              {/* Category header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', paddingBottom: '8px', borderBottom: `1px solid ${BORDER}` }}>
                <CategoryIcon cat={category} />
                <span style={{ fontSize: '11px', fontWeight: 600, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{category}</span>
                <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.18)' }}>
                  {cheats.filter(c => cheatStates[c.id]).length}/{cheats.length} active
                </span>
              </div>

              {/* 2-column grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                {cheats.map(cheat => {
                  const isActive = cheatStates[cheat.id] ?? false;
                  const disabled = !isRunning;
                  return (
                    <div
                      key={cheat.id}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '10px',
                        padding: '10px 14px', borderRadius: '8px',
                        background: isActive ? 'rgba(124,92,252,0.07)' : 'rgba(255,255,255,0.025)',
                        border: isActive ? `1px solid ${A_BORDER}` : `1px solid ${BORDER}`,
                      }}
                    >
                      <CategoryIcon cat={category} />

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '13px', fontWeight: 500, color: 'white', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{cheat.label}</div>
                        <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.28)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{cheat.description}</div>
                      </div>

                      {/* Controls */}
                      {cheat.type === 'toggle' && (
                        <button
                          onClick={() => handleToggle(cheat)}
                          disabled={disabled}
                          style={{ position: 'relative', width: '36px', height: '18px', borderRadius: '9999px', flexShrink: 0, border: 'none', cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.3 : 1, background: isActive ? A : 'rgba(255,255,255,0.12)', transition: 'background 0.15s', boxShadow: isActive ? `0 0 8px rgba(124,92,252,0.4)` : 'none' }}
                        >
                          <span style={{ position: 'absolute', top: '2px', left: '2px', width: '14px', height: '14px', borderRadius: '50%', background: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.4)', transform: isActive ? 'translateX(18px)' : 'none', transition: 'transform 0.15s', display: 'block' }} />
                        </button>
                      )}

                      {cheat.type === 'value' && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
                          <input
                            type="number"
                            value={valueInputs[cheat.id] ?? (cheat.defaultValue ?? '')}
                            onChange={e => setValueInputs(s => ({ ...s, [cheat.id]: e.target.value }))}
                            disabled={disabled}
                            style={{ width: '72px', background: 'rgba(255,255,255,0.05)', border: `1px solid ${BORDER}`, borderRadius: '5px', padding: '4px 6px', color: 'white', fontSize: '11px', textAlign: 'center', outline: 'none', opacity: disabled ? 0.3 : 1 }}
                          />
                          <button onClick={() => !disabled && (setScanCheat(cheat.id), setScanStep('first'), setScanMsg(`Enter your CURRENT ${cheat.label.toLowerCase()} to locate it`))} disabled={disabled} style={{ fontSize: '11px', padding: '4px 8px', borderRadius: '5px', fontWeight: 600, background: A_DIM, color: A, border: `1px solid ${A_BORDER}`, cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.3 : 1 }}>Set</button>
                        </div>
                      )}

                      {cheat.type === 'button' && (
                        <button
                          onClick={() => !disabled && (setScanCheat(cheat.id), setScanValue(String(cheat.defaultValue ?? 10000)), setScanStep('first'), setScanMsg(`Enter your CURRENT ${cheat.label.toLowerCase()} to locate it`))}
                          disabled={disabled}
                          style={{ fontSize: '11px', padding: '5px 10px', borderRadius: '5px', fontWeight: 600, background: A_DIM, color: A, border: `1px solid ${A_BORDER}`, cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.3 : 1, flexShrink: 0 }}
                        >
                          Apply
                        </button>
                      )}

                      {cheat.hotkey && (
                        <span style={{ fontSize: '10px', background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.3)', padding: '2px 5px', borderRadius: '4px', fontFamily: 'monospace', flexShrink: 0 }}>{cheat.hotkey}</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* Suggest a mod banner */}
        <div style={{ marginTop: '8px', padding: '14px 20px', borderRadius: '8px', background: 'linear-gradient(135deg, rgba(124,92,252,0.12) 0%, rgba(124,92,252,0.04) 100%)', border: `1px solid ${A_BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: '13px', fontWeight: 600, color: 'white', marginBottom: '2px' }}>Have an idea?</div>
            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)' }}>Tell us what cheats you want added for {game.name}</div>
          </div>
          <button style={{ fontSize: '12px', fontWeight: 700, padding: '7px 14px', borderRadius: '7px', background: A, color: 'white', border: 'none', cursor: 'pointer', flexShrink: 0 }}>
            Suggest a mod
          </button>
        </div>
      </div>
    </div>
  );
}
