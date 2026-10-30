import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = 'max-w-2xl',
  showClose = true,
}) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 sm:p-6 animate-fade-in">
      {/* Backdrop: clean mask rgba(10, 10, 10, 0.4) */}
      <div
        className="fixed inset-0 bg-[#0a0a0a]/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Dialog container: solid, crisp 1px border (#0a0a0a), un-diffused hard contact edge */}
      <div
        className={`relative w-full ${maxWidth} bg-white dark:bg-[#171717] rounded-lg border border-[#0a0a0a] dark:border-white shadow-[0px_4px_0px_rgba(0,0,0,0.08)] dark:shadow-[0px_4px_0px_rgba(255,255,255,0.08)] overflow-hidden z-10 animate-slide-up`}
      >
        {title && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#e5e5e5] dark:border-neutral-800">
            <h3 className="text-base sm:text-lg font-headline font-bold text-[#0a0a0a] dark:text-white tracking-tight">{title}</h3>
            {showClose && (
              <button
                onClick={onClose}
                className="text-on-surface-variant hover:text-[#0a0a0a] dark:hover:text-white p-1 rounded-md hover:bg-[#f4f4f4] dark:hover:bg-neutral-800 transition-colors"
                aria-label="Close dialog"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        )}

        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
