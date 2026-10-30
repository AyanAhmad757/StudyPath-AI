import React from 'react';
import { useApp } from '../../context/AppContext';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function Toast() {
  const { toasts, removeToast } = useApp();

  if (!toasts || toasts.length === 0) return null;

  const icons = {
    success: CheckCircle2,
    warning: AlertCircle,
    danger: AlertCircle,
    info: Info,
  };

  const bgStyles = {
    success: 'bg-[#0a0a0a] text-white border border-[#262626] shadow-[0_4px_0_rgba(0,0,0,0.12)]',
    warning: 'bg-[#fef2f2] text-[#df2531] border border-crimson/40 shadow-[0_4px_0_rgba(223,37,49,0.1)]',
    danger: 'bg-crimson text-white border border-[#b91c26] shadow-[0_4px_0_rgba(0,0,0,0.15)]',
    info: 'bg-[#0a0a0a] text-white border border-[#262626] shadow-[0_4px_0_rgba(0,0,0,0.12)]',
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        const Icon = icons[toast.type] || CheckCircle2;
        const style = bgStyles[toast.type] || bgStyles.success;

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center justify-between p-3.5 rounded-lg border animate-slide-up transition-all ${style}`}
          >
            <div className="flex items-center gap-2.5 pr-2">
              <Icon className="w-4 h-4 shrink-0 text-current" />
              <p className="text-xs font-headline font-bold">{toast.message}</p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="opacity-70 hover:opacity-100 p-1 rounded hover:bg-white/10 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
