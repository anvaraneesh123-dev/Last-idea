-- ============================================================================
-- NEXUS – CommunityOS: Complete Production Database Schema & RLS Policies
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'community_member' CHECK (role IN ('community_member', 'volunteer', 'administrator')),
  avatar_url TEXT,
  phone TEXT,
  address TEXT,
  neighborhood_zone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. COMMUNITIES TABLE
CREATE TABLE IF NOT EXISTS public.communities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'neighborhood' CHECK (type IN ('neighborhood', 'apartment', 'village', 'campus', 'city')),
  location TEXT NOT NULL,
  population INT DEFAULT 0,
  emergency_readiness_score INT DEFAULT 85 CHECK (emergency_readiness_score BETWEEN 0 AND 100),
  code TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. MEMBERSHIPS TABLE
CREATE TABLE IF NOT EXISTS public.memberships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  community_id UUID NOT NULL REFERENCES public.communities(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'community_member' CHECK (role IN ('community_member', 'volunteer', 'administrator')),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(profile_id, community_id)
);

-- 4. RESOURCES TABLE (10 required categories, coordinates, validation)
CREATE TABLE IF NOT EXISTS public.resources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  community_id UUID REFERENCES public.communities(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN (
    'food',
    'water',
    'medicine',
    'hospitals',
    'shelters',
    'generators',
    'rescue_equipment',
    'volunteers',
    'tools',
    'other_services'
  )),
  quantity INT NOT NULL DEFAULT 1 CHECK (quantity >= 0),
  available_quantity INT NOT NULL DEFAULT 1 CHECK (available_quantity >= 0),
  availability TEXT NOT NULL DEFAULT 'available' CHECK (availability IN ('available', 'reserved', 'in_use', 'deactivated')),
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  owner_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  owner_name TEXT NOT NULL,
  owner_type TEXT DEFAULT 'resident' CHECK (owner_type IN ('resident', 'community_depot', 'ngo', 'management')),
  location_name TEXT NOT NULL,
  contact_phone TEXT,
  verification_status TEXT NOT NULL DEFAULT 'verified' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
  is_emergency_eligible BOOLEAN DEFAULT FALSE,
  condition TEXT DEFAULT 'Excellent' CHECK (condition IN ('Brand New', 'Excellent', 'Good')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT check_available_not_exceed_total CHECK (available_quantity <= quantity)
);

-- 5. VOLUNTEER PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.volunteer_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
  skills TEXT[] DEFAULT '{}',
  languages TEXT[] DEFAULT '{}',
  service_area TEXT NOT NULL,
  availability TEXT NOT NULL DEFAULT 'available' CHECK (availability IN ('available', 'on_mission', 'standby', 'inactive')),
  verification_status TEXT NOT NULL DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
  verified_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  verified_at TIMESTAMPTZ,
  missions_completed INT DEFAULT 0 CHECK (missions_completed >= 0),
  hours_contributed INT DEFAULT 0 CHECK (hours_contributed >= 0),
  emergency_certified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. RESOURCE REQUESTS TABLE
CREATE TABLE IF NOT EXISTS public.resource_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  community_id UUID REFERENCES public.communities(id) ON DELETE CASCADE,
  requester_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  requester_name TEXT NOT NULL,
  requester_phone TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN (
    'food',
    'water',
    'medicine',
    'hospitals',
    'shelters',
    'generators',
    'rescue_equipment',
    'volunteers',
    'tools',
    'other_services'
  )),
  quantity_requested INT NOT NULL DEFAULT 1 CHECK (quantity_requested > 0),
  urgency TEXT NOT NULL DEFAULT 'medium' CHECK (urgency IN ('low', 'medium', 'high', 'critical')),
  status TEXT NOT NULL DEFAULT 'Open' CHECK (status IN ('Open', 'Matched', 'Accepted', 'In Progress', 'Fulfilled', 'Cancelled', 'Expired')),
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  location_name TEXT NOT NULL,
  matched_resource_id UUID REFERENCES public.resources(id) ON DELETE SET NULL,
  match_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. REQUEST RESPONSES TABLE
CREATE TABLE IF NOT EXISTS public.request_responses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  request_id UUID NOT NULL REFERENCES public.resource_requests(id) ON DELETE CASCADE,
  responder_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  responder_name TEXT NOT NULL,
  status_change TEXT NOT NULL,
  notes TEXT,
  allocated_quantity INT DEFAULT 0 CHECK (allocated_quantity >= 0),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. EMERGENCY ALERTS TABLE
CREATE TABLE IF NOT EXISTS public.emergency_alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  community_id UUID REFERENCES public.communities(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('info', 'warning', 'severe', 'critical')),
  category TEXT NOT NULL DEFAULT 'safety' CHECK (category IN ('weather', 'infrastructure', 'safety', 'health', 'civic')),
  action_required TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'emergency')),
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. ACTIVITY LOGS TABLE
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  community_id UUID REFERENCES public.communities(id) ON DELETE CASCADE,
  actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  actor_name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('resource', 'volunteer', 'emergency', 'request', 'system')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  badge TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- HELPER FUNCTIONS FOR ROLE-BASED ACCESS CONTROL (RBAC)
-- ============================================================================

CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'administrator'
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_volunteer_or_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role IN ('volunteer', 'administrator')
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.communities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.volunteer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resource_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.request_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emergency_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- 1. Profiles Policies
CREATE POLICY "Public profiles are viewable by authenticated users"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id OR public.is_admin())
  WITH CHECK (auth.uid() = id OR public.is_admin());

-- 2. Communities Policies
CREATE POLICY "Communities are viewable by all authenticated users"
  ON public.communities FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only admins can manage communities"
  ON public.communities FOR ALL
  TO authenticated
  USING (public.is_admin());

-- 3. Memberships Policies
CREATE POLICY "Memberships viewable by community members"
  ON public.memberships FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can manage their memberships or admins can"
  ON public.memberships FOR ALL
  TO authenticated
  USING (auth.uid() = profile_id OR public.is_admin());

-- 4. Resources Policies
CREATE POLICY "Active resources viewable by authenticated users"
  ON public.resources FOR SELECT
  TO authenticated
  USING (availability != 'deactivated' OR auth.uid() = owner_id OR public.is_admin());

CREATE POLICY "Authenticated users can create resources"
  ON public.resources FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = owner_id OR owner_id IS NULL OR public.is_admin());

CREATE POLICY "Owners and admins can update resources"
  ON public.resources FOR UPDATE
  TO authenticated
  USING (auth.uid() = owner_id OR public.is_admin())
  WITH CHECK (auth.uid() = owner_id OR public.is_admin());

CREATE POLICY "Owners and admins can deactivate or delete resources"
  ON public.resources FOR DELETE
  TO authenticated
  USING (auth.uid() = owner_id OR public.is_admin());

-- 5. Volunteer Profiles Policies
CREATE POLICY "Volunteer profiles viewable by authenticated users"
  ON public.volunteer_profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Volunteers can register their profile"
  ON public.volunteer_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = profile_id OR public.is_admin());

CREATE POLICY "Volunteers can update their own profile, admins can verify"
  ON public.volunteer_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = profile_id OR public.is_admin())
  WITH CHECK (auth.uid() = profile_id OR public.is_admin());

-- 6. Resource Requests Policies
CREATE POLICY "Requests viewable by community members"
  ON public.resource_requests FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Members can submit requests"
  ON public.resource_requests FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = requester_id OR requester_id IS NULL OR public.is_admin());

CREATE POLICY "Requesters, assigned responders, and admins can update requests"
  ON public.resource_requests FOR UPDATE
  TO authenticated
  USING (auth.uid() = requester_id OR public.is_volunteer_or_admin())
  WITH CHECK (auth.uid() = requester_id OR public.is_volunteer_or_admin());

-- 7. Request Responses Policies
CREATE POLICY "Responses viewable by authenticated users"
  ON public.request_responses FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Volunteers and admins can create responses"
  ON public.request_responses FOR INSERT
  TO authenticated
  WITH CHECK (public.is_volunteer_or_admin());

-- 8. Emergency Alerts Policies
CREATE POLICY "Alerts viewable by everyone"
  ON public.emergency_alerts FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only admins can manage emergency alerts"
  ON public.emergency_alerts FOR ALL
  TO authenticated
  USING (public.is_admin());

-- 9. Notifications Policies
CREATE POLICY "Users can view and manage their own notifications"
  ON public.notifications FOR ALL
  TO authenticated
  USING (auth.uid() = user_id OR public.is_admin());

-- 10. Activity Logs Policies
CREATE POLICY "Activity logs viewable by all members"
  ON public.activity_logs FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Logged actions can be inserted"
  ON public.activity_logs FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- ============================================================================
-- INITIAL SAMPLE DATA SEED (For SQL Execution if desired)
-- ============================================================================
INSERT INTO public.communities (id, name, type, location, population, emergency_readiness_score, code)
VALUES 
  ('a0000000-0000-0000-0000-000000000001', 'Cascadia Green District', 'neighborhood', 'Cascadia Valley, Sector 4', 4250, 88, 'CASC-04'),
  ('a0000000-0000-0000-0000-000000000002', 'Highland Ridge Apartments', 'apartment', '1400 Highland Blvd', 980, 92, 'HGLD-02'),
  ('a0000000-0000-0000-0000-000000000003', 'Silverwood University Campus', 'campus', 'West Quad Science Sector', 12400, 84, 'UNIV-01')
ON CONFLICT (code) DO NOTHING;
