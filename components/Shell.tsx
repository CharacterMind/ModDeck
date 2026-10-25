'use client';

import { useEffect } from 'react';
import { useStore } from '@/lib/store';
import { StoreProvider } from '@/lib/StoreProvider';
import { useCompanion } from '@/hooks/useCompanion';
import Sidebar from './Sidebar';
import StatusBar from './StatusBar';
import TrainerView from './views/TrainerView';
import SettingsView from './views/SettingsView';

function App() {
  const { view, dispatch } = useStore();
  const companion = useCompanion();

  // Detect installed Steam games once on startup
  useEffect(() => {
    fetch('/api/steam-library')
      .then(r => r.json())
      .then(data => dispatch({ type: 'SET_STEAM_GAMES', games: data.games ?? [], done: true }))
      .catch(() => dispatch({ type: 'SET_STEAM_GAMES', games: [], done: true }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', background: '#0d0d12', color: 'white' }}>
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden', minHeight: 0 }}>
        <Sidebar companion={companion} />
        <main style={{ flex: 1, overflow: 'hidden', minWidth: 0, display: 'flex', flexDirection: 'column' }}>
          <div style={{ flex: 1, overflow: 'hidden', minHeight: 0 }}>
            {view === 'trainer' && <TrainerView companion={companion} />}
            {view === 'settings' && <SettingsView />}
          </div>
        </main>
      </div>
      <StatusBar companion={companion} />
    </div>
  );
}

export default function Shell() {
  return (
    <StoreProvider>
      <App />
    </StoreProvider>
  );
}
