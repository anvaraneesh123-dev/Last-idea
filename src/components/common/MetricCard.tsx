import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: LucideIcon;
  subtext?: string;
  colorScheme?: 'green' | 'brown' | 'red' | 'blue' | 'teal' | 'rose' | 'amber';
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  change,
  changeType = 'positive',
  icon: Icon,
  subtext,
  colorScheme = 'green',
}) => {
  const colorMap = {
    green: {
      border: 'hover:border-emerald-600/50',
      iconBg: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400',
      glow: 'from-emerald-600/10',
    },
    teal: {
      border: 'hover:border-emerald-600/50',
      iconBg: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400',
      glow: 'from-emerald-600/10',
    },
    brown: {
      border: 'hover:border-amber-800/50',
      iconBg: 'bg-amber-100/70 text-amber-900 dark:bg-amber-950/50 dark:text-amber-300',
      glow: 'from-amber-800/10',
    },
    amber: {
      border: 'hover:border-amber-800/50',
      iconBg: 'bg-amber-100/70 text-amber-900 dark:bg-amber-950/50 dark:text-amber-300',
      glow: 'from-amber-800/10',
    },
    red: {
      border: 'hover:border-red-600/50',
      iconBg: 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400',
      glow: 'from-red-600/10',
    },
    rose: {
      border: 'hover:border-red-600/50',
      iconBg: 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400',
      glow: 'from-red-600/10',
    },
    blue: {
      border: 'hover:border-blue-600/50',
      iconBg: 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400',
      glow: 'from-blue-600/10',
    },
  };

  const scheme = colorMap[colorScheme] || colorMap.green;

  return (
    <div className={`glass-card relative overflow-hidden rounded-2xl p-5 border transition-all duration-200 hover:shadow-lg ${scheme.border}`}>
      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${scheme.glow} to-transparent rounded-bl-full pointer-events-none`} />

      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-stone-600 dark:text-stone-400 uppercase tracking-wider">
          {title}
        </span>
        <div className={`p-2.5 rounded-xl ${scheme.iconBg}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="mt-4 flex items-baseline gap-2">
        <span className="text-2xl sm:text-3xl font-extrabold text-stone-900 dark:text-white tracking-tight">
          {value}
        </span>

        {change && (
          <span
            className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
              changeType === 'positive'
                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-500/20'
                : changeType === 'negative'
                ? 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300 border border-red-500/20'
                : 'bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-300'
            }`}
          >
            {change}
          </span>
        )}
      </div>

      {subtext && (
        <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">
          {subtext}
        </p>
      )}
    </div>
  );
};
