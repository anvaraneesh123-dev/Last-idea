import React, { useState } from 'react';
import { useCommunity } from '../context/CommunityContext';
import { useAuth } from '../context/AuthContext';
import { VolunteerCard } from '../components/volunteers/VolunteerCard';
import { MissionCard } from '../components/volunteers/MissionCard';
import { VolunteerEditModal } from '../components/volunteers/VolunteerEditModal';
import { VolunteerProfile } from '../types';
import { 
  Users2, 
  Plus, 
  HeartHandshake, 
  Award, 
  Clock, 
  ShieldCheck, 
  CheckCircle2, 
  Sparkles,
  Search,
  UserCheck
} from 'lucide-react';

interface VolunteersPageProps {
  onOpenNewMission: () => void;
}

export const VolunteersPage: React.FC<VolunteersPageProps> = ({ onOpenNewMission }) => {
  const { volunteers, missions, currentCommunity } = useCommunity();
  const { currentUser, isAdmin } = useAuth();

  const [activeTab, setActiveTab] = useState<'missions' | 'volunteers'>('volunteers');
  const [selectedSkill, setSelectedSkill] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [editingVolunteer, setEditingVolunteer] = useState<VolunteerProfile | null>(null);

  const skillsList = [
    'all',
    'Triage',
    'Emergency Medicine',
    'Master Electrician',
    'Chainsaw Operations',
    'Ham Radio Operator',
    'Senior Care',
    'Flood Defense',
    'First Aid',
    'Disaster Logistics',
  ];

  const filteredVolunteers = volunteers.filter(v => {
    if (selectedSkill !== 'all' && !v.skills.some(s => s.toLowerCase().includes(selectedSkill.toLowerCase()))) {
      return false;
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        v.name.toLowerCase().includes(q) ||
        v.role.toLowerCase().includes(q) ||
        (v.serviceArea && v.serviceArea.toLowerCase().includes(q)) ||
        (v.neighborhoodZone && v.neighborhoodZone.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const totalHours = volunteers.reduce((acc, v) => acc + (v.hoursContributed || 0), 0);
  const totalMissionsCompleted = volunteers.reduce((acc, v) => acc + (v.missionsCompleted || 0), 0);
  const verifiedCount = volunteers.filter(v => v.verificationStatus === 'verified').length;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Community Volunteer Network
            </h1>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20">
              {volunteers.length} Active Corps
            </span>
            {isAdmin && (
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                Admin Mode: Verification Controls Active
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Certified first responders, master tradespeople, and mutual aid squad leaders in {currentCommunity.name}.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenNewMission}
            className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-md shadow-teal-600/20 active:scale-95 transition-all flex items-center gap-2 cursor-pointer w-fit"
          >
            <Plus className="w-4 h-4" />
            <span>Dispatch Squad Mission</span>
          </button>
        </div>
      </div>

      {/* Community Impact Summary Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card rounded-2xl p-4 border flex items-center gap-4">
          <div className="p-3 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 dark:text-white">
              {totalHours.toLocaleString()} hrs
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Mutual Aid Contributed
            </div>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-4 border flex items-center gap-4">
          <div className="p-3 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 dark:text-white">
              {totalMissionsCompleted}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Completed Relief Operations
            </div>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-4 border flex items-center gap-4">
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 dark:text-white">
              {verifiedCount} / {volunteers.length}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Admin Verified Credentials
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('volunteers')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'volunteers'
              ? 'bg-teal-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Users2 className="w-4 h-4" />
          <span>Volunteer Corps Roster ({volunteers.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('missions')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'missions'
              ? 'bg-teal-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <HeartHandshake className="w-4 h-4" />
          <span>Active Squad Missions ({missions.length})</span>
        </button>
      </div>

      {activeTab === 'volunteers' ? (
        <div className="space-y-4">
          {/* Volunteer Search and Skill Pills */}
          <div className="p-4 rounded-2xl glass-card border border-slate-200/80 dark:border-slate-800/80 flex flex-col md:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <input
                type="text"
                placeholder="Search volunteers by name, capability, or neighborhood zone..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
              {skillsList.map((skill, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedSkill(skill)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap cursor-pointer transition-colors ${
                    selectedSkill === skill
                      ? 'bg-teal-600 text-white font-bold'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {skill === 'all' ? 'All Skills' : skill}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredVolunteers.map(volunteer => (
              <VolunteerCard 
                key={volunteer.id} 
                volunteer={volunteer}
                onEdit={v => setEditingVolunteer(v)}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {missions.map(mission => (
              <MissionCard key={mission.id} mission={mission} />
            ))}
          </div>
        </div>
      )}

      {/* Edit Volunteer Modal */}
      {editingVolunteer && (
        <VolunteerEditModal
          isOpen={Boolean(editingVolunteer)}
          onClose={() => setEditingVolunteer(null)}
          volunteer={editingVolunteer}
        />
      )}

    </div>
  );
};
