import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, User, Sparkles, Trash2 } from 'lucide-react';
import { useRecommendation } from '../contexts/recommendation.context';
import { RichRecommendationCard } from './RichRecommendationCard';
import { WhyNotRecommended } from './WhyNotRecommended';

export interface AIChatSectionProps {
  onRegenerateFromCard?: (modifier: string) => void;
}

export const AIChatSection: React.FC<AIChatSectionProps> = ({ onRegenerateFromCard }) => {
  const { messages, clearMessages } = useRecommendation();
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex flex-col space-y-6">
      {/* Header Bar */}
      <div className="flex items-center justify-between border-b border-surface-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary-600/20 border border-primary-500/30 text-primary-400">
            <Bot className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">AI Conversation Session</h3>
          </div>
        </div>

        {messages.length > 1 && (
          <button
            onClick={clearMessages}
            className="flex items-center gap-1 text-xs text-slate-400 hover:text-red-400 transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Clear History</span>
          </button>
        )}
      </div>

      {/* Messages Feed */}
      <div className="space-y-6">
        <AnimatePresence initial={false}>
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';
            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-surface-800 border border-surface-700 text-primary-400">
                    <Bot className="h-4 w-4" />
                  </div>
                )}

                <div className={`w-full space-y-3 ${isUser ? 'items-end text-right' : 'items-start text-left'} ${msg.candidates && msg.candidates.length > 0 ? 'max-w-6xl' : 'max-w-2xl'}`}>
                  {/* Timestamp */}
                  <div className="flex items-center gap-2 text-[11px] text-slate-400">
                    <span className="font-semibold text-slate-300">{isUser ? 'You' : 'CineVerse AI'}</span>
                    <span>•</span>
                    <span>{msg.timestamp}</span>
                  </div>

                  {/* Message Bubble */}
                  <div
                    className={`rounded-2xl px-4 py-3 text-xs sm:text-sm leading-relaxed ${
                      isUser
                        ? 'bg-primary-600 text-white shadow-md'
                        : 'glass border border-surface-700/70 text-slate-200 shadow-md'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.text}</p>

                    {/* Streaming Typing Dots Indicator */}
                    {msg.isStreaming && (
                      <div className="mt-2 flex items-center gap-1.5 text-primary-400">
                        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary-400"></span>
                        <span
                          className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary-400"
                          style={{ animationDelay: '0.2s' }}
                        ></span>
                        <span
                          className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary-400"
                          style={{ animationDelay: '0.4s' }}
                        ></span>
                        <span className="ml-1 text-[11px] text-slate-400">Analyzing cinema database...</span>
                      </div>
                    )}
                  </div>

                  {/* Render Recommendation Cards attached to AI message */}
                  {msg.candidates && msg.candidates.length > 0 && (
                    <div className="space-y-4 pt-2">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
                        <Sparkles className="h-3.5 w-3.5" />
                        <span>Recommended Candidates ({msg.candidates.length}):</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 w-full">
                        {msg.candidates.map((candidate, idx) => (
                          <RichRecommendationCard
                            key={`${msg.id}-cand-${candidate.movie.id || idx}`}
                            candidate={candidate}
                            onRegenerate={onRegenerateFromCard}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Why Not Recommended Drawer */}
                  {msg.rejectedCandidates && msg.rejectedCandidates.length > 0 && (
                    <WhyNotRecommended rejected={msg.rejectedCandidates} />
                  )}
                </div>

                {isUser && (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-surface-800 border border-surface-700 text-slate-300 font-bold">
                    <User className="h-4 w-4" />
                  </div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
        <div ref={chatEndRef} />
      </div>
    </div>
  );
};
