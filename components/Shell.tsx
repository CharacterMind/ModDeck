'use client';

import { useEffect, useState } from 'react';
import { useStore } from '@/lib/store';
import { StoreProvider } from '@/lib/StoreProvider';
import { useCompanion } from '@/hooks/useCompanion';
import Sidebar from './Sidebar';
import StatusBar from './StatusBar';
import TrainerView from './views/TrainerView';
import SettingsView from './views/SettingsView';
import WelcomeModal from './WelcomeModal';

function App() {
  const { view, user, setUser, hasSeenWelcome, setHasSeenWelcome } = useStore();
  const companion = useCompanion();
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    if (!hasSeenWelcome && !user) {
      const t = setTimeout(() => setShowWelcome(true), 300);
      return () => clearTimeout(t);
    }
  }, [hasSeenWelcome, user]);

  function handleWelcomeComplete(name: string) {
    setUser({ id: crypto.randomUUID(), name });
    setHasSeenWelcome(true);
    setShowWelcome(false);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', background: '#0a0a0a', color: 'white' }}>
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
      {showWelcome && <WelcomeModal onComplete={handleWelcomeComplete} />}
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
