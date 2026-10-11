import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: LucideIcon;
  subtext?: string;
  colorScheme?: 'teal' | 'blue' | 'rose' | 'amber';
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  change,
  changeType = 'positive',
  icon: Icon,
  subtext,
  colorScheme = 'teal',
}) => {
  const colorMap = {
    teal: {
      border: 'hover:border-teal-500/40',
      iconBg: 'bg-teal-500/10 text-teal-600 dark:text-teal-400',
      glow: 'from-teal-500/5',
    },
    blue: {
      border: 'hover:border-blue-500/40',
      iconBg: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
      glow: 'from-blue-500/5',
    },
    rose: {
      border: 'hover:border-rose-500/40',
      iconBg: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
      glow: 'from-rose-500/5',
    },
    amber: {
      border: 'hover:border-amber-500/40',
      iconBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
      glow: 'from-amber-500/5',
    },
  };

  const scheme = colorMap[colorScheme];

  return (
    <div className={`glass-card relative overflow-hidden rounded-2xl p-5 border transition-all duration-200 hover:shadow-lg ${scheme.border}`}>
      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${scheme.glow} to-transparent rounded-bl-full pointer-events-none`} />

      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          {title}
        </span>
        <div className={`p-2.5 rounded-xl ${scheme.iconBg}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          {value}
        </span>
        {change && (
          <span className={`text-xs font-bold px-1.5 py-0.5 rounded-md ${
            changeType === 'positive'
              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
              : changeType === 'negative'
              ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
              : 'bg-slate-500/10 text-slate-600 dark:text-slate-400'
          }`}>
            {change}
          </span>
        )}
      </div>

      {subtext && (
        <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
          {subtext}
        </p>
      )}
    </div>
  );
};
