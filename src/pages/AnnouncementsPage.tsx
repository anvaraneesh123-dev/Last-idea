import React, { useState } from 'react';
import { useCommunity } from '../context/CommunityContext';
import { 
  Vote, 
  Megaphone, 
  Calendar, 
  CheckCircle2, 
  ShieldCheck, 
  Clock, 
  Send, 
  Plus, 
  Users,
  Award
} from 'lucide-react';

export const AnnouncementsPage: React.FC = () => {
  const { alerts, addAlert, polls, votePoll, currentCommunity } = useCommunity();

  const [activeTab, setActiveTab] = useState<'bulletins' | 'polls' | 'townhalls'>('bulletins');
  const [showPostNotice, setShowPostNotice] = useState(false);
  const [noticeTitle, setNoticeTitle] = useState('');
  const [noticeMessage, setNoticeMessage] = useState('');
  const [noticeCategory, setNoticeCategory] = useState<'infrastructure' | 'safety' | 'health' | 'civic'>('civic');

  const handlePostNotice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noticeTitle.trim() || !noticeMessage.trim()) return;

    addAlert({
      title: noticeTitle,
      message: noticeMessage,
      severity: 'info',
      category: noticeCategory,
      author: 'Alex Miller (Resident Council)',
    });

    setNoticeTitle('');
    setNoticeMessage('');
    setShowPostNotice(false);
  };

  const townhallEvents = [
    {
      id: 'th-1',
      title: 'Annual Disaster Preparedness & Solar Microgrid Assembly',
      date: 'Next Tuesday • 7:00 PM',
      location: 'Civic Recreation Hall & Live LoRa Audio Stream',
      description: 'Review of emergency supplies, sandbag depots, volunteer squad enrollments, and municipal grant allocations.',
      attendees: 142,
    },
    {
      id: 'th-2',
      title: 'Quarterly Community Tool Library & Repair Cafe',
      date: 'Saturday, Oct 25 • 10:00 AM',
      location: 'Workshop Shed #2, Community Gardens',
      description: 'Bring broken lawn equipment, chainsaws, bikes, and appliances. Certified volunteer handymen and electricians on duty.',
      attendees: 68,
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Notice Board & Civic Participation
            </h1>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20">
              Verified Bulletins
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Official announcements, decentralized community ballots, and assembly agendas for {currentCommunity.name}.
          </p>
        </div>

        <button
          onClick={() => setShowPostNotice(!showPostNotice)}
          className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-md shadow-teal-600/20 active:scale-95 transition-all flex items-center gap-2 cursor-pointer w-fit"
        >
          <Plus className="w-4 h-4" />
          <span>Post Official Bulletin</span>
        </button>
      </div>

      {/* Post notice expandable box */}
      {showPostNotice && (
        <form onSubmit={handlePostNotice} className="p-6 rounded-3xl glass-card border border-teal-500/40 space-y-4 animate-in fade-in duration-150">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Megaphone className="w-4 h-4 text-teal-500" />
              <span>Draft Community Announcement</span>
            </h3>
            <button
              type="button"
              onClick={() => setShowPostNotice(false)}
              className="text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              Cancel
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <input
                type="text"
                required
                placeholder="Bulletin headline (e.g. Scheduled Water Pipe Maintenance)"
                value={noticeTitle}
                onChange={e => setNoticeTitle(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <select
                value={noticeCategory}
                onChange={e => setNoticeCategory(e.target.value as any)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="civic">Civic / Community</option>
                <option value="infrastructure">Infrastructure</option>
                <option value="safety">Public Safety</option>
                <option value="health">Health & Wellness</option>
              </select>
            </div>
          </div>

          <textarea
            required
            rows={3}
            placeholder="Detailed announcement details, affected streets, dates, or contact links..."
            value={noticeMessage}
            onChange={e => setNoticeMessage(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
          />

          <div className="flex justify-end">
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-md shadow-teal-600/20 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Broadcast Bulletin</span>
            </button>
          </div>
        </form>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('bulletins')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'bulletins'
              ? 'bg-teal-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Megaphone className="w-4 h-4" />
          <span>Official Bulletins ({alerts.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('polls')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'polls'
              ? 'bg-teal-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Vote className="w-4 h-4" />
          <span>Civic Polls & Ballots ({polls.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('townhalls')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'townhalls'
              ? 'bg-teal-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Townhall Assemblies ({townhallEvents.length})</span>
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === 'bulletins' && (
        <div className="space-y-4">
          {alerts.map(alert => (
            <div key={alert.id} className="p-6 rounded-3xl glass-card border border-slate-200/80 dark:border-slate-800/80 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                    alert.severity === 'severe'
                      ? 'bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300'
                      : alert.severity === 'warning'
                      ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                      : 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300'
                  }`}>
                    {alert.severity}
                  </span>

                  <span className="text-xs font-mono text-slate-400 uppercase">
                    {alert.category}
                  </span>

                  <span className="inline-flex items-center gap-1 text-[11px] text-teal-600 dark:text-teal-400 font-semibold">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Verified
                  </span>
                </div>

                <div className="text-xs text-slate-400 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{alert.timestamp}</span>
                </div>
              </div>

              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {alert.title}
              </h3>

              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {alert.message}
              </p>

              {alert.actionRequired && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-500/20 text-xs font-semibold text-rose-800 dark:text-rose-300">
                  ⚠️ Action Required: {alert.actionRequired}
                </div>
              )}

              <div className="pt-2 flex items-center justify-between text-xs text-slate-400">
                <span>Issued by: <strong className="text-slate-700 dark:text-slate-300">{alert.author}</strong></span>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'polls' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {polls.map(poll => (
            <div key={poll.id} className="p-6 rounded-3xl glass-card border border-slate-200/80 dark:border-slate-800/80 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
                  {poll.category}
                </span>
                <span className="text-xs text-slate-400 font-medium">
                  {poll.endsIn}
                </span>
              </div>

              <h3 className="text-base font-bold text-slate-900 dark:text-white leading-snug">
                {poll.question}
              </h3>

              <div className="space-y-2.5 pt-2">
                {poll.options.map(option => {
                  const percentage = poll.totalVotes > 0 
                    ? Math.round((option.votes / poll.totalVotes) * 100) 
                    : 0;
                  const isUserChoice = poll.userVotedOptionId === option.id;

                  return (
                    <button
                      key={option.id}
                      onClick={() => votePoll(poll.id, option.id)}
                      disabled={!!poll.userVotedOptionId}
                      className={`w-full text-left p-3 rounded-2xl border transition-all relative overflow-hidden cursor-pointer ${
                        isUserChoice
                          ? 'border-teal-500 bg-teal-500/10'
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                      }`}
                    >
                      {/* Vote progress backdrop fill */}
                      <div
                        className="absolute inset-y-0 left-0 bg-teal-500/10 transition-all duration-500 pointer-events-none"
                        style={{ width: `${percentage}%` }}
                      />

                      <div className="relative z-10 flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                          {isUserChoice && <CheckCircle2 className="w-4 h-4 text-teal-500 shrink-0" />}
                          <span>{option.text}</span>
                        </span>
                        <span className="font-mono font-bold text-teal-600 dark:text-teal-400 shrink-0 ml-2">
                          {percentage}% ({option.votes})
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
                <span>{poll.totalVotes} total verified resident votes</span>
                <span>{poll.userVotedOptionId ? '✓ Your ballot recorded' : 'Click an option to cast ballot'}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'townhalls' && (
        <div className="space-y-4">
          {townhallEvents.map(event => (
            <div key={event.id} className="p-6 rounded-3xl glass-card border border-slate-200/80 dark:border-slate-800/80 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <span className="text-xs font-bold text-teal-600 dark:text-teal-400 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  {event.date}
                </span>
                <span className="text-xs text-slate-500 flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-slate-400" />
                  {event.attendees} Residents RSVP'd
                </span>
              </div>

              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {event.title}
              </h3>

              <div className="text-xs text-slate-500 dark:text-slate-400">
                Location: <strong className="text-slate-700 dark:text-slate-300">{event.location}</strong>
              </div>

              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {event.description}
              </p>

              <div className="pt-2 flex gap-2">
                <button
                  onClick={() => alert(`RSVP confirmed for ${event.title}`)}
                  className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-md shadow-teal-600/20 active:scale-95 transition-all cursor-pointer"
                >
                  RSVP & Add to Calendar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};
