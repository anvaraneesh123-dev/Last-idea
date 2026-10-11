import React, { useState } from 'react';
import { useCommunity } from '../context/CommunityContext';
import { ResourceCard } from '../components/resources/ResourceCard';
import { AddResourceModal } from '../components/resources/AddResourceModal';
import { ResourceCategory, ResourceStatus, ResourceItem } from '../types';
import { 
  PackageSearch, 
  Plus, 
  Search, 
  Filter, 
  Wrench, 
  HeartPulse, 
  Zap, 
  Droplet, 
  Home, 
  Radio, 
  ShieldCheck,
  Building2,
  LifeBuoy,
  Users2,
  Loader2
} from 'lucide-react';

interface ResourcesPageProps {
  onOpenAddResource: () => void;
}

export const ResourcesPage: React.FC<ResourcesPageProps> = ({ onOpenAddResource }) => {
  const { resources, isLoadingResources, currentCommunity, isEmergencyMode } = useCommunity();

  const [selectedCategory, setSelectedCategory] = useState<ResourceCategory | 'all'>('all');
  const [selectedStatus, setSelectedStatus] = useState<ResourceStatus | 'all'>('all');
  const [localSearch, setLocalSearch] = useState('');
  const [emergencyOnly, setEmergencyOnly] = useState(false);
  const [editingResource, setEditingResource] = useState<ResourceItem | null>(null);

  // All 10 categories specified
  const categories = [
    { id: 'all', label: 'All Resources', icon: PackageSearch },
    { id: 'food', label: 'Food Distribution', icon: Droplet },
    { id: 'water', label: 'Water & Purification', icon: Droplet },
    { id: 'medicine', label: 'Medicine & First Aid', icon: HeartPulse },
    { id: 'hospitals', label: 'Hospitals & Triage', icon: Building2 },
    { id: 'shelters', label: 'Shelters & Space', icon: Home },
    { id: 'generators', label: 'Generators & Power', icon: Zap },
    { id: 'rescue_equipment', label: 'Rescue Equipment', icon: LifeBuoy },
    { id: 'volunteers', label: 'Volunteer Teams', icon: Users2 },
    { id: 'tools', label: 'Tools & Hardware', icon: Wrench },
    { id: 'other_services', label: 'Other Services', icon: Radio },
  ];

  const filteredResources = resources.filter(res => {
    // category filter
    if (selectedCategory !== 'all' && res.category !== selectedCategory) return false;
    // status filter
    if (selectedStatus !== 'all') {
      if (selectedStatus === 'available' && (res.availableQuantity === 0 || res.availability === 'deactivated')) return false;
      if (selectedStatus === 'in_use' && res.availableQuantity > 0) return false;
      if (selectedStatus === 'critical_reserve' && res.status !== 'critical_reserve') return false;
    }
    // emergency only
    if (emergencyOnly && !res.isEmergencyEligible) return false;
    // search
    if (localSearch.trim()) {
      const q = localSearch.toLowerCase();
      return (
        res.name.toLowerCase().includes(q) ||
        res.title.toLowerCase().includes(q) ||
        res.description.toLowerCase().includes(q) ||
        res.ownerName.toLowerCase().includes(q) ||
        (res.locationName && res.locationName.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const availableCount = resources.filter(r => r.availableQuantity > 0 && r.availability !== 'deactivated').length;
  const criticalCount = resources.filter(r => r.status === 'critical_reserve').length;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-stone-900 dark:text-white tracking-tight">
              Community Resource Directory
            </h1>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-500/20">
              {resources.length} registered
            </span>
          </div>
          <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 mt-1">
            Discover, lend, and borrow shared equipment across {currentCommunity.name}. Zero rental fees, neighbor-powered.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenAddResource}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>List an Item</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl glass-card border border-slate-200/80 dark:border-slate-800/80 space-y-4">
        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Search box */}
          <div className="relative flex-1 w-full">
            <input
              type="text"
              placeholder="Search by equipment name, tool model, custodian, location..."
              value={localSearch}
              onChange={e => setLocalSearch(e.target.value)}
              className="w-full pl-9 pr-8 py-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
            {localSearch && (
              <button
                onClick={() => setLocalSearch('')}
                className="absolute right-2.5 top-2.5 text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>

          {/* Quick status pills */}
          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
            <button
              onClick={() => setSelectedStatus('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap cursor-pointer transition-colors ${
                selectedStatus === 'all'
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
              }`}
            >
              All Status ({resources.length})
            </button>

            <button
              onClick={() => setSelectedStatus('available')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap cursor-pointer transition-colors ${
                selectedStatus === 'available'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
              }`}
            >
              Available Now ({availableCount})
            </button>

            <button
              onClick={() => setSelectedStatus('critical_reserve')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap cursor-pointer transition-colors ${
                selectedStatus === 'critical_reserve'
                  ? 'bg-amber-600 text-white'
                  : 'bg-amber-500/10 text-amber-700 dark:text-amber-300'
              }`}
            >
              Critical Reserve ({criticalCount})
            </button>

            <button
              onClick={() => setEmergencyOnly(!emergencyOnly)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap cursor-pointer transition-colors flex items-center gap-1 ${
                emergencyOnly
                  ? 'bg-red-600 text-white'
                  : 'bg-red-500/10 text-red-700 dark:text-red-300'
              }`}
            >
              <ShieldCheck className="w-3 h-3" />
              <span>Disaster Eligible</span>
            </button>
          </div>
        </div>

        {/* Category horizontal pills (10 Categories) */}
        <div className="flex items-center gap-2 overflow-x-auto pt-2 border-t border-slate-100 dark:border-slate-800/80 pb-1">
          {categories.map(cat => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.id;

            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id as any)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-teal-600 text-white shadow-sm font-bold'
                    : 'bg-slate-100 dark:bg-slate-800/70 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid of Results / Loading State */}
      {isLoadingResources ? (
        <div className="p-16 text-center rounded-3xl glass-card flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 text-teal-500 animate-spin" />
          <p className="text-xs text-slate-400 font-semibold">Synchronizing resource registry...</p>
        </div>
      ) : filteredResources.length === 0 ? (
        <div className="p-12 text-center rounded-3xl glass-card border border-dashed border-slate-300 dark:border-slate-800">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 mx-auto flex items-center justify-center mb-3">
            <PackageSearch className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">No resources found</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1">
            No items matched your current filter or search terms. Try loosening the filter criteria or list a new item.
          </p>
          <button
            onClick={() => {
              setSelectedCategory('all');
              setSelectedStatus('all');
              setLocalSearch('');
              setEmergencyOnly(false);
            }}
            className="mt-4 px-4 py-2 rounded-xl text-xs font-bold bg-teal-600 text-white cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredResources.map(resource => (
            <ResourceCard 
              key={resource.id} 
              resource={resource} 
              onEdit={item => setEditingResource(item)}
            />
          ))}
        </div>
      )}

      {/* Edit Resource Modal */}
      {editingResource && (
        <AddResourceModal
          isOpen={Boolean(editingResource)}
          onClose={() => setEditingResource(null)}
          editItem={editingResource}
        />
      )}

    </div>
  );
};
