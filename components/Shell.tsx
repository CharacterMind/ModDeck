'use client';

import { useEffect, useState } from 'react';
import { useStore } from '@/lib/store';
import { StoreProvider } from '@/lib/StoreProvider';
import { useCompanion } from '@/hooks/useCompanion';
import { GAMES } from '@/data/games';
import Sidebar from './Sidebar';
import StatusBar from './StatusBar';
import HomeView from './views/HomeView';
import LibraryView from './views/LibraryView';
import TrainerView from './views/TrainerView';
import ProView from './views/ProView';
import SettingsView from './views/SettingsView';
import WelcomeModal from './WelcomeModal';
import DailyLimitBanner from './DailyLimitBanner';
import WhatsNewModal from './WhatsNewModal';
import { CHANGELOG } from '@/data/changelog';

const WN_STORAGE_KEY = 'md_wn_seen';
const LATEST_VERSION = CHANGELOG[0]?.version ?? '';

function App() {
  const { view, user, setUser, hasSeenWelcome, setHasSeenWelcome } = useStore();
  const companion = useCompanion();
  const [showWelcome, setShowWelcome] = useState(false);
  const [showWhatsNew, setShowWhatsNew] = useState(false);
  const [hasUnreadWN, setHasUnreadWN] = useState(false);

  useEffect(() => {
    if (companion.isOnline) {
      companion.syncGames(GAMES.map(g => ({ gameId: g.id, name: g.name })));
    }
  }, [companion.isOnline]);

  useEffect(() => {
    if (!hasSeenWelcome && !user) {
      const t = setTimeout(() => setShowWelcome(true), 300);
      return () => clearTimeout(t);
    }
  }, [hasSeenWelcome, user]);

  // Auto-pop What's New when there's a version the user hasn't seen
  useEffect(() => {
    let seen = '';
    try { seen = localStorage.getItem(WN_STORAGE_KEY) ?? ''; } catch (_) {}
    if (seen !== LATEST_VERSION) {
      setHasUnreadWN(true);
      // Only auto-open after welcome is done (skip on very first visit)
      if (hasSeenWelcome) {
        const t = setTimeout(() => setShowWhatsNew(true), 600);
        return () => clearTimeout(t);
      }
    }
  }, [hasSeenWelcome]);

  function closeWhatsNew() {
    setShowWhatsNew(false);
    setHasUnreadWN(false);
    try { localStorage.setItem(WN_STORAGE_KEY, LATEST_VERSION); } catch (_) {}
  }

  const handleWelcomeComplete = (name: string) => {
    setUser({
      id: crypto.randomUUID(),
      name,
      email: '',
      plan: 'free',
      deckPoints: 50,
      hoursPlayed: 0,
      joinedAt: Date.now(),
    });
    setHasSeenWelcome(true);
    setShowWelcome(false);
  };

  return (
    <div className="flex flex-col h-screen bg-[#0a0a0a] text-white overflow-hidden" style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', background: '#0a0a0a' }}>
      <div className="flex flex-1 overflow-hidden" style={{ display: 'flex', flex: 1, overflow: 'hidden', minHeight: 0 }}>
        <Sidebar companion={companion} onWhatsNew={() => setShowWhatsNew(true)} hasUnreadWN={hasUnreadWN} />
        <main className="flex-1 overflow-hidden flex flex-col" style={{ flex: 1, overflow: 'hidden', minWidth: 0, display: 'flex', flexDirection: 'column' }}>
          <DailyLimitBanner />
          <div className="flex-1 overflow-hidden min-h-0" style={{ flex: 1, overflow: 'hidden', minHeight: 0 }}>
            {view === 'home' && <HomeView companion={companion} />}
            {view === 'library' && <LibraryView companion={companion} />}
            {view === 'trainer' && <TrainerView companion={companion} />}
            {view === 'pro' && <ProView />}
            {view === 'settings' && <SettingsView />}
            {(view === 'ai' || view === 'pulse') && (
              <div className="flex flex-col items-center justify-center h-full gap-3" style={{ color: 'rgba(255,107,0,0.3)' }}>
                <div className="text-4xl">{view === 'ai' ? '🧙' : '🔮'}</div>
                <div className="text-sm">{view === 'ai' ? 'Hex AI — summoning soon...' : 'Séance — awakening soon...'}</div>
              </div>
            )}
          </div>
        </main>
      </div>
      <StatusBar companion={companion} />
      {showWelcome && <WelcomeModal onComplete={handleWelcomeComplete} />}
      {showWhatsNew && <WhatsNewModal onClose={closeWhatsNew} />}
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
