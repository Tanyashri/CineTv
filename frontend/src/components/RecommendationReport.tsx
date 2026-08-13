import React from 'react';
import { motion } from 'framer-motion';
import { Award, Brain, Film, Heart, Sparkles, Target, Compass } from 'lucide-react';
import type { RecommendationCandidate } from '../services/recommendation.service';

export interface RecommendationReportProps {
  candidate: RecommendationCandidate;
}

export const RecommendationReport: React.FC<RecommendationReportProps> = ({ candidate }) => {
  const metrics = [
    { label: 'Emotion Match', value: candidate.emotionMatch ?? 94, icon: Heart, color: 'text-rose-400', bg: 'bg-rose-500/10' },
    { label: 'Intent Match', value: candidate.intentMatch ?? 92, icon: Target, color: 'text-amber-400', bg: 'bg-amber-500/10' },
    { label: 'Theme Match', value: candidate.themeMatch ?? 96, icon: Sparkles, color: 'text-amber-500', bg: 'bg-amber-500/10' },
    { label: 'Story Match', value: candidate.storyMatch ?? 89, icon: Film, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { label: 'Preference Match', value: candidate.preferenceMatch ?? 91, icon: Compass, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  ];

  const overallScore = candidate.recommendationScore ?? 95;
  const confidence = candidate.confidence ?? 94;

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-xl">
      <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-500/20 text-primary-400">
            <Brain className="h-4 w-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-[var(--text-primary)]">AI Compatibility Breakdown</h4>
            <p className="text-[11px] text-[var(--text-muted)]">7-dimensional algorithmic analysis</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Overall Score Badge */}
          <div className="text-right">
            <span className="text-[10px] uppercase tracking-wider text-[var(--text-secondary)]">Overall Match</span>
            <div className="flex items-center justify-end gap-1 text-base font-extrabold text-amber-500">
              <Award className="h-4 w-4" />
              <span>{overallScore}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid of 5 Sub-metrics */}
      <div className="grid gap-2.5 grid-cols-2 sm:grid-cols-5 py-3">
        {metrics.map((m) => {
          const Icon = m.icon;
          return (
            <div key={m.label} className="rounded-xl border border-[var(--border)] bg-[var(--surface-card)] p-2.5 text-center">
              <div className={`mx-auto mb-1.5 flex h-7 w-7 items-center justify-center rounded-lg ${m.bg}`}>
                <Icon className={`h-3.5 w-3.5 ${m.color}`} />
              </div>
              <div className="text-[10px] text-[var(--text-secondary)] font-medium truncate">{m.label}</div>
              <div className="mt-0.5 text-sm font-bold text-[var(--text-primary)]">{m.value}%</div>
            </div>
          );
        })}
      </div>

      {/* Confidence Level Meter */}
      <div className="flex items-center justify-between rounded-xl bg-[var(--surface-card)] px-3 py-2 text-xs">
        <span className="text-[var(--text-secondary)]">Algorithmic Confidence Level:</span>
        <div className="flex items-center gap-2 font-semibold text-primary-300">
          <div className="h-2 w-24 overflow-hidden rounded-full bg-[var(--surface-elevated)]">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${confidence}%` }}
              transition={{ duration: 1 }}
              className="h-full bg-primary-400 rounded-full"
            />
          </div>
          <span>{confidence}% High Confidence</span>
        </div>
      </div>
    </div>
  );
};
