'use client';

import { createContext, useContext, useReducer, useEffect, Dispatch, ReactNode } from 'react';

export type View = 'trainer' | 'settings';

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
}

export type Action =
  | { type: 'SET_VIEW'; view: View }
  | { type: 'SET_SELECTED_GAME'; id: string }
  | { type: 'SET_USER'; user: User | null }
  | { type: 'SET_STEAM_GAMES'; games: SteamGame[]; done: boolean }
  | { type: 'LOAD'; state: Partial<State> };

export const INITIAL_STATE: State = {
  view: 'trainer',
  selectedGameId: 'supermarket-simulator',
  user: null,
  steamGames: [],
  steamScanDone: false,
};

export function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SET_VIEW': return { ...state, view: action.view };
    case 'SET_SELECTED_GAME': return { ...state, selectedGameId: action.id, view: 'trainer' };
    case 'SET_USER': return { ...state, user: action.user };
    case 'SET_STEAM_GAMES': return { ...state, steamGames: action.games, steamScanDone: action.done };
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
    setSelectedGame: (id: string) => dispatch({ type: 'SET_SELECTED_GAME', id }),
    setUser: (user: User | null) => dispatch({ type: 'SET_USER', user }),
    setSteamGames: (games: SteamGame[], done: boolean) =>
      dispatch({ type: 'SET_STEAM_GAMES', games, done }),
  };
}

const STORAGE_KEY = 'moddeck-store-v3';

export function loadPersisted(): Partial<State> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const { user, selectedGameId } = JSON.parse(raw);
    return { user, selectedGameId };
  } catch { return {}; }
}

export function savePersisted(state: State) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      user: state.user,
      selectedGameId: state.selectedGameId,
    }));
  } catch {}
}
