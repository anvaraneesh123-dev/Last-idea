import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCommunity } from '../../context/CommunityContext';
import { useAuth } from '../../context/AuthContext';
import { VolunteerProfile, VolunteerStatus } from '../../types';
import { Users2, X, Plus, Save, ShieldCheck, Languages, MapPin, Briefcase } from 'lucide-react';

interface VolunteerEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  volunteer?: VolunteerProfile | null;
}

export const VolunteerEditModal: React.FC<VolunteerEditModalProps> = ({
  isOpen,
  onClose,
  volunteer,
}) => {
  const { updateVolunteerProfile, addToast } = useCommunity();
  const { currentUser, isAdmin } = useAuth();

  const [role, setRole] = useState(volunteer?.role || 'Field Response Specialist');
  const [serviceArea, setServiceArea] = useState(volunteer?.serviceArea || 'Sector 4 Cascadia');
  const [availability, setAvailability] = useState<VolunteerStatus>(volunteer?.availability || 'available');
  const [skillInput, setSkillInput] = useState('');
  const [skills, setSkills] = useState<string[]>(
    volunteer?.skills || ['First Aid', 'Disaster Logistics', 'CPR Certified']
  );
  const [languageInput, setLanguageInput] = useState('');
  const [languages, setLanguages] = useState<string[]>(
    volunteer?.languages || ['English', 'Spanish']
  );
  const [emergencyCertified, setEmergencyCertified] = useState(volunteer?.emergencyCertified || false);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleAddSkill = () => {
    if (skillInput.trim() && !skills.includes(skillInput.trim())) {
      setSkills([...skills, skillInput.trim()]);
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skill: string) => {
    setSkills(skills.filter(s => s !== skill));
  };

  const handleAddLanguage = () => {
    if (languageInput.trim() && !languages.includes(languageInput.trim())) {
      setLanguages([...languages, languageInput.trim()]);
      setLanguageInput('');
    }
  };

  const handleRemoveLanguage = (lang: string) => {
    setLanguages(languages.filter(l => l !== lang));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!volunteer) return;
    setLoading(true);

    try {
      await updateVolunteerProfile(volunteer.id, {
        role,
        serviceArea,
        availability,
        skills,
        languages,
        emergencyCertified,
      });
      onClose();
    } catch (err: any) {
      addToast({
        type: 'warning',
        title: 'Error Saving Volunteer Profile',
        message: err.message || 'Failed to update profile.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-teal-500/30 overflow-hidden my-8"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-teal-700 via-teal-600 to-cyan-700 px-6 py-4 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-white/20 backdrop-blur-sm">
                <Users2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-base font-bold">
                  {volunteer ? `Edit Volunteer: ${volunteer.name}` : 'Volunteer Corps Registration'}
                </h3>
                <p className="text-xs text-teal-100">
                  Update response skills, languages, service radius, and readiness
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

          <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Volunteer Operational Role
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Lead Trauma Medic / Chainsaw Squad"
                value={role}
                onChange={e => setRole(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Service Area Radius
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sector 4 Cascadia / River Quad"
                    value={serviceArea}
                    onChange={e => setServiceArea(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                  <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Availability Status
                </label>
                <select
                  value={availability}
                  onChange={e => setAvailability(e.target.value as VolunteerStatus)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="available">Available Now</option>
                  <option value="on_mission">On Mission</option>
                  <option value="standby">Standby / On-Call</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            {/* Skills Tag Input */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Volunteer Skills & Capabilities
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  placeholder="Add skill (e.g. Triage, Radio, Chainsaw)..."
                  value={skillInput}
                  onChange={e => setSkillInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddSkill();
                    }
                  }}
                  className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
                <button
                  type="button"
                  onClick={handleAddSkill}
                  className="px-3 py-1.5 rounded-xl bg-teal-600 text-white font-bold text-xs hover:bg-teal-500 cursor-pointer"
                >
                  Add
                </button>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {skills.map(s => (
                  <span
                    key={s}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-teal-500/10 text-teal-700 dark:text-teal-300 border border-teal-500/20"
                  >
                    <span>{s}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(s)}
                      className="text-teal-500 hover:text-teal-700 cursor-pointer"
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Languages Tag Input */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Languages Spoken
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  placeholder="Add language (e.g. English, Spanish, Arabic)..."
                  value={languageInput}
                  onChange={e => setLanguageInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddLanguage();
                    }
                  }}
                  className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
                <button
                  type="button"
                  onClick={handleAddLanguage}
                  className="px-3 py-1.5 rounded-xl bg-teal-600 text-white font-bold text-xs hover:bg-teal-500 cursor-pointer"
                >
                  Add
                </button>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {languages.map(l => (
                  <span
                    key={l}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/20"
                  >
                    <span>{l}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveLanguage(l)}
                      className="text-blue-500 hover:text-blue-700 cursor-pointer"
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Emergency Certification */}
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <span>FEMA / CPR / First Aid Certified</span>
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  Qualifies for urgent life-safety dispatches
                </div>
              </div>
              <input
                type="checkbox"
                checked={emergencyCertified}
                onChange={e => setEmergencyCertified(e.target.checked)}
                className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500 cursor-pointer"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-slate-200 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-md shadow-teal-600/20 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{loading ? 'Saving...' : 'Save Volunteer Profile'}</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
