import React, { useState, useRef, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import NotificationDropdown from '../common/NotificationDropdown';
import {
  Menu,
  Search,
  Bell,
  Sun,
  Moon,
  User,
  Settings,
  LogOut,
  GraduationCap,
} from 'lucide-react';

export default function Navbar({ onOpenMobileMenu }) {
  const { user, logout } = useAuth();
  const { isDarkMode, toggleDarkMode, notifications, setIsSearchOpen } = useApp();
  const location = useLocation();
  const navigate = useNavigate();

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setIsUserMenuOpen(false);
      }
    };
    if (isUserMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isUserMenuOpen]);

  return (
    <header className="fixed top-0 w-full z-40 bg-white/95 dark:bg-[#171717]/95 backdrop-blur-md pt-safe border-b border-[#e5e5e5] dark:border-[#262626] transition-colors">
      <div className="h-16 px-4 sm:px-6 flex items-center justify-between">
        {/* Left side: Mobile menu toggle + Brand Logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenMobileMenu}
            aria-label="Open menu"
            className="md:hidden w-9 h-9 flex items-center justify-center rounded-md text-[#0a0a0a] dark:text-white hover:bg-[#f4f4f4] dark:hover:bg-neutral-800 transition-colors"
            type="button"
          >
            <Menu className="w-5 h-5" />
          </button>

          <Link to="/dashboard" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-md bg-[#0a0a0a] dark:bg-white flex items-center justify-center text-white dark:text-[#0a0a0a]">
              <GraduationCap className="w-4 h-4" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-headline text-[#0a0a0a] dark:text-white text-base sm:text-lg font-bold tracking-tight">
                StudyPath
              </span>
              <span className="text-[10px] uppercase font-bold text-crimson bg-[#fef2f2] dark:bg-crimson/20 border border-crimson/30 px-1.5 py-0.2 rounded tracking-wider">
                AI
              </span>
            </div>
          </Link>
        </div>

        {/* Right side: Search, Theme, Notifications, Profile */}
        <div className="flex items-center gap-2">
          {/* Quick Search trigger */}
          <button
            onClick={() => setIsSearchOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-[#fafafa] dark:bg-[#202121] text-[#737373] hover:text-[#0a0a0a] dark:hover:text-white transition-colors text-xs font-medium border border-[#e5e5e5] dark:border-[#303031]"
          >
            <Search className="w-3.5 h-3.5 text-[#737373]" />
            <span className="hidden sm:inline">Search...</span>
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[9px] font-bold text-[#737373] bg-[#efeded] dark:bg-neutral-800 rounded border border-[#e5e5e5] dark:border-neutral-700">
              ⌘K
            </kbd>
          </button>

          {/* Theme Switcher */}
          <button
            onClick={toggleDarkMode}
            className="w-9 h-9 flex items-center justify-center rounded-md text-[#737373] hover:text-[#0a0a0a] dark:hover:text-white hover:bg-[#f4f4f4] dark:hover:bg-neutral-800 transition-colors"
            title={isDarkMode ? 'Light Mode' : 'Dark Mode'}
            aria-label="Toggle theme"
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-[#0a0a0a]" />}
          </button>

          {/* Notifications button */}
          <div className="relative">
            <button
              onClick={() => setIsNotifOpen(!isNotifOpen)}
              aria-label="Notifications"
              className="relative w-9 h-9 flex items-center justify-center rounded-md text-[#737373] hover:text-[#0a0a0a] dark:hover:text-white hover:bg-[#f4f4f4] dark:hover:bg-neutral-800 transition-colors"
              type="button"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-2 right-2 w-2 h-2 bg-crimson rounded-full ring-2 ring-white dark:ring-[#171717]"></span>
              )}
            </button>
            <NotificationDropdown isOpen={isNotifOpen} onClose={() => setIsNotifOpen(false)} />
          </div>

          {/* Profile dropdown */}
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center justify-center w-9 h-9 rounded-full p-0.5 hover:opacity-90 transition-opacity border border-[#e5e5e5] dark:border-neutral-700"
              aria-label="User Profile"
            >
              <img
                src={user?.avatar || 'https://lh3.googleusercontent.com/aida/AEtjO1UMkVA_lFpavUtEhT8G6CSxoAMAyDt6vmjniKFNMWrkYP00yS7bia2FPArVlDxJqui48r7tKAfTRL53ibxwOSMojFaNRhNr7TdNFqyIS5UTnC3pdwQQ_YLFTaphyxwVK0dS9yj49Sm7sQ0KYuzcUoo6O7W-l-5bpbO_crZwI2c4jWWxrEmwtVjyKeHv_vBQudt5-67CPuXw14NQDnr-H0Y7MZ3p7ipdTZD8WLo58V7f27tydShDjj4d1W0'}
                alt="Profile"
                className="w-7 h-7 rounded-full object-cover"
              />
            </button>

            {isUserMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-[#171717] rounded-lg shadow-[0_4px_0_rgba(0,0,0,0.08)] border border-[#0a0a0a] dark:border-neutral-700 z-50 overflow-hidden py-1.5 animate-slide-down">
                <div className="px-4 py-3 border-b border-[#e5e5e5] dark:border-neutral-800">
                  <p className="font-headline text-xs font-bold text-[#0a0a0a] dark:text-white truncate">{user?.name || 'Ayan Mukherjee'}</p>
                  <p className="text-[11px] text-[#737373] truncate">{user?.email}</p>
                  <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded bg-[#f4f4f4] dark:bg-neutral-800 text-[#171717] dark:text-neutral-200">
                    {user?.course || 'B.Tech CSE'}
                  </span>
                </div>

                <div className="py-1">
                  <Link
                    to="/profile"
                    onClick={() => setIsUserMenuOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-[#1b1c1c] dark:text-neutral-200 hover:bg-[#f4f4f4] dark:hover:bg-neutral-800 hover:text-[#0a0a0a] dark:hover:text-white"
                  >
                    <User className="w-3.5 h-3.5 text-[#737373]" />
                    My Profile
                  </Link>
                  <Link
                    to="/settings"
                    onClick={() => setIsUserMenuOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-[#1b1c1c] dark:text-neutral-200 hover:bg-[#f4f4f4] dark:hover:bg-neutral-800 hover:text-[#0a0a0a] dark:hover:text-white"
                  >
                    <Settings className="w-3.5 h-3.5 text-[#737373]" />
                    Preferences & Settings
                  </Link>
                </div>

                <div className="pt-1 border-t border-[#e5e5e5] dark:border-neutral-800">
                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      logout();
                      navigate('/login');
                    }}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-error hover:bg-error-container/30 transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
