import React from 'react';

export default function ProgressBar({
  value = 0,
  max = 100,
  variant = 'primary', // primary (crimson or deep black), crimson, secondary, neutral
  size = 'md', // sm, md, lg
  showLabel = false,
  label = '',
  className = '',
}) {
  const percentage = Math.min(100, Math.max(0, Math.round((value / max) * 100)));

  const sizeHeights = {
    sm: 'h-1',
    md: 'h-1.5',
    lg: 'h-2.5',
  };

  const variantFills = {
    primary: 'bg-crimson',
    crimson: 'bg-crimson',
    secondary: 'bg-[#0a0a0a] dark:bg-white',
    neutral: 'bg-[#5e5e5e] dark:bg-neutral-300',
    gradient: 'bg-crimson',
    'secondary-fixed-dim': 'bg-crimson',
  };

  return (
    <div className={`w-full ${className}`}>
      {showLabel && (
        <div className="flex justify-between items-center text-xs font-semibold mb-1 text-on-surface-variant font-headline">
          <span>{label || 'Progress'}</span>
          <span className="text-[#0a0a0a] dark:text-white font-bold tabular-nums">{percentage}%</span>
        </div>
      )}
      <div className={`w-full bg-[#f4f4f4] dark:bg-neutral-800 rounded-full overflow-hidden ${sizeHeights[size]}`}>
        <div
          className={`${sizeHeights[size]} ${variantFills[variant] || variantFills.primary} rounded-full transition-all duration-500 ease-out`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
