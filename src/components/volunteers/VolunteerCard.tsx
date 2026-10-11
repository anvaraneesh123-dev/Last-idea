import React, { useState } from 'react';
import { VolunteerProfile } from '../../types';
import { useCommunity } from '../../context/CommunityContext';
import { useAuth } from '../../context/AuthContext';
import { 
  ShieldCheck, 
  Phone, 
  Award, 
  CheckCircle, 
  Clock, 
  MapPin, 
  Languages, 
  Edit, 
  UserCheck, 
  UserX,
  Lock,
  Sparkles 
} from 'lucide-react';

interface VolunteerCardProps {
  volunteer: VolunteerProfile;
  onEdit?: (volunteer: VolunteerProfile) => void;
}

export const VolunteerCard: React.FC<VolunteerCardProps> = ({ volunteer, onEdit }) => {
  const { verifyVolunteer } = useCommunity();
  const { isAdmin, currentUser } = useAuth();
  const [showPhone, setShowPhone] = useState(false);

  const isAvailable = volunteer.availability === 'available';
  const isOnMission = volunteer.availability === 'on_mission';
  const isVerified = volunteer.verificationStatus === 'verified';

  const isPrivilegedViewer = isAdmin || (currentUser && (currentUser.fullName === volunteer.name || currentUser.role === 'administrator'));
  const canEdit = isPrivilegedViewer;

  const getProtectedPhoneDisplay = () => {
    if (isPrivilegedViewer || !volunteer.contactProtected) {
      return volunteer.phone;
    }
    // Mask sensitive phone number to prevent public exposure
    const p = volunteer.phone || '';
    if (p.length > 6) {
      return p.slice(0, 8) + '•••-••' + p.slice(-2);
    }
    return '+1 (555) •••-••••';
  };

  return (
    <div className={`glass-card rounded-2xl p-5 border flex flex-col justify-between transition-all hover:shadow-xl relative overflow-hidden ${
      isVerified
        ? 'border-slate-200/80 dark:border-slate-800/80 hover:border-teal-500/40'
        : 'border-amber-500/30 bg-amber-500/[0.01]'
    }`}>
      <div>
        {/* Top: Avatar + Status + Verification */}
        <div className="flex items-start gap-3.5 mb-3">
          <div className="relative">
            <img
              src={volunteer.avatar}
              alt={volunteer.name}
              className="w-13 h-13 rounded-2xl object-cover ring-2 ring-teal-500/30"
            />
            <span className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full ring-2 ring-white dark:ring-slate-900 ${
              isAvailable ? 'bg-emerald-500' : isOnMission ? 'bg-amber-500' : 'bg-slate-400'
            }`} />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-1 flex-wrap">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                {volunteer.name}
              </h4>
              
              <div className="flex items-center gap-1">
                {isVerified ? (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-0.5">
                    <ShieldCheck className="w-3 h-3" />
                    Verified
                  </span>
                ) : (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                    Pending
                  </span>
                )}

                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  isAvailable
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                    : isOnMission
                    ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                }`}>
                  {isAvailable ? 'Available' : isOnMission ? 'On Mission' : 'Standby'}
                </span>
              </div>
            </div>

            <p className="text-xs text-teal-600 dark:text-teal-400 font-semibold truncate mt-0.5">
              {volunteer.role}
            </p>

            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1">
              <MapPin className="w-3 h-3 text-teal-500 shrink-0" />
              <span>Service Area: <strong>{volunteer.serviceArea}</strong></span>
            </div>
          </div>
        </div>

        {/* Skills Pills */}
        <div className="mt-3">
          <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1.5">
            Registered Capabilities & Skills
          </div>
          <div className="flex flex-wrap gap-1.5">
            {volunteer.skills.map((skill, i) => (
              <span
                key={i}
                className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>

        {/* Languages Spoken */}
        {volunteer.languages && volunteer.languages.length > 0 && (
          <div className="mt-2.5 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <Languages className="w-3.5 h-3.5 text-blue-500" />
            <span className="text-[11px]">Languages: {volunteer.languages.join(', ')}</span>
          </div>
        )}

        {/* Emergency Certification Badge */}
        {volunteer.emergencyCertified && (
          <div className="mt-2.5">
            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
              <ShieldCheck className="w-3 h-3 text-emerald-500" />
              FEMA / First Aid Certified Responder
            </span>
          </div>
        )}
      </div>

      {/* Footer stats + Contact (with Privacy Protection) */}
      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
              {volunteer.missionsCompleted} missions
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-teal-500" />
              {volunteer.hoursContributed} hrs
            </span>
          </div>

          <button
            onClick={() => setShowPhone(!showPhone)}
            className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-teal-700 dark:text-teal-300 bg-teal-500/10 hover:bg-teal-500/20 border border-teal-500/20 transition-all flex items-center gap-1 cursor-pointer"
            title={volunteer.contactProtected && !isPrivilegedViewer ? "Contact phone protected by Civil Privacy Protocol" : "Direct volunteer contact"}
            aria-label="Toggle volunteer contact details"
          >
            {volunteer.contactProtected && !isPrivilegedViewer ? <Lock className="w-3 h-3 text-amber-500" /> : <Phone className="w-3 h-3 text-teal-500" />}
            <span>{showPhone ? getProtectedPhoneDisplay() : 'Dispatch Contact'}</span>
          </button>
        </div>

        {/* Admin Verification & Volunteer Profile Edit Controls */}
        <div className="flex items-center justify-between pt-1 border-t border-dashed border-slate-100 dark:border-slate-800 text-xs">
          {canEdit && onEdit && (
            <button
              onClick={() => onEdit(volunteer)}
              className="text-[11px] font-bold text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Edit className="w-3 h-3" />
              <span>Update Profile</span>
            </button>
          )}

          {isAdmin && (
            <div className="flex items-center gap-1.5 ml-auto">
              {!isVerified ? (
                <button
                  onClick={() => verifyVolunteer(volunteer.id, 'verified', currentUser.fullName)}
                  className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-600 text-white hover:bg-emerald-500 flex items-center gap-1 cursor-pointer"
                >
                  <UserCheck className="w-3 h-3" />
                  <span>Verify Credentials</span>
                </button>
              ) : (
                <button
                  onClick={() => verifyVolunteer(volunteer.id, 'rejected', currentUser.fullName)}
                  className="px-2 py-0.5 rounded text-[10px] font-semibold text-red-600 hover:bg-red-500/10 flex items-center gap-1 cursor-pointer"
                >
                  <UserX className="w-3 h-3" />
                  <span>Revoke</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
