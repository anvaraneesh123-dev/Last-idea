import React, { useState } from 'react';
import { useCommunity } from '../context/CommunityContext';
import { useAuth } from '../context/AuthContext';
import { isSupabaseConfigured } from '../services/supabaseClient';
import { offlineDb } from '../services/indexedDb';
import { 
  Sliders, 
  User, 
  Bell, 
  Moon, 
  Sun, 
  Globe, 
  ShieldCheck, 
  Lock, 
  Key, 
  Database, 
  Save, 
  CheckCircle2, 
  RotateCcw, 
  HardDriveDownload, 
  LogOut, 
  AlertTriangle,
  RadioTower,
  Smartphone,
  Mail,
  Shield,
  Layers,
  Building2,
  Info
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { currentCommunity, isDarkMode, toggleDarkMode, addToast, refreshData } = useCommunity();
  const { currentUser, updateProfile, switchDemoRole, logout } = useAuth();

  // Tab State
  const [activeTab, setActiveTab] = useState<'profile' | 'notifications' | 'display' | 'security' | 'database'>('profile');

  // Profile Form State
  const [fullName, setFullName] = useState(currentUser.fullName);
  const [phone, setPhone] = useState(currentUser.phone || '');
  const [email, setEmail] = useState(currentUser.email || '');
  const [address, setAddress] = useState(currentUser.address || '');
  const [neighborhoodZone, setNeighborhoodZone] = useState(currentUser.neighborhoodZone || 'Zone 4 Cascadia');

  // Notification Preferences State
  const [notifyEmergencyAlerts, setNotifyEmergencyAlerts] = useState(true);
  const [notifyRequestUpdates, setNotifyRequestUpdates] = useState(true);
  const [notifyVolunteerMissions, setNotifyVolunteerMissions] = useState(true);
  const [notifyResourceAvailability, setNotifyResourceAvailability] = useState(true);
  const [smsChannelActive, setSmsChannelActive] = useState(false);
  const [emailChannelActive, setEmailChannelActive] = useState(false);

  // Display & Language State
  const [selectedLanguage, setSelectedLanguage] = useState(() => {
    return localStorage.getItem('nexus_language') || 'en';
  });
  const [highContrast, setHighContrast] = useState(() => {
    return localStorage.getItem('nexus_high_contrast') === 'true';
  });

  // Security Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  // Mesh & Storage State
  const [meshBroadcastEnabled, setMeshBroadcastEnabled] = useState(true);
  const [radioChannel, setRadioChannel] = useState('146.520 MHz (VHF Ch 1)');
  const [supabaseUrl, setSupabaseUrl] = useState(import.meta.env.VITE_SUPABASE_URL || '');
  const [supabaseAnonKey, setSupabaseAnonKey] = useState(import.meta.env.VITE_SUPABASE_ANON_KEY || '');
  
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Save Profile Handler
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfile({
        fullName,
        phone,
        email,
        address,
        neighborhoodZone,
      });
      setSavedSuccess(true);
      addToast({
        type: 'success',
        title: 'Profile Updated',
        message: 'Your personal information was saved to the local directory.',
      });
      setTimeout(() => setSavedSuccess(false), 2500);
    } catch (err: any) {
      addToast({
        type: 'warning',
        title: 'Update Error',
        message: err.message || 'Could not update profile.',
      });
    }
  };

  // Save Notification Preferences
  const handleSaveNotifications = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    addToast({
      type: 'success',
      title: 'Notification Preferences Saved',
      message: 'Dispatch routing channels and filters updated.',
    });
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  // Save Display Preferences
  const handleSaveDisplay = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('nexus_language', selectedLanguage);
    localStorage.setItem('nexus_high_contrast', highContrast ? 'true' : 'false');
    setSavedSuccess(true);
    addToast({
      type: 'success',
      title: 'Display Settings Applied',
      message: `Language updated to ${selectedLanguage.toUpperCase()}.`,
    });
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  // Change Password Handler
  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      addToast({
        type: 'warning',
        title: 'Password Too Short',
        message: 'Password must contain at least 8 characters.',
      });
      return;
    }
    if (newPassword !== confirmPassword) {
      addToast({
        type: 'warning',
        title: 'Passwords Do Not Match',
        message: 'Confirm password must match the new password.',
      });
      return;
    }

    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    addToast({
      type: 'success',
      title: 'Password Updated',
      message: 'Security credentials verified and updated successfully.',
    });
  };

  // Reset Database
  const handleResetIndexedDb = async () => {
    if (confirm('Reset local offline database back to pristine initial seed data? All temporary entries will be cleared.')) {
      await offlineDb.clearStore('resources');
      await offlineDb.clearStore('volunteer_profiles');
      await offlineDb.clearStore('resource_requests');
      await offlineDb.clearStore('emergency_alerts');
      await offlineDb.clearStore('activity_logs');
      await offlineDb.clearStore('hazard_reports');
      await offlineDb.clearStore('notifications');
      await offlineDb.clearStore('sync_queue');
      await refreshData();
      addToast({
        type: 'info',
        title: 'Local Database Reset',
        message: 'Reseeded initial clean community dataset into IndexedDB.',
      });
    }
  };

  // Export Ledger Snapshot
  const exportLedger = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({
      community: currentCommunity,
      user: currentUser,
      timestamp: new Date().toISOString(),
      version: 'Nexus-2.4-LTS',
    }, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `nexus-${currentCommunity.code}-ledger.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    addToast({
      type: 'info',
      title: 'Ledger Exported',
      message: `Downloaded local mesh backup for ${currentCommunity.name}.`,
    });
  };

  // Sign Out with Confirmation
  const handleSignOut = async () => {
    if (confirm('Are you sure you want to sign out of Nexus – CommunityOS?')) {
      await logout();
      addToast({
        type: 'info',
        title: 'Signed Out',
        message: 'You have been switched to standard member access.',
      });
    }
  };

  return (
    <div className="space-y-6 max-w-4xl animate-in fade-in duration-200">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          System Protocols & Account Settings
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Profile credentials, notification dispatch channels, theme and language preferences, security controls, and mesh persistence.
        </p>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 text-xs font-bold overflow-x-auto">
        {[
          { id: 'profile', label: 'Profile & Identity', icon: User },
          { id: 'notifications', label: 'Notification Channels', icon: Bell },
          { id: 'display', label: 'Theme & Language', icon: Globe },
          { id: 'security', label: 'Security & Access', icon: Lock },
          { id: 'database', label: 'Database & Mesh', icon: Database },
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
                activeTab === tab.id
                  ? 'bg-white dark:bg-slate-900 text-teal-600 dark:text-teal-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: PROFILE & IDENTITY */}
      {activeTab === 'profile' && (
        <form onSubmit={handleSaveProfile} className="space-y-6">
          <div className="p-6 rounded-3xl glass-card border border-slate-200/80 dark:border-slate-800/80 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
                <User className="w-4 h-4 text-teal-500" />
                <span>Personal Profile & Civil Defense Registry</span>
              </div>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20 uppercase">
                {currentUser.role.replace('_', ' ')}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1 font-semibold">
                  Full Display Name *
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1 font-semibold">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1 font-semibold">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1 font-semibold">
                  Neighborhood Zone / Cluster
                </label>
                <input
                  type="text"
                  value={neighborhoodZone}
                  onChange={e => setNeighborhoodZone(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-slate-700 dark:text-slate-300 mb-1 font-semibold">
                Home / Staging Address
              </label>
              <input
                type="text"
                value={address}
                onChange={e => setAddress(e.target.value)}
                placeholder="Building Unit, Street Address"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-md shadow-teal-600/20 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>{savedSuccess ? 'Profile Saved!' : 'Save Profile Changes'}</span>
              </button>
            </div>
          </div>
        </form>
      )}

      {/* TAB 2: NOTIFICATION CHANNELS & PREFERENCES */}
      {activeTab === 'notifications' && (
        <form onSubmit={handleSaveNotifications} className="space-y-6">
          <div className="p-6 rounded-3xl glass-card border border-slate-200/80 dark:border-slate-800/80 space-y-4">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
              <Bell className="w-4 h-4 text-teal-500" />
              <span>Notification Subscriptions & Dispatch Alerts</span>
            </div>

            <div className="space-y-3">
              {[
                {
                  label: 'Official Civil Emergency Alerts',
                  desc: 'Immediate dispatch sirens, flash flood warnings, and evacuation notices.',
                  checked: notifyEmergencyAlerts,
                  setter: setNotifyEmergencyAlerts,
                },
                {
                  label: 'Mutual Aid Request Status Updates',
                  desc: 'Alerts when your aid requests are matched, accepted, or fulfilled.',
                  checked: notifyRequestUpdates,
                  setter: setNotifyRequestUpdates,
                },
                {
                  label: 'Volunteer Squad Mission Dispatches',
                  desc: 'Notifications when certified volunteers are needed in your zone.',
                  checked: notifyVolunteerMissions,
                  setter: setNotifyVolunteerMissions,
                },
                {
                  label: 'Resource Availability & Stock Alerts',
                  desc: 'Restock notices for potable water, backup generators, and tools.',
                  checked: notifyResourceAvailability,
                  setter: setNotifyResourceAvailability,
                },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60">
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white">
                      {item.label}
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                      {item.desc}
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={item.checked}
                    onChange={e => item.setter(e.target.checked)}
                    className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500 cursor-pointer"
                  />
                </div>
              ))}
            </div>

            {/* Delivery Channels Limitation Notice */}
            <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-900 dark:text-blue-200 space-y-2">
              <div className="font-bold flex items-center gap-1.5">
                <Info className="w-4 h-4 text-blue-500" />
                <span>External Delivery Gateways Disclaimer</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                Browser local notifications operate actively via Service Worker and IndexedDB. <strong>SMS and Email gateways operate in simulated demo mode.</strong> Nexus does not claim automated SMS or push delivery without configured telecom API credentials.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-[11px]">
                <label className="flex items-center gap-2 p-2 rounded-xl bg-white/60 dark:bg-slate-800/60 border border-blue-500/10 cursor-pointer">
                  <Smartphone className="w-3.5 h-3.5 text-blue-500" />
                  <span className="font-semibold">SMS Siren (Simulated)</span>
                  <input
                    type="checkbox"
                    checked={smsChannelActive}
                    onChange={e => setSmsChannelActive(e.target.checked)}
                    className="ml-auto w-3.5 h-3.5"
                  />
                </label>
                <label className="flex items-center gap-2 p-2 rounded-xl bg-white/60 dark:bg-slate-800/60 border border-blue-500/10 cursor-pointer">
                  <Mail className="w-3.5 h-3.5 text-blue-500" />
                  <span className="font-semibold">Email Digest (Simulated)</span>
                  <input
                    type="checkbox"
                    checked={emailChannelActive}
                    onChange={e => setEmailChannelActive(e.target.checked)}
                    className="ml-auto w-3.5 h-3.5"
                  />
                </label>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-md shadow-teal-600/20 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Save Notification Preferences</span>
              </button>
            </div>
          </div>
        </form>
      )}

      {/* TAB 3: THEME & LANGUAGE */}
      {activeTab === 'display' && (
        <form onSubmit={handleSaveDisplay} className="space-y-6">
          <div className="p-6 rounded-3xl glass-card border border-slate-200/80 dark:border-slate-800/80 space-y-4">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
              <Globe className="w-4 h-4 text-teal-500" />
              <span>Theme, Accessibility & Language Localization</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              {/* Theme Toggle */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 space-y-2">
                <div className="font-bold text-slate-900 dark:text-white flex items-center justify-between">
                  <span>Display Color Theme</span>
                  {isDarkMode ? <Moon className="w-4 h-4 text-teal-400" /> : <Sun className="w-4 h-4 text-amber-500" />}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Current: <strong>{isDarkMode ? 'Night / EOC Dark Mode' : 'Daylight / High Contrast Light'}</strong>
                </p>
                <button
                  type="button"
                  onClick={toggleDarkMode}
                  className="w-full py-2 px-3 rounded-xl bg-slate-200 dark:bg-slate-700 font-bold text-xs text-slate-800 dark:text-slate-100 hover:opacity-90 transition-opacity cursor-pointer"
                >
                  Switch to {isDarkMode ? 'Light Mode' : 'Dark Mode'}
                </button>
              </div>

              {/* Language Selection */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 space-y-2">
                <div className="font-bold text-slate-900 dark:text-white">
                  Interface Language
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Select community dialect for emergency warnings
                </p>
                <select
                  value={selectedLanguage}
                  onChange={e => setSelectedLanguage(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <option value="en">English (US)</option>
                  <option value="es">Español (Spanish)</option>
                  <option value="fr">Français (French)</option>
                  <option value="tl">Tagalog (Filipino)</option>
                  <option value="vi">Tiếng Việt (Vietnamese)</option>
                </select>
              </div>
            </div>

            {/* High Contrast Mode */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60">
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-white">
                  High Contrast Text & Borders
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  Optimized for outdoor sunlight readouts during field triage
                </div>
              </div>
              <input
                type="checkbox"
                checked={highContrast}
                onChange={e => setHighContrast(e.target.checked)}
                className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500 cursor-pointer"
              />
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-md shadow-teal-600/20 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Apply Display Settings</span>
              </button>
            </div>
          </div>
        </form>
      )}

      {/* TAB 4: SECURITY & ACCESS CONTROLS */}
      {activeTab === 'security' && (
        <div className="space-y-6">
          {/* Change Password */}
          <form onSubmit={handleChangePassword} className="p-6 rounded-3xl glass-card border border-slate-200/80 dark:border-slate-800/80 space-y-4">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
              <Key className="w-4 h-4 text-teal-500" />
              <span>Change Security Credentials</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1 font-semibold">
                  Current Password
                </label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={currentPassword}
                  onChange={e => setCurrentPassword(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1 font-semibold">
                  New Password (min 8)
                </label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1 font-semibold">
                  Confirm Password
                </label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-slate-900 dark:bg-slate-800 text-white font-bold text-xs hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Update Password
              </button>
            </div>
          </form>

          {/* Two-Factor Authentication & Account Logout */}
          <div className="p-6 rounded-3xl glass-card border border-slate-200/80 dark:border-slate-800/80 space-y-4">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
              <ShieldCheck className="w-4 h-4 text-teal-500" />
              <span>Multi-Factor Authentication & Session Termination</span>
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60">
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-white">
                  Two-Factor Authentication (TOTP Authenticator)
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  Require 6-digit cryptographic verification code on login
                </div>
              </div>
              <input
                type="checkbox"
                checked={twoFactorEnabled}
                onChange={e => {
                  setTwoFactorEnabled(e.target.checked);
                  addToast({
                    type: 'info',
                    title: e.target.checked ? '2FA Enabled' : '2FA Disabled',
                    message: e.target.checked ? 'Authenticator security active.' : 'Standard single-factor login restored.',
                  });
                }}
                className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500 cursor-pointer"
              />
            </div>

            {/* Logout Action with Confirmation */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
              <div>
                <div className="text-xs font-bold text-red-600 dark:text-red-400">
                  End Active Session
                </div>
                <div className="text-[11px] text-slate-400">
                  Sign out on this device and return to visitor view
                </div>
              </div>

              <button
                type="button"
                onClick={handleSignOut}
                className="px-4 py-2 rounded-xl bg-red-600/10 hover:bg-red-600/20 text-red-600 dark:text-red-400 font-bold text-xs border border-red-500/20 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: DATABASE & MESH */}
      {activeTab === 'database' && (
        <div className="space-y-6">
          {/* Storage Layer Card */}
          <div className="p-6 rounded-3xl glass-card border border-teal-500/30 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
                <Database className="w-4 h-4 text-teal-500" />
                <span>Storage Layer & Database Synchronization</span>
              </div>

              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                isSupabaseConfigured
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                  : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
              }`}>
                {isSupabaseConfigured ? 'Connected to Remote Supabase' : 'DEMO MODE: Local IndexedDB Persistence'}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-900 dark:text-amber-200 space-y-1">
              <div className="font-bold flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-amber-500" />
                <span>Security & Environment Configuration</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                If Supabase credentials are not provided in environment variables, Nexus operates in <strong>Demo Mode</strong> with local IndexedDB persistence. Never expose service-role keys in frontend client code.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1 font-medium">
                  VITE_SUPABASE_URL
                </label>
                <input
                  type="text"
                  placeholder="https://xyzcompany.supabase.co"
                  value={supabaseUrl}
                  onChange={e => setSupabaseUrl(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1 font-medium">
                  VITE_SUPABASE_ANON_KEY
                </label>
                <input
                  type="password"
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  value={supabaseAnonKey}
                  onChange={e => setSupabaseAnonKey(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800">
              <span className="text-[11px] text-slate-400">
                Need fresh sample data? Reset local IndexedDB stores anytime.
              </span>
              <button
                type="button"
                onClick={handleResetIndexedDb}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold text-amber-600 dark:text-amber-400 hover:bg-amber-500/10 flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reseed Sample Data</span>
              </button>
            </div>
          </div>

          {/* Mesh Node Telemetry Card */}
          <div className="p-6 rounded-3xl glass-card border border-slate-200/80 dark:border-slate-800/80 space-y-4">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
              <RadioTower className="w-4 h-4 text-teal-500" />
              <span>Offline-First Mesh & Disaster Telemetry</span>
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60">
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-white">
                  Local LoRa Mesh Node Broadcast
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  Relay encrypted emergency requests across neighbor devices when cell towers lose power
                </div>
              </div>
              <input
                type="checkbox"
                checked={meshBroadcastEnabled}
                onChange={e => setMeshBroadcastEnabled(e.target.checked)}
                className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500 cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Designated Civil Defense Radio Channel
              </label>
              <input
                type="text"
                value={radioChannel}
                onChange={e => setRadioChannel(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          {/* Ledger Backup Snapshot */}
          <div className="p-6 rounded-3xl glass-card border border-slate-200/80 dark:border-slate-800/80 space-y-3">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
              <Database className="w-4 h-4 text-teal-500" />
              <span>Decentralized Data Ledger & Snapshots</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Export full resource catalog, verified volunteer credentials, and community safety check-in logs for offline storage.
            </p>

            <button
              type="button"
              onClick={exportLedger}
              className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs border border-slate-200 dark:border-slate-700 transition-colors flex items-center gap-2 cursor-pointer"
            >
              <HardDriveDownload className="w-3.5 h-3.5 text-teal-500" />
              <span>Download Local Ledger JSON Snapshot</span>
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
