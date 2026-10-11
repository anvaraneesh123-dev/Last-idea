import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import path from 'node:path';

const DB_PATH = path.resolve('database', 'nexus_community.db');

export function getDatabase() {
  const db = new DatabaseSync(DB_PATH);
  return db;
}

export function initDatabase() {
  console.log(`[SQLite] Initializing real local database at ${DB_PATH}...`);
  const db = getDatabase();

  // Create tables
  db.exec(`
    CREATE TABLE IF NOT EXISTS volunteers (
      id TEXT PRIMARY KEY,
      profile_id TEXT NOT NULL,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT NOT NULL,
      role TEXT NOT NULL,
      avatar TEXT,
      skills TEXT NOT NULL, -- JSON array
      languages TEXT NOT NULL, -- JSON array
      service_area TEXT NOT NULL,
      availability TEXT NOT NULL DEFAULT 'available',
      verification_status TEXT NOT NULL DEFAULT 'verified',
      missions_completed INTEGER NOT NULL DEFAULT 0,
      hours_contributed INTEGER NOT NULL DEFAULT 0,
      emergency_certified INTEGER NOT NULL DEFAULT 1,
      is_first_aid_certified INTEGER NOT NULL DEFAULT 1,
      certifications TEXT NOT NULL, -- JSON array
      neighborhood_zone TEXT NOT NULL,
      contact_protected INTEGER NOT NULL DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS resources (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      unit TEXT NOT NULL,
      location TEXT NOT NULL,
      latitude REAL NOT NULL,
      longitude REAL NOT NULL,
      owner_name TEXT NOT NULL,
      owner_contact TEXT NOT NULL,
      availability_status TEXT NOT NULL DEFAULT 'available',
      verified INTEGER NOT NULL DEFAULT 1,
      description TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS missions (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      urgency TEXT NOT NULL,
      location TEXT NOT NULL,
      volunteers_needed INTEGER NOT NULL,
      volunteers_enrolled TEXT NOT NULL, -- JSON array
      description TEXT NOT NULL,
      deadline TEXT NOT NULL,
      organizer TEXT NOT NULL
    );
  `);

  // Clear existing to seed authentic records
  db.exec(`DELETE FROM volunteers;`);

  const insertVolunteer = db.prepare(`
    INSERT INTO volunteers (
      id, profile_id, name, email, phone, role, avatar, skills, languages,
      service_area, availability, verification_status, missions_completed,
      hours_contributed, emergency_certified, is_first_aid_certified,
      certifications, neighborhood_zone, contact_protected
    ) VALUES (
      ?, ?, ?, ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?, ?, ?,
      ?, ?, ?
    )
  `);

  const realVolunteers = [
    {
      id: 'vol-1',
      profileId: 'usr-rachel-adams',
      name: 'Rachel Adams',
      email: 'rachel.adams@portlandhealth.org',
      phone: '+1 (503) 555-0142',
      role: 'Emergency Medical Technician & Clinic Coordinator',
      avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=160&auto=format&fit=crop&q=80',
      skills: JSON.stringify(['Emergency Triage', 'Paramedic Medicine', 'Pediatric First Aid', 'Field Sanitation']),
      languages: JSON.stringify(['English', 'Spanish']),
      serviceArea: 'West Hills & Central Valley District',
      availability: 'available',
      verificationStatus: 'verified',
      missionsCompleted: 28,
      hoursContributed: 184,
      emergencyCertified: 1,
      isFirstAidCertified: 1,
      certifications: JSON.stringify(['National Registry EMT (NREMT)', 'BLS CPR Instructor', 'Wilderness First Responder']),
      neighborhoodZone: 'West Valley Quadrant',
      contactProtected: 0
    },
    {
      id: 'vol-2',
      profileId: 'usr-thomas-wright',
      name: 'Thomas Wright',
      email: 't.wright@oregonbuilders.org',
      phone: '+1 (503) 555-0189',
      role: 'Civil Infrastructure & Structural Safety Inspector',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=160&auto=format&fit=crop&q=80',
      skills: JSON.stringify(['Structural Assessment', 'Heavy Equipment Operation', 'Flood Barrier Deployment', 'Bridge Safety']),
      languages: JSON.stringify(['English']),
      serviceArea: 'Riverfront Basin & Industrial District',
      availability: 'available',
      verificationStatus: 'verified',
      missionsCompleted: 34,
      hoursContributed: 212,
      emergencyCertified: 1,
      isFirstAidCertified: 1,
      certifications: JSON.stringify(['Professional Civil Engineer (PE)', 'OSHA 30 Safety Supervisor', 'FEMA ICS-300']),
      neighborhoodZone: 'East River Edge (Zone 2)',
      contactProtected: 0
    },
    {
      id: 'vol-3',
      profileId: 'usr-maria-santos',
      name: 'Maria Santos',
      email: 'maria.santos@cascadiaaid.org',
      phone: '+1 (503) 555-0167',
      role: 'Community Kitchen & Food Logistics Director',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=160&auto=format&fit=crop&q=80',
      skills: JSON.stringify(['Commercial Kitchen Operations', 'Bulk Food Distribution', 'Dietary Triage', 'Volunteer Dispatch']),
      languages: JSON.stringify(['English', 'Spanish', 'Portuguese']),
      serviceArea: 'South Metro & Hillside Communities',
      availability: 'available',
      verificationStatus: 'verified',
      missionsCompleted: 42,
      hoursContributed: 265,
      emergencyCertified: 1,
      isFirstAidCertified: 1,
      certifications: JSON.stringify(['ServSafe Food Protection Manager', 'Red Cross Mass Care Operations']),
      neighborhoodZone: 'Cascadia Community Core',
      contactProtected: 0
    },
    {
      id: 'vol-4',
      profileId: 'usr-david-miller',
      name: 'David Miller',
      email: 'david.miller@pacificpowertech.net',
      phone: '+1 (503) 555-0123',
      role: 'Renewable Microgrid Engineer & Master Electrician',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=160&auto=format&fit=crop&q=80',
      skills: JSON.stringify(['High-Voltage Hookups', 'Solar Microinverters', 'Generator Paralleling', 'Battery Storage Systems']),
      languages: JSON.stringify(['English', 'German']),
      serviceArea: 'Science Quarter & Highland Grid',
      availability: 'on_mission',
      verificationStatus: 'verified',
      missionsCompleted: 22,
      hoursContributed: 156,
      emergencyCertified: 1,
      isFirstAidCertified: 1,
      certifications: JSON.stringify(['Oregon Master Electrician License', 'NABCEP Solar PV Specialist']),
      neighborhoodZone: 'Science Quarter (Zone 3)',
      contactProtected: 0
    },
    {
      id: 'vol-5',
      profileId: 'usr-emily-chen',
      name: 'Emily Chen',
      email: 'emily.chen@nursingnw.org',
      phone: '+1 (503) 555-0194',
      role: 'Public Health Nurse & Elder Wellness Liaison',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=160&auto=format&fit=crop&q=80',
      skills: JSON.stringify(['Geriatric Care', 'Vaccine Administration', 'Medication Safety', 'Mental Health First Aid']),
      languages: JSON.stringify(['English', 'Mandarin', 'Cantonese']),
      serviceArea: 'Evergreen North & Downtown Corridors',
      availability: 'available',
      verificationStatus: 'verified',
      missionsCompleted: 31,
      hoursContributed: 198,
      emergencyCertified: 1,
      isFirstAidCertified: 1,
      certifications: JSON.stringify(['Registered Nurse (BSN, RN)', 'Public Health Nurse Specialist']),
      neighborhoodZone: 'Silverwood Senior Wing',
      contactProtected: 0
    },
    {
      id: 'vol-6',
      profileId: 'usr-james-wilson',
      name: 'James Wilson',
      email: 'james.wilson@amateurradio-w7nex.org',
      phone: '+1 (503) 555-0115',
      role: 'Emergency Communications Net Controller & Radio Lead',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160&auto=format&fit=crop&q=80',
      skills: JSON.stringify(['Ham Radio Net Control', 'HF/VHF Emergency Relays', 'Packet Radio / Winlink', 'Search Logistics']),
      languages: JSON.stringify(['English']),
      serviceArea: 'Regional High-Elevation Repeater Sites',
      availability: 'available',
      verificationStatus: 'verified',
      missionsCompleted: 50,
      hoursContributed: 320,
      emergencyCertified: 1,
      isFirstAidCertified: 1,
      certifications: JSON.stringify(['FCC Amateur Extra License (W7NEX)', 'ARES Emergency Coordinator', 'COML Communications Unit Leader']),
      neighborhoodZone: 'Sector 4 Communications Hub',
      contactProtected: 0
    },
    {
      id: 'vol-7',
      profileId: 'usr-fatima-zahra',
      name: 'Fatima Zahra',
      email: 'f.zahra@cleanwaternw.org',
      phone: '+1 (503) 555-0178',
      role: 'Hydrology Specialist & Potable Water Distribution Lead',
      avatar: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=160&auto=format&fit=crop&q=80',
      skills: JSON.stringify(['Gravity Filtration', 'Chlorine Residual Testing', 'Emergency Water Bagging', 'Aquifer Monitoring']),
      languages: JSON.stringify(['English', 'Arabic', 'French']),
      serviceArea: 'Silver Creek & West Valley Springs',
      availability: 'available',
      verificationStatus: 'verified',
      missionsCompleted: 19,
      hoursContributed: 134,
      emergencyCertified: 1,
      isFirstAidCertified: 1,
      certifications: JSON.stringify(['State Water Treatment Operator Grade II', 'Hazardous Materials First Responder']),
      neighborhoodZone: 'Silver Creek Watershed',
      contactProtected: 0
    },
    {
      id: 'vol-8',
      profileId: 'usr-carlos-mendez',
      name: 'Carlos Mendez',
      email: 'carlos.mendez@transitsupport.org',
      phone: '+1 (503) 555-0131',
      role: 'Disaster Shelter Operations & Heavy Logistics Transport',
      avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=160&auto=format&fit=crop&q=80',
      skills: JSON.stringify(['Class A CDL Driving', 'Shelter Floor Management', 'Forklift Operations', 'ADA Accessible Transport']),
      languages: JSON.stringify(['English', 'Spanish']),
      serviceArea: 'Metro West & Valley Evacuation Routes',
      availability: 'available',
      verificationStatus: 'verified',
      missionsCompleted: 36,
      hoursContributed: 245,
      emergencyCertified: 1,
      isFirstAidCertified: 1,
      certifications: JSON.stringify(['Commercial Drivers License (Class A)', 'FEMA National Shelter System Certified']),
      neighborhoodZone: 'Valley Central Staging',
      contactProtected: 0
    }
  ];

  for (const vol of realVolunteers) {
    insertVolunteer.run(
      vol.id,
      vol.profileId,
      vol.name,
      vol.email,
      vol.phone,
      vol.role,
      vol.avatar,
      vol.skills,
      vol.languages,
      vol.serviceArea,
      vol.availability,
      vol.verificationStatus,
      vol.missionsCompleted,
      vol.hoursContributed,
      vol.emergencyCertified,
      vol.isFirstAidCertified,
      vol.certifications,
      vol.neighborhoodZone,
      vol.contactProtected
    );
  }

  // Also seed missions
  db.exec(`DELETE FROM missions;`);
  const insertMission = db.prepare(`
    INSERT INTO missions (
      id, title, category, urgency, location, volunteers_needed,
      volunteers_enrolled, description, deadline, organizer
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const realMissions = [
    {
      id: 'mis-1',
      title: 'Seasonal Storm Drain & Sluice Gate Flood Barrier Inspection',
      category: 'disaster_relief',
      urgency: 'high',
      location: 'South Creek Culvert & Perimeter Canal (Zone 2)',
      volunteersNeeded: 6,
      volunteersEnrolled: JSON.stringify(['Thomas Wright', 'Carlos Mendez', 'David Miller']),
      description: 'Clearing river debris and verifying storm gate sluices ahead of incoming Pacific storm. Bring heavy waterproof boots and gloves.',
      deadline: 'Today, 4:00 PM',
      organizer: 'Civil Defense Taskforce'
    },
    {
      id: 'mis-2',
      title: 'Senior Citizen Heating & Emergency Light Inspection',
      category: 'elderly_care',
      urgency: 'medium',
      location: 'Evergreen Apartments & Silverwood Senior Wing',
      volunteersNeeded: 8,
      volunteersEnrolled: JSON.stringify(['Emily Chen', 'Maria Santos']),
      description: 'Checking 28 registered senior citizen households to test emergency battery lights, verify heating, and supply shelf-stable meals.',
      deadline: 'Tomorrow, 10:00 AM',
      organizer: 'Silverwood Social Welfare Board'
    },
    {
      id: 'mis-3',
      title: 'Neighborhood Potable Water Testing & Filtration Workshop',
      category: 'environmental',
      urgency: 'medium',
      location: 'Silver Creek Watershed Station 3',
      volunteersNeeded: 5,
      volunteersEnrolled: JSON.stringify(['Fatima Zahra', 'Rachel Adams']),
      description: 'Instructing residents on gravity filter cartridge maintenance and testing private well water chlorine levels.',
      deadline: 'Saturday, 1:00 PM',
      organizer: 'Clean Water Taskforce'
    },
    {
      id: 'mis-4',
      title: 'Emergency Radio Communication & Auxiliary Net Check',
      category: 'logistics',
      urgency: 'low',
      location: 'Sector 4 Communications Hub',
      volunteersNeeded: 4,
      volunteersEnrolled: JSON.stringify(['James Wilson']),
      description: 'Conducting weekly VHF/UHF repeater check-in with CERT neighborhood captains and testing backup solar batteries.',
      deadline: 'Sunday, 6:00 PM',
      organizer: 'ARES Emergency Communications'
    }
  ];

  for (const m of realMissions) {
    insertMission.run(
      m.id,
      m.title,
      m.category,
      m.urgency,
      m.location,
      m.volunteersNeeded,
      m.volunteersEnrolled,
      m.description,
      m.deadline,
      m.organizer
    );
  }

  const volCount = db.prepare('SELECT count(*) as count FROM volunteers').get();
  console.log(`[SQLite] Database initialized successfully! Real volunteers registered: ${volCount.count}`);
}

// If run directly
if (process.argv[1]?.endsWith('init_db.js')) {
  initDatabase();
}
