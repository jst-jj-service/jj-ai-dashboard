import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  badge?: {
    text: string;
    variant?: 'emerald' | 'amber' | 'blue' | 'purple';
  };
}

export function StatCard({ title, value, subtitle, icon: Icon, badge }: StatCardProps) {
  const badgeColors = {
    emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    amber: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    purple: 'bg-purple-500/10 text-purple-400 border-purple-500/20'
  };

  const badgeClass = badge?.variant ? badgeColors[badge.variant] : badgeColors.blue;

  return (
    <div className="bg-surface rounded-xl border border-surfaceBorder p-5 hover:border-surfaceBorder/80 transition-all shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium text-slate-400">{title}</span>
        <div className="w-8 h-8 rounded-lg bg-surfaceBorder flex items-center justify-center text-primary-400">
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <div className="flex items-baseline space-x-2">
        <div className="text-2xl font-bold tracking-tight text-white">{value}</div>
        {badge && (
          <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium border ${badgeClass}`}>
            {badge.text}
          </span>
        )}
      </div>
      {subtitle && (
        <p className="text-xs text-slate-400 mt-2">{subtitle}</p>
      )}
    </div>
  );
}
