import React from 'react';
import { Sparkles } from 'lucide-react';

export interface RecommendationRegenerationProps {
  onRegenerate: (modifier: string) => void;
}

export const REGENERATION_MODIFIERS = [
  { label: 'Recommend Again', modifier: 'Recommend again with fresh perspective', icon: '🔄' },
  { label: 'More Emotional', modifier: 'Give me movies that are more emotional and poignant', icon: '🥺' },
  { label: 'More Funny', modifier: 'Show me movies that are hilarious and lighter in tone', icon: '😂' },
  { label: 'More Hopeful', modifier: 'Suggest movies with an optimistic, inspiring ending', icon: '🌟' },
  { label: 'More Mind-Bending', modifier: 'Give me intense mind-bending plot twists', icon: '🌀' },
  { label: 'More Underrated', modifier: 'Find hidden gem underrated masterpieces', icon: '💎' },
  { label: 'Different Genre', modifier: 'Switch to a completely different genre', icon: '🔀' },
  { label: 'Different Language', modifier: 'Recommend international cinema from another language', icon: '🌍' },
  { label: 'Shorter Movies', modifier: 'Find movies with a shorter runtime under 90 minutes', icon: '⚡' },
  { label: 'Longer Movies', modifier: 'Find epic deep cinematic movies over 140 minutes', icon: '🎬' },
];

export const RecommendationRegeneration: React.FC<RecommendationRegenerationProps> = ({ onRegenerate }) => {
  return (
    <div className="border-t border-surface-700/80 pt-3">
      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 mb-2">
        <Sparkles className="h-3.5 w-3.5 text-amber-400" />
        <span>Refine Recommendations:</span>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {REGENERATION_MODIFIERS.map((item) => (
          <button
            key={item.label}
            onClick={() => onRegenerate(item.modifier)}
            className="flex items-center gap-1 rounded-xl border border-surface-700 bg-surface-800/60 px-2.5 py-1 text-[11px] font-medium text-slate-300 transition-all hover:border-primary-500/50 hover:bg-primary-500/10 hover:text-white"
          >
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
