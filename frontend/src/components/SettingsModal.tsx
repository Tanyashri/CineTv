import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, X, Moon, Sun, Globe, Sparkles, Clock, ShieldAlert, Bell, Tv } from 'lucide-react';
import { useRecommendation } from '../contexts/recommendation.context';
import { useTheme } from '../contexts/theme.context';
import type { RecommendationModeId } from '../contexts/theme.context';
import { MODE_OPTIONS } from './AIInputArea';

export const SettingsModal: React.FC = () => {
  const {
    isSettingsOpen,
    setIsSettingsOpen,
    userPreferences,
    updatePreferences,
    activeTriggers,
    setIsTriggerPanelOpen,
  } = useRecommendation();

  const { themeMode, toggleThemeMode, activeMode, setActiveMode } = useTheme();

  if (!isSettingsOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="glass max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl border border-primary-500/30 p-6 shadow-2xl space-y-6"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-surface-700 pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-500/20 text-primary-400">
                <Settings className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Platform Settings & Preferences</h3>
                <p className="text-xs text-slate-400">Customize AI behavior, defaults, and interface themes</p>
              </div>
            </div>
            <button
              onClick={() => setIsSettingsOpen(false)}
              className="rounded-lg p-2 text-slate-400 hover:bg-surface-700 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Settings Options List */}
          <div className="space-y-4 text-xs">
            {/* Theme Toggle */}
            <div className="flex items-center justify-between rounded-xl border border-surface-700 bg-surface-800/50 p-3.5">
              <div className="flex items-center gap-3">
                {themeMode === 'dark' ? <Moon className="h-5 w-5 text-primary-400" /> : <Sun className="h-5 w-5 text-amber-400" />}
                <div>
                  <span className="font-bold text-white block text-sm">Interface Theme</span>
                  <span className="text-slate-400">Switch between dark cinematic aesthetic and light mode</span>
                </div>
              </div>
              <button
                onClick={toggleThemeMode}
                className="rounded-xl bg-surface-700 px-4 py-2 text-xs font-semibold text-white hover:bg-primary-600 transition-all"
              >
                {themeMode === 'dark' ? '🌙 Dark Mode' : '☀️ Light Mode'}
              </button>
            </div>

            {/* Preferred Language */}
            <div className="flex items-center justify-between rounded-xl border border-surface-700 bg-surface-800/50 p-3.5">
              <div className="flex items-center gap-3">
                <Globe className="h-5 w-5 text-primary-400" />
                <div>
                  <span className="font-bold text-white block text-sm">Preferred Language</span>
                  <span className="text-slate-400">Default language for AI movie recommendations</span>
                </div>
              </div>
              <select
                value={userPreferences.preferredLanguage}
                onChange={(e) => updatePreferences({ preferredLanguage: e.target.value })}
                className="rounded-xl border border-surface-600 bg-surface-900 px-3 py-1.5 text-xs text-white outline-none cursor-pointer"
              >
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="de">German</option>
                <option value="ja">Japanese</option>
                <option value="ko">Korean</option>
                <option value="hi">Hindi</option>
              </select>
            </div>

            {/* Preferred Region / Country */}
            <div className="flex items-center justify-between rounded-xl border border-surface-700 bg-surface-800/50 p-3.5">
              <div className="flex items-center gap-3">
                <Globe className="h-5 w-5 text-indigo-400" />
                <div>
                  <span className="font-bold text-white block text-sm">Preferred Region</span>
                  <span className="text-slate-400">Availability region for streaming and watch providers</span>
                </div>
              </div>
              <select
                value={userPreferences.preferredRegion || 'IN'}
                onChange={(e) => updatePreferences({ preferredRegion: e.target.value })}
                className="rounded-xl border border-surface-600 bg-surface-900 px-3 py-1.5 text-xs text-white outline-none cursor-pointer"
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

            {/* Default Recommendation Mode */}
            <div className="flex items-center justify-between rounded-xl border border-surface-700 bg-surface-800/50 p-3.5">
              <div className="flex items-center gap-3">
                <Sparkles className="h-5 w-5 text-amber-400" />
                <div>
                  <span className="font-bold text-white block text-sm">Default Recommendation Mode</span>
                  <span className="text-slate-400">Default posture used for quick prompts</span>
                </div>
              </div>
              <select
                value={activeMode}
                onChange={(e) => setActiveMode(e.target.value as RecommendationModeId)}
                className="rounded-xl border border-surface-600 bg-surface-900 px-3 py-1.5 text-xs text-white outline-none cursor-pointer"
              >
                {MODE_OPTIONS.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.icon} {m.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Default Runtime Constraint */}
            <div className="flex items-center justify-between rounded-xl border border-surface-700 bg-surface-800/50 p-3.5">
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-accent-400" />
                <div>
                  <span className="font-bold text-white block text-sm">Default Max Runtime</span>
                  <span className="text-slate-400">Maximum preferred duration for recommendations</span>
                </div>
              </div>
              <select
                value={userPreferences.maxRuntime}
                onChange={(e) => updatePreferences({ maxRuntime: Number(e.target.value) })}
                className="rounded-xl border border-surface-600 bg-surface-900 px-3 py-1.5 text-xs text-white outline-none cursor-pointer"
              >
                <option value={90}>Short (&lt;90 minutes)</option>
                <option value={120}>Medium (&lt;120 minutes)</option>
                <option value={180}>Any Duration (&lt;180 minutes)</option>
              </select>
            </div>

            {/* Trigger Warning Filters Link */}
            <div className="flex items-center justify-between rounded-xl border border-surface-700 bg-surface-800/50 p-3.5">
              <div className="flex items-center gap-3">
                <ShieldAlert className="h-5 w-5 text-amber-400" />
                <div>
                  <span className="font-bold text-white block text-sm">Sensitive Trigger Filters</span>
                  <span className="text-slate-400">{activeTriggers.length} categories currently active</span>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsSettingsOpen(false);
                  setIsTriggerPanelOpen(true);
                }}
                className="rounded-xl border border-amber-500/30 bg-amber-500/20 px-3.5 py-1.5 text-xs font-semibold text-amber-300 hover:bg-amber-500/30"
              >
                Manage Triggers
              </button>
            </div>

            {/* Streaming Preferences */}
            <div className="flex items-center justify-between rounded-xl border border-surface-700 bg-surface-800/50 p-3.5">
              <div className="flex items-center gap-3">
                <Tv className="h-5 w-5 text-primary-400" />
                <div>
                  <span className="font-bold text-white block text-sm">Streaming Services</span>
                  <span className="text-slate-400">Highlight availability for US/Global subscriptions</span>
                </div>
              </div>
              <span className="text-slate-400 font-semibold text-[11px]">Netflix, Prime, Disney+</span>
            </div>

            {/* Notifications (Future-Ready) */}
            <div className="flex items-center justify-between rounded-xl border border-surface-700 bg-surface-800/50 p-3.5">
              <div className="flex items-center gap-3">
                <Bell className="h-5 w-5 text-emerald-400" />
                <div>
                  <span className="font-bold text-white block text-sm">Push Notifications (Future-Ready)</span>
                  <span className="text-slate-400">Receive alerts when new releases match your taste</span>
                </div>
              </div>
              <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[10px] font-bold text-emerald-300">
                Enabled
              </span>
            </div>
          </div>

          {/* Footer Close Button */}
          <div className="border-t border-surface-700 pt-4 flex justify-end">
            <button
              onClick={() => setIsSettingsOpen(false)}
              className="rounded-xl bg-primary-600 px-6 py-2.5 text-xs font-bold text-white shadow-lg hover:bg-primary-500"
            >
              Save & Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
