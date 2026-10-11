# Nexus – CommunityOS | Operational Handbook & Architecture

> **"The Operating System for Every Community."**
> An offline-first, crisis-resilient community operating system coordinating shared physical resources, verified volunteer corps, mutual aid triage, GIS hazard mapping, and emergency operations.

---

## 📋 Table of Contents
1. [Overview & Core Philosophy](#1-overview--core-philosophy)
2. [Quick Start & Local Setup](#2-quick-start--local-setup)
3. [Environment Variables](#3-environment-variables)
4. [Authentication Modes](#4-authentication-modes)
5. [Database Migrations & Row Level Security (RLS)](#5-database-migrations--row-level-security-rls)
6. [Offline-First PWA Architecture](#6-offline-first-pwa-architecture)
7. [Emergency Mode & Civil Defense Integrity](#7-emergency-mode--civil-defense-integrity)
8. [Notification System & Access Control](#8-notification-system--access-control)
9. [Reproducible Testing Protocols](#9-reproducible-testing-protocols)
10. [Production Deployment](#10-production-deployment)
11. [Known Limitations & Simulated Services](#11-known-limitations--simulated-services)

---

## 1. Overview & Core Philosophy

Nexus – CommunityOS is designed to operate under both normal municipal conditions and extreme grid disruptions (storms, floods, wildfires, infrastructure failures). 

### Core Tenets:
- **Zero-Dependency Resilience:** Functions 100% offline using Service Workers, Cache API, and IndexedDB local stores.
- **Safety Integrity:** Never invents unverified detour routes or declares roads safe without verified ground inspection. Complements—rather than replaces—official 911 / emergency civil defense dispatch.
- **Privacy First:** Masks private volunteer contact details for public viewers; isolates user notifications strictly to the authenticated recipient.
- **Audit Traceability:** Maintains immutable audit logs of all emergency alerts, parameter updates, hazard clearances, and stand-down actions.

---

## 2. Quick Start & Local Setup

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher

### Installation
```bash
# Clone or navigate to the repository
cd "last idea"

# Install project dependencies
npm install

# Start Vite development server
npm run dev
```
Open `http://localhost:5173/` in your browser.

### Production Build & Typecheck
```bash
# Run TypeScript type check and build client bundle
npm run build

# Preview production build locally
npm run preview
```

---

## 3. Environment Variables

Create a `.env.local` file in the project root if integrating with a remote Supabase backend:

```env
# Optional: Supabase Database and Authentication
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Application Mode
VITE_APP_ENV=production
```

> **Note on Demo Mode:** If `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are omitted, Nexus automatically activates **Demo Mode**. In Demo Mode, all data persists to the browser's local **IndexedDB** (`nexus_community_os_db`, v3), allowing full demonstration of all platform features without external credentials.

---

## 4. Authentication Modes

Nexus supports dual authentication mechanisms:

### Mode A: Demo Mode (Default, Zero-Config)
- Provides immediate pre-authenticated demo personas:
  - **Sarah Jenkins** (Administrator — full EOC command, alert verification, and audit access)
  - **Dr. Elena Rostova** (Volunteer — first responder certified, mission triage)
  - **Alex Miller** (Community Member — resource requester and borrower)
- Switch personas anytime using the user dropdown menu in the top navigation bar.
- Supports instant self-registration and local profile persistence in IndexedDB.

### Mode B: Remote Supabase Auth
- Uses Supabase JWT session authentication (`supabase.auth`).
- Persists user profiles to the `public.profiles` database table.
- Enforces Row Level Security (RLS) rules at the PostgreSQL layer.

---

## 5. Database Migrations & Row Level Security (RLS)

When deploying to Supabase or PostgreSQL, execute the following SQL schema migration:

```sql
-- 1. Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT DEFAULT 'community_member' CHECK (role IN ('administrator', 'volunteer', 'community_member')),
  avatar_url TEXT,
  phone TEXT,
  address TEXT,
  neighborhood_zone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Resources Catalog
CREATE TABLE IF NOT EXISTS public.resources (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  quantity INTEGER NOT NULL CHECK (quantity >= 0),
  available_quantity INTEGER NOT NULL CHECK (available_quantity >= 0),
  availability TEXT DEFAULT 'available',
  latitude NUMERIC(10, 6),
  longitude NUMERIC(10, 6),
  location_name TEXT,
  owner_id UUID REFERENCES public.profiles(id),
  owner_name TEXT NOT NULL,
  owner_type TEXT DEFAULT 'resident',
  contact_phone TEXT,
  verification_status TEXT DEFAULT 'verified',
  is_emergency_eligible BOOLEAN DEFAULT false,
  condition TEXT DEFAULT 'Good',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Volunteer Profiles
CREATE TABLE IF NOT EXISTS public.volunteer_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID REFERENCES public.profiles(id) UNIQUE,
  skills TEXT[] DEFAULT '{}',
  languages TEXT[] DEFAULT '{}',
  service_area TEXT,
  availability TEXT DEFAULT 'available',
  verification_status TEXT DEFAULT 'pending',
  verified_by TEXT,
  verified_at TIMESTAMPTZ,
  missions_completed INTEGER DEFAULT 0,
  hours_contributed NUMERIC DEFAULT 0,
  emergency_certified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Resource Requests
CREATE TABLE IF NOT EXISTS public.resource_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  requester_id UUID REFERENCES public.profiles(id),
  requester_name TEXT NOT NULL,
  requester_phone TEXT NOT NULL,
  title TEXT NOT NULL,
  details TEXT NOT NULL,
  category TEXT NOT NULL,
  type TEXT NOT NULL,
  quantity_requested INTEGER DEFAULT 1,
  urgency TEXT DEFAULT 'medium',
  status TEXT DEFAULT 'Open',
  latitude NUMERIC(10, 6),
  longitude NUMERIC(10, 6),
  location TEXT NOT NULL,
  matched_resource_id UUID REFERENCES public.resources(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Emergency Alerts & Bulletins
CREATE TABLE IF NOT EXISTS public.emergency_alerts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  description TEXT,
  severity TEXT NOT NULL CHECK (severity IN ('info', 'warning', 'severe', 'critical')),
  emergency_type TEXT NOT NULL CHECK (emergency_type IN ('flood', 'fire', 'severe_weather', 'infrastructure_failure', 'other')),
  affected_area TEXT NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'updated', 'deactivated')),
  author TEXT NOT NULL,
  verified BOOLEAN DEFAULT true,
  action_required TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deactivated_at TIMESTAMPTZ,
  deactivated_by TEXT,
  deactivation_reason TEXT
);

-- 6. Notifications Table (Isolated & Deduplicated)
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL, -- UUID or 'all' for broadcast dispatches
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  link_url TEXT,
  related_record_id TEXT,
  delivery_status TEXT DEFAULT 'server_confirmed',
  deduplication_key TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.volunteer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resource_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emergency_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- 8. Policies
-- Notifications: Users only read their own notifications or broadcast alerts
CREATE POLICY "Users read own notifications" ON public.notifications
  FOR SELECT USING (auth.uid()::text = user_id OR user_id = 'all');

CREATE POLICY "Users update own notifications" ON public.notifications
  FOR UPDATE USING (auth.uid()::text = user_id OR user_id = 'all');

-- Resources: Publicly readable, authenticated write
CREATE POLICY "Public read resources" ON public.resources FOR SELECT USING (true);
CREATE POLICY "Auth insert resources" ON public.resources FOR INSERT WITH CHECK (auth.role() = 'authenticated');
```

---

## 6. Offline-First PWA Architecture

### Service Worker (`public/sw.js`)
- Caches the Application Shell (`/`, `/index.html`, styles, icons, fonts) using a Cache-First strategy.
- Serves an offline fallback page when navigating while disconnected.
- Intercepts API requests with a Network-First, Cache-Fallback strategy.

### Web App Manifest (`public/manifest.webmanifest`)
- Configured for standalone progressive web app installation on desktop and mobile.
- Custom theme colors, application icons, and display orientation settings.

### IndexedDB Storage Engine (`nexus_community_os_db`, v3)
Stores maintained locally:
- `resources`: Complete offline resource catalog.
- `volunteer_profiles`: Certified responder roster with privacy masking.
- `resource_requests`: Local request tickets and drafts.
- `emergency_alerts`: Active civil bulletins and stood-down archive.
- `hazard_reports`: Blocked roads and field hazards.
- `emergency_audit_logs`: Audit trail for all emergency operations.
- `notifications`: User notifications with read/unread flags.
- `sync_queue`: Outbox queue for offline mutations.

### Idempotency & Conflict Resolution
- Offline items receive unique client-generated keys (e.g. `req-draft-[timestamp]`).
- On reconnection, the sync engine checks for duplicate submissions using content hashing and client IDs.
- Local drafts are replaced with server-confirmed records without duplicating records in user feeds.
- Mutations retry up to 5 times with exponential backoff before transitioning to `sync_failed`.

---

## 7. Emergency Mode & Civil Defense Integrity

### Operational Rules
1. **Civil Defense Complement:** Nexus complements, rather than replaces, official emergency civil defense systems (911 / municipal first responders). A permanent notice banner is displayed on emergency screens.
2. **Ground Truth Integrity:** The system never invents automated safe routes or claims uninspected roads are safe. Road closures and hazards must be verified on the ground before transit.
3. **Deactivation Safeguards:** Standing down an active emergency or deactivating a civil bulletin requires explicit administrator confirmation and mandatory field verification notes.
4. **Audit History:** Every alert creation, update, and deactivation records actor, role, timestamp, affected area, and rationale in `emergency_audit_logs`.

---

## 8. Notification System & Access Control

### Notification Types
- `emergency_alert`: Broadcast civil emergency warnings (severe weather, floods, fires).
- `request_response`: Responder offers and fulfillment matching.
- `request_status_change`: Progression from Open → Matched → In Progress → Fulfilled.
- `resource_availability`: Inventory threshold warnings for critical assets.
- `volunteer_assignment`: Squad mission enrollment and staging notices.

### Access Control
- Notifications are strictly partitioned by `userId`. Users can only inspect their own personal notifications or broadcast civil alerts.
- Dedicated `NotificationsModal` component accessible via the navigation bell icon with unread count indicators, filter tabs, read/unread states, and direct record navigation.

---

## 9. Reproducible Testing Protocols

### Automated 5-Step Offline Test Suite
The platform includes an automated end-to-end test runner in the **Offline Operations & Mesh Sync Center**:
1. Click the **Network Status Pill** (Online / Offline) in the top navbar.
2. In the modal, click **"Run Reproducible Offline Test Suite"**.
3. The automated test executes and validates 5 consecutive assertions:
   - **Step 1:** Caches sample resource catalog into IndexedDB.
   - **Step 2:** Disconnects network simulation (`isOffline = true`).
   - **Step 3:** Browses and verifies retrieval of cached resources while disconnected.
   - **Step 4:** Creates a draft aid request locally in the Outbox (`sync_queue`).
   - **Step 5:** Reconnects network and executes idempotent synchronization, confirming 0 duplicate records.

---

## 10. Production Deployment

### Deploying to Vercel
1. Ensure `vercel.json` is in the project root (configured with SPA rewrites and PWA cache headers).
2. Connect your Git repository to Vercel or deploy via CLI:
   ```bash
   npx vercel deploy --prod
   ```
3. Set Environment Variables in the Vercel Dashboard if using Supabase:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

### Deploying to Netlify
Create `public/_redirects`:
```
/*    /index.html   200
```
Run `npm run build` with publish directory `dist`.

---

## 11. Known Limitations & Simulated Services

| Feature | Operational Status | Production Requirement |
|---|---|---|
| **Local Cache & Storage** | **100% Fully Functional** | Operates client-side via IndexedDB and Cache API |
| **Emergency Mode & Audit Trail** | **100% Fully Functional** | Operates client-side with full persistence |
| **GIS Hazard Mapping** | **100% Fully Functional** | Operates client-side with community review workflows |
| **AI Assistant Engine** | **100% Fully Functional** | Rule-based local NLP matching engine |
| **In-App Notifications** | **100% Fully Functional** | Operates client-side with user access isolation |
| **SMS Siren Broadcast** | **Simulated (Demo Mode)** | Requires Twilio, AWS SNS, or telecom gateway integration |
| **Automated Email Digests** | **Simulated (Demo Mode)** | Requires SendGrid, Resend, or SMTP gateway credentials |
| **Hardware LoRa Mesh** | **Simulated Protocol UI** | Requires physical LoRa USB/serial dongle or ESP32 bridge |

---

## ⚖️ Safety & Legal Notice
Nexus – CommunityOS is designed to empower community self-reliance and mutual aid coordination. It is not an authorized replacement for municipal 911 dispatch, civil defense sirens, or professional medical response. In immediate life-threatening crises, contact official emergency services immediately.
