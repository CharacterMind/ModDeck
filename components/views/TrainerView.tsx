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
const RED = '#ef4444';
const BORDER = 'rgba(255,255,255,0.06)';

type PoolStep = 'idle' | 'step1' | 'step2' | 'done';
interface PoolState {
  step: PoolStep;
  scanning: boolean;
  input: string;
  count: number;
  error: string;
}

const defaultPool = (): PoolState => ({
  step: 'idle', scanning: false, input: '', count: 0, error: '',
});

type FreezeMap = Record<string, boolean>;

function CategoryIcon({ cat }: { cat: string }) {
  if (cat === 'ECONOMY') return (
    <svg width="12" height="12" viewBox="0 0 13 13" fill="currentColor" opacity=".45">
      <circle cx="6.5" cy="6.5" r="5.5" stroke="currentColor" strokeWidth="1.1" fill="none"/>
      <text x="6.5" y="10" textAnchor="middle" fontSize="8" fontWeight="700">$</text>
    </svg>
  );
  if (cat === 'STORE') return (
    <svg width="12" height="12" viewBox="0 0 13 13" fill="none" opacity=".45">
      <rect x="1.5" y="1.5" width="10" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.1"/>
      <path d="M4 6.5h5M4 8.5h3" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
    </svg>
  );
  return (
    <svg width="12" height="12" viewBox="0 0 13 13" fill="none" opacity=".45">
      <path d="M2 10L5 7L7.5 9L11 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
  );
}

export default function TrainerView({ companion }: Props) {
  const { selectedGameId, limitReached, candyPoints, spendCandy, setView } = useStore();
  const game = GAMES.find(g => g.id === selectedGameId) ?? GAMES[0];

  const [activeTab, setActiveTab] = useState('ALL');
  const [isLaunching, setIsLaunching] = useState(false);
  const [launchStep, setLaunchStep] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  const [pools, setPools] = useState<Record<string, PoolState>>({});
  const [frozen, setFrozen] = useState<FreezeMap>({});
  const [valueInputs, setValueInputs] = useState<Record<string, string>>({});
  const [writing, setWriting] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setPools({});
    setFrozen({});
    setValueInputs({});
    setWriting({});
    setActiveTab('ALL');
  }, [selectedGameId]);

  useEffect(() => {
    if (companion.isAttached && companion.attachedGameId === selectedGameId) setIsRunning(true);
    else if (!companion.isAttached && isRunning) {
      setIsRunning(false);
      setFrozen({});
    }
  }, [companion.isAttached, companion.attachedGameId, selectedGameId]);

  const LAUNCH_STEPS = ['Locating game', 'Launching via Steam', 'Loading game…', 'Game loading — can take up to 90s', 'Trainer ready'];

  async function handleLaunch() {
    if (!companion.isOnline) { window.open(`steam://rungameid/${game.steamAppId}`); return; }
    setIsLaunching(true);
    setLaunchStep(0);
    await new Promise(r => setTimeout(r, 500)); setLaunchStep(1);
    const result = await companion.launch(game.id);
    if (!result.started) { setIsLaunching(false); return; }
    setLaunchStep(2);
    await new Promise(r => setTimeout(r, 3000)); setLaunchStep(3);
    const attach = await companion.attach(game.id, game.processes);
    setLaunchStep(4);
    if (attach.found) setIsRunning(true);
    setIsLaunching(false);
  }

  function poolKey(cheat: Cheat) { return cheat.pool ?? cheat.id; }

  function setPool(pool: string, patch: Partial<PoolState>) {
    setPools(p => ({ ...p, [pool]: { ...(p[pool] ?? defaultPool()), ...patch } }));
  }

  async function startCalibration(pool: string) {
    setPool(pool, { step: 'step1', scanning: false, input: '', count: 0, error: '' });
  }

  async function handleCalibrate(pool: string) {
    const ps = pools[pool] ?? defaultPool();
    const val = parseFloat(ps.input);
    if (isNaN(val)) { setPool(pool, { error: 'Enter a number' }); return; }

    setPool(pool, { scanning: true, error: '' });

    if (ps.step === 'step1') {
      const res = await companion.scan('first', val, false, undefined, pool);
      if (!res.ok) { setPool(pool, { scanning: false, error: res.error ?? 'Scan failed' }); return; }
      const count = res.counts?.float ?? 0;
      if (count === 0) {
        setPool(pool, { scanning: false, error: 'No matches — enter the exact value shown in-game' });
      } else if (count <= 10) {
        setPool(pool, { scanning: false, step: 'done', count, input: '' });
      } else {
        setPool(pool, { scanning: false, step: 'step2', count, input: '' });
      }
    } else if (ps.step === 'step2') {
      const res = await companion.scan('next', val, false, undefined, pool);
      if (!res.ok) { setPool(pool, { scanning: false, error: res.error ?? 'Narrow failed' }); return; }
      const count = res.counts?.float ?? 0;
      if (count === 0) {
        setPool(pool, { scanning: false, error: 'No matches — re-enter your CURRENT value and try again', step: 'step1', input: '' });
      } else if (count <= 10) {
        setPool(pool, { scanning: false, step: 'done', count, input: '' });
      } else if (count <= 200) {
        setPool(pool, { scanning: false, step: 'step2', count, input: '', error: `${count} results — change the value in-game again` });
      } else {
        setPool(pool, { scanning: false, error: `${count} results still too broad — change value significantly`, input: '' });
      }
    }
  }

  async function handleToggle(cheat: Cheat) {
    const pool = poolKey(cheat);
    const ps = pools[pool] ?? defaultPool();
    if (!isRunning || limitReached) return;
    if (ps.step !== 'done') { startCalibration(pool); return; }

    const isOn = frozen[pool] ?? false;
    if (isOn) {
      await companion.scan('undo', undefined, undefined, undefined, pool);
      setFrozen(f => ({ ...f, [pool]: false }));
    } else {
      const writeVal = cheat.writeValue ?? 9999999;
      setWriting(w => ({ ...w, [cheat.id]: true }));
      const res = await companion.scan('write', writeVal, true, undefined, pool);
      setWriting(w => ({ ...w, [cheat.id]: false }));
      if (res.ok && (res.written ?? 0) > 0) setFrozen(f => ({ ...f, [pool]: true }));
    }
  }

  async function handleValueSet(cheat: Cheat) {
    const pool = poolKey(cheat);
    const ps = pools[pool] ?? defaultPool();
    if (!isRunning || limitReached) return;
    if (ps.step !== 'done') { startCalibration(pool); return; }

    const rawVal = valueInputs[cheat.id] ?? String(cheat.defaultValue ?? '');
    const val = parseFloat(rawVal);
    if (isNaN(val)) return;

    setWriting(w => ({ ...w, [cheat.id]: true }));
    await companion.scan('write', val, false, undefined, pool);
    setWriting(w => ({ ...w, [cheat.id]: false }));
  }

  async function handleButton(cheat: Cheat) {
    const pool = poolKey(cheat);
    const ps = pools[pool] ?? defaultPool();
    if (!isRunning || limitReached) return;
    if (ps.step !== 'done') { startCalibration(pool); return; }

    setWriting(w => ({ ...w, [cheat.id]: true }));
    await companion.scan('write', 9999999, false, undefined, pool);
    setWriting(w => ({ ...w, [cheat.id]: false }));
  }

  function CalibrationPanel({ pool, label }: { pool: string; label: string }) {
    const ps = pools[pool] ?? defaultPool();

    let prompt = '';
    let hint = '';
    if (ps.step === 'step1') {
      prompt = `Enter your CURRENT ${label.toLowerCase()} shown in-game`;
      hint = 'ModDeck will scan memory to find where it\'s stored';
    } else if (ps.step === 'step2') {
      prompt = ps.error || `Change ${label.toLowerCase()} in-game, enter the NEW amount`;
      hint = `${ps.count} candidates found — one more scan will pinpoint it`;
    }

    return (
      <div style={{ padding: '10px 14px', background: A_DIM, border: `1px solid ${A_BORDER}`, borderTop: 'none', borderRadius: '0 0 8px 8px' }}>
        <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)', marginBottom: '8px', lineHeight: '1.4' }}>
          {prompt}
          {hint && <div style={{ marginTop: '2px', color: 'rgba(255,255,255,0.3)', fontSize: '10px' }}>{hint}</div>}
        </div>
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          <input
            autoFocus
            type="number"
            value={ps.input}
            onChange={e => setPool(pool, { input: e.target.value, error: '' })}
            onKeyDown={e => e.key === 'Enter' && handleCalibrate(pool)}
            placeholder={ps.step === 'step1' ? 'e.g. 1500.00' : 'New value…'}
            style={{ flex: 1, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '6px', padding: '6px 8px', color: 'white', fontSize: '12px', outline: 'none', minWidth: 0 }}
          />
          <button
            onClick={() => handleCalibrate(pool)}
            disabled={ps.scanning || !ps.input}
            style={{ background: A, color: 'white', border: 'none', borderRadius: '6px', padding: '6px 12px', fontSize: '12px', fontWeight: 700, cursor: ps.scanning ? 'default' : 'pointer', opacity: ps.scanning || !ps.input ? 0.6 : 1, flexShrink: 0 }}
          >
            {ps.scanning ? '…' : ps.step === 'step1' ? 'Scan' : 'Narrow'}
          </button>
          <button
            onClick={() => { setPool(pool, defaultPool()); companion.scan('reset', undefined, undefined, undefined, pool); }}
            style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.25)', cursor: 'pointer', fontSize: '18px', padding: '0 4px', lineHeight: 1, flexShrink: 0 }}
            title="Cancel"
          >×</button>
        </div>
        {ps.error && <div style={{ marginTop: '6px', fontSize: '11px', color: RED }}>{ps.error}</div>}
      </div>
    );
  }

  const categories = [...new Set(game.cheats.map(c => c.category))];
  const visibleCheats = activeTab === 'ALL' ? game.cheats : game.cheats.filter(c => c.category === activeTab);
  const visibleCategories = activeTab === 'ALL' ? categories : categories.filter(c => c === activeTab);
  const activeCount = Object.values(frozen).filter(Boolean).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', background: '#0f0f12' }}>
      {/* Cinematic game header */}
      <div style={{ position: 'relative', flexShrink: 0, overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0 }}>
          <img src={game.heroUrl ?? game.coverUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.15, filter: 'blur(14px)', transform: 'scale(1.12)' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(15,15,18,0.4), #0f0f12)' }} />
        </div>

        <div style={{ position: 'relative', zIndex: 1, padding: '20px 24px 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
            <img src={game.coverUrl} alt={game.name} style={{ width: '52px', height: '52px', borderRadius: '8px', objectFit: 'cover', flexShrink: 0, boxShadow: '0 4px 16px rgba(0,0,0,0.6)' }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <h1 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: 'white' }}>{game.name}</h1>
              <div style={{ display: 'flex', gap: '6px', marginTop: '3px', fontSize: '11px', color: 'rgba(255,255,255,0.35)' }}>
                <span>{game.genre}</span>
                <span>·</span>
                <span>{game.cheats.length} cheats</span>
                {activeCount > 0 && (
                  <><span>·</span><span style={{ color: GREEN }}>{activeCount} active</span></>
                )}
              </div>
            </div>
            <div style={{ flexShrink: 0 }}>
              {isRunning ? (
                <button
                  onClick={async () => { await companion.detach(); setIsRunning(false); setFrozen({}); }}
                  style={{ padding: '8px 16px', borderRadius: '7px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.6)', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
                >
                  ■ Stop Trainer
                </button>
              ) : (
                <button
                  onClick={handleLaunch}
                  disabled={isLaunching}
                  style={{ padding: '8px 20px', borderRadius: '7px', border: 'none', background: isLaunching ? 'rgba(255,255,255,0.08)' : A, color: 'white', fontSize: '13px', fontWeight: 700, cursor: isLaunching ? 'default' : 'pointer', boxShadow: isLaunching ? 'none' : '0 0 16px rgba(124,92,252,0.3)' }}
                >
                  {isLaunching ? LAUNCH_STEPS[launchStep] ?? '…' : '▶ Play'}
                </button>
              )}
            </div>
          </div>

          {/* Category tabs */}
          <div style={{ display: 'flex', gap: '0', borderBottom: `1px solid ${BORDER}` }}>
            {['ALL', ...categories].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{ padding: '8px 14px', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '12px', fontWeight: 600, letterSpacing: '0.04em', color: activeTab === tab ? 'white' : 'rgba(255,255,255,0.35)', borderBottom: activeTab === tab ? `2px solid ${A}` : '2px solid transparent', marginBottom: '-1px' }}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Status / limit banner */}
      {limitReached && (
        <div style={{ flexShrink: 0, margin: '12px 24px 0', padding: '10px 16px', background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '16px' }}>⏱</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '13px', fontWeight: 600, color: 'white' }}>5h daily limit reached</div>
            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginTop: '1px' }}>Cheats are paused until tomorrow, or spend 50 🍬 for +1 hour</div>
          </div>
          <button
            onClick={() => candyPoints >= 50 && spendCandy(50)}
            disabled={candyPoints < 50}
            style={{ padding: '6px 12px', borderRadius: '6px', border: 'none', background: candyPoints >= 50 ? '#f472b6' : 'rgba(244,114,182,0.2)', color: 'white', fontSize: '12px', fontWeight: 700, cursor: candyPoints >= 50 ? 'pointer' : 'not-allowed', flexShrink: 0, opacity: candyPoints < 50 ? 0.5 : 1 }}
          >
            Spend 50 🍬
          </button>
          <button
            onClick={() => setView('settings')}
            style={{ padding: '6px 12px', borderRadius: '6px', border: 'none', background: A, color: 'white', fontSize: '12px', fontWeight: 700, cursor: 'pointer', flexShrink: 0 }}
          >
            Upgrade
          </button>
        </div>
      )}

      {!isRunning && !isLaunching && !limitReached && (
        <div style={{ flexShrink: 0, margin: '12px 24px 0', padding: '10px 16px', background: 'rgba(124,92,252,0.05)', border: `1px solid ${A_BORDER}`, borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', flexShrink: 0 }} />
          <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', flex: 1 }}>Game not running — launch to activate cheats in real time</span>
          <button onClick={handleLaunch} style={{ fontSize: '12px', fontWeight: 600, padding: '5px 12px', borderRadius: '6px', background: A, color: 'white', border: 'none', cursor: 'pointer', flexShrink: 0 }}>Launch</button>
        </div>
      )}

      {isRunning && !limitReached && (
        <div style={{ flexShrink: 0, margin: '12px 24px 0', padding: '8px 14px', background: 'rgba(0,201,79,0.06)', border: '1px solid rgba(0,201,79,0.18)', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: GREEN, boxShadow: `0 0 6px ${GREEN}`, flexShrink: 0 }} />
          <span style={{ fontSize: '12px', color: GREEN, fontWeight: 500 }}>Trainer active — toggle cheats below to apply them in real time</span>
        </div>
      )}

      {/* Flat cheat list */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px 24px' }}>
        {isRunning && Object.keys(pools).length === 0 && !limitReached && (
          <div style={{ marginBottom: '14px', padding: '10px 14px', background: 'rgba(255,255,255,0.025)', border: `1px solid ${BORDER}`, borderRadius: '8px', fontSize: '11px', color: 'rgba(255,255,255,0.35)', lineHeight: '1.5' }}>
            Click any cheat to activate it. The first time, ModDeck will ask for your current in-game value to locate it in memory — <strong style={{ color: 'rgba(255,255,255,0.5)' }}>one-time per session</strong>. After that, all cheats in the same group activate instantly.
          </div>
        )}

        {visibleCategories.map(category => {
          const cheats = visibleCheats.filter(c => c.category === category);
          if (!cheats.length) return null;
          return (
            <div key={category} style={{ marginBottom: '20px' }}>
              {/* Category header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', padding: '0 2px' }}>
                <CategoryIcon cat={category} />
                <span style={{ fontSize: '10px', fontWeight: 700, color: 'rgba(255,255,255,0.25)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{category}</span>
                <div style={{ flex: 1, height: '1px', background: BORDER }} />
                <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.18)' }}>
                  {cheats.filter(c => frozen[poolKey(c)]).length}/{cheats.length}
                </span>
              </div>

              {/* Flat single-column list */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                {cheats.map(cheat => {
                  const pool = poolKey(cheat);
                  const ps = pools[pool] ?? defaultPool();
                  const isCalibrating = ps.step === 'step1' || ps.step === 'step2';
                  const isCalibrated = ps.step === 'done';
                  const isActive = frozen[pool] ?? false;
                  const isWriting = writing[cheat.id] ?? false;
                  const disabled = !isRunning || limitReached;

                  return (
                    <div key={cheat.id}>
                      <div
                        style={{
                          display: 'flex', alignItems: 'center', gap: '12px',
                          padding: '10px 14px',
                          borderRadius: isCalibrating ? '8px 8px 0 0' : '8px',
                          background: isActive
                            ? 'rgba(0,201,79,0.05)'
                            : isCalibrating
                            ? 'rgba(124,92,252,0.07)'
                            : 'rgba(255,255,255,0.025)',
                          borderLeft: isActive
                            ? `3px solid ${GREEN}`
                            : isCalibrating
                            ? `3px solid ${A}`
                            : '3px solid transparent',
                          border: isCalibrating
                            ? `1px solid ${A_BORDER}`
                            : isActive
                            ? '1px solid rgba(0,201,79,0.18)'
                            : `1px solid ${BORDER}`,
                          borderBottom: isCalibrating ? 'none' : undefined,
                          transition: 'background 0.15s',
                        }}
                      >
                        {/* Status dot */}
                        <div style={{
                          width: '8px', height: '8px', borderRadius: '50%', flexShrink: 0,
                          background: isActive ? GREEN : isCalibrating ? A : 'rgba(255,255,255,0.14)',
                          boxShadow: isActive ? `0 0 6px ${GREEN}` : 'none',
                          transition: 'background 0.15s, box-shadow 0.15s',
                        }} />

                        {/* Label + desc */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{
                            fontSize: '13px', fontWeight: isActive ? 600 : 500,
                            color: disabled ? 'rgba(255,255,255,0.28)' : isActive ? 'white' : 'rgba(255,255,255,0.85)',
                            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                          }}>
                            {cheat.label}
                          </div>
                          <div style={{
                            fontSize: '11px', marginTop: '1px',
                            color: isCalibrated
                              ? 'rgba(124,92,252,0.65)'
                              : isActive
                              ? 'rgba(0,201,79,0.6)'
                              : 'rgba(255,255,255,0.28)',
                            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                          }}>
                            {isCalibrating ? '● Calibrating…' : isCalibrated && isActive ? '● Active' : isCalibrated ? 'Calibrated — click to toggle' : cheat.description}
                          </div>
                        </div>

                        {/* Controls */}
                        {cheat.type === 'toggle' && (
                          <button
                            onClick={() => handleToggle(cheat)}
                            disabled={disabled || isWriting}
                            style={{
                              position: 'relative', width: '36px', height: '18px', borderRadius: '9999px', flexShrink: 0,
                              border: 'none', cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.3 : 1,
                              background: isActive ? GREEN : 'rgba(255,255,255,0.12)',
                              transition: 'background 0.15s',
                              boxShadow: isActive ? `0 0 8px rgba(0,201,79,0.4)` : 'none',
                            }}
                          >
                            <span style={{
                              position: 'absolute', top: '2px', left: '2px', width: '14px', height: '14px',
                              borderRadius: '50%', background: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.4)',
                              transform: isActive ? 'translateX(18px)' : 'none', transition: 'transform 0.15s', display: 'block',
                            }} />
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
                            <button
                              onClick={() => handleValueSet(cheat)}
                              disabled={disabled || isWriting}
                              style={{ fontSize: '11px', padding: '5px 10px', borderRadius: '5px', fontWeight: 600, background: A_DIM, color: A, border: `1px solid ${A_BORDER}`, cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled || isWriting ? 0.4 : 1, flexShrink: 0 }}
                            >
                              {isWriting ? '…' : 'Set'}
                            </button>
                          </div>
                        )}

                        {cheat.type === 'button' && (
                          <button
                            onClick={() => handleButton(cheat)}
                            disabled={disabled || isWriting}
                            style={{ fontSize: '11px', padding: '5px 12px', borderRadius: '5px', fontWeight: 600, background: isWriting ? 'rgba(255,255,255,0.04)' : A_DIM, color: A, border: `1px solid ${A_BORDER}`, cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled || isWriting ? 0.4 : 1, flexShrink: 0 }}
                          >
                            {isWriting ? '…' : 'Apply'}
                          </button>
                        )}

                        {cheat.hotkey && (
                          <span style={{ fontSize: '10px', background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.28)', padding: '2px 6px', borderRadius: '4px', fontFamily: 'monospace', letterSpacing: '0.05em', flexShrink: 0 }}>
                            {cheat.hotkey}
                          </span>
                        )}
                      </div>

                      {isCalibrating && <CalibrationPanel pool={pool} label={cheat.label} />}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        <div style={{ marginTop: '12px', padding: '14px 18px', borderRadius: '8px', background: `linear-gradient(135deg, rgba(124,92,252,0.1) 0%, rgba(124,92,252,0.03) 100%)`, border: `1px solid ${A_BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
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
