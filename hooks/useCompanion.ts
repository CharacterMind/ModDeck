'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

const COMPANION_URL = 'http://127.0.0.1:27301';
const POLL_INTERVAL = 2500;

export type CompanionStatus = 'checking' | 'online' | 'offline';

export interface CompanionHealth {
  ok: boolean;
  version: string;
  admin: boolean;
  attached: boolean;
  attachedGameId: string;
  attachedPid: number;
  attachedName: string;
  frozen: number;
  installedCount: number;
}

export interface InstalledGame {
  gameId: string;
  source: string;
  path: string;
  appid?: number;
}

export interface LaunchResult {
  ok: boolean;
  started: boolean;
  method?: string;
  detail?: string;
  error?: string;
}

export interface AttachResult {
  found: boolean;
  pid?: number;
  name?: string;
  attached?: boolean;
  error?: string;
}

export interface ScanResult {
  ok: boolean;
  counts?: Record<string, number>;
  bestType?: string;
  ready?: boolean;
  written?: number;
  error?: string;
}

async function companionFetch(path: string, options?: RequestInit, timeoutMs = 3000) {
  const res = await fetch(`${COMPANION_URL}${path}`, {
    ...options,
    signal: AbortSignal.timeout(timeoutMs),
  });
  return res.json();
}

export function useCompanion() {
  const [status, setStatus] = useState<CompanionStatus>('checking');
  const [health, setHealth] = useState<CompanionHealth | null>(null);
  const [installed, setInstalled] = useState<InstalledGame[]>([]);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const syncedRef = useRef(false);

  const checkHealth = useCallback(async () => {
    try {
      const data: CompanionHealth = await companionFetch('/healthz');
      if (data.ok) {
        setStatus('online');
        setHealth(data);
        return true;
      }
    } catch {
      // companion offline
    }
    setStatus('offline');
    setHealth(null);
    syncedRef.current = false;
    return false;
  }, []);

  const syncGames = useCallback(async (catalog: { gameId: string; name: string }[]) => {
    try {
      const data = await companionFetch('/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ games: catalog }),
      });
      if (data.ok && data.installed) {
        setInstalled(data.installed);
        syncedRef.current = true;
      }
    } catch {
      // ignore
    }
  }, []);

  const launch = useCallback(async (gameId: string): Promise<LaunchResult> => {
    try {
      return await companionFetch('/launch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gameId }),
      });
    } catch {
      return { ok: false, started: false, error: 'Companion offline' };
    }
  }, []);

  const attach = useCallback(async (gameId: string, processes: string[]): Promise<AttachResult> => {
    try {
      return await companionFetch('/attach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gameId, processes, waitSeconds: 90 }),
      }, 95000);
    } catch {
      return { found: false, error: 'Companion offline' };
    }
  }, []);

  const scan = useCallback(async (op: string, value?: number, freeze?: boolean, type?: string, pool?: string): Promise<ScanResult> => {
    try {
      return await companionFetch('/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ op, value, freeze, type, pool }),
      });
    } catch {
      return { ok: false, error: 'Companion offline' };
    }
  }, []);

  const detach = useCallback(async () => {
    try {
      await companionFetch('/detach', { method: 'POST' });
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    checkHealth();
    pollRef.current = setInterval(checkHealth, POLL_INTERVAL);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [checkHealth]);

  return {
    status,
    health,
    installed,
    syncGames,
    launch,
    attach,
    scan,
    detach,
    isOnline: status === 'online',
    isAttached: health?.attached ?? false,
    attachedGameId: health?.attachedGameId ?? '',
  };
}
