import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCommunity } from '../../context/CommunityContext';
import { Users2, X, MapPin, Clock, AlertTriangle } from 'lucide-react';

interface NewMissionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NewMissionModal: React.FC<NewMissionModalProps> = ({ isOpen, onClose }) => {
  const { createMission, currentCommunity } = useCommunity();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<'logistics' | 'medical' | 'elderly_care' | 'disaster_relief' | 'environmental'>('disaster_relief');
  const [urgency, setUrgency] = useState<'low' | 'medium' | 'high' | 'critical'>('high');
  const [location, setLocation] = useState('');
  const [volunteersNeeded, setVolunteersNeeded] = useState(4);
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState('Tomorrow, 9:00 AM');
  const [organizer, setOrganizer] = useState('Alex Miller (Zone 4 Lead)');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !location.trim()) return;

    createMission({
      title,
      category,
      urgency,
      location,
      volunteersNeeded,
      description,
      deadline,
      organizer,
    });

    onClose();
    setTitle('');
    setDescription('');
    setLocation('');
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-teal-500/30 overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-700 via-teal-600 to-cyan-700 px-6 py-4 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-white/20 backdrop-blur-sm">
                <Users2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-base font-bold">Dispatch New Volunteer Mission</h3>
                <p className="text-xs text-teal-100">
                  Mobilize community neighbors in {currentCommunity.name}
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

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Mission Title & Objective
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Storm Drainage Clearing at North Bridge"
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Category
                </label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value as any)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="disaster_relief">Disaster Relief & Flood Defense</option>
                  <option value="elderly_care">Elderly & Vulnerable Care</option>
                  <option value="medical">Medical & First Aid Drill</option>
                  <option value="logistics">Logistics & Depot Operations</option>
                  <option value="environmental">Environmental Clean-Up</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Urgency Level
                </label>
                <select
                  value={urgency}
                  onChange={e => setUrgency(e.target.value as any)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="critical">Critical (Immediate Response)</option>
                  <option value="high">High (Today)</option>
                  <option value="medium">Medium (Within 48h)</option>
                  <option value="low">Low (Flexible/Weekend)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Meeting Point / Location
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="e.g. South Canal Gate #2"
                    value={location}
                    onChange={e => setLocation(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Volunteers Needed
                </label>
                <input
                  type="number"
                  min={1}
                  max={50}
                  required
                  value={volunteersNeeded}
                  onChange={e => setVolunteersNeeded(parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Instructions & Required Equipment
              </label>
              <textarea
                required
                rows={3}
                placeholder="Describe gear to bring (e.g. boots, work gloves, headlamps), responsibilities, and emergency safety briefing notes..."
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
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
                className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-md shadow-teal-600/20 active:scale-95 transition-all cursor-pointer"
              >
                Broadcast Mission to Squads
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
