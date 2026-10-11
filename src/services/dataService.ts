import { 
  ResourceItem, 
  VolunteerProfile, 
  CommunityRequest, 
  RequestResponse, 
  CommunityAlert, 
  ActivityUpdate,
  UserProfile,
  UserRole,
  RequestStatus,
  ResourceCategory,
  AppNotification,
  NotificationType,
  NotificationDeliveryStatus
} from '../types';
import { supabase, isSupabaseConfigured } from './supabaseClient';
import { offlineDb } from './indexedDb';
import { matchRequestToResources } from '../utils/matchingEngine';

// Seed Notifications with Strict User Isolation and Deduplication Keys
export const INITIAL_SEED_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif-1',
    userId: 'usr-admin-1', // Sarah Jenkins (Admin)
    type: 'emergency_alert',
    title: 'Severe Flash Flood Warning: Sector 4',
    message: 'Rapid storm runoff reported along Silver Creek basin. Civil defense sirens active.',
    isRead: false,
    timestamp: '15 mins ago',
    linkUrl: '/emergency',
    relatedRecordId: 'alert-1',
    deliveryStatus: 'server_confirmed',
    deduplicationKey: 'notif-dedup-alert-1',
  },
  {
    id: 'notif-2',
    userId: 'usr-admin-1',
    type: 'volunteer_assignment',
    title: 'Volunteer Deployment Assigned',
    message: 'Dr. Elena Rostova enrolled in Medical Triage Mission #mis-1 at Cascadia Community Center.',
    isRead: false,
    timestamp: '35 mins ago',
    linkUrl: '/volunteers',
    relatedRecordId: 'mis-1',
    deliveryStatus: 'server_confirmed',
    deduplicationKey: 'notif-dedup-vol-mis-1',
  },
  {
    id: 'notif-3',
    userId: 'usr-vol-1', // Dr. Elena Rostova (Volunteer)
    type: 'volunteer_assignment',
    title: 'Mission Enrolled: Sector 4 Emergency Clinic',
    message: 'You have been dispatched as Medical Triage Captain for Silver Creek staging zone.',
    isRead: false,
    timestamp: '40 mins ago',
    linkUrl: '/volunteers',
    relatedRecordId: 'mis-1',
    deliveryStatus: 'server_confirmed',
    deduplicationKey: 'notif-dedup-elena-mis-1',
  },
  {
    id: 'notif-4',
    userId: 'usr-member-1', // Alex Miller (Community Member)
    type: 'request_status_change',
    title: 'Request #req-1 Matched to Generator',
    message: 'Your emergency request for backup electricity has been matched with 15kW Heavy Diesel Station.',
    isRead: false,
    timestamp: '18 mins ago',
    linkUrl: '/requests',
    relatedRecordId: 'req-1',
    deliveryStatus: 'server_confirmed',
    deduplicationKey: 'notif-dedup-req-status-1',
  },
  {
    id: 'notif-5',
    userId: 'usr-member-1',
    type: 'resource_availability',
    title: 'Resource Stock Alert: Potable Water',
    message: 'Gravity Potable Water Filtration Unit has 3 available stations at Cascadia Depot.',
    isRead: true,
    timestamp: '1 hour ago',
    linkUrl: '/resources',
    relatedRecordId: 'res-water-1',
    deliveryStatus: 'server_confirmed',
    deduplicationKey: 'notif-dedup-res-water-1',
  },
  {
    id: 'notif-6',
    userId: 'all', // Broadcast to all authenticated users
    type: 'emergency_alert',
    title: 'Emergency Mesh Standby Protocol',
    message: 'Nexus offline mesh repeater active on VHF 146.520 MHz. Keep devices charged.',
    isRead: false,
    timestamp: '2 hours ago',
    linkUrl: '/emergency',
    relatedRecordId: 'alert-mesh',
    deliveryStatus: 'server_confirmed',
    deduplicationKey: 'notif-dedup-mesh-broadcast',
  },
];

// Default Demo Profiles
export const DEMO_PROFILES: UserProfile[] = [
  {
    id: 'usr-admin-1',
    email: 'sarah.jenkins@nexus.org',
    fullName: 'Sarah Jenkins',
    role: 'administrator',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80',
    phone: '+1 (555) 438-1190',
    address: '42 Sector 4 Command Post, Cascadia',
    neighborhoodZone: 'Sector 4 Lead',
    createdAt: '2026-01-10T08:00:00Z',
  },
  {
    id: 'usr-vol-1',
    email: 'elena.rostova@nexus.org',
    fullName: 'Dr. Elena Rostova',
    role: 'volunteer',
    avatarUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=120&auto=format&fit=crop&q=80',
    phone: '+1 (555) 554-1928',
    address: '12 Westpark Grove, Cascadia',
    neighborhoodZone: 'Zone 1 - Medical Triage',
    createdAt: '2026-01-15T09:30:00Z',
  },
  {
    id: 'usr-member-1',
    email: 'alex.miller@community.local',
    fullName: 'Alex Miller',
    role: 'community_member',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    phone: '+1 (555) 749-1120',
    address: '77 Valley Crest Way, Cascadia',
    neighborhoodZone: 'Zone 4 Resident',
    createdAt: '2026-02-01T11:00:00Z',
  },
];

// Seed Resources covering all 10 categories
export const INITIAL_SEED_RESOURCES: ResourceItem[] = [
  {
    id: 'res-food-1',
    name: 'Ready-to-Eat Ration Packs & MRE Depot (500 units)',
    title: 'Ready-to-Eat Ration Packs & MRE Depot',
    category: 'food',
    description: 'Calorie-dense dehydrated food boxes, baby formula cartons, and clean emergency rations.',
    quantity: 50,
    availableQuantity: 44,
    availability: 'available',
    status: 'available',
    latitude: 45.5170,
    longitude: -122.6820,
    locationName: 'Co-op Gardens South Pavilion, Bay 1',
    location: 'Co-op Gardens South Pavilion, Bay 1',
    distance: '240m away',
    ownerId: 'usr-admin-1',
    ownerName: 'Amira Al-Mansoor',
    ownerType: 'community_depot',
    contactPhone: '+1 (555) 602-3341',
    verificationStatus: 'verified',
    isEmergencyEligible: true,
    condition: 'Brand New',
    updatedAt: '12 mins ago',
  },
  {
    id: 'res-water-1',
    name: 'High-Output Gravity Potable Water Filtration Unit (1200 Gal)',
    title: 'Gravity Potable Water Filtration Unit',
    category: 'water',
    description: 'Four continuous ceramic-core gravity taps. Requires zero electricity; delivers 1200 gal/day.',
    quantity: 4,
    availableQuantity: 3,
    availability: 'available',
    status: 'available',
    latitude: 45.5185,
    longitude: -122.6750,
    locationName: 'Gardens Central Cistern & Filtration Bay',
    location: 'Gardens Central Cistern & Filtration Bay',
    distance: '320m away',
    ownerId: 'usr-admin-1',
    ownerName: 'Water Resource Board',
    ownerType: 'management',
    contactPhone: '+1 (555) 438-1190',
    verificationStatus: 'verified',
    isEmergencyEligible: true,
    condition: 'Excellent',
    updatedAt: '25 mins ago',
  },
  {
    id: 'res-med-1',
    name: 'Philips HeartStart FRx AED Defibrillator & Trauma Kit',
    title: 'Philips HeartStart AED Defibrillator',
    category: 'medicine',
    description: 'Automated voice-assisted external defibrillator with pediatric pads, CAT tourniquets, and trauma dressing.',
    quantity: 2,
    availableQuantity: 2,
    availability: 'available',
    status: 'available',
    latitude: 45.5140,
    longitude: -122.6790,
    locationName: 'Civic Clubhouse – Great Hall East Lobby',
    location: 'Civic Clubhouse – Great Hall East Lobby',
    distance: '150m away',
    ownerId: 'usr-vol-1',
    ownerName: 'Dr. Elena Rostova',
    ownerType: 'ngo',
    contactPhone: '+1 (555) 554-1928',
    verificationStatus: 'verified',
    isEmergencyEligible: true,
    condition: 'Brand New',
    updatedAt: '1 hour ago',
  },
  {
    id: 'res-hosp-1',
    name: 'Valley Care Urgent Center & Emergency Triage Wing',
    title: 'Valley Care Urgent Center Triage',
    category: 'hospitals',
    description: '24-hour urgent care facility with 8 triage beds, oxygen supply, and suture stations.',
    quantity: 8,
    availableQuantity: 6,
    availability: 'available',
    status: 'available',
    latitude: 45.5200,
    longitude: -122.6840,
    locationName: 'Valley Health Pavilion, 210 Medical Dr',
    location: 'Valley Health Pavilion, 210 Medical Dr',
    distance: '650m away',
    ownerId: 'usr-vol-1',
    ownerName: 'Dr. Sean Gallagher',
    ownerType: 'management',
    contactPhone: '+1 (555) 881-2401',
    verificationStatus: 'verified',
    isEmergencyEligible: true,
    condition: 'Excellent',
    updatedAt: '3 hours ago',
  },
  {
    id: 'res-shlt-1',
    name: 'Silverwood Civic Recreation Center Emergency Shelter',
    title: 'Silverwood Civic Emergency Shelter',
    category: 'shelters',
    description: 'Heated municipal shelter equipped with 240 insulated cots, emergency mess hall, and Starlink mesh internet.',
    quantity: 240,
    availableQuantity: 185,
    availability: 'available',
    status: 'available',
    latitude: 45.5150,
    longitude: -122.6780,
    locationName: '100 Valley Way, Main Gym & Hall',
    location: '100 Valley Way, Main Gym & Hall',
    distance: '300m away',
    ownerId: 'usr-admin-1',
    ownerName: 'Disaster Shelter Taskforce',
    ownerType: 'management',
    contactPhone: '+1 (555) 771-8844',
    verificationStatus: 'verified',
    isEmergencyEligible: true,
    condition: 'Excellent',
    updatedAt: 'Just now',
  },
  {
    id: 'res-gen-1',
    name: '15kW Heavy Diesel Microgrid Generator Station',
    title: '15kW Heavy Diesel Microgrid Generator',
    category: 'generators',
    description: 'Continuous clean sine output with 12 AC high-draw plugs and 36 USB-C rapid charging distribution ports.',
    quantity: 2,
    availableQuantity: 1,
    availability: 'available',
    status: 'critical_reserve',
    latitude: 45.5190,
    longitude: -122.6720,
    locationName: 'Science Quarter Energy Shed – Bay 2',
    location: 'Science Quarter Energy Shed – Bay 2',
    distance: '480m away',
    ownerId: 'usr-vol-1',
    ownerName: 'Marcus Chen',
    ownerType: 'community_depot',
    contactPhone: '+1 (555) 782-9932',
    verificationStatus: 'verified',
    isEmergencyEligible: true,
    condition: 'Excellent',
    updatedAt: '35 mins ago',
  },
  {
    id: 'res-resc-1',
    name: 'Heavy Flood Rescue Zodiac Boat with 25HP Outboard & Life Vests',
    title: 'Flood Rescue Zodiac Boat',
    category: 'rescue_equipment',
    description: 'Inflatable heavy-duty raft with safety ropes, 8 adult USCG life vests, dry packs, and high-intensity flood spotlights.',
    quantity: 2,
    availableQuantity: 2,
    availability: 'available',
    status: 'available',
    latitude: 45.5110,
    longitude: -122.6850,
    locationName: 'Boat Ramp Sector B, Cascadia Marina',
    location: 'Boat Ramp Sector B, Cascadia Marina',
    distance: '520m away',
    ownerId: 'usr-admin-1',
    ownerName: 'Tyler Rodriguez',
    ownerType: 'resident',
    contactPhone: '+1 (555) 891-2309',
    verificationStatus: 'verified',
    isEmergencyEligible: true,
    condition: 'Excellent',
    updatedAt: '45 mins ago',
  },
  {
    id: 'res-vol-1',
    name: 'FEMA ICS Certified Flood Defense Volunteer Squad (6 Responders)',
    title: 'Flood Defense Volunteer Squad',
    category: 'volunteers',
    description: 'Trained neighborhood squad specializing in sandbag deployment, barrier reinforcement, and rapid evacuation assistance.',
    quantity: 6,
    availableQuantity: 4,
    availability: 'available',
    status: 'available',
    latitude: 45.5160,
    longitude: -122.6760,
    locationName: 'Sector 4 Readiness Post',
    location: 'Sector 4 Readiness Post',
    distance: '180m away',
    ownerId: 'usr-admin-1',
    ownerName: 'Sarah Jenkins',
    ownerType: 'ngo',
    contactPhone: '+1 (555) 438-1190',
    verificationStatus: 'verified',
    isEmergencyEligible: true,
    condition: 'Brand New',
    updatedAt: '10 mins ago',
  },
  {
    id: 'res-tool-1',
    name: 'Stihl MS 271 Heavy Duty 20" Chainsaw & PPE Safety Kit',
    title: 'Stihl MS 271 20" Chainsaw Kit',
    category: 'tools',
    description: 'FarmBoss chainsaw, 2-cycle mixed fuel cans, bar oil, chaps, safety helmet with ear protection for downed trees.',
    quantity: 3,
    availableQuantity: 2,
    availability: 'available',
    status: 'available',
    latitude: 45.5130,
    longitude: -122.6810,
    locationName: '52 Oakridge Avenue, Workshop Unit',
    location: '52 Oakridge Avenue, Workshop Unit',
    distance: '310m away',
    ownerId: 'usr-member-1',
    ownerName: 'Alex Miller',
    ownerType: 'resident',
    contactPhone: '+1 (555) 749-1120',
    verificationStatus: 'verified',
    isEmergencyEligible: true,
    condition: 'Excellent',
    updatedAt: '15 mins ago',
  },
  {
    id: 'res-serv-1',
    name: 'Emergency Ham Radio VHF/UHF Relay & Starlink Dispatch Terminal',
    title: 'Emergency Ham Radio & Starlink Terminal',
    category: 'other_services',
    description: 'Off-grid satellite data uplinks and 2m/70cm amateur emergency net radio linking local sector to county dispatch.',
    quantity: 2,
    availableQuantity: 2,
    availability: 'available',
    status: 'available',
    latitude: 45.5175,
    longitude: -122.6770,
    locationName: 'Central Tower Dispatch Hut',
    location: 'Central Tower Dispatch Hut',
    distance: '210m away',
    ownerId: 'usr-admin-1',
    ownerName: 'Sarah Jenkins',
    ownerType: 'management',
    contactPhone: '+1 (555) 438-1190',
    verificationStatus: 'verified',
    isEmergencyEligible: true,
    condition: 'Brand New',
    updatedAt: '5 mins ago',
  },
];

// Seed Volunteers
export const INITIAL_SEED_VOLUNTEERS: VolunteerProfile[] = [
  {
    id: 'vol-1',
    profileId: 'usr-vol-1',
    name: 'Dr. Elena Rostova',
    email: 'elena.rostova@nexus.org',
    phone: '+1 (555) 554-1928',
    role: 'Lead Trauma Physician & Triage Captain',
    avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=120&auto=format&fit=crop&q=80',
    skills: ['Triage', 'Emergency Medicine', 'Wilderness First Responder', 'Pediatric Care'],
    languages: ['English', 'Spanish', 'Russian'],
    serviceArea: 'Sector 1 & 2 Valley Quadrant',
    availability: 'available',
    verificationStatus: 'verified',
    missionsCompleted: 24,
    hoursContributed: 168,
    emergencyCertified: true,
    neighborhoodZone: 'Westpark Grove (Zone 1)',
  },
  {
    id: 'vol-2',
    profileId: 'usr-admin-1',
    name: 'Sarah Jenkins',
    email: 'sarah.jenkins@nexus.org',
    phone: '+1 (555) 438-1190',
    role: 'EOC Communications Lead & Net Control',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80',
    skills: ['Ham Radio Operator', 'Disaster Logistics', 'ICS 100/200/700', 'Shelter Lead'],
    languages: ['English', 'French'],
    serviceArea: 'Cascadia District-Wide',
    availability: 'available',
    verificationStatus: 'verified',
    missionsCompleted: 38,
    hoursContributed: 240,
    emergencyCertified: true,
    neighborhoodZone: 'Sector 4 Headquarters',
  },
  {
    id: 'vol-3',
    profileId: 'usr-marcus-1',
    name: 'Marcus Chen',
    email: 'marcus.chen@trades.local',
    phone: '+1 (555) 782-9932',
    role: 'Master Electrician & Microgrid Engineer',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
    skills: ['Master Electrician', 'Generator Hookups', 'Solar Inverters', 'Power Triage'],
    languages: ['English', 'Mandarin'],
    serviceArea: 'Sector 3 & 4 Grid Corridors',
    availability: 'on_mission',
    verificationStatus: 'verified',
    missionsCompleted: 19,
    hoursContributed: 142,
    emergencyCertified: true,
    neighborhoodZone: 'Science Quarter (Zone 3)',
  },
  {
    id: 'vol-4',
    profileId: 'usr-tyler-1',
    name: 'Tyler Rodriguez',
    email: 'tyler.r@rescue.local',
    phone: '+1 (555) 891-2309',
    role: 'Structural Assessment & Search Lead',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80',
    skills: ['Chainsaw Operations', 'Structural Safety', 'Flood Defense', 'Rope Rescue'],
    languages: ['English', 'Spanish'],
    serviceArea: 'Riverfront & East Rim',
    availability: 'available',
    verificationStatus: 'verified',
    missionsCompleted: 15,
    hoursContributed: 98,
    emergencyCertified: true,
    neighborhoodZone: 'East Woods Edge (Zone 2)',
  },
  {
    id: 'vol-5',
    profileId: 'usr-amira-1',
    name: 'Amira Al-Mansoor',
    email: 'amira.am@community.local',
    phone: '+1 (555) 602-3341',
    role: 'Food Supply Coordinator & Senior Care',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80',
    skills: ['Senior Care', 'Food Distribution', 'First Aid', 'Mental Health First Aid'],
    languages: ['English', 'Arabic'],
    serviceArea: 'Sector 4 South',
    availability: 'standby',
    verificationStatus: 'pending',
    missionsCompleted: 8,
    hoursContributed: 56,
    emergencyCertified: false,
    neighborhoodZone: 'Co-op Gardens (Zone 4)',
  },
];

// Seed Requests with all statuses: Open, Matched, Accepted, In Progress, Fulfilled, Cancelled, Expired
export const INITIAL_SEED_REQUESTS: CommunityRequest[] = [
  {
    id: 'req-1',
    requesterName: 'Maya Chen',
    requesterPhone: '+1 (555) 234-8891',
    title: 'Emergency Generator for Infant Oxygen Concentrator',
    description: 'Power line down due to fallen fir branch. Need clean sine power generator within 2 hours for baby medical nebulizer.',
    details: 'Power line down due to fallen fir branch. Need clean sine power generator within 2 hours for baby medical nebulizer.',
    category: 'generators',
    type: 'resource_borrow',
    quantityRequested: 1,
    urgency: 'critical',
    status: 'Matched',
    latitude: 45.5180,
    longitude: -122.6730,
    locationName: '54 Valley Crest Way, Cascadia',
    location: '54 Valley Crest Way, Cascadia',
    matchedResourceId: 'res-gen-1',
    matchedResourceName: '15kW Heavy Diesel Microgrid Generator Station',
    matchReason: 'Direct category match: Clean sine power generator, within 480m radius, emergency eligible stock verified.',
    allocatedQuantity: 1,
    timestamp: '18 mins ago',
  },
  {
    id: 'req-2',
    requesterName: 'David K. O’Connor',
    requesterPhone: '+1 (555) 993-2104',
    title: 'Downed Oak Tree Blocking Evacuation Driveway',
    description: 'Large limb spanning entire private exit road. Need chainsaw crew and heavy pull straps to clear driveway.',
    details: 'Large limb spanning entire private exit road. Need chainsaw crew and heavy pull straps to clear driveway.',
    category: 'tools',
    type: 'mutual_aid',
    quantityRequested: 1,
    urgency: 'high',
    status: 'In Progress',
    latitude: 45.5125,
    longitude: -122.6815,
    locationName: '110 West Pine Terrace, Sector 2',
    location: '110 West Pine Terrace, Sector 2',
    matchedResourceId: 'res-tool-1',
    matchedResourceName: 'Stihl MS 271 Heavy Duty 20" Chainsaw & PPE Kit',
    matchReason: 'Equipment verified, 20" blade capacity, distance 310m, volunteer operator en route.',
    allocatedQuantity: 1,
    timestamp: '42 mins ago',
  },
  {
    id: 'req-3',
    requesterName: 'Apt 4B Elderly Care Group',
    requesterPhone: '+1 (555) 441-9088',
    title: 'Potable Drinking Water Delivery for 12 Senior Residents',
    description: 'Municipal water pressure low with boil advisory. Need 10 gallons of clean filtered water brought to 3rd floor.',
    details: 'Municipal water pressure low with boil advisory. Need 10 gallons of clean filtered water brought to 3rd floor.',
    category: 'water',
    type: 'resource_borrow',
    quantityRequested: 10,
    urgency: 'high',
    status: 'Open',
    latitude: 45.5175,
    longitude: -122.6760,
    locationName: 'Highland Ridge Apartments, Bldg C',
    location: 'Highland Ridge Apartments, Bldg C',
    timestamp: '1 hour ago',
  },
  {
    id: 'req-4',
    requesterName: 'Marcus Sterling',
    requesterPhone: '+1 (555) 887-3211',
    title: 'Severe Ankle Fracture Splint & First Aid Kit',
    description: 'Slip and fall on flooded trail. Patient immobilized, needs splint, ice pack, and transport assist.',
    details: 'Slip and fall on flooded trail. Patient immobilized, needs splint, ice pack, and transport assist.',
    category: 'medicine',
    type: 'medical_assist',
    quantityRequested: 1,
    urgency: 'high',
    status: 'Accepted',
    latitude: 45.5145,
    longitude: -122.6800,
    locationName: 'Trailhead Gate 3, Sector 1',
    location: 'Trailhead Gate 3, Sector 1',
    matchedResourceId: 'res-med-1',
    matchedResourceName: 'Philips HeartStart FRx AED & Trauma Kit',
    matchReason: 'Trauma kit with splints and cervical collars ready at Clubhouse (150m away). Responder dispatched.',
    allocatedQuantity: 1,
    timestamp: '2 hours ago',
  },
  {
    id: 'req-5',
    requesterName: 'Lucas Vance',
    requesterPhone: '+1 (555) 774-1299',
    title: 'Emergency Cots for Displaced Family (4 Persons)',
    description: 'Basement flooded up to 2 feet. Seeking dry temporary shelter space and 4 sleeping cots overnight.',
    details: 'Basement flooded up to 2 feet. Seeking dry temporary shelter space and 4 sleeping cots overnight.',
    category: 'shelters',
    type: 'resource_borrow',
    quantityRequested: 4,
    urgency: 'medium',
    status: 'Fulfilled',
    latitude: 45.5150,
    longitude: -122.6780,
    locationName: 'Recreation Center Shelter Hall B',
    location: 'Recreation Center Shelter Hall B',
    matchedResourceId: 'res-shlt-1',
    matchedResourceName: 'Silverwood Civic Recreation Center Emergency Shelter',
    matchReason: 'Assigned to Warm Bay 4 at Silverwood Center with mess access.',
    allocatedQuantity: 4,
    timestamp: '4 hours ago',
  },
  {
    id: 'req-6',
    requesterName: 'Karen White',
    requesterPhone: '+1 (555) 301-4492',
    title: 'Sandbag Loading Shovels (Cancelled by Requester)',
    description: 'Neighbour shared extra shovels, request no longer needed.',
    details: 'Neighbour shared extra shovels, request no longer needed.',
    category: 'tools',
    type: 'resource_borrow',
    quantityRequested: 2,
    urgency: 'low',
    status: 'Cancelled',
    locationName: '88 Oakridge Way',
    location: '88 Oakridge Way',
    timestamp: '6 hours ago',
  },
  {
    id: 'req-7',
    requesterName: 'Sunset Terrace HOA',
    requesterPhone: '+1 (555) 609-1223',
    title: 'Temporary Flashlight Caches for Evening Drill',
    description: 'Drill scheduled for 18:00 yesterday concluded.',
    details: 'Drill scheduled for 18:00 yesterday concluded.',
    category: 'tools',
    type: 'resource_borrow',
    quantityRequested: 5,
    urgency: 'low',
    status: 'Expired',
    locationName: 'Sunset Terrace Commons',
    location: 'Sunset Terrace Commons',
    timestamp: '1 day ago',
  },
];

// Seed Alerts
export const INITIAL_SEED_ALERTS: CommunityAlert[] = [
  {
    id: 'alert-1',
    title: 'Cascadia Flash Flood Watch & Creek Surge Advisory',
    message: 'National Weather Service warning for Silverwood Creek basin. Low-lying basements along South Pavilion are advised to elevate electronics and collect sandbags.',
    severity: 'critical',
    category: 'weather',
    timestamp: '8 mins ago',
    author: 'Sarah Jenkins (EOC Lead)',
    verified: true,
    actionRequired: 'Move emergency generators and medical equipment above grade level.',
  },
  {
    id: 'alert-2',
    title: 'Feeder Line #4 De-Energized for Fire Prevention',
    message: 'Utility microgrid has automatically switched Sector 3 clubhouse to backup solar-battery storage. Essential medical cooling remains fully powered.',
    severity: 'warning',
    category: 'infrastructure',
    timestamp: '32 mins ago',
    author: 'Marcus Chen (Electrician)',
    verified: true,
    actionRequired: 'Conserve heavy HVAC appliance power; prioritize phone & battery charging.',
  },
  {
    id: 'alert-3',
    title: 'Emergency Water Station #1 Gravity Taps Certified Pure',
    message: 'Turbidity and bacterial testing complete at Central Cistern. Free potable water available for all residents 24/7.',
    severity: 'info',
    category: 'health',
    timestamp: '1 hour ago',
    author: 'Water Resource Board',
    verified: true,
  },
];

// Seed Activity Updates
export const INITIAL_SEED_ACTIVITIES: ActivityUpdate[] = [
  {
    id: 'act-1',
    title: 'Emergency Generator Allocated to Medical Request',
    description: '15kW Microgrid generator dispatched to 54 Valley Crest Way for pediatric oxygen concentrator.',
    timestamp: '15 mins ago',
    type: 'request',
    actor: 'Dr. Elena Rostova',
    badge: 'Urgent Dispatch',
  },
  {
    id: 'act-2',
    title: 'Dr. Elena Rostova Verified as Medical Triage Captain',
    description: 'Credentials authenticated under FEMA ICS and State Medical Board license.',
    timestamp: '45 mins ago',
    type: 'volunteer',
    actor: 'Sarah Jenkins (Admin)',
    badge: 'Admin Verified',
  },
  {
    id: 'act-3',
    title: 'New Emergency Shelter Asset Published',
    description: 'Silverwood Civic Recreation Center registered with 240 insulated emergency cots.',
    timestamp: '1 hour ago',
    type: 'resource',
    actor: 'Disaster Shelter Taskforce',
    badge: 'Disaster Ready',
  },
  {
    id: 'act-4',
    title: 'Aid Request #req-5 Marked Fulfilled',
    description: 'Lucas Vance and displaced family checked into Recreation Center Shelter Hall B.',
    timestamp: '2 hours ago',
    type: 'request',
    actor: 'Amira Al-Mansoor',
    badge: 'Mutual Aid Closed',
  },
];

// UNIFIED DATA SERVICE
export class DataService {
  private initialized = false;

  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      // Seed IndexedDB if empty
      const existingResources = await offlineDb.getAll<ResourceItem>('resources');
      if (existingResources.length === 0) {
        for (const res of INITIAL_SEED_RESOURCES) {
          await offlineDb.put('resources', res);
        }
        for (const vol of INITIAL_SEED_VOLUNTEERS) {
          await offlineDb.put('volunteer_profiles', vol);
        }
        for (const req of INITIAL_SEED_REQUESTS) {
          await offlineDb.put('resource_requests', req);
        }
        for (const alert of INITIAL_SEED_ALERTS) {
          await offlineDb.put('emergency_alerts', alert);
        }
        for (const act of INITIAL_SEED_ACTIVITIES) {
          await offlineDb.put('activity_logs', act);
        }
        for (const prof of DEMO_PROFILES) {
          await offlineDb.put('profiles', prof);
        }
        for (const notif of INITIAL_SEED_NOTIFICATIONS) {
          await offlineDb.put('notifications', notif);
        }
      } else {
        const existingNotifs = await offlineDb.getAll<AppNotification>('notifications');
        if (existingNotifs.length === 0) {
          for (const notif of INITIAL_SEED_NOTIFICATIONS) {
            await offlineDb.put('notifications', notif);
          }
        }
      }
      this.initialized = true;
    } catch (err) {
      console.warn('IndexedDB initialization fallback to memory:', err);
    }
  }

  async reseedDemoData(): Promise<void> {
    for (const res of INITIAL_SEED_RESOURCES) {
      await offlineDb.put('resources', res);
    }
    for (const vol of INITIAL_SEED_VOLUNTEERS) {
      await offlineDb.put('volunteer_profiles', vol);
    }
    for (const req of INITIAL_SEED_REQUESTS) {
      await offlineDb.put('resource_requests', req);
    }
    for (const alert of INITIAL_SEED_ALERTS) {
      await offlineDb.put('emergency_alerts', alert);
    }
    for (const act of INITIAL_SEED_ACTIVITIES) {
      await offlineDb.put('activity_logs', act);
    }
    for (const notif of INITIAL_SEED_NOTIFICATIONS) {
      await offlineDb.put('notifications', notif);
    }
    this.initialized = true;
  }

  // ==========================================
  // RESOURCES MANAGEMENT (CRUD + Validation)
  // ==========================================

  async getResources(): Promise<ResourceItem[]> {
    await this.initialize();
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.from('resources').select('*');
        if (!error && data && data.length > 0) {
          return data.map(this.mapSupabaseResource);
        }
      } catch (e) {
        console.warn('Supabase fetch failed, falling back to offline:', e);
      }
    }
    return await offlineDb.getAll<ResourceItem>('resources');
  }

  async createResource(item: Omit<ResourceItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<ResourceItem> {
    await this.initialize();

    // Positive Quantity Validation
    if (item.quantity < 0) {
      throw new Error('Resource quantity cannot be negative.');
    }
    const availableQuantity = item.availableQuantity !== undefined 
      ? Math.max(0, Math.min(item.availableQuantity, item.quantity))
      : item.quantity;

    const newResource: ResourceItem = {
      ...item,
      id: 'res-' + Date.now(),
      title: item.name || item.title,
      name: item.name || item.title,
      quantity: item.quantity,
      availableQuantity,
      location: item.locationName || item.location,
      locationName: item.locationName || item.location,
      verificationStatus: item.verificationStatus || 'verified',
      updatedAt: 'Just now',
      createdAt: new Date().toISOString(),
    };

    if (isSupabaseConfigured) {
      try {
        await supabase.from('resources').insert({
          name: newResource.name,
          description: newResource.description,
          category: newResource.category,
          quantity: newResource.quantity,
          available_quantity: newResource.availableQuantity,
          availability: newResource.availability,
          latitude: newResource.latitude,
          longitude: newResource.longitude,
          owner_name: newResource.ownerName,
          owner_type: newResource.ownerType,
          location_name: newResource.locationName,
          contact_phone: newResource.contactPhone,
          verification_status: newResource.verificationStatus,
          is_emergency_eligible: newResource.isEmergencyEligible,
          condition: newResource.condition,
        });
      } catch (err) {
        console.warn('Supabase insert failed, saving to local offline DB:', err);
      }
    }

    await offlineDb.put('resources', newResource);

    // Log Activity
    await this.logActivity({
      title: `New Resource Listed: ${newResource.name}`,
      description: `${newResource.quantity} units added under ${newResource.category.replace('_', ' ')}.`,
      type: 'resource',
      actor: newResource.ownerName,
      badge: 'Resource Listed',
    });

    return newResource;
  }

  async updateResource(id: string, updates: Partial<ResourceItem>): Promise<ResourceItem> {
    await this.initialize();
    const existing = await offlineDb.getById<ResourceItem>('resources', id);
    if (!existing) {
      throw new Error(`Resource with id ${id} not found.`);
    }

    // Input Validation: prevent negative quantity
    if (updates.quantity !== undefined && updates.quantity < 0) {
      throw new Error('Quantity cannot be negative.');
    }

    const nextQuantity = updates.quantity !== undefined ? updates.quantity : existing.quantity;
    let nextAvailable = updates.availableQuantity !== undefined ? updates.availableQuantity : existing.availableQuantity;
    nextAvailable = Math.max(0, Math.min(nextAvailable, nextQuantity));

    const updated: ResourceItem = {
      ...existing,
      ...updates,
      quantity: nextQuantity,
      availableQuantity: nextAvailable,
      updatedAt: 'Just now',
    };

    if (isSupabaseConfigured) {
      try {
        await supabase.from('resources').update({
          name: updated.name,
          description: updated.description,
          category: updated.category,
          quantity: updated.quantity,
          available_quantity: updated.availableQuantity,
          availability: updated.availability,
          latitude: updated.latitude,
          longitude: updated.longitude,
          location_name: updated.locationName,
          contact_phone: updated.contactPhone,
          verification_status: updated.verificationStatus,
          is_emergency_eligible: updated.isEmergencyEligible,
          condition: updated.condition,
          updated_at: new Date().toISOString(),
        }).eq('id', id);
      } catch (e) {
        console.warn('Supabase update failed:', e);
      }
    }

    await offlineDb.put('resources', updated);
    return updated;
  }

  async deactivateResource(id: string): Promise<ResourceItem> {
    return this.updateResource(id, { 
      availability: 'deactivated', 
      status: 'deactivated',
      availableQuantity: 0 
    });
  }

  async deleteResource(id: string): Promise<void> {
    await this.initialize();
    if (isSupabaseConfigured) {
      try {
        await supabase.from('resources').delete().eq('id', id);
      } catch (e) {
        console.warn('Supabase delete error:', e);
      }
    }
    await offlineDb.delete('resources', id);
  }

  async borrowResource(id: string): Promise<ResourceItem> {
    await this.initialize();
    const existing = await offlineDb.getById<ResourceItem>('resources', id);
    if (!existing) {
      throw new Error(`Resource with id ${id} not found.`);
    }
    if (existing.availableQuantity <= 0) {
      throw new Error('No available stock to borrow.');
    }
    const newQty = existing.availableQuantity - 1;
    const updated = await this.updateResource(id, {
      availableQuantity: newQty,
      availability: newQty === 0 ? 'reserved' : existing.availability,
      status: newQty === 0 ? 'reserved' : existing.status,
    });

    await this.logActivity({
      title: `Resource Borrowed: ${existing.name}`,
      description: `1 unit allocated. ${newQty} remaining in reserve.`,
      type: 'resource',
      actor: 'Community Resident',
      badge: 'Stock Dispatched',
    });

    return updated;
  }

  async returnResource(id: string): Promise<ResourceItem> {
    await this.initialize();
    const existing = await offlineDb.getById<ResourceItem>('resources', id);
    if (!existing) {
      throw new Error(`Resource with id ${id} not found.`);
    }
    const newQty = Math.min(existing.quantity, existing.availableQuantity + 1);
    const updated = await this.updateResource(id, {
      availableQuantity: newQty,
      availability: 'available',
      status: 'available',
    });

    await this.logActivity({
      title: `Resource Returned: ${existing.name}`,
      description: `Returned to inventory. ${newQty} available now.`,
      type: 'resource',
      actor: 'Community Resident',
      badge: 'Stock Restocked',
    });

    return updated;
  }

  // ==========================================
  // VOLUNTEER MANAGEMENT
  // ==========================================

  async getVolunteers(viewerRole: UserRole = 'community_member', viewerId?: string): Promise<VolunteerProfile[]> {
    await this.initialize();
    let volunteers: VolunteerProfile[] = [];

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.from('volunteer_profiles').select('*, profiles(*)');
        if (!error && data && data.length > 0) {
          volunteers = data.map(this.mapSupabaseVolunteer);
        }
      } catch (e) {
        console.warn('Supabase volunteer fetch failed:', e);
      }
    }

    if (volunteers.length === 0) {
      volunteers = await offlineDb.getAll<VolunteerProfile>('volunteer_profiles');
    }

    // PRIVACY PROTECTION: Protect personal contact information and exact home address
    // Only administrators and the volunteer themselves can see unmasked phone and full address
    return volunteers.map(v => {
      const isPrivileged = viewerRole === 'administrator' || viewerId === v.profileId;
      if (isPrivileged) {
        return { ...v, contactProtected: false };
      }
      return {
        ...v,
        contactProtected: true,
        phone: v.phone ? v.phone.replace(/(\+\d{1,2}\s\(\d{3}\)\s)\d{3}-(\d{4})/, '$1***-$2') : '+1 (555) ***-****',
      };
    });
  }

  async updateVolunteerProfile(id: string, updates: Partial<VolunteerProfile>): Promise<VolunteerProfile> {
    await this.initialize();
    const existing = await offlineDb.getById<VolunteerProfile>('volunteer_profiles', id);
    if (!existing) {
      throw new Error(`Volunteer with id ${id} not found.`);
    }

    const updated: VolunteerProfile = {
      ...existing,
      ...updates,
    };

    if (isSupabaseConfigured) {
      try {
        await supabase.from('volunteer_profiles').update({
          skills: updated.skills,
          languages: updated.languages,
          service_area: updated.serviceArea,
          availability: updated.availability,
          missions_completed: updated.missionsCompleted,
          hours_contributed: updated.hoursContributed,
          emergency_certified: updated.emergencyCertified,
          updated_at: new Date().toISOString(),
        }).eq('id', id);
      } catch (e) {
        console.warn('Supabase volunteer update failed:', e);
      }
    }

    await offlineDb.put('volunteer_profiles', updated);
    return updated;
  }

  async verifyVolunteer(id: string, status: 'verified' | 'rejected', verifierName: string): Promise<VolunteerProfile> {
    await this.initialize();
    const vol = await offlineDb.getById<VolunteerProfile>('volunteer_profiles', id);
    if (!vol) throw new Error('Volunteer not found');

    const updated: VolunteerProfile = {
      ...vol,
      verificationStatus: status,
      verifiedBy: verifierName,
      verifiedAt: new Date().toISOString(),
    };

    await offlineDb.put('volunteer_profiles', updated);

    await this.logActivity({
      title: `Volunteer Verification Updated: ${vol.name}`,
      description: `Verification status set to ${status.toUpperCase()} by ${verifierName}.`,
      type: 'volunteer',
      actor: verifierName,
      badge: status === 'verified' ? 'Credentials Verified' : 'Verification Rejected',
    });

    return updated;
  }

  // ==========================================
  // REQUESTS & INTELLIGENT MATCHING ENGINE
  // ==========================================

  async getRequests(): Promise<CommunityRequest[]> {
    await this.initialize();
    const requests = await offlineDb.getAll<CommunityRequest>('resource_requests');
    const resources = await this.getResources();

    // Calculate match recommendations on the fly for open / matched requests
    return requests.map(req => {
      const recommendations = matchRequestToResources(req, resources);
      return {
        ...req,
        matchRecommendations: recommendations,
      };
    });
  }

  async createRequest(req: Omit<CommunityRequest, 'id' | 'timestamp' | 'status'>): Promise<CommunityRequest> {
    await this.initialize();

    const resources = await this.getResources();
    const newReq: CommunityRequest = {
      ...req,
      id: 'req-' + Date.now(),
      status: 'Open',
      quantityRequested: req.quantityRequested > 0 ? req.quantityRequested : 1,
      timestamp: 'Just now',
      location: req.locationName || req.location,
      locationName: req.locationName || req.location,
      createdAt: new Date().toISOString(),
    };

    // Calculate immediate match recommendations
    const recommendations = matchRequestToResources(newReq, resources);
    if (recommendations.length > 0 && recommendations[0].score >= 70) {
      const topMatch = recommendations[0];
      newReq.status = 'Matched';
      newReq.matchedResourceId = topMatch.resource.id;
      newReq.matchedResourceName = topMatch.resource.name;
      newReq.matchReason = topMatch.reasons.join('. ') + '.';
    }

    newReq.matchRecommendations = recommendations;

    await offlineDb.put('resource_requests', newReq);

    await this.logActivity({
      title: `New Aid Request Submitted: ${newReq.title}`,
      description: `${newReq.requesterName} requested ${newReq.quantityRequested}x under ${newReq.category.replace('_', ' ')}. Urgency: ${newReq.urgency.toUpperCase()}.`,
      type: 'request',
      actor: newReq.requesterName,
      badge: newReq.status === 'Matched' ? 'Auto-Matched' : 'Request Open',
    });

    return newReq;
  }

  /**
   * Updates request status with STRICT double-allocation prevention
   * Status transitions: Open -> Matched -> Accepted -> In Progress -> Fulfilled / Cancelled / Expired
   */
  async updateRequestStatus(
    requestId: string, 
    newStatus: RequestStatus, 
    responderName: string = 'Alex Miller',
    matchedResourceId?: string,
    notes?: string
  ): Promise<CommunityRequest> {
    await this.initialize();
    const req = await offlineDb.getById<CommunityRequest>('resource_requests', requestId);
    if (!req) throw new Error(`Request ${requestId} not found`);

    const prevStatus = req.status;
    const targetResourceId = matchedResourceId || req.matchedResourceId;
    let targetResource: ResourceItem | null = null;

    if (targetResourceId) {
      targetResource = await offlineDb.getById<ResourceItem>('resources', targetResourceId);
    }

    const qty = req.quantityRequested || 1;

    // PREVENT DOUBLE ALLOCATION LOGIC:
    // When transitioning into an active reserved state (Accepted, In Progress):
    if (['Accepted', 'In Progress'].includes(newStatus) && !['Accepted', 'In Progress'].includes(prevStatus)) {
      if (targetResource) {
        if (targetResource.availableQuantity < qty) {
          throw new Error(
            `Double allocation prevented: "${targetResource.name}" has only ${targetResource.availableQuantity} available units (requested ${qty}).`
          );
        }
        // Decrement available quantity
        await this.updateResource(targetResource.id, {
          availableQuantity: targetResource.availableQuantity - qty,
          availability: targetResource.availableQuantity - qty === 0 ? 'in_use' : 'available',
        });
        req.allocatedQuantity = qty;
      }
    }

    // RESTORE STOCK ON CANCELLATION OR EXPIRATION:
    if (['Cancelled', 'Expired'].includes(newStatus) && ['Accepted', 'In Progress'].includes(prevStatus)) {
      if (targetResource && req.allocatedQuantity) {
        await this.updateResource(targetResource.id, {
          availableQuantity: targetResource.availableQuantity + req.allocatedQuantity,
          availability: 'available',
        });
        req.allocatedQuantity = 0;
      }
    }

    // Set updated status
    const updatedReq: CommunityRequest = {
      ...req,
      status: newStatus,
      matchedResourceId: targetResourceId || req.matchedResourceId,
      matchedResourceName: targetResource ? targetResource.name : req.matchedResourceName,
      updatedAt: new Date().toISOString(),
    };

    await offlineDb.put('resource_requests', updatedReq);

    // Save response entry
    const responseLog: RequestResponse = {
      id: 'resp-' + Date.now(),
      requestId,
      responderName,
      statusChange: newStatus,
      notes: notes || `Status changed from ${prevStatus} to ${newStatus}.`,
      allocatedQuantity: updatedReq.allocatedQuantity || 0,
      createdAt: new Date().toISOString(),
    };
    await offlineDb.put('request_responses', responseLog);

    // Log Activity
    await this.logActivity({
      title: `Request #${requestId.slice(-5)} status: ${newStatus}`,
      description: `"${req.title}" updated to ${newStatus} by ${responderName}.`,
      type: 'request',
      actor: responderName,
      badge: `Status: ${newStatus}`,
    });

    return updatedReq;
  }

  // ==========================================
  // EMERGENCY ALERTS & ACTIVITY LOGS
  // ==========================================

  async getAlerts(): Promise<CommunityAlert[]> {
    await this.initialize();
    return await offlineDb.getAll<CommunityAlert>('emergency_alerts');
  }

  async createAlert(alertData: Omit<CommunityAlert, 'id' | 'timestamp' | 'verified'>): Promise<CommunityAlert> {
    await this.initialize();
    const newAlert: CommunityAlert = {
      ...alertData,
      id: 'alert-' + Date.now(),
      status: alertData.status || 'active',
      affectedArea: alertData.affectedArea || 'Cascadia Sector 4',
      emergencyType: alertData.emergencyType || 'flood',
      description: alertData.description || alertData.message,
      timestamp: 'Just now',
      verified: true,
    };
    await offlineDb.put('emergency_alerts', newAlert);

    await this.logActivity({
      title: `Emergency Siren Broadcast: ${newAlert.title}`,
      description: newAlert.message,
      type: 'emergency',
      actor: newAlert.author,
      badge: newAlert.severity.toUpperCase(),
    });

    return newAlert;
  }

  async updateAlert(id: string, updates: Partial<CommunityAlert>): Promise<CommunityAlert> {
    await this.initialize();
    const existing = await offlineDb.getById<CommunityAlert>('emergency_alerts', id);
    if (!existing) {
      throw new Error(`Alert with ID ${id} not found.`);
    }

    const updated: CommunityAlert = {
      ...existing,
      ...updates,
      id,
      updatedAt: 'Just now',
      status: updates.status || (existing.status === 'deactivated' ? 'deactivated' : 'updated'),
    };

    await offlineDb.put('emergency_alerts', updated);

    await this.logActivity({
      title: `Alert Updated: ${updated.title}`,
      description: `Parameters revised. Severity: ${updated.severity.toUpperCase()}`,
      type: 'emergency',
      actor: updates.author || existing.author,
      badge: 'ALERT_UPDATED',
    });

    return updated;
  }

  async deactivateAlert(id: string, deactivatorName: string, reason?: string): Promise<CommunityAlert> {
    await this.initialize();
    const existing = await offlineDb.getById<CommunityAlert>('emergency_alerts', id);
    if (!existing) {
      throw new Error(`Alert with ID ${id} not found.`);
    }

    const deactivated: CommunityAlert = {
      ...existing,
      status: 'deactivated',
      deactivatedAt: 'Just now',
      deactivatedBy: deactivatorName,
      deactivationReason: reason || 'Hazard situation de-escalated.',
    };

    await offlineDb.put('emergency_alerts', deactivated);

    await this.logActivity({
      title: `Alert Deactivated: ${deactivated.title}`,
      description: `Incident stood down by ${deactivatorName}. Rationale: ${deactivated.deactivationReason}`,
      type: 'emergency',
      actor: deactivatorName,
      badge: 'STAND_DOWN',
    });

    return deactivated;
  }

  async getActivities(): Promise<ActivityUpdate[]> {
    await this.initialize();
    return await offlineDb.getAll<ActivityUpdate>('activity_logs');
  }

  async logActivity(act: Omit<ActivityUpdate, 'id' | 'timestamp'>): Promise<ActivityUpdate> {
    const entry: ActivityUpdate = {
      ...act,
      id: 'act-' + Date.now(),
      timestamp: 'Just now',
    };
    try {
      await offlineDb.put('activity_logs', entry);
    } catch (e) {
      console.warn('Log activity error:', e);
    }
    return entry;
  }

  // Helper mappers for Supabase
  private mapSupabaseResource(row: any): ResourceItem {
    return {
      id: row.id,
      name: row.name,
      title: row.name,
      category: row.category,
      description: row.description || '',
      quantity: row.quantity,
      availableQuantity: row.available_quantity,
      availability: row.availability,
      status: row.availability,
      latitude: row.latitude,
      longitude: row.longitude,
      locationName: row.location_name,
      location: row.location_name,
      distance: '300m away',
      ownerId: row.owner_id,
      ownerName: row.owner_name,
      ownerType: row.owner_type,
      contactPhone: row.contact_phone || '',
      verificationStatus: row.verification_status,
      isEmergencyEligible: row.is_emergency_eligible,
      condition: row.condition,
      updatedAt: 'Recently',
    };
  }

  private mapSupabaseVolunteer(row: any): VolunteerProfile {
    return {
      id: row.id,
      profileId: row.profile_id,
      name: row.profiles?.full_name || 'Volunteer Member',
      email: row.profiles?.email || '',
      phone: row.profiles?.phone || '',
      role: row.profiles?.role || 'volunteer',
      avatar: row.profiles?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
      skills: row.skills || [],
      languages: row.languages || [],
      serviceArea: row.service_area || 'Zone 4',
      availability: row.availability || 'available',
      verificationStatus: row.verification_status || 'pending',
      verifiedBy: row.verified_by,
      verifiedAt: row.verified_at,
      missionsCompleted: row.missions_completed || 0,
      hoursContributed: row.hours_contributed || 0,
      emergencyCertified: row.emergency_certified || false,
      neighborhoodZone: row.profiles?.neighborhood_zone || 'Sector 4',
    };
  }

  // ==========================================
  // NOTIFICATIONS ENGINE (Access-Controlled, Deduplicated, Queued vs Confirmed)
  // ==========================================

  async getNotifications(userId: string): Promise<AppNotification[]> {
    await this.initialize();
    const all = await offlineDb.getAll<AppNotification>('notifications');
    // Enforce strict access policy: user can ONLY access their own notifications or broadcast alerts
    return all
      .filter(n => n.userId === userId || n.userId === 'all')
      .sort((a, b) => {
        if (a.isRead !== b.isRead) return a.isRead ? 1 : -1;
        return 0;
      });
  }

  async createNotification(notification: Omit<AppNotification, 'id' | 'timestamp'> & { id?: string; timestamp?: string }): Promise<AppNotification> {
    await this.initialize();

    // Deduplication check: prevent duplicate notifications during synchronization retries
    if (notification.deduplicationKey) {
      const all = await offlineDb.getAll<AppNotification>('notifications');
      const existing = all.find(n => n.deduplicationKey === notification.deduplicationKey);
      if (existing) {
        return existing;
      }
    }

    const newNotif: AppNotification = {
      ...notification,
      id: notification.id || 'notif-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6),
      timestamp: notification.timestamp || 'Just now',
      deliveryStatus: notification.deliveryStatus || 'locally_queued',
    };

    await offlineDb.put('notifications', newNotif);
    return newNotif;
  }

  async markNotificationAsRead(id: string, userId: string): Promise<void> {
    await this.initialize();
    const notif = await offlineDb.getById<AppNotification>('notifications', id);
    if (!notif) return;

    // Access control check
    if (notif.userId !== userId && notif.userId !== 'all') {
      throw new Error('Access denied: Cannot modify another user’s private notification.');
    }

    await offlineDb.put('notifications', { ...notif, isRead: true });
  }

  async markAllNotificationsAsRead(userId: string): Promise<void> {
    await this.initialize();
    const all = await offlineDb.getAll<AppNotification>('notifications');
    for (const notif of all) {
      if ((notif.userId === userId || notif.userId === 'all') && !notif.isRead) {
        await offlineDb.put('notifications', { ...notif, isRead: true });
      }
    }
  }

  async deleteNotification(id: string, userId: string): Promise<void> {
    await this.initialize();
    const notif = await offlineDb.getById<AppNotification>('notifications', id);
    if (!notif) return;

    // Access control check
    if (notif.userId !== userId && notif.userId !== 'all') {
      throw new Error('Access denied: Cannot delete another user’s private notification.');
    }

    await offlineDb.delete('notifications', id);
  }
}

export const dataService = new DataService();
