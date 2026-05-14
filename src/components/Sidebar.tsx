import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';
import { 
  Activity, 
  LayoutDashboard, 
  Calendar, 
  Stethoscope, 
  ClipboardList, 
  User as UserIcon,
  LogOut,
  Moon,
  Sun,
  Menu,
  X,
  FileText,
  Sparkles
} from 'lucide-react';
import { cn } from './ui/core';

export function Sidebar() {
  const { user, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const navItems = {
    patient: [
      { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
      { label: 'My Bookings', path: '/appointments', icon: Calendar },
      { label: 'Medical Vault', path: '/medical-records', icon: FileText },
      { label: 'AI Assistant', path: '/ai-assistant', icon: Sparkles },
      { label: 'Edit Profile', path: '/patient-profile-edit', icon: UserIcon },
    ],
    doctor: [
      { label: 'Schedule', path: '/dashboard', icon: LayoutDashboard },
      { label: 'History', path: '/appointments', icon: ClipboardList },
      { label: 'Edit Profile', path: '/doctor-profile-edit', icon: UserIcon },
    ],
    admin: [
      { label: 'Control Center', path: '/dashboard', icon: LayoutDashboard },
      { label: 'Infrastructure', path: '/hospitals', icon: Stethoscope },
    ]
  };

  const items = user?.role ? navItems[user.role as keyof typeof navItems] : [];

  return (
    <>
      {/* Mobile Menu Toggle */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed bottom-6 right-6 z-50 w-14 h-14 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-2xl shadow-blue-500/40"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside className={cn(
        "fixed lg:static inset-y-0 left-0 z-40 w-72 bg-white border-r border-slate-200 flex flex-col shrink-0 dark:bg-slate-900 dark:border-slate-800 transition-transform duration-300 lg:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-8 flex items-center space-x-3">
        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-500/30">
          H
        </div>
        <span className="font-bold text-2xl tracking-tight text-slate-800 dark:text-slate-100">HealthReserve</span>
      </div>

      <nav className="flex-1 px-4 mt-4 space-y-1">
        {items.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => cn(
              "flex items-center space-x-3 px-6 py-4 rounded-2xl font-bold transition-all duration-200",
              isActive 
                ? "bg-blue-50 text-blue-600 shadow-sm shadow-blue-500/5 dark:bg-blue-900/20 dark:text-blue-400" 
                : "text-slate-400 hover:bg-slate-50 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300"
            )}
          >
            <item.icon className="w-5 h-5" />
            <span>{item.label}</span>
          </NavLink>
        ))}

        <button
          onClick={toggleTheme}
          className="flex items-center space-x-3 px-6 py-4 rounded-2xl font-bold transition-all duration-200 text-slate-400 hover:bg-slate-50 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300 w-full"
        >
          {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
          <span className="tracking-tight">{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>
        </button>
      </nav>

      <div className="p-6 mt-auto">
        <div className="bg-slate-900 rounded-3xl p-6 text-white relative overflow-hidden group dark:bg-slate-800 dark:border dark:border-slate-700">
          <div className="relative z-10">
            <p className="text-[10px] text-slate-400 mb-1 uppercase tracking-widest font-bold">Role</p>
            <p className="text-sm font-bold capitalize">{user?.role} Account</p>
            <button 
              onClick={() => signOut()}
              className="mt-4 flex items-center gap-2 text-xs text-blue-400 font-bold hover:text-blue-300 transition-colors"
            >
              <LogOut size={14} />
              Sign Out
            </button>
          </div>
          <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-all"></div>
        </div>
      </div>
    </aside>
    </>
  );
}
