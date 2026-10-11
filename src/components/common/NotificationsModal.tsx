import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCommunity } from '../../context/CommunityContext';
import { useAuth } from '../../context/AuthContext';
import { AppNotification, NotificationType } from '../../types';
import { 
  Bell, 
  Check, 
  CheckCheck, 
  Trash2, 
  ExternalLink, 
  AlertTriangle, 
  HeartHandshake, 
  Package, 
  Users2, 
  X, 
  ShieldCheck, 
  Clock, 
  CloudOff, 
  CheckCircle2,
  Lock,
  Info
} from 'lucide-react';

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { 
    notifications, 
    unreadNotificationsCount, 
    markNotificationAsRead, 
    markAllNotificationsAsRead, 
    deleteNotification 
  } = useCommunity();
  const { currentUser } = useAuth();

  const [activeFilter, setActiveFilter] = useState<'all' | 'unread' | 'emergency' | 'requests'>('all');

  if (!isOpen) return null;

  const filteredNotifications = notifications.filter(n => {
    if (activeFilter === 'unread') return !n.isRead;
    if (activeFilter === 'emergency') return n.type === 'emergency_alert';
    if (activeFilter === 'requests') return n.type === 'request_response' || n.type === 'request_status_change';
    return true;
  });

  const handleNotificationClick = async (notif: AppNotification) => {
    if (!notif.isRead) {
      await markNotificationAsRead(notif.id);
    }
    if (notif.linkUrl) {
      navigate(notif.linkUrl);
      onClose();
    }
  };

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case 'emergency_alert':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'request_response':
      case 'request_status_change':
        return <HeartHandshake className="w-4 h-4 text-blue-500" />;
      case 'resource_availability':
        return <Package className="w-4 h-4 text-teal-500" />;
      case 'volunteer_assignment':
        return <Users2 className="w-4 h-4 text-purple-500" />;
      default:
        return <Bell className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[88vh]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="notif-modal-title"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 id="notif-modal-title" className="text-base font-bold text-slate-900 dark:text-white">
                  Notifications & Dispatches
                </h2>
                {unreadNotificationsCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-teal-600 text-white text-[10px] font-extrabold">
                    {unreadNotificationsCount} New
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Private feed for {currentUser?.fullName || 'Authenticated User'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {unreadNotificationsCount > 0 && (
              <button
                onClick={() => markAllNotificationsAsRead()}
                className="px-2.5 py-1.5 rounded-xl text-xs font-semibold text-teal-600 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-950/30 transition-colors flex items-center gap-1 cursor-pointer"
                title="Mark all as read"
                aria-label="Mark all notifications as read"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Mark all read</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="Close notifications modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Access Policy & Channel Disclosure Banner */}
        <div className="px-5 py-2.5 bg-blue-500/10 dark:bg-blue-950/20 border-b border-blue-500/20 text-[11px] text-blue-900 dark:text-blue-200 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 min-w-0">
            <Lock className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <span className="truncate">
              <strong>Isolated Account Feed:</strong> Only you and EOC dispatches can view these records.
            </span>
          </div>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-600/10 font-mono font-semibold shrink-0">
            Mesh Delivery
          </span>
        </div>

        {/* Filter Tabs */}
        <div className="p-3 border-b border-slate-100 dark:border-slate-800 flex items-center gap-1.5 overflow-x-auto text-xs bg-white dark:bg-slate-900">
          {[
            { id: 'all', label: 'All', count: notifications.length },
            { id: 'unread', label: 'Unread', count: unreadNotificationsCount },
            { id: 'emergency', label: 'Emergency Alerts', count: notifications.filter(n => n.type === 'emergency_alert').length },
            { id: 'requests', label: 'Aid Requests', count: notifications.filter(n => n.type === 'request_response' || n.type === 'request_status_change').length },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id as any)}
              className={`px-3 py-1.5 rounded-xl font-bold transition-colors cursor-pointer shrink-0 flex items-center gap-1.5 ${
                activeFilter === tab.id
                  ? 'bg-slate-900 text-white dark:bg-teal-600 dark:text-white'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                activeFilter === tab.id ? 'bg-white/20' : 'bg-slate-200 dark:bg-slate-800'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60 p-2 sm:p-3">
          {filteredNotifications.length === 0 ? (
            <div className="py-12 text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 mx-auto flex items-center justify-center">
                <Bell className="w-6 h-6 opacity-40" />
              </div>
              <p className="text-xs font-bold text-slate-600 dark:text-slate-300">
                No notifications in this view
              </p>
              <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                All requests, assignments, and safety bulletins will appear here.
              </p>
            </div>
          ) : (
            filteredNotifications.map(notif => (
              <div
                key={notif.id}
                className={`p-3.5 sm:p-4 rounded-2xl transition-all duration-150 flex items-start gap-3 my-1 ${
                  !notif.isRead 
                    ? 'bg-teal-500/[0.04] dark:bg-teal-500/[0.07] border border-teal-500/20' 
                    : 'hover:bg-slate-50 dark:hover:bg-slate-800/40 border border-transparent'
                }`}
              >
                {/* Type Icon */}
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                  notif.type === 'emergency_alert'
                    ? 'bg-red-500/10'
                    : notif.type === 'volunteer_assignment'
                    ? 'bg-purple-500/10'
                    : notif.type === 'resource_availability'
                    ? 'bg-teal-500/10'
                    : 'bg-blue-500/10'
                }`}>
                  {getNotificationIcon(notif.type)}
                </div>

                {/* Content */}
                <div 
                  className="flex-1 min-w-0 cursor-pointer"
                  onClick={() => handleNotificationClick(notif)}
                >
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="font-bold text-xs text-slate-900 dark:text-white">
                      {notif.title}
                    </span>
                    {!notif.isRead && (
                      <span className="w-2 h-2 rounded-full bg-teal-500 shrink-0" title="Unread" />
                    )}

                    {/* Delivery Status Badge */}
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                      notif.deliveryStatus === 'server_confirmed'
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                        : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                    }`}>
                      {notif.deliveryStatus === 'server_confirmed' ? (
                        <>
                          <CheckCircle2 className="w-2.5 h-2.5" />
                          <span>Server Confirmed</span>
                        </>
                      ) : (
                        <>
                          <Clock className="w-2.5 h-2.5" />
                          <span>Locally Queued</span>
                        </>
                      )}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                    {notif.message}
                  </p>

                  <div className="flex items-center gap-3 mt-2 text-[10px] text-slate-400 font-medium">
                    <span>{notif.timestamp}</span>
                    {notif.linkUrl && (
                      <span className="text-teal-600 dark:text-teal-400 font-bold flex items-center gap-0.5 hover:underline">
                        <span>View record</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 shrink-0">
                  {!notif.isRead && (
                    <button
                      onClick={() => markNotificationAsRead(notif.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                      title="Mark as read"
                      aria-label="Mark notification as read"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button
                    onClick={() => deleteNotification(notif.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    title="Dismiss notification"
                    aria-label="Dismiss notification"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Disclaimer */}
        <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-2">
          <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span>
            External SMS and Email gateways operate in simulated demonstration mode without third-party telecommunication credentials.
          </span>
        </div>
      </div>
    </div>
  );
};
