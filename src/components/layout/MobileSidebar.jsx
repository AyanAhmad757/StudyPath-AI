import React, { useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  X,
  LayoutDashboard,
  BookOpen,
  Sparkles,
  TrendingUp,
  User,
  Settings,
  Library,
  GraduationCap,
  LogOut,
} from 'lucide-react';

export default function MobileSidebar({ isOpen, onClose }) {
  const { user, profile, logout } = useAuth();

  const displayName = profile?.full_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Student';
  const displayEmail = user?.email || 'Logged in';
  const initial = displayName[0]?.toUpperCase() || 'S';
  const avatarUrl = profile?.avatar_url || user?.user_metadata?.avatar_url;

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-semibold tracking-normal transition-colors ${
      isActive
        ? 'bg-[#f4f4f4] dark:bg-[#1f1f1f] text-[#0a0a0a] dark:text-white font-bold border-l-2 border-crimson'
        : 'text-[#737373] hover:text-[#0a0a0a] dark:hover:text-white hover:bg-[#fafafa] dark:hover:bg-[#1b1c1c]'
    }`;

  return (
    <div className="fixed inset-0 z-50 md:hidden flex">
      {/* Drawer Container */}
      <div className="w-4/5 max-w-xs bg-white dark:bg-[#141414] h-full flex flex-col shadow-2xl pt-safe pb-safe z-10 border-r border-[#e5e5e5] dark:border-[#262626] animate-slide-right">
        {/* Header */}
        <div className="p-4 flex items-center justify-between border-b border-[#e5e5e5] dark:border-[#262626]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-md bg-[#0a0a0a] dark:bg-white flex items-center justify-center text-white dark:text-[#0a0a0a]">
              <GraduationCap className="w-4 h-4" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-headline font-bold text-[#0a0a0a] dark:text-white text-base">StudyPath</span>
              <span className="text-[10px] uppercase font-bold text-crimson bg-[#fef2f2] dark:bg-crimson/20 border border-crimson/30 px-1.5 py-0.2 rounded tracking-wider">
                AI
              </span>
            </div>
          </div>
          <button
            aria-label="Close menu"
            className="w-8 h-8 flex items-center justify-center rounded-md text-[#737373] hover:bg-[#f4f4f4] dark:hover:bg-neutral-800 transition-colors"
            onClick={onClose}
            type="button"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Student Profile Snippet */}
        <div className="px-4 py-3 mx-3 bg-[#fafafa] dark:bg-[#1a1a1a] rounded-lg my-3 border border-[#e5e5e5] dark:border-[#2a2a2a]">
          <div className="flex items-center gap-2.5">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={displayName}
                className="w-8 h-8 rounded-md object-cover shrink-0"
              />
            ) : (
              <div className="w-8 h-8 rounded-md bg-[#0a0a0a] dark:bg-white text-white dark:text-[#0a0a0a] font-bold text-xs flex items-center justify-center shrink-0">
                {initial}
              </div>
            )}
            <div className="min-w-0">
              <p className="text-[#0a0a0a] dark:text-white text-xs font-bold font-headline truncate">{displayName}</p>
              <p className="text-[11px] text-[#737373] truncate">{displayEmail}</p>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto px-3 flex flex-col gap-1">
          <p className="text-[10px] font-bold tracking-wider uppercase text-[#737373] px-3 pt-2 font-headline">
            Learning Modules
          </p>

          <NavLink to="/dashboard" onClick={onClose} className={linkClass}>
            {({ isActive }) => (
              <>
                <LayoutDashboard className={`w-4 h-4 shrink-0 ${isActive ? 'text-crimson' : 'text-[#737373]'}`} />
                <span>Dashboard</span>
              </>
            )}
          </NavLink>

          <NavLink to="/learn" onClick={onClose} className={linkClass}>
            {({ isActive }) => (
              <>
                <Sparkles className={`w-4 h-4 shrink-0 ${isActive ? 'text-crimson' : 'text-[#737373]'}`} />
                <span>Learn Anything</span>
              </>
            )}
          </NavLink>

          <NavLink to="/study" onClick={onClose} className={linkClass}>
            {({ isActive }) => (
              <>
                <BookOpen className={`w-4 h-4 shrink-0 ${isActive ? 'text-crimson' : 'text-[#737373]'}`} />
                <span>Syllabus Courses</span>
              </>
            )}
          </NavLink>

          <NavLink to="/library" onClick={onClose} className={linkClass}>
            {({ isActive }) => (
              <>
                <Library className={`w-4 h-4 shrink-0 ${isActive ? 'text-crimson' : 'text-[#737373]'}`} />
                <span>Saved Library</span>
              </>
            )}
          </NavLink>

          <NavLink to="/progress" onClick={onClose} className={linkClass}>
            {({ isActive }) => (
              <>
                <TrendingUp className={`w-4 h-4 shrink-0 ${isActive ? 'text-crimson' : 'text-[#737373]'}`} />
                <span>Progress & Quizzes</span>
              </>
            )}
          </NavLink>

          <p className="text-[10px] font-bold tracking-wider uppercase text-[#737373] px-3 pt-4 font-headline">
            System
          </p>

          <NavLink to="/settings" onClick={onClose} className={linkClass}>
            <Settings className="w-4 h-4 text-[#737373] shrink-0" />
            <span>Settings & API</span>
          </NavLink>

          <NavLink to="/profile" onClick={onClose} className={linkClass}>
            <User className="w-4 h-4 text-[#737373] shrink-0" />
            <span>Profile</span>
          </NavLink>

          <div className="pt-3 mt-2 border-t border-[#e5e5e5] dark:border-[#262626]">
            <button
              onClick={() => {
                onClose();
                logout();
              }}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-semibold text-error hover:bg-error-container/30 transition-colors"
            >
              <LogOut className="w-4 h-4 shrink-0" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>

      {/* Backdrop: clean dark mask */}
      <div
        className="flex-1 bg-[#0a0a0a]/40 backdrop-blur-xs"
        onClick={onClose}
      />
    </div>
  );
}
