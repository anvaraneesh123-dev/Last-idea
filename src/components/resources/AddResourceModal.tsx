import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCommunity } from '../../context/CommunityContext';
import { useAuth } from '../../context/AuthContext';
import { ResourceCategory, ResourceStatus, ResourceItem, VerificationStatus } from '../../types';
import { PackagePlus, X, MapPin, Phone, ShieldCheck, AlertCircle, Save } from 'lucide-react';

interface AddResourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  editItem?: ResourceItem | null;
  initialCoordinates?: { latitude: number; longitude: number } | null;
}

export const AddResourceModal: React.FC<AddResourceModalProps> = ({ 
  isOpen, 
  onClose, 
  editItem,
  initialCoordinates 
}) => {
  const { addResource, updateResource, currentCommunity } = useCommunity();
  const { currentUser, isAdmin } = useAuth();

  const [name, setName] = useState('');
  const [category, setCategory] = useState<ResourceCategory>('tools');
  const [description, setDescription] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [ownerType, setOwnerType] = useState<'resident' | 'community_depot' | 'ngo' | 'management'>('resident');
  const [locationName, setLocationName] = useState('');
  const [distance, setDistance] = useState('250m away');
  const [quantity, setQuantity] = useState(1);
  const [availableQuantity, setAvailableQuantity] = useState(1);
  const [latitude, setLatitude] = useState(45.5152);
  const [longitude, setLongitude] = useState(-122.6784);
  const [isEmergencyEligible, setIsEmergencyEligible] = useState(false);
  const [contactPhone, setContactPhone] = useState('+1 (555) 749-1120');
  const [condition, setCondition] = useState<'Brand New' | 'Excellent' | 'Good'>('Excellent');
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus>('verified');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editItem) {
      setName(editItem.name || editItem.title);
      setCategory(editItem.category);
      setDescription(editItem.description);
      setOwnerName(editItem.ownerName);
      setOwnerType(editItem.ownerType);
      setLocationName(editItem.locationName || editItem.location);
      setDistance(editItem.distance);
      setQuantity(editItem.quantity);
      setAvailableQuantity(editItem.availableQuantity);
      setLatitude(editItem.latitude);
      setLongitude(editItem.longitude);
      setIsEmergencyEligible(editItem.isEmergencyEligible);
      setContactPhone(editItem.contactPhone);
      setCondition(editItem.condition);
      setVerificationStatus(editItem.verificationStatus);
    } else {
      setName('');
      setCategory('tools');
      setDescription('');
      setOwnerName(currentUser.fullName);
      setOwnerType('resident');
      setLocationName(initialCoordinates ? `Pinned Location (${initialCoordinates.latitude.toFixed(4)}, ${initialCoordinates.longitude.toFixed(4)})` : '52 Oakridge Avenue, Cascadia');
      setDistance('200m away');
      setQuantity(1);
      setAvailableQuantity(1);
      setLatitude(initialCoordinates ? initialCoordinates.latitude : 45.5152);
      setLongitude(initialCoordinates ? initialCoordinates.longitude : -122.6784);
      setIsEmergencyEligible(false);
      setContactPhone(currentUser.phone || '+1 (555) 749-1120');
      setCondition('Excellent');
      setVerificationStatus('verified');
    }
    setErrorMsg('');
  }, [editItem, currentUser, isOpen, initialCoordinates]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    // Strict Input Validation: Prevent negative quantities
    if (quantity < 0) {
      setErrorMsg('Resource quantity cannot be negative.');
      return;
    }

    if (!name.trim() || !description.trim() || !locationName.trim()) {
      setErrorMsg('Please complete all required fields.');
      return;
    }

    setLoading(true);
    try {
      if (editItem) {
        await updateResource(editItem.id, {
          name,
          title: name,
          category,
          description,
          ownerName,
          ownerType,
          locationName,
          location: locationName,
          quantity: Number(quantity),
          availableQuantity: Math.min(Number(quantity), Number(availableQuantity)),
          latitude: Number(latitude),
          longitude: Number(longitude),
          isEmergencyEligible,
          contactPhone,
          condition,
          verificationStatus: isAdmin ? verificationStatus : editItem.verificationStatus,
        });
      } else {
        await addResource({
          name,
          title: name,
          category,
          description,
          ownerName,
          ownerType,
          locationName,
          location: locationName,
          distance,
          quantity: Number(quantity),
          availableQuantity: Number(quantity),
          availability: 'available',
          status: 'available',
          latitude: Number(latitude),
          longitude: Number(longitude),
          isEmergencyEligible,
          contactPhone,
          condition,
          verificationStatus: 'verified',
        });
      }
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Error saving resource.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-teal-500/30 overflow-hidden my-8"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-teal-700 via-teal-600 to-cyan-700 px-6 py-4 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-white/20 backdrop-blur-sm">
                <PackagePlus className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-base font-bold">
                  {editItem ? 'Edit Resource Details' : 'List a Shared Community Resource'}
                </h3>
                <p className="text-xs text-teal-100">
                  {editItem ? `Update inventory for ${editItem.name}` : `Make resources accessible to ${currentCommunity.name}`}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
            {errorMsg && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Resource Name & Model *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. DeWalt Cordless Circular Saw, Heavy Sandbag Shovels, etc."
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            {/* 10 Required Categories Dropdown */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Category *
                </label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value as ResourceCategory)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="food">Food Distribution</option>
                  <option value="water">Water & Purification</option>
                  <option value="medicine">Medicine & First Aid</option>
                  <option value="hospitals">Hospitals & Urgent Care</option>
                  <option value="shelters">Shelters & Warming Hubs</option>
                  <option value="generators">Generators & Microgrids</option>
                  <option value="rescue_equipment">Rescue Equipment</option>
                  <option value="volunteers">Volunteers & Responders</option>
                  <option value="tools">Tools & Hardware</option>
                  <option value="other_services">Other Essential Services</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Item Condition
                </label>
                <select
                  value={condition}
                  onChange={e => setCondition(e.target.value as 'Brand New' | 'Excellent' | 'Good')}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="Brand New">Brand New</option>
                  <option value="Excellent">Excellent</option>
                  <option value="Good">Good</option>
                </select>
              </div>
            </div>

            {/* Quantity Validation: Prevent negative quantities */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Total Quantity (Min: 0) *
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={quantity}
                  onChange={e => {
                    const val = Math.max(0, parseInt(e.target.value) || 0);
                    setQuantity(val);
                    if (!editItem) setAvailableQuantity(val);
                  }}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              {editItem && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Available Stock (Unreserved)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max={quantity}
                    value={availableQuantity}
                    onChange={e => setAvailableQuantity(Math.min(quantity, Math.max(0, parseInt(e.target.value) || 0)))}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Description & Usage Instructions *
              </label>
              <textarea
                required
                rows={2}
                placeholder="Details, fuel requirements, charging adapters, safety precautions..."
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Pickup Location / Address *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="e.g. 52 Oakridge Avenue, Garage Side"
                    value={locationName}
                    onChange={e => setLocationName(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                  <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Custodian Contact Phone *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={contactPhone}
                    onChange={e => setContactPhone(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                  <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                </div>
              </div>
            </div>

            {/* Latitude & Longitude Coordinates */}
            <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-0.5">
                  Latitude
                </label>
                <input
                  type="number"
                  step="0.0001"
                  value={latitude}
                  onChange={e => setLatitude(parseFloat(e.target.value) || 45.5152)}
                  className="w-full px-2 py-1 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-0.5">
                  Longitude
                </label>
                <input
                  type="number"
                  step="0.0001"
                  value={longitude}
                  onChange={e => setLongitude(parseFloat(e.target.value) || -122.6784)}
                  className="w-full px-2 py-1 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            {/* Admin Verification toggle if Administrator */}
            {isAdmin && editItem && (
              <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-blue-900 dark:text-blue-200 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-blue-500" />
                    <span>Administrator Verification</span>
                  </div>
                  <div className="text-[11px] text-blue-700 dark:text-blue-300">
                    Verify this resource for community-wide priority dispatch
                  </div>
                </div>
                <select
                  value={verificationStatus}
                  onChange={e => setVerificationStatus(e.target.value as VerificationStatus)}
                  className="px-2 py-1 text-xs rounded-lg border border-blue-300 dark:border-blue-700 bg-white dark:bg-slate-800 font-bold"
                >
                  <option value="verified">Verified</option>
                  <option value="pending">Pending</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            )}

            {/* Emergency Mode Eligible Toggle */}
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-4 h-4 text-red-500 shrink-0" />
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">
                    Emergency Priority Reserve Asset
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    Elevate this resource automatically during natural disaster mode
                  </div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={isEmergencyEligible}
                onChange={e => setIsEmergencyEligible(e.target.checked)}
                className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500 cursor-pointer"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-md shadow-teal-600/20 active:scale-95 transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
              >
                <Save className="w-4 h-4" />
                <span>{loading ? 'Saving...' : editItem ? 'Save Updates' : 'Publish to Community Hub'}</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
