import React, { useState } from 'react';
import { HeartHandshake, AlertCircle, Sparkles, Heart } from 'lucide-react';

export interface AIMovieTherapistProps {
  onTherapyPromptSubmitted?: (promptText: string) => void;
}

export const THERAPY_PRESETS = [
  { emotion: 'Stressed & Overwhelmed', text: 'I feel overwhelmed with work stress and need a gentle, peaceful, comforting movie to unwind.' },
  { emotion: 'Melancholic / Sad', text: 'I am feeling down and want a movie that either provides a good cathartic cry or offers hope.' },
  { emotion: 'Anxious / Restless', text: 'I am feeling anxious and need a soothing, slow-paced movie without loud conflict or tension.' },
  { emotion: 'Burnt Out & Uninspired', text: 'I feel burnt out and want an inspiring story about passion, creativity, and fresh beginnings.' },
  { emotion: 'Lonely / Seeking Connection', text: 'I am feeling lonely and want a heartwarming story celebrating deep friendship and human connection.' },
];

export const AIMovieTherapist: React.FC<AIMovieTherapistProps> = ({ onTherapyPromptSubmitted }) => {
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);

  const handlePreset = (preset: typeof THERAPY_PRESETS[0]) => {
    setSelectedPreset(preset.emotion);
    if (onTherapyPromptSubmitted) {
      onTherapyPromptSubmitted(preset.text);
    }
  };

  return (
    <div className="rounded-3xl border border-primary-500/25 bg-[var(--surface-card)] p-6 shadow-2xl space-y-6">
      {/* ─── Calming Header ─────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border)] pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-500/10 text-primary-500 border border-primary-500/25 shadow-lg">
            <HeartHandshake className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-2xl font-extrabold text-[var(--text-primary)]">AI Movie Therapist Lounge</h2>
            <p className="text-xs text-[var(--text-secondary)]">Emotional wellness cinema curation & catharsis companion</p>
          </div>
        </div>

        <div className="inline-flex items-center gap-2 rounded-full border border-primary-500/25 bg-primary-500/5 px-3.5 py-1 text-xs font-semibold text-[var(--text-secondary)]">
          <Sparkles className="h-3.5 w-3.5 text-amber-500" />
          <span>Calming Sanctuary Mode</span>
        </div>
      </div>

      {/* ─── MANDATORY PROMINENT DISCLAIMER ─────────────────── */}
      <div className="flex items-start gap-3 rounded-2xl border border-primary-500/25 bg-primary-500/5 p-4 text-xs text-[var(--text-secondary)]">
        <AlertCircle className="h-5 w-5 shrink-0 text-primary-500 mt-0.5" />
        <div className="space-y-1">
          <span className="font-bold text-[var(--text-primary)] block">Entertainment & Emotional Comfort Disclaimer:</span>
          <p className="leading-relaxed text-[var(--text-secondary)]">
            The AI Movie Therapist provides entertainment-based cinema suggestions tailored to your mood. This feature is <strong>not medical, psychiatric, or clinical mental health advice</strong>. If you are experiencing distress, please consult a certified healthcare professional or support service.
          </p>
        </div>
      </div>

      {/* ─── Emotion Preset Selection ──────────────────────── */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-3">
          How are you feeling right now? Select an emotional state:
        </h3>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {THERAPY_PRESETS.map((preset) => {
            const isSelected = selectedPreset === preset.emotion;
            return (
              <button
                key={preset.emotion}
                onClick={() => handlePreset(preset)}
                className={`flex flex-col justify-between rounded-xl border p-4 text-left transition-all cursor-pointer ${
                  isSelected
                    ? 'border-primary-500 bg-primary-500/10 text-[var(--text-primary)] shadow-lg shadow-primary-500/10'
                    : 'border-[var(--border)] bg-[var(--surface-card)] text-[var(--text-secondary)] hover:border-primary-500/30 hover:bg-[var(--surface-elevated)]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-[var(--text-primary)]">{preset.emotion}</span>
                  <Heart className={`h-4 w-4 ${isSelected ? 'fill-primary-500 text-primary-500' : 'text-[var(--text-muted)]'}`} />
                </div>
                <p className="mt-2 text-xs text-[var(--text-secondary)] line-clamp-2 leading-relaxed">{preset.text}</p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
