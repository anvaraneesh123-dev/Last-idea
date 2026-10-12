export type UserRole = 'community_member' | 'volunteer' | 'administrator';

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  avatarUrl?: string;
  phone?: string;
  address?: string;
  neighborhoodZone?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type CommunityType = 'neighborhood' | 'apartment' | 'village' | 'campus' | 'city';

export interface Community {
  id: string;
  name: string;
  type: CommunityType;
  location: string;
  population: number;
  emergencyReadinessScore: number; // 0 - 100
  activeVolunteersCount: number;
  availableResourcesCount: number;
  code: string;
}

// 10 categories required by specification, plus legacy aliases for mockData compatibility
export type ResourceCategory = 
  | 'food'
  | 'water'
  | 'medicine'
  | 'hospitals'
  | 'shelters'
  | 'generators'
  | 'rescue_equipment'
  | 'volunteers'
  | 'tools'
  | 'other_services'
  | 'medical'
  | 'power_energy'
  | 'water_food'
  | 'mobility'
  | 'shelter_space'
  | 'communication';

export type ResourceAvailability = 'available' | 'reserved' | 'in_use' | 'deactivated';
export type ResourceStatus = 'available' | 'in_use' | 'reserved' | 'critical_reserve' | 'deactivated';
export type VerificationStatus = 'pending' | 'verified' | 'rejected';

export interface ResourceItem {
  id: string;
  name: string;
  title: string;
  category: ResourceCategory;
  description: string;
  quantity: number;
  availableQuantity: number;
  availability?: ResourceAvailability;
  status: ResourceStatus;
  latitude: number;
  longitude: number;
  locationName: string;
  location: string;
  distance: string;
  ownerId?: string;
  ownerName: string;
  ownerType: 'resident' | 'community_depot' | 'ngo' | 'management';
  contactPhone: string;
  verificationStatus: VerificationStatus;
  isEmergencyEligible: boolean;
  condition: 'Brand New' | 'Excellent' | 'Good';
  createdAt?: string;
  updatedAt: string;
}

export type VolunteerStatus = 'available' | 'on_mission' | 'standby' | 'inactive';

export interface VolunteerProfile {
  id: string;
  profileId?: string;
  name: string;
  email?: string;
  phone: string;
  role: string;
  avatar: string;
  skills: string[];
  languages?: string[];
  serviceArea?: string;
  availability?: VolunteerStatus;
  status?: VolunteerStatus;
  verificationStatus?: VerificationStatus;
  verifiedBy?: string;
  verifiedAt?: string;
  missionsCompleted: number;
  hoursContributed: number;
  emergencyCertified?: boolean;
  isFirstAidCertified?: boolean;
  certifications?: string[];
  neighborhoodZone: string;
  contactProtected?: boolean;
  latitude?: number;
  longitude?: number;
}

export type Volunteer = VolunteerProfile;

export interface VolunteerMission {
  id: string;
  title: string;
  category: 'logistics' | 'medical' | 'elderly_care' | 'disaster_relief' | 'environmental';
  urgency: 'low' | 'medium' | 'high' | 'critical';
  location: string;
  volunteersNeeded: number;
  volunteersEnrolled: string[];
  description: string;
  deadline: string;
  organizer: string;
}

export type AlertSeverity = 'info' | 'warning' | 'severe' | 'critical';
export type EmergencyAlertStatus = 'active' | 'updated' | 'deactivated';

export interface CommunityAlert {
  id: string;
  title: string;
  message: string;
  description?: string;
  severity: AlertSeverity;
  category: 'weather' | 'infrastructure' | 'safety' | 'health' | 'civic';
  emergencyType?: 'flood' | 'fire' | 'severe_weather' | 'infrastructure_failure' | 'other';
  affectedArea?: string;
  status?: EmergencyAlertStatus;
  timestamp: string;
  author: string;
  verified: boolean;
  actionRequired?: string;
  updatedAt?: string;
  deactivatedAt?: string;
  deactivatedBy?: string;
  deactivationReason?: string;
}


export interface SosSignal {
  id: string;
  citizenName: string;
  location: string;
  situation: string;
  urgency: 'immediate_dispatch' | 'high' | 'moderate';
  needsMedical: boolean;
  needsEvacuation: boolean;
  needsSupplies: boolean;
  timestamp: string;
  status: 'pending' | 'in_progress' | 'resolved';
}

export interface MapPoint {
  id: string;
  name: string;
  type: 'shelter' | 'aed_defibrillator' | 'water_purifier' | 'backup_generator' | 'depot' | 'first_aid';
  coordinates: { x: number; y: number };
  address: string;
  capacity?: string;
  operationalStatus: '100% Operational' | 'Limited Stock' | 'Emergency Priority';
}

export interface CommunityPoll {
  id: string;
  question: string;
  category: string;
  endsIn: string;
  totalVotes: number;
  userVotedOptionId?: string;
  options: {
    id: string;
    text: string;
    votes: number;
  }[];
}

export type RequestStatus = 
  | 'Open' 
  | 'Matched' 
  | 'Accepted' 
  | 'In Progress' 
  | 'Fulfilled' 
  | 'Cancelled' 
  | 'Expired'
  | 'pending'
  | 'approved';

export interface ResourceMatchRecommendation {
  resource: ResourceItem;
  score: number;
  reasons: string[];
  distanceKm: number;
  sufficientQuantity: boolean;
}

export interface CommunityRequest {
  id: string;
  communityId?: string;
  requesterId?: string;
  requesterName: string;
  requesterPhone: string;
  title: string;
  description?: string;
  details: string;
  category: ResourceCategory;
  type: 'resource_borrow' | 'mutual_aid' | 'medical_assist' | 'infrastructure';
  quantityRequested: number;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  status: RequestStatus;
  latitude?: number;
  longitude?: number;
  locationName?: string;
  location: string;
  matchedResourceId?: string;
  matchedResourceName?: string;
  matchReason?: string;
  matchRecommendations?: ResourceMatchRecommendation[];
  allocatedQuantity?: number;
  timestamp: string;
  createdAt?: string;
  updatedAt?: string;
  clientGeneratedId?: string;
}

export interface RequestResponse {
  id: string;
  requestId: string;
  responderId?: string;
  responderName: string;
  statusChange: RequestStatus;
  notes?: string;
  allocatedQuantity: number;
  createdAt: string;
}

export interface ActivityUpdate {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  type: 'resource' | 'volunteer' | 'emergency' | 'request' | 'system';
  actor: string;
  badge?: string;
}

export type HazardType = 
  | 'flood' 
  | 'wildfire' 
  | 'severe_weather' 
  | 'infrastructure_failure' 
  | 'downed_power_line' 
  | 'blocked_road' 
  | 'gas_leak' 
  | 'structural_damage' 
  | 'other';

export type VerificationTier = 'official_alert' | 'community_verified' | 'unverified_report';

export interface HazardReport {
  id: string;
  title: string;
  type: HazardType;
  severity: AlertSeverity;
  status: 'active' | 'investigating' | 'cleared';
  verificationTier: VerificationTier;
  latitude: number;
  longitude: number;
  locationName: string;
  description: string;
  reportedBy: string;
  reporterPhone?: string;
  reportedAt: string;
  verifiedBy?: string;
  verifiedAt?: string;
  isRoadBlocked: boolean;
  detourNotes?: string;
}

export type EmergencyType = 'flood' | 'fire' | 'severe_weather' | 'infrastructure_failure' | 'other';

export interface EmergencyAuditEntry {
  id: string;
  timestamp: string;
  actorName: string;
  actorRole: string;
  action: 'activated_emergency' | 'deactivated_emergency' | 'created_alert' | 'updated_alert' | 'deactivated_alert' | 'verified_hazard' | 'cleared_hazard';
  details: string;
  affectedArea: string;
  previousState?: string;
  newState?: string;
}

export type SyncNetworkState = 'online' | 'offline' | 'syncing' | 'sync_failed';

export type SyncOperationStatus = 'pending' | 'syncing' | 'synced' | 'failed';

export interface OfflineSyncQueueItem {
  id: string;
  clientGeneratedId: string;
  operation: 'create_request' | 'update_request_status' | 'submit_hazard_report' | 'borrow_resource' | 'update_resource';
  entityType: 'request' | 'hazard' | 'resource';
  payload: any;
  status: SyncOperationStatus;
  errorMessage?: string;
  createdAt: string;
  retryCount: number;
  lastAttemptedAt?: string;
  version: number;
}

export type NotificationType = 
  | 'request_response' 
  | 'volunteer_assignment' 
  | 'request_status_change' 
  | 'resource_availability' 
  | 'emergency_alert';

export type NotificationDeliveryStatus = 'locally_queued' | 'server_confirmed';

export interface AppNotification {
  id: string;
  userId: string; // Target recipient ID or 'all' for broadcast civil emergency alerts
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  timestamp: string;
  linkUrl?: string;
  relatedRecordId?: string;
  deliveryStatus: NotificationDeliveryStatus;
  deduplicationKey?: string;
}


