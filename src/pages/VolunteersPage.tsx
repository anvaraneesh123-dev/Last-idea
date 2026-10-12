import React, { useState } from 'react';
import { useCommunity } from '../context/CommunityContext';
import { useAuth } from '../context/AuthContext';
import { VolunteerCard } from '../components/volunteers/VolunteerCard';
import { MissionCard } from '../components/volunteers/MissionCard';
import { VolunteerEditModal } from '../components/volunteers/VolunteerEditModal';
import { RegisterVolunteerModal } from '../components/volunteers/RegisterVolunteerModal';
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
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);

  const skillsList = [
    'all',
    'Emergency Triage',
    'Paramedic Medicine',
    'Structural Assessment',
    'Commercial Kitchen Operations',
    'Solar Microinverters',
    'Geriatric Care',
    'Ham Radio Net Control',
    'Gravity Filtration',
    'Class A CDL Driving',
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
            <h1 className="text-2xl sm:text-3xl font-black text-stone-900 dark:text-white tracking-tight">
              Community Volunteer Network
            </h1>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-500/20">
              {volunteers.length} Active Corps
            </span>
            {isAdmin && (
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-500/20">
                Admin Mode: Verification Controls Active
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 mt-1">
            Certified first responders, master tradespeople, and mutual aid squad leaders in {currentCommunity.name}.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsRegisterModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-600/20 active:scale-95 transition-all flex items-center gap-2 cursor-pointer w-fit"
          >
            <UserCheck className="w-4 h-4" />
            <span>🙋 Register as Volunteer</span>
          </button>

          <button
            onClick={onOpenNewMission}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 active:scale-95 transition-all flex items-center gap-2 cursor-pointer w-fit"
          >
            <Plus className="w-4 h-4" />
            <span>Dispatch Squad Mission</span>
          </button>
        </div>
      </div>

      {/* Community Impact Summary Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card rounded-2xl p-4 border flex items-center gap-4">
          <div className="p-3 rounded-xl bg-amber-100 text-amber-900 dark:bg-amber-950/50 dark:text-amber-300">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-stone-900 dark:text-white">
              {totalHours.toLocaleString()} hrs
            </div>
            <div className="text-xs text-stone-500 dark:text-stone-400 font-medium">
              Mutual Aid Contributed
            </div>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-4 border flex items-center gap-4">
          <div className="p-3 rounded-xl bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-stone-900 dark:text-white">
              {totalMissionsCompleted}
            </div>
            <div className="text-xs text-stone-500 dark:text-stone-400 font-medium">
              Completed Relief Operations
            </div>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-4 border flex items-center gap-4">
          <div className="p-3 rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-stone-900 dark:text-white">
              {verifiedCount} / {volunteers.length}
            </div>
            <div className="text-xs text-stone-500 dark:text-stone-400 font-medium">
              Admin Verified Credentials
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-stone-200 dark:border-stone-800 pb-3">
        <button
          onClick={() => setActiveTab('volunteers')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'volunteers'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
          }`}
        >
          <Users2 className="w-4 h-4" />
          <span>Volunteer Corps Roster ({volunteers.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('missions')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'missions'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
          }`}
        >
          <HeartHandshake className="w-4 h-4" />
          <span>Active Squad Missions ({missions.length})</span>
        </button>
      </div>

      {activeTab === 'volunteers' ? (
        <div className="space-y-4">
          {/* Volunteer Search and Skill Pills */}
          <div className="p-4 rounded-2xl glass-card border border-stone-200/80 dark:border-stone-800/80 flex flex-col md:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <input
                type="text"
                placeholder="Search volunteers by name, capability, or neighborhood zone..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-stone-100 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-white placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5 pointer-events-none" />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
              {skillsList.map((skill, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedSkill(skill)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap cursor-pointer transition-colors ${
                    selectedSkill === skill
                      ? 'bg-emerald-600 text-white font-bold'
                      : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-700'
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

      {/* Register Volunteer Modal with GPS Auto-Detection & Cross-Device Sync */}
      <RegisterVolunteerModal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
      />

    </div>
  );
};
