import React from 'react';

interface ProgressBarProps {
  percent: number;
  label?: string;
  sublabel?: string;
  showPercent?: boolean;
}

export function ProgressBar({ percent, label, sublabel, showPercent = true }: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, percent));

  // Color logic
  let barColor = 'bg-primary-500';
  if (clamped >= 90) {
    barColor = 'bg-rose-500';
  } else if (clamped >= 75) {
    barColor = 'bg-amber-500';
  }

  return (
    <div className="w-full space-y-1.5">
      {(label || showPercent) && (
        <div className="flex justify-between text-xs font-medium">
          <span className="text-slate-300">{label}</span>
          {showPercent && <span className="text-slate-400">{clamped}% used</span>}
        </div>
      )}
      <div className="w-full h-2.5 bg-surfaceBorder rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${barColor}`}
          style={{ width: `${clamped}%` }}
        />
      </div>
      {sublabel && (
        <div className="text-[11px] text-slate-400 text-right">{sublabel}</div>
      )}
    </div>
  );
}
