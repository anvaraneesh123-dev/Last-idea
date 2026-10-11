import React, { useState } from 'react';
import { useCommunity } from '../context/CommunityContext';
import { useAuth } from '../context/AuthContext';
import { 
  RESOURCE_USAGE_HISTORY, 
  VOLUNTEER_HOURS_HISTORY 
} from '../data/mockData';
import { 
  Users2, 
  PackageSearch, 
  Inbox, 
  ShieldAlert, 
  Plus, 
  CheckCircle2, 
  HeartHandshake, 
  ArrowUpRight, 
  Clock, 
  TrendingUp, 
  Layers, 
  Radio, 
  Sparkles, 
  AlertTriangle, 
  Send, 
  ChevronRight, 
  Bell, 
  Activity, 
  BarChart3, 
  FileText, 
  Zap, 
  HeartPulse, 
  Droplet,
  Filter,
  Check,
  ShieldCheck,
  UserCheck
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface DashboardPageProps {
  onOpenSos: () => void;
  onOpenSafeCheckIn: () => void;
  onOpenAddResource: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  onOpenSos,
  onOpenSafeCheckIn,
  onOpenAddResource,
}) => {
  const { 
    currentCommunity, 
    resources, 
    volunteers, 
    alerts, 
    requests, 
    activities, 
    sosSignals, 
    isEmergencyMode, 
    toggleEmergencyMode,
    metrics,
    isDemoMode
  } = useCommunity();

  const { currentUser, userRole, isAdmin } = useAuth();

  // Graph state filters
  const [resourceTimeframe, setResourceTimeframe] = useState<'7D' | '30D' | '90D'>('7D');
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(5);
  const [volunteerTimeframe, setVolunteerTimeframe] = useState<'7D' | '30D' | '90D'>('7D');
  const [selectedVolunteerDayIndex, setSelectedVolunteerDayIndex] = useState<number>(5);

  // Notifications tab state
  const [notificationFilter, setNotificationFilter] = useState<'all' | 'urgent' | 'resources'>('all');

  const currentResourceData = RESOURCE_USAGE_HISTORY[selectedDayIndex] || RESOURCE_USAGE_HISTORY[0];
  const currentVolunteerData = VOLUNTEER_HOURS_HISTORY[selectedVolunteerDayIndex] || VOLUNTEER_HOURS_HISTORY[0];

  const filteredNotifications = alerts.filter(a => {
    if (notificationFilter === 'urgent') return a.severity === 'critical' || a.severity === 'severe';
    if (notificationFilter === 'resources') return a.category === 'infrastructure' || a.category === 'safety';
    return true;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      
      {/* Welcome & Context Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20">
              Active Node: {currentCommunity.code}
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Decentralized Mesh Connected
            </span>
            {isDemoMode && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                Local Offline Database
              </span>
            )}
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight mt-1">
            Community Analytics & Command Center
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Real-time telemetry, mutual aid requests, and emergency readiness for {currentCommunity.name}. Logged in as <strong className="text-slate-800 dark:text-slate-200">{currentUser.fullName} ({userRole.replace('_', ' ').toUpperCase()})</strong>.
          </p>
        </div>

        {/* Mode & Action shortcuts */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => toggleEmergencyMode()}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs border transition-all flex items-center gap-2 active:scale-95 cursor-pointer ${
              isEmergencyMode
                ? 'bg-red-600 hover:bg-red-500 text-white border-red-500 shadow-lg shadow-red-600/30 pulse-emergency-indicator'
                : 'bg-slate-100 dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-red-950/30 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
            }`}
          >
            <ShieldAlert className={`w-4 h-4 ${isEmergencyMode ? 'text-white animate-pulse' : 'text-red-500'}`} />
            <span>{isEmergencyMode ? 'DISASTER MODE ACTIVE' : 'Simulate Emergency'}</span>
          </button>

          <button
            onClick={onOpenAddResource}
            className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-md shadow-teal-600/20 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Lend Resource</span>
          </button>
        </div>
      </div>

      {/* TOP CARDS: 4 Primary Metrics (Calculated from Actual Live Records) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* 1. Active Volunteers */}
        <div className="glass-card relative overflow-hidden rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800/80 hover:border-teal-500/40 transition-all hover:shadow-xl group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Active Volunteers
            </span>
            <div className="p-2.5 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400">
              <Users2 className="w-5 h-5" />
            </div>
          </div>

          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {metrics.activeVolunteers}
            </span>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded flex items-center gap-0.5">
              <TrendingUp className="w-3 h-3" /> Live Corps
            </span>
          </div>

          <div className="mt-2 text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/80">
            <span>{volunteers.length} registered in roster</span>
            <Link to="/volunteers" className="text-teal-600 dark:text-teal-400 font-bold hover:underline flex items-center">
              View Corps <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* 2. Resources Available */}
        <div className="glass-card relative overflow-hidden rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800/80 hover:border-blue-500/40 transition-all hover:shadow-xl group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Resources Available
            </span>
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <PackageSearch className="w-5 h-5" />
            </div>
          </div>

          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {metrics.availableResources}
            </span>
            <span className="text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded">
              Ready Stock
            </span>
          </div>

          <div className="mt-2 text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/80">
            <span>{resources.length} total across 10 categories</span>
            <Link to="/resources" className="text-blue-600 dark:text-blue-400 font-bold hover:underline flex items-center">
              Catalog <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* 3. Pending / Open Requests */}
        <div className="glass-card relative overflow-hidden rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800/80 hover:border-amber-500/40 transition-all hover:shadow-xl group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Open Requests
            </span>
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Inbox className="w-5 h-5" />
            </div>
          </div>

          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {metrics.openRequests}
            </span>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
              {metrics.fulfilledRequests} Fulfilled
            </span>
          </div>

          <div className="mt-2 text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/80">
            <span>{requests.filter(r => r.status === 'Matched').length} Auto-Matched by AI</span>
            <Link to="/requests" className="text-amber-600 dark:text-amber-400 font-bold hover:underline flex items-center">
              Aid Queue <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* 4. Emergency Alerts */}
        <div className="glass-card relative overflow-hidden rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800/80 hover:border-red-500/40 transition-all hover:shadow-xl group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Emergency Alerts
            </span>
            <div className={`p-2.5 rounded-xl ${
              isEmergencyMode || metrics.activeSos > 0
                ? 'bg-red-500/20 text-red-500 animate-pulse'
                : 'bg-red-500/10 text-red-500'
            }`}>
              <ShieldAlert className="w-5 h-5" />
            </div>
          </div>

          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {isEmergencyMode ? `${metrics.activeSos} SOS` : metrics.activeAlerts}
            </span>
            <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${
              isEmergencyMode
                ? 'bg-red-600 text-white'
                : 'bg-red-500/10 text-red-600 dark:text-red-400'
            }`}>
              {isEmergencyMode ? 'CRISIS TRIAGE' : '100% Broadcasted'}
            </span>
          </div>

          <div className="mt-2 text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/80">
            <span>{alerts.length} sirens logged in ledger</span>
            <Link to="/emergency" className="text-red-600 dark:text-red-400 font-bold hover:underline flex items-center">
              EOC Room <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

      </div>

      {/* QUICK ACTIONS BAR */}
      <div className="p-6 rounded-3xl glass-card border border-slate-200/80 dark:border-slate-800/80 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-teal-500" />
            <span>Community Rapid Actions</span>
          </h3>
          <span className="text-xs font-semibold text-teal-600 dark:text-teal-400">
            One-Click Triggers
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <button
            onClick={onOpenSos}
            className="p-3.5 rounded-2xl bg-gradient-to-br from-red-600 to-rose-600 text-white hover:opacity-95 text-xs font-bold shadow-md shadow-red-600/20 active:scale-95 transition-all flex flex-col items-center justify-center gap-1.5 text-center cursor-pointer"
          >
            <AlertTriangle className="w-5 h-5 text-white" />
            <span>Broadcast SOS</span>
          </button>

          <button
            onClick={onOpenAddResource}
            className="p-3.5 rounded-2xl bg-teal-50 dark:bg-teal-950/40 hover:bg-teal-100 dark:hover:bg-teal-900/40 border border-teal-500/30 text-teal-800 dark:text-teal-200 text-xs font-bold transition-all flex flex-col items-center justify-center gap-1.5 text-center cursor-pointer"
          >
            <PackageSearch className="w-5 h-5 text-teal-500" />
            <span>List Equipment</span>
          </button>

          <Link
            to="/requests"
            className="p-3.5 rounded-2xl bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/40 border border-blue-500/30 text-blue-800 dark:text-blue-200 text-xs font-bold transition-all flex flex-col items-center justify-center gap-1.5 text-center"
          >
            <Inbox className="w-5 h-5 text-blue-500" />
            <span>Request Aid</span>
          </Link>

          <Link
            to="/volunteers"
            className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 border border-emerald-500/30 text-emerald-800 dark:text-emerald-200 text-xs font-bold transition-all flex flex-col items-center justify-center gap-1.5 text-center"
          >
            <HeartHandshake className="w-5 h-5 text-emerald-500" />
            <span>Mobilize Squad</span>
          </Link>

          <button
            onClick={onOpenSafeCheckIn}
            className="p-3.5 rounded-2xl bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-100 dark:hover:bg-purple-900/40 border border-purple-500/30 text-purple-800 dark:text-purple-200 text-xs font-bold transition-all flex flex-col items-center justify-center gap-1.5 text-center cursor-pointer"
          >
            <CheckCircle2 className="w-5 h-5 text-purple-500" />
            <span>Safety Roll</span>
          </button>

          <Link
            to="/map"
            className="p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition-all flex flex-col items-center justify-center gap-1.5 text-center"
          >
            <BarChart3 className="w-5 h-5 text-slate-500" />
            <span>Tactical Map</span>
          </Link>
        </div>
      </div>

      {/* INTERACTIVE GRAPHS: Resource Usage & Volunteer Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* GRAPH 1: Resource Usage */}
        <div className="p-6 rounded-3xl glass-card border border-slate-200/80 dark:border-slate-800/80 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <PackageSearch className="w-4 h-4 text-teal-500" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Resource Utilization & Flow
                </h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Daily borrowed tools vs returned units vs critical emergency reserves
              </p>
            </div>

            {/* Timeframe pill toggle */}
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-[11px] font-bold self-start sm:self-auto">
              {(['7D', '30D', '90D'] as const).map(tf => (
                <button
                  key={tf}
                  onClick={() => setResourceTimeframe(tf)}
                  className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                    resourceTimeframe === tf
                      ? 'bg-teal-600 text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Chart Visual */}
          <div className="relative pt-4">
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between text-xs mb-4">
              <div>
                <span className="text-slate-400 font-mono text-[11px] uppercase">
                  {currentResourceData.day} Telemetry:
                </span>
                <span className="font-bold text-slate-900 dark:text-white ml-2">
                  {currentResourceData.borrowed} Items Lent
                </span>
                <span className="text-slate-400 mx-1.5">•</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                  {currentResourceData.returned} Returned
                </span>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-teal-500/10 text-teal-600 dark:text-teal-400">
                {currentResourceData.rate} Turnaround Rate
              </span>
            </div>

            <div className="h-48 flex items-end justify-between gap-3 px-2 pt-6 pb-2 border-b border-slate-200 dark:border-slate-800">
              {RESOURCE_USAGE_HISTORY.map((item, idx) => {
                const isSelected = selectedDayIndex === idx;
                const borrowedHeight = Math.round((item.borrowed / 75) * 100);
                const returnedHeight = Math.round((item.returned / 75) * 100);

                return (
                  <div
                    key={item.day}
                    onClick={() => setSelectedDayIndex(idx)}
                    className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer"
                  >
                    <div className="w-full flex items-end justify-center gap-1 h-full">
                      <div
                        className={`w-3 sm:w-4 rounded-t-lg transition-all duration-300 ${
                          isSelected
                            ? 'bg-gradient-to-t from-teal-600 to-cyan-400 ring-2 ring-teal-400'
                            : 'bg-teal-500/60 hover:bg-teal-500'
                        }`}
                        style={{ height: `${borrowedHeight}%` }}
                      />
                      <div
                        className={`w-3 sm:w-4 rounded-t-lg transition-all duration-300 ${
                          isSelected
                            ? 'bg-gradient-to-t from-emerald-600 to-emerald-400 ring-2 ring-emerald-400'
                            : 'bg-emerald-500/40 hover:bg-emerald-500/70'
                        }`}
                        style={{ height: `${returnedHeight}%` }}
                      />
                    </div>

                    <span className={`text-[11px] font-bold mt-2 transition-colors ${
                      isSelected ? 'text-teal-600 dark:text-teal-400 font-black' : 'text-slate-400'
                    }`}>
                      {item.day}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between pt-3 text-[11px] text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-teal-500" />
                  <span>Equipment Borrowed</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />
                  <span>Returned & Refueled</span>
                </span>
              </div>
              <span className="text-[10px] text-slate-400">Click any day column to view</span>
            </div>
          </div>
        </div>

        {/* GRAPH 2: Volunteer Activity */}
        <div className="p-6 rounded-3xl glass-card border border-slate-200/80 dark:border-slate-800/80 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-blue-500" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Volunteer Mobilization & Hours
                </h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Mutual aid deployment hours, on-duty responders, and completed relief missions
              </p>
            </div>

            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-[11px] font-bold self-start sm:self-auto">
              {(['7D', '30D', '90D'] as const).map(tf => (
                <button
                  key={tf}
                  onClick={() => setVolunteerTimeframe(tf)}
                  className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                    volunteerTimeframe === tf
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>
          </div>

          <div className="relative pt-4">
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between text-xs mb-4">
              <div>
                <span className="text-slate-400 font-mono text-[11px] uppercase">
                  {currentVolunteerData.day} Deployment:
                </span>
                <span className="font-bold text-slate-900 dark:text-white ml-2">
                  {currentVolunteerData.hours} Hours Logged
                </span>
                <span className="text-slate-400 mx-1.5">•</span>
                <span className="font-semibold text-blue-600 dark:text-blue-400">
                  {currentVolunteerData.responders} On Duty
                </span>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400">
                {currentVolunteerData.missions} Missions Active
              </span>
            </div>

            <div className="h-48 flex items-end justify-between gap-3 px-2 pt-6 pb-2 border-b border-slate-200 dark:border-slate-800">
              {VOLUNTEER_HOURS_HISTORY.map((item, idx) => {
                const isSelected = selectedVolunteerDayIndex === idx;
                const hoursHeight = Math.round((item.hours / 200) * 100);

                return (
                  <div
                    key={item.day}
                    onClick={() => setSelectedVolunteerDayIndex(idx)}
                    className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer"
                  >
                    <div className="w-full flex items-end justify-center h-full">
                      <div
                        className={`w-7 sm:w-9 rounded-t-xl transition-all duration-300 relative overflow-hidden ${
                          isSelected
                            ? 'bg-gradient-to-t from-blue-600 to-cyan-400 ring-2 ring-blue-400'
                            : 'bg-blue-500/50 hover:bg-blue-500/80'
                        }`}
                        style={{ height: `${hoursHeight}%` }}
                      >
                        <div className="absolute top-1 left-1/2 -translate-x-1/2 text-[9px] font-mono font-bold text-white/90">
                          {item.hours}h
                        </div>
                      </div>
                    </div>

                    <span className={`text-[11px] font-bold mt-2 transition-colors ${
                      isSelected ? 'text-blue-600 dark:text-blue-400 font-black' : 'text-slate-400'
                    }`}>
                      {item.day}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between pt-3 text-[11px] text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1 text-slate-700 dark:text-slate-300">
                  <HeartPulse className="w-3.5 h-3.5 text-rose-500" /> ER Triage
                </span>
                <span className="flex items-center gap-1 text-slate-700 dark:text-slate-300">
                  <Zap className="w-3.5 h-3.5 text-amber-500" /> Power Grid
                </span>
                <span className="flex items-center gap-1 text-slate-700 dark:text-slate-300">
                  <Droplet className="w-3.5 h-3.5 text-teal-500" /> Flood Defense
                </span>
              </div>

              <Link to="/volunteers" className="text-blue-600 dark:text-blue-400 font-bold hover:underline">
                Squad Details →
              </Link>
            </div>
          </div>
        </div>

      </div>

      {/* RECENT UPDATES & NOTIFICATIONS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* RECENT UPDATES FEED */}
        <div className="p-6 rounded-3xl glass-card border border-slate-200/80 dark:border-slate-800/80 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-teal-500" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Recent Community Activity
              </h3>
            </div>
            <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Live Mesh Ledger
            </span>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800/80 space-y-1 max-h-96 overflow-y-auto">
            {activities.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                No activity records logged yet.
              </div>
            ) : (
              activities.map(act => {
                const iconMap = {
                  resource: PackageSearch,
                  volunteer: Users2,
                  emergency: ShieldAlert,
                  request: Inbox,
                  system: Activity,
                };
                const Icon = iconMap[act.type] || Activity;

                return (
                  <div key={act.id} className="pt-3 pb-2 flex items-start gap-3.5 text-xs">
                    <div className={`p-2 rounded-xl shrink-0 mt-0.5 ${
                      act.type === 'emergency'
                        ? 'bg-red-500/10 text-red-500'
                        : act.type === 'resource'
                        ? 'bg-teal-500/10 text-teal-600 dark:text-teal-400'
                        : act.type === 'volunteer'
                        ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                    }`}>
                      <Icon className="w-4 h-4" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <span className="font-bold text-slate-900 dark:text-white truncate">
                          {act.title}
                        </span>
                        <span className="text-[10px] text-slate-400 shrink-0 font-medium">
                          {act.timestamp}
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                        {act.description}
                      </p>

                      <div className="flex items-center gap-2 mt-1">
                        {act.badge && (
                          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
                            {act.badge}
                          </span>
                        )}
                        <span className="text-[10px] text-slate-400">
                          Actor: <strong className="text-slate-700 dark:text-slate-300">{act.actor}</strong>
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* NOTIFICATIONS & DISPATCHES */}
        <div className="p-6 rounded-3xl glass-card border border-slate-200/80 dark:border-slate-800/80 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-teal-500" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Live Dispatches & Notifications
              </h3>
            </div>

            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg text-[10px] font-bold">
              {(['all', 'urgent', 'resources'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setNotificationFilter(f)}
                  className={`px-2 py-0.5 rounded transition-colors uppercase cursor-pointer ${
                    notificationFilter === f
                      ? 'bg-teal-600 text-white'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto">
            {filteredNotifications.map(alert => (
              <div
                key={alert.id}
                className={`p-3.5 rounded-2xl border transition-all text-xs space-y-1.5 ${
                  alert.severity === 'severe' || alert.severity === 'critical'
                    ? 'border-red-500/40 bg-red-500/[0.03]'
                    : alert.severity === 'warning'
                    ? 'border-amber-500/40 bg-amber-500/[0.02]'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                      alert.severity === 'severe' || alert.severity === 'critical'
                        ? 'bg-red-600 text-white'
                        : alert.severity === 'warning'
                        ? 'bg-amber-600 text-white'
                        : 'bg-blue-600 text-white'
                    }`}>
                      {alert.severity}
                    </span>

                    <span className="font-bold text-slate-900 dark:text-white truncate">
                      {alert.title}
                    </span>
                  </div>

                  <span className="text-[10px] text-slate-400 shrink-0">
                    {alert.timestamp}
                  </span>
                </div>

                <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                  {alert.message}
                </p>

                {alert.actionRequired && (
                  <div className="text-[10px] font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-1 pt-0.5">
                    <span>⚠️ Directive:</span>
                    <span>{alert.actionRequired}</span>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="pt-2 text-center border-t border-slate-100 dark:border-slate-800/80">
            <Link
              to="/announcements"
              className="text-xs font-bold text-teal-600 dark:text-teal-400 hover:underline flex items-center justify-center gap-1"
            >
              <span>View Full Notice Board & Townhall Ballots</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

      </div>

    </div>
  );
};
