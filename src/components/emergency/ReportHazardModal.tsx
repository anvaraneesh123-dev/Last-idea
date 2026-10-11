import React, { useState } from 'react';
import { useCommunity } from '../../context/CommunityContext';
import { useAuth } from '../../context/AuthContext';
import { HazardType, AlertSeverity, HazardReport } from '../../types';
import { 
  AlertTriangle, 
  X, 
  MapPin, 
  Send, 
  ShieldAlert, 
  AlertOctagon, 
  HelpCircle,
  CheckCircle2,
  WifiOff
} from 'lucide-react';

interface ReportHazardModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultCoordinates?: { latitude: number; longitude: number } | null;
}

export const ReportHazardModal: React.FC<ReportHazardModalProps> = ({
  isOpen,
  onClose,
  defaultCoordinates
}) => {
  const { addHazardReport, isOffline } = useCommunity();
  const { currentUser } = useAuth();

  const [title, setTitle] = useState('');
  const [type, setType] = useState<HazardType>('blocked_road');
  const [severity, setSeverity] = useState<AlertSeverity>('warning');
  const [locationName, setLocationName] = useState('Pine Street & 4th Avenue Culvert');
  const [latitude, setLatitude] = useState(defaultCoordinates?.latitude || 45.5175);
  const [longitude, setLongitude] = useState(defaultCoordinates?.longitude || -122.6790);
  const [description, setDescription] = useState('');
  const [isRoadBlocked, setIsRoadBlocked] = useState(true);
  const [detourNotes, setDetourNotes] = useState('Use South Hill detour; culvert inundated by 3ft water.');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !locationName.trim()) return;

    await addHazardReport({
      title,
      type,
      severity,
      status: 'active',
      verificationTier: 'unverified_report', // Community submissions start as unverified reports
      latitude,
      longitude,
      locationName,
      description,
      reportedBy: currentUser.fullName,
      reporterPhone: currentUser.phone,
      isRoadBlocked,
      detourNotes: isRoadBlocked ? detourNotes : undefined,
    });

    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      onClose();
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="w-full max-w-lg bg-white dark:bg-slate-900 border border-amber-500/30 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 bg-amber-500/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-lg shadow-amber-500/30">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900 dark:text-white">
                Report Hazard or Blocked Road
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Submit crowdsourced ground reports for volunteer review and map posting.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Offline indicator if offline */}
        {isOffline && (
          <div className="px-5 py-2.5 bg-amber-500/15 border-b border-amber-500/20 text-[11px] text-amber-800 dark:text-amber-300 flex items-center gap-2">
            <WifiOff className="w-3.5 h-3.5 shrink-0" />
            <span>
              <strong>Offline Mode Active:</strong> Your hazard report will be saved locally in IndexedDB and queued for synchronization as soon as connection is restored.
            </span>
          </div>
        )}

        {submitted ? (
          <div className="p-8 text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto animate-bounce" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Hazard Report Submitted
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              Marked as <strong>Unverified Community Report</strong>. Civil Defense leads and volunteers have been alerted to inspect the location.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto">
            {/* Title */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Hazard Summary *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Fallen Douglas Fir blocking Northbound Lane"
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            {/* Type & Severity Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Hazard Type
                </label>
                <select
                  value={type}
                  onChange={e => setType(e.target.value as HazardType)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                >
                  <option value="blocked_road">Blocked Road / Debris</option>
                  <option value="flood">Flash Flood / High Water</option>
                  <option value="downed_power_line">Downed Electrical Line</option>
                  <option value="wildfire">Wildfire / Smoke Inundation</option>
                  <option value="infrastructure_failure">Water / Gas Main Failure</option>
                  <option value="structural_damage">Building Structural Damage</option>
                  <option value="other">Other Community Hazard</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Severity Tier
                </label>
                <select
                  value={severity}
                  onChange={e => setSeverity(e.target.value as AlertSeverity)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                >
                  <option value="warning">Warning (Impassable / Caution)</option>
                  <option value="severe">Severe (Urgent Hazard)</option>
                  <option value="critical">Critical (Immediate Danger)</option>
                  <option value="info">Info (Advisory)</option>
                </select>
              </div>
            </div>

            {/* Road Blocked Toggle */}
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-900 dark:text-white">
                <input
                  type="checkbox"
                  checked={isRoadBlocked}
                  onChange={e => setIsRoadBlocked(e.target.checked)}
                  className="rounded text-amber-500 focus:ring-amber-400"
                />
                <span>Roadway is Completely Blocked / Impassable</span>
              </label>

              {isRoadBlocked && (
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-0.5">
                    Detour Recommendation (Do not claim any detour is safe without verification)
                  </label>
                  <input
                    type="text"
                    value={detourNotes}
                    onChange={e => setDetourNotes(e.target.value)}
                    placeholder="e.g. Recommended alternate: River Road Bypass"
                    className="w-full px-3 py-1.5 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
              )}
            </div>

            {/* Location & Coordinates */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Location Landmark / Street *
              </label>
              <input
                type="text"
                required
                value={locationName}
                onChange={e => setLocationName(e.target.value)}
                placeholder="e.g. Bridge Street at Miller Creek Crossing"
                className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Detailed Observation *
              </label>
              <textarea
                required
                rows={3}
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Describe water depth, live wires sparking, trees down, or vehicles stranded..."
                className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>

            {/* Verification Disclaimer */}
            <div className="p-3 rounded-2xl bg-blue-50 dark:bg-blue-950/30 border border-blue-500/20 text-[11px] text-blue-900 dark:text-blue-300 leading-relaxed">
              <strong>Ground Verification Policy:</strong> Submitted reports appear immediately on the map labelled as <em>Unverified Community Report</em> until confirmed by municipal dispatch or certified first responders.
            </div>

            {/* Buttons */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-md shadow-amber-500/25 flex items-center gap-1.5 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Submit Hazard Report</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
