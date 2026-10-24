'use client';

import { useStore } from '@/lib/store';
import { useCompanion } from '@/hooks/useCompanion';
import { GAMES } from '@/data/games';

interface Props {
  companion: ReturnType<typeof useCompanion>;
}

export default function StatusBar({ companion }: Props) {
  const { user, selectedGameId, view } = useStore();
  const { status, health, isAttached, attachedGameId } = companion;

  const attachedGame = GAMES.find(g => g.id === attachedGameId);
  const version = health?.version ?? '—';

  return (
    <div className="h-8 bg-[#0d0d0d] border-t border-white/5 flex items-center px-4 gap-6 text-[11px] flex-shrink-0">
      {/* Companion status */}
      <div className="flex items-center gap-1.5">
        <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
          status === 'online' ? 'bg-emerald-400 animate-pulse' :
          status === 'checking' ? 'bg-amber-400 animate-pulse' :
          'bg-white/20'
        }`} />
        <span className={
          status === 'online' ? 'text-emerald-400' :
          status === 'checking' ? 'text-amber-400' :
          'text-white/30'
        }>
          {status === 'online'
            ? `Companion v${version} · online`
            : status === 'checking'
            ? 'Companion · connecting…'
            : 'Companion · offline'}
        </span>
      </div>

      {/* Attached game */}
      {isAttached && attachedGame && (
        <>
          <div className="w-px h-3 bg-white/10" />
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            <span className="text-amber-400">
              {attachedGame.name} · trainer attached
            </span>
          </div>
        </>
      )}

      {/* Spacer */}
      <div className="flex-1" />

      {/* Game running status */}
      {isAttached ? (
        <span className="text-emerald-400/70">Game running</span>
      ) : (
        <span className="text-white/20">No game running</span>
      )}

      {/* Divider */}
      <div className="w-px h-3 bg-white/10" />

      {/* DP balance */}
      {user && (
        <div className="flex items-center gap-1 text-amber-400/70">
          <span>🪙</span>
          <span>{user.deckPoints.toLocaleString()} DP</span>
        </div>
      )}

      {/* Divider */}
      <div className="w-px h-3 bg-white/10" />

      {/* Plan badge */}
      {user && (
        <div className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
          user.plan === 'pro'
            ? 'bg-amber-400/20 text-amber-400'
            : 'bg-white/10 text-white/40'
        }`}>
          {user.plan === 'pro' ? '👑 PRO' : 'FREE'}
        </div>
      )}
    </div>
  );
}
