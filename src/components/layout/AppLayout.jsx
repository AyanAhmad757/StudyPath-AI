import React, { useState } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import MobileSidebar from './MobileSidebar';
import Navbar from './Navbar';
import SearchModal from '../common/SearchModal';
import Toast from '../common/Toast';
import VideoModal from '../study/VideoModal';
import {
  LayoutDashboard,
  BookOpen,
  Compass,
  TrendingUp,
  Sparkles,
  Library,
} from 'lucide-react';

export default function AppLayout() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const mobileNavItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Learn', path: '/learn', icon: Sparkles },
    { name: 'Courses', path: '/study', icon: BookOpen },
    { name: 'Library', path: '/library', icon: Library },
    { name: 'Progress', path: '/progress', icon: TrendingUp },
  ];

  return (
    <div className="min-h-screen flex bg-background text-on-surface font-body-lg transition-colors">
      {/* Desktop Sidebar */}
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
      />

      {/* Mobile Drawer */}
      <MobileSidebar
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Fixed Header */}
        <Navbar onOpenMobileMenu={() => setIsMobileMenuOpen(true)} />

        {/* Dynamic Route View with safe padding */}
        <main className="flex-1 flex flex-col w-full pt-16 pb-20 md:pb-8 bg-background min-h-screen">
          <div className="flex-1 w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12 py-6">
            <Outlet />
          </div>
        </main>

        {/* Mobile Bottom Navigation Bar */}
        <nav className="md:hidden fixed bottom-0 w-full z-40 pb-safe bg-white/95 dark:bg-[#171717]/95 backdrop-blur-md border-t border-[#e5e5e5] dark:border-[#262626]">
          <div className="flex justify-around items-center h-16 px-space-xs">
            {mobileNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path || (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
              return (
                <NavLink
                  key={item.name}
                  to={item.path}
                  className={`flex flex-col items-center justify-center gap-1 w-14 h-12 transition-colors ${
                    isActive ? 'text-crimson font-bold' : 'text-[#737373]'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-[10px] font-headline uppercase tracking-wider leading-none">{item.name}</span>
                </NavLink>
              );
            })}
          </div>
        </nav>
      </div>

      {/* Global Modals & Notifications */}
      <SearchModal />
      <VideoModal />
      <Toast />
    </div>
  );
}
