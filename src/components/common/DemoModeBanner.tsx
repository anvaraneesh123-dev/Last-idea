import React, { useState } from 'react';
import { useCommunity } from '../../context/CommunityContext';
import { WifiOff, RotateCw, AlertCircle, X, Database } from 'lucide-react';

export const DemoModeBanner: React.FC = () => {
  const { networkState, lastSyncedAt, setIsSyncCenterOpen, isOffline } = useCommunity();
  const [isDismissed, setIsDismissed] = useState(false);

  // Only render banner when offline or actively syncing
  if (!isOffline && networkState === 'online') return null;
  if (isDismissed) return null;

  return (
    <div className="bg-amber-900/90 text-amber-100 px-3 py-1.5 text-xs shadow-md border-b border-amber-700/50 flex items-center justify-between gap-3 relative z-50">
      <div className="flex items-center gap-2 min-w-0">
        <span className="px-2 py-0.5 rounded-full bg-amber-950 font-bold text-[10px] tracking-wider uppercase flex items-center gap-1 border border-amber-600/40 text-amber-300">
          <Database className="w-3 h-3 text-emerald-400" />
          <span>Local SQL Mesh Active</span>
        </span>

        {/* Dynamic Network / Sync Status Badge */}
        <button
          onClick={() => setIsSyncCenterOpen(true)}
          className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-950/60 hover:bg-amber-950 text-[10px] font-mono font-medium transition-all border border-amber-600/30 cursor-pointer"
          title="Open Offline Sync Center"
        >
          {networkState === 'syncing' ? (
            <span className="flex items-center gap-1 text-blue-300 animate-pulse">
              <RotateCw className="w-3 h-3 animate-spin" />
              Syncing Changes...
            </span>
          ) : networkState === 'sync_failed' ? (
            <span className="flex items-center gap-1 text-rose-300">
              <AlertCircle className="w-3 h-3" />
              Sync Paused
            </span>
          ) : (
            <span className="flex items-center gap-1 text-amber-200">
              <WifiOff className="w-3 h-3 text-amber-400" />
              Offline Mode
            </span>
          )}
          <span className="text-amber-500">•</span>
          <span className="text-amber-200/80 hidden sm:inline">
            Last Synced: {new Date(lastSyncedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </button>

        <p className="hidden md:inline text-[11px] text-amber-200/80 truncate">
          Operating from local SQLite & cached storage. All submissions queue locally.
        </p>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={() => setIsSyncCenterOpen(true)}
          className="text-[11px] font-semibold text-amber-300 hover:text-white underline cursor-pointer"
        >
          Open Sync Center →
        </button>

        <button
          onClick={() => setIsDismissed(true)}
          className="p-1 rounded text-amber-400 hover:text-white cursor-pointer"
          aria-label="Dismiss banner"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
