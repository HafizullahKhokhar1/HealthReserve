import React, { useEffect, useRef, useState, lazy, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';
import { Search, Bell, ChevronDown, Copy, ExternalLink, PencilLine, LogOut, LifeBuoy } from 'lucide-react';
import { db } from '../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

// Lazy load NotificationPanel to improve initial render performance
const NotificationPanel = lazy(() => import('./NotificationPanel'));

export function Header() {
  const { user, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [profileOpen, setProfileOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement | null>(null);
  const [doctorUsername, setDoctorUsername] = useState('');

  const handleSearch = () => {
    if (searchValue.trim()) {
      console.log('Searching for:', searchValue);
      // TODO: Implement search logic
    }
  };

  const profilePath = user?.role === 'doctor' && (doctorUsername || user.username)
    ? `/doctor/${doctorUsername || user.username}`
    : null;

  const handleCopyProfileLink = async () => {
    if (!profilePath) return;
    const url = `${window.location.origin}${profilePath}`;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      window.prompt('Copy your profile link:', url);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!profileMenuRef.current?.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadDoctorUsername() {
      if (!user || user.role !== 'doctor') {
        setDoctorUsername('');
        return;
      }

      try {
        const snap = await getDoc(doc(db, 'doctorProfiles', user.uid));
        if (!cancelled) {
          const username = snap.exists() ? (snap.data().username as string | undefined) : '';
          setDoctorUsername(username || '');
        }
      } catch (error) {
        console.warn('Failed to load doctor username:', error);
      }
    }

    void loadDoctorUsername();

    return () => {
      cancelled = true;
    };
  }, [user]);

  return (
    <header className="h-24 bg-white border-b border-slate-100 flex items-center justify-between px-10 shrink-0 sticky top-0 z-40 dark:bg-slate-900 dark:border-slate-800">
      <div className="relative w-full max-w-md flex items-center">
        <input 
          type="text" 
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          className="w-full bg-slate-50 border-none rounded-2xl py-3.5 pl-5 pr-12 text-sm font-medium focus:ring-2 focus:ring-blue-500/20 transition-all outline-none placeholder:text-slate-400 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500" 
          placeholder="Search for doctors, specialists, or records..."
        />
        <button
          onClick={handleSearch}
          className="absolute right-3 p-2 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          title="Search"
        >
          <Search className="h-5 w-5" />
        </button>
      </div>

      <div className="flex items-center space-x-6">
        <button 
          onClick={() => setNotificationOpen(!notificationOpen)}
          className="relative p-2.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all dark:hover:bg-slate-800 dark:hover:text-blue-400"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white dark:border-slate-900"></span>
        </button>
        
        <div className="relative" ref={profileMenuRef}>
          <button
            onClick={() => setProfileOpen((prev) => !prev)}
            className="flex items-center space-x-4 pl-6 border-l border-slate-200 dark:border-slate-800 text-left"
          >
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-slate-900 tracking-tight dark:text-slate-100">{user?.name}</p>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{user?.role}</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-blue-100 border-2 border-white shadow-sm flex items-center justify-center text-blue-600 font-bold text-lg dark:bg-blue-900 dark:text-blue-200 dark:border-slate-800">
              {user?.name?.[0].toUpperCase()}
            </div>
            <ChevronDown className="hidden sm:block w-4 h-4 text-slate-400" />
          </button>

          {profileOpen && (
            <div className="absolute right-0 top-16 w-72 rounded-3xl border border-slate-200 bg-white shadow-2xl shadow-slate-900/10 p-3 z-50 dark:bg-slate-900 dark:border-slate-800">
              <div className="px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80">
                <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{user?.name}</p>
                <p className="text-xs uppercase tracking-widest text-slate-400 font-bold">{user?.role}</p>
              </div>

              <div className="mt-3 space-y-1">
                {user?.role === 'doctor' && (
                  <>
                    <button
                      onClick={() => {
                        setProfileOpen(false);
                        navigate('/doctor-profile-edit');
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800"
                    >
                      <PencilLine className="w-4 h-4" />
                      Edit Profile
                    </button>
                    {profilePath && (
                      <button
                        onClick={() => {
                          setProfileOpen(false);
                          void handleCopyProfileLink();
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800"
                      >
                        <Copy className="w-4 h-4" />
                        Share Profile Link
                      </button>
                    )}
                    {profilePath && (
                      <button
                        onClick={() => {
                          setProfileOpen(false);
                          window.open(profilePath, '_blank', 'noopener,noreferrer');
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Open Public Profile
                      </button>
                    )}
                  </>
                )}

                <button
                  onClick={() => {
                    setProfileOpen(false);
                    window.location.href = 'mailto:support@healthreserve.app?subject=HealthReserve%20Support';
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  <LifeBuoy className="w-4 h-4" />
                  Contact Support
                </button>

                <button
                  onClick={async () => {
                    setProfileOpen(false);
                    await signOut();
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/30"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <Suspense fallback={null}>
        <NotificationPanel open={notificationOpen} onClose={() => setNotificationOpen(false)} />
      </Suspense>
    </header>
  );
}
