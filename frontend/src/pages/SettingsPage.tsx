import React from 'react';
import { Settings, Moon, Sun, Monitor, ShieldAlert, Sliders, User as UserIcon, LogOut } from 'lucide-react';
import { useTheme } from '../contexts/theme.context';
import { useRecommendation } from '../contexts/recommendation.context';
import { useAuth } from '../contexts/auth.context';

const SENSITIVE_TRIGGERS = [
  { id: 'violence', label: 'Graphic Violence' },
  { id: 'jump-scares', label: 'Jump Scares & Horror' },
  { id: 'substance', label: 'Substance Abuse' },
  { id: 'mental-health', label: 'Mental Health Themes' },
  { id: 'gore', label: 'Gore & Medical Distress' },
  { id: 'sexual-content', label: 'Explicit Sexual Content' },
];

export function SettingsPage() {
  const { themePreference, setThemePreference } = useTheme();
  const { activeTriggers, toggleTrigger, userPreferences, updatePreferences } = useRecommendation();
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <div className="w-full max-w-[1200px] mx-auto px-6 py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-3">
          <Settings className="h-7 w-7 text-primary-400" />
          <span>Platform Settings</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Customize your CineTV preference parameters, themes, and content safety filters
        </p>
      </div>

      <div className="space-y-6">
        {/* ─── Section 1: Appearance & Theme ────────────── */}
        <div className="glass rounded-2xl border border-surface-700 p-6 space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <Moon className="h-4 w-4 text-amber-400" />
            <span>Appearance & Theme</span>
          </h2>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 border-t border-surface-700/60">
            <div>
              <p className="text-sm font-bold text-white">Color Mode</p>
              <p className="text-xs text-slate-400">Switch between dark cinematic theme, clean light theme, or follow system preferences</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setThemePreference('dark')}
                className={`flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold transition-all ${
                  themePreference === 'dark'
                    ? 'border-primary-500 bg-primary-500 text-white shadow-md'
                    : 'border-surface-600 bg-surface-800 text-slate-300 hover:text-white'
                }`}
              >
                <Moon className="h-3.5 w-3.5" />
                <span>Dark</span>
              </button>

              <button
                onClick={() => setThemePreference('light')}
                className={`flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold transition-all ${
                  themePreference === 'light'
                    ? 'border-primary-500 bg-primary-500 text-white shadow-md'
                    : 'border-surface-600 bg-surface-800 text-slate-300 hover:text-white'
                }`}
              >
                <Sun className="h-3.5 w-3.5" />
                <span>Light</span>
              </button>

              <button
                onClick={() => setThemePreference('system')}
                className={`flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold transition-all ${
                  themePreference === 'system'
                    ? 'border-primary-500 bg-primary-500 text-white shadow-md'
                    : 'border-surface-600 bg-surface-800 text-slate-300 hover:text-white'
                }`}
              >
                <Monitor className="h-3.5 w-3.5" />
                <span>System</span>
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-surface-700/60 mt-2">
            <div>
              <p className="text-sm font-bold text-white">Cinematic Intro Animation</p>
              <p className="text-xs text-slate-400">Replay the full-screen auto-rotating movie globe intro sequence</p>
            </div>

            <button
              onClick={() => {
                localStorage.removeItem('cinetv_intro_seen');
                window.location.href = '/?replay=true';
              }}
              className="flex items-center gap-1.5 rounded-xl border border-primary-500/30 bg-primary-500/10 px-4 py-2.5 text-xs font-semibold text-primary-400 hover:bg-primary-500 hover:text-white transition-all cursor-pointer shadow-sm"
            >
              <span>Replay Intro</span>
            </button>
          </div>
        </div>

        {/* ─── Section 2: Trigger & Content Filters ─────── */}
        <div className="glass rounded-2xl border border-surface-700 p-6 space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 text-amber-400" />
            <span>Sensitive Trigger Filters</span>
          </h2>
          <p className="text-xs text-slate-400">
            Toggle triggers you wish to filter out from AI movie recommendations automatically.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {SENSITIVE_TRIGGERS.map((t) => {
              const isActive = activeTriggers.includes(t.id);
              return (
                <button
                  key={t.id}
                  onClick={() => toggleTrigger(t.id)}
                  className={`flex items-center justify-between rounded-xl border px-4 py-3 text-xs font-semibold transition-all ${
                    isActive
                      ? 'border-amber-500/80 bg-amber-500/15 text-amber-300 shadow-md'
                      : 'border-surface-700 bg-surface-800/80 text-slate-400 hover:border-surface-600 hover:text-white'
                  }`}
                >
                  <span>{t.label}</span>
                  <span
                    className={`h-2.5 w-2.5 rounded-full ${
                      isActive ? 'bg-amber-400 shadow-sm shadow-amber-400' : 'bg-surface-600'
                    }`}
                  />
                </button>
              );
            })}
          </div>
        </div>

        {/* ─── Section 3: Recommendation Preferences ────── */}
        <div className="glass rounded-2xl border border-surface-700 p-6 space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <Sliders className="h-4 w-4 text-primary-400" />
            <span>Recommendation Preferences</span>
          </h2>

          <div className="space-y-4 pt-2 border-t border-surface-700/60">
            {/* Minimum Rating */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-white">Minimum Rating Threshold</p>
                <p className="text-xs text-slate-400">Filter recommendations below this rating score</p>
              </div>

              <select
                value={userPreferences.minRating}
                onChange={(e) => updatePreferences({ minRating: Number(e.target.value) })}
                className="rounded-xl border border-surface-600 bg-surface-800 px-3 py-1.5 text-xs text-white focus:outline-none"
              >
                <option value={0}>Any Rating</option>
                <option value={6}>6.0+ / 10</option>
                <option value={7}>7.0+ / 10</option>
                <option value={8}>8.0+ / 10</option>
              </select>
            </div>

            {/* Max Runtime */}
            <div className="flex items-center justify-between pt-2 border-t border-surface-700/40">
              <div>
                <p className="text-sm font-bold text-white">Maximum Runtime Limit</p>
                <p className="text-xs text-slate-400">Exclude movies longer than this duration</p>
              </div>

              <select
                value={userPreferences.maxRuntime}
                onChange={(e) => updatePreferences({ maxRuntime: Number(e.target.value) })}
                className="rounded-xl border border-surface-600 bg-surface-800 px-3 py-1.5 text-xs text-white focus:outline-none"
              >
                <option value={90}>90 minutes (1.5h)</option>
                <option value={120}>120 minutes (2h)</option>
                <option value={150}>150 minutes (2.5h)</option>
                <option value={180}>180 minutes (3h)</option>
              </select>
            </div>

            {/* Language Preference */}
            <div className="flex items-center justify-between pt-2 border-t border-surface-700/40">
              <div>
                <p className="text-sm font-bold text-white">Preferred Audio / Subtitle Language</p>
                <p className="text-xs text-slate-400">Language preference for movie titles and summaries</p>
              </div>

              <select
                value={userPreferences.preferredLanguage}
                onChange={(e) => updatePreferences({ preferredLanguage: e.target.value })}
                className="rounded-xl border border-surface-600 bg-surface-800 px-3 py-1.5 text-xs text-white focus:outline-none"
              >
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="ja">Japanese</option>
                <option value="hi">Hindi</option>
              </select>
            </div>

            {/* Preferred Region / Country */}
            <div className="flex items-center justify-between pt-2 border-t border-surface-700/40">
              <div>
                <p className="text-sm font-bold text-white">Preferred Country / Region</p>
                <p className="text-xs text-slate-400">Region for streaming availability and watch providers</p>
              </div>

              <select
                value={userPreferences.preferredRegion || 'IN'}
                onChange={(e) => updatePreferences({ preferredRegion: e.target.value })}
                className="rounded-xl border border-surface-600 bg-surface-800 px-3 py-1.5 text-xs text-white focus:outline-none"
              >
                <option value="IN">India</option>
                <option value="US">United States</option>
                <option value="GB">United Kingdom</option>
                <option value="CA">Canada</option>
                <option value="AU">Australia</option>
                <option value="KR">South Korea</option>
                <option value="JP">Japan</option>
                <option value="FR">France</option>
                <option value="DE">Germany</option>
              </select>
            </div>
          </div>
        </div>

        {/* ─── Section 4: Account & Auth ─────────────────── */}
        {isAuthenticated && user && (
          <div className="glass rounded-2xl border border-surface-700 p-6 space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <UserIcon className="h-4 w-4 text-primary-400" />
              <span>Account Credentials</span>
            </h2>

            <div className="flex items-center justify-between pt-2 border-t border-surface-700/60">
              <div>
                <p className="text-sm font-bold text-white">{user.fullName || user.name || 'User'}</p>
                <p className="text-xs text-slate-400">{user.email}</p>
              </div>

              <button
                onClick={() => logout()}
                className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2 text-xs font-semibold text-red-400 hover:bg-red-500 hover:text-white transition-all"
              >
                <LogOut className="h-4 w-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
