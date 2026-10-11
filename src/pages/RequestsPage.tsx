import React, { useState } from 'react';
import { useCommunity } from '../context/CommunityContext';
import { useAuth } from '../context/AuthContext';
import { CommunityRequest, RequestStatus, ResourceCategory } from '../types';
import { 
  Inbox, 
  Plus, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Search, 
  Phone, 
  MapPin, 
  XCircle, 
  Check, 
  Filter, 
  HeartHandshake, 
  PackageSearch,
  Sparkles,
  X,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  Zap,
  RotateCcw,
  SlidersHorizontal,
  Info,
  WifiOff
} from 'lucide-react';

export const RequestsPage: React.FC = () => {
  const { requests, addRequest, updateRequestStatus, currentCommunity, resources } = useCommunity();
  const { currentUser, isAdmin, isVolunteer } = useAuth();

  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [showNewModal, setShowNewModal] = useState(false);
  const [expandedMatchId, setExpandedMatchId] = useState<string | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [requesterName, setRequesterName] = useState(currentUser.fullName);
  const [requesterPhone, setRequesterPhone] = useState(currentUser.phone || '+1 (555) 234-8891');
  const [location, setLocation] = useState('54 Valley Crest Way, Cascadia');
  const [details, setDetails] = useState('');
  const [category, setCategory] = useState<ResourceCategory>('tools');
  const [type, setType] = useState<CommunityRequest['type']>('resource_borrow');
  const [urgency, setUrgency] = useState<CommunityRequest['urgency']>('medium');
  const [quantityRequested, setQuantityRequested] = useState<number>(1);
  const [formError, setFormError] = useState('');

  const statuses: RequestStatus[] = [
    'Open',
    'Matched',
    'Accepted',
    'In Progress',
    'Fulfilled',
    'Cancelled',
    'Expired',
  ];

  const filteredRequests = requests.filter(req => {
    if (filterStatus !== 'all' && req.status !== filterStatus) return false;
    if (filterCategory !== 'all' && req.category !== filterCategory) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        req.title.toLowerCase().includes(q) ||
        req.requesterName.toLowerCase().includes(q) ||
        req.location.toLowerCase().includes(q) ||
        req.details.toLowerCase().includes(q) ||
        (req.matchedResourceName && req.matchedResourceName.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!title.trim() || !requesterName.trim() || !location.trim()) {
      setFormError('Please fill out all required fields.');
      return;
    }

    if (quantityRequested <= 0) {
      setFormError('Quantity requested must be greater than zero.');
      return;
    }

    try {
      await addRequest({
        title,
        description: details,
        requesterName,
        requesterPhone,
        location,
        locationName: location,
        details,
        category,
        type,
        urgency,
        quantityRequested: Number(quantityRequested),
      });

      setTitle('');
      setDetails('');
      setShowNewModal(false);
    } catch (err: any) {
      setFormError(err.message || 'Failed to submit request.');
    }
  };

  const openCount = requests.filter(r => r.status === 'Open').length;
  const matchedCount = requests.filter(r => r.status === 'Matched').length;
  const inProgressCount = requests.filter(r => r.status === 'Accepted' || r.status === 'In Progress').length;
  const fulfilledCount = requests.filter(r => r.status === 'Fulfilled').length;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Community Requests & Intelligent Matching
            </h1>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20">
              {requests.length} Tickets
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Citizen aid petitions matched against community resources with geo-distance ranking and non-double allocation.
          </p>
        </div>

        <button
          onClick={() => {
            setRequesterName(currentUser.fullName);
            setRequesterPhone(currentUser.phone || '+1 (555) 234-8891');
            setShowNewModal(true);
          }}
          className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-md shadow-teal-600/20 active:scale-95 transition-all flex items-center gap-2 cursor-pointer w-fit"
        >
          <Plus className="w-4 h-4" />
          <span>Submit Aid Request</span>
        </button>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="glass-card rounded-2xl p-4 border flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Open Requests
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              {openCount}
            </div>
            <div className="text-[10px] text-slate-400">Awaiting matches</div>
          </div>
          <div className="p-3 rounded-xl bg-blue-500/10 text-blue-500">
            <Inbox className="w-5 h-5" />
          </div>
        </div>

        <div className="glass-card rounded-2xl p-4 border flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold text-teal-600 dark:text-teal-400 uppercase tracking-wider">
              Matched & Ready
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              {matchedCount}
            </div>
            <div className="text-[10px] text-teal-600 dark:text-teal-400">AI Match Engine</div>
          </div>
          <div className="p-3 rounded-xl bg-teal-500/10 text-teal-500">
            <Sparkles className="w-5 h-5" />
          </div>
        </div>

        <div className="glass-card rounded-2xl p-4 border flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
              In Progress / En Route
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              {inProgressCount}
            </div>
            <div className="text-[10px] text-amber-600 dark:text-amber-400">Stock Reserved</div>
          </div>
          <div className="p-3 rounded-xl bg-amber-500/10 text-amber-500">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="glass-card rounded-2xl p-4 border flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
              Fulfilled
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              {fulfilledCount}
            </div>
            <div className="text-[10px] text-emerald-600 dark:text-emerald-400">Mutual aid resolved</div>
          </div>
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-500">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl glass-card border border-slate-200/80 dark:border-slate-800/80 space-y-3">
        <div className="flex flex-col md:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <input
              type="text"
              placeholder="Search request description, requester, address, or matched gear..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
          </div>

          {/* Status Filter Pills (Includes all 7 statuses) */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                filterStatus === 'all'
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
              }`}
            >
              All ({requests.length})
            </button>
            {statuses.map(st => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  filterStatus === st
                    ? 'bg-teal-600 text-white font-bold'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Requests List */}
      <div className="space-y-4">
        {filteredRequests.length === 0 ? (
          <div className="p-12 text-center rounded-3xl glass-card border border-dashed border-slate-300 dark:border-slate-800">
            <Inbox className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">No requests found</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              No tickets matched the filter criteria.
            </p>
          </div>
        ) : (
          filteredRequests.map(req => {
            const isCritical = req.urgency === 'critical';
            const isHigh = req.urgency === 'high';
            const isExpanded = expandedMatchId === req.id;
            const topMatch = req.matchRecommendations && req.matchRecommendations.length > 0
              ? req.matchRecommendations[0]
              : null;

            return (
              <div
                key={req.id}
                className={`p-5 rounded-2xl glass-card border transition-all space-y-4 ${
                  req.status === 'Open'
                    ? 'border-blue-500/30 bg-blue-500/[0.01]'
                    : req.status === 'Matched'
                    ? 'border-teal-500/50 bg-teal-500/[0.02] ring-1 ring-teal-500/20'
                    : req.status === 'Accepted' || req.status === 'In Progress'
                    ? 'border-amber-500/40 bg-amber-500/[0.02]'
                    : req.status === 'Fulfilled'
                    ? 'border-emerald-500/30 bg-emerald-500/[0.01] opacity-90'
                    : 'border-slate-200 dark:border-slate-800 opacity-60'
                }`}
              >
                {/* Main Row */}
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        isCritical
                          ? 'bg-red-600 text-white'
                          : isHigh
                          ? 'bg-amber-600 text-white'
                          : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}>
                        {req.urgency} Urgency
                      </span>

                      <span className="text-xs font-mono px-2 py-0.5 rounded bg-teal-500/10 text-teal-600 dark:text-teal-400 font-semibold uppercase">
                        {req.category.replace('_', ' ')}
                      </span>

                      <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                        Qty: {req.quantityRequested || 1}
                      </span>

                      <span className="font-black text-sm text-slate-900 dark:text-white">
                        {req.title}
                      </span>

                      {req.id.startsWith('req-draft-') && (
                        <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/40 text-[10px] font-black uppercase flex items-center gap-1 animate-pulse">
                          <WifiOff className="w-3 h-3 text-amber-500" />
                          Offline Draft (Queued for Sync)
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
                      {req.details || req.description}
                    </p>

                    <div className="flex items-center gap-4 text-[11px] text-slate-400 pt-1 flex-wrap">
                      <span className="flex items-center gap-1 text-slate-700 dark:text-slate-300 font-medium">
                        <MapPin className="w-3.5 h-3.5 text-teal-500" />
                        <span>{req.location}</span>
                      </span>
                      <span>Requester: <strong className="text-slate-800 dark:text-slate-200">{req.requesterName}</strong></span>
                      <span>Phone: <strong className="font-mono">{req.requesterPhone}</strong></span>
                      <span>• {req.timestamp}</span>
                    </div>
                  </div>

                  {/* Status Badge & Control Buttons */}
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <div className="flex items-center gap-1.5">
                      <span className={`px-2.5 py-1 rounded-xl text-xs font-black uppercase tracking-wider border ${
                        req.status === 'Open'
                          ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20'
                          : req.status === 'Matched'
                          ? 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/30'
                          : req.status === 'Accepted'
                          ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/30'
                          : req.status === 'In Progress'
                          ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30'
                          : req.status === 'Fulfilled'
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                          : 'bg-slate-200 dark:bg-slate-800 text-slate-500 border-slate-300'
                      }`}>
                        {req.status}
                      </span>
                    </div>

                    {/* Status Action Buttons with double-allocation prevention */}
                    <div className="flex items-center gap-1.5 flex-wrap justify-end">
                      {req.status === 'Open' && topMatch && (
                        <button
                          onClick={() => updateRequestStatus(req.id, 'Matched', currentUser.fullName, topMatch.resource.id)}
                          className="px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs flex items-center gap-1 cursor-pointer"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Link Top Match</span>
                        </button>
                      )}

                      {req.status === 'Matched' && (
                        <>
                          <button
                            onClick={() => updateRequestStatus(
                              req.id, 
                              'Accepted', 
                              currentUser.fullName, 
                              req.matchedResourceId, 
                              'Accepted match and reserved stock inventory.'
                            )}
                            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1 cursor-pointer shadow-sm"
                            title="Reserves available quantity to prevent double allocation"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Accept & Reserve Stock</span>
                          </button>
                          <button
                            onClick={() => updateRequestStatus(req.id, 'Open', currentUser.fullName, undefined, 'Match rejected')}
                            className="px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-white font-semibold text-xs cursor-pointer"
                          >
                            Decline
                          </button>
                        </>
                      )}

                      {req.status === 'Accepted' && (
                        <button
                          onClick={() => updateRequestStatus(req.id, 'In Progress', currentUser.fullName)}
                          className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs flex items-center gap-1 cursor-pointer shadow-sm"
                        >
                          <Clock className="w-3.5 h-3.5" />
                          <span>Start Dispatch</span>
                        </button>
                      )}

                      {(req.status === 'Accepted' || req.status === 'In Progress') && (
                        <>
                          <button
                            onClick={() => updateRequestStatus(req.id, 'Fulfilled', currentUser.fullName)}
                            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1 cursor-pointer shadow-sm"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Mark Fulfilled</span>
                          </button>

                          <button
                            onClick={() => updateRequestStatus(req.id, 'Cancelled', currentUser.fullName, undefined, 'Cancelled by dispatcher - stock restored.')}
                            className="px-2.5 py-1.5 rounded-xl text-red-500 hover:bg-red-500/10 font-bold text-xs cursor-pointer"
                            title="Restores stock back to available pool"
                          >
                            Cancel
                          </button>
                        </>
                      )}

                      {req.status === 'Open' && (
                        <button
                          onClick={() => updateRequestStatus(req.id, 'Cancelled', currentUser.fullName)}
                          className="px-2.5 py-1 text-slate-400 hover:text-red-500 font-semibold text-xs cursor-pointer"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* MATCHED RESOURCE SECTION (Shows WHY match is recommended) */}
                {req.matchedResourceName && (
                  <div className="p-3.5 rounded-xl bg-teal-500/10 border border-teal-500/20 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-teal-800 dark:text-teal-200 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-teal-500" />
                        <span>Allocated Resource: {req.matchedResourceName}</span>
                      </span>
                      {req.allocatedQuantity ? (
                        <span className="font-mono text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                          {req.allocatedQuantity} Units Reserved
                        </span>
                      ) : null}
                    </div>
                    {req.matchReason && (
                      <p className="text-[11px] text-teal-700 dark:text-teal-300 leading-relaxed">
                        <strong>Match Rationale:</strong> {req.matchReason}
                      </p>
                    )}
                  </div>
                )}

                {/* INTELLIGENT MATCHING RECOMMENDATIONS ACCORDION */}
                {req.matchRecommendations && req.matchRecommendations.length > 0 && req.status !== 'Fulfilled' && (
                  <div className="border-t border-slate-100 dark:border-slate-800/80 pt-3">
                    <button
                      onClick={() => setExpandedMatchId(isExpanded ? null : req.id)}
                      className="flex items-center justify-between w-full text-xs font-bold text-teal-600 dark:text-teal-400 hover:text-teal-500 cursor-pointer"
                    >
                      <span className="flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>
                          {req.matchRecommendations.length} AI Ranked Resource Matches Available
                        </span>
                      </span>
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>

                    {isExpanded && (
                      <div className="mt-3 space-y-2.5">
                        {req.matchRecommendations.slice(0, 3).map((rec, idx) => (
                          <div
                            key={rec.resource.id}
                            className="p-3 rounded-xl bg-slate-50 dark:bg-slate-850/80 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                          >
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-slate-900 dark:text-white">
                                  #{idx + 1} {rec.resource.name}
                                </span>
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20">
                                  {rec.score}% Match Score
                                </span>
                                <span className="text-[10px] text-slate-400 font-mono">
                                  ~{rec.distanceKm} km away
                                </span>
                              </div>

                              {/* WHY EACH MATCH IS RECOMMENDED */}
                              <div className="space-y-0.5 pt-0.5">
                                <div className="text-[10px] font-bold text-slate-400 uppercase">
                                  Why Recommended:
                                </div>
                                <ul className="list-disc list-inside text-[11px] text-slate-600 dark:text-slate-300 space-y-0.5">
                                  {rec.reasons.map((r, i) => (
                                    <li key={i}>{r}</li>
                                  ))}
                                </ul>
                              </div>
                            </div>

                            {/* Allocate Button */}
                            {req.status === 'Open' && (
                              <button
                                onClick={() => updateRequestStatus(
                                  req.id,
                                  'Matched',
                                  currentUser.fullName,
                                  rec.resource.id,
                                  rec.reasons.join('. ')
                                )}
                                className="px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs whitespace-nowrap self-start sm:self-center cursor-pointer"
                              >
                                Select This Match
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* New Request Modal */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Inbox className="w-5 h-5 text-teal-500" />
                <span>Submit Citizen Aid / Resource Request</span>
              </h3>
              <button
                onClick={() => setShowNewModal(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs">
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Request Headline *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Heavy Duty Chainsaw for fallen pine tree across driveway"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              {/* 10 Categories */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Resource Category *
                  </label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value as ResourceCategory)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="tools">Tools & Hardware</option>
                    <option value="generators">Generators & Microgrids</option>
                    <option value="water">Water & Purification</option>
                    <option value="food">Food Distribution</option>
                    <option value="medicine">Medicine & First Aid</option>
                    <option value="hospitals">Hospitals & Urgent Care</option>
                    <option value="shelters">Shelters & Space</option>
                    <option value="rescue_equipment">Rescue Equipment</option>
                    <option value="volunteers">Volunteers & Responders</option>
                    <option value="other_services">Other Essential Services</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Quantity Needed *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={quantityRequested}
                    onChange={e => setQuantityRequested(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Request Type
                  </label>
                  <select
                    value={type}
                    onChange={e => setType(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="resource_borrow">Equipment / Tool Borrow</option>
                    <option value="medical_assist">Medical / First Aid Assist</option>
                    <option value="mutual_aid">Mutual Aid / Welfare Check</option>
                    <option value="infrastructure">Infrastructure & Sandbags</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Urgency
                  </label>
                  <select
                    value={urgency}
                    onChange={e => setUrgency(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="critical">Critical (Immediate Hazard)</option>
                    <option value="high">High (Within 4 Hours)</option>
                    <option value="medium">Medium (Within 24 Hours)</option>
                    <option value="low">Low (Flexible / Weekend)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Requester Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={requesterName}
                    onChange={e => setRequesterName(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Requester Phone *
                  </label>
                  <input
                    type="text"
                    required
                    value={requesterPhone}
                    onChange={e => setRequesterPhone(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Location / Address *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 54 Valley Crest Way"
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Details & Context *
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Describe what is needed, safety precautions, how long the item will be used..."
                  value={details}
                  onChange={e => setDetails(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-slate-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-md shadow-teal-600/20 active:scale-95 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Submit & Auto-Match</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
