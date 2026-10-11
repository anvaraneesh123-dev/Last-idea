import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCommunity } from '../../context/CommunityContext';
import { AlertTriangle, CheckCircle2, Info, X, ShieldAlert } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useCommunity();

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2.5 max-w-md w-full pointer-events-none px-4 sm:px-0">
      <AnimatePresence>
        {toasts.map(toast => {
          const isEmergency = toast.type === 'emergency';
          const isSuccess = toast.type === 'success';
          const isWarning = toast.type === 'warning';

          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className={`pointer-events-auto rounded-xl p-4 shadow-xl border backdrop-blur-md flex items-start gap-3 relative overflow-hidden ${
                isEmergency
                  ? 'bg-red-500/15 border-red-500/40 text-red-950 dark:text-red-100 shadow-red-500/10'
                  : isSuccess
                  ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-950 dark:text-emerald-100 shadow-emerald-500/10'
                  : isWarning
                  ? 'bg-amber-500/15 border-amber-500/40 text-amber-950 dark:text-amber-100 shadow-amber-500/10'
                  : 'bg-teal-500/15 border-teal-500/40 text-teal-950 dark:text-teal-100 shadow-teal-500/10'
              }`}
            >
              <div className="shrink-0 mt-0.5">
                {isEmergency && <ShieldAlert className="w-5 h-5 text-red-600 dark:text-red-400 animate-pulse" />}
                {isSuccess && <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />}
                {isWarning && <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />}
                {!isEmergency && !isSuccess && !isWarning && <Info className="w-5 h-5 text-teal-600 dark:text-teal-400" />}
              </div>

              <div className="flex-1 min-w-0 pr-4">
                <div className="text-sm font-semibold tracking-tight">{toast.title}</div>
                <div className="text-xs mt-0.5 opacity-90 leading-relaxed">{toast.message}</div>
              </div>

              <button
                onClick={() => removeToast(toast.id)}
                className="shrink-0 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                aria-label="Dismiss notification"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};
