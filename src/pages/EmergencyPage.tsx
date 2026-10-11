import React, { useState } from 'react';
import { useCommunity } from '../context/CommunityContext';
import { useAuth } from '../context/AuthContext';
import { 
  ShieldAlert, 
  AlertOctagon, 
  PhoneCall, 
  Radio, 
  CheckCircle2, 
  HeartPulse, 
  Truck, 
  BatteryCharging, 
  MapPin, 
  Plus, 
  Waves, 
  RadioTower, 
  Users, 
  AlertTriangle,
  Flame,
  Check,
  Clock,
  History,
  FileText,
  ShieldCheck,
  AlertCircle,
  Eye,
  Filter,
  ExternalLink,
  ChevronRight,
  Info,
  Construction,
  Shield,
  HelpCircle,
  Edit3,
  PowerOff,
  X,
  FileEdit,
  ShieldX,
  UserCheck,
  LifeBuoy
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { EmergencyType, AlertSeverity, VerificationTier, CommunityAlert } from '../types';

interface EmergencyPageProps {
  onOpenSos: () => void;
  onOpenSafeCheckIn: () => void;
}

export const EmergencyPage: React.FC<EmergencyPageProps> = ({ 
  onOpenSos, 
  onOpenSafeCheckIn 
}) => {
  const { 
    isEmergencyMode, 
    toggleEmergencyMode, 
    emergencyCause, 
    setEmergencyCause,
    sosSignals, 
    resolveSosSignal,
    resources, 
    currentCommunity,
    safeCheckIns,
    alerts,
    addAlert,
    updateAlert,
    deactivateAlert,
    hazardReports,
    verifyHazardReport,
    clearHazardReport,
    setIsReportHazardModalOpen,
    setIsDeactivateModalOpen,
    emergencyAuditLogs,
    addEmergencyAuditEntry,
    requests,
    volunteers,
    joinMission
  } = useCommunity();

  const { currentUser, userRole, isAdmin, isVolunteer } = useAuth();
  const isPrivileged = isAdmin || isVolunteer;

  // Form states for creating emergency alert
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [alertSeverity, setAlertSeverity] = useState<AlertSeverity>('critical');
  const [emergencyType, setEmergencyType] = useState<EmergencyType>('flood');
  const [affectedArea, setAffectedArea] = useState('Cascadia Sector 4 & Creek Basins');
  const [actionRequired, setActionRequired] = useState('Evacuate low ground immediately; report to Civic Center.');
  const [broadcastDone, setBroadcastDone] = useState(false);
  const [showCreateAlertForm, setShowCreateAlertForm] = useState(false);

  // Alert filter state: active | deactivated | all
  const [alertFilter, setAlertFilter] = useState<'active' | 'deactivated' | 'all'>('active');

  // Editing alert modal state
  const [editingAlert, setEditingAlert] = useState<CommunityAlert | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editMessage, setEditMessage] = useState('');
  const [editSeverity, setEditSeverity] = useState<AlertSeverity>('critical');
  const [editEmergencyType, setEditEmergencyType] = useState<EmergencyType>('flood');
  const [editAffectedArea, setEditAffectedArea] = useState('');
  const [editActionRequired, setEditActionRequired] = useState('');

  // Deactivating alert modal state
  const [deactivatingAlert, setDeactivatingAlert] = useState<CommunityAlert | null>(null);
  const [deactivateReason, setDeactivateReason] = useState('Water crest receded below caution threshold; hazard cleared.');

  // Hazard feed filter
  const [hazardFilter, setHazardFilter] = useState<'all' | 'blocked_roads' | 'unverified'>('all');

  // Resource priority category filter
  const [resourceFilter, setResourceFilter] = useState<'all' | 'shelter' | 'water' | 'food' | 'medical' | 'rescue' | 'power'>('all');


  // Stale threshold helper: checks if reported time mentions 2+ hours, days, etc.
  const isStale = (timeStr?: string) => {
    if (!timeStr) return false;
    const lower = timeStr.toLowerCase();
    if (lower.includes('2 hour') || lower.includes('3 hour') || lower.includes('4 hour') || lower.includes('day') || lower.includes('yesterday')) {
      return true;
    }
    return false;
  };

  // Filtered resources for emergency prioritization
  const emergencyResources = resources.filter(r => {
    if (r.availability === 'deactivated' || r.status === 'deactivated') return false;
    if (!r.isEmergencyEligible && r.status !== 'critical_reserve') return false;
    if (resourceFilter === 'shelter' && r.category !== 'shelters') return false;
    if (resourceFilter === 'water' && r.category !== 'water') return false;
    if (resourceFilter === 'food' && r.category !== 'food') return false;
    if (resourceFilter === 'medical' && r.category !== 'medicine' && r.category !== 'hospitals') return false;
    if (resourceFilter === 'rescue' && r.category !== 'rescue_equipment') return false;
    if (resourceFilter === 'power' && r.category !== 'generators') return false;
    return true;
  });

  // Filtered hazard reports
  const filteredHazards = hazardReports.filter(h => {
    if (hazardFilter === 'blocked_roads') return h.isRoadBlocked;
    if (hazardFilter === 'unverified') return h.verificationTier === 'unverified_report';
    return true;
  });

  // Urgent citizen requests
  const urgentRequests = requests.filter(req => 
    req.urgency === 'critical' || req.urgency === 'high'
  );

  const pendingSos = sosSignals.filter(s => s.status === 'pending');
  const inProgressSos = sosSignals.filter(s => s.status === 'in_progress');
  const activeRoadblocks = hazardReports.filter(h => h.isRoadBlocked && h.status !== 'cleared');

  // Broadcast alert handler
  const handleBroadcastAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!alertTitle.trim() || !alertMessage.trim()) return;

    await addAlert({
      title: `[${emergencyType.toUpperCase()}] ${alertTitle}`,
      message: alertMessage,
      description: alertMessage,
      severity: alertSeverity,
      category: emergencyType === 'infrastructure_failure' ? 'infrastructure' : emergencyType === 'flood' || emergencyType === 'severe_weather' ? 'weather' : 'safety',
      emergencyType,
      affectedArea: affectedArea.trim() || currentCommunity.name,
      status: 'active',
      author: `${currentUser?.fullName || 'Administrator'} (${currentUser?.role || 'Admin'})`,
      actionRequired: actionRequired.trim() || undefined
    });

    setAlertTitle('');
    setAlertMessage('');
    setShowCreateAlertForm(false);
    setBroadcastDone(true);
    setTimeout(() => setBroadcastDone(false), 4000);
  };

  const handleOpenEditAlert = (alertItem: CommunityAlert) => {
    setEditingAlert(alertItem);
    setEditTitle(alertItem.title.replace(/^\[.*?\]\s*/, ''));
    setEditMessage(alertItem.description || alertItem.message);
    setEditSeverity(alertItem.severity);
    setEditEmergencyType(alertItem.emergencyType || 'flood');
    setEditAffectedArea(alertItem.affectedArea || currentCommunity.name);
    setEditActionRequired(alertItem.actionRequired || '');
  };

  const handleSaveAlertEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAlert) return;

    await updateAlert(editingAlert.id, {
      title: `[${editEmergencyType.toUpperCase()}] ${editTitle}`,
      message: editMessage,
      description: editMessage,
      severity: editSeverity,
      emergencyType: editEmergencyType,
      affectedArea: editAffectedArea,
      actionRequired: editActionRequired.trim() || undefined,
    }, currentUser?.fullName || 'Administrator', userRole);

    setEditingAlert(null);
  };

  const handleConfirmDeactivateAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deactivatingAlert || !deactivateReason.trim()) return;

    await deactivateAlert(
      deactivatingAlert.id,
      deactivateReason,
      currentUser?.fullName || 'Administrator',
      userRole
    );

    setDeactivatingAlert(null);
  };

  // Prioritized volunteers for emergency triage
  const prioritizedVolunteers = volunteers.filter(v => {
    return v.emergencyCertified || v.isFirstAidCertified || (v.certifications && v.certifications.length > 0) || v.availability === 'available' || v.status === 'available';
  });

  // Prioritized urgent citizen requests
  const prioritizedRequests = requests.filter(req => 
    (req.urgency === 'critical' || req.urgency === 'high') && req.status !== 'Fulfilled' && req.status !== 'Cancelled'
  );

  // Filtered alerts by active, deactivated, all
  const filteredAlerts = alerts.filter(a => {
    if (alertFilter === 'active') return a.status !== 'deactivated';
    if (alertFilter === 'deactivated') return a.status === 'deactivated';
    return true;
  });


  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      
      {/* 1. MANDATORY OFFICIAL EMERGENCY SERVICES DISCLAIMER BANNER */}
      <div className="p-4 sm:p-5 rounded-2xl bg-amber-500/10 dark:bg-amber-950/30 border-2 border-amber-500/40 text-amber-900 dark:text-amber-200 shadow-sm flex items-start gap-3.5">
        <AlertTriangle className="w-6 h-6 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-1 text-xs">
          <div className="font-black uppercase tracking-wider text-amber-950 dark:text-amber-100 flex items-center gap-2">
            <span>OFFICIAL EMERGENCY CIVIL DEFENSE NOTICE</span>
            <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-[10px] font-mono">MANDATORY PROTOCOL</span>
          </div>
          <p className="leading-relaxed font-medium">
            <strong>Nexus complements, rather than replaces, official emergency civil defense systems (911 / First Responders).</strong> In any immediate life-threatening emergency, injury, or structural collapse, contact official 911 dispatch immediately. 
          </p>
          <p className="text-[11px] text-amber-800 dark:text-amber-300 font-semibold">
            ⚠️ <strong>Safety Rule:</strong> Nexus never invents automated safe routes or declares uninspected roads safe. All road blockages and detour suggestions must be verified on the ground before transit.
          </p>
        </div>
      </div>

      {/* 2. TOP EOC COMMAND HEADER */}
      <div className={`p-6 sm:p-8 rounded-3xl border transition-all duration-300 ${
        isEmergencyMode 
          ? 'bg-gradient-to-r from-red-950/90 via-slate-900 to-red-950/90 border-red-500/60 shadow-2xl text-white'
          : 'glass-card border-slate-200/80 dark:border-slate-800/80'
      }`}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className={`px-2.5 py-1 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-1.5 ${
                isEmergencyMode
                  ? 'bg-red-600 text-white animate-pulse shadow-lg shadow-red-600/40'
                  : 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20'
              }`}>
                <ShieldAlert className="w-3.5 h-3.5" />
                {isEmergencyMode ? 'DISASTER EMERGENCY ACTIVE' : 'EOC STANDBY READY'}
              </span>

              <span className="text-xs font-mono text-slate-400">
                EOC Node #{currentCommunity.code}
              </span>

              {isEmergencyMode && emergencyCause && (
                <span className="px-2 py-0.5 rounded-full bg-white/10 text-xs font-semibold text-red-200 border border-white/20">
                  Cause: {emergencyCause}
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
              Emergency Operations Center (EOC)
            </h1>

            <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Real-time disaster dispatch, life-safety asset triage, emergency shelters, and local community mesh coordination during floods, wildfires, severe storms, and infrastructure failures.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            <button
              onClick={onOpenSos}
              className="px-4 py-3 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-extrabold text-xs shadow-lg shadow-red-600/30 flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
            >
              <AlertOctagon className="w-4 h-4" />
              <span>Broadcast SOS</span>
            </button>

            <button
              onClick={() => setIsReportHazardModalOpen(true)}
              className="px-4 py-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-extrabold text-xs shadow-lg shadow-amber-600/30 flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
            >
              <AlertTriangle className="w-4 h-4" />
              <span>Report Hazard / Road</span>
            </button>

            <button
              onClick={onOpenSafeCheckIn}
              className="px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-extrabold text-xs flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Check In Safe</span>
            </button>

            {/* Emergency Mode Toggle: Clicking when active will open the confirmation modal! */}
            <button
              onClick={() => toggleEmergencyMode()}
              className={`px-4 py-3 rounded-xl font-black text-xs border transition-all text-center cursor-pointer shadow-sm ${
                isEmergencyMode
                  ? 'bg-red-900/60 hover:bg-red-800 text-white border-red-400 shadow-md'
                  : 'bg-red-600 hover:bg-red-500 text-white border-red-600'
              }`}
              title={isEmergencyMode ? 'Deactivate emergency mode (requires reason & confirmation)' : 'Activate emergency mode'}
            >
              {isEmergencyMode ? 'Deactivate Emergency ⚠' : 'Activate Disaster Mode'}
            </button>
          </div>
        </div>
      </div>

      {/* 3. EMERGENCY STATUS INDICATOR CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card rounded-2xl p-5 border border-red-500/30 bg-red-500/[0.02]">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-red-600 dark:text-red-400 mb-1">
            <span>Pending Distress Signals</span>
            <AlertOctagon className="w-4 h-4" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white mt-2">
            {pendingSos.length}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {inProgressSos.length} currently being reached by teams
          </div>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-amber-500/30 bg-amber-500/[0.02]">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 mb-1">
            <span>Reported Roadblocks</span>
            <Construction className="w-4 h-4" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white mt-2">
            {activeRoadblocks.length}
          </div>
          <div className="text-xs text-amber-600 dark:text-amber-400 mt-1 font-semibold flex items-center gap-1">
            <span>{hazardReports.length} total active hazard alerts</span>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-teal-500/30 bg-teal-500/[0.02]">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400 mb-1">
            <span>Shelter Capacity</span>
            <Users className="w-4 h-4" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white mt-2">
            240 Cots
          </div>
          <div className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 font-semibold">
            Civic Rec Hall • 72% Available
          </div>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-blue-500/30 bg-blue-500/[0.02]">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-1">
            <span>Safe Check-Ins Logged</span>
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white mt-2">
            {safeCheckIns.length}
          </div>
          <div className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 font-semibold">
            Citizens confirmed sheltered
          </div>
        </div>
      </div>

      {/* 4. ADMIN EMERGENCY ALERT DISPATCH & BROADCAST SECTION */}
      <div className="p-6 rounded-3xl glass-card border border-red-500/30 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <Radio className="w-5 h-5 text-red-500 animate-pulse" />
              <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
                Emergency Alert Management & Civil Broadcasts
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Authorized administrators can issue, update, and manage official bulletins for floods, fires, severe weather, and infrastructure failures.
            </p>
          </div>

          {isAdmin ? (
            <button
              onClick={() => setShowCreateAlertForm(prev => !prev)}
              className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-md shadow-red-600/20 flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>{showCreateAlertForm ? 'Close Dispatch Form' : 'Issue New Alert'}</span>
            </button>
          ) : (
            <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
              <Info className="w-3.5 h-3.5" />
              <span>Admin role required to broadcast alerts</span>
            </span>
          )}
        </div>

        {broadcastDone && (
          <div className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-800 dark:text-emerald-200 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>Emergency Bulletin successfully broadcasted and recorded to the emergency audit log!</span>
          </div>
        )}

        {/* Create Alert Form (Visible to Admins) */}
        {showCreateAlertForm && (
          <form onSubmit={handleBroadcastAlert} className="p-5 rounded-2xl bg-red-500/5 border border-red-500/20 space-y-4 animate-in fade-in">
            <div className="text-xs font-black uppercase text-red-600 dark:text-red-400 tracking-wider">
              Create & Broadcast Official Emergency Alert
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Incident Type
                </label>
                <select
                  value={emergencyType}
                  onChange={e => setEmergencyType(e.target.value as EmergencyType)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="flood">Flood / Dam Crest Overflow</option>
                  <option value="fire">Wildfire / Structure Fire</option>
                  <option value="severe_weather">Severe Weather / Storm</option>
                  <option value="infrastructure_failure">Infrastructure Failure (Power/Water)</option>
                  <option value="other">Other Life Safety Hazard</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Severity Tier
                </label>
                <select
                  value={alertSeverity}
                  onChange={e => setAlertSeverity(e.target.value as AlertSeverity)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="critical">Critical (Immediate Danger to Life)</option>
                  <option value="severe">Severe (Urgent Evacuation / Protective Action)</option>
                  <option value="warning">Warning (Hazard Expected)</option>
                  <option value="info">Advisory / Public Notice</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Affected Geographic Area
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sector 4, Pine St, Lower River Basin"
                  value={affectedArea}
                  onChange={e => setAffectedArea(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                Headline / Warning Title
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Mandatory Evacuation Order Issued for Pine River Basin"
                value={alertTitle}
                onChange={e => setAlertTitle(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                Detailed Emergency Description
              </label>
              <textarea
                required
                rows={2}
                placeholder="Describe current status, expected crest times, road blockages, sandbag depot locations..."
                value={alertMessage}
                onChange={e => setAlertMessage(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                Required Citizen Action / Protocol
              </label>
              <input
                type="text"
                placeholder="e.g. Move immediately to high ground. Do not attempt to drive through standing water."
                value={actionRequired}
                onChange={e => setActionRequired(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowCreateAlertForm(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-md shadow-red-600/30 flex items-center gap-1.5 cursor-pointer"
              >
                <Radio className="w-3.5 h-3.5" />
                <span>Publish Official Alert & Log Audit</span>
              </button>
            </div>
          </form>
        )}

        {/* Existing Alerts List with Status Tabs, Stale Data Warning and Edit/Deactivate Controls */}
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <span>Emergency Bulletins ({filteredAlerts.length})</span>
              <span className="text-[10px] text-slate-400 font-mono">Total {alerts.length} on ledger</span>
            </div>

            {/* Alert Filter Tabs */}
            <div className="flex items-center gap-1.5 text-xs font-bold">
              <span className="text-slate-400 text-[10px] uppercase tracking-wider mr-1">Status:</span>
              <button
                type="button"
                onClick={() => setAlertFilter('active')}
                className={`px-2.5 py-1 rounded-xl text-[11px] transition-all cursor-pointer ${
                  alertFilter === 'active'
                    ? 'bg-red-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                Active ({alerts.filter(a => a.status !== 'deactivated').length})
              </button>
              <button
                type="button"
                onClick={() => setAlertFilter('deactivated')}
                className={`px-2.5 py-1 rounded-xl text-[11px] transition-all cursor-pointer ${
                  alertFilter === 'deactivated'
                    ? 'bg-slate-700 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                Stood Down Archive ({alerts.filter(a => a.status === 'deactivated').length})
              </button>
              <button
                type="button"
                onClick={() => setAlertFilter('all')}
                className={`px-2.5 py-1 rounded-xl text-[11px] transition-all cursor-pointer ${
                  alertFilter === 'all'
                    ? 'bg-teal-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                All ({alerts.length})
              </button>
            </div>
          </div>

          {filteredAlerts.length === 0 ? (
            <div className="p-8 text-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 text-xs text-slate-400">
              No bulletins match current status filter.
            </div>
          ) : (
            filteredAlerts.map(a => {
              const stale = isStale(a.timestamp);
              const isDeactivated = a.status === 'deactivated';

              return (
                <div 
                  key={a.id}
                  className={`p-4 rounded-2xl border transition-all ${
                    isDeactivated
                      ? 'bg-slate-100/70 dark:bg-slate-900/40 border-slate-300 dark:border-slate-800 opacity-75'
                      : a.severity === 'critical'
                      ? 'bg-red-500/10 border-red-500/40 text-red-950 dark:text-red-100'
                      : a.severity === 'severe'
                      ? 'bg-amber-500/10 border-amber-500/40 text-amber-950 dark:text-amber-100'
                      : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        {/* Severity Badge */}
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                          isDeactivated
                            ? 'bg-slate-400 text-white'
                            : a.severity === 'critical'
                            ? 'bg-red-600 text-white animate-pulse'
                            : a.severity === 'severe'
                            ? 'bg-amber-600 text-white'
                            : 'bg-blue-600 text-white'
                        }`}>
                          {a.severity}
                        </span>

                        {/* Status Badge */}
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase border ${
                          isDeactivated
                            ? 'bg-slate-200 dark:bg-slate-800 text-slate-500 border-slate-300 dark:border-slate-700'
                            : a.status === 'updated'
                            ? 'bg-blue-500/20 text-blue-700 dark:text-blue-300 border-blue-500/30'
                            : 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/30'
                        }`}>
                          {isDeactivated ? 'STAND DOWN / DEACTIVATED' : a.status === 'updated' ? 'REVISED & UPDATED' : 'ACTIVE DISPATCH'}
                        </span>

                        <span className="px-2 py-0.5 rounded-full bg-red-600/20 text-red-700 dark:text-red-300 text-[10px] font-bold border border-red-500/30 flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3" />
                          Official Civil Alert
                        </span>

                        {/* Geographic Area */}
                        {a.affectedArea && (
                          <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-red-500 shrink-0" />
                            <span>Area: {a.affectedArea}</span>
                          </span>
                        )}

                        <span className="text-xs font-mono text-slate-500 dark:text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {a.updatedAt ? `Updated: ${a.updatedAt}` : `Published: ${a.timestamp}`}
                        </span>
                      </div>

                      <h3 className="text-sm font-black text-slate-900 dark:text-white pt-0.5">
                        {a.title}
                      </h3>
                      <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                        {a.description || a.message}
                      </p>

                      {a.actionRequired && (
                        <div className="p-2 rounded-lg bg-black/10 dark:bg-black/30 text-[11px] font-semibold text-red-800 dark:text-red-200 flex items-center gap-1.5 mt-1">
                          <AlertOctagon className="w-3.5 h-3.5 text-red-500 shrink-0" />
                          <span>Action Required: {a.actionRequired}</span>
                        </div>
                      )}

                      {/* Deactivation Rationale Notice if Stood Down */}
                      {isDeactivated && (
                        <div className="p-2 rounded-lg bg-slate-200/80 dark:bg-slate-800/80 text-[11px] text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 flex items-center gap-2 mt-1">
                          <PowerOff className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>
                            <strong>Stood down by {a.deactivatedBy || 'Administrator'}:</strong> {a.deactivationReason || 'Ground hazard condition cleared.'}
                          </span>
                        </div>
                      )}

                      <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-3 pt-0.5">
                        <span>Issued by: <strong>{a.author}</strong></span>
                        {a.emergencyType && (
                          <span>Category: <strong className="capitalize">{a.emergencyType.replace('_', ' ')}</strong></span>
                        )}
                      </div>
                    </div>

                    {/* Admin Actions: Update & Deactivate Alert */}
                    {isAdmin && (
                      <div className="shrink-0 flex sm:flex-col items-center sm:items-end gap-2 pt-1 sm:pt-0">
                        <button
                          type="button"
                          onClick={() => handleOpenEditAlert(a)}
                          className="px-3 py-1.5 rounded-xl bg-blue-600/10 hover:bg-blue-600/20 text-blue-700 dark:text-blue-300 border border-blue-500/30 text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                          title="Edit bulletin severity, affected area, instructions"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Edit Alert</span>
                        </button>

                        {!isDeactivated && (
                          <button
                            type="button"
                            onClick={() => {
                              setDeactivatingAlert(a);
                              setDeactivateReason('Flood waters receded below caution line; municipal crews cleared roadway.');
                            }}
                            className="px-3 py-1.5 rounded-xl bg-red-600/10 hover:bg-red-600/20 text-red-700 dark:text-red-300 border border-red-500/30 text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                            title="Deactivate this emergency bulletin with formal rationale"
                          >
                            <PowerOff className="w-3.5 h-3.5" />
                            <span>Stand Down</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Stale Data Warning */}
                  {stale && !isDeactivated && (
                    <div className="mt-2.5 p-2 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-900 dark:text-amber-200 text-[11px] font-bold flex items-center gap-2">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span>⚠️ Potentially Stale Data: This bulletin was issued over 2 hours ago without re-verification. Check local dispatch before acting.</span>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

      </div>

      {/* 5. COMMUNITY HAZARD & ROADBLOCK DESK */}
      <div className="p-6 rounded-3xl glass-card border border-amber-500/30 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <Construction className="w-5 h-5 text-amber-500" />
              <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
                Reported Hazards & Road Obstructions Desk
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Review crowdsourced hazard reports, impassable flooded roads, and downed lines. Verified by certified volunteers & administrators.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setIsReportHazardModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-md shadow-amber-600/20 flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Submit Hazard Report</span>
            </button>

            <Link
              to="/map?category=hazards"
              className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs border border-slate-200 dark:border-slate-700 flex items-center gap-1.5"
            >
              <MapPin className="w-3.5 h-3.5 text-amber-500" />
              <span>View On Map</span>
            </Link>
          </div>
        </div>

        {/* Hazard Filter Tabs */}
        <div className="flex items-center gap-2 text-xs font-bold">
          <span className="text-slate-400 text-[11px] uppercase tracking-wider">Filter:</span>
          <button
            onClick={() => setHazardFilter('all')}
            className={`px-3 py-1 rounded-xl transition-all ${
              hazardFilter === 'all'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800'
            }`}
          >
            All Hazards ({hazardReports.length})
          </button>
          <button
            onClick={() => setHazardFilter('blocked_roads')}
            className={`px-3 py-1 rounded-xl transition-all ${
              hazardFilter === 'blocked_roads'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800'
            }`}
          >
            Road Closures ({hazardReports.filter(h => h.isRoadBlocked).length})
          </button>
          <button
            onClick={() => setHazardFilter('unverified')}
            className={`px-3 py-1 rounded-xl transition-all ${
              hazardFilter === 'unverified'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800'
            }`}
          >
            Awaiting Verification ({hazardReports.filter(h => h.verificationTier === 'unverified_report').length})
          </button>
        </div>

        {/* Hazard List */}
        <div className="space-y-3">
          {filteredHazards.map(h => {
            const stale = isStale(h.reportedAt);
            return (
              <div
                key={h.id}
                className={`p-4 rounded-2xl border transition-all ${
                  h.verificationTier === 'official_alert'
                    ? 'bg-red-500/5 border-red-500/30'
                    : h.verificationTier === 'community_verified'
                    ? 'bg-amber-500/5 border-amber-500/30'
                    : 'bg-slate-50 dark:bg-slate-900/50 border-dashed border-slate-300 dark:border-slate-700'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      {/* Distinct Verification Tier Badge */}
                      {h.verificationTier === 'official_alert' ? (
                        <span className="px-2 py-0.5 rounded-full bg-red-600 text-white text-[10px] font-black uppercase flex items-center gap-1 shadow-sm">
                          <Radio className="w-3 h-3" />
                          Official Civil Alert
                        </span>
                      ) : h.verificationTier === 'community_verified' ? (
                        <span className="px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 text-[10px] font-black uppercase flex items-center gap-1 shadow-sm">
                          <ShieldCheck className="w-3 h-3" />
                          Community Verified
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-bold uppercase flex items-center gap-1 border border-slate-300 dark:border-slate-700">
                          <HelpCircle className="w-3 h-3 text-amber-500" />
                          Unverified Community Report
                        </span>
                      )}

                      {/* Road Closure Badge */}
                      {h.isRoadBlocked && (
                        <span className="px-2 py-0.5 rounded-full bg-red-600/15 text-red-600 dark:text-red-400 font-extrabold text-[10px] border border-red-500/30 flex items-center gap-1">
                          <Construction className="w-3 h-3" />
                          ROAD IMPASSABLE
                        </span>
                      )}

                      <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-amber-500" />
                        <span>{h.locationName}</span>
                      </span>

                      <span className="text-xs text-slate-400 font-mono">
                        Reported: {h.reportedAt}
                      </span>
                    </div>

                    <h3 className="text-sm font-black text-slate-900 dark:text-white">
                      {h.title}
                    </h3>

                    <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                      {h.description}
                    </p>

                    {/* Detour Notes & Safety Warning */}
                    {h.detourNotes && (
                      <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-900 dark:text-amber-200 space-y-0.5">
                        <div className="font-bold flex items-center gap-1">
                          <span>🚧 Detour Advisory:</span>
                          <span>{h.detourNotes}</span>
                        </div>
                        <div className="text-[10px] text-amber-800 dark:text-amber-300 italic">
                          Safety Note: Nexus does not synthesize automated detour routing. Verify on ground before dispatching.
                        </div>
                      </div>
                    )}

                    <div className="text-[11px] text-slate-500 flex items-center gap-3 pt-0.5">
                      <span>Reported by: <strong>{h.reportedBy}</strong></span>
                      {h.verifiedBy && (
                        <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                          Verified by: <strong>{h.verifiedBy}</strong> ({h.verifiedAt})
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions for Volunteers & Admins */}
                  <div className="flex sm:flex-col items-center sm:items-end gap-2 shrink-0">
                    {h.verificationTier === 'unverified_report' && isPrivileged && (
                      <button
                        onClick={() => verifyHazardReport(h.id, currentUser?.fullName || 'Verified Search Lead')}
                        className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm flex items-center gap-1 cursor-pointer"
                        title="Confirm hazard is verified on ground"
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Verify on Ground</span>
                      </button>
                    )}

                    {h.status !== 'cleared' && isPrivileged && (
                      <button
                        onClick={() => clearHazardReport(h.id)}
                        className="px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center gap-1 cursor-pointer"
                        title="Mark obstruction resolved or cleared"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Mark Cleared</span>
                      </button>
                    )}

                    <Link
                      to={`/map?lat=${h.latitude}&lng=${h.longitude}`}
                      className="text-xs text-amber-600 dark:text-amber-400 font-bold hover:underline flex items-center gap-1 pt-1"
                    >
                      <span>Locate on Map</span>
                      <ChevronRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>

                {/* Stale Warning on Hazard */}
                {stale && (
                  <div className="mt-2.5 p-2 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-900 dark:text-amber-200 text-[11px] font-bold flex items-center gap-2">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span>⚠️ Potentially Stale: Reported over 2h ago without ground update. Re-confirm obstruction status.</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 6. PRIORITIZED LIFE-SAFETY RESOURCES TABLE */}
      <div className="p-6 rounded-3xl glass-card border border-slate-200/80 dark:border-slate-800/80 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <HeartPulse className="w-5 h-5 text-rose-500" />
              <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
                Prioritized Disaster Assets & Life-Safety Reserves ({emergencyResources.length})
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Hospitals, Shelters, Potable Water, Heavy Rescue Equipment, Backup Power, and Food Distribution.
            </p>
          </div>

          <Link
            to="/resources"
            className="text-xs text-teal-600 dark:text-teal-400 font-bold hover:underline"
          >
            Full Inventory System →
          </Link>
        </div>

        {/* Priority Category Filter Chips */}
        <div className="flex items-center gap-1.5 flex-wrap text-xs font-bold">
          <span className="text-slate-400 text-[11px] uppercase tracking-wider mr-1">Resource Filter:</span>
          {(['all', 'shelter', 'water', 'food', 'medical', 'rescue', 'power'] as const).map(cat => (
            <button
              key={cat}
              onClick={() => setResourceFilter(cat)}
              className={`px-2.5 py-1 rounded-xl capitalize transition-all ${
                resourceFilter === cat
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800'
              }`}
            >
              {cat === 'all' ? 'All Life Safety' : cat}
            </button>
          ))}
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
          {emergencyResources.map(res => (
            <div key={res.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 dark:text-white text-sm">
                    {res.title || res.name}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 text-[10px] font-black uppercase">
                    {res.category}
                  </span>
                </div>
                <p className="text-slate-600 dark:text-slate-300">
                  {res.description}
                </p>
                <div className="text-[11px] text-slate-400 flex items-center gap-3 pt-0.5">
                  <span>Location: <strong className="text-slate-700 dark:text-slate-300">{res.locationName || res.location}</strong></span>
                  <span>•</span>
                  <span>Available: <strong className="text-emerald-600 font-mono">{res.availableQuantity} of {res.quantity}</strong></span>
                  <span>•</span>
                  <span>Contact: <strong>{isPrivileged ? res.contactPhone : `${res.contactPhone.slice(0, 6)}••••`}</strong></span>
                  <span>•</span>
                  <span className="flex items-center gap-1 font-mono text-slate-400">
                    <Clock className="w-3 h-3" />
                    Updated: {res.updatedAt}
                  </span>
                </div>
              </div>

              <div className="shrink-0 flex items-center gap-2">
                <Link
                  to={`/map?assetId=${res.id}&lat=${res.latitude}&lng=${res.longitude}`}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center gap-1"
                >
                  <MapPin className="w-3 h-3 text-rose-500" />
                  <span>Map Pin</span>
                </Link>

                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20">
                  {res.distance || '0.4 km'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 6B. PRIORITIZED DISASTER VOLUNTEER SQUAD */}
      <div className="p-6 rounded-3xl glass-card border border-teal-500/30 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-teal-500" />
              <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
                Prioritized Disaster Volunteers & Medical Responders ({prioritizedVolunteers.length})
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Rapid-dispatch certified responders, first-aid trained personnel, search leads, and emergency equipment operators.
            </p>
          </div>

          <Link
            to="/volunteers"
            className="text-xs text-teal-600 dark:text-teal-400 font-bold hover:underline"
          >
            Volunteer Corps Directory →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {prioritizedVolunteers.map(vol => (
            <div
              key={vol.id}
              className="p-4 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 hover:border-teal-500/40 transition-all flex flex-col justify-between gap-3 text-xs"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2.5">
                  <img
                    src={vol.avatar}
                    alt={vol.name}
                    className="w-10 h-10 rounded-xl object-cover ring-2 ring-teal-500/30"
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-slate-900 dark:text-white truncate">
                        {vol.name}
                      </span>
                      {vol.verificationStatus === 'verified' && (
                        <span title="Verified Responder">
                          <ShieldCheck className="w-3.5 h-3.5 text-teal-500 shrink-0" />
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-teal-600 dark:text-teal-400 font-semibold truncate">
                      {vol.role}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 flex-wrap">
                  {vol.emergencyCertified && (
                    <span className="px-2 py-0.5 rounded-full bg-red-500/10 text-red-600 dark:text-red-400 text-[9px] font-black uppercase">
                      Emergency Certified
                    </span>
                  )}
                  {vol.isFirstAidCertified && (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[9px] font-bold uppercase">
                      First Aid
                    </span>
                  )}
                  <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[9px] font-mono">
                    {vol.neighborhoodZone}
                  </span>
                </div>

                <div className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                  Skills: {vol.skills.join(', ')}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-[10px] text-slate-400 font-mono">
                  {isPrivileged ? vol.phone : `${vol.phone.slice(0, 7)}••••`}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-teal-500/10 text-teal-600 dark:text-teal-400">
                  {vol.availability || 'Available'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 6C. PRIORITIZED URGENT CITIZEN REQUESTS */}
      <div className="p-6 rounded-3xl glass-card border border-amber-500/30 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <LifeBuoy className="w-5 h-5 text-amber-500" />
              <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
                Urgent Citizen Requests & Mutual Aid Triage ({prioritizedRequests.length})
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              High and critical-priority citizen distress tickets requiring urgent food, water, medical aid, or equipment.
            </p>
          </div>

          <Link
            to="/requests"
            className="text-xs text-amber-600 dark:text-amber-400 font-bold hover:underline"
          >
            Complete Requests Desk →
          </Link>
        </div>

        {prioritizedRequests.length === 0 ? (
          <div className="p-8 text-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 text-xs text-slate-400">
            No critical or high-urgency citizen requests currently unaddressed.
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {prioritizedRequests.map(req => (
              <div key={req.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                      req.urgency === 'critical' ? 'bg-red-600 text-white animate-pulse' : 'bg-amber-600 text-white'
                    }`}>
                      {req.urgency} Urgency
                    </span>
                    <span className="font-bold text-slate-900 dark:text-white text-sm">
                      {req.title}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-teal-500/10 text-teal-600 dark:text-teal-400 font-bold uppercase">
                      {req.category.replace('_', ' ')}
                    </span>
                  </div>

                  <p className="text-slate-600 dark:text-slate-300">
                    {req.details || req.description}
                  </p>

                  <div className="text-[11px] text-slate-400 flex items-center gap-3 pt-0.5">
                    <span>Requester: <strong className="text-slate-700 dark:text-slate-300">{req.requesterName}</strong></span>
                    <span>•</span>
                    <span>Location: <strong className="text-slate-700 dark:text-slate-300">{req.location}</strong></span>
                    <span>•</span>
                    <span className="font-mono text-slate-400">{req.timestamp}</span>
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-2">
                  <Link
                    to="/requests"
                    className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-sm flex items-center gap-1"
                  >
                    <span>View / Dispatch Aid</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 7. IMMUTABLE EMERGENCY AUDIT HISTORY LOG */}
      <div className="p-6 rounded-3xl glass-card border border-slate-200/80 dark:border-slate-800/80 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-blue-500" />
            <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
              Emergency Command Audit History
            </h2>
          </div>
          <span className="text-xs font-mono text-slate-400">
            {emergencyAuditLogs.length} Logged Entries
          </span>
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400">
          Tamper-evident record of all disaster protocol activations, deactivations, official alert broadcasts, and hazard verifications.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                <th className="py-2.5 px-3">Timestamp</th>
                <th className="py-2.5 px-3">Actor / Authority</th>
                <th className="py-2.5 px-3">Action</th>
                <th className="py-2.5 px-3">Affected Area</th>
                <th className="py-2.5 px-3">Rationale & Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
              {emergencyAuditLogs.map(log => (
                <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="py-3 px-3 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                    {log.timestamp}
                  </td>
                  <td className="py-3 px-3">
                    <div className="font-bold text-slate-900 dark:text-white">{log.actorName}</div>
                    <div className="text-[10px] text-slate-400">{log.actorRole}</div>
                  </td>
                  <td className="py-3 px-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      log.action.includes('activated') 
                        ? 'bg-red-500/20 text-red-700 dark:text-red-300' 
                        : log.action.includes('deactivated')
                        ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300'
                        : 'bg-blue-500/20 text-blue-700 dark:text-blue-300'
                    }`}>
                      {log.action.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-slate-700 dark:text-slate-300">
                    {log.affectedArea}
                  </td>
                  <td className="py-3 px-3 text-slate-600 dark:text-slate-400 max-w-xs leading-relaxed">
                    {log.details}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 8. FOOTNOTE / TRANSPARENCY NOTICE */}
      <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-teal-500 shrink-0" />
          <span>
            Nexus – CommunityOS Emergency Mesh Protocol v2.4. Operating in complementary coordination with municipal civil defense.
          </span>
        </div>
      </div>

      {/* EDIT ALERT MODAL (Authorized Administrators) */}
      {editingAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-blue-500/40 rounded-3xl shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 bg-blue-600/10 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center">
                  <Edit3 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Update Emergency Alert Bulletin
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Modify active civil bulletin parameters, affected area, and instructions.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingAlert(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveAlertEdit} className="p-5 space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Emergency Type
                  </label>
                  <select
                    value={editEmergencyType}
                    onChange={e => setEditEmergencyType(e.target.value as EmergencyType)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="flood">Flood</option>
                    <option value="fire">Wildfire / Fire</option>
                    <option value="severe_weather">Severe Weather</option>
                    <option value="infrastructure_failure">Infrastructure Failure</option>
                    <option value="other">Other Emergency</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Severity Tier
                  </label>
                  <select
                    value={editSeverity}
                    onChange={e => setEditSeverity(e.target.value as AlertSeverity)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="critical">Critical</option>
                    <option value="severe">Severe</option>
                    <option value="warning">Warning</option>
                    <option value="info">Advisory / Info</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Affected Geographic Area *
                </label>
                <input
                  type="text"
                  required
                  value={editAffectedArea}
                  onChange={e => setEditAffectedArea(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Headline / Title *
                </label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={e => setEditTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Detailed Emergency Description *
                </label>
                <textarea
                  required
                  rows={3}
                  value={editMessage}
                  onChange={e => setEditMessage(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white resize-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Required Public Action / Protocol
                </label>
                <input
                  type="text"
                  value={editActionRequired}
                  onChange={e => setEditActionRequired(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingAlert(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-600/30 cursor-pointer"
                >
                  Save Changes & Log Audit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DEACTIVATE ALERT MODAL (Authorized Administrators) */}
      {deactivatingAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-red-500/40 rounded-3xl shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 bg-red-600/10 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-red-600 text-white flex items-center justify-center">
                  <PowerOff className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Stand Down Alert Bulletin
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Administrator Confirmation for Deactivating Official Alert
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setDeactivatingAlert(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleConfirmDeactivateAlert} className="p-5 space-y-4">
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-300 text-xs space-y-1">
                <div className="font-bold flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                  <span>Standing down alert:</span>
                </div>
                <div className="font-semibold text-slate-900 dark:text-white">
                  "{deactivatingAlert.title}"
                </div>
                <div className="text-[11px] text-slate-600 dark:text-slate-400">
                  Area: {deactivatingAlert.affectedArea || currentCommunity.name}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Deactivation Reason & Field Verification *
                </label>
                <textarea
                  required
                  rows={3}
                  value={deactivateReason}
                  onChange={e => setDeactivateReason(e.target.value)}
                  placeholder="State verified ground conditions or official clearance..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setDeactivatingAlert(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!deactivateReason.trim()}
                  className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-bold text-xs shadow-md shadow-red-600/30 flex items-center gap-1.5 cursor-pointer"
                >
                  <PowerOff className="w-3.5 h-3.5" />
                  <span>Confirm Deactivation</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
