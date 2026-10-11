import React, { useState } from 'react';
import { useCommunity } from '../../context/CommunityContext';
import { useAuth } from '../../context/AuthContext';
import { ShieldAlert, AlertTriangle, X, CheckCircle, ShieldCheck } from 'lucide-react';

interface DeactivateEmergencyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
}

export const DeactivateEmergencyModal: React.FC<DeactivateEmergencyModalProps> = ({
  isOpen,
  onClose,
  onConfirm
}) => {
  const { currentCommunity, emergencyCause } = useCommunity();
  const { currentUser } = useAuth();
  const [reason, setReason] = useState('Flood waters receded below 1ft crest; primary municipal power grid restored in Sector 4.');
  const [confirmedCheck, setConfirmedCheck] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirmedCheck || !reason.trim()) return;
    onConfirm(reason);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="w-full max-w-lg bg-white dark:bg-slate-900 border border-red-500/40 rounded-3xl shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 bg-red-600/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-red-600 text-white flex items-center justify-center shadow-lg shadow-red-600/30">
              <ShieldAlert className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900 dark:text-white">
                Deactivate Emergency Mode
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Authorized Administrator Step-Down Confirmation
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-300 text-xs space-y-2">
            <div className="font-bold flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Critical Notice on Emergency Step-Down:</span>
            </div>
            <p className="leading-relaxed">
              Deactivating emergency mode will step down public disaster banners, silence high-priority siren cards, and revert volunteer squad dispatches to routine standby for <strong>{currentCommunity.name}</strong>.
            </p>
            <p className="font-mono text-[11px] text-amber-700 dark:text-amber-400">
              Active incident: {emergencyCause}
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Deactivation Rationale & Field Verification Log *
            </label>
            <textarea
              required
              rows={3}
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder="State verified ground conditions, municipal authority clearance, and safety reasons..."
              className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
            <label className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-800 dark:text-slate-200">
              <input
                type="checkbox"
                required
                checked={confirmedCheck}
                onChange={e => setConfirmedCheck(e.target.checked)}
                className="mt-0.5 rounded text-red-600 focus:ring-red-500"
              />
              <span className="font-medium leading-relaxed">
                I verify as <strong>{currentUser.fullName} ({currentUser.role.toUpperCase()})</strong> that official municipal responders have certified the sector as safe to return to standard operations. This action will be permanently recorded in the immutable Emergency Audit Log.
              </span>
            </label>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!confirmedCheck || !reason.trim()}
              className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-bold text-xs shadow-md shadow-red-600/30 flex items-center gap-1.5 cursor-pointer"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Confirm & Deactivate Emergency</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
