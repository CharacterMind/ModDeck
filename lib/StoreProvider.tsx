'use client';

import { useReducer, useEffect, ReactNode } from 'react';
import { StoreContext, reducer, INITIAL_STATE, loadPersisted, savePersisted } from './store';

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE);

  useEffect(() => {
    const persisted = loadPersisted();
    if (Object.keys(persisted).length) {
      dispatch({ type: 'LOAD', state: persisted });
    }
  }, []);

  useEffect(() => {
    savePersisted(state);
  }, [state.user, state.hasSeenWelcome]);

  return (
    <StoreContext.Provider value={{ state, dispatch }}>
      {children}
    </StoreContext.Provider>
  );
}
