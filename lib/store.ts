'use client';

import { createContext, useContext, useReducer, useEffect, Dispatch, ReactNode } from 'react';

export type View = 'trainer' | 'settings';

export interface User {
  id: string;
  name: string;
  avatarUrl?: string;
}

export interface State {
  view: View;
  selectedGameId: string;
  user: User | null;
  hasSeenWelcome: boolean;
}

export type Action =
  | { type: 'SET_VIEW'; view: View }
  | { type: 'SET_USER'; user: User | null }
  | { type: 'SET_SEEN_WELCOME'; v: boolean }
  | { type: 'LOAD'; state: Partial<State> };

export const INITIAL_STATE: State = {
  view: 'trainer',
  selectedGameId: 'supermarket-together',
  user: null,
  hasSeenWelcome: false,
};

export function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SET_VIEW': return { ...state, view: action.view };
    case 'SET_USER': return { ...state, user: action.user };
    case 'SET_SEEN_WELCOME': return { ...state, hasSeenWelcome: action.v };
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
    ...state,
    dispatch,
    setView: (view: View) => dispatch({ type: 'SET_VIEW', view }),
    setUser: (user: User | null) => dispatch({ type: 'SET_USER', user }),
    setHasSeenWelcome: (v: boolean) => dispatch({ type: 'SET_SEEN_WELCOME', v }),
  };
}

const STORAGE_KEY = 'moddeck-store-v2';

export function loadPersisted(): Partial<State> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const { user, hasSeenWelcome } = JSON.parse(raw);
    return { user, hasSeenWelcome };
  } catch { return {}; }
}

export function savePersisted(state: State) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      user: state.user,
      hasSeenWelcome: state.hasSeenWelcome,
    }));
  } catch {}
}
