import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Activity, Database, HardDrive, Clock, Tag, RefreshCw, Film, Sparkles } from 'lucide-react';
import { useHealth } from '@/hooks/use-health';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { updateApiKeys } from '@/services/health.service';

export function HealthPage() {
  const { data, isLoading, isError, error, refetch, isFetching } = useHealth();
  const [tmdbInput, setTmdbInput] = useState('');
  const [geminiInput, setGeminiInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleKeysSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tmdbInput.trim() && !geminiInput.trim()) return;

    setIsSaving(true);
    setSaveStatus(null);

    try {
      const payload: { tmdbApiKey?: string; geminiApiKey?: string } = {};
      if (tmdbInput.trim()) payload.tmdbApiKey = tmdbInput.trim();
      if (geminiInput.trim()) payload.geminiApiKey = geminiInput.trim();

      const result = await updateApiKeys(payload);
      if (result.success) {
        setSaveStatus({ type: 'success', message: 'API keys validated and saved successfully! Cache has been refreshed.' });
        setTmdbInput('');
        setGeminiInput('');
        refetch();
      } else {
        setSaveStatus({ type: 'error', message: result.message || 'Failed to save or validate API keys.' });
      }
    } catch (err: unknown) {
      setSaveStatus({
        type: 'error',
        message: err instanceof Error ? err.message : 'An unexpected error occurred during validation.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-[1200px] px-6 py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* ─── Header ───────────────────────────────── */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">System Health</h1>
            <p className="mt-1 text-slate-400">Real-time infrastructure status monitor</p>
          </div>
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="inline-flex items-center gap-2 rounded-xl border border-surface-600 bg-surface-800 px-4 py-2.5 text-sm font-medium text-slate-300 transition-all hover:border-primary-500/50 hover:text-white disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {/* ─── Loading State ────────────────────────── */}
        {isLoading && (
          <div className="glass flex items-center justify-center rounded-2xl p-16">
            <div className="flex flex-col items-center gap-4">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary-500/30 border-t-primary-500" />
              <p className="text-sm text-slate-400">Checking system health...</p>
            </div>
          </div>
        )}

        {/* ─── Error State ──────────────────────────── */}
        {isError && (
          <div className="glass rounded-2xl border-red-500/30 p-8 text-center">
            <p className="text-lg font-medium text-red-400">Failed to fetch health data</p>
            <p className="mt-2 text-sm text-slate-400">
              {error instanceof Error ? error.message : 'Unknown error'}
            </p>
          </div>
        )}

        {/* ─── Health Dashboard ─────────────────────── */}
        {data && (
          <div className="space-y-6">
            {/* Status Overview */}
            <div className="glass glow rounded-2xl p-8">
              <div className="mb-6 flex items-center gap-4">
                <div
                  className={`flex h-14 w-14 items-center justify-center rounded-2xl ${
                    data.backend === 'healthy'
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : 'bg-red-500/20 text-red-400'
                  }`}
                >
                  <Activity className="h-7 w-7" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    {data.backend === 'healthy' ? 'All Systems Operational' : 'System Degraded'}
                  </h2>
                  <p className="text-sm text-slate-400">
                    Last checked: {new Date(data.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Service Grid */}
              <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                <ServiceCard
                  icon={Activity}
                  label="Backend"
                  status={data.backend === 'healthy' ? 'connected' : 'disconnected'}
                />
                <ServiceCard
                  icon={Database}
                  label="PostgreSQL"
                  status={data.postgres}
                />
                <ServiceCard
                  icon={HardDrive}
                  label="Redis/Cache"
                  status={data.redis}
                />
                <ServiceCard
                  icon={Film}
                  label="TMDb API Key"
                  status={data.tmdb === 'configured' ? 'connected' : 'disconnected'}
                />
                <ServiceCard
                  icon={Sparkles}
                  label="Gemini API Key"
                  status={data.gemini === 'configured' ? 'connected' : 'disconnected'}
                />
              </div>
            </div>

            {/* API Keys Configuration Manager */}
            <div className="glass rounded-2xl p-6 border border-surface-700">
              <h3 className="mb-2 text-lg font-semibold text-white flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary-400 animate-pulse" />
                <span>API Keys Configuration Manager</span>
              </h3>
              <p className="text-xs text-slate-400 mb-6">
                Dynamically update and validate keys for Movie feeds (TMDb) and AI recommendations (Gemini) without restarting the server.
              </p>

              <form onSubmit={handleKeysSubmit} className="space-y-5">
                <div className="grid gap-5 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <Film className="h-3.5 w-3.5 text-primary-400" />
                      <span>TMDb API Key</span>
                      {data.tmdbKeyMasked && (
                        <span className="text-[10px] lowercase font-normal text-slate-500">
                          (Current: {data.tmdbKeyMasked})
                        </span>
                      )}
                    </label>
                    <input
                      type="password"
                      value={tmdbInput}
                      onChange={(e) => setTmdbInput(e.target.value)}
                      placeholder="Enter new TMDb API Key..."
                      className="w-full rounded-xl border border-surface-600 bg-surface-900 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-primary-500 focus:outline-none transition-colors"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5 text-primary-400" />
                      <span>Gemini API Key</span>
                      {data.geminiKeyMasked && (
                        <span className="text-[10px] lowercase font-normal text-slate-500">
                          (Current: {data.geminiKeyMasked})
                        </span>
                      )}
                    </label>
                    <input
                      type="password"
                      value={geminiInput}
                      onChange={(e) => setGeminiInput(e.target.value)}
                      placeholder="Enter new Gemini API Key..."
                      className="w-full rounded-xl border border-surface-600 bg-surface-900 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-primary-500 focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                {saveStatus && (
                  <div className={`rounded-xl px-4 py-2.5 text-xs font-medium border ${
                    saveStatus.type === 'success'
                      ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                      : 'bg-red-500/10 border-red-500/20 text-red-400'
                  }`}>
                    {saveStatus.message}
                  </div>
                )}

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={isSaving || (!tmdbInput.trim() && !geminiInput.trim())}
                    className="inline-flex items-center gap-2 rounded-xl bg-primary-600 hover:bg-primary-500 active:scale-95 px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-primary-900/30 transition-all disabled:opacity-50 disabled:active:scale-100 cursor-pointer"
                  >
                    {isSaving && <RefreshCw className="h-4 w-4 animate-spin" />}
                    <span>Save & Validate Keys</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Metadata */}
            <div className="glass rounded-2xl p-6">
              <h3 className="mb-4 text-lg font-semibold text-white">System Info</h3>
              <div className="grid gap-4 sm:grid-cols-3">
                <MetadataItem icon={Clock} label="Uptime" value={data.uptime || 'unknown'} />
                <MetadataItem icon={Tag} label="Version" value={`v${data.version}`} />
                <MetadataItem
                  icon={Clock}
                  label="Timestamp"
                  value={new Date(data.timestamp).toLocaleTimeString()}
                />
              </div>
            </div>

            {/* Raw JSON */}
            <div className="glass rounded-2xl p-6">
              <h3 className="mb-4 text-lg font-semibold text-white">Raw Response</h3>
              <pre className="overflow-x-auto rounded-xl bg-surface-900 p-4 text-sm text-slate-300">
                {JSON.stringify(data, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}

function ServiceCard({
  icon: Icon,
  label,
  status,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  status: 'connected' | 'disconnected';
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-surface-800/50 p-4">
      <Icon className="h-5 w-5 text-slate-400" />
      <div className="flex-1">
        <p className="text-sm font-medium text-white">{label}</p>
      </div>
      <StatusBadge status={status} />
    </div>
  );
}

function MetadataItem({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <Icon className="h-4 w-4 text-slate-500" />
      <div>
        <p className="text-xs text-slate-500">{label}</p>
        <p className="text-sm font-medium text-slate-200">{value}</p>
      </div>
    </div>
  );
}
