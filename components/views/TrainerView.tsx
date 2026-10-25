'use client';

import { useState, useEffect } from 'react';
import { useStore } from '@/lib/store';
import { useCompanion } from '@/hooks/useCompanion';
import { GAMES, Cheat } from '@/data/games';

interface Props {
  companion: ReturnType<typeof useCompanion>;
}

const A = '#7c5cfc';
const A_DIM = 'rgba(124,92,252,0.12)';
const A_BORDER = 'rgba(124,92,252,0.25)';
const GREEN = '#00c94f';

export default function TrainerView({ companion }: Props) {
  const { selectedGameId } = useStore();
  const game = GAMES.find(g => g.id === selectedGameId) ?? GAMES[0];

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
  }, [selectedGameId]);

  useEffect(() => {
    if (companion.isAttached && companion.attachedGameId === selectedGameId) {
      setIsRunning(true);
    } else if (isRunning) {
      setIsRunning(false);
    }
  }, [companion.isAttached, companion.attachedGameId, selectedGameId]);

  const LAUNCH_STEPS = [
    'Locating game installation',
    'Verifying game version',
    'Launching via Steam',
    'Waiting for game process',
    'Trainer ready',
  ];

  async function handleLaunch() {
    if (!companion.isOnline) {
      window.open(`steam://rungameid/${game.steamAppId}`);
      return;
    }
    setIsLaunching(true);
    setLaunchStep(0);
    for (let i = 0; i <= 2; i++) {
      await new Promise(r => setTimeout(r, 600));
      setLaunchStep(i + 1);
    }
    const result = await companion.launch(game.id);
    if (!result.started) {
      setIsLaunching(false);
      setScanMsg(result.error ?? 'Failed to launch. Is the game installed?');
      return;
    }
    setLaunchStep(3);
    const attach = await companion.attach(game.id, game.processes);
    setLaunchStep(4);
    if (attach.found) setIsRunning(true);
    setIsLaunching(false);
  }

  async function handleToggle(cheat: Cheat) {
    if (!companion.isAttached) return;
    const current = cheatStates[cheat.id] ?? false;
    if (!current) {
      setScanCheat(cheat.id);
      setScanStep('first');
      setScanMsg(`Enter your current ${cheat.label.toLowerCase()} value in-game`);
    } else {
      await companion.scan('undo');
      setCheatStates(s => ({ ...s, [cheat.id]: false }));
    }
  }

  async function handleScanSubmit() {
    const val = parseFloat(scanValue);
    if (isNaN(val)) return;
    if (scanStep === 'first') {
      const res = await companion.scan('first', val);
      if (res.ok) {
        if (res.ready) { setScanStep('write'); setScanMsg('Found! Now enter the value you WANT'); }
        else { setScanStep('next'); setScanMsg('Good. Change the value in-game, then enter the NEW value'); }
        setScanValue('');
      }
    } else if (scanStep === 'next') {
      const res = await companion.scan('next', val);
      if (res.ok) {
        if (res.ready) { setScanStep('write'); setScanMsg('Narrowed down! Enter the value you WANT'); }
        else setScanMsg('Still narrowing — change the value again and enter the new one');
        setScanValue('');
      }
    } else if (scanStep === 'write') {
      const res = await companion.scan('write', val, true);
      if (res.ok && res.written && res.written > 0) {
        if (scanCheat) setCheatStates(s => ({ ...s, [scanCheat]: true }));
        setScanCheat(null);
        setScanValue('');
        setScanMsg('');
        await companion.scan('reset');
      }
    }
  }

  async function handleButton(cheat: Cheat) {
    if (!companion.isAttached) return;
    setScanCheat(cheat.id);
    setScanValue(String(cheat.defaultValue ?? 10000));
    setScanMsg(`Enter your CURRENT ${cheat.label.toLowerCase()} value to locate it`);
    setScanStep('first');
  }

  async function handleValueSet(cheat: Cheat) {
    if (!companion.isAttached) return;
    setScanCheat(cheat.id);
    setScanStep('first');
    setScanMsg(`Enter your CURRENT ${cheat.label.toLowerCase()} value to locate it first`);
  }

  const categories = [...new Set(game.cheats.map(c => c.category))];

  return (
    <div style={{ display: 'flex', height: '100%', overflow: 'hidden' }}>
      {/* Left: Game hero */}
      <div style={{ position: 'relative', width: '360px', flexShrink: 0, overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0 }}>
          <img src={game.heroUrl ?? game.coverUrl} alt={game.name} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.35 }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, #0d0d12, rgba(13,13,18,0.7), transparent)' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, #0d0d12, transparent 60%)' }} />
        </div>

        <div style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', height: '100%', padding: '24px' }}>
          {/* Game header */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '20px' }}>
            <img src={game.coverUrl} alt={game.name} style={{ width: '52px', height: '52px', borderRadius: '8px', objectFit: 'cover', flexShrink: 0 }} />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <h1 style={{ color: 'white', fontWeight: 700, fontSize: '17px', margin: 0 }}>{game.name}</h1>
                <span style={{ fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '9999px', background: A_DIM, color: A, border: `1px solid ${A_BORDER}` }}>
                  TRAINER v1.0
                </span>
              </div>
              <div style={{ display: 'flex', gap: '8px', marginTop: '4px', fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>
                <span>{game.cheats.length} cheats</span>
                <span>·</span>
                <span>{game.genre}</span>
                <span>·</span>
                <span>{game.platform}</span>
              </div>
            </div>
          </div>

          {/* Not running */}
          {!isRunning && !isLaunching && (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', gap: '16px' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: A_DIM, border: `1px solid ${A_BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M5 3l14 9-14 9V3z" fill={A}/>
                </svg>
              </div>
              <div>
                <div style={{ color: 'white', fontWeight: 600, marginBottom: '6px' }}>Game not running</div>
                <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.35)', lineHeight: 1.6, maxWidth: '200px' }}>
                  Launch {game.name} to attach the trainer and apply cheats in real time
                </div>
              </div>
              <button
                onClick={handleLaunch}
                style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, padding: '11px 24px', borderRadius: '10px', fontSize: '14px', background: A, color: 'white', border: 'none', cursor: 'pointer', boxShadow: `0 0 18px rgba(124,92,252,0.35)` }}
              >
                Launch Game
              </button>
              {!companion.isOnline && (
                <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.25)', margin: 0 }}>Companion offline — will launch via Steam directly</p>
              )}
              {scanMsg && (
                <p style={{ fontSize: '12px', color: 'rgba(255,100,100,0.7)', margin: 0 }}>{scanMsg}</p>
              )}
            </div>
          )}

          {/* Launching */}
          {isLaunching && (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
              <img src={game.coverUrl} alt={game.name} style={{ width: '60px', height: '60px', borderRadius: '10px' }} />
              <div style={{ color: 'white', fontWeight: 600, fontSize: '14px' }}>Launching {game.name}</div>
              <div style={{ fontSize: '10px', fontWeight: 700, padding: '3px 10px', borderRadius: '9999px', background: A_DIM, color: A, border: `1px solid ${A_BORDER}` }}>STARTING UP</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '200px' }}>
                {LAUNCH_STEPS.map((step, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
                    <span style={{ color: i < launchStep ? GREEN : i === launchStep ? A : 'rgba(255,255,255,0.18)', fontSize: '10px' }}>
                      {i < launchStep ? '✓' : i === launchStep ? '⟳' : '○'}
                    </span>
                    <span style={{ color: i < launchStep ? 'rgba(255,255,255,0.6)' : i === launchStep ? 'white' : 'rgba(255,255,255,0.18)' }}>{step}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Running */}
          {isRunning && (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', borderRadius: '8px', background: 'rgba(0,201,79,0.08)', border: '1px solid rgba(0,201,79,0.2)' }}>
                <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: GREEN, boxShadow: `0 0 6px ${GREEN}` }} />
                <span style={{ fontSize: '12px', color: GREEN, fontWeight: 500 }}>Trainer active</span>
              </div>

              {scanCheat && (
                <div style={{ background: 'rgba(124,92,252,0.05)', border: `1px solid ${A_BORDER}`, borderRadius: '10px', padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.65)' }}>{scanMsg}</div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      type="number"
                      value={scanValue}
                      onChange={e => setScanValue(e.target.value)}
                      style={{ flex: 1, borderRadius: '8px', padding: '8px 12px', color: 'white', fontSize: '12px', outline: 'none', background: 'rgba(255,255,255,0.05)', border: `1px solid rgba(124,92,252,0.2)` }}
                      placeholder="Enter value..."
                      onKeyDown={e => e.key === 'Enter' && handleScanSubmit()}
                    />
                    <button onClick={handleScanSubmit} style={{ background: A, color: 'white', fontSize: '12px', fontWeight: 700, padding: '8px 12px', borderRadius: '8px', border: 'none', cursor: 'pointer' }}>
                      {scanStep === 'write' ? 'Apply' : 'Scan'}
                    </button>
                    <button onClick={() => { setScanCheat(null); setScanValue(''); companion.scan('reset'); }} style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer', padding: '0 8px', fontSize: '16px' }}>✕</button>
                  </div>
                </div>
              )}

              <button
                onClick={async () => { await companion.detach(); setIsRunning(false); }}
                style={{ width: '100%', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)', fontSize: '13px', padding: '9px', borderRadius: '10px', background: 'transparent', cursor: 'pointer' }}
              >
                Stop Trainer
              </button>
            </div>
          )}

          {!isRunning && !isLaunching && (
            <p style={{ fontSize: '11px', lineHeight: 1.6, marginTop: '16px', color: 'rgba(255,255,255,0.2)' }}>
              ModDeck connects directly to the game process — real values, real changes, no fake simulation.
            </p>
          )}
        </div>
      </div>

      {/* Right: Cheat panel */}
      <div style={{ flex: 1, overflowY: 'auto', background: '#13131c', borderLeft: '1px solid rgba(255,255,255,0.04)' }}>
        {/* Profiles bar */}
        <div style={{ position: 'sticky', top: 0, zIndex: 10, background: 'rgba(19,19,28,0.92)', borderBottom: '1px solid rgba(255,255,255,0.04)', padding: '10px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backdropFilter: 'blur(8px)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.25)' }}>Cheat Profiles</span>
            <span style={{ fontSize: '10px', padding: '2px 6px', borderRadius: '9999px', background: A_DIM, color: `${A}99` }}>∞ UNLIMITED</span>
          </div>
          <button style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', border: '1px solid rgba(255,255,255,0.08)', padding: '4px 8px', borderRadius: '6px', background: 'transparent', cursor: 'pointer' }}>
            + Save current
          </button>
        </div>

        {/* Cheats by category */}
        <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {categories.map(category => (
            <div key={category}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                <span style={{ fontSize: '10px', fontWeight: 600, color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{category}</span>
                <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.18)' }}>
                  {game.cheats.filter(c => c.category === category && cheatStates[c.id]).length}/
                  {game.cheats.filter(c => c.category === category).length} active
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {game.cheats.filter(c => c.category === category).map(cheat => {
                  const isActive = cheatStates[cheat.id] ?? false;
                  const disabled = !isRunning;
                  return (
                    <div key={cheat.id} style={{ borderRadius: '10px', padding: '12px 14px', background: isActive ? 'rgba(124,92,252,0.06)' : 'rgba(255,255,255,0.025)', border: isActive ? `1px solid ${A_BORDER}` : '1px solid rgba(255,255,255,0.05)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        {cheat.type === 'toggle' && (
                          <button
                            onClick={() => handleToggle(cheat)}
                            disabled={disabled}
                            style={{ position: 'relative', width: '38px', height: '20px', borderRadius: '9999px', flexShrink: 0, border: 'none', cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.35 : 1, background: isActive ? A : 'rgba(255,255,255,0.1)', boxShadow: isActive ? `0 0 8px rgba(124,92,252,0.4)` : 'none', transition: 'background 0.15s' }}
                          >
                            <span style={{ position: 'absolute', top: '2px', left: '2px', width: '16px', height: '16px', borderRadius: '50%', background: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.4)', transform: isActive ? 'translateX(18px)' : 'translateX(0)', transition: 'transform 0.15s', display: 'block' }} />
                          </button>
                        )}

                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '13px', fontWeight: 500, color: 'white' }}>{cheat.label}</span>
                            {cheat.hotkey && (
                              <span style={{ fontSize: '10px', background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.3)', padding: '2px 5px', borderRadius: '4px', fontFamily: 'monospace' }}>{cheat.hotkey}</span>
                            )}
                          </div>
                          <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', marginTop: '2px' }}>{cheat.description}</div>
                        </div>

                        {cheat.type === 'value' && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <input
                              type="number"
                              value={valueInputs[cheat.id] ?? (cheat.defaultValue ?? '')}
                              onChange={e => setValueInputs(s => ({ ...s, [cheat.id]: e.target.value }))}
                              disabled={disabled}
                              style={{ width: '88px', borderRadius: '7px', padding: '6px 8px', color: 'white', fontSize: '12px', textAlign: 'right', outline: 'none', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', opacity: disabled ? 0.35 : 1 }}
                            />
                            <button
                              onClick={() => handleValueSet(cheat)}
                              disabled={disabled}
                              style={{ fontSize: '12px', padding: '6px 10px', borderRadius: '7px', fontWeight: 500, background: A_DIM, color: A, border: `1px solid ${A_BORDER}`, cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.35 : 1 }}
                            >
                              Set
                            </button>
                          </div>
                        )}

                        {cheat.type === 'button' && (
                          <button
                            onClick={() => handleButton(cheat)}
                            disabled={disabled}
                            style={{ fontSize: '12px', padding: '6px 12px', borderRadius: '7px', fontWeight: 500, background: A_DIM, color: A, border: `1px solid ${A_BORDER}`, cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.35 : 1 }}
                          >
                            Apply
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
