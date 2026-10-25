'use client';

import { createContext, useContext, useReducer, useEffect, Dispatch, ReactNode } from 'react';
import { GAMES } from '@/data/games';

export type View = 'home' | 'library' | 'trainer' | 'pro' | 'settings' | 'ai' | 'pulse';
export type Plan = 'free' | 'pro';

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  plan: Plan;
  deckPoints: number;
  hoursPlayed: number;
  joinedAt: number;
}

export interface State {
  view: View;
  selectedGameId: string | null;
  user: User | null;
  myGameIds: string[];
  hasSeenWelcome: boolean;
  sessionStart: number | null;
  sessionGameId: string | null;
}

export type Action =
  | { type: 'SET_VIEW'; view: View }
  | { type: 'SET_SELECTED_GAME'; id: string | null }
  | { type: 'SET_USER'; user: User | null }
  | { type: 'UPDATE_USER'; patch: Partial<User> }
  | { type: 'ADD_DP'; amount: number }
  | { type: 'SPEND_DP'; amount: number }
  | { type: 'ADD_MY_GAME'; id: string }
  | { type: 'REMOVE_MY_GAME'; id: string }
  | { type: 'SET_SEEN_WELCOME'; v: boolean }
  | { type: 'START_SESSION'; gameId: string }
  | { type: 'END_SESSION' }
  | { type: 'LOAD'; state: Partial<State> };

export const INITIAL_STATE: State = {
  view: 'home',
  selectedGameId: null,
  user: null,
  myGameIds: GAMES.slice(0, 4).map(g => g.id),
  hasSeenWelcome: false,
  sessionStart: null,
  sessionGameId: null,
};

export function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SET_VIEW': return { ...state, view: action.view };
    case 'SET_SELECTED_GAME': return { ...state, selectedGameId: action.id };
    case 'SET_USER': return { ...state, user: action.user };
    case 'UPDATE_USER':
      return state.user ? { ...state, user: { ...state.user, ...action.patch } } : state;
    case 'ADD_DP':
      return state.user ? { ...state, user: { ...state.user, deckPoints: state.user.deckPoints + action.amount } } : state;
    case 'SPEND_DP':
      if (!state.user || state.user.deckPoints < action.amount) return state;
      return { ...state, user: { ...state.user, deckPoints: state.user.deckPoints - action.amount } };
    case 'ADD_MY_GAME':
      return state.myGameIds.includes(action.id) ? state : { ...state, myGameIds: [...state.myGameIds, action.id] };
    case 'REMOVE_MY_GAME':
      return { ...state, myGameIds: state.myGameIds.filter(x => x !== action.id) };
    case 'SET_SEEN_WELCOME': return { ...state, hasSeenWelcome: action.v };
    case 'START_SESSION': return { ...state, sessionStart: Date.now(), sessionGameId: action.gameId };
    case 'END_SESSION': {
      if (!state.sessionStart || !state.user) return { ...state, sessionStart: null, sessionGameId: null };
      const hours = (Date.now() - state.sessionStart) / 3600000;
      const earned = Math.floor(hours * (state.user.plan === 'pro' ? 10 : 2));
      return {
        ...state,
        sessionStart: null,
        sessionGameId: null,
        user: { ...state.user, deckPoints: state.user.deckPoints + earned, hoursPlayed: state.user.hoursPlayed + hours },
      };
    }
    case 'LOAD': return { ...state, ...action.state };
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
    // state
    ...state,
    dispatch,
    // helpers
    setView: (view: View) => dispatch({ type: 'SET_VIEW', view }),
    setSelectedGame: (id: string | null) => dispatch({ type: 'SET_SELECTED_GAME', id }),
    setUser: (user: User | null) => dispatch({ type: 'SET_USER', user }),
    updateUser: (patch: Partial<User>) => dispatch({ type: 'UPDATE_USER', patch }),
    addDeckPoints: (amount: number) => dispatch({ type: 'ADD_DP', amount }),
    spendDeckPoints: (amount: number) => {
      if (!state.user || state.user.deckPoints < amount) return false;
      dispatch({ type: 'SPEND_DP', amount });
      return true;
    },
    addMyGame: (id: string) => dispatch({ type: 'ADD_MY_GAME', id }),
    removeMyGame: (id: string) => dispatch({ type: 'REMOVE_MY_GAME', id }),
    setHasSeenWelcome: (v: boolean) => dispatch({ type: 'SET_SEEN_WELCOME', v }),
    startSession: (gameId: string) => dispatch({ type: 'START_SESSION', gameId }),
    endSession: () => dispatch({ type: 'END_SESSION' }),
    getSessionMinutes: () => state.sessionStart ? Math.floor((Date.now() - state.sessionStart) / 60000) : 0,
  };
}

export const FREE_SESSION_HOURS = 5;

const STORAGE_KEY = 'moddeck-store-v1';

export function loadPersisted(): Partial<State> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const { user, myGameIds, hasSeenWelcome } = JSON.parse(raw);
    return { user, myGameIds, hasSeenWelcome };
  } catch { return {}; }
}

export function savePersisted(state: State) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      user: state.user,
      myGameIds: state.myGameIds,
      hasSeenWelcome: state.hasSeenWelcome,
    }));
  } catch {}
}
