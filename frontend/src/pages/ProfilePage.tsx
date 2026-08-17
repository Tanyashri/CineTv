import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/auth.context';
import { useRecommendation } from '../contexts/recommendation.context';
import { useTheme } from '../contexts/theme.context';
import type { RecommendationHistoryItem } from '../services/recommendation.service';
import { frontendRecommendationService } from '../services/recommendation.service';

import { motion } from 'framer-motion';
import {
  AlertCircle,
  Bookmark,
  Calendar,
  CheckCircle2,
  Heart,
  History,
  LogOut,
  Mail,
  Save,
  Shield,
  Sparkles,
  User as UserIcon,
} from 'lucide-react';

export function ProfilePage() {
  const { user, updateProfile, logout, isLoading, error, clearError } = useAuth();
  const { favorites, watched, watchLater, userPreferences, activeTriggers } = useRecommendation();
  const { activeMode } = useTheme();

  const [activeTab, setActiveTab] = useState<'profile' | 'favorites' | 'history' | 'preferences'>('profile');
  const [fullName, setFullName] = useState(user?.fullName || user?.name || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '');
  const [isSaved, setIsSaved] = useState(false);
  const [recHistory, setRecHistory] = useState<RecommendationHistoryItem[]>([]);

  useEffect(() => {
    async function loadHistory() {
      const data = await frontendRecommendationService.getHistory();
      setRecHistory(data);
    }
    loadHistory();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setIsSaved(false);
    try {
      await updateProfile({ fullName, avatarUrl: avatarUrl.trim() || null });
      setIsSaved(true);
    } catch {
      // Error handled in AuthContext
    }
  };

  if (!user) return null;

  return (
    <div className="mx-auto px-6 my-10 space-y-8" style={{ width: '100%', maxWidth: '960px' }}>
      {/* ─── Profile Header ───────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-3xl p-6 sm:p-8 shadow-2xl"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-[var(--border)] pb-6">
          {/* Left Side: Avatar + User Info */}
          <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
            <div className="relative shrink-0">
              {user.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.fullName || 'User avatar'}
                  className="h-24 w-24 rounded-full object-cover border-2 border-primary-500 shadow-xl"
                />
              ) : (
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary-500 text-3xl font-bold text-white shadow-xl">
                  {(user.fullName || user.name || user.email)?.[0]?.toUpperCase() || 'U'}
                </div>
              )}
              <span className="absolute bottom-1 right-1 h-4 w-4 rounded-full bg-emerald-500 border-2 border-[var(--background)]" />
            </div>

            <div className="space-y-1">
              <h1 className="text-2xl sm:text-3xl font-black text-white">{user.fullName || user.name || 'CineVerse User'}</h1>
              <p className="text-sm sm:text-base text-slate-400">{user.email}</p>
              <div className="mt-2 flex flex-wrap justify-center sm:justify-start gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-primary-500/10 px-3 py-1 text-xs font-bold text-primary-400 border border-primary-500/20">
                  <Shield className="h-3.5 w-3.5" /> {user.role}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-primary-500/10 px-3 py-1 text-xs font-bold text-primary-400 border border-primary-500/20">
                  Provider: {user.authProvider || user.provider || 'EMAIL'}
                </span>
              </div>
            </div>
          </div>

          {/* Right Side: Sign Out Button */}
          <div className="w-full md:w-auto flex justify-center md:justify-end shrink-0">
            <button
              onClick={() => logout()}
              className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-8 h-12 text-sm sm:text-base font-bold text-red-400 hover:bg-red-500/20 transition-all cursor-pointer"
            >
              <LogOut className="h-4 w-4" /> Sign Out
            </button>
          </div>
        </div>

        {/* Profile Tabs Bar */}
        <div className="flex items-center gap-3 pt-6 overflow-x-auto scrollbar-none pb-1 text-xs w-full whitespace-nowrap">
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex items-center gap-2.5 rounded-xl px-5 h-11 text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer shrink-0 ${
              activeTab === 'profile'
                ? 'bg-primary-500 text-white shadow-md shadow-primary-500/20'
                : 'bg-[var(--surface-card)] text-slate-400 hover:bg-[var(--surface-elevated)] hover:text-white border border-[var(--border)]'
            }`}
          >
            <UserIcon className="h-4 w-4 text-primary-400" />
            <span>Profile & Account</span>
          </button>
          <button
            onClick={() => setActiveTab('favorites')}
            className={`flex items-center gap-2.5 rounded-xl px-5 h-11 text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer shrink-0 ${
              activeTab === 'favorites'
                ? 'bg-primary-500 text-white shadow-md shadow-primary-500/20'
                : 'bg-[var(--surface-card)] text-slate-400 hover:bg-[var(--surface-elevated)] hover:text-white border border-[var(--border)]'
            }`}
          >
            <Heart className="h-4 w-4 text-rose-400" />
            <span>Favorites & Watched ({favorites.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-2.5 rounded-xl px-5 h-11 text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer shrink-0 ${
              activeTab === 'history'
                ? 'bg-primary-500 text-white shadow-md shadow-primary-500/20'
                : 'bg-[var(--surface-card)] text-slate-400 hover:bg-[var(--surface-elevated)] hover:text-white border border-[var(--border)]'
            }`}
          >
            <History className="h-4 w-4 text-amber-400" />
            <span>Recommendation History</span>
          </button>
          <button
            onClick={() => setActiveTab('preferences')}
            className={`flex items-center gap-2.5 rounded-xl px-5 h-11 text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer shrink-0 ${
              activeTab === 'preferences'
                ? 'bg-primary-500 text-white shadow-md shadow-primary-500/20'
                : 'bg-[var(--surface-card)] text-slate-400 hover:bg-[var(--surface-elevated)] hover:text-white border border-[var(--border)]'
            }`}
          >
            <Sparkles className="h-4 w-4 text-amber-500" />
            <span>Preferences & Posture</span>
          </button>
        </div>
      </motion.div>

      {/* ─── Tab Content Views ───────────────────────────── */}
      {activeTab === 'profile' && (
        <form onSubmit={handleSubmit} className="glass rounded-3xl p-6 sm:p-8 space-y-8 shadow-2xl">
          <h2 className="text-xl sm:text-2xl font-black text-white">Edit Account Details</h2>

          {isSaved && (
            <div className="flex items-center gap-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-4 text-sm text-emerald-400">
              <CheckCircle2 className="h-5 w-5 shrink-0" />
              <span>Profile updated successfully!</span>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-3 rounded-xl bg-red-500/10 border border-red-500/20 p-4 text-sm text-red-400">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Full Name
              </label>
              <div className="relative">
                <UserIcon
                  className="absolute top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500"
                  style={{ left: '16px' }}
                />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Your Full Name"
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-card)] h-12 pr-4 text-sm sm:text-base text-white placeholder-slate-500 focus:border-primary-500 focus:outline-none transition-colors"
                  style={{ paddingLeft: '48px' }}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Email Address (Read-only)
              </label>
              <div className="relative">
                <Mail
                  className="absolute top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500"
                  style={{ left: '16px' }}
                />
                <input
                  type="email"
                  disabled
                  value={user?.email || ''}
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] h-12 pr-4 text-sm sm:text-base text-slate-400 cursor-not-allowed"
                  style={{ paddingLeft: '48px' }}
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Avatar Image URL
              </label>
              <input
                type="url"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="https://example.com/avatar.jpg"
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-card)] h-12 px-5 text-sm sm:text-base text-white placeholder-slate-500 focus:border-primary-500 focus:outline-none transition-colors"
              />
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-[var(--border)] pt-6">
            <span className="flex items-center gap-1.5 text-xs text-slate-400">
              <Calendar className="h-4 w-4" /> Account created: {new Date(user.createdAt).toLocaleDateString()}
            </span>

            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center gap-2 rounded-xl bg-primary-500 px-8 h-12 text-sm sm:text-base font-bold text-white hover:bg-primary-600 transition-all disabled:opacity-50 cursor-pointer shadow-lg shadow-primary-500/25"
            >
              {isLoading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <>
                  <Save className="h-4 w-4" /> Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {activeTab === 'favorites' && (
        <div className="glass rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
          <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2.5">
            <Heart className="h-6 w-6 text-rose-400" />
            <span>Favourite Movies & Saved Collection</span>
          </h2>

          <div className="grid gap-6 sm:grid-cols-3">
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-card)]/40" style={{ padding: '24px' }}>
              <div className="flex items-center gap-2.5 text-sm font-bold text-rose-400 mb-3">
                <Heart className="h-5 w-5 fill-rose-400" />
                <span>Loved Movies</span>
              </div>
              <span className="text-4xl font-extrabold text-white block">{favorites.length}</span>
            </div>

            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-card)]/40" style={{ padding: '24px' }}>
              <div className="flex items-center gap-2.5 text-sm font-bold text-amber-400 mb-3">
                <Bookmark className="h-5 w-5 fill-amber-400/20 text-amber-400" />
                <span>Watch Later</span>
              </div>
              <span className="text-4xl font-extrabold text-white block">{watchLater.length}</span>
            </div>

            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-card)]/40" style={{ padding: '24px' }}>
              <div className="flex items-center gap-2.5 text-sm font-bold text-emerald-400 mb-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                <span>Already Watched</span>
              </div>
              <span className="text-4xl font-extrabold text-white block">{watched.length}</span>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'history' && (
        <div className="glass rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <History className="h-5 w-5 text-amber-400" />
            <span>Recommendation Search Audit Log</span>
          </h2>

          {recHistory.length > 0 ? (
            <div className="divide-y divide-[var(--border)]">
              {recHistory.map((item) => (
                <div key={item.id} className="py-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-white">"{item.prompt}"</p>
                    <span className="text-xs text-slate-400">{new Date(item.createdAt).toLocaleString()}</span>
                  </div>
                  <span className="rounded-full bg-primary-500/20 px-3 py-1 text-xs font-bold text-primary-300">
                    Logged
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400">No recommendation audit history recorded yet.</p>
          )}
        </div>
      )}

      {activeTab === 'preferences' && (
        <div className="glass rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
          <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2.5">
            <Sparkles className="h-6 w-6 text-amber-500" />
            <span>AI Preference Engine Settings</span>
          </h2>

          <div className="grid gap-6 sm:grid-cols-2 text-xs sm:text-sm">
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-card)]/40 space-y-1.5" style={{ padding: '24px' }}>
              <span className="font-bold text-[var(--text-secondary)] block">Preferred Language</span>
              <span className="text-2xl font-black text-primary-400 block">{userPreferences.preferredLanguage.toUpperCase()}</span>
            </div>

            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-card)]/40 space-y-1.5" style={{ padding: '24px' }}>
              <span className="font-bold text-[var(--text-secondary)] block">Active Recommendation Mode</span>
              <span className="text-2xl font-black text-amber-400 block">{activeMode.toUpperCase()}</span>
            </div>

            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-card)]/40 space-y-1.5" style={{ padding: '24px' }}>
              <span className="font-bold text-[var(--text-secondary)] block">Max Duration Threshold</span>
              <span className="text-2xl font-black text-rose-400 block">{userPreferences.maxRuntime} minutes</span>
            </div>

            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-card)]/40 space-y-1.5" style={{ padding: '24px' }}>
              <span className="font-bold text-[var(--text-secondary)] block">Active Trigger Filters</span>
              <span className="text-2xl font-black text-emerald-400 block">{activeTriggers.length} categories active</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
