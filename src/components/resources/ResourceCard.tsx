import React, { useState } from 'react';
import { ResourceItem, ResourceCategory } from '../../types';
import { useCommunity } from '../../context/CommunityContext';
import { useAuth } from '../../context/AuthContext';
import { 
  Wrench, 
  HeartPulse, 
  Zap, 
  Droplet, 
  Home, 
  Radio, 
  MapPin, 
  Phone, 
  Check, 
  ShieldCheck, 
  Clock, 
  RotateCcw,
  Edit,
  PowerOff,
  Building2,
  LifeBuoy,
  Users2,
  AlertTriangle
} from 'lucide-react';

interface ResourceCardProps {
  resource: ResourceItem;
  onEdit?: (resource: ResourceItem) => void;
}

export const ResourceCard: React.FC<ResourceCardProps> = ({ resource, onEdit }) => {
  const { borrowResource, returnResource, deactivateResource, isEmergencyMode } = useCommunity();
  const { isAdmin, currentUser } = useAuth();
  const [showContact, setShowContact] = useState(false);

  const getCategoryDetails = (cat: ResourceCategory) => {
    switch (cat) {
      case 'food':
        return { label: 'Food Distribution', icon: Droplet, color: 'text-amber-500 bg-amber-500/10 border-amber-500/20' };
      case 'water':
        return { label: 'Potable Water', icon: Droplet, color: 'text-cyan-500 bg-cyan-500/10 border-cyan-500/20' };
      case 'medicine':
        return { label: 'Medicine & First Aid', icon: HeartPulse, color: 'text-rose-500 bg-rose-500/10 border-rose-500/20' };
      case 'hospitals':
        return { label: 'Hospital & Urgent Care', icon: Building2, color: 'text-purple-500 bg-purple-500/10 border-purple-500/20' };
      case 'shelters':
        return { label: 'Emergency Shelter', icon: Home, color: 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20' };
      case 'generators':
        return { label: 'Power & Microgrid', icon: Zap, color: 'text-amber-500 bg-amber-500/10 border-amber-500/20' };
      case 'rescue_equipment':
        return { label: 'Rescue Equipment', icon: LifeBuoy, color: 'text-orange-500 bg-orange-500/10 border-orange-500/20' };
      case 'volunteers':
        return { label: 'Volunteer Corps', icon: Users2, color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' };
      case 'other_services':
        return { label: 'Essential Services', icon: Radio, color: 'text-teal-500 bg-teal-500/10 border-teal-500/20' };
      case 'tools':
      default:
        return { label: 'Tools & Hardware', icon: Wrench, color: 'text-blue-500 bg-blue-500/10 border-blue-500/20' };
    }
  };

  const cat = getCategoryDetails(resource.category);
  const CategoryIcon = cat.icon;

  const isDeactivated = resource.availability === 'deactivated' || resource.status === 'deactivated';
  const isAvailable = !isDeactivated && resource.availableQuantity > 0;
  const isCriticalReserve = resource.status === 'critical_reserve';
  const isInUse = resource.status === 'in_use' || resource.availableQuantity === 0;

  const canManage = isAdmin || (currentUser && currentUser.fullName === resource.ownerName);

  return (
    <div className={`glass-card rounded-2xl p-5 border flex flex-col justify-between transition-all duration-200 hover:shadow-xl relative overflow-hidden ${
      isDeactivated
        ? 'opacity-60 bg-slate-100/50 dark:bg-slate-900/50 border-slate-300 dark:border-slate-800'
        : isCriticalReserve && isEmergencyMode
        ? 'border-red-500/50 bg-red-500/[0.03] ring-1 ring-red-500/20'
        : 'hover:border-teal-500/40'
    }`}>
      <div>
        {/* Header row: category + badges */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border ${cat.color}`}>
            <CategoryIcon className="w-3.5 h-3.5" />
            <span>{cat.label}</span>
          </span>

          <div className="flex items-center gap-1.5 flex-wrap justify-end">
            {resource.isEmergencyEligible && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20" title="Auto-elevated in disaster mode">
                <ShieldCheck className="w-3 h-3" />
                Emergency
              </span>
            )}

            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
              isDeactivated
                ? 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                : isAvailable
                ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30'
                : isCriticalReserve
                ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30'
                : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
            }`}>
              {isDeactivated ? 'Deactivated' : isAvailable ? `${resource.availableQuantity} of ${resource.quantity} Ready` : 'Allocated'}
            </span>
          </div>
        </div>

        {/* Title */}
        <h4 className="text-base font-bold text-slate-900 dark:text-white leading-snug line-clamp-2 mb-1.5">
          {resource.name || resource.title}
        </h4>

        {/* Description */}
        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-2 mb-4">
          {resource.description}
        </p>

        {/* Meta details */}
        <div className="space-y-1.5 text-xs text-slate-500 dark:text-slate-400 pt-3 border-t border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 font-medium">
              <MapPin className="w-3.5 h-3.5 text-teal-500 shrink-0" />
              <span className="truncate max-w-[180px]">{resource.locationName || resource.location}</span>
            </span>
            <span className="text-[11px] font-semibold text-teal-600 dark:text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded">
              {resource.distance || 'Near'}
            </span>
          </div>

          <div className="flex items-center justify-between text-[11px]">
            <span>
              Custodian: <strong className="text-slate-800 dark:text-slate-200">{resource.ownerName}</strong>
            </span>
            <span className="text-slate-400 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {resource.updatedAt}
            </span>
          </div>

          {resource.verificationStatus === 'verified' && (
            <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" />
              <span>Verified Community Asset</span>
            </div>
          )}
        </div>
      </div>

      {/* Action footer */}
      <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800/80 space-y-2">
        <div className="flex items-center justify-between gap-2">
          <button
            onClick={() => setShowContact(!showContact)}
            className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Phone className="w-3.5 h-3.5 text-teal-500" />
            <span>{showContact ? resource.contactPhone : 'Contact'}</span>
          </button>

          {isDeactivated ? (
            <span className="flex-1 text-center text-xs font-bold text-slate-400 py-2">
              Item Inactive
            </span>
          ) : isAvailable ? (
            <button
              onClick={() => borrowResource(resource.id)}
              className="flex-1 px-4 py-2 rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white font-bold text-xs shadow-md shadow-teal-600/20 active:scale-95 transition-all text-center cursor-pointer"
            >
              Request to Borrow
            </button>
          ) : isInUse ? (
            <button
              onClick={() => returnResource(resource.id)}
              className="flex-1 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs transition-colors flex items-center justify-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
              <span>Return Stock</span>
            </button>
          ) : (
            <button
              onClick={() => borrowResource(resource.id)}
              className="flex-1 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-amber-950 font-bold text-xs transition-colors text-center cursor-pointer"
            >
              Reserve Access
            </button>
          )}
        </div>

        {/* Admin / Owner Controls: Edit & Deactivate */}
        {canManage && (
          <div className="flex items-center justify-end gap-2 pt-1 border-t border-dashed border-slate-100 dark:border-slate-800">
            {onEdit && (
              <button
                onClick={() => onEdit(resource)}
                className="px-2.5 py-1 text-[11px] font-bold text-teal-600 dark:text-teal-400 hover:bg-teal-500/10 rounded-lg flex items-center gap-1 cursor-pointer"
              >
                <Edit className="w-3 h-3" />
                <span>Edit</span>
              </button>
            )}

            {!isDeactivated ? (
              <button
                onClick={() => deactivateResource(resource.id)}
                className="px-2.5 py-1 text-[11px] font-bold text-red-600 dark:text-red-400 hover:bg-red-500/10 rounded-lg flex items-center gap-1 cursor-pointer"
              >
                <PowerOff className="w-3 h-3" />
                <span>Deactivate</span>
              </button>
            ) : (
              <span className="text-[10px] text-slate-400">Offline</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
