import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  BookOpen,
  Sparkles,
  TrendingUp,
  User,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  GraduationCap,
  Library,
} from 'lucide-react';

export default function Sidebar({ isCollapsed, setIsCollapsed }) {
  const { user, profile, logout } = useAuth();

  const displayName = profile?.full_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Student';
  const displayEmail = user?.email || 'Logged in';
  const initial = displayName[0]?.toUpperCase() || 'S';
  const avatarUrl = profile?.avatar_url || user?.user_metadata?.avatar_url;

  const mainNav = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Learn Anything', path: '/learn', icon: Sparkles },
    { name: 'Syllabus Courses', path: '/study', icon: BookOpen },
    { name: 'Saved Library', path: '/library', icon: Library },
    { name: 'Progress & Quizzes', path: '/progress', icon: TrendingUp },
  ];

  const accountNav = [
    { name: 'Settings & API', path: '/settings', icon: Settings },
    { name: 'My Profile', path: '/profile', icon: User },
  ];

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-semibold tracking-normal transition-colors group relative ${
      isActive
        ? 'bg-[#f4f4f4] dark:bg-[#1f1f1f] text-[#0a0a0a] dark:text-white font-bold border-l-2 border-crimson'
        : 'text-[#737373] hover:text-[#0a0a0a] dark:hover:text-white hover:bg-[#fafafa] dark:hover:bg-[#1b1c1c]'
    } ${isCollapsed ? 'justify-center px-2.5' : ''}`;

  return (
    <aside
      className={`hidden md:flex flex-col border-r border-[#e5e5e5] dark:border-[#262626] bg-white dark:bg-[#141414] h-screen sticky top-0 transition-all duration-200 z-30 ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-[#e5e5e5] dark:border-[#262626]">
        {!isCollapsed ? (
          <NavLink to="/dashboard" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-md bg-[#0a0a0a] dark:bg-white flex items-center justify-center text-white dark:text-[#0a0a0a]">
              <GraduationCap className="w-4 h-4" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-headline font-bold text-[#0a0a0a] dark:text-white text-base tracking-tight">
                StudyPath
              </span>
              <span className="text-[10px] uppercase font-bold text-crimson bg-[#fef2f2] dark:bg-crimson/20 border border-crimson/30 px-1.5 py-0.2 rounded tracking-wider">
                AI
              </span>
            </div>
          </NavLink>
        ) : (
          <NavLink to="/dashboard" className="mx-auto">
            <div className="w-8 h-8 rounded-md bg-[#0a0a0a] dark:bg-white flex items-center justify-center text-white dark:text-[#0a0a0a]">
              <GraduationCap className="w-4 h-4" />
            </div>
          </NavLink>
        )}

        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden lg:flex items-center justify-center w-7 h-7 rounded-md text-[#737373] hover:text-[#0a0a0a] dark:hover:text-white hover:bg-[#f4f4f4] dark:hover:bg-neutral-800 transition-colors"
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {/* Main Section */}
        <div className="space-y-1">
          {!isCollapsed && (
            <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-[#737373] mb-2 font-headline">
              Learning Modules
            </p>
          )}
          {mainNav.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink key={item.name} to={item.path} className={linkClass}>
                {({ isActive }) => (
                  <>
                    <Icon className={`w-4 h-4 shrink-0 transition-colors ${isActive ? 'text-crimson' : 'text-[#737373] group-hover:text-[#0a0a0a] dark:group-hover:text-white'}`} />
                    {!isCollapsed && <span>{item.name}</span>}
                    {isCollapsed && (
                      <div className="absolute left-full ml-2 px-2.5 py-1 bg-[#0a0a0a] text-white text-xs rounded shadow-md border border-[#262626] opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap font-medium">
                        {item.name}
                      </div>
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </div>

        {/* Account Section */}
        <div className="space-y-1">
          {!isCollapsed && (
            <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-[#737373] mb-2 font-headline">
              System
            </p>
          )}
          {accountNav.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink key={item.name} to={item.path} className={linkClass}>
                {({ isActive }) => (
                  <>
                    <Icon className={`w-4 h-4 shrink-0 transition-colors ${isActive ? 'text-crimson' : 'text-[#737373] group-hover:text-[#0a0a0a] dark:group-hover:text-white'}`} />
                    {!isCollapsed && <span>{item.name}</span>}
                    {isCollapsed && (
                      <div className="absolute left-full ml-2 px-2.5 py-1 bg-[#0a0a0a] text-white text-xs rounded shadow-md border border-[#262626] opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap font-medium">
                        {item.name}
                      </div>
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </div>
      </div>

      {/* User Footer Card */}
      <div className="p-3 border-t border-[#e5e5e5] dark:border-[#262626] bg-[#fafafa] dark:bg-[#121212]">
        {!isCollapsed ? (
          <div className="p-2.5 rounded-lg bg-white dark:bg-[#1a1a1a] border border-[#e5e5e5] dark:border-[#2a2a2a] flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={displayName}
                  className="w-7 h-7 rounded-md object-cover shrink-0"
                />
              ) : (
                <div className="w-7 h-7 rounded-md bg-[#0a0a0a] dark:bg-white text-white dark:text-[#0a0a0a] font-bold text-xs flex items-center justify-center shrink-0">
                  {initial}
                </div>
              )}
              <div className="truncate">
                <p className="text-xs font-bold text-[#0a0a0a] dark:text-white truncate font-headline">
                  {displayName}
                </p>
                <p className="text-[10px] text-[#737373] truncate">
                  {displayEmail}
                </p>
              </div>
            </div>
            <button
              onClick={logout}
              title="Sign Out"
              className="p-1 text-[#737373] hover:text-crimson rounded hover:bg-[#f4f4f4] dark:hover:bg-neutral-800 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <div className="flex justify-center">
            <button
              onClick={logout}
              title="Sign Out"
              className="p-2 text-[#737373] hover:text-crimson rounded-md hover:bg-[#f4f4f4] dark:hover:bg-neutral-800 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
