import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCommunity, SafeCheckIn } from '../../context/CommunityContext';
import { CheckCircle2, X, Shield, MapPin, Users, HeartHandshake } from 'lucide-react';

interface SafeCheckInModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SafeCheckInModal: React.FC<SafeCheckInModalProps> = ({ isOpen, onClose }) => {
  const { markMyselfSafe, safeCheckIns, currentCommunity } = useCommunity();

  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [status, setStatus] = useState<SafeCheckIn['status']>('Safe');
  const [note, setNote] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !location.trim()) return;

    markMyselfSafe(name, location, status, note.trim() || undefined);
    onClose();
    setName('');
    setLocation('');
    setNote('');
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-emerald-500/30 overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-teal-700 via-emerald-600 to-teal-800 px-6 py-4 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-white/20 backdrop-blur-sm">
                <CheckCircle2 className="w-6 h-6 text-emerald-200" />
              </div>
              <div>
                <h3 className="text-lg font-bold">Community Safety Roll Check-In</h3>
                <p className="text-xs text-emerald-100">
                  Let neighbors and {currentCommunity.name} responders know your status
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Status Radio Pills */}
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 mb-2">
                  Current Condition
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setStatus('Safe')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer ${
                      status === 'Safe'
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-700 dark:text-emerald-300 shadow-sm'
                        : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <Shield className="w-3.5 h-3.5 text-emerald-500" />
                    <span>I Am Safe</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setStatus('Sheltered')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer ${
                      status === 'Sheltered'
                        ? 'bg-blue-500/20 border-blue-500 text-blue-700 dark:text-blue-300 shadow-sm'
                        : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <Users className="w-3.5 h-3.5 text-blue-500" />
                    <span>In Shelter</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setStatus('Needs Assistance Soon')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer ${
                      status === 'Needs Assistance Soon'
                        ? 'bg-amber-500/20 border-amber-500 text-amber-700 dark:text-amber-300 shadow-sm'
                        : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <HeartHandshake className="w-3.5 h-3.5 text-amber-500" />
                    <span>Need Minor Aid</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Full Name / Family
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Jessica Wu & Family"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800/80 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Your Location / Building
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      placeholder="e.g. 74 Maple Drive"
                      value={location}
                      onChange={e => setLocation(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800/80 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    <MapPin className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Optional Note (e.g. extra space for neighbors, pet status, battery spare)
                </label>
                <input
                  type="text"
                  placeholder="e.g. We have power and warm soup if any neighboring family needs a recharge."
                  value={note}
                  onChange={e => setNote(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800/80 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Confirm Safety Check-In</span>
                </button>
              </div>
            </form>

            {/* Recent Check-Ins Roll */}
            <div className="border-t border-slate-200 dark:border-slate-800 pt-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-teal-500" />
                  <span>Recent Community Check-Ins ({safeCheckIns.length})</span>
                </h4>
                <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                  Live Roll
                </span>
              </div>

              <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
                {safeCheckIns.map(sc => (
                  <div
                    key={sc.id}
                    className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="min-w-0">
                      <div className="font-semibold text-slate-900 dark:text-white truncate">
                        {sc.name}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="truncate">{sc.location}</span>
                        <span>•</span>
                        <span>{sc.timestamp}</span>
                      </div>
                      {sc.note && (
                        <div className="text-[11px] text-teal-700 dark:text-teal-300 mt-0.5 truncate">
                          "{sc.note}"
                        </div>
                      )}
                    </div>

                    <span
                      className={`shrink-0 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        sc.status === 'Safe'
                          ? 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20'
                          : sc.status === 'Sheltered'
                          ? 'bg-blue-100 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 border border-blue-500/20'
                          : 'bg-amber-100 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 border border-amber-500/20'
                      }`}
                    >
                      {sc.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
