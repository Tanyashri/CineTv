import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/auth.context';
import { useRecommendation } from '../contexts/recommendation.context';
import { useTheme } from '../contexts/theme.context';
import { frontendRecommendationService } from '../services/recommendation.service';
import type { RecommendationHistoryItem } from '../services/recommendation.service';

import {
  User as UserIcon,
  Mail,
  Shield,
  Calendar,
  Save,
  CheckCircle2,
  AlertCircle,
  LogOut,
  Heart,
  History,
  Bookmark,
  Sparkles,
} from 'lucide-react';
import { motion } from 'framer-motion';

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
    <div className="mx-auto max-w-[1200px] px-6 py-10 space-y-8">
      {/* ─── Profile Header ───────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-3xl p-6 sm:p-8 shadow-2xl"
      >
        <div className="flex flex-col sm:flex-row items-center gap-6 border-b border-surface-700 pb-6">
          <div className="relative">
            {user.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.fullName || 'User avatar'}
                className="h-24 w-24 rounded-full object-cover border-2 border-primary-500 shadow-xl"
              />
            ) : (
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-primary-600 to-accent-600 text-3xl font-bold text-white shadow-xl">
                {(user.fullName || user.name || user.email)?.[0]?.toUpperCase() || 'U'}
              </div>
            )}
            <span className="absolute bottom-1 right-1 h-4 w-4 rounded-full bg-emerald-500 border-2 border-surface-900" />
          </div>

          <div className="text-center sm:text-left flex-1">
            <h1 className="text-2xl font-bold text-white">{user.fullName || user.name || 'CineVerse User'}</h1>
            <p className="text-sm text-slate-400">{user.email}</p>
            <div className="mt-2 flex flex-wrap justify-center sm:justify-start gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-primary-500/10 px-3 py-1 text-xs font-medium text-primary-400 border border-primary-500/20">
                <Shield className="h-3.5 w-3.5" /> {user.role}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-accent-500/10 px-3 py-1 text-xs font-medium text-accent-400 border border-accent-500/20">
                Provider: {user.authProvider || user.provider || 'EMAIL'}
              </span>
            </div>
          </div>

          <button
            onClick={() => logout()}
            className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm font-medium text-red-400 hover:bg-red-500/20 transition-all"
          >
            <LogOut className="h-4 w-4" /> Sign Out
          </button>
        </div>

        {/* Profile Tabs Bar */}
        <div className="flex items-center gap-2 pt-6 overflow-x-auto text-xs">
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 font-bold transition-all ${
              activeTab === 'profile'
                ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/20'
                : 'bg-surface-800 text-slate-400 hover:text-white'
            }`}
          >
            <UserIcon className="h-4 w-4" />
            <span>Profile & Account</span>
          </button>
          <button
            onClick={() => setActiveTab('favorites')}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 font-bold transition-all ${
              activeTab === 'favorites'
                ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/20'
                : 'bg-surface-800 text-slate-400 hover:text-white'
            }`}
          >
            <Heart className="h-4 w-4 text-rose-400" />
            <span>Favorites & Watched ({favorites.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 font-bold transition-all ${
              activeTab === 'history'
                ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/20'
                : 'bg-surface-800 text-slate-400 hover:text-white'
            }`}
          >
            <History className="h-4 w-4 text-amber-400" />
            <span>Recommendation History</span>
          </button>
          <button
            onClick={() => setActiveTab('preferences')}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 font-bold transition-all ${
              activeTab === 'preferences'
                ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/20'
                : 'bg-surface-800 text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="h-4 w-4 text-amber-500" />
            <span>Preferences & Posture</span>
          </button>
        </div>
      </motion.div>

      {/* ─── Tab Content Views ───────────────────────────── */}
      {activeTab === 'profile' && (
        <form onSubmit={handleSubmit} className="glass rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
          <h2 className="text-lg font-bold text-white">Edit Account Details</h2>

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

          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Full Name
              </label>
              <div className="relative">
                <UserIcon className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Your Full Name"
                  className="w-full rounded-xl border border-surface-600 bg-surface-800 py-3 pl-11 pr-4 text-sm text-white placeholder-slate-500 focus:border-primary-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Email Address (Read-only)
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
                <input
                  type="email"
                  disabled
                  value={user.email}
                  className="w-full rounded-xl border border-surface-700 bg-surface-900 py-3 pl-11 pr-4 text-sm text-slate-400 cursor-not-allowed"
                />
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Avatar Image URL
              </label>
              <input
                type="url"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="https://example.com/avatar.jpg"
                className="w-full rounded-xl border border-surface-600 bg-surface-800 py-3 px-4 text-sm text-white placeholder-slate-500 focus:border-primary-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-surface-700 pt-6">
            <span className="flex items-center gap-1.5 text-xs text-slate-400">
              <Calendar className="h-4 w-4" /> Account created: {new Date(user.createdAt).toLocaleDateString()}
            </span>

            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center gap-2 rounded-xl bg-primary-600 px-6 py-3 text-sm font-semibold text-white hover:bg-primary-500 transition-all disabled:opacity-50"
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
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Heart className="h-5 w-5 text-rose-400" />
            <span>Favourite Movies & Saved Collection</span>
          </h2>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-surface-700 bg-surface-800/40 p-4">
              <div className="flex items-center gap-2 text-xs font-bold text-rose-400 mb-2">
                <Heart className="h-4 w-4 fill-rose-400" />
                <span>Loved Movies</span>
              </div>
              <span className="text-2xl font-extrabold text-white">{favorites.length}</span>
            </div>

            <div className="rounded-2xl border border-surface-700 bg-surface-800/40 p-4">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-400 mb-2">
                <Bookmark className="h-4 w-4" />
                <span>Watch Later</span>
              </div>
              <span className="text-2xl font-extrabold text-white">{watchLater.length}</span>
            </div>

            <div className="rounded-2xl border border-surface-700 bg-surface-800/40 p-4">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 mb-2">
                <CheckCircle2 className="h-4 w-4" />
                <span>Already Watched</span>
              </div>
              <span className="text-2xl font-extrabold text-white">{watched.length}</span>
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
            <div className="divide-y divide-surface-800">
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
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-amber-500" />
            <span>AI Preference Engine Settings</span>
          </h2>

          <div className="grid gap-4 sm:grid-cols-2 text-xs">
            <div className="rounded-xl border border-surface-700 bg-surface-800/40 p-4 space-y-1">
              <span className="font-bold text-white block">Preferred Language</span>
              <span className="text-primary-400 font-semibold">{userPreferences.preferredLanguage.toUpperCase()}</span>
            </div>

            <div className="rounded-xl border border-surface-700 bg-surface-800/40 p-4 space-y-1">
              <span className="font-bold text-white block">Active Recommendation Mode</span>
              <span className="text-amber-400 font-semibold">{activeMode.toUpperCase()}</span>
            </div>

            <div className="rounded-xl border border-surface-700 bg-surface-800/40 p-4 space-y-1">
              <span className="font-bold text-white block">Max Duration Threshold</span>
              <span className="text-accent-400 font-semibold">{userPreferences.maxRuntime} minutes</span>
            </div>

            <div className="rounded-xl border border-surface-700 bg-surface-800/40 p-4 space-y-1">
              <span className="font-bold text-white block">Active Trigger Filters</span>
              <span className="text-amber-400 font-semibold">{activeTriggers.length} categories active</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
