import React from 'react';

export default function Card({
  children,
  className = '',
  hover = false,
  glass = false,
  variant = 'lowest', // lowest (#ffffff), low (#f5f3f3), container (#efeded), high (#e9e8e7), solid (#0a0a0a)
  onClick,
  ...props
}) {
  const variantMap = {
    // Pure Canvas & Neutral Surfaces with 1px hairline border (#e5e5e5)
    lowest: 'bg-white dark:bg-[#171717] text-on-surface border border-[#e5e5e5] dark:border-[#2a2a2a] shadow-none',
    low: 'bg-[#fafafa] dark:bg-[#1b1c1c] text-on-surface border border-[#e5e5e5] dark:border-[#2a2a2a]',
    container: 'bg-[#f4f4f4] dark:bg-[#202121] text-on-surface border border-[#e5e5e5] dark:border-[#2a2a2a]',
    high: 'bg-surface-container-high dark:bg-[#262627] text-on-surface border border-[#e5e5e5] dark:border-[#303031]',
    solid: 'bg-[#0a0a0a] text-white border border-[#171717]',
    primary: 'bg-[#0a0a0a] text-white border border-[#171717]',
  };

  const base = 'rounded-lg transition-all duration-150';
  const hoverClass = hover ? 'hover:border-[#0a0a0a] dark:hover:border-white/50 cursor-pointer' : '';
  const glassClass = glass ? 'bg-white/90 dark:bg-[#171717]/90 backdrop-blur-md' : '';

  return (
    <div
      onClick={onClick}
      className={`${base} ${variantMap[variant] || variantMap.lowest} ${hoverClass} ${glassClass} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
