'use client';

import { useEffect } from 'react';
import { StoreProvider } from '@/lib/StoreProvider';
import { useStore } from '@/lib/store';
import { useCompanion } from '@/hooks/useCompanion';
import Sidebar from './Sidebar';
import StatusBar from './StatusBar';
import HomeView from './views/HomeView';
import TrainerView from './views/TrainerView';
import SettingsView from './views/SettingsView';

function App() {
  const { view, setTrainerRunning } = useStore();
  const companion = useCompanion();

  // Sync companion attach state → global store (drives daily timer + status bar)
  useEffect(() => {
    setTrainerRunning(companion.isAttached);
  }, [companion.isAttached]);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', background: '#0d0d12', color: 'white' }}>
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden', minHeight: 0 }}>
        <Sidebar />
        <main style={{ flex: 1, overflow: 'hidden', minWidth: 0, display: 'flex', flexDirection: 'column' }}>
          <div style={{ flex: 1, overflow: 'hidden', minHeight: 0 }}>
            {view === 'home'    && <HomeView companion={companion} />}
            {view === 'trainer' && <TrainerView companion={companion} />}
            {view === 'settings' && <SettingsView />}
          </div>
        </main>
      </div>
      <StatusBar />
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
