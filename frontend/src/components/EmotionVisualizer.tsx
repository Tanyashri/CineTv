import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, HeartPulse, Zap } from 'lucide-react';

export interface EmotionVisualizerProps {
  detectedEmotion?: string;
  predictedOutcome?: string;
  intensityScore?: number; // 0 to 100
}

export const EmotionVisualizer: React.FC<EmotionVisualizerProps> = ({
  detectedEmotion = 'Curious & Reflective',
  predictedOutcome = 'Intriguing & Deeply Satisfying',
  intensityScore = 85,
}) => {
  return (
    <div className="rounded-2xl border border-primary-500/20 bg-gradient-to-r from-surface-800/80 via-primary-950/40 to-surface-800/80 p-4 shadow-lg">
      <div className="flex items-center justify-between pb-3">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary-400">
          <Sparkles className="h-3.5 w-3.5" />
          <span>AI Emotion Transformation Engine</span>
        </div>
        <div className="flex items-center gap-1 rounded-full bg-primary-500/10 px-2.5 py-0.5 text-[11px] font-medium text-primary-300">
          <Zap className="h-3 w-3 text-amber-400" />
          <span>{intensityScore}% Vibe Alignment</span>
        </div>
      </div>

      <div className="grid items-center gap-4 sm:grid-cols-7 py-1">
        {/* Current Emotion */}
        <div className="sm:col-span-3 rounded-xl border border-surface-700 bg-surface-900/70 p-3">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <HeartPulse className="h-3.5 w-3.5 text-rose-400" />
            <span>Detected Emotion</span>
          </div>
          <p className="mt-1 text-sm font-bold text-white tracking-tight">{detectedEmotion}</p>
        </div>

        {/* Arrow Shift */}
        <div className="sm:col-span-1 flex justify-center py-1 sm:py-0">
          <motion.div
            animate={{ x: [0, 4, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-500/20 text-primary-400 shadow-md shadow-primary-500/10"
          >
            <ArrowRight className="h-4 w-4" />
          </motion.div>
        </div>

        {/* Predicted Emotional Outcome */}
        <div className="sm:col-span-3 rounded-xl border border-primary-500/30 bg-primary-500/10 p-3">
          <div className="flex items-center gap-2 text-xs text-primary-300">
            <Sparkles className="h-3.5 w-3.5 text-amber-400" />
            <span>Predicted Outcome</span>
          </div>
          <p className="mt-1 text-sm font-bold text-amber-300 tracking-tight">{predictedOutcome}</p>
        </div>
      </div>

      {/* Intensity Progress Bar */}
      <div className="mt-3">
        <div className="mb-1 flex items-center justify-between text-[11px]">
          <span className="text-slate-400">Emotional Resonance & Catharsis Intensity</span>
          <span className="font-semibold text-primary-300">{intensityScore}/100</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-surface-700">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${intensityScore}%` }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
            className="h-full rounded-full bg-gradient-to-r from-primary-500 via-accent-500 to-emerald-400"
          />
        </div>
      </div>
    </div>
  );
};
