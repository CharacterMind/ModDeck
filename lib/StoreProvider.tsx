'use client';

import { useReducer, useEffect, ReactNode } from 'react';
import { StoreContext, reducer, INITIAL_STATE, loadPersisted, savePersisted } from './store';

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE);

  // Hydrate from localStorage
  useEffect(() => {
    const persisted = loadPersisted();
    dispatch({ type: 'LOAD', state: persisted });
    // Welcome bonus: 50 candy on fresh install
    if (!persisted.candyPoints && persisted.firstLoad === false) {
      // already has data, skip
    } else if (persisted.firstLoad !== false) {
      dispatch({ type: 'ADD_CANDY', amount: 50 });
    }
  }, []);

  // Persist on change
  useEffect(() => {
    savePersisted(state);
  }, [state.user, state.selectedGameId, state.plan, state.candyPoints, state.dailySecondsUsed, state.dailyDate]);

  // Daily timer: tick every second while trainer is running
  useEffect(() => {
    if (!state.trainerRunning) return;
    const id = setInterval(() => {
      dispatch({ type: 'TICK' });
    }, 1000);
    return () => clearInterval(id);
  }, [state.trainerRunning]);

  return (
    <StoreContext.Provider value={{ state, dispatch }}>
      {children}
    </StoreContext.Provider>
  );
}
