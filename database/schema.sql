-- Nexus CommunityOS: SQLite Local Laptop Database Schema & Seeds
-- Engine: SQLite 3.53+ (Compatible with sqlite3.exe & node:sqlite)

CREATE TABLE IF NOT EXISTS volunteers (
  id TEXT PRIMARY KEY,
  profile_id TEXT NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  role TEXT NOT NULL,
  avatar TEXT,
  skills TEXT NOT NULL, -- JSON Array
  languages TEXT NOT NULL, -- JSON Array
  service_area TEXT NOT NULL,
  availability TEXT NOT NULL DEFAULT 'available',
  verification_status TEXT NOT NULL DEFAULT 'verified',
  missions_completed INTEGER NOT NULL DEFAULT 0,
  hours_contributed INTEGER NOT NULL DEFAULT 0,
  emergency_certified INTEGER NOT NULL DEFAULT 1,
  is_first_aid_certified INTEGER NOT NULL DEFAULT 1,
  certifications TEXT NOT NULL, -- JSON Array
  neighborhood_zone TEXT NOT NULL,
  contact_protected INTEGER NOT NULL DEFAULT 0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS missions (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  urgency TEXT NOT NULL,
  location TEXT NOT NULL,
  volunteers_needed INTEGER NOT NULL,
  volunteers_enrolled TEXT NOT NULL, -- JSON Array
  description TEXT NOT NULL,
  deadline TEXT NOT NULL,
  organizer TEXT NOT NULL
);

-- Seed Authentic Real Volunteers
INSERT OR REPLACE INTO volunteers VALUES (
  'vol-1', 'usr-rachel-adams', 'Rachel Adams', 'rachel.adams@portlandhealth.org', '+1 (503) 555-0142',
  'Emergency Medical Technician & Clinic Coordinator',
  'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=160&auto=format&fit=crop&q=80',
  '["Emergency Triage","Paramedic Medicine","Pediatric First Aid","Field Sanitation"]',
  '["English","Spanish"]', 'West Hills & Central Valley District', 'available', 'verified',
  28, 184, 1, 1, '["National Registry EMT (NREMT)","BLS CPR Instructor","Wilderness First Responder"]',
  'West Valley Quadrant', 0, datetime('now')
);

INSERT OR REPLACE INTO volunteers VALUES (
  'vol-2', 'usr-thomas-wright', 'Thomas Wright', 't.wright@oregonbuilders.org', '+1 (503) 555-0189',
  'Civil Infrastructure & Structural Safety Inspector',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=160&auto=format&fit=crop&q=80',
  '["Structural Assessment","Heavy Equipment Operation","Flood Barrier Deployment","Bridge Safety"]',
  '["English"]', 'Riverfront Basin & Industrial District', 'available', 'verified',
  34, 212, 1, 1, '["Professional Civil Engineer (PE)","OSHA 30 Safety Supervisor","FEMA ICS-300"]',
  'East River Edge (Zone 2)', 0, datetime('now')
);

INSERT OR REPLACE INTO volunteers VALUES (
  'vol-3', 'usr-maria-santos', 'Maria Santos', 'maria.santos@cascadiaaid.org', '+1 (503) 555-0167',
  'Community Kitchen & Food Logistics Director',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=160&auto=format&fit=crop&q=80',
  '["Commercial Kitchen Operations","Bulk Food Distribution","Dietary Triage","Volunteer Dispatch"]',
  '["English","Spanish","Portuguese"]', 'South Metro & Hillside Communities', 'available', 'verified',
  42, 265, 1, 1, '["ServSafe Food Protection Manager","Red Cross Mass Care Operations"]',
  'Cascadia Community Core', 0, datetime('now')
);

INSERT OR REPLACE INTO volunteers VALUES (
  'vol-4', 'usr-david-miller', 'David Miller', 'david.miller@pacificpowertech.net', '+1 (503) 555-0123',
  'Renewable Microgrid Engineer & Master Electrician',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=160&auto=format&fit=crop&q=80',
  '["High-Voltage Hookups","Solar Microinverters","Generator Paralleling","Battery Storage Systems"]',
  '["English","German"]', 'Science Quarter & Highland Grid', 'on_mission', 'verified',
  22, 156, 1, 1, '["Oregon Master Electrician License","NABCEP Solar PV Specialist"]',
  'Science Quarter (Zone 3)', 0, datetime('now')
);

INSERT OR REPLACE INTO volunteers VALUES (
  'vol-5', 'usr-emily-chen', 'Emily Chen', 'emily.chen@nursingnw.org', '+1 (503) 555-0194',
  'Public Health Nurse & Elder Wellness Liaison',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=160&auto=format&fit=crop&q=80',
  '["Geriatric Care","Vaccine Administration","Medication Safety","Mental Health First Aid"]',
  '["English","Mandarin","Cantonese"]', 'Evergreen North & Downtown Corridors', 'available', 'verified',
  31, 198, 1, 1, '["Registered Nurse (BSN, RN)","Public Health Nurse Specialist"]',
  'Silverwood Senior Wing', 0, datetime('now')
);

INSERT OR REPLACE INTO volunteers VALUES (
  'vol-6', 'usr-james-wilson', 'James Wilson', 'james.wilson@amateurradio-w7nex.org', '+1 (503) 555-0115',
  'Emergency Communications Net Controller & Radio Lead',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160&auto=format&fit=crop&q=80',
  '["Ham Radio Net Control","HF/VHF Emergency Relays","Packet Radio / Winlink","Search Logistics"]',
  '["English"]', 'Regional High-Elevation Repeater Sites', 'available', 'verified',
  50, 320, 1, 1, '["FCC Amateur Extra License (W7NEX)","ARES Emergency Coordinator","COML Communications Unit Leader"]',
  'Sector 4 Communications Hub', 0, datetime('now')
);

INSERT OR REPLACE INTO volunteers VALUES (
  'vol-7', 'usr-fatima-zahra', 'Fatima Zahra', 'f.zahra@cleanwaternw.org', '+1 (503) 555-0178',
  'Hydrology Specialist & Potable Water Distribution Lead',
  'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=160&auto=format&fit=crop&q=80',
  '["Gravity Filtration","Chlorine Residual Testing","Emergency Water Bagging","Aquifer Monitoring"]',
  '["English","Arabic","French"]', 'Silver Creek & West Valley Springs', 'available', 'verified',
  19, 134, 1, 1, '["State Water Treatment Operator Grade II","Hazardous Materials First Responder"]',
  'Silver Creek Watershed', 0, datetime('now')
);

INSERT OR REPLACE INTO volunteers VALUES (
  'vol-8', 'usr-carlos-mendez', 'Carlos Mendez', 'carlos.mendez@transitsupport.org', '+1 (503) 555-0131',
  'Disaster Shelter Operations & Heavy Logistics Transport',
  'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=160&auto=format&fit=crop&q=80',
  '["Class A CDL Driving","Shelter Floor Management","Forklift Operations","ADA Accessible Transport"]',
  '["English","Spanish"]', 'Metro West & Valley Evacuation Routes', 'available', 'verified',
  36, 245, 1, 1, '["Commercial Drivers License (Class A)","FEMA National Shelter System Certified"]',
  'Valley Central Staging', 0, datetime('now')
);
