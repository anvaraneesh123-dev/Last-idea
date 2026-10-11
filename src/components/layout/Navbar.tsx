import React, { useState } from 'react';
import { useCommunity } from '../../context/CommunityContext';
import { useAuth } from '../../context/AuthContext';
import { 
  Building2, 
  Search, 
  Sun, 
  Moon, 
  Bell, 
  ShieldAlert, 
  AlertTriangle, 
  ChevronDown, 
  Sparkles, 
  MapPin, 
  Menu, 
  ShieldCheck,
  User,
  LogOut,
  UserCheck,
  Sliders,
  Wifi,
  WifiOff,
  RotateCw,
  AlertCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { NotificationsModal } from '../common/NotificationsModal';

interface NavbarProps {
  onToggleSidebar: () => void;
  onOpenSos: () => void;
  onOpenProfile?: () => void;
  onOpenAuth?: () => void;
  onOpenAssistant?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  onToggleSidebar, 
  onOpenSos,
  onOpenProfile,
  onOpenAuth,
  onOpenAssistant
}) => {
  const { 
    communities, 
    currentCommunity, 
    selectCommunity, 
    isEmergencyMode, 
    toggleEmergencyMode, 
    isDarkMode, 
    toggleDarkMode,
    alerts,
    searchQuery,
    setSearchQuery,
    isDemoMode,
    networkState,
    lastSyncedAt,
    setIsSyncCenterOpen,
    isOffline,
    unreadNotificationsCount
  } = useCommunity();

  const { currentUser, userRole, switchDemoRole, logout } = useAuth();

  const [communityDropdownOpen, setCommunityDropdownOpen] = useState(false);
  const [notificationsModalOpen, setNotificationsModalOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const severeAlerts = alerts.filter(a => a.severity === 'critical' || a.severity === 'severe');

  return (
    <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Left: Mobile menu toggle + Brand Logo */}
          <div className="flex items-center gap-3">
            <button
              onClick={onToggleSidebar}
              className="lg:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none cursor-pointer"
              aria-label="Toggle Navigation Menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <Link to="/dashboard" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-teal-500 to-cyan-400 p-0.5 shadow-md shadow-teal-500/20 group-hover:shadow-teal-500/40 transition-shadow">
                <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                  <span className="font-black text-transparent bg-clip-text bg-gradient-to-tr from-cyan-400 to-teal-200 text-sm tracking-tighter">
                    NX
                  </span>
                </div>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-base font-extrabold tracking-tight text-slate-900 dark:text-white">
                    Nexus
                  </span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20">
                    CommunityOS
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 hidden sm:block -mt-0.5">
                  The OS for Every Community
                </p>
              </div>
            </Link>

            {/* Link back to public landing page */}
            <Link
              to="/"
              className="hidden lg:flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold text-teal-600 dark:text-teal-400 hover:bg-teal-500/10 transition-colors"
            >
              <span>← Landing</span>
            </Link>

            {/* Community Switcher Dropdown */}
            <div className="relative ml-1 sm:ml-3">
              <button
                onClick={() => setCommunityDropdownOpen(!communityDropdownOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200/70 dark:hover:bg-slate-700/60 border border-slate-200 dark:border-slate-700/60 text-xs font-semibold text-slate-800 dark:text-slate-200 transition-all cursor-pointer"
              >
                <Building2 className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0" />
                <span className="max-w-[130px] sm:max-w-[180px] truncate">
                  {currentCommunity.name}
                </span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {communityDropdownOpen && (
                <div className="absolute left-0 mt-2 w-72 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 dark:border-slate-800">
                    Switch Community Cluster
                  </div>
                  <div className="py-1">
                    {communities.map(comm => (
                      <button
                        key={comm.id}
                        onClick={() => {
                          selectCommunity(comm.id);
                          setCommunityDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3.5 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800/60 flex items-start gap-2.5 transition-colors cursor-pointer ${
                          comm.id === currentCommunity.id ? 'bg-teal-50/50 dark:bg-teal-950/20' : ''
                        }`}
                      >
                        <div className={`mt-0.5 p-1 rounded-md ${
                          comm.id === currentCommunity.id 
                            ? 'bg-teal-500 text-white' 
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                        }`}>
                          <Building2 className="w-3.5 h-3.5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-semibold text-slate-900 dark:text-white flex items-center justify-between">
                            <span className="truncate">{comm.name}</span>
                            <span className="text-[10px] text-teal-600 dark:text-teal-400 font-mono uppercase">
                              {comm.type}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3" />
                            <span className="truncate">{comm.location}</span>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* Center: Global Search Bar */}
          <div className="hidden md:flex flex-1 max-w-md mx-2">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Search resources, drills, certified volunteers, shelters..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-8 py-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-2.5 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Right: Emergency Mode Toggle + Notifications + Theme + Profile */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* AI Assistant Quick Trigger */}
            <button
              onClick={onOpenAssistant}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-600/10 via-cyan-500/10 to-teal-500/10 hover:from-blue-600/20 hover:to-teal-500/20 text-blue-700 dark:text-cyan-300 border border-cyan-500/30 text-xs font-bold transition-all shadow-sm cursor-pointer active:scale-95"
              title="Ask Nexus AI Community Assistant"
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-500 animate-pulse" />
              <span className="hidden md:inline">AI Assistant</span>
            </button>

            {/* Network State & Offline Sync Center Button */}
            <button
              onClick={() => setIsSyncCenterOpen(true)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-mono font-bold transition-all shadow-sm cursor-pointer active:scale-95 ${
                networkState === 'online'
                  ? 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                  : networkState === 'syncing'
                  ? 'bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-500/30 animate-pulse'
                  : networkState === 'sync_failed'
                  ? 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border-rose-500/30'
                  : 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/30'
              }`}
              title={`Network State: ${networkState.toUpperCase()} • Last synced: ${new Date(lastSyncedAt).toLocaleTimeString()}`}
            >
              {networkState === 'online' ? (
                <Wifi className="w-3.5 h-3.5 text-emerald-500" />
              ) : networkState === 'syncing' ? (
                <RotateCw className="w-3.5 h-3.5 text-blue-500 animate-spin" />
              ) : networkState === 'sync_failed' ? (
                <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
              ) : (
                <WifiOff className="w-3.5 h-3.5 text-amber-500" />
              )}
              <span className="capitalize hidden sm:inline">{networkState.replace('_', ' ')}</span>
            </button>

            {/* Emergency Mode Toggle Button */}
            <button
              onClick={() => toggleEmergencyMode()}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer ${
                isEmergencyMode
                  ? 'bg-red-600 text-white border-red-500 shadow-red-500/25 pulse-emergency-indicator'
                  : 'bg-slate-100 dark:bg-slate-800/80 hover:bg-red-50 dark:hover:bg-red-950/30 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-red-300 dark:hover:border-red-700/50'
              }`}
              title="Toggle Disaster Emergency Mode"
            >
              <ShieldAlert className={`w-4 h-4 ${isEmergencyMode ? 'text-white animate-pulse' : 'text-red-500'}`} />
              <span className="hidden sm:inline">
                {isEmergencyMode ? 'EMERGENCY MODE' : 'Emergency Mode'}
              </span>
              <span className={`w-2 h-2 rounded-full ${isEmergencyMode ? 'bg-white' : 'bg-slate-400'}`} />
            </button>

            {/* Direct SOS Button (Mobile or Fast Trigger) */}
            <button
              onClick={onOpenSos}
              className="sm:hidden p-2 rounded-xl bg-red-600 text-white shadow-md shadow-red-600/30 cursor-pointer"
              title="Transmit SOS"
            >
              <AlertTriangle className="w-4 h-4" />
            </button>

            {/* Notifications & Dispatches Center */}
            <div className="relative">
              <button
                onClick={() => setNotificationsModalOpen(true)}
                className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative cursor-pointer"
                aria-label="Notifications & Dispatches Center"
                title="Notifications & Dispatches Center"
              >
                <Bell className="w-4 h-4" />
                {unreadNotificationsCount > 0 ? (
                  <span className="absolute top-1 right-1 px-1 min-w-[16px] h-4 rounded-full bg-teal-600 text-[9px] font-bold text-white flex items-center justify-center ring-2 ring-white dark:ring-slate-900 animate-pulse">
                    {unreadNotificationsCount}
                  </span>
                ) : severeAlerts.length > 0 ? (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-slate-900 animate-pulse" />
                ) : null}
              </button>
            </div>

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="Toggle Theme"
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
            </button>

            {/* User Profile Avatar & Dropdown */}
            <div className="relative pl-1 sm:pl-2 border-l border-slate-200 dark:border-slate-800">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 p-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors cursor-pointer text-left"
              >
                <div className="relative">
                  <img
                    src={currentUser.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                    alt={currentUser.fullName}
                    className="w-8 h-8 rounded-xl object-cover ring-2 ring-teal-500/30"
                  />
                  <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900" />
                </div>
                <div className="hidden xl:block">
                  <div className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                    {currentUser.fullName}
                  </div>
                  <div className="text-[10px] text-teal-600 dark:text-teal-400 font-medium uppercase font-mono">
                    {userRole.replace('_', ' ')}
                  </div>
                </div>
                <ChevronDown className="w-3 h-3 text-slate-400 hidden xl:block" />
              </button>

              {/* User Menu Dropdown */}
              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-800">
                    <div className="font-bold text-xs text-slate-900 dark:text-white">
                      {currentUser.fullName}
                    </div>
                    <div className="text-[11px] text-slate-400 truncate">
                      {currentUser.email}
                    </div>
                    <span className="inline-block mt-1 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20">
                      Role: {userRole.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="py-1 text-xs">
                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        onOpenProfile?.();
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800/60 flex items-center gap-2 cursor-pointer text-slate-700 dark:text-slate-300"
                    >
                      <User className="w-3.5 h-3.5 text-teal-500" />
                      <span>Edit Personal Profile</span>
                    </button>

                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        onOpenAuth?.();
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800/60 flex items-center gap-2 cursor-pointer text-slate-700 dark:text-slate-300"
                    >
                      <UserCheck className="w-3.5 h-3.5 text-blue-500" />
                      <span>Switch Account / Sign In</span>
                    </button>

                    <Link
                      to="/settings"
                      onClick={() => setUserDropdownOpen(false)}
                      className="w-full text-left px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800/60 flex items-center gap-2 cursor-pointer text-slate-700 dark:text-slate-300"
                    >
                      <Sliders className="w-3.5 h-3.5 text-slate-400" />
                      <span>System Settings</span>
                    </Link>
                  </div>

                  <div className="pt-1 border-t border-slate-100 dark:border-slate-800">
                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        logout();
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-red-50 dark:hover:bg-red-950/30 flex items-center gap-2 cursor-pointer text-red-600 dark:text-red-400 text-xs font-semibold"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>

        </div>
      </div>

      {/* Notifications & Dispatches Interactive Center */}
      <NotificationsModal
        isOpen={notificationsModalOpen}
        onClose={() => setNotificationsModalOpen(false)}
      />
    </header>
  );
};
