import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useCommunity } from '../../context/CommunityContext';
import { Database, Wifi, WifiOff, RotateCw, AlertCircle, X, RotateCcw } from 'lucide-react';
import { Link } from 'react-router-dom';

export const DemoModeBanner: React.FC = () => {
  const { isDemoMode, userRole, switchDemoRole } = useAuth();
  const { networkState, lastSyncedAt, setIsSyncCenterOpen, isOffline, resetDemoData } = useCommunity();
  const [isDismissed, setIsDismissed] = useState(false);

  if (!isDemoMode && !isOffline) return null;
  if (isDismissed) return null;

  return (
    <div className="bg-gradient-to-r from-amber-600/95 via-amber-500 to-orange-600/95 text-white px-3 py-1.5 text-xs shadow-md border-b border-amber-400/30 flex items-center justify-between gap-3 relative z-50">
      <div className="flex items-center gap-2 min-w-0">
        <span className="px-2 py-0.5 rounded-full bg-black/25 font-black text-[10px] tracking-wider uppercase flex items-center gap-1 border border-white/20">
          <Database className="w-3 h-3 text-amber-200" />
          <span>Demo Mode • Local IndexedDB</span>
        </span>

        {/* Dynamic Network / Sync Status Badge */}
        <button
          onClick={() => setIsSyncCenterOpen(true)}
          className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-black/30 hover:bg-black/40 text-[10px] font-mono font-bold transition-all border border-white/20 cursor-pointer"
          title="Open Offline Sync Center"
        >
          {networkState === 'online' ? (
            <span className="flex items-center gap-1 text-emerald-300">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              Online
            </span>
          ) : networkState === 'syncing' ? (
            <span className="flex items-center gap-1 text-blue-200 animate-pulse">
              <RotateCw className="w-3 h-3 animate-spin" />
              Syncing...
            </span>
          ) : networkState === 'sync_failed' ? (
            <span className="flex items-center gap-1 text-rose-300">
              <AlertCircle className="w-3 h-3" />
              Sync Failed
            </span>
          ) : (
            <span className="flex items-center gap-1 text-amber-200">
              <WifiOff className="w-3 h-3" />
              Offline
            </span>
          )}
          <span className="text-white/60">•</span>
          <span className="text-white/80 hidden sm:inline">
            Sync: {new Date(lastSyncedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </button>

        {/* 1-Click Reset Demo Data Button */}
        <button
          onClick={() => resetDemoData()}
          className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-black/35 hover:bg-black/55 text-[10px] font-bold text-amber-100 hover:text-white border border-white/25 transition-all cursor-pointer shadow-sm"
          title="Reset sample records back to initial hackathon presentation state"
        >
          <RotateCcw className="w-3 h-3 text-amber-300" />
          <span>Reset Demo Data</span>
        </button>

        <p className="hidden xl:inline text-[11px] text-amber-100 truncate">
          Fictional demonstration records are stored client-side in IndexedDB.
        </p>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {/* Fast Role Switcher */}
        <div className="flex items-center gap-1 bg-black/20 p-0.5 rounded-lg text-[10px] font-bold">
          <span className="text-amber-200 hidden sm:inline px-1">Role:</span>
          <button
            onClick={() => switchDemoRole('administrator')}
            className={`px-2 py-0.5 rounded transition-all cursor-pointer ${
              userRole === 'administrator'
                ? 'bg-white text-amber-950 font-black shadow-sm'
                : 'text-white/80 hover:text-white'
            }`}
            title="Switch to Admin (Sarah Jenkins)"
          >
            Admin
          </button>
          <button
            onClick={() => switchDemoRole('volunteer')}
            className={`px-2 py-0.5 rounded transition-all cursor-pointer ${
              userRole === 'volunteer'
                ? 'bg-white text-amber-950 font-black shadow-sm'
                : 'text-white/80 hover:text-white'
            }`}
            title="Switch to Volunteer (Dr. Elena)"
          >
            Volunteer
          </button>
          <button
            onClick={() => switchDemoRole('community_member')}
            className={`px-2 py-0.5 rounded transition-all cursor-pointer ${
              userRole === 'community_member'
                ? 'bg-white text-amber-950 font-black shadow-sm'
                : 'text-white/80 hover:text-white'
            }`}
            title="Switch to Resident (Alex Miller)"
          >
            Member
          </button>
        </div>

        <button
          onClick={() => setIsSyncCenterOpen(true)}
          className="hidden sm:inline text-[10px] font-bold underline decoration-amber-300 hover:text-white cursor-pointer"
        >
          Sync Outbox →
        </button>

        <button
          onClick={() => setIsDismissed(true)}
          className="p-1 rounded text-white/70 hover:text-white cursor-pointer"
          aria-label="Dismiss banner"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
