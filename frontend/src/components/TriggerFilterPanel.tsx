import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, Check, X, Info } from 'lucide-react';
import { useRecommendation } from '../contexts/recommendation.context';

export interface TriggerCategory {
  id: string;
  label: string;
  description: string;
  icon: string;
}

export const TRIGGER_CATEGORIES: TriggerCategory[] = [
  { id: 'jump-scares', label: 'Jump Scares', description: 'Sudden unexpected frightening scenes or loud bursts', icon: '👻' },
  { id: 'graphic-violence', label: 'Graphic Violence', description: 'Explicit physical harm, fighting, or bloodshed', icon: '⚔️' },
  { id: 'gore', label: 'Gore & Body Horror', description: 'Severe visceral injuries or disfigurement', icon: '🩸' },
  { id: 'psychological-trauma', label: 'Psychological Trauma', description: 'Heavy intense mental distress or gaslighting', icon: '🧠' },
  { id: 'substance-abuse', label: 'Substance Abuse', description: 'Heavy drug, addiction, or alcohol use depiction', icon: '💊' },
  { id: 'grief-loss', label: 'Grief & Bereavement', description: 'Focus on death of loved ones or severe mourning', icon: '🕯️' },
  { id: 'sexual-content', label: 'Explicit Sexual Content', description: 'Mature erotic scenes or nudity', icon: '🔞' },
  { id: 'claustrophobia', label: 'Claustrophobia / Entrapment', description: 'Trapped in confined or suffocation hazards', icon: '📦' },
  { id: 'animal-harm', label: 'Animal Harm', description: 'Injury, mistreatment, or distress to animals', icon: '🐾' },
];

export const TriggerFilterPanel: React.FC = () => {
  const { isTriggerPanelOpen, setIsTriggerPanelOpen, activeTriggers, toggleTrigger, setTriggers } = useRecommendation();

  if (!isTriggerPanelOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="glass max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-primary-500/30 p-6 shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-surface-700 pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400">
                <ShieldAlert className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Sensitive Content & Trigger Filters</h3>
                <p className="text-xs text-slate-400">Select topics you wish to filter from AI recommendations</p>
              </div>
            </div>
            <button
              onClick={() => setIsTriggerPanelOpen(false)}
              className="rounded-lg p-2 text-slate-400 hover:bg-surface-700 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Alert Info Banner */}
          <div className="my-4 flex items-start gap-3 rounded-xl border border-amber-500/20 bg-amber-500/10 p-3 text-xs text-amber-200">
            <Info className="h-4 w-4 shrink-0 text-amber-400 mt-0.5" />
            <span>
              Enabled triggers will automatically filter out matching movies and place them into the <strong>Why Not Recommended</strong> diagnostic panel.
            </span>
          </div>

          {/* Trigger List */}
          <div className="grid gap-3 sm:grid-cols-2 py-2">
            {TRIGGER_CATEGORIES.map((cat) => {
              const isSelected = activeTriggers.includes(cat.id);
              return (
                <button
                  key={cat.id}
                  onClick={() => toggleTrigger(cat.id)}
                  className={`flex items-start gap-3 rounded-xl border p-3.5 text-left transition-all ${
                    isSelected
                      ? 'border-amber-500/60 bg-amber-500/15 shadow-md shadow-amber-500/10'
                      : 'border-surface-700 bg-surface-800/40 hover:border-surface-600 hover:bg-surface-800/80'
                  }`}
                >
                  <span className="text-2xl">{cat.icon}</span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className={`text-sm font-semibold ${isSelected ? 'text-amber-300' : 'text-white'}`}>
                        {cat.label}
                      </span>
                      <div
                        className={`flex h-5 w-5 items-center justify-center rounded-md border ${
                          isSelected ? 'border-amber-500 bg-amber-500 text-black' : 'border-surface-600'
                        }`}
                      >
                        {isSelected && <Check className="h-3.5 w-3.5 font-bold" />}
                      </div>
                    </div>
                    <p className="mt-1 text-xs text-slate-400 leading-snug">{cat.description}</p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Footer Controls */}
          <div className="mt-6 flex items-center justify-between border-t border-surface-700 pt-4">
            <div className="text-xs text-slate-400">
              <span className="font-semibold text-white">{activeTriggers.length}</span> categories filtered
            </div>
            <div className="flex items-center gap-3">
              {activeTriggers.length > 0 && (
                <button
                  onClick={() => setTriggers([])}
                  className="rounded-xl px-4 py-2 text-xs font-medium text-slate-400 hover:text-white hover:bg-surface-700"
                >
                  Reset All
                </button>
              )}
              <button
                onClick={() => setIsTriggerPanelOpen(false)}
                className="rounded-xl bg-gradient-to-r from-primary-600 to-primary-500 px-5 py-2 text-xs font-semibold text-white shadow-lg hover:shadow-primary-500/20"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
