import React from 'react';
import { motion } from 'framer-motion';
import { Gem, Award, Globe, Sparkles, Star } from 'lucide-react';

export interface HiddenGemsSectionProps {
  onSelectPrompt?: (prompt: string) => void;
}

export const GEMS_CATEGORIES = [
  {
    title: 'Underrated Masterpieces',
    badge: 'Under-the-Radar',
    description: 'Phenomenal cinema with fewer than 50k views that blew critics away.',
    icon: Gem,
    color: 'text-teal-400',
    border: 'border-teal-500/30',
    prompt: 'Find underrated masterpiece movies that received critical acclaim but were overlooked by mainstream audiences.',
  },
  {
    title: 'Critically Acclaimed',
    badge: '95%+ Rotten Tomatoes',
    description: 'High-art films praised by world-class film historians & reviewers.',
    icon: Star,
    color: 'text-amber-400',
    border: 'border-amber-500/30',
    prompt: 'Show me critically acclaimed arthouse and indie movies with near perfect reviews.',
  },
  {
    title: 'Award Winners',
    badge: 'Palme d’Or & Oscars',
    description: 'Winners of international film festivals from Cannes to Venice.',
    icon: Award,
    color: 'text-yellow-400',
    border: 'border-yellow-500/30',
    prompt: 'Recommend award-winning film festival winners from Cannes, Sundance, or Venice.',
  },
  {
    title: 'International Hidden Gems',
    badge: 'Global Cinema',
    description: 'Captivating stories from Korea, Japan, France, Iran, and Brazil.',
    icon: Globe,
    color: 'text-cyan-400',
    border: 'border-cyan-500/30',
    prompt: 'Find international foreign language hidden gem movies with captivating storytelling.',
  },
];

export const HiddenGemsSection: React.FC<HiddenGemsSectionProps> = ({ onSelectPrompt }) => {
  return (
    <div className="space-y-4 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <Gem className="h-5 w-5 text-teal-400" />
            <span>Hidden Gems Vault</span>
          </h2>
          <p className="text-xs text-slate-400">Discover under-the-radar cinematic treasures curated by AI</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {GEMS_CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          return (
            <motion.button
              key={cat.title}
              whileHover={{ y: -4 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSelectPrompt && onSelectPrompt(cat.prompt)}
              className={`glass group rounded-2xl border ${cat.border} p-5 text-left transition-all hover:border-teal-400 hover:shadow-lg hover:shadow-teal-500/10`}
            >
              <div className="flex items-center justify-between">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-surface-800 border border-surface-700 ${cat.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <span className="rounded-full bg-surface-800 px-2.5 py-1 text-[10px] font-semibold text-slate-300 border border-surface-700">
                  {cat.badge}
                </span>
              </div>

              <h3 className="mt-4 text-base font-bold text-white group-hover:text-teal-300 transition-colors">
                {cat.title}
              </h3>
              <p className="mt-1 text-xs text-slate-400 leading-relaxed">{cat.description}</p>

              <div className="mt-4 flex items-center gap-1 text-xs font-bold text-teal-400 group-hover:underline">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Explore Selection</span>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};
