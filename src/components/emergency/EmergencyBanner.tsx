import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCommunity } from '../../context/CommunityContext';
import { 
  AlertOctagon, 
  PhoneCall, 
  Radio, 
  CheckCircle, 
  RadioTower, 
  ChevronDown, 
  PowerOff,
  Flame,
  CloudLightning,
  Waves
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface EmergencyBannerProps {
  onOpenSos: () => void;
  onOpenSafeCheckIn: () => void;
}

export const EmergencyBanner: React.FC<EmergencyBannerProps> = ({ 
  onOpenSos, 
  onOpenSafeCheckIn 
}) => {
  const { 
    isEmergencyMode, 
    toggleEmergencyMode, 
    emergencyCause, 
    setEmergencyCause,
    sosSignals
  } = useCommunity();

  const [showScenarioMenu, setShowScenarioMenu] = useState(false);

  if (!isEmergencyMode) return null;

  const scenarios = [
    { label: 'Severe Flash Flood & Microburst', icon: Waves },
    { label: 'Regional Power Grid Failure (Blackout)', icon: PowerOff },
    { label: 'Urban Wildfire / Evacuation Advisory', icon: Flame },
    { label: 'Severe Winter Blizzard / Sub-zero Freeze', icon: CloudLightning },
  ];

  const pendingSosCount = sosSignals.filter(s => s.status === 'pending').length;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: 'auto', opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        className="relative z-30 bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white shadow-xl border-b border-red-500/50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex flex-col md:flex-row items-center justify-between gap-3">
            
            {/* Status title & flashing beacon */}
            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="relative flex items-center justify-center">
                <span className="w-3.5 h-3.5 rounded-full bg-white animate-ping absolute opacity-75" />
                <span className="w-3.5 h-3.5 rounded-full bg-white relative flex items-center justify-center shadow-lg">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-600" />
                </span>
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-black/30 backdrop-blur-sm border border-white/20">
                    DISASTER EMERGENCY PROTOCOL ACTIVE
                  </span>

                  {pendingSosCount > 0 && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-amber-400 text-amber-950 animate-bounce">
                      {pendingSosCount} Priority SOS Active
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs sm:text-sm font-semibold text-white/95 truncate">
                    Incident: {emergencyCause}
                  </span>

                  {/* Scenario switcher dropdown */}
                  <div className="relative">
                    <button
                      onClick={() => setShowScenarioMenu(!showScenarioMenu)}
                      className="text-[11px] underline text-red-100 hover:text-white flex items-center gap-0.5 font-medium ml-1 cursor-pointer"
                    >
                      Change Scenario <ChevronDown className="w-3 h-3" />
                    </button>

                    {showScenarioMenu && (
                      <div className="absolute left-0 mt-2 w-64 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl py-1 z-50 text-slate-100 text-xs">
                        <div className="px-3 py-1.5 text-[10px] uppercase font-bold text-slate-400 border-b border-slate-800">
                          Simulate Disaster Scenario
                        </div>
                        {scenarios.map((sc, i) => {
                          const Icon = sc.icon;
                          return (
                            <button
                              key={i}
                              onClick={() => {
                                setEmergencyCause(sc.label);
                                setShowScenarioMenu(false);
                              }}
                              className="w-full text-left px-3 py-2 hover:bg-slate-800 flex items-center gap-2 transition-colors cursor-pointer"
                            >
                              <Icon className="w-3.5 h-3.5 text-teal-400" />
                              <span>{sc.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Quick action buttons */}
            <div className="flex items-center gap-2 w-full md:w-auto justify-end flex-wrap">
              <button
                onClick={onOpenSos}
                className="px-3.5 py-1.5 rounded-lg bg-white text-red-700 hover:bg-red-50 font-bold text-xs shadow-md transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer"
              >
                <AlertOctagon className="w-4 h-4 text-red-600" />
                <span>Transmit SOS</span>
              </button>

              <button
                onClick={onOpenSafeCheckIn}
                className="px-3.5 py-1.5 rounded-lg bg-red-900/40 hover:bg-red-900/60 border border-white/20 text-white font-medium text-xs backdrop-blur-sm transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer"
              >
                <CheckCircle className="w-4 h-4 text-emerald-300" />
                <span>Mark Myself Safe</span>
              </button>

              <Link
                to="/emergency"
                className="px-3 py-1.5 rounded-lg bg-red-950/60 hover:bg-red-950/80 border border-red-400/30 text-white font-medium text-xs transition-all flex items-center gap-1.5"
              >
                <Radio className="w-3.5 h-3.5 text-amber-300" />
                <span className="hidden sm:inline">Emergency Hub</span>
              </Link>

              <div className="hidden lg:flex items-center gap-1 text-[11px] px-2 py-1 bg-black/20 rounded border border-white/10 text-red-100">
                <RadioTower className="w-3.5 h-3.5 text-amber-300" />
                <span>Radio VHF 146.520 MHz</span>
              </div>

              <div className="hidden xl:flex items-center gap-1 text-[11px] px-2 py-1 bg-black/20 rounded border border-white/10 text-red-100">
                <PhoneCall className="w-3.5 h-3.5 text-green-300" />
                <span>Crisis Dispatch: 911</span>
              </div>

              <button
                onClick={() => toggleEmergencyMode(false)}
                className="ml-1 text-[11px] text-red-200 hover:text-white px-2 py-1 rounded hover:bg-red-800/40 transition-colors cursor-pointer"
                title="Deactivate Disaster Mode"
              >
                Stand Down
              </button>
            </div>

          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
