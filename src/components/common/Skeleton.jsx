import React from 'react';

export function Skeleton({ className = '', variant = 'rect' }) {
  const variantClasses = {
    rect: 'rounded-xl',
    circle: 'rounded-full',
    text: 'rounded-md h-4 w-full',
  };

  return (
    <div
      className={`animate-pulse bg-slate-200 dark:bg-slate-800 ${variantClasses[variant]} ${className}`}
    />
  );
}

export function SubjectCardSkeleton() {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="w-12 h-12 rounded-xl" />
        <Skeleton className="w-16 h-6 rounded-full" />
      </div>
      <Skeleton className="w-3/4 h-6" />
      <Skeleton className="w-full h-4" />
      <Skeleton className="w-full h-2 rounded-full" />
      <div className="flex justify-between pt-2">
        <Skeleton className="w-20 h-4" />
        <Skeleton className="w-24 h-8 rounded-xl" />
      </div>
    </div>
  );
}
