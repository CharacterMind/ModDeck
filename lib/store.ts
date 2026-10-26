'use client';

import { createContext, useContext, useReducer, useEffect, Dispatch, ReactNode } from 'react';

export type View = 'home' | 'trainer' | 'settings';
export type Plan = 'free' | 'starter' | 'plus' | 'pro';

export interface User {
  id: string;
  name: string;
  avatarUrl?: string;
}

export interface SteamGame {
  appId: number;
  name: string;
}

export interface State {
  view: View;
  selectedGameId: string;
  user: User | null;
  steamGames: SteamGame[];
  steamScanDone: boolean;
  // monetization
  plan: Plan;
  candyPoints: number;
  dailySecondsUsed: number;
  dailyDate: string;         // YYYY-MM-DD — resets timer on new day
  trainerRunning: boolean;   // true while companion is attached
  candyEarned: number;       // lifetime candy earned (for achievement tracking)
  firstLoad: boolean;        // false after first ever load (welcome bonus trigger)
}

export type Action =
  | { type: 'SET_VIEW'; view: View }
  | { type: 'SET_SELECTED_GAME'; id: string }
  | { type: 'SET_USER'; user: User | null }
  | { type: 'SET_STEAM_GAMES'; games: SteamGame[]; done: boolean }
  | { type: 'SET_PLAN'; plan: Plan }
  | { type: 'ADD_CANDY'; amount: number }
  | { type: 'SPEND_CANDY'; amount: number }
  | { type: 'TICK' }
  | { type: 'SET_TRAINER_RUNNING'; running: boolean }
  | { type: 'LOAD'; state: Partial<State> };

// Daily limits in seconds (0 = unlimited)
export const PLAN_LIMITS: Record<Plan, number> = {
  free:    5 * 3600,   // 5 hours
  starter: 10 * 3600,  // 10 hours
  plus:    0,          // unlimited
  pro:     0,          // unlimited
};

// Candy earn: seconds per 1 point
export const CANDY_EARN_RATE: Record<Plan, number> = {
  free:    300,   // 1 pt / 5 min
  starter: 150,   // 1 pt / 2.5 min
  plus:    60,    // 1 pt / 1 min
  pro:     12,    // 5 pt / 1 min
};

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

export const INITIAL_STATE: State = {
  view: 'home',
  selectedGameId: 'supermarket-together',
  user: null,
  steamGames: [],
  steamScanDone: false,
  plan: 'free',
  candyPoints: 0,
  dailySecondsUsed: 0,
  dailyDate: todayStr(),
  trainerRunning: false,
  candyEarned: 0,
  firstLoad: true,
};

export function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SET_VIEW': return { ...state, view: action.view };
    case 'SET_SELECTED_GAME': return { ...state, selectedGameId: action.id, view: 'trainer' };
    case 'SET_USER': return { ...state, user: action.user };
    case 'SET_STEAM_GAMES': return { ...state, steamGames: action.games, steamScanDone: action.done };
    case 'SET_PLAN': return { ...state, plan: action.plan };
    case 'ADD_CANDY': {
      const pts = state.candyPoints + action.amount;
      return { ...state, candyPoints: pts, candyEarned: state.candyEarned + action.amount };
    }
    case 'SPEND_CANDY': {
      const pts = Math.max(0, state.candyPoints - action.amount);
      return { ...state, candyPoints: pts };
    }
    case 'TICK': {
      const today = todayStr();
      const dayReset = state.dailyDate !== today;
      const limit = PLAN_LIMITS[state.plan];
      const currentSecs = dayReset ? 0 : state.dailySecondsUsed;
      const limitHit = limit > 0 && currentSecs >= limit;
      if (limitHit && !dayReset) return state; // no increment if already at limit

      const newSecs = currentSecs + 1;
      // Candy earn: award 1 point every N seconds of play
      const rate = CANDY_EARN_RATE[state.plan];
      const prevBucket = Math.floor(currentSecs / rate);
      const newBucket = Math.floor(newSecs / rate);
      const candyEarned = newBucket > prevBucket ? (state.plan === 'pro' ? 5 : 1) : 0;

      return {
        ...state,
        dailySecondsUsed: newSecs,
        dailyDate: today,
        candyPoints: state.candyPoints + candyEarned,
        candyEarned: state.candyEarned + candyEarned,
      };
    }
    case 'SET_TRAINER_RUNNING': return { ...state, trainerRunning: action.running };
    case 'LOAD': return { ...state, ...action.state, firstLoad: false };
    default: return state;
  }
}

export interface ContextValue {
  state: State;
  dispatch: Dispatch<Action>;
}

export const StoreContext = createContext<ContextValue | null>(null);

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be inside StoreProvider');
  const { state, dispatch } = ctx;

  return {
    ...state,
    dispatch,
    setView: (view: View) => dispatch({ type: 'SET_VIEW', view }),
    setSelectedGame: (id: string) => dispatch({ type: 'SET_SELECTED_GAME', id }),
    setUser: (user: User | null) => dispatch({ type: 'SET_USER', user }),
    setSteamGames: (games: SteamGame[], done: boolean) =>
      dispatch({ type: 'SET_STEAM_GAMES', games, done }),
    setPlan: (plan: Plan) => dispatch({ type: 'SET_PLAN', plan }),
    addCandy: (amount: number) => dispatch({ type: 'ADD_CANDY', amount }),
    spendCandy: (amount: number) => dispatch({ type: 'SPEND_CANDY', amount }),
    setTrainerRunning: (running: boolean) => dispatch({ type: 'SET_TRAINER_RUNNING', running }),
    limitReached: (() => {
      const limit = PLAN_LIMITS[state.plan];
      return limit > 0 && state.dailySecondsUsed >= limit;
    })(),
    secondsRemaining: (() => {
      const limit = PLAN_LIMITS[state.plan];
      if (limit === 0) return Infinity;
      return Math.max(0, limit - state.dailySecondsUsed);
    })(),
  };
}

const STORAGE_KEY = 'moddeck-store-v4';

export function loadPersisted(): Partial<State> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const s = JSON.parse(raw);
    // Reset daily timer if it's a new day
    const today = todayStr();
    return {
      user: s.user,
      selectedGameId: s.selectedGameId,
      plan: s.plan ?? 'free',
      candyPoints: s.candyPoints ?? 0,
      candyEarned: s.candyEarned ?? 0,
      dailySecondsUsed: s.dailyDate === today ? (s.dailySecondsUsed ?? 0) : 0,
      dailyDate: today,
      firstLoad: false,
    };
  } catch { return {}; }
}

export function savePersisted(state: State) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      user: state.user,
      selectedGameId: state.selectedGameId,
      plan: state.plan,
      candyPoints: state.candyPoints,
      candyEarned: state.candyEarned,
      dailySecondsUsed: state.dailySecondsUsed,
      dailyDate: state.dailyDate,
    }));
  } catch {}
}
