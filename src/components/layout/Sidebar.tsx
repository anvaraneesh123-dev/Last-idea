import React from 'react';
import { NavLink } from 'react-router-dom';
import { useCommunity } from '../../context/CommunityContext';
import { 
  LayoutDashboard, 
  Map,
  PackageSearch, 
  Users2, 
  Inbox,
  ShieldAlert, 
  BarChart3,
  Sliders, 
  ShieldCheck, 
  Radio, 
  Sparkles,
  HeartPulse,
  Flame,
  X
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { currentCommunity, isEmergencyMode, resources, volunteers, sosSignals, requests } = useCommunity();

  const activeSosCount = sosSignals.filter(s => s.status === 'pending').length;
  const availableResourcesCount = resources.filter(r => (r.availableQuantity && r.availableQuantity > 0) || r.status === 'available').length;
  const onDutyVolunteersCount = volunteers.filter(v => v.availability === 'available' || v.availability === 'on_mission' || v.status === 'available').length;
  const pendingRequestsCount = requests?.filter(r => r.status === 'Open' || (r.status as string) === 'pending').length || 0;

  const navItems = [
    {
      to: '/dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      to: '/map',
      label: 'Community Map',
      icon: Map,
      badge: 'Live',
    },
    {
      to: '/resources',
      label: 'Resources',
      icon: PackageSearch,
      badge: `${availableResourcesCount} ready`,
    },
    {
      to: '/volunteers',
      label: 'Volunteers',
      icon: Users2,
      badge: `${onDutyVolunteersCount} active`,
    },
    {
      to: '/requests',
      label: 'Requests',
      icon: Inbox,
      badge: pendingRequestsCount > 0 ? `${pendingRequestsCount} new` : null,
    },
    {
      to: '/emergency',
      label: 'Emergency Mode',
      icon: ShieldAlert,
      badge: activeSosCount > 0 ? `${activeSosCount} SOS` : 'Standby',
      highlight: isEmergencyMode,
    },
    {
      to: '/reports',
      label: 'Reports',
      icon: BarChart3,
      badge: null,
    },
    {
      to: '/settings',
      label: 'Settings',
      icon: Sliders,
      badge: null,
    },
    {
      to: '/',
      label: 'Landing Page',
      icon: Sparkles,
      badge: 'Public',
    },
  ];



  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
        />
      )}

      <aside
        className={`fixed lg:sticky top-0 lg:top-16 z-40 lg:z-10 h-screen lg:h-[calc(100vh-4rem)] w-64 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-r border-slate-200/80 dark:border-slate-800/80 flex flex-col justify-between transition-transform duration-200 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="p-4 space-y-6 overflow-y-auto">
          {/* Mobile close button */}
          <div className="flex items-center justify-between lg:hidden pb-2 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-slate-900 dark:text-white">Nexus Menu</span>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Current Community Card */}
          <div className="rounded-2xl p-3.5 bg-gradient-to-br from-emerald-500/10 via-amber-800/10 to-blue-600/10 border border-emerald-600/20 text-stone-800 dark:text-stone-200 shadow-sm">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-bold tracking-wider uppercase text-emerald-700 dark:text-emerald-400">
                ACTIVE DOMAIN
              </span>
              <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-600/15 text-emerald-800 dark:text-emerald-300">
                {currentCommunity.code}
              </span>
            </div>
            <div className="font-bold text-xs text-stone-900 dark:text-white truncate">
              {currentCommunity.name}
            </div>
            <div className="text-[11px] text-stone-600 dark:text-stone-400 mt-0.5 flex items-center justify-between">
              <span>Pop: {currentCommunity.population.toLocaleString()}</span>
              <span className="flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-semibold">
                <ShieldCheck className="w-3.5 h-3.5" />
                {currentCommunity.emergencyReadinessScore}% Ready
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            <div className="text-[11px] font-bold uppercase tracking-wider text-amber-900/60 dark:text-amber-200/60 px-3 pb-2">
              Platform Modules
            </div>

            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => onClose()}
                  className={({ isActive }) => `flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                    isActive
                      ? item.highlight
                        ? 'bg-red-600 text-white shadow-md shadow-red-600/30 font-bold'
                        : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-600/25 font-bold shadow-sm'
                      : item.highlight
                      ? 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30'
                      : 'text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800/60 hover:text-stone-900 dark:hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <Icon className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${
                      item.highlight ? 'text-red-500 animate-pulse' : ''
                    }`} />
                    <span className="truncate">{item.label}</span>
                  </div>

                  {item.badge && (
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ml-2 ${
                      item.highlight
                        ? 'bg-white text-red-700'
                        : 'bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300 group-hover:bg-slate-300 dark:group-hover:bg-slate-700'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer Metric & Mesh Status */}
        <div className="p-4 border-t border-slate-200/80 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 mb-2">
            <span className="flex items-center gap-1.5 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Decentralized Mesh
            </span>
            <span className="font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
              99.9% Up
            </span>
          </div>

          {/* Readiness Meter */}
          <div className="space-y-1">
            <div className="flex justify-between text-[10px] font-semibold text-slate-600 dark:text-slate-300">
              <span>Disaster Resilience</span>
              <span>{currentCommunity.emergencyReadinessScore}%</span>
            </div>
            <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-teal-500 to-emerald-400 rounded-full transition-all duration-500"
                style={{ width: `${currentCommunity.emergencyReadinessScore}%` }}
              />
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
