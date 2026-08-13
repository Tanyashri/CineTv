import { useState, useRef, useEffect } from 'react';
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
      <header className="sticky top-4 z-40 w-full px-4 flex flex-col items-center pointer-events-none">
        <div className="w-full max-w-5xl rounded-full border border-[var(--glass-border)] bg-[var(--glass-bg)] backdrop-blur-lg px-6 py-2.5 flex items-center justify-between shadow-[0_12px_40px_rgba(0,0,0,0.2)] dark:shadow-[0_12px_40px_rgba(0,0,0,0.6)] pointer-events-auto relative">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 transition-opacity hover:opacity-80">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-500 shadow-md shadow-primary-500/20">
              <Film className="h-4.5 w-4.5 text-white" />
            </div>
            <span className="text-lg font-black tracking-tight text-[var(--text-primary)]">
              Cine<span className="text-primary-500">TV</span>
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.to;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`text-xs font-bold transition-colors ${
                    isActive ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  <span>{link.label}</span>
                </Link>
              );
            })}

            {/* Services Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setServicesOpen(!servicesOpen)}
                className={`flex items-center gap-1.5 text-xs font-bold transition-colors ${
                  servicesOpen ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                <span>Services</span>
                <ChevronDown className={`h-3 w-3 transition-transform ${servicesOpen ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {servicesOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute left-0 mt-3 w-64 rounded-2xl border border-[var(--border)] bg-[var(--surface)]/95 p-2 shadow-2xl z-50 backdrop-blur-md"
                  >
                    {serviceItems.map((item) => {
                      const Icon = item.icon;
                      return (
                        <Link
                          key={item.label}
                          to={item.to}
                          onClick={() => setServicesOpen(false)}
                          className="flex items-start gap-3 rounded-xl p-2.5 hover:bg-[var(--surface-elevated)] transition-colors group"
                        >
                          <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[var(--surface-elevated)] group-hover:bg-primary-500 text-[var(--text-secondary)] group-hover:text-white transition-colors">
                            <Icon className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-[var(--text-primary)] group-hover:text-primary-500 transition-colors">
                              {item.label}
                            </p>
                            <p className="text-[10px] text-[var(--text-muted)]">{item.desc}</p>
                          </div>
                        </Link>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </nav>

          {/* Right Action Icons & Controls */}
          <div className="flex items-center gap-3">
            {/* Search Input in Navbar */}
            <div className="relative w-40 sm:w-48 md:w-56 select-none">
              <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-primary-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Search movies..."
                className="w-full rounded-full border border-[var(--border)] bg-[var(--surface-card)] pl-8.5 pr-8.5 py-1.5 text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:border-primary-500 focus:outline-none shadow-inner transition-all hover:border-[var(--border)] focus:bg-[var(--surface)]"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>

            {/* Theme Toggle */}
            <button
              onClick={toggleThemeMode}
              title="Toggle Theme"
              className="flex h-8.5 w-8.5 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface-card)] text-[var(--text-secondary)] hover:text-amber-400 transition-all cursor-pointer animate-none"
            >
              {themeMode === 'dark' ? <Moon className="h-3.5 w-3.5 text-primary-500" /> : <Sun className="h-3.5 w-3.5 text-amber-400" />}
            </button>

            {/* Profile / User Auth State */}
            {isAuthenticated && user ? (
              <div className="flex items-center gap-2">
                <Link
                  to="/profile"
                  className="flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface-card)] px-3 py-1 text-xs font-bold text-[var(--text-primary)] hover:border-primary-500 transition-all"
                >
                  {user.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt={user.fullName || 'User'}
                      className="h-5 w-5 rounded-full object-cover"
                    />
                  ) : (
                    <UserIcon className="h-3.5 w-3.5 text-primary-500" />
                  )}
                  <span className="max-w-[80px] truncate hidden sm:inline text-[var(--text-primary)]">
                    {user.fullName || user.name || user.email.split('@')[0]}
                  </span>
                </Link>

                <button
                  onClick={() => logout()}
                  title="Sign Out"
                  className="flex h-8.5 w-8.5 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface-card)] text-[var(--text-muted)] hover:border-red-500/40 hover:text-red-400 transition-all cursor-pointer"
                >
                  <LogOut className="h-3.5 w-3.5" />
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
                  className="rounded-full bg-[var(--text-primary)] px-5 py-2 text-xs font-bold text-[var(--background)] hover:opacity-90 transition-all shadow-md"
                >
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="flex h-8.5 w-8.5 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface-card)] md:hidden text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
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
              className="w-full max-w-5xl mt-2 rounded-3xl border border-[var(--border)] bg-[var(--surface)]/95 px-4 py-4 space-y-3 overflow-hidden shadow-2xl backdrop-blur-md pointer-events-auto"
            >
              <div className="grid grid-cols-2 gap-2">
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

              {!isAuthenticated && (
                <div className="flex gap-2 pt-2 border-t border-[var(--border)]">
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
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* ─── Main Content Area ────────────────────────── */}
      <main className="flex-1 w-full flex flex-col items-center" style={{ paddingTop: '110px' }}>
        <Outlet />
      </main>

      {/* ─── Footer ──────────────────────────────────── */}
      <footer className="border-t border-[var(--border)] bg-[var(--surface)]/40 py-8 w-full flex justify-center">
        <div className="w-full max-w-5xl px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[var(--text-secondary)]">
          <div className="flex items-center gap-2">
            <Film className="h-4 w-4 text-primary-500" />
            <span className="font-bold text-[var(--text-primary)]">CineTV</span>
            <span className="text-[var(--text-muted)]">— Intelligent Cinema Platform</span>
          </div>
          <p className="text-[var(--text-muted)]">© {new Date().getFullYear()} CineTV. All rights reserved.</p>
        </div>
      </footer>
      </div>
    </div>
  );
}
