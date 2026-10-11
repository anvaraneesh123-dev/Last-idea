import React from 'react';
import { useCommunity } from '../../context/CommunityContext';
import { Shield, RadioTower, Heart, Sparkles, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  const { currentCommunity } = useCommunity();

  return (
    <footer className="border-t border-slate-200/80 dark:border-slate-800/80 bg-white/60 dark:bg-slate-900/60 backdrop-blur-md py-8 mt-12 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-teal-500 flex items-center justify-center text-white font-extrabold text-xs shadow-md shadow-teal-500/20">
              NX
            </div>
            <div>
              <div className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>Nexus – CommunityOS</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-teal-500/10 text-teal-600 dark:text-teal-400">
                  v2.4 LTS
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                The Operating System for Every Community. Powered by neighbor-to-neighbor resilience.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6 text-xs text-slate-600 dark:text-slate-400">
            <Link to="/resources" className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors">
              Resource Directory
            </Link>
            <Link to="/volunteers" className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors">
              Volunteer Registry
            </Link>
            <Link to="/emergency" className="hover:text-red-600 dark:hover:text-red-400 transition-colors font-medium">
              Crisis Protocol
            </Link>
            <Link to="/map" className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors">
              GIS Locator
            </Link>
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1.5">
              <RadioTower className="w-3.5 h-3.5 text-teal-500" />
              <span>Offline-First Mesh sync</span>
            </span>
            <span>•</span>
            <span>{currentCommunity.name}</span>
          </div>

        </div>
      </div>
    </footer>
  );
};
