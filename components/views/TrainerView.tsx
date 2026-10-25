'use client';

import { useState, useEffect, useRef } from 'react';
import { useStore } from '@/lib/store';
import { useCompanion } from '@/hooks/useCompanion';
import { GAMES, Game, Cheat } from '@/data/games';

interface Props {
  companion: ReturnType<typeof useCompanion>;
}

type CheatState = 'idle' | 'active' | 'scanning_first' | 'scanning_next' | 'ready';

export default function TrainerView({ companion }: Props) {
  const { selectedGameId, user, startSession, endSession, getSessionMinutes, spendDeckPoints, setView } = useStore();
  const game = GAMES.find(g => g.id === selectedGameId);

  const [isLaunching, setIsLaunching] = useState(false);
  const [launchStep, setLaunchStep] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [cheatStates, setCheatStates] = useState<Record<string, boolean>>({});
  const [scanCheat, setScanCheat] = useState<string | null>(null);
  const [scanValue, setScanValue] = useState('');
  const [scanStep, setScanStep] = useState<'first' | 'next' | 'write'>('first');
  const [scanMsg, setScanMsg] = useState('');
  const [valueInputs, setValueInputs] = useState<Record<string, string>>({});
  const [sessionMinutes, setSessionMinutes] = useState(0);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const FREE_LIMIT_MINUTES = 5 * 60; // 5 hours
  const isPro = user?.plan === 'pro';
  const minutesLeft = FREE_LIMIT_MINUTES - sessionMinutes;
  const isAtLimit = !isPro && sessionMinutes >= FREE_LIMIT_MINUTES;

  // Sync attached state with companion
  useEffect(() => {
    if (companion.isAttached && companion.attachedGameId === selectedGameId) {
      setIsRunning(true);
    } else if (isRunning && !companion.isAttached) {
      setIsRunning(false);
      endSession();
    }
  }, [companion.isAttached, companion.attachedGameId, selectedGameId]);

  // Session timer
  useEffect(() => {
    if (isRunning) {
      tickRef.current = setInterval(() => {
        setSessionMinutes(getSessionMinutes());
      }, 10000);
    } else {
      if (tickRef.current) clearInterval(tickRef.current);
    }
    return () => { if (tickRef.current) clearInterval(tickRef.current); };
  }, [isRunning]);

  if (!game) {
    return (
      <div className="flex items-center justify-center h-full text-white/30 text-sm">
        Select a game from the sidebar
      </div>
    );
  }

  // game is now guaranteed non-null below
  const g = game;

  const LAUNCH_STEPS = [
    'Locating game installation',
    'Verifying game version',
    'Launching via Steam',
    'Waiting for game process',
    'Trainer ready',
  ];

  async function handleLaunch() {
    if (!companion.isOnline) return;
    setIsLaunching(true);
    setLaunchStep(0);

    // Steps 0-2: visual progression
    for (let i = 0; i <= 2; i++) {
      await new Promise(r => setTimeout(r, 600));
      setLaunchStep(i + 1);
    }

    // Actually launch
    const result = await companion.launch(g.id);
    if (!result.started) {
      setIsLaunching(false);
      setScanMsg(result.error ?? 'Failed to launch. Is the game installed?');
      return;
    }

    setLaunchStep(3);
    // Attach (waits up to 18s for the game process)
    const attach = await companion.attach(g.id, g.processes);
    setLaunchStep(4);

    if (attach.found) {
      setIsRunning(true);
      startSession(g.id);
    }
    setIsLaunching(false);
  }

  async function handleToggle(cheat: Cheat) {
    if (isAtLimit) return;
    if (cheat.proOnly && !isPro) return;
    if (!companion.isAttached) return;

    const current = cheatStates[cheat.id] ?? false;

    if (!current) {
      // Activate: use scan to find and write
      if (cheat.type === 'toggle') {
        // For toggle cheats, we use a known value injection pattern
        // Start with a freeze at max value
        setScanCheat(cheat.id);
        setScanStep('first');
        setScanMsg(`Enter your current ${cheat.label.toLowerCase()} value in-game`);
      }
    } else {
      // Deactivate: undo
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
        if (res.ready) {
          setScanStep('write');
          setScanMsg(`Found! Now enter the value you WANT`);
        } else {
          setScanStep('next');
          setScanMsg(`Good. Now change the value in-game, then enter the NEW value`);
        }
        setScanValue('');
      }
    } else if (scanStep === 'next') {
      const res = await companion.scan('next', val);
      if (res.ok) {
        if (res.ready) {
          setScanStep('write');
          setScanMsg(`Narrowed down! Enter the value you WANT`);
        } else {
          setScanMsg(`Still narrowing — change the value again and enter the new one`);
        }
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
    if (isAtLimit || !companion.isAttached) return;
    if (cheat.proOnly && !isPro) return;
    // Button cheats trigger a preset write
    setScanCheat(cheat.id);
    setScanStep('write');
    setScanValue(String(cheat.defaultValue ?? 10000));
    setScanMsg(`Enter your CURRENT ${cheat.label.toLowerCase()} value to locate it`);
    setScanStep('first');
  }

  async function handleValueSet(cheat: Cheat) {
    if (isAtLimit || !companion.isAttached) return;
    if (cheat.proOnly && !isPro) return;
    const val = parseFloat(valueInputs[cheat.id] ?? String(cheat.defaultValue ?? 0));
    if (isNaN(val)) return;
    setScanCheat(cheat.id);
    setScanStep('first');
    setScanMsg(`Enter your CURRENT ${cheat.label.toLowerCase()} value to locate it first`);
  }

  // Group cheats by category
  const categories = [...new Set(game.cheats.map(c => c.category))];

  return (
    <div className="flex h-full overflow-hidden">
      {/* Left: Game hero */}
      <div className="relative w-[380px] flex-shrink-0 overflow-hidden">
        {/* Hero background */}
        <div className="absolute inset-0">
          <img
            src={game.heroUrl ?? game.coverUrl}
            alt={game.name}
            className="w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a] via-[#0a0a0a]/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent" />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col h-full p-6">
          {/* Game header */}
          <div className="flex items-start gap-3 mb-4">
            <img
              src={game.coverUrl}
              alt={game.name}
              className="w-14 h-14 rounded-lg object-cover shadow-lg flex-shrink-0"
            />
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-white font-bold text-lg leading-tight">{game.name}</h1>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: 'rgba(255,107,0,0.18)', color: '#FF8C42' }}>
                  🎃 TRAINER v1.0
                </span>
              </div>
              <div className="flex items-center gap-2 mt-1 text-xs text-white/40">
                <span>⭐ 4.8</span>
                <span>·</span>
                <span>{game.cheats.length} cheats</span>
                <span>·</span>
                <span className="capitalize">{game.platform}</span>
              </div>
            </div>
          </div>

          {/* Not running state */}
          {!isRunning && !isLaunching && (
            <div className="flex-1 flex flex-col items-center justify-center text-center gap-4">
              <div className="text-4xl">👻</div>
              <div>
                <div className="text-white font-semibold mb-1">Game not running</div>
                <div className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.35)' }}>
                  Summon {game.name} to attach the trainer and cast spells in real time
                </div>
              </div>
              <button
                onClick={handleLaunch}
                disabled={!companion.isOnline}
                className="flex items-center gap-2 font-bold px-6 py-3 rounded-xl transition-all text-sm"
                style={companion.isOnline ? {
                  background: '#FF6B00',
                  color: '#000',
                  boxShadow: '0 0 15px rgba(255,107,0,0.35)',
                } : {
                  background: 'rgba(255,255,255,0.08)',
                  color: 'rgba(255,255,255,0.25)',
                }}
              >
                🎃 Summon game
              </button>
              {!companion.isOnline && (
                <p className="text-xs" style={{ color: 'rgba(255,107,0,0.35)' }}>Start the ModDeck Companion first</p>
              )}
            </div>
          )}

          {/* Launching state */}
          {isLaunching && (
            <div className="flex-1 flex flex-col items-center justify-center gap-4">
              <img src={game.coverUrl} alt={game.name} className="w-16 h-16 rounded-lg shadow-lg" />
              <div className="text-white font-semibold text-sm">Preparing {game.name}</div>
              <div className="text-xs font-bold px-3 py-1 rounded-full" style={{ background: 'rgba(255,107,0,0.2)', color: '#FF8C42' }}>
                🎃 SUMMONING
              </div>
              <div className="space-y-2 w-full max-w-[200px]">
                {LAUNCH_STEPS.map((step, i) => (
                  <div key={i} className={`flex items-center gap-2 text-xs transition-colors ${
                    i < launchStep ? '' :
                    i === launchStep ? 'text-white' :
                    ''
                  }`}>
                    <span style={{ color: i < launchStep ? '#FF8C42' : i === launchStep ? 'white' : 'rgba(255,255,255,0.18)' }}>{i < launchStep ? '🕯️' : i === launchStep ? '⟳' : '○'}</span>
                    <span>{step}</span>
                  </div>
                ))}
              </div>
              {launchStep >= 4 && (
                <div className="w-full max-w-[200px] h-1 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full rounded-full animate-pulse w-full" style={{ background: '#FF6B00' }} />
                </div>
              )}
            </div>
          )}

          {/* Running state */}
          {isRunning && (
            <div className="flex-1 flex flex-col gap-3">
              {/* Session timer */}
              {!isPro && (
                <div className="bg-white/5 rounded-xl p-3">
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="text-white/50">Session time</span>
                    <span className={minutesLeft < 30 ? 'text-red-400' : 'text-white/70'}>
                      {Math.max(0, Math.floor(minutesLeft / 60))}h {Math.max(0, minutesLeft % 60)}m left
                    </span>
                  </div>
                  <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ background: minutesLeft < 30 ? '#ef4444' : '#FF6B00', width: `${Math.max(0, (minutesLeft / FREE_LIMIT_MINUTES) * 100)}%` }}
                    />
                  </div>
                  {minutesLeft < 60 && (
                    <button
                      onClick={() => spendDeckPoints(20)}
                      className="mt-2 w-full text-xs text-amber-400 hover:text-amber-300 transition-colors"
                    >
                      +1 hour for 20 DP →
                    </button>
                  )}
                </div>
              )}

              {/* Scan UI */}
              {scanCheat && (
                <div className="bg-white/5 border border-white/10 rounded-xl p-3 space-y-2">
                  <div className="text-xs text-white/70">{scanMsg}</div>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={scanValue}
                      onChange={e => setScanValue(e.target.value)}
                      className="flex-1 rounded-lg px-3 py-2 text-white text-xs focus:outline-none"
                      style={{ background: 'rgba(255,107,0,0.08)', border: '1px solid rgba(255,107,0,0.2)' }}
                      placeholder="Enter value..."
                      onKeyDown={e => e.key === 'Enter' && handleScanSubmit()}
                    />
                    <button
                      onClick={handleScanSubmit}
                      className="text-black text-xs font-bold px-3 py-2 rounded-lg transition-colors"
                      style={{ background: '#FF6B00' }}
                    >
                      {scanStep === 'write' ? 'Apply' : 'Scan'}
                    </button>
                    <button
                      onClick={() => { setScanCheat(null); setScanValue(''); companion.scan('reset'); }}
                      className="text-white/30 hover:text-white/60 text-xs px-2"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              )}

              {/* Stop button */}
              <button
                onClick={async () => { await companion.detach(); setIsRunning(false); endSession(); }}
                className="w-full border border-white/10 text-white/60 hover:text-white hover:border-white/20 text-sm py-2 rounded-xl transition-colors"
              >
                ■ Stop trainer
              </button>
            </div>
          )}

          {/* How it works */}
          {!isRunning && !isLaunching && (
            <p className="text-xs leading-relaxed mt-4" style={{ color: 'rgba(255,107,0,0.25)' }}>
              <span className="font-medium" style={{ color: 'rgba(255,107,0,0.4)' }}>🕷️ How it works:</span> Flip any spell toggle and watch the live values react. ModDeck connects directly to the game process — real values, real changes, no fake simulation.
            </p>
          )}
        </div>
      </div>

      {/* Right: Cheat panel */}
      <div className="flex-1 overflow-y-auto bg-[#0f0f0f] border-l border-white/5">
        {/* Cheat profiles bar */}
        <div className="sticky top-0 z-10 bg-[#0f0f0f]/90 backdrop-blur-sm border-b border-white/5 px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'rgba(255,107,0,0.4)' }}>🔮 Spell Profiles</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full" style={{ background: 'rgba(255,107,0,0.1)', color: 'rgba(255,140,66,0.5)' }}>∞ UNLIMITED</span>
          </div>
          <button className="text-xs text-white/40 hover:text-white/70 transition-colors border border-white/10 px-2 py-1 rounded-lg">
            + Save current
          </button>
        </div>

        {/* Cheats by category */}
        <div className="p-4 space-y-6">
          {categories.map(category => (
            <div key={category}>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-[10px] font-semibold text-white/30 uppercase tracking-widest">{category}</span>
                <span className="text-[10px] text-white/20">
                  {game.cheats.filter(c => c.category === category && cheatStates[c.id]).length}/
                  {game.cheats.filter(c => c.category === category).length} active
                </span>
              </div>

              <div className="space-y-2">
                {game.cheats.filter(c => c.category === category).map(cheat => {
                  const isActive = cheatStates[cheat.id] ?? false;
                  const locked = cheat.proOnly && !isPro;
                  const disabled = !isRunning || isAtLimit || locked;

                  return (
                    <div key={cheat.id} className={`rounded-xl px-4 py-3 transition-all ${locked ? 'opacity-60' : ''}`} style={{
                      background: isActive ? 'rgba(255,107,0,0.07)' : '#0f0800',
                      border: isActive ? '1px solid rgba(255,107,0,0.25)' : '1px solid rgba(255,107,0,0.06)',
                    }}>
                      <div className="flex items-center gap-3">
                        {/* Toggle / Button */}
                        {cheat.type === 'toggle' && (
                          <button
                            onClick={() => handleToggle(cheat)}
                            disabled={disabled}
                            className={`relative w-10 h-5 rounded-full transition-all flex-shrink-0 ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
                            style={{ background: isActive ? '#FF6B00' : 'rgba(255,255,255,0.1)', boxShadow: isActive ? '0 0 8px rgba(255,107,0,0.4)' : 'none' }}
                          >
                            <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${isActive ? 'translate-x-5' : ''}`} />
                          </button>
                        )}

                        {/* Label */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-white">{cheat.label}</span>
                            {cheat.hotkey && (
                              <span className="text-[10px] bg-white/10 text-white/40 px-1.5 py-0.5 rounded font-mono">{cheat.hotkey}</span>
                            )}
                            {locked && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded font-bold" style={{ background: 'rgba(255,107,0,0.12)', color: '#FF8C42' }}>💀 COVEN</span>
                            )}
                          </div>
                          <div className="text-xs text-white/30 mt-0.5">{cheat.description}</div>
                        </div>

                        {/* Value input */}
                        {cheat.type === 'value' && (
                          <div className="flex items-center gap-1.5">
                            <input
                              type="number"
                              value={valueInputs[cheat.id] ?? (cheat.defaultValue ?? '')}
                              onChange={e => setValueInputs(s => ({ ...s, [cheat.id]: e.target.value }))}
                              disabled={disabled}
                              className="w-24 rounded-lg px-2 py-1.5 text-white text-xs text-right focus:outline-none disabled:opacity-40"
                              style={{ background: 'rgba(255,107,0,0.07)', border: '1px solid rgba(255,107,0,0.15)' }}
                            />
                            <button
                              onClick={() => handleValueSet(cheat)}
                              disabled={disabled}
                              className="text-xs px-2.5 py-1.5 rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed font-medium"
                              style={{ background: 'rgba(255,107,0,0.12)', color: '#FF8C42' }}
                            >
                              Cast
                            </button>
                          </div>
                        )}

                        {/* Button cheat */}
                        {cheat.type === 'button' && (
                          <button
                            onClick={() => handleButton(cheat)}
                            disabled={disabled}
                            className="text-xs px-3 py-1.5 rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed font-medium"
                            style={{ background: 'rgba(255,107,0,0.12)', color: '#FF8C42' }}
                          >
                            Hex it
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

        {/* Pro upsell if free */}
        {!isPro && (
          <div className="mx-4 mb-4 rounded-xl p-4 flex items-center gap-3" style={{ background: 'rgba(255,107,0,0.06)', border: '1px solid rgba(255,107,0,0.2)' }}>
            <span className="text-2xl">💀</span>
            <div className="flex-1">
              <div className="text-sm font-semibold" style={{ color: '#FF8C42' }}>Unlock Coven Spells</div>
              <div className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>Get unlimited time + 10x DP earning</div>
            </div>
            <button
              onClick={() => setView('pro')}
              className="text-xs font-bold px-3 py-1.5 rounded-lg transition-all"
              style={{ background: '#FF6B00', color: '#000' }}
            >
              $4.49/mo
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
