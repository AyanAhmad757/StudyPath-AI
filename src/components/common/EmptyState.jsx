import React from 'react';
import Button from './Button';
import { FolderOpen, AlertTriangle } from 'lucide-react';

export function EmptyState({
  icon: Icon = FolderOpen,
  title = 'No items found',
  description = 'Your learning journey starts here. Take the first step by exploring content or uploading resources.',
  actionText,
  onAction,
  className = '',
}) {
  return (
    <div className={`flex flex-col items-center justify-center p-8 text-center bg-surface-container-lowest rounded-3xl border border-dashed border-outline-variant/60 ${className}`}>
      <div className="w-14 h-14 rounded-2xl bg-secondary-fixed/50 flex items-center justify-center text-primary mb-4 border border-secondary-fixed shadow-sm">
        <Icon className="w-7 h-7" />
      </div>
      <h4 className="text-lg font-headline font-bold text-on-surface mb-1.5">{title}</h4>
      <p className="text-sm text-on-surface-variant max-w-sm mb-6 font-medium">{description}</p>
      {actionText && onAction && (
        <Button onClick={onAction} variant="primary">
          {actionText}
        </Button>
      )}
    </div>
  );
}

export function ErrorState({
  title = 'Something went wrong',
  description = 'We encountered an unexpected error while loading this section. Please try again.',
  onRetry,
  className = '',
}) {
  return (
    <div className={`flex flex-col items-center justify-center p-8 text-center bg-rose-50/50 dark:bg-rose-950/20 rounded-3xl border border-rose-200/60 dark:border-rose-900/40 ${className}`}>
      <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-900/50 flex items-center justify-center text-rose-600 dark:text-rose-400 mb-3">
        <AlertTriangle className="w-6 h-6" />
      </div>
      <h4 className="text-base font-headline font-bold text-on-surface mb-1">{title}</h4>
      <p className="text-sm text-on-surface-variant max-w-sm mb-4 font-medium">{description}</p>
      {onRetry && (
        <Button onClick={onRetry} variant="outline" size="sm">
          Try Again
        </Button>
      )}
    </div>
  );
}
