import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useCommunity } from '../context/CommunityContext';
import { 
  ShieldAlert, 
  Sparkles, 
  ArrowRight, 
  HeartHandshake, 
  PackageSearch, 
  Users, 
  RadioTower, 
  MapPin, 
  CheckCircle2, 
  Activity, 
  Zap, 
  HeartPulse, 
  Droplet, 
  Home, 
  ShieldCheck, 
  Building2, 
  ChevronRight, 
  ExternalLink,
  Flame,
  Waves,
  Sun,
  Moon,
  Star,
  Layers,
  ArrowUpRight,
  Send,
  AlertTriangle,
  Play
} from 'lucide-react';

interface LandingPageProps {
  onOpenVolunteerModal?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = () => {
  const { 
    isDarkMode, 
    toggleDarkMode, 
    isEmergencyMode, 
    toggleEmergencyMode,
    currentCommunity 
  } = useCommunity();

  // Interactive node selector in the hero world visualization
  const [activeNode, setActiveNode] = useState<string>('aed');
  // Interactive preview in the emergency section
  const [previewEmergency, setPreviewEmergency] = useState<boolean>(false);
  // Email waitlist demo
  const [emailInput, setEmailInput] = useState('');
  const [emailSubmitted, setEmailSubmitted] = useState(false);

  const communityNodes = [
    {
      id: 'aed',
      label: 'Trauma AED & Defibrillator',
      category: 'Medical',
      icon: HeartPulse,
      x: 34,
      y: 42,
      color: 'bg-rose-500 text-white shadow-rose-500/50',
      tagColor: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
      description: 'Philips HeartStart FRx bilingual voice-guided unit. Located at Clubhouse Lobby, available 24/7.',
      status: 'Ready • 100% Battery',
      distance: '150m away',
    },
    {
      id: 'generator',
      label: 'Honda Inverter Generator 2200W',
      category: 'Power & Energy',
      icon: Zap,
      x: 66,
      y: 32,
      color: 'bg-amber-500 text-white shadow-amber-500/50',
      tagColor: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
      description: 'Clean-sine inverter power reserved for home oxygen concentrators and insulin refrigeration.',
      status: 'Available • Full Fuel Tank',
      distance: '320m away',
    },
    {
      id: 'volunteer',
      label: 'Dr. Elena Rostova (ER Lead)',
      category: 'Certified Responder',
      icon: Users,
      x: 52,
      y: 62,
      color: 'bg-teal-500 text-white shadow-teal-500/50',
      tagColor: 'text-teal-400 bg-teal-500/10 border-teal-500/20',
      description: 'Board-certified emergency physician with trauma backpack & FEMA ICS credentials on standby.',
      status: 'Active On Duty • 4 mins ETA',
      distance: 'Sector A',
    },
    {
      id: 'shelter',
      label: 'Primary Emergency Shelter',
      category: 'Shelter & Warmth',
      icon: Home,
      x: 78,
      y: 58,
      color: 'bg-purple-500 text-white shadow-purple-500/50',
      tagColor: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
      description: '240 insulated cots with satellite Starlink backup internet, heat pumps, and hot meal kits.',
      status: 'Operational • 72% Available',
      distance: 'Civic Rec Center',
    },
    {
      id: 'water',
      label: 'Gravity Water Purifier Depot',
      category: 'Sustenance',
      icon: Droplet,
      x: 22,
      y: 68,
      color: 'bg-cyan-500 text-white shadow-cyan-500/50',
      tagColor: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
      description: '1,200 gallon multi-stage gravity filtration station providing pathogen-free drinking water.',
      status: 'Active • 4 Taps Open',
      distance: 'Co-op Gardens',
    },
  ];

  const selectedNodeData = communityNodes.find(n => n.id === activeNode) || communityNodes[0];

  const partners = [
    { name: 'FEMA Innovation Labs', label: 'Resilience Partner' },
    { name: 'Red Cross Disaster Tech', label: 'Certified Protocols' },
    { name: 'Urban Resilience Alliance', label: 'Smart City Network' },
    { name: 'OpenMesh Foundation', label: 'Decentralized Comms' },
    { name: 'National Neighborhood Watch', label: 'Civic Integration' },
    { name: 'Mutual Aid Global', label: 'Volunteer Protocol' },
  ];

  const statistics = [
    { value: '520,000+', label: 'Citizens Protected', sub: 'Across 4,200+ neighborhoods' },
    { value: '18,400+', label: 'Certified Volunteers', sub: 'Doctors, electricians & rescuers' },
    { value: '< 3.8 Mins', label: 'Average Emergency Response', sub: 'Local neighbor-to-neighbor speed' },
    { value: '99.98%', label: 'Offline Mesh Uptime', sub: 'Zero outage during regional blackouts' },
  ];

  const features = [
    {
      icon: ShieldAlert,
      title: 'Disaster Emergency Mode',
      description: 'Instantly elevates critical life-saving assets, distress SOS broadcast triage, and emergency shelter routing during extreme events.',
      badge: 'Signature Feature',
      highlight: true,
    },
    {
      icon: PackageSearch,
      title: 'Intelligent Resource Pooling',
      description: 'Share and borrow power generators, automated defibrillators, wheelchairs, sump pumps, and chainsaws with zero rental fees.',
      badge: 'Resource Hub',
    },
    {
      icon: HeartHandshake,
      title: 'Certified Volunteer Corps',
      description: 'Directly mobilize verified physicians, electricians, and search-and-rescue specialists with hands-on credential verification.',
      badge: 'Mutual Aid',
    },
    {
      icon: MapPin,
      title: 'Tactical GIS Locator',
      description: 'Offline-ready vector GIS mapping of AEDs, sandbag distribution caches, potable water taps, and emergency gathering hubs.',
      badge: 'Spatial Intelligence',
    },
    {
      icon: RadioTower,
      title: 'Decentralized LoRa Mesh',
      description: 'Peer-to-peer telemetry keeps citizens connected over radio mesh even when commercial cell towers and grid electricity fail.',
      badge: 'Offline-First',
    },
    {
      icon: Activity,
      title: 'Civic Democracy & Ballots',
      description: 'Direct community voting on equipment reserves, disaster fund allocations, and townhall assembly agenda topics.',
      badge: 'Governance',
    },
  ];

  const howItWorks = [
    {
      step: '01',
      title: 'Connect Your Community Cluster',
      description: 'Onboard your neighborhood, condominium tower, university campus, or rural village with customized sector boundaries and keycodes.',
    },
    {
      step: '02',
      title: 'Catalog Critical Equipment & Skills',
      description: 'Residents register shared power tools, emergency generators, medical kits, and professional skillsets (CPR, electrical, trauma care).',
    },
    {
      step: '03',
      title: 'Coordinate Daily & Crisis Needs',
      description: 'Discover nearby resources during normal weeks. Mobilize volunteer squads for senior welfare checks, drainage repairs, and training.',
    },
    {
      step: '04',
      title: 'Automatic Disaster Mode Elevation',
      description: 'When severe weather or grid failures hit, Nexus transforms into an emergency triage operations center with priority dispatch.',
    },
  ];

  const testimonials = [
    {
      quote: "When the Pacific atmospheric river flooded our creek, 911 was completely overwhelmed with a 2-hour wait. Nexus mobilized four neighborhood sump pumps and evacuated two elderly residents in 18 minutes.",
      author: "Chief Robert Tanaka",
      role: "Municipal Emergency Coordinator & Volunteer Battalion Lead",
      community: "Silverwood Metro District",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    },
    {
      quote: "Our 480-unit apartment tower lost power for 36 hours. Through Nexus, we coordinated 3 portable generators for oxygen-dependent residents and tracked everyone safely floor by floor.",
      author: "Elena Rostova, MD",
      role: "Emergency Physician & HOA Resilience Director",
      community: "Cascadia Waterfront Towers",
      avatar: "https://images.unsplash.com/photo-1594824813575-52010c7e0cfa?w=150&auto=format&fit=crop&q=80",
    },
    {
      quote: "Nexus replaced messy Facebook groups and lost WhatsApp chats with a true operating system. Equipment borrowing is seamless, and our community readiness score jumped from 42% to 94%.",
      author: "Marcus Chen",
      role: "Licensed Master Electrician & Village Council Member",
      community: "Evergreen Valley Township",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    },
  ];

  const handleWaitlistSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim()) return;
    setEmailSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F19] text-slate-900 dark:text-slate-100 transition-colors selection:bg-teal-500/20 selection:text-teal-600 dark:selection:text-teal-300 overflow-x-hidden">
      
      {/* Top Funded Startup Navbar */}
      <nav className="sticky top-0 z-50 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-18">
            
            {/* Brand Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 via-teal-500 to-cyan-400 p-0.5 shadow-lg shadow-teal-500/25 group-hover:shadow-teal-500/50 transition-shadow">
                <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                  <span className="font-black text-transparent bg-clip-text bg-gradient-to-tr from-cyan-400 to-teal-200 text-base tracking-tighter">
                    NX
                  </span>
                </div>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-lg font-black tracking-tight text-slate-900 dark:text-white">
                    Nexus
                  </span>
                  <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-full bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20">
                    CommunityOS
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 -mt-0.5 font-medium">
                  The OS for Every Community
                </p>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden lg:flex items-center gap-8 text-xs font-semibold text-slate-600 dark:text-slate-300">
              <a href="#features" className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors">
                Platform Features
              </a>
              <a href="#world-map" className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors">
                Community Mesh
              </a>
              <a href="#emergency-preview" className="hover:text-red-500 dark:hover:text-red-400 transition-colors flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <span>Emergency Mode</span>
              </a>
              <a href="#how-it-works" className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors">
                How It Works
              </a>
              <a href="#testimonials" className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors">
                Testimonials
              </a>
            </div>

            {/* Right: Theme Toggle & Launch App CTA */}
            <div className="flex items-center gap-3">
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                aria-label="Toggle Theme"
              >
                {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
              </button>

              <Link
                to="/"
                className="hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/80 border border-slate-200 dark:border-slate-800 transition-colors"
              >
                <span>Live OS Demo</span>
              </Link>

              <Link
                to="/dashboard"
                className="px-4.5 py-2 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-slate-950 font-extrabold text-xs shadow-lg shadow-teal-500/25 active:scale-95 transition-all flex items-center gap-1.5"
              >
                <span>Launch CommunityOS</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

          </div>
        </div>
      </nav>

      {/* 1. HERO SECTION */}
      <section className="relative pt-12 pb-20 lg:pt-20 lg:pb-32 overflow-hidden">
        {/* Modern Ambient Radial Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-gradient-to-tr from-teal-500/15 via-blue-600/15 to-transparent blur-3xl pointer-events-none rounded-full" />
        <div className="absolute top-10 right-10 w-96 h-96 bg-cyan-500/10 blur-3xl pointer-events-none rounded-full" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-4xl mx-auto space-y-6">
            
            {/* Startup Tag Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-500/10 dark:bg-teal-500/15 border border-teal-500/30 text-teal-700 dark:text-teal-300 text-xs font-bold backdrop-blur-md shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-teal-500" />
              <span>Announcing Nexus CommunityOS v2.4 • Decentralized Disaster Readiness</span>
              <ChevronRight className="w-3.5 h-3.5 text-teal-500" />
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight leading-[1.08] text-slate-900 dark:text-white">
              Your Community. <br className="hidden sm:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-500 via-cyan-400 to-blue-600">
                Connected.
              </span>
            </h1>

            {/* Subheadline */}
            <p className="text-base sm:text-xl text-slate-600 dark:text-slate-300 font-normal leading-relaxed max-w-3xl mx-auto">
              Discover volunteers, emergency resources, healthcare, shelters, food distribution, generators, blood donors, and local services from one intelligent platform.
            </p>

            {/* Dual Hero Buttons */}
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3.5">
              <Link
                to="/dashboard"
                className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-gradient-to-r from-teal-500 via-teal-400 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-slate-950 font-black text-sm shadow-xl shadow-teal-500/30 active:scale-95 transition-all flex items-center justify-center gap-2 group"
              >
                <span>Explore Community</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                to="/volunteers"
                className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-white/80 dark:bg-slate-900/80 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/80 text-slate-800 dark:text-slate-200 font-bold text-sm shadow-sm backdrop-blur-md active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <HeartHandshake className="w-4 h-4 text-teal-500" />
                <span>Become a Volunteer</span>
              </Link>
            </div>

            {/* Small trust caption */}
            <div className="pt-3 flex items-center justify-center gap-6 text-xs text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                Zero Cloud Lock-in
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <RadioTower className="w-4 h-4 text-teal-500" />
                Offline LoRa Mesh Ready
              </span>
              <span>•</span>
              <span>4,200+ Clusters Deployed</span>
            </div>

          </div>

          {/* 2. INTERACTIVE WORLD / COMMUNITY NETWORK ILLUSTRATION */}
          <div id="world-map" className="mt-16 lg:mt-24">
            <div className="relative rounded-3xl p-6 sm:p-10 glass-card border border-slate-200/80 dark:border-slate-800/80 bg-slate-950 shadow-2xl overflow-hidden">
              
              {/* Subtle map coordinate grid */}
              <div 
                className="absolute inset-0 opacity-20 pointer-events-none"
                style={{
                  backgroundImage: 'radial-gradient(circle at 1px 1px, #14b8a6 1px, transparent 0)',
                  backgroundSize: '32px 32px'
                }}
              />

              {/* Vector connection arcs between community nodes */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-40">
                <defs>
                  <linearGradient id="grad-mesh" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#14b8a6" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0.8" />
                  </linearGradient>
                </defs>
                <path d="M 340 240 Q 520 180 660 180" fill="none" stroke="url(#grad-mesh)" strokeWidth="2" strokeDasharray="6 4" />
                <path d="M 520 360 Q 660 280 780 340" fill="none" stroke="url(#grad-mesh)" strokeWidth="2" strokeDasharray="6 4" />
                <path d="M 220 390 Q 340 320 520 360" fill="none" stroke="url(#grad-mesh)" strokeWidth="2" />
                <path d="M 340 240 L 520 360" fill="none" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="4 4" />
                <circle cx="50%" cy="50%" r="220" fill="none" stroke="#14b8a6" strokeWidth="1" strokeOpacity="0.2" />
              </svg>

              {/* Header inside illustration */}
              <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-6 border-b border-slate-800/80 text-white">
                <div>
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-teal-400">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                    <span>Interactive Community Mesh Network</span>
                  </div>
                  <h3 className="text-xl font-black text-white mt-0.5">
                    Live Sector Alpha • 5 Active Telemetry Nodes
                  </h3>
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-900/80 px-3 py-1.5 rounded-xl border border-slate-800">
                  <span>Click any node to inspect live reserve status</span>
                </div>
              </div>

              {/* The Interactive Interactive Grid Canvas */}
              <div className="relative h-[340px] sm:h-[420px] my-6">
                
                {/* Visual Community Nodes */}
                {communityNodes.map(node => {
                  const Icon = node.icon;
                  const isSelected = activeNode === node.id;

                  return (
                    <div
                      key={node.id}
                      style={{
                        left: `${node.x}%`,
                        top: `${node.y}%`,
                        transform: 'translate(-50%, -50%)',
                      }}
                      className="absolute cursor-pointer group"
                      onClick={() => setActiveNode(node.id)}
                    >
                      {/* Pulse ring animation */}
                      {isSelected && (
                        <span className="w-16 h-16 -left-4 -top-4 rounded-full bg-teal-400/30 animate-ping absolute" />
                      )}

                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-xl transition-all duration-200 group-hover:scale-125 ${
                        isSelected ? 'ring-4 ring-white ring-offset-4 ring-offset-slate-950 scale-115' : ''
                      } ${node.color}`}>
                        <Icon className="w-6 h-6" />
                      </div>

                      {/* Tooltip on hover */}
                      <div className="hidden sm:block opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-14 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-bold whitespace-nowrap shadow-2xl border border-slate-700 pointer-events-none z-30">
                        {node.label}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Selected Node Details Card (Bottom of illustration) */}
              <motion.div
                key={selectedNodeData.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative z-10 p-5 rounded-2xl bg-slate-900/90 border border-slate-700/80 backdrop-blur-md flex flex-col md:flex-row md:items-center justify-between gap-4 text-white"
              >
                <div className="flex items-start gap-3.5">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${selectedNodeData.color}`}>
                    <selectedNodeData.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${selectedNodeData.tagColor}`}>
                        {selectedNodeData.category}
                      </span>
                      <span className="text-xs text-slate-400">
                        {selectedNodeData.distance}
                      </span>
                    </div>
                    <h4 className="text-base font-bold text-white mt-0.5">
                      {selectedNodeData.label}
                    </h4>
                    <p className="text-xs text-slate-300 leading-relaxed mt-0.5 max-w-xl">
                      {selectedNodeData.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 self-end md:self-center">
                  <div className="text-right">
                    <div className="text-xs font-bold text-emerald-400">
                      {selectedNodeData.status}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Decentralized Ledger Verified
                    </div>
                  </div>

                  <Link
                    to="/resources"
                    className="px-4 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs shadow-md shadow-teal-500/20 transition-all flex items-center gap-1"
                  >
                    <span>View in Hub</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </motion.div>

            </div>
          </div>

        </div>
      </section>

      {/* 3. PARTNERS & TRUSTED BY SECTION */}
      <section className="py-12 border-y border-slate-200/80 dark:border-slate-800/80 bg-white/40 dark:bg-slate-900/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-8">
            Built with insights from premier disaster resilience & civil defense groups
          </p>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 items-center">
            {partners.map((partner, i) => (
              <div 
                key={i} 
                className="p-3 text-center rounded-xl bg-slate-100/50 dark:bg-slate-800/30 border border-slate-200/50 dark:border-slate-800/50 hover:border-teal-500/30 transition-colors"
              >
                <div className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                  {partner.name}
                </div>
                <div className="text-[10px] text-teal-600 dark:text-teal-400 font-medium">
                  {partner.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. STATISTICS SECTION */}
      <section className="py-20 lg:py-28 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {statistics.map((stat, i) => (
              <div
                key={i}
                className="p-8 rounded-3xl glass-card border border-slate-200/80 dark:border-slate-800/80 hover:border-teal-500/40 transition-all hover:shadow-xl relative overflow-hidden group"
              >
                <div className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
                  {stat.value}
                </div>
                <div className="text-sm font-bold text-teal-600 dark:text-teal-400 mt-2">
                  {stat.label}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  {stat.sub}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. FEATURE CARDS (BENTO GRID) */}
      <section id="features" className="py-20 lg:py-28 bg-slate-100/60 dark:bg-slate-950/60 border-y border-slate-200/80 dark:border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
              The Nexus Architecture
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
              An Operating System built for everyday life and extreme moments.
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300">
              Most community tools are fragmented into chat threads and spreadsheets. Nexus provides a unified, structured operating system.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feat, i) => {
              const Icon = feat.icon;
              return (
                <div
                  key={i}
                  className={`p-7 rounded-3xl glass-card border transition-all duration-200 flex flex-col justify-between hover:shadow-2xl hover:-translate-y-1 ${
                    feat.highlight 
                      ? 'border-red-500/50 bg-red-500/[0.03] ring-1 ring-red-500/20' 
                      : 'border-slate-200/80 dark:border-slate-800/80 hover:border-teal-500/40'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className={`p-3 rounded-2xl ${
                        feat.highlight 
                          ? 'bg-red-500/10 text-red-500' 
                          : 'bg-teal-500/10 text-teal-600 dark:text-teal-400'
                      }`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                        feat.highlight
                          ? 'bg-red-500/15 text-red-600 dark:text-red-400'
                          : 'bg-teal-500/10 text-teal-600 dark:text-teal-400'
                      }`}>
                        {feat.badge}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                      {feat.title}
                    </h3>

                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                      {feat.description}
                    </p>
                  </div>

                  <div className="pt-6 mt-6 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs font-bold text-teal-600 dark:text-teal-400">
                    <span>Explore Module</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* 6. EMERGENCY MODE PREVIEW (INTERACTIVE SIMULATOR) */}
      <section id="emergency-preview" className="py-20 lg:py-28 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="p-8 sm:p-12 rounded-3xl border transition-all duration-500 relative overflow-hidden shadow-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border-slate-800 text-white">
            
            {/* Dynamic ambient red glow when simulation is active */}
            {previewEmergency && (
              <div className="absolute inset-0 bg-red-600/15 pointer-events-none transition-opacity duration-500 animate-pulse" />
            )}

            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8 pb-8 border-b border-slate-800">
              <div className="max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/15 border border-red-500/30 text-red-300 text-xs font-bold mb-3">
                  <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
                  <span>Disaster Emergency Protocol Simulation</span>
                </div>

                <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                  Experience How Nexus Shifts During Disasters.
                </h2>

                <p className="mt-2 text-xs sm:text-sm text-slate-300 leading-relaxed">
                  Toggle the switch below to witness the automated interface transformation. Non-essential features fade away, prioritizing immediate distress triage, oxygen generator reserves, and emergency shelter capacity.
                </p>
              </div>

              {/* Interactive Simulator Toggle Button */}
              <div className="flex flex-col items-start lg:items-end gap-2 shrink-0">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Disaster Simulator Switch
                </span>

                <button
                  onClick={() => setPreviewEmergency(!previewEmergency)}
                  className={`px-5 py-2.5 rounded-2xl font-black text-xs transition-all flex items-center gap-2.5 shadow-lg active:scale-95 cursor-pointer ${
                    previewEmergency
                      ? 'bg-red-600 text-white shadow-red-600/40 ring-4 ring-red-500/20'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
                  }`}
                >
                  <span className={`w-3 h-3 rounded-full ${previewEmergency ? 'bg-white animate-ping' : 'bg-slate-500'}`} />
                  <span>{previewEmergency ? 'DISASTER MODE ACTIVE (CLICK TO RESET)' : 'ACTIVATE DISASTER MODE'}</span>
                </button>
              </div>
            </div>

            {/* Simulated Live Emergency Interface UI */}
            <div className="mt-8 relative rounded-2xl bg-slate-950 p-6 border border-slate-800 space-y-6">
              
              {/* Top Banner simulation */}
              <div className={`p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors ${
                previewEmergency
                  ? 'bg-red-600 text-white shadow-lg shadow-red-600/30'
                  : 'bg-slate-900 text-slate-300 border border-slate-800'
              }`}>
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${previewEmergency ? 'bg-white/20' : 'bg-slate-800'}`}>
                    <AlertTriangle className={`w-5 h-5 ${previewEmergency ? 'text-white animate-bounce' : 'text-slate-400'}`} />
                  </div>
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider">
                      {previewEmergency ? 'CRITICAL DISPATCH ACTIVE: FLASH FLOOD & MICROBURST' : 'STANDBY PROTOCOL READY'}
                    </div>
                    <div className="text-[11px] opacity-90">
                      {previewEmergency ? 'Life-safety emergency equipment prioritized across all 4 zones.' : 'Sensors monitoring river gauges & power substation frequencies.'}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    to="/emergency"
                    className="px-3 py-1.5 rounded-lg bg-white text-slate-950 font-bold text-xs shadow-sm hover:bg-slate-100 transition-colors"
                  >
                    Open Live Triage Hub
                  </Link>
                </div>
              </div>

              {/* Three Simulated Live Triage Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className={`p-4 rounded-xl border transition-colors ${
                  previewEmergency ? 'border-red-500/40 bg-red-950/20' : 'border-slate-800 bg-slate-900/60'
                }`}>
                  <div className="flex items-center justify-between text-xs font-bold mb-1">
                    <span className="text-red-400">SOS Distress Signals</span>
                    <span className="px-1.5 py-0.5 rounded bg-red-500/20 text-red-300 font-mono">
                      {previewEmergency ? '2 Active' : '0 Active'}
                    </span>
                  </div>
                  <div className="text-xs text-slate-300 font-medium mt-2">
                    {previewEmergency ? 'Evelyn Vance (Apt 402): Concentrator battery low' : 'No emergency distress signals pending.'}
                  </div>
                </div>

                <div className={`p-4 rounded-xl border transition-colors ${
                  previewEmergency ? 'border-amber-500/40 bg-amber-950/20' : 'border-slate-800 bg-slate-900/60'
                }`}>
                  <div className="flex items-center justify-between text-xs font-bold mb-1">
                    <span className="text-amber-400">Backup Microgrid</span>
                    <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono">
                      {previewEmergency ? '4 Generators Dispatched' : 'Standby'}
                    </span>
                  </div>
                  <div className="text-xs text-slate-300 font-medium mt-2">
                    {previewEmergency ? 'Clean power routed to vital life-support units.' : '18.5 kW capacity ready at Science Quarter.'}
                  </div>
                </div>

                <div className={`p-4 rounded-xl border transition-colors ${
                  previewEmergency ? 'border-emerald-500/40 bg-emerald-950/20' : 'border-slate-800 bg-slate-900/60'
                }`}>
                  <div className="flex items-center justify-between text-xs font-bold mb-1">
                    <span className="text-emerald-400">Shelter Readiness</span>
                    <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono">
                      {previewEmergency ? 'Civic Hall Open' : 'Available'}
                    </span>
                  </div>
                  <div className="text-xs text-slate-300 font-medium mt-2">
                    {previewEmergency ? '240 cots heated with satellite Starlink link.' : 'Capacity verified by emergency committee.'}
                  </div>
                </div>
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* 7. HOW IT WORKS SECTION */}
      <section id="how-it-works" className="py-20 lg:py-28 bg-white/50 dark:bg-slate-900/50 border-y border-slate-200/80 dark:border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
              Implementation Blueprint
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
              How Nexus transforms community readiness in 4 steps.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {howItWorks.map((step, i) => (
              <div
                key={i}
                className="p-8 rounded-3xl glass-card border border-slate-200/80 dark:border-slate-800/80 flex flex-col justify-between hover:border-teal-500/40 transition-all hover:shadow-xl"
              >
                <div>
                  <span className="text-3xl font-black text-teal-500 font-mono">
                    {step.step}
                  </span>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-4 mb-2">
                    {step.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 8. TESTIMONIALS SECTION */}
      <section id="testimonials" className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
              Community Voices
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
              Trusted by neighborhood captains, doctors, and civil defense leads.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((test, i) => (
              <div
                key={i}
                className="p-8 rounded-3xl glass-card border border-slate-200/80 dark:border-slate-800/80 flex flex-col justify-between hover:border-teal-500/40 transition-all hover:shadow-xl"
              >
                <div>
                  <div className="flex items-center gap-1 text-amber-400 mb-4">
                    {[...Array(5)].map((_, s) => (
                      <Star key={s} className="w-4 h-4 fill-amber-400" />
                    ))}
                  </div>

                  <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed italic">
                    "{test.quote}"
                  </p>
                </div>

                <div className="pt-6 mt-6 border-t border-slate-100 dark:border-slate-800/80 flex items-center gap-3">
                  <img
                    src={test.avatar}
                    alt={test.author}
                    className="w-11 h-11 rounded-2xl object-cover ring-2 ring-teal-500/30"
                  />
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {test.author}
                    </div>
                    <div className="text-[11px] text-teal-600 dark:text-teal-400 truncate">
                      {test.role}
                    </div>
                    <div className="text-[10px] text-slate-400 truncate">
                      {test.community}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 9. HIGH-CONVERTING BOTTOM CALL TO ACTION (CTA) */}
      <section className="py-20 lg:py-28 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="p-8 sm:p-14 rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-teal-950 border border-teal-500/30 shadow-2xl text-white text-center relative overflow-hidden">
            
            <div className="absolute top-0 right-0 w-80 h-80 bg-teal-500/20 blur-3xl pointer-events-none rounded-full" />
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-600/20 blur-3xl pointer-events-none rounded-full" />

            <div className="relative z-10 max-w-2xl mx-auto space-y-6">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-300 text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Ready to deploy Nexus in your area?</span>
              </span>

              <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
                Empower your neighborhood with an intelligent operating system.
              </h2>

              <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                Connect physical equipment, certified volunteer squads, and automated emergency mode. Free for neighborhoods and community mutual aid groups.
              </p>

              {emailSubmitted ? (
                <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 text-xs font-bold flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Welcome aboard! We’ve sent your community cluster invitation pack.</span>
                </div>
              ) : (
                <form onSubmit={handleWaitlistSubmit} className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2 max-w-md mx-auto">
                  <input
                    type="email"
                    required
                    placeholder="Enter your email for cluster kit..."
                    value={emailInput}
                    onChange={e => setEmailInput(e.target.value)}
                    className="w-full px-4 py-3 text-xs rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                  <button
                    type="submit"
                    className="w-full sm:w-auto whitespace-nowrap px-6 py-3 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-black text-xs shadow-lg shadow-teal-500/30 active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>Get Deployment Kit</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </form>
              )}

              <div className="pt-4 flex flex-wrap items-center justify-center gap-4 text-xs font-bold text-slate-300">
                <Link to="/dashboard" className="hover:text-teal-400 underline underline-offset-4">
                  Or launch the interactive live demo immediately →
                </Link>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 10. COMPREHENSIVE STARTUP FOOTER */}
      <footer className="border-t border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-950/80 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 mb-12">
            
            {/* Col 1: Brand & Tagline */}
            <div className="col-span-2 space-y-4">
              <Link to="/" className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-teal-500 flex items-center justify-center text-white font-black text-xs shadow-md shadow-teal-500/20">
                  NX
                </div>
                <span className="text-base font-black text-slate-900 dark:text-white">
                  Nexus – CommunityOS
                </span>
              </Link>

              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-sm">
                The Operating System for Every Community. Powering neighbor-to-neighbor resource sharing, verified medical squads, and instant disaster triage.
              </p>

              <div className="flex items-center gap-2 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>LoRa Mesh & Decentralized Sync: 100% Operational</span>
              </div>
            </div>

            {/* Col 2: Platform Modules */}
            <div className="space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                Platform
              </div>
              <ul className="space-y-2 text-xs text-slate-500 dark:text-slate-400">
                <li><Link to="/dashboard" className="hover:text-teal-500 transition-colors">Command Center</Link></li>
                <li><Link to="/resources" className="hover:text-teal-500 transition-colors">Resource Directory</Link></li>
                <li><Link to="/volunteers" className="hover:text-teal-500 transition-colors">Volunteer Corps</Link></li>
                <li><Link to="/emergency" className="hover:text-red-500 transition-colors font-medium">Disaster Mode</Link></li>
                <li><Link to="/map" className="hover:text-teal-500 transition-colors">Tactical GIS Map</Link></li>
              </ul>
            </div>

            {/* Col 3: Resources */}
            <div className="space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                Resilience
              </div>
              <ul className="space-y-2 text-xs text-slate-500 dark:text-slate-400">
                <li><Link to="/announcements" className="hover:text-teal-500 transition-colors">Civic Ballots & Polls</Link></li>
                <li><Link to="/settings" className="hover:text-teal-500 transition-colors">LoRa Mesh Protocols</Link></li>
                <li><a href="#emergency-preview" className="hover:text-teal-500 transition-colors">Disaster Simulator</a></li>
                <li><a href="#how-it-works" className="hover:text-teal-500 transition-colors">Deployment Guide</a></li>
              </ul>
            </div>

            {/* Col 4: Community Governance */}
            <div className="space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                Clusters
              </div>
              <ul className="space-y-2 text-xs text-slate-500 dark:text-slate-400">
                <li><span className="text-slate-700 dark:text-slate-300 font-medium">Silverwood Heights</span></li>
                <li><span className="text-slate-700 dark:text-slate-300 font-medium">Cascadia Towers</span></li>
                <li><span className="text-slate-700 dark:text-slate-300 font-medium">Evergreen Township</span></li>
                <li><span className="text-slate-700 dark:text-slate-300 font-medium">North Campus Science</span></li>
              </ul>
            </div>

          </div>

          {/* Bottom Copyright */}
          <div className="pt-8 border-t border-slate-200/80 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
            <div>
              © 2026 Nexus CommunityOS. The Operating System for Every Community. All rights reserved.
            </div>

            <div className="flex items-center gap-6">
              <a href="#" className="hover:text-slate-600 dark:hover:text-slate-200">Privacy Policy</a>
              <a href="#" className="hover:text-slate-600 dark:hover:text-slate-200">Decentralized Charter</a>
              <a href="#" className="hover:text-slate-600 dark:hover:text-slate-200">Open Source Protocol</a>
            </div>
          </div>

        </div>
      </footer>

    </div>
  );
};
