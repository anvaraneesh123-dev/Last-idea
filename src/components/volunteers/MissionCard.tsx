import React from 'react';
import { VolunteerMission } from '../../types';
import { useCommunity } from '../../context/CommunityContext';
import { MapPin, Users, Clock, AlertTriangle, CheckCircle, ShieldAlert } from 'lucide-react';

interface MissionCardProps {
  mission: VolunteerMission;
}

export const MissionCard: React.FC<MissionCardProps> = ({ mission }) => {
  const { joinMission } = useCommunity();

  const isEnrolled = mission.volunteersEnrolled.includes('You (Alex Miller)') || 
                     mission.volunteersEnrolled.some(v => v.includes('You'));

  const isFull = mission.volunteersEnrolled.length >= mission.volunteersNeeded;

  const urgencyBadge = {
    critical: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',
    high: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
    medium: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    low: 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20',
  }[mission.urgency];

  return (
    <div className="glass-card rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800/80 hover:border-teal-500/40 transition-all flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${urgencyBadge}`}>
            {mission.urgency} Urgency
          </span>

          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1">
            <Clock className="w-3 h-3 text-slate-400" />
            {mission.deadline}
          </span>
        </div>

        <h4 className="text-base font-bold text-slate-900 dark:text-white leading-snug mb-1.5">
          {mission.title}
        </h4>

        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-3">
          {mission.description}
        </p>

        <div className="space-y-1.5 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-teal-500 shrink-0" />
            <span className="truncate">{mission.location}</span>
          </div>
          <div className="text-[11px]">
            Organized by: <strong className="text-slate-800 dark:text-slate-200">{mission.organizer}</strong>
          </div>
        </div>

        {/* Progress bar of volunteers */}
        <div className="mt-3.5 pt-3 border-t border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
            <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
              <Users className="w-3.5 h-3.5 text-teal-500" />
              <span>Squad Enrollment</span>
            </span>
            <span className="text-teal-600 dark:text-teal-400">
              {mission.volunteersEnrolled.length} / {mission.volunteersNeeded} Volunteers
            </span>
          </div>

          <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                isFull ? 'bg-emerald-500' : 'bg-gradient-to-r from-teal-500 to-cyan-500'
              }`}
              style={{
                width: `${Math.min(100, (mission.volunteersEnrolled.length / mission.volunteersNeeded) * 100)}%`,
              }}
            />
          </div>

          <div className="mt-2 flex flex-wrap gap-1">
            {mission.volunteersEnrolled.map((v, i) => (
              <span
                key={i}
                className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
              >
                {v}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80">
        {isEnrolled ? (
          <div className="w-full py-2 px-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center justify-center gap-1.5">
            <CheckCircle className="w-4 h-4 text-emerald-500" />
            <span>Enrolled in this Mission</span>
          </div>
        ) : isFull ? (
          <div className="w-full py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 text-xs font-semibold text-center">
            Duty Squad Full
          </div>
        ) : (
          <button
            onClick={() => joinMission(mission.id)}
            className="w-full py-2 px-3 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-md shadow-teal-600/20 active:scale-95 transition-all text-center cursor-pointer"
          >
            Enlist for Squad Mission
          </button>
        )}
      </div>
    </div>
  );
};
