import React from 'react';

export default function Badge({
  children,
  variant = 'default', // default (standard structural tag), active (crimson wash), critical, secondary-fixed, primary-fixed, container, error, success, outline
  size = 'md', // sm, md, lg
  className = '',
  icon: Icon
}) {
  const sizeStyles = {
    sm: 'text-[10px] px-2 py-0.5 font-bold uppercase tracking-wider gap-1 rounded',
    md: 'text-[11px] px-2.5 py-0.5 font-semibold gap-1.5 rounded-md',
    lg: 'text-xs px-3 py-1 font-semibold gap-1.5 rounded-lg',
  };

  const variantStyles = {
    // Standard structural tag: #f4f4f4 surface, #171717 text, no border, rounded corners
    default: 'bg-[#f4f4f4] dark:bg-[#262627] text-[#171717] dark:text-[#f2f0f0]',
    // Active / Critical Badge: Crimson Red wash (#fef2f2) with #df2531 text and an optional #df2531 hairline border
    active: 'bg-[#fef2f2] dark:bg-crimson/15 text-crimson border border-crimson/30',
    critical: 'bg-[#fef2f2] dark:bg-crimson/20 text-crimson border border-crimson/40',
    ai: 'bg-[#fef2f2] dark:bg-crimson/15 text-crimson border border-crimson/30',
    brand: 'bg-[#0a0a0a] text-white dark:bg-white dark:text-[#0a0a0a]',
    'secondary-fixed': 'bg-[#e2e2e2] dark:bg-[#303031] text-[#1b1b1b] dark:text-[#f2f0f0]',
    'primary-fixed': 'bg-[#e2e2e2] dark:bg-[#303031] text-[#1a1c1c] dark:text-[#f2f0f0]',
    container: 'bg-surface-container-high text-[#171717] dark:text-[#f2f0f0]',
    success: 'bg-[#f4f4f4] text-[#171717] border border-[#e5e5e5] dark:border-neutral-700',
    error: 'bg-error-container text-on-error-container border border-error/20',
    outline: 'border border-[#e5e5e5] dark:border-neutral-700 text-on-surface-variant bg-transparent',
  };

  return (
    <span className={`inline-flex items-center transition-colors ${sizeStyles[size]} ${variantStyles[variant] || variantStyles.default} ${className}`}>
      {Icon && <Icon className="w-3 h-3 shrink-0" />}
      <span>{children}</span>
    </span>
  );
}
