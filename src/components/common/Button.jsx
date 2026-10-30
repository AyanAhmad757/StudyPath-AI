import React from 'react';

export default function Button({
  children,
  variant = 'primary', // primary (crimson CTA), secondary (deep black), outline (pure white w/ border), ghost, ai, danger, success
  size = 'md', // sm, md, lg, xl
  className = '',
  icon: Icon,
  iconPosition = 'left',
  loading = false,
  disabled = false,
  onClick,
  type = 'button',
  ...props
}) {
  const baseStyles = 'inline-flex items-center justify-center font-headline font-semibold rounded-lg transition-all duration-150 focus:outline-none disabled:opacity-40 disabled:cursor-not-allowed select-none';

  const sizeStyles = {
    sm: 'text-[11px] px-3 py-1.5 gap-1.5 rounded-md tracking-wide',
    md: 'text-xs sm:text-sm px-4 py-2 gap-2 rounded-lg',
    lg: 'text-sm sm:text-base px-5 py-2.5 gap-2.5 rounded-lg',
    xl: 'text-base sm:text-lg px-6 py-3 gap-3 rounded-lg',
  };

  const variantStyles = {
    // Primary CTA: Crimson Red (#df2531), white text, rounded 0.5rem, label-md uppercase. Active hover #b91c26
    primary: 'bg-crimson text-white hover:bg-crimson-hover active:bg-[#930015] shadow-xs tracking-wider uppercase font-bold text-xs',
    // Secondary Action: Deep Black (#0a0a0a) background, white text (#ffffff), hover #171717
    secondary: 'bg-[#0a0a0a] text-white hover:bg-[#171717] dark:bg-white dark:text-[#0a0a0a] dark:hover:bg-[#f4f4f4] border border-transparent shadow-xs',
    // Structural Outline: Pure white (#ffffff) background, 1px border (#0a0a0a), text #0a0a0a. Hover #f4f4f4
    outline: 'bg-white dark:bg-[#171717] border border-[#0a0a0a] dark:border-white/80 text-[#0a0a0a] dark:text-white hover:bg-[#f4f4f4] dark:hover:bg-[#262626]',
    'secondary-fixed': 'bg-surface-container text-[#0a0a0a] dark:text-white hover:bg-surface-container-high border border-outline-variant/60',
    ghost: 'text-on-surface-variant hover:text-[#0a0a0a] dark:hover:text-white hover:bg-surface-container/60 shadow-none',
    ai: 'bg-crimson text-white hover:bg-crimson-hover shadow-xs tracking-wider uppercase font-bold text-xs',
    danger: 'bg-error text-on-error hover:bg-[#93000a]',
    success: 'bg-[#1b1c1c] text-white hover:bg-[#303031] border border-neutral-800',
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant] || variantStyles.primary} ${className}`}
      {...props}
    >
      {loading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {!loading && Icon && iconPosition === 'left' && <Icon className="w-4 h-4 shrink-0" />}
      <span>{children}</span>
      {!loading && Icon && iconPosition === 'right' && <Icon className="w-4 h-4 shrink-0" />}
    </button>
  );
}
