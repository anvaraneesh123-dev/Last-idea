import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCommunity } from '../../context/CommunityContext';
import { 
  AlertOctagon, 
  X, 
  MapPin, 
  HeartPulse, 
  Truck, 
  BatteryCharging, 
  Radio, 
  Send
} from 'lucide-react';

interface SosModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SosModal: React.FC<SosModalProps> = ({ isOpen, onClose }) => {
  const { createSosSignal, currentCommunity } = useCommunity();

  const [citizenName, setCitizenName] = useState('');
  const [location, setLocation] = useState('');
  const [situation, setSituation] = useState('');
  const [urgency, setUrgency] = useState<'immediate_dispatch' | 'high' | 'moderate'>('immediate_dispatch');
  const [needsMedical, setNeedsMedical] = useState(true);
  const [needsEvacuation, setNeedsEvacuation] = useState(false);
  const [needsSupplies, setNeedsSupplies] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!citizenName.trim() || !location.trim() || !situation.trim()) return;

    createSosSignal({
      citizenName,
      location,
      situation,
      urgency,
      needsMedical,
      needsEvacuation,
      needsSupplies,
    });

    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      onClose();
      setCitizenName('');
      setLocation('');
      setSituation('');
    }, 2000);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-red-500/40 overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-red-600 to-rose-700 px-6 py-4 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-white/20 backdrop-blur-sm">
                <AlertOctagon className="w-6 h-6 text-white animate-pulse" />
              </div>
              <div>
                <h3 className="text-lg font-bold">Transmit Emergency SOS</h3>
                <p className="text-xs text-red-100">
                  Direct dispatch to {currentCommunity.name} emergency response team
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

          {submitted ? (
            <div className="p-8 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center">
                <Send className="w-8 h-8 animate-bounce" />
              </div>
              <h4 className="text-xl font-bold text-slate-900 dark:text-white">SOS Signal Broadcasted!</h4>
              <p className="text-sm text-slate-600 dark:text-slate-300 max-w-sm mx-auto">
                First responders, volunteer leads, and community safety dispatchers have received your urgent request. Stand by for contact.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Urgency selector */}
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 mb-2">
                  Emergency Priority Level
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setUrgency('immediate_dispatch')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all text-center cursor-pointer ${
                      urgency === 'immediate_dispatch'
                        ? 'bg-red-500/20 border-red-500 text-red-600 dark:text-red-400 shadow-sm'
                        : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                    }`}
                  >
                    Immediate Dispatch
                  </button>
                  <button
                    type="button"
                    onClick={() => setUrgency('high')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all text-center cursor-pointer ${
                      urgency === 'high'
                        ? 'bg-amber-500/20 border-amber-500 text-amber-600 dark:text-amber-400 shadow-sm'
                        : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                    }`}
                  >
                    High Urgency
                  </button>
                  <button
                    type="button"
                    onClick={() => setUrgency('moderate')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all text-center cursor-pointer ${
                      urgency === 'moderate'
                        ? 'bg-blue-500/20 border-blue-500 text-blue-600 dark:text-blue-400 shadow-sm'
                        : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                    }`}
                  >
                    Moderate Need
                  </button>
                </div>
              </div>

              {/* Requirement Checkboxes */}
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 mb-2">
                  Assistance Needed
                </label>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setNeedsMedical(!needsMedical)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                      needsMedical
                        ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-500 text-rose-700 dark:text-rose-300'
                        : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <HeartPulse className="w-3.5 h-3.5" />
                    <span>Medical / CPR</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setNeedsEvacuation(!needsEvacuation)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                      needsEvacuation
                        ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-500 text-amber-700 dark:text-amber-300'
                        : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <Truck className="w-3.5 h-3.5" />
                    <span>Evacuation / Rescue</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setNeedsSupplies(!needsSupplies)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                      needsSupplies
                        ? 'bg-teal-50 dark:bg-teal-950/40 border-teal-500 text-teal-700 dark:text-teal-300'
                        : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <BatteryCharging className="w-3.5 h-3.5" />
                    <span>Generator / Clean Water</span>
                  </button>
                </div>
              </div>

              {/* Citizen Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Your Name / Household
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. David Ross & Family"
                    value={citizenName}
                    onChange={e => setCitizenName(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800/80 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Precise Address / Apartment #
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      placeholder="e.g. Apt 304, Tower B"
                      value={location}
                      onChange={e => setLocation(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800/80 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                    <MapPin className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
                  </div>
                </div>
              </div>

              {/* Situation Description */}
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Describe the Situation & Immediate Hazards
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="e.g. Elderly resident has power cut to oxygen concentrator with 45 mins battery left. Need portable generator or ambulance dispatch."
                  value={situation}
                  onChange={e => setSituation(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800/80 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-between gap-3">
                <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                  <Radio className="w-3.5 h-3.5 text-teal-500" />
                  <span>Transmits over Community Mesh</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-xs shadow-lg shadow-red-500/20 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Broadcast SOS Alert</span>
                  </button>
                </div>
              </div>
            </form>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
