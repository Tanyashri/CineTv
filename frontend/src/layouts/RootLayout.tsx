import { useState, useRef, useEffect, useMemo } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Film,
  User as UserIcon,
  LogOut,
  Moon,
  Sun,
  Sparkles,
  Bookmark,
  Heart,
  Compass,
  Menu,
  X,
  ChevronDown,
  Search,
  Gem,
  Stethoscope,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/auth.context';
import { useTheme } from '../contexts/theme.context';
import { useRecommendation } from '../contexts/recommendation.context';
import { TrailerModal } from '../components/TrailerModal';
import { SettingsModal } from '../components/SettingsModal';
import { TriggerFilterPanel } from '../components/TriggerFilterPanel';
import { IntroSplash } from '../components/IntroSplash';
import { CinematicBackground } from '../components/CinematicBackground';
import { Dock } from '../components/ui';
import { MOTION_TRANSITIONS, MOTION_VARIANTS } from '../config/motion';

const navLinks = [
  { to: '/', label: 'Home', icon: Film },
  { to: '/discover', label: 'Discover', icon: Compass },
];

const serviceItems = [
  { to: '/recommendations', label: 'AI Recommendations', desc: 'Custom AI prompts & emotion analysis', icon: Sparkles },
  { to: '/recommendations?mode=hidden-gems', label: 'Hidden Gems', desc: 'Underrated cinematic masterpieces', icon: Gem },
  { to: '/recommendations?mode=therapist', label: 'Movie Therapist', desc: 'Emotional therapeutic recommendations', icon: Stethoscope },
  { to: '/watchlist', label: 'Watchlist', desc: 'Saved movies to watch later', icon: Bookmark },
  { to: '/favorites', label: 'Favorites', desc: 'Your top rated cinema choices', icon: Heart },
  { to: '/discover', label: 'Discover', desc: 'Search & filter TMDb catalog', icon: Compass },
];

export function RootLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const { themeMode, toggleThemeMode } = useTheme();
  const { searchQuery, setSearchQuery } = useRecommendation();
  const isAuthPage = ['/login', '/register', '/forgot-password', '/reset-password', '/verify-email'].includes(location.pathname);

  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const dockItems = useMemo(() => {
    const baseItems = [
      {
        icon: <Film className="h-full w-full" />,
        label: 'Home',
        onClick: () => navigate('/'),
      },
      {
        icon: <Compass className="h-full w-full" />,
        label: 'Discover',
        onClick: () => navigate('/discover'),
      },
      {
        icon: <Sparkles className="h-full w-full" />,
        label: 'Recommendations',
        onClick: () => navigate('/recommendations'),
      },
      {
        icon: <Bookmark className="h-full w-full" />,
        label: 'Watchlist',
        onClick: () => navigate('/watchlist'),
      },
      {
        icon: <Heart className="h-full w-full" />,
        label: 'Favorites',
        onClick: () => navigate('/favorites'),
      },
    ];

    const authItems = isAuthenticated && user
      ? [
          {
            icon: <UserIcon className="h-full w-full" />,
            label: 'Profile',
            onClick: () => navigate('/profile'),
          },
          {
            icon: <LogOut className="h-full w-full text-red-500" />,
            label: 'Logout',
            onClick: () => logout(),
          },
        ]
      : [
          {
            icon: <UserIcon className="h-full w-full text-primary-500" />,
            label: 'Sign In',
            onClick: () => navigate('/login'),
          },
        ];

    const themeItem = {
      icon: themeMode === 'dark' ? <Sun className="h-full w-full text-amber-400" /> : <Moon className="h-full w-full text-indigo-400" />,
      label: themeMode === 'dark' ? 'Light Mode' : 'Dark Mode',
      onClick: () => toggleThemeMode(),
    };

    return [...baseItems, ...authItems, themeItem];
  }, [isAuthenticated, user, themeMode, navigate, logout, toggleThemeMode]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    if (location.pathname !== '/discover') {
      navigate('/discover');
    }
  };

  const [showSplash, setShowSplash] = useState(false);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleSplashComplete = () => {
    sessionStorage.setItem('cinetv_splash_shown', 'true');
    setShowSplash(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setServicesOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-transparent text-[var(--text-primary)] transition-colors duration-300 relative">
      {/* Global Theme-Aware Cinematic Background */}
      <CinematicBackground />

      <div className="relative z-10 flex min-h-screen flex-col bg-transparent">
        {/* Intro Splash Experience (once per session) */}
        {showSplash && <IntroSplash onComplete={handleSplashComplete} />}

      {/* Modals & Overlay Drawers */}
      <TrailerModal />
      <SettingsModal />
      <TriggerFilterPanel />

      {/* ─── Header ──────────────────────────────────── */}
      <header className={`${isAuthPage ? 'absolute' : 'sticky'} top-4 z-40 w-full px-4 flex flex-col items-center pointer-events-none`}>
        <div className="w-full max-w-[1200px] rounded-full border border-[var(--glass-border)] bg-[var(--glass-bg)] backdrop-blur-lg px-6 py-2 flex items-center justify-between shadow-[0_12px_40px_rgba(0,0,0,0.2)] dark:shadow-[0_12px_40px_rgba(0,0,0,0.6)] pointer-events-auto relative gap-4">
          {/* LEFT: Logo + Navigation Links */}
          <div className="flex items-center gap-6 shrink-0">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 transition-opacity hover:opacity-80">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-500 shadow-md shadow-primary-500/20">
                <Film className="h-4.5 w-4.5 text-white" />
              </div>
              <span className="text-lg font-black tracking-tight text-[var(--text-primary)]">
                Cine<span className="text-primary-500">TV</span>
              </span>
            </Link>


          </div>

          {/* CENTER: Search Bar */}
          <div className="flex-1 flex justify-center max-w-md md:max-w-lg">
            <div className="flex items-center gap-2 w-full rounded-full border border-[var(--border)] bg-[var(--surface-card)] px-3.5 py-1.5 text-xs text-[var(--text-primary)] shadow-inner transition-all hover:border-primary-500/40 focus-within:border-primary-500/60 focus-within:bg-[var(--surface)]">
              <Search className="h-3.5 w-3.5 text-primary-500 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Search movies..."
                className="w-full bg-transparent border-none outline-none text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)]"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-[var(--text-muted)] hover:text-[var(--text-primary)] shrink-0"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
          </div>

          {/* RIGHT: Profile / User State / Menu */}
          <div className="flex items-center gap-4 shrink-0">
            {/* Desktop Auth Controls */}
            <div className="hidden md:flex items-center gap-3">
              {isAuthenticated && user ? (
                <div className="flex items-center gap-3">
                  <Link
                    to="/profile"
                    className="flex items-center gap-2 group transition-all"
                  >
                    {user.avatarUrl ? (
                      <img
                        src={user.avatarUrl}
                        alt={user.fullName || 'User'}
                        className="h-7 w-7 rounded-full object-cover border border-[var(--border)] group-hover:border-primary-500 transition-colors"
                      />
                    ) : (
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-500/10 border border-[var(--border)] text-primary-500 group-hover:border-primary-500 transition-colors">
                        <UserIcon className="h-3.5 w-3.5" />
                      </div>
                    )}
                    <span className="text-xs font-bold text-[var(--text-primary)] group-hover:text-primary-500 transition-colors max-w-[100px] truncate">
                      {user.fullName || user.name || user.email.split('@')[0]}
                    </span>
                  </Link>

                  <button
                    onClick={() => logout()}
                    title="Sign Out"
                    className="flex items-center gap-1.5 text-[var(--text-secondary)] hover:text-red-500 transition-colors text-xs font-bold cursor-pointer"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Link
                    to="/login"
                    className="text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="rounded-full bg-[var(--text-primary)] px-4 py-2 text-xs font-bold text-[var(--background)] hover:opacity-90 transition-all shadow-md"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface-card)] md:hidden text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
            >
              {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0, y: -10 }}
              animate={{ height: 'auto', opacity: 1, y: 0 }}
              exit={{ height: 0, opacity: 0, y: -10 }}
              className="w-full max-w-[1200px] mt-2 rounded-3xl border border-[var(--border)] bg-[var(--surface)]/95 px-4 py-4 space-y-3 overflow-hidden shadow-2xl backdrop-blur-md pointer-events-auto"
            >
              <div className="grid grid-cols-2 gap-2">
                <Link
                  to="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-2 rounded-lg px-3 py-2.5 text-xs font-semibold ${
                    location.pathname === '/'
                      ? 'bg-primary-500 text-white font-bold'
                      : 'bg-[var(--surface-card)] text-[var(--text-secondary)] hover:bg-[var(--surface-elevated)]'
                  }`}
                >
                  <Film className="h-4 w-4" />
                  <span>Home</span>
                </Link>
                {serviceItems.map((link) => {
                  const Icon = link.icon;
                  return (
                    <Link
                      key={link.label}
                      to={link.to}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-2 rounded-lg px-3 py-2.5 text-xs font-semibold ${
                        location.pathname === link.to
                          ? 'bg-primary-500 text-white font-bold'
                          : 'bg-[var(--surface-card)] text-[var(--text-secondary)] hover:bg-[var(--surface-elevated)]'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{link.label}</span>
                    </Link>
                  );
                })}
              </div>

              {/* Mobile Auth Controls */}
              <div className="pt-2 border-t border-[var(--border)]">
                {isAuthenticated && user ? (
                  <div className="flex flex-col gap-2">
                    <Link
                      to="/profile"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-2.5 rounded-lg bg-[var(--surface-card)] px-3 py-2.5 text-xs font-semibold text-[var(--text-primary)] hover:bg-[var(--surface-elevated)]"
                    >
                      {user.avatarUrl ? (
                        <img
                          src={user.avatarUrl}
                          alt={user.fullName || 'User'}
                          className="h-5 w-5 rounded-full object-cover"
                        />
                      ) : (
                        <UserIcon className="h-4 w-4 text-primary-500" />
                      )}
                      <span>Profile ({user.fullName || user.name || user.email.split('@')[0]})</span>
                    </Link>
                    <button
                      onClick={() => {
                        logout();
                        setMobileMenuOpen(false);
                      }}
                      className="w-full flex items-center justify-center gap-2.5 rounded-lg bg-red-500/10 border border-red-500/20 px-3 py-2.5 text-xs font-bold text-red-400 hover:bg-red-500/20"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Link
                      to="/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex-1 rounded-lg bg-[var(--surface-elevated)] py-2 text-center text-xs font-bold text-[var(--text-primary)]"
                    >
                      Sign In
                    </Link>
                    <Link
                      to="/register"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex-1 rounded-full bg-[var(--text-primary)] py-2 text-center text-xs font-bold text-[var(--background)] shadow-md"
                    >
                      Sign Up
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* ─── Main Content Area ────────────────────────── */}
      <main 
        className={`flex-1 w-full flex flex-col ${isAuthPage ? 'items-stretch md:overflow-hidden overflow-y-auto' : 'items-center pb-24'}`} 
        style={{ 
          paddingTop: isAuthPage ? '80px' : location.pathname.startsWith('/movie/') ? '76px' : '110px',
          height: isAuthPage ? (isMobile ? 'auto' : '100vh') : 'auto',
          minHeight: isAuthPage ? (isMobile ? 'calc(100vh - 80px)' : '100vh') : 'auto'
        }}
      >
        <Outlet />
      </main>

      {/* ─── Footer ──────────────────────────────────── */}
      {!isAuthPage && (
        <footer className="border-t border-[var(--border)] bg-[var(--surface)]/30 py-12 mt-16 w-full flex justify-center">
          <div className="w-full max-w-[1200px] px-6 flex flex-col sm:flex-row items-center justify-between gap-6 text-sm text-[var(--text-secondary)]">
            <div className="flex items-center gap-3">
              <Film className="h-5 w-5 text-primary-500" />
              <span className="font-black text-[var(--text-primary)] tracking-wide">CineTV</span>
              <span className="text-[var(--text-muted)] font-medium">— Intelligent Cinema Platform</span>
            </div>
            <p className="text-[var(--text-muted)] text-xs font-medium">© {new Date().getFullYear()} CineTV. All rights reserved.</p>
          </div>
        </footer>
      )}

      {/* Floating Interactive Dock Navigation */}
      {!['/login', '/register', '/forgot-password', '/reset-password', '/verify-email', '/profile'].includes(location.pathname) && (
        <Dock
          items={dockItems}
          panelHeight={isMobile ? 52 : 68}
          baseItemSize={isMobile ? 36 : 50}
          magnification={isMobile ? 50 : 70}
        />
      )}
      </div>
    </div>
  );
}
