import React, { useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { CheckCheck, Sparkles, Flame, CheckCircle, Info } from 'lucide-react';

export default function NotificationDropdown({ isOpen, onClose }) {
  const { notifications, markNotificationAsRead, markAllNotificationsAsRead } = useApp();
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const unreadCount = notifications.filter((n) => !n.read).length;

  const typeIcons = {
    success: { icon: CheckCircle, color: 'text-[#0a0a0a] dark:text-white bg-[#f4f4f4] dark:bg-neutral-800 border border-[#e5e5e5] dark:border-neutral-700' },
    ai: { icon: Sparkles, color: 'text-crimson bg-[#fef2f2] dark:bg-crimson/20 border border-crimson/30' },
    streak: { icon: Flame, color: 'text-crimson bg-[#fef2f2] dark:bg-crimson/20 border border-crimson/30' },
    info: { icon: Info, color: 'text-[#0a0a0a] dark:text-white bg-[#f4f4f4] dark:bg-neutral-800 border border-[#e5e5e5] dark:border-neutral-700' },
  };

  const handleNotificationClick = (item) => {
    markNotificationAsRead(item.id);
    if (item.link) {
      onClose();
      navigate(item.link);
    }
  };

  return (
    <div
      ref={dropdownRef}
      className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-[#171717] rounded-lg shadow-[0_4px_0_rgba(0,0,0,0.08)] border border-[#0a0a0a] dark:border-neutral-700 z-50 overflow-hidden animate-slide-down"
    >
      <div className="flex items-center justify-between px-5 py-4 border-b border-[#e5e5e5] dark:border-neutral-800">
        <div className="flex items-center gap-2">
          <h4 className="text-xs font-headline font-bold text-[#0a0a0a] dark:text-white uppercase tracking-wider">Notifications</h4>
          {unreadCount > 0 && (
            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-[#fef2f2] text-crimson border border-crimson/30 font-headline">
              {unreadCount} new
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllNotificationsAsRead}
            className="text-xs text-crimson hover:underline font-bold flex items-center gap-1 font-headline"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            Mark all read
          </button>
        )}
      </div>

      <div className="max-h-80 overflow-y-auto divide-y divide-[#f4f4f4] dark:divide-neutral-800">
        {notifications.length === 0 ? (
          <div className="p-6 text-center text-xs text-[#737373] font-medium">No notifications yet</div>
        ) : (
          notifications.map((item) => {
            const config = typeIcons[item.type] || typeIcons.info;
            const Icon = config.icon;

            return (
              <div
                key={item.id}
                onClick={() => handleNotificationClick(item)}
                className={`p-4 hover:bg-[#fafafa] dark:hover:bg-[#1f1f1f] transition-colors cursor-pointer flex gap-3 items-start ${
                  !item.read ? 'bg-[#fef2f2]/30 dark:bg-crimson/10' : ''
                }`}
              >
                <div className={`w-8 h-8 rounded-md flex items-center justify-center shrink-0 ${config.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1 mb-0.5">
                    <p className={`text-xs font-headline font-bold truncate ${!item.read ? 'text-[#0a0a0a] dark:text-white' : 'text-[#737373]'}`}>
                      {item.title}
                    </p>
                    <span className="text-[10px] text-[#737373] whitespace-nowrap font-medium">{item.time}</span>
                  </div>
                  <p className="text-xs text-[#444748] dark:text-neutral-300 line-clamp-2 leading-relaxed font-normal">
                    {item.message}
                  </p>
                </div>
                {!item.read && (
                  <span className="w-2 h-2 rounded-full bg-crimson shrink-0 mt-1.5" />
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
