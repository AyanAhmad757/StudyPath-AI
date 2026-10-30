import React from 'react';

export default function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  color = 'primary', // primary, secondary, crimson, amber
  className = '',
}) {
  const iconBgMap = {
    primary: 'bg-[#f4f4f4] text-[#0a0a0a] dark:bg-neutral-800 dark:text-white',
    secondary: 'bg-[#f4f4f4] text-[#737373] dark:bg-neutral-800 dark:text-neutral-400',
    crimson: 'bg-[#fef2f2] text-crimson dark:bg-crimson/20 dark:text-crimson',
    amber: 'bg-[#fef2f2] text-crimson dark:bg-crimson/20 dark:text-crimson',
  };

  const scheme = iconBgMap[color] || iconBgMap.primary;

  return (
    <div className={`bg-white dark:bg-[#171717] rounded-lg p-5 flex flex-col justify-between gap-3 border border-[#e5e5e5] dark:border-[#2a2a2a] transition-all ${className}`}>
      <div className="flex items-center justify-between">
        <span className="font-headline text-xs font-semibold text-[#737373] uppercase tracking-wider">
          {title}
        </span>
        {Icon && (
          <div className={`w-8 h-8 rounded-md flex items-center justify-center ${scheme}`}>
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>
      <div>
        <p className="font-headline text-2xl sm:text-3xl font-bold text-[#0a0a0a] dark:text-white tabular-nums tracking-tight">
          {value}
        </p>
        {subtitle && (
          <span className="text-[11px] text-[#737373] font-medium mt-1 block">
            {subtitle}
          </span>
        )}
      </div>
    </div>
  );
}
