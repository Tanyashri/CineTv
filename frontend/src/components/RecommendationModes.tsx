import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { useTheme } from '../contexts/theme.context';
import type { RecommendationModeId } from '../contexts/theme.context';

export interface ModeCard {
  id: RecommendationModeId;
  title: string;
  subtitle: string;
  icon: string;
  gradient: string;
  borderAccent: string;
  prompt: string;
}

export const MODES_LIST: ModeCard[] = [
  {
    id: 'comfort',
    title: 'Comfort Cinema',
    subtitle: 'Cozy, stress-free & familiar warmth',
    icon: '☕',
    gradient: '',
    borderAccent: '',
    prompt: 'I need a cozy, soothing, stress-free comfort movie.',
  },
  {
    id: 'feel-good',
    title: 'Feel Good',
    subtitle: 'Uplifting stories that bring pure joy',
    icon: '🌱',
    gradient: '',
    borderAccent: '',
    prompt: 'Give me a wholesome, uplifting feel-good movie that leaves me smiling.',
  },
  {
    id: 'hidden-gems',
    title: 'Hidden Gems',
    subtitle: 'Underrated masterpieces waiting to be found',
    icon: '💎',
    gradient: '',
    borderAccent: '',
    prompt: 'Find underrated hidden gem movies that deserve far more recognition.',
  },
  {
    id: 'mind-bending',
    title: 'Mind-Bending',
    subtitle: 'Intense twists, paradoxes & complex lore',
    icon: '🌀',
    gradient: '',
    borderAccent: '',
    prompt: 'I want a mind-bending sci-fi thriller with insane plot twists.',
  },
  {
    id: 'date-night',
    title: 'Date Night',
    subtitle: 'Romantic, captivating & charming',
    icon: '🌹',
    gradient: '',
    borderAccent: '',
    prompt: 'Recommend a charming, romantic date night movie.',
  },
  {
    id: 'family-night',
    title: 'Family Night',
    subtitle: 'Wholesome fun for all generations',
    icon: '🍿',
    gradient: '',
    borderAccent: '',
    prompt: 'Suggest a fantastic family night movie suitable for everyone.',
  },
  {
    id: 'weekend-marathon',
    title: 'Weekend Marathon',
    subtitle: 'Binge-worthy epics & rich sagas',
    icon: '🚀',
    gradient: '',
    borderAccent: '',
    prompt: 'Recommend an epic movie series ideal for a weekend marathon.',
  },
  {
    id: 'award-winners',
    title: 'Award Winners',
    subtitle: 'Oscar & Palme d’Or critically acclaimed',
    icon: '🏆',
    gradient: '',
    borderAccent: '',
    prompt: 'Recommend critically acclaimed award-winning masterpieces.',
  },
  {
    id: 'international',
    title: 'International Cinema',
    subtitle: 'Global storytelling across cultures',
    icon: '🌏',
    gradient: '',
    borderAccent: '',
    prompt: 'Show me extraordinary foreign language international movies.',
  },
  {
    id: 'anime',
    title: 'Anime & Animation',
    subtitle: 'Vibrant worlds & extraordinary art',
    icon: '🎨',
    gradient: '',
    borderAccent: '',
    prompt: 'Recommend stunning anime feature films with breathtaking animation.',
  },
  {
    id: 'documentary',
    title: 'Documentaries',
    subtitle: 'Real stories, true crime & nature',
    icon: '📹',
    gradient: '',
    borderAccent: '',
    prompt: 'Give me fascinating documentary films about real-world events.',
  },
  {
    id: 'classic-cinema',
    title: 'Classic Cinema',
    subtitle: 'Timeless vintage Golden Age movies',
    icon: '🎞️',
    gradient: '',
    borderAccent: '',
    prompt: 'Recommend classic Golden Age cinema masterpieces.',
  },
];

export interface RecommendationModesProps {
  onSelectModePrompt: (promptText: string, modeTitle?: string) => void;
}

export const RecommendationModes: React.FC<RecommendationModesProps> = ({ onSelectModePrompt }) => {
  const { activeMode, setActiveMode } = useTheme();

  const handleModeClick = (mode: ModeCard) => {
    setActiveMode(mode.id);
    onSelectModePrompt(mode.prompt, mode.title);
  };

  return (
    <div className="space-y-4 py-4 w-full">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[var(--text-primary)] flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-amber-500" />
            <span>Recommendation Modes</span>
          </h2>
          <p className="text-xs text-[var(--text-secondary)]">Select an AI posture to dynamically transform your recommendations</p>
        </div>
      </div>

      <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 w-full">
        {MODES_LIST.map((mode) => {
          const isSelected = activeMode === mode.id;
          return (
            <motion.button
              key={mode.id}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => handleModeClick(mode)}
              className={`group relative overflow-hidden rounded-2xl border p-4 text-left transition-all cursor-pointer ${
                isSelected
                  ? 'border-primary-500 bg-primary-500/10 shadow-lg ring-1 ring-primary-500 text-[var(--text-primary)]'
                  : 'border-[var(--border)] bg-[var(--surface-card)] hover:bg-[var(--surface-elevated)] hover:border-primary-500/40 text-[var(--text-secondary)]'
              }`}
            >
              <div className="flex items-start justify-between">
                <span className="text-3xl">{mode.icon}</span>
                {isSelected && (
                  <span className="rounded-full bg-primary-500 px-2 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider">
                    Active
                  </span>
                )}
              </div>
              <div className="mt-3">
                <h3 className="text-sm font-bold text-[var(--text-primary)] group-hover:text-primary-500 transition-colors">
                  {mode.title}
                </h3>
                <p className="mt-0.5 text-xs text-[var(--text-secondary)] leading-snug">{mode.subtitle}</p>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};
