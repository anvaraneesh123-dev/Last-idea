import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Community, 
  ResourceItem, 
  VolunteerProfile, 
  VolunteerMission, 
  CommunityAlert, 
  SosSignal, 
  MapPoint, 
  CommunityPoll, 
  CommunityRequest, 
  ActivityUpdate,
  UserRole,
  RequestStatus,
  ResourceCategory,
  HazardReport,
  EmergencyAuditEntry,
  SyncNetworkState,
  AppNotification
} from '../types';
import { 
  INITIAL_COMMUNITIES, 
  INITIAL_MISSIONS, 
  INITIAL_SOS_SIGNALS, 
  INITIAL_MAP_POINTS, 
  INITIAL_POLLS 
} from '../data/mockData';
import { dataService } from '../services/dataService';
import { isSupabaseConfigured } from '../services/supabaseClient';
import { syncService } from '../services/syncService';
import { offlineDb } from '../services/indexedDb';
import { crossDeviceSync } from '../services/crossDeviceSync';
import { useAuth } from './AuthContext';

export interface DeviceGpsState {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
  isAcquired: boolean;
  error?: string;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'warning' | 'emergency' | 'info';
  title: string;
  message: string;
}

export interface SafeCheckIn {
  id: string;
  name: string;
  timestamp: string;
  location: string;
  status: 'Safe' | 'Sheltered' | 'Needs Assistance Soon';
  note?: string;
}

export const INITIAL_HAZARD_REPORTS: HazardReport[] = [
  {
    id: 'hz-1',
    title: 'Downed High-Voltage Feeder Line across Pine St',
    type: 'downed_power_line',
    severity: 'critical',
    status: 'active',
    verificationTier: 'official_alert',
    latitude: 45.5180,
    longitude: -122.6770,
    locationName: 'Pine St at 4th Ave Crossing',
    description: 'High voltage distribution line severed by falling pine tree. Sparking observed on wet asphalt. Power company crew en route.',
    reportedBy: 'City Dispatch #902',
    reportedAt: '45 mins ago',
    verifiedBy: 'Chief Fire Marshal',
    verifiedAt: '40 mins ago',
    isRoadBlocked: true,
    detourNotes: 'Impassable. Use North Quad Boulevard bypass.',
  },
  {
    id: 'hz-2',
    title: 'South Creek Culvert Overflow & Flash Inundation',
    type: 'flood',
    severity: 'severe',
    status: 'active',
    verificationTier: 'community_verified',
    latitude: 45.5130,
    longitude: -122.6810,
    locationName: 'South Creek Culvert Bridge',
    description: 'Sluice gate debris jam causing 2.5ft flood waters across low bridge. Impassable for passenger vehicles.',
    reportedBy: 'Tyler Rodriguez',
    reportedAt: '1 hour ago',
    verifiedBy: 'Tyler Rodriguez (Search Lead)',
    verifiedAt: '55 mins ago',
    isRoadBlocked: true,
    detourNotes: 'Bridge closed. Divert south via Riverfront Ramp.',
  },
  {
    id: 'hz-3',
    title: 'Large Fallen Oak Tree Blocking Residential Access',
    type: 'blocked_road',
    severity: 'warning',
    status: 'investigating',
    verificationTier: 'unverified_report',
    latitude: 45.5195,
    longitude: -122.6730,
    locationName: '110 West Pine Terrace',
    description: 'Large limb down across both driveway and residential road. Pedestrians can navigate edge, vehicles blocked.',
    reportedBy: 'David K. O\'Connor',
    reportedAt: '15 mins ago',
    isRoadBlocked: true,
    detourNotes: 'Pedestrian passage only. Awaiting volunteer chainsaw team.',
  },
];

export const INITIAL_EMERGENCY_AUDIT_LOGS: EmergencyAuditEntry[] = [
  {
    id: 'aud-1',
    timestamp: '2 hours ago',
    actorName: 'Sarah Jenkins',
    actorRole: 'Administrator',
    action: 'activated_emergency',
    affectedArea: 'Cascadia Sector 4',
    details: 'Activated Disaster Emergency Protocol due to Flash Flood Watch and Creek Basin Surge warning.',
    newState: 'DISASTER_EMERGENCY_ACTIVE',
  },
  {
    id: 'aud-2',
    timestamp: '1 hour ago',
    actorName: 'Civil Defense Dispatch',
    actorRole: 'Administrator',
    action: 'created_alert',
    affectedArea: 'South Pavilion & Creek Culverts',
    details: 'Broadcasted Critical Siren for Flash Flood Watch & Creek Surge Advisory.',
  },
  {
    id: 'aud-3',
    timestamp: '50 mins ago',
    actorName: 'Tyler Rodriguez',
    actorRole: 'Volunteer Search Lead',
    action: 'verified_hazard',
    affectedArea: 'South Creek Culvert',
    details: 'Verified road blockage on ground and posted detour protocol to community map.',
  },
];

interface CommunityContextType {
  // Communities
  communities: Community[];
  currentCommunity: Community;
  selectCommunity: (id: string) => void;

  // Emergency Mode & Deactivation Confirmation
  isEmergencyMode: boolean;
  toggleEmergencyMode: (explicitState?: boolean) => void;
  confirmDeactivateEmergency: (reason: string, actorName?: string, actorRole?: string) => Promise<void>;
  isDeactivateModalOpen: boolean;
  setIsDeactivateModalOpen: (open: boolean) => void;
  emergencyCause: string;
  setEmergencyCause: (cause: string) => void;

  // Dark Mode
  isDarkMode: boolean;
  toggleDarkMode: () => void;

  // Resources
  resources: ResourceItem[];
  isLoadingResources: boolean;
  addResource: (item: Omit<ResourceItem, 'id' | 'createdAt' | 'updatedAt'>) => Promise<ResourceItem>;
  updateResource: (id: string, updates: Partial<ResourceItem>) => Promise<ResourceItem>;
  deactivateResource: (id: string) => Promise<ResourceItem>;
  deleteResource: (id: string) => Promise<void>;
  borrowResource: (id: string) => Promise<void>;
  returnResource: (id: string) => Promise<void>;

  // Volunteers
  volunteers: VolunteerProfile[];
  isLoadingVolunteers: boolean;
  registerVolunteer: (volunteer: Omit<VolunteerProfile, 'id' | 'createdAt' | 'status'> & { id?: string }) => Promise<VolunteerProfile>;
  updateVolunteerProfile: (id: string, updates: Partial<VolunteerProfile>) => Promise<VolunteerProfile>;
  verifyVolunteer: (id: string, status: 'verified' | 'rejected', verifierName?: string) => Promise<VolunteerProfile>;
  missions: VolunteerMission[];
  joinMission: (missionId: string, volunteerName?: string) => void;
  createMission: (mission: Omit<VolunteerMission, 'id' | 'volunteersEnrolled'>) => void;

  // Real Device GPS
  deviceGps: DeviceGpsState | null;
  detectDeviceGps: () => Promise<DeviceGpsState | null>;

  // Alerts
  alerts: CommunityAlert[];
  addAlert: (alert: Omit<CommunityAlert, 'id' | 'timestamp' | 'verified'>) => Promise<CommunityAlert>;
  updateAlert: (id: string, updates: Partial<CommunityAlert>, actorName?: string, actorRole?: string) => Promise<CommunityAlert>;
  deactivateAlert: (id: string, reason: string, actorName?: string, actorRole?: string) => Promise<CommunityAlert>;

  // Hazard Reports & Roadblocks
  hazardReports: HazardReport[];
  addHazardReport: (report: Omit<HazardReport, 'id' | 'reportedAt'>) => Promise<HazardReport>;
  verifyHazardReport: (id: string, verifierName?: string) => Promise<void>;
  clearHazardReport: (id: string) => Promise<void>;

  // Emergency Audit Log
  emergencyAuditLogs: EmergencyAuditEntry[];
  addEmergencyAuditEntry: (entry: Omit<EmergencyAuditEntry, 'id' | 'timestamp'>) => Promise<EmergencyAuditEntry>;

  // SOS & Emergency Safety
  sosSignals: SosSignal[];
  createSosSignal: (signal: Omit<SosSignal, 'id' | 'timestamp' | 'status'>) => void;
  resolveSosSignal: (id: string) => void;
  safeCheckIns: SafeCheckIn[];
  markMyselfSafe: (name: string, location: string, status: SafeCheckIn['status'], note?: string) => void;

  // Map & GIS
  mapPoints: MapPoint[];

  // Civic Polls
  polls: CommunityPoll[];
  votePoll: (pollId: string, optionId: string) => void;

  // Citizen Requests & Aid Queue
  requests: CommunityRequest[];
  isLoadingRequests: boolean;
  addRequest: (req: Omit<CommunityRequest, 'id' | 'timestamp' | 'status'>) => Promise<CommunityRequest>;
  updateRequestStatus: (
    id: string, 
    status: RequestStatus, 
    responderName?: string, 
    matchedResourceId?: string, 
    notes?: string
  ) => Promise<CommunityRequest>;

  // Recent Activity Feed
  activities: ActivityUpdate[];

  // Real Computed Metric Counts
  metrics: {
    activeVolunteers: number;
    availableResources: number;
    openRequests: number;
    fulfilledRequests: number;
    activeAlerts: number;
    activeSos: number;
    activeHazards: number;
  };

  // Search & Global Navigation
  searchQuery: string;
  setSearchQuery: (query: string) => void;

  // Toasts
  toasts: ToastMessage[];
  addToast: (toast: Omit<ToastMessage, 'id'>) => void;
  removeToast: (id: string) => void;

  // Offline Sync State & Center
  networkState: SyncNetworkState;
  isOffline: boolean;
  lastSyncedAt: string;
  isSimulatedOffline: boolean;
  toggleSimulatedOffline: () => void;
  syncOfflineQueue: () => Promise<{ processed: number; succeeded: number; failed: number }>;
  isSyncCenterOpen: boolean;
  setIsSyncCenterOpen: (open: boolean) => void;
  isReportHazardModalOpen: boolean;
  setIsReportHazardModalOpen: (open: boolean) => void;

  // User Notifications System (Isolated & Deduplicated)
  notifications: AppNotification[];
  unreadNotificationsCount: number;
  fetchNotifications: () => Promise<void>;
  markNotificationAsRead: (id: string) => Promise<void>;
  markAllNotificationsAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  createNotification: (notif: Omit<AppNotification, 'id' | 'timestamp'> & { id?: string; timestamp?: string }) => Promise<AppNotification>;

  // Storage info
  isDemoMode: boolean;
  refreshData: () => Promise<void>;
  resetDemoData: () => Promise<void>;
}

const CommunityContext = createContext<CommunityContextType | undefined>(undefined);

export const CommunityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [communities] = useState<Community[]>(INITIAL_COMMUNITIES);
  const [currentCommunityId, setCurrentCommunityId] = useState<string>(() => {
    return localStorage.getItem('nexus_current_community') || 'comm-1';
  });

  const [isEmergencyMode, setIsEmergencyMode] = useState<boolean>(() => {
    return localStorage.getItem('nexus_emergency_mode') === 'true';
  });

  const [isDeactivateModalOpen, setIsDeactivateModalOpen] = useState(false);
  const [isSyncCenterOpen, setIsSyncCenterOpen] = useState(false);
  const [isReportHazardModalOpen, setIsReportHazardModalOpen] = useState(false);

  const [emergencyCause, setEmergencyCause] = useState<string>(
    'Severe Flash Flood & Microburst Storm'
  );

  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('nexus_theme');
    if (saved) return saved === 'dark';
    return false; // Default to clean white & organic green/brown/red/blue theme
  });

  // Dynamic live states loaded from dataService / IndexedDB
  const [resources, setResources] = useState<ResourceItem[]>([]);
  const [volunteers, setVolunteers] = useState<VolunteerProfile[]>([]);
  const [deviceGps, setDeviceGps] = useState<DeviceGpsState | null>(() => {
    try {
      const saved = localStorage.getItem('nexus_device_gps');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return null;
  });
  const [requests, setRequests] = useState<CommunityRequest[]>([]);
  const [alerts, setAlerts] = useState<CommunityAlert[]>([]);
  const [activities, setActivities] = useState<ActivityUpdate[]>([]);
  const [hazardReports, setHazardReports] = useState<HazardReport[]>(INITIAL_HAZARD_REPORTS);
  const [emergencyAuditLogs, setEmergencyAuditLogs] = useState<EmergencyAuditEntry[]>(INITIAL_EMERGENCY_AUDIT_LOGS);
  
  const [isLoadingResources, setIsLoadingResources] = useState(true);
  const [isLoadingVolunteers, setIsLoadingVolunteers] = useState(true);
  const [isLoadingRequests, setIsLoadingRequests] = useState(true);

  // Authentication & Notifications State (Enforces Strict User Isolation)
  const { currentUser } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  // Sync service subscriptions
  const [networkState, setNetworkState] = useState<SyncNetworkState>(syncService.getNetworkState());
  const [lastSyncedAt, setLastSyncedAt] = useState<string>(syncService.getLastSyncedAt());
  const [isSimulatedOffline, setIsSimulatedOffline] = useState<boolean>(syncService.getIsSimulatedOffline());

  useEffect(() => {
    const unsubscribe = syncService.subscribe((state) => {
      setNetworkState(state.networkState);
      setLastSyncedAt(state.lastSyncedAt);
      setIsSimulatedOffline(state.isSimulatedOffline);
    });
    return () => unsubscribe();
  }, []);

  const isOffline = networkState === 'offline' || isSimulatedOffline;

  // Other persistent local features
  const [missions, setMissions] = useState<VolunteerMission[]>(INITIAL_MISSIONS);
  const [sosSignals, setSosSignals] = useState<SosSignal[]>(INITIAL_SOS_SIGNALS);
  const [mapPoints] = useState<MapPoint[]>(INITIAL_MAP_POINTS);
  const [polls, setPolls] = useState<CommunityPoll[]>(INITIAL_POLLS);
  const [searchQuery, setSearchQuery] = useState('');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const [safeCheckIns, setSafeCheckIns] = useState<SafeCheckIn[]>([
    {
      id: 'sc-1',
      name: 'Dr. Elena Rostova & Family',
      timestamp: '6 mins ago',
      location: '12 Westpark Grove',
      status: 'Safe',
      note: 'Power stable via battery inverter. Medical kit stocked.',
    },
    {
      id: 'sc-2',
      name: 'James Thornton',
      timestamp: '15 mins ago',
      location: 'Cascadia Tower B, Apt 1104',
      status: 'Safe',
      note: 'Elevators locked out, using stairs.',
    },
    {
      id: 'sc-3',
      name: 'Maya & Liam Patel',
      timestamp: '22 mins ago',
      location: 'Recreation Center Shelter',
      status: 'Sheltered',
      note: 'Checked in at Primary Hall.',
    },
  ]);

  // Synchronize Dark Mode with DOM
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('nexus_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('nexus_theme', 'light');
    }
  }, [isDarkMode]);

  // Save community selection
  useEffect(() => {
    localStorage.setItem('nexus_current_community', currentCommunityId);
  }, [currentCommunityId]);

  // Save emergency mode
  useEffect(() => {
    localStorage.setItem('nexus_emergency_mode', isEmergencyMode ? 'true' : 'false');
  }, [isEmergencyMode]);

  // Toast helper
  const addToast = useCallback((toast: Omit<ToastMessage, 'id'>) => {
    const id = 'toast-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4);
    setToasts(prev => [...prev, { ...toast, id }]);

    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 5000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // Detect Real Device GPS
  const detectDeviceGps = useCallback((): Promise<DeviceGpsState | null> => {
    return new Promise((resolve) => {
      if (!('geolocation' in navigator)) {
        addToast({
          type: 'warning',
          title: 'GPS Sensor Info',
          message: 'Device geolocation is not supported in this environment.',
        });
        resolve(null);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const state: DeviceGpsState = {
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
            timestamp: pos.timestamp,
            isAcquired: true,
          };
          setDeviceGps(state);
          try {
            localStorage.setItem('nexus_device_gps', JSON.stringify(state));
          } catch {
            // ignore
          }
          addToast({
            type: 'success',
            title: 'Device GPS Acquired',
            message: `Current location: ${state.latitude.toFixed(4)}°, ${state.longitude.toFixed(4)}° (±${Math.round(state.accuracy)}m)`,
          });
          resolve(state);
        },
        (err) => {
          console.warn('Geolocation sensor error:', err.message);
          resolve(null);
        },
        {
          enableHighAccuracy: true,
          timeout: 12000,
          maximumAge: 0,
        }
      );
    });
  }, [addToast]);

  // Subscribe to Cross-Device Volunteer Network & Auto-Acquire GPS
  useEffect(() => {
    // Attempt device GPS acquisition on startup
    detectDeviceGps();

    // Listen to real-time volunteer publications from other devices/tabs
    const unsubscribeSync = crossDeviceSync.subscribe((newVol) => {
      setVolunteers((prev) => {
        const exists = prev.some(v => v.id === newVol.id || (v.name === newVol.name && v.phone === newVol.phone));
        if (exists) {
          return prev.map(v => v.id === newVol.id ? newVol : v);
        }
        return [newVol, ...prev];
      });

      addToast({
        type: 'info',
        title: '🌐 Remote Volunteer Synced',
        message: `${newVol.name} just registered on another device (${newVol.serviceArea || 'Local Sector'}).`,
      });
    });

    return () => {
      unsubscribeSync();
    };
  }, [detectDeviceGps, addToast]);

  // Register Volunteer
  const registerVolunteer = useCallback(async (
    volData: Omit<VolunteerProfile, 'id' | 'createdAt' | 'status'> & { id?: string }
  ): Promise<VolunteerProfile> => {
    const completeVol: VolunteerProfile = {
      status: 'available',
      verificationStatus: 'verified',
      ...volData,
      id: volData.id || `vol-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      missionsCompleted: volData.missionsCompleted ?? 1,
      hoursContributed: volData.hoursContributed ?? 8,
    };
    const registered = await dataService.registerVolunteer(completeVol);
    setVolunteers(prev => [registered, ...prev.filter(v => v.id !== registered.id)]);
    return registered;
  }, []);

  // Fetch initial records from DataService / IndexedDB
  const loadData = useCallback(async () => {
    try {
      setIsLoadingResources(true);
      setIsLoadingVolunteers(true);
      setIsLoadingRequests(true);

      const [resList, volList, reqList, alertList, actList] = await Promise.all([
        dataService.getResources(),
        dataService.getVolunteers(),
        dataService.getRequests(),
        dataService.getAlerts(),
        dataService.getActivities(),
      ]);

      setResources(resList);
      setVolunteers(volList);
      setRequests(reqList);
      setAlerts(alertList);
      setActivities(actList);

      // Load hazard reports from IndexedDB if present
      try {
        const storedHazards = await offlineDb.getAll<HazardReport>('hazard_reports');
        if (storedHazards && storedHazards.length > 0) {
          setHazardReports(storedHazards);
        } else {
          // seed initial hazards
          for (const hz of INITIAL_HAZARD_REPORTS) {
            await offlineDb.put<HazardReport>('hazard_reports', hz);
          }
        }

        const storedAudits = await offlineDb.getAll<EmergencyAuditEntry>('emergency_audit_logs');
        if (storedAudits && storedAudits.length > 0) {
          setEmergencyAuditLogs(storedAudits);
        } else {
          for (const aud of INITIAL_EMERGENCY_AUDIT_LOGS) {
            await offlineDb.put<EmergencyAuditEntry>('emergency_audit_logs', aud);
          }
        }
      } catch (e) {
        console.warn('IndexedDB hazard/audit load error:', e);
      }
    } catch (err) {
      console.error('Error loading community data:', err);
      addToast({
        type: 'warning',
        title: 'Storage Sync Alert',
        message: 'Loaded cached local dataset.',
      });
    } finally {
      setIsLoadingResources(false);
      setIsLoadingVolunteers(false);
      setIsLoadingRequests(false);
    }
  }, [addToast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Notifications Synchronization & Access Control
  const fetchNotifications = useCallback(async () => {
    if (!currentUser?.id) return;
    try {
      const notifs = await dataService.getNotifications(currentUser.id);
      setNotifications(notifs);
    } catch (e) {
      console.warn('Error loading notifications:', e);
    }
  }, [currentUser?.id]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const markNotificationAsRead = useCallback(async (id: string) => {
    if (!currentUser?.id) return;
    try {
      await dataService.markNotificationAsRead(id, currentUser.id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch (e) {
      console.warn('Mark notification as read failed:', e);
    }
  }, [currentUser?.id]);

  const markAllNotificationsAsRead = useCallback(async () => {
    if (!currentUser?.id) return;
    try {
      await dataService.markAllNotificationsAsRead(currentUser.id);
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (e) {
      console.warn('Mark all notifications read failed:', e);
    }
  }, [currentUser?.id]);

  const deleteNotification = useCallback(async (id: string) => {
    if (!currentUser?.id) return;
    try {
      await dataService.deleteNotification(id, currentUser.id);
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (e) {
      console.warn('Delete notification failed:', e);
    }
  }, [currentUser?.id]);

  const createNotification = useCallback(async (notif: Omit<AppNotification, 'id' | 'timestamp'> & { id?: string; timestamp?: string }) => {
    const created = await dataService.createNotification(notif);
    if (created.userId === currentUser?.id || created.userId === 'all') {
      setNotifications(prev => [created, ...prev.filter(n => n.id !== created.id)]);
    }
    return created;
  }, [currentUser?.id]);

  const unreadNotificationsCount = useMemo(() => {
    return notifications.filter(n => !n.isRead).length;
  }, [notifications]);

  // Demo Environment Reseed (For Hackathon Presentations)
  const resetDemoData = useCallback(async () => {
    try {
      await offlineDb.clearStore('resources');
      await offlineDb.clearStore('volunteer_profiles');
      await offlineDb.clearStore('resource_requests');
      await offlineDb.clearStore('emergency_alerts');
      await offlineDb.clearStore('activity_logs');
      await offlineDb.clearStore('hazard_reports');
      await offlineDb.clearStore('notifications');
      await offlineDb.clearStore('sync_queue');
      setIsEmergencyMode(false);
      localStorage.setItem('nexus_emergency_mode', 'false');
      await dataService.reseedDemoData();
      await loadData();
      await fetchNotifications();
      addToast({
        type: 'success',
        title: 'Demo Environment Reset',
        message: 'Pristine hackathon demonstration records reloaded.',
      });
    } catch (e: any) {
      addToast({
        type: 'warning',
        title: 'Reset Error',
        message: e.message || 'Could not reset demo stores.',
      });
    }
  }, [loadData, fetchNotifications, addToast]);

  const currentCommunity = communities.find(c => c.id === currentCommunityId) || communities[0];

  const selectCommunity = (id: string) => {
    setCurrentCommunityId(id);
    const comm = communities.find(c => c.id === id);
    if (comm) {
      addToast({
        type: 'info',
        title: 'Community Switched',
        message: `Switched operational context to ${comm.name}.`,
      });
    }
  };

  // Toggle Emergency Mode with safety deactivation confirmation
  const toggleEmergencyMode = (explicitState?: boolean) => {
    const nextState = explicitState !== undefined ? explicitState : !isEmergencyMode;

    if (!nextState && isEmergencyMode) {
      // Deactivating requires explicit confirmation
      setIsDeactivateModalOpen(true);
      return;
    }

    setIsEmergencyMode(true);
    addEmergencyAuditEntry({
      actorName: 'Sarah Jenkins',
      actorRole: 'Administrator',
      action: 'activated_emergency',
      affectedArea: currentCommunity.name,
      details: `Triggered Disaster Emergency Protocol for ${emergencyCause}. Elevated high-priority triage assets.`,
      newState: 'DISASTER_EMERGENCY_ACTIVE',
    });

    addToast({
      type: 'emergency',
      title: 'DISASTER EMERGENCY MODE ACTIVE',
      message: 'Critical life-safety resources and emergency triage priority hubs are elevated.',
    });
  };

  // Confirmed deactivation with audit reason
  const confirmDeactivateEmergency = async (
    reason: string, 
    actorName: string = 'Sarah Jenkins', 
    actorRole: string = 'Administrator'
  ) => {
    setIsEmergencyMode(false);
    await addEmergencyAuditEntry({
      actorName,
      actorRole,
      action: 'deactivated_emergency',
      affectedArea: currentCommunity.name,
      details: `Deactivated emergency protocol. Rationale: ${reason}`,
      previousState: 'DISASTER_EMERGENCY_ACTIVE',
      newState: 'NORMAL_OPERATIONS',
    });

    addToast({
      type: 'success',
      title: 'Emergency Step-Down Recorded',
      message: 'Community OS returned to normal operations. Audit log updated.',
    });
  };

  const toggleDarkMode = () => {
    setIsDarkMode(prev => !prev);
  };

  // ==========================================
  // HAZARD REPORTS & ROADBLOCK MANAGEMENT
  // ==========================================

  const addHazardReport = async (reportData: Omit<HazardReport, 'id' | 'reportedAt'>) => {
    const newReport: HazardReport = {
      ...reportData,
      id: `hz-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      reportedAt: 'Just now',
    };

    setHazardReports(prev => [newReport, ...prev]);

    // Save to IndexedDB
    await offlineDb.put<HazardReport>('hazard_reports', newReport);

    // If offline, also enqueue for remote sync
    if (syncService.isOnline() === false) {
      await syncService.enqueueAction('submit_hazard_report', 'hazard', newReport);
      addToast({
        type: 'warning',
        title: 'Hazard Queued (Offline)',
        message: `Report for "${newReport.title}" stored locally. Will sync upon connection.`,
      });
    } else {
      addToast({
        type: 'warning',
        title: 'Hazard Report Logged',
        message: `Posted as Unverified Community Report: "${newReport.title}".`,
      });
    }

    return newReport;
  };

  const verifyHazardReport = async (id: string, verifierName: string = 'Tyler Rodriguez') => {
    setHazardReports(prev => prev.map(h => {
      if (h.id === id) {
        const updated: HazardReport = {
          ...h,
          verificationTier: 'community_verified',
          verifiedBy: verifierName,
          verifiedAt: 'Just now',
        };
        offlineDb.put<HazardReport>('hazard_reports', updated);
        return updated;
      }
      return h;
    }));

    await addEmergencyAuditEntry({
      actorName: verifierName,
      actorRole: 'Certified First Responder',
      action: 'verified_hazard',
      affectedArea: currentCommunity.name,
      details: `Field verified hazard #${id.slice(-5)}. Marked as Community Verified.`,
    });

    addToast({
      type: 'success',
      title: 'Hazard Verified on Ground',
      message: 'Status upgraded to Community Verified.',
    });
  };

  const clearHazardReport = async (id: string) => {
    setHazardReports(prev => prev.map(h => {
      if (h.id === id) {
        const updated: HazardReport = {
          ...h,
          status: 'cleared',
        };
        offlineDb.put<HazardReport>('hazard_reports', updated);
        return updated;
      }
      return h;
    }));

    await addEmergencyAuditEntry({
      actorName: 'Civil Defense Lead',
      actorRole: 'Administrator',
      action: 'cleared_hazard',
      affectedArea: currentCommunity.name,
      details: `Cleared hazard condition #${id.slice(-5)}. Roadway/area returned to normal.`,
    });

    addToast({
      type: 'info',
      title: 'Hazard Condition Cleared',
      message: 'Marked resolved on community map.',
    });
  };

  // ==========================================
  // EMERGENCY AUDIT LOGS
  // ==========================================

  const addEmergencyAuditEntry = async (entryData: Omit<EmergencyAuditEntry, 'id' | 'timestamp'>) => {
    const entry: EmergencyAuditEntry = {
      ...entryData,
      id: `aud-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: 'Just now',
    };
    setEmergencyAuditLogs(prev => [entry, ...prev]);
    await offlineDb.put<EmergencyAuditEntry>('emergency_audit_logs', entry);
    return entry;
  };

  // ==========================================
  // RESOURCE MANAGEMENT
  // ==========================================

  const addResource = async (item: Omit<ResourceItem, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const created = await dataService.createResource(item);
      setResources(prev => [created, ...prev]);
      addToast({
        type: 'success',
        title: 'Resource Listed Successfully',
        message: `"${created.name}" is now accessible in the directory.`,
      });
      const acts = await dataService.getActivities();
      setActivities(acts);
      return created;
    } catch (err: any) {
      addToast({
        type: 'warning',
        title: 'Resource Creation Failed',
        message: err.message || 'Validation error.',
      });
      throw err;
    }
  };

  const updateResource = async (id: string, updates: Partial<ResourceItem>) => {
    try {
      const updated = await dataService.updateResource(id, updates);
      setResources(prev => prev.map(r => r.id === id ? updated : r));
      addToast({
        type: 'success',
        title: 'Resource Updated',
        message: `Changes reflected across dashboard and map.`,
      });
      const acts = await dataService.getActivities();
      setActivities(acts);
      return updated;
    } catch (err: any) {
      addToast({
        type: 'warning',
        title: 'Update Blocked',
        message: err.message || 'Validation error.',
      });
      throw err;
    }
  };

  const deactivateResource = async (id: string) => {
    const deactivated = await dataService.deactivateResource(id);
    setResources(prev => prev.map(r => r.id === id ? deactivated : r));
    addToast({
      type: 'warning',
      title: 'Resource Deactivated',
      message: 'Item withdrawn from active mutual aid directory.',
    });
    const acts = await dataService.getActivities();
    setActivities(acts);
    return deactivated;
  };

  const deleteResource = async (id: string) => {
    await dataService.deleteResource(id);
    setResources(prev => prev.filter(r => r.id !== id));
    addToast({
      type: 'info',
      title: 'Resource Removed',
      message: 'Record removed from community catalog.',
    });
    const acts = await dataService.getActivities();
    setActivities(acts);
  };

  const borrowResource = async (id: string) => {
    const target = resources.find(r => r.id === id);
    if (!target) return;
    if (target.availableQuantity <= 0) {
      addToast({
        type: 'warning',
        title: 'Stock Depleted',
        message: 'All units are currently allocated or reserved.',
      });
      return;
    }

    if (syncService.isOnline() === false) {
      // Offline borrow: queue action and decrement locally
      await syncService.enqueueAction('borrow_resource', 'resource', { resourceId: id });
      setResources(prev => prev.map(r => r.id === id ? {
        ...r,
        availableQuantity: Math.max(0, r.availableQuantity - 1),
        status: r.availableQuantity <= 1 ? 'reserved' : r.status
      } : r));
      addToast({
        type: 'info',
        title: 'Offline Borrow Queued',
        message: `1 unit of "${target.name}" reserved offline. Will sync with server upon reconnect.`,
      });
      return;
    }

    await dataService.borrowResource(id);
    const updatedList = await dataService.getResources();
    setResources(updatedList);
    const acts = await dataService.getActivities();
    setActivities(acts);
    addToast({
      type: 'success',
      title: 'Resource Allocated',
      message: `1 unit of "${target.name}" reserved. Custodian contact unlocked.`,
    });
  };

  const returnResource = async (id: string) => {
    const target = resources.find(r => r.id === id);
    if (!target) return;
    await updateResource(id, {
      availableQuantity: Math.min(target.quantity, target.availableQuantity + 1),
      status: 'available',
      availability: 'available',
    });
    addToast({
      type: 'info',
      title: 'Resource Returned',
      message: `Item checked back into available pool.`,
    });
  };

  // ==========================================
  // VOLUNTEER MANAGEMENT
  // ==========================================

  const updateVolunteerProfile = async (id: string, updates: Partial<VolunteerProfile>) => {
    const updated = await dataService.updateVolunteerProfile(id, updates);
    setVolunteers(prev => prev.map(v => v.id === id ? updated : v));
    addToast({
      type: 'success',
      title: 'Volunteer Profile Updated',
      message: 'Skills, languages, and service radius saved.',
    });
    return updated;
  };

  const verifyVolunteer = async (id: string, status: 'verified' | 'rejected', verifierName: string = 'Sarah Jenkins') => {
    const verified = await dataService.verifyVolunteer(id, status, verifierName);
    setVolunteers(prev => prev.map(v => v.id === id ? verified : v));
    addToast({
      type: status === 'verified' ? 'success' : 'warning',
      title: `Volunteer ${status === 'verified' ? 'Verified' : 'Rejected'}`,
      message: `${verified.name} credentials updated by Administrator.`,
    });
    return verified;
  };

  const joinMission = (missionId: string, volunteerName: string = 'Dr. Elena Rostova') => {
    setMissions(prev => prev.map(m => {
      if (m.id === missionId) {
        if (m.volunteersEnrolled.includes(volunteerName)) return m;
        return {
          ...m,
          volunteersEnrolled: [...m.volunteersEnrolled, volunteerName],
        };
      }
      return m;
    }));
    addToast({
      type: 'success',
      title: 'Joined Duty Mission',
      message: `${volunteerName} enrolled in squad relief dispatch.`,
    });
  };

  const createMission = (mission: Omit<VolunteerMission, 'id' | 'volunteersEnrolled'>) => {
    const newMission: VolunteerMission = {
      ...mission,
      id: 'mis-' + Date.now(),
      volunteersEnrolled: ['Lead Coordinator'],
    };
    setMissions(prev => [newMission, ...prev]);
    addToast({
      type: 'success',
      title: 'Mission Dispatched',
      message: `Volunteers across the sector alerted.`,
    });
  };

  // ==========================================
  // CITIZEN REQUESTS & AID QUEUE (OFFLINE CAPABLE)
  // ==========================================

  const addRequest = async (req: Omit<CommunityRequest, 'id' | 'timestamp' | 'status'>) => {
    try {
      if (syncService.isOnline() === false) {
        // Enqueue offline draft request
        const clientGeneratedId = `req-draft-${Date.now()}`;
        const draftRequest: CommunityRequest = {
          ...req,
          id: clientGeneratedId,
          timestamp: 'Just now',
          status: 'Open',
        };

        setRequests(prev => [draftRequest, ...prev]);
        await offlineDb.put<CommunityRequest>('resource_requests', draftRequest);
        await syncService.enqueueAction('create_request', 'request', draftRequest);

        addToast({
          type: 'warning',
          title: 'Draft Request Saved Offline',
          message: `Request for "${req.title}" saved locally in IndexedDB and queued for sync.`,
        });

        return draftRequest;
      }

      const created = await dataService.createRequest(req);
      setRequests(prev => [created, ...prev]);
      addToast({
        type: created.status === 'Matched' ? 'success' : req.urgency === 'critical' ? 'emergency' : 'info',
        title: created.status === 'Matched' ? 'Request Auto-Matched!' : 'Aid Request Logged',
        message: created.status === 'Matched'
          ? `Matched with "${created.matchedResourceName}". View recommendation reasons in the Aid Queue.`
          : `Request for "${req.title}" broadcasted to responders.`,
      });
      const acts = await dataService.getActivities();
      setActivities(acts);
      return created;
    } catch (err: any) {
      addToast({
        type: 'warning',
        title: 'Request Failed',
        message: err.message || 'Could not submit request.',
      });
      throw err;
    }
  };

  const updateRequestStatus = async (
    id: string, 
    status: RequestStatus, 
    responderName: string = 'Alex Miller', 
    matchedResourceId?: string, 
    notes?: string
  ) => {
    try {
      if (syncService.isOnline() === false) {
        // Queue status change offline
        await syncService.enqueueAction('update_request_status', 'request', {
          requestId: id,
          status,
          responderName,
          matchedResourceId,
          notes,
        });

        setRequests(prev => prev.map(r => r.id === id ? { ...r, status } : r));
        addToast({
          type: 'info',
          title: `Status Queued Offline: ${status}`,
          message: `Ticket #${id.slice(-5)} status saved locally. Will sync upon connection.`,
        });
        return requests.find(r => r.id === id)!;
      }

      const updated = await dataService.updateRequestStatus(id, status, responderName, matchedResourceId, notes);
      setRequests(prev => prev.map(r => r.id === id ? updated : r));
      
      const freshResources = await dataService.getResources();
      setResources(freshResources);

      addToast({
        type: ['Fulfilled', 'Accepted'].includes(status) ? 'success' : 'info',
        title: `Request Status: ${status}`,
        message: `Ticket #${id.slice(-5)} moved to ${status}.`,
      });

      const acts = await dataService.getActivities();
      setActivities(acts);

      // Notify requester with deduplicationKey
      await createNotification({
        userId: 'usr-member-1', // Alex Miller
        type: 'request_status_change',
        title: `Request Status Updated: ${status}`,
        message: `Your request "${updated.title}" marked as ${status} by ${responderName}.`,
        isRead: false,
        linkUrl: '/requests',
        relatedRecordId: updated.id,
        deliveryStatus: syncService.isOnline() ? 'server_confirmed' : 'locally_queued',
        deduplicationKey: `notif-req-${id}-${status}`,
      });

      return updated;
    } catch (err: any) {
      addToast({
        type: 'warning',
        title: 'Allocation Blocked',
        message: err.message || 'Cannot perform status change.',
      });
      throw err;
    }
  };

  // ==========================================
  // ALERTS & DISPATCHES
  // ==========================================

  const addAlert = async (alertData: Omit<CommunityAlert, 'id' | 'timestamp' | 'verified'>) => {
    const created = await dataService.createAlert(alertData);
    setAlerts(prev => [created, ...prev]);

    await addEmergencyAuditEntry({
      actorName: alertData.author || 'Civil Defense Lead',
      actorRole: 'Administrator',
      action: 'created_alert',
      affectedArea: currentCommunity.name,
      details: `Broadcasted emergency siren: "${alertData.title}". Severity: ${alertData.severity.toUpperCase()}.`,
    });

    addToast({
      type: created.severity === 'critical' || created.severity === 'severe' ? 'emergency' : 'warning',
      title: 'Emergency Siren Broadcast',
      message: created.title,
    });

    // Broadcast emergency notification to all users
    await createNotification({
      userId: 'all',
      type: 'emergency_alert',
      title: `CIVIL ALERT: ${created.title}`,
      message: created.description || created.message,
      isRead: false,
      linkUrl: '/emergency',
      relatedRecordId: created.id,
      deliveryStatus: syncService.isOnline() ? 'server_confirmed' : 'locally_queued',
      deduplicationKey: `notif-alert-${created.id}`,
    });

    return created;
  };

  const updateAlert = async (
    id: string, 
    updates: Partial<CommunityAlert>, 
    actorName: string = 'Sarah Jenkins', 
    actorRole: string = 'Administrator'
  ) => {
    const updated = await dataService.updateAlert(id, updates);
    setAlerts(prev => prev.map(a => a.id === id ? updated : a));

    await addEmergencyAuditEntry({
      actorName,
      actorRole,
      action: 'updated_alert',
      affectedArea: updated.affectedArea || currentCommunity.name,
      details: `Updated emergency alert #${id.slice(-5)}: "${updated.title}". Severity: ${updated.severity.toUpperCase()}. Area: ${updated.affectedArea || 'Unchanged'}.`,
    });

    addToast({
      type: 'info',
      title: 'Alert Bulletin Updated',
      message: `Modifications saved for "${updated.title}".`,
    });

    return updated;
  };

  const deactivateAlert = async (
    id: string, 
    reason: string, 
    actorName: string = 'Sarah Jenkins', 
    actorRole: string = 'Administrator'
  ) => {
    const deactivated = await dataService.deactivateAlert(id, actorName, reason);
    setAlerts(prev => prev.map(a => a.id === id ? deactivated : a));

    await addEmergencyAuditEntry({
      actorName,
      actorRole,
      action: 'deactivated_alert',
      affectedArea: deactivated.affectedArea || currentCommunity.name,
      details: `Deactivated emergency alert #${id.slice(-5)}: "${deactivated.title}". Rationale: ${reason}`,
      previousState: 'ACTIVE',
      newState: 'DEACTIVATED',
    });

    addToast({
      type: 'success',
      title: 'Alert Bulletin Deactivated',
      message: `"${deactivated.title}" has been stood down.`,
    });

    return deactivated;
  };


  const createSosSignal = (signalData: Omit<SosSignal, 'id' | 'timestamp' | 'status'>) => {
    const newSos: SosSignal = {
      ...signalData,
      id: 'sos-' + Date.now(),
      timestamp: 'Just now',
      status: 'pending',
    };
    setSosSignals(prev => [newSos, ...prev]);
    addToast({
      type: 'emergency',
      title: 'SOS EMERGENCY SIGNAL TRANSMITTED',
      message: 'Coordinates broadcasted to certified triage responders and dispatch.',
    });
  };

  const resolveSosSignal = (id: string) => {
    setSosSignals(prev => prev.map(s => s.id === id ? { ...s, status: 'resolved' } : s));
    addToast({
      type: 'success',
      title: 'SOS Incident Marked Resolved',
      message: 'Citizen safety confirmed.',
    });
  };

  const markMyselfSafe = (
    name: string, 
    location: string, 
    status: SafeCheckIn['status'], 
    note?: string
  ) => {
    const checkIn: SafeCheckIn = {
      id: 'sc-' + Date.now(),
      name,
      location,
      status,
      timestamp: 'Just now',
      note,
    };
    setSafeCheckIns(prev => [checkIn, ...prev]);
    addToast({
      type: 'success',
      title: 'Safety Check-In Registered',
      message: `Your status has been logged on the community roll.`,
    });
  };

  const votePoll = (pollId: string, optionId: string) => {
    setPolls(prev => prev.map(p => {
      if (p.id === pollId) {
        if (p.userVotedOptionId) return p;
        return {
          ...p,
          totalVotes: p.totalVotes + 1,
          userVotedOptionId: optionId,
          options: p.options.map(opt => opt.id === optionId ? { ...opt, votes: opt.votes + 1 } : opt),
        };
      }
      return p;
    }));
    addToast({
      type: 'info',
      title: 'Civic Ballot Counted',
      message: 'Vote verified and added to community ledger.',
    });
  };

  // REAL COMPUTED METRICS
  const metrics = useMemo(() => {
    const activeVolunteers = volunteers.filter(
      v => v.availability === 'available' || v.availability === 'on_mission'
    ).length;

    const availableResources = resources.filter(
      r => (r.availability === 'available' || r.status === 'available') && r.availableQuantity > 0
    ).length;

    const openRequests = requests.filter(
      r => r.status === 'Open' || r.status === 'Matched' || r.status === 'Accepted' || r.status === 'In Progress'
    ).length;

    const fulfilledRequests = requests.filter(r => r.status === 'Fulfilled').length;
    const activeAlerts = alerts.length;
    const activeSos = sosSignals.filter(s => s.status === 'pending').length;
    const activeHazards = hazardReports.filter(h => h.status === 'active').length;

    return {
      activeVolunteers,
      availableResources,
      openRequests,
      fulfilledRequests,
      activeAlerts,
      activeSos,
      activeHazards,
    };
  }, [volunteers, resources, requests, alerts, sosSignals, hazardReports]);

  return (
    <CommunityContext.Provider
      value={{
        communities,
        currentCommunity,
        selectCommunity,
        isEmergencyMode,
        toggleEmergencyMode,
        confirmDeactivateEmergency,
        isDeactivateModalOpen,
        setIsDeactivateModalOpen,
        emergencyCause,
        setEmergencyCause,
        isDarkMode,
        toggleDarkMode,
        resources,
        isLoadingResources,
        addResource,
        updateResource,
        deactivateResource,
        deleteResource,
        borrowResource,
        returnResource,
        volunteers,
        isLoadingVolunteers,
        registerVolunteer,
        updateVolunteerProfile,
        verifyVolunteer,
        missions,
        joinMission,
        createMission,
        deviceGps,
        detectDeviceGps,
        alerts,
        addAlert,
        updateAlert,
        deactivateAlert,
        hazardReports,
        addHazardReport,
        verifyHazardReport,
        clearHazardReport,
        emergencyAuditLogs,
        addEmergencyAuditEntry,
        sosSignals,
        createSosSignal,
        resolveSosSignal,
        safeCheckIns,
        markMyselfSafe,
        mapPoints,
        polls,
        votePoll,
        requests,
        isLoadingRequests,
        addRequest,
        updateRequestStatus,
        activities,
        metrics,
        searchQuery,
        setSearchQuery,
        toasts,
        addToast,
        removeToast,
        networkState,
        isOffline,
        lastSyncedAt,
        isSimulatedOffline,
        toggleSimulatedOffline: () => syncService.setSimulatedOffline(!isSimulatedOffline),
        syncOfflineQueue: () => syncService.syncPendingQueue(),
        isSyncCenterOpen,
        setIsSyncCenterOpen,
        isReportHazardModalOpen,
        setIsReportHazardModalOpen,
        notifications,
        unreadNotificationsCount,
        fetchNotifications,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        deleteNotification,
        createNotification,
        isDemoMode: !isSupabaseConfigured,
        refreshData: loadData,
        resetDemoData,
      }}
    >
      {children}
    </CommunityContext.Provider>
  );
};

export const useCommunity = () => {
  const context = useContext(CommunityContext);
  if (!context) {
    throw new Error('useCommunity must be used within a CommunityProvider');
  }
  return context;
};
