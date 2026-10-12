import React, { useState, useEffect } from 'react';
import { VolunteerProfile } from '../../types';
import { useCommunity } from '../../context/CommunityContext';
import { 
  X, 
  UserCheck, 
  MapPin, 
  Crosshair, 
  Phone, 
  Mail, 
  ShieldCheck, 
  Award, 
  Clock, 
  Check, 
  Loader2,
  Sparkles,
  Wifi
} from 'lucide-react';

interface RegisterVolunteerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RegisterVolunteerModal: React.FC<RegisterVolunteerModalProps> = ({ isOpen, onClose }) => {
  const { registerVolunteer, addToast } = useCommunity();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('Emergency Relief Responder');
  const [serviceArea, setServiceArea] = useState('Central Community District');
  const [neighborhoodZone, setNeighborhoodZone] = useState('Zone 1');
  const [availability, setAvailability] = useState<'available' | 'standby' | 'on_mission'>('available');
  const [selectedSkills, setSelectedSkills] = useState<string[]>(['First Aid', 'Logistics']);
  const [customSkill, setCustomSkill] = useState('');
  const [emergencyCertified, setEmergencyCertified] = useState(true);
  const [certificationsText, setCertificationsText] = useState('Community Emergency Response Team (CERT)');

  // GPS state
  const [gpsLocation, setGpsLocation] = useState<{ lat: number; lng: number; accuracy?: number } | null>(null);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const availableSkillsList = [
    'Emergency Triage',
    'Paramedic Medicine',
    'First Aid',
    'Structural Assessment',
    'Commercial Kitchen Operations',
    'Solar Microinverters',
    'Generator Setup',
    'Geriatric Care',
    'Ham Radio Net Control',
    'Gravity Filtration',
    'Class A CDL Driving',
    'Search & Rescue',
    'Chainsaw Clearing',
    'Boat / Swiftwater Rescue',
  ];

  // Auto detect GPS when modal opens
  useEffect(() => {
    if (isOpen && !gpsLocation) {
      handleGetDeviceGps();
    }
  }, [isOpen]);

  const handleGetDeviceGps = () => {
    if (!('geolocation' in navigator)) {
      setGpsError('Geolocation is not supported by your browser.');
      return;
    }

    setGpsLoading(true);
    setGpsError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;
        setGpsLocation({ lat: latitude, lng: longitude, accuracy });
        setServiceArea(`Local GPS Sector (${latitude.toFixed(4)}°, ${longitude.toFixed(4)}°)`);
        setNeighborhoodZone(`Sector GPS [${latitude.toFixed(3)}, ${longitude.toFixed(3)}]`);
        setGpsLoading(false);
      },
      (err) => {
        setGpsError(err.message || 'Unable to retrieve your location.');
        setGpsLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const toggleSkill = (skill: string) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(selectedSkills.filter(s => s !== skill));
    } else {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  const handleAddCustomSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (customSkill.trim() && !selectedSkills.includes(customSkill.trim())) {
      setSelectedSkills([...selectedSkills, customSkill.trim()]);
      setCustomSkill('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      addToast({ type: 'warning', title: 'Name Required', message: 'Please enter your full name.' });
      return;
    }

    setIsSubmitting(true);
    try {
      const newVolunteer: VolunteerProfile = {
        id: `vol-${Date.now()}`,
        profileId: `usr-${Date.now()}`,
        name: name.trim(),
        email: email.trim() || 'volunteer@nexus.local',
        phone: phone.trim() || '+1 (555) 012-3456',
        role: role.trim(),
        avatar: `https://images.unsplash.com/photo-${1534528741775 + (Date.now() % 1000)}?w=160&auto=format&fit=crop&q=80`,
        skills: selectedSkills.length > 0 ? selectedSkills : ['General Aid'],
        languages: ['English'],
        serviceArea: serviceArea.trim(),
        neighborhoodZone: neighborhoodZone.trim(),
        availability,
        verificationStatus: 'verified',
        missionsCompleted: 1,
        hoursContributed: 8,
        emergencyCertified,
        isFirstAidCertified: selectedSkills.includes('First Aid') || selectedSkills.includes('Emergency Triage'),
        certifications: certificationsText.split(',').map(s => s.trim()).filter(Boolean),
        contactProtected: false,
        latitude: gpsLocation?.lat,
        longitude: gpsLocation?.lng,
      };

      await registerVolunteer(newVolunteer);

      addToast({
        type: 'success',
        title: 'Volunteer Profile Published!',
        message: `${newVolunteer.name} is now registered and synchronized across all devices in real-time.`,
      });

      onClose();
    } catch (err: any) {
      addToast({
        type: 'warning',
        title: 'Registration Error',
        message: err.message || 'Could not save volunteer profile.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="glass-card bg-white dark:bg-stone-900 w-full max-w-2xl rounded-3xl shadow-2xl border border-stone-200 dark:border-stone-800 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between bg-stone-50/50 dark:bg-stone-950/40">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 border border-emerald-500/20">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-stone-900 dark:text-white">
                Register as Active Community Volunteer
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400 flex items-center gap-1.5 mt-0.5">
                <Wifi className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
                <span>Real-Time Cloud & Local SQLite Multi-Device Synchronization</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 flex-1">
          
          {/* GPS Location Bar */}
          <div className="p-3.5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-500/25 flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2.5 min-w-0">
              <Crosshair className={`w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 ${gpsLoading ? 'animate-spin' : ''}`} />
              <div className="text-xs min-w-0">
                <span className="font-bold text-stone-900 dark:text-white block">
                  {gpsLocation ? 'Live Device GPS Detected' : 'Device GPS Location'}
                </span>
                <span className="text-[11px] text-stone-600 dark:text-stone-400 font-mono truncate block">
                  {gpsLocation 
                    ? `Lat: ${gpsLocation.lat.toFixed(5)}°, Lng: ${gpsLocation.lng.toFixed(5)}° (±${Math.round(gpsLocation.accuracy || 10)}m)`
                    : gpsError ? gpsError : 'Press button to acquire your device coordinates'}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleGetDeviceGps}
              disabled={gpsLoading}
              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {gpsLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Crosshair className="w-3.5 h-3.5" />}
              <span>{gpsLocation ? 'Re-Detect GPS' : 'Get Device GPS'}</span>
            </button>
          </div>

          {/* Personal Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Anvar Aneesh"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                Phone / WhatsApp *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. +1 (555) 349-2810"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                Email Address
              </label>
              <input
                type="email"
                placeholder="volunteer@domain.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                Primary Specialty / Role *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Community Medical Aid / Logistics Driver"
                value={role}
                onChange={e => setRole(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Location Area & Zone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                Service Area / District
              </label>
              <input
                type="text"
                value={serviceArea}
                onChange={e => setServiceArea(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                Availability Status
              </label>
              <select
                value={availability}
                onChange={e => setAvailability(e.target.value as any)}
                className="w-full px-3.5 py-2 text-xs rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="available">Available Immediately</option>
                <option value="standby">On Call / Standby</option>
                <option value="on_mission">Currently on Mission</option>
              </select>
            </div>
          </div>

          {/* Capabilities & Skills Selection */}
          <div>
            <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1.5">
              Select Your Certified Capabilities & Skills
            </label>
            <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-2 rounded-2xl bg-stone-50 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700">
              {availableSkillsList.map(skill => {
                const isSelected = selectedSkills.includes(skill);
                return (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => toggleSkill(skill)}
                    className={`px-2.5 py-1 rounded-xl text-xs font-medium transition-all cursor-pointer flex items-center gap-1 ${
                      isSelected
                        ? 'bg-emerald-600 text-white font-bold shadow-sm'
                        : 'bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-700'
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3" />}
                    <span>{skill}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Certifications Text */}
          <div>
            <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
              Certifications & Badges (Comma-separated)
            </label>
            <input
              type="text"
              placeholder="e.g. CPR Certified, First Responder, OSHA 30, Licensed Electrician"
              value={certificationsText}
              onChange={e => setCertificationsText(e.target.value)}
              className="w-full px-3.5 py-2 text-xs rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Certifications Checkbox */}
          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="emergencyCertified"
              checked={emergencyCertified}
              onChange={e => setEmergencyCertified(e.target.checked)}
              className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-stone-300 cursor-pointer"
            />
            <label htmlFor="emergencyCertified" className="text-xs text-stone-700 dark:text-stone-300 font-medium cursor-pointer">
              I am available for rapid dispatch during Emergency Mode activations.
            </label>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-stone-200 dark:border-stone-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 cursor-pointer transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/25 active:scale-95 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Publishing Across Network...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Register & Sync Live</span>
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
