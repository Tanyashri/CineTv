import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Send, AlertCircle, X, RotateCcw } from 'lucide-react';
import { frontendVoiceService, type VoiceState } from '../services/voice.service';
import type { RecommendationModeId } from '../contexts/theme.context';
import { BorderGlow } from './ui';

export interface AIInputAreaProps {
  onSubmitPrompt: (promptText: string) => void;
  isLoading?: boolean;
}

export const MODE_OPTIONS: Array<{ id: RecommendationModeId; label: string; icon: string }> = [
  { id: 'all', label: 'All Modes', icon: '✨' },
  { id: 'comfort', label: 'Comfort', icon: '☕' },
  { id: 'feel-good', label: 'Feel Good', icon: '🌱' },
  { id: 'hidden-gems', label: 'Hidden Gems', icon: '💎' },
  { id: 'mind-bending', label: 'Mind-Bending', icon: '🌀' },
  { id: 'date-night', label: 'Date Night', icon: '🌹' },
  { id: 'family-night', label: 'Family Night', icon: '🍿' },
  { id: 'weekend-marathon', label: 'Weekend Marathon', icon: '🚀' },
  { id: 'award-winners', label: 'Award Winners', icon: '🏆' },
  { id: 'international', label: 'International', icon: '🌏' },
  { id: 'anime', label: 'Anime', icon: '🎨' },
  { id: 'documentary', label: 'Documentary', icon: '📹' },
  { id: 'classic-cinema', label: 'Classic Cinema', icon: '🎞️' },
];

const QUICK_PROMPTS = [
  { label: 'Stressed & Comforting', prompt: "I'm stressed out and need a soothing, comforting movie to relax." },
  { label: 'Feel Good', prompt: 'Give me a wholesome, uplifting feel-good movie that leaves me smiling.' },
  { label: 'Mind-Bending', prompt: 'I want a mind-bending sci-fi thriller with unpredictable plot twists.' },
  { label: 'Hidden Gems', prompt: 'Find underrated hidden gem movies that deserve far more recognition.' },
  { label: 'Comedy', prompt: 'I want a hilarious comedy movie to cheer me up.' },
];

export const AIInputArea: React.FC<AIInputAreaProps> = ({ onSubmitPrompt, isLoading = false }) => {
  const [prompt, setPrompt] = useState('');
  const [voiceState, setVoiceState] = useState<VoiceState>('idle');
  const [voiceInterim, setVoiceInterim] = useState('');
  const [voiceErrorMessage, setVoiceErrorMessage] = useState<string | null>(null);

  const isRecording = voiceState === 'listening';
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    return () => {
      frontendVoiceService.stopListening();
    };
  }, []);

  const handleSend = () => {
    const finalQuery = prompt.trim() || voiceInterim.trim();
    if (!finalQuery || isLoading) return;

    if (isRecording) {
      frontendVoiceService.stopListening();
      setVoiceState('idle');
    }

    onSubmitPrompt(finalQuery);
    setPrompt('');
    setVoiceInterim('');
    setVoiceErrorMessage(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const toggleVoice = () => {
    setVoiceErrorMessage(null);

    if (isRecording) {
      frontendVoiceService.stopListening();
      setVoiceState('idle');
      return;
    }

    if (!frontendVoiceService.isSupported()) {
      setVoiceErrorMessage("Voice input isn't supported in this browser. Please use Chrome, Edge, or Safari.");
      setVoiceState('error');
      return;
    }

    setVoiceState('listening');
    setVoiceInterim('');

    frontendVoiceService.startListening(
      (text, _isFinal) => {
        setPrompt(text);
        setVoiceInterim(text);
      },
      (errorMessage) => {
        setVoiceErrorMessage(errorMessage);
        setVoiceState('error');
        setVoiceInterim('');
      },
      () => {
        setVoiceInterim('');
        setVoiceState('idle');
      },
    );
  };

  return (
    <div className="w-full max-w-[850px] mx-auto flex flex-col items-center gap-4 sm:gap-5">
      {/* Voice Error Alert Banner */}
      {voiceErrorMessage && (
        <div className="w-full flex items-center justify-between rounded-xl border border-red-500/30 bg-red-950/30 px-4 py-2.5 text-xs text-red-300 backdrop-blur-md mb-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-red-400 shrink-0" />
            <span>{voiceErrorMessage}</span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={toggleVoice}
              className="flex items-center gap-1 rounded bg-red-500/20 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-red-500 transition-colors cursor-pointer"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Try Again</span>
            </button>
            <button
              onClick={() => setVoiceErrorMessage(null)}
              className="text-red-400 hover:text-white p-0.5 cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* ─── Centered Transparent Glassmorphic AI Prompt Card ─── */}
      <div className="prompt-glass-bubble relative w-full min-h-[124px] rounded-2xl overflow-hidden shadow-2xl flex flex-col justify-between border border-[var(--border)] mt-0">
        <textarea
          ref={textareaRef}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            isRecording
              ? voiceInterim || '🔴 Listening... Speak your prompt into the microphone'
              : 'Tell me what you feel like watching...'
          }
          className="w-full flex-1 min-h-[72px] resize-none bg-transparent text-sm sm:text-[15px] text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none leading-6"
          style={{ padding: '18px 20px 12px 20px' }}
        />

        {/* Live Speech Overlay */}
        {isRecording && (
          <div className="absolute inset-x-0 bottom-[52px] flex items-center justify-between px-5 py-2 bg-[var(--surface-card)]/90 border-t border-b border-primary-500/40 z-10 backdrop-blur-md">
            <div className="flex items-center gap-2 text-xs font-semibold text-primary-400">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary-400 opacity-75"></span>
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-primary-500"></span>
              </span>
              <span className="truncate max-w-md">
                {voiceInterim ? `"${voiceInterim}"` : 'Listening... Speak prompt now'}
              </span>
            </div>

            <button
              onClick={toggleVoice}
              className="text-[10px] font-bold text-slate-300 hover:text-white bg-[var(--surface-elevated)] px-2.5 py-1 rounded border border-[var(--border)] shrink-0 ml-2 cursor-pointer"
            >
              Stop Mic
            </button>
          </div>
        )}

        {/* Bottom Actions Row: Voice & Ask AI */}
        <div className="flex items-center justify-between border-t border-[var(--border)] px-3 py-2 h-[52px] shrink-0 bg-black/10">
          {/* Voice Button */}
          <button
            onClick={toggleVoice}
            type="button"
            title={isRecording ? 'Stop Listening' : 'Speak Prompt'}
            className={`flex items-center gap-2 rounded-lg border border-[var(--border)] px-3.5 h-8.5 text-xs font-bold transition-all cursor-pointer flex items-center justify-center ${
              isRecording
                ? 'bg-primary-500 text-white shadow-md animate-pulse border-primary-400'
                : 'bg-[var(--surface-card)]/65 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-primary-500/40'
            }`}
          >
            {isRecording ? <MicOff className="h-4 w-4 text-white" /> : <Mic className="h-4 w-4 text-primary-500" />}
            <span>{isRecording ? 'Listening...' : 'Voice'}</span>
          </button>

          {/* Ask AI Submit Button */}
          <button
            onClick={handleSend}
            type="button"
            disabled={isLoading || (!prompt.trim() && !voiceInterim.trim())}
            className="btn-primary rounded-lg px-5 h-9 text-xs font-bold shadow-lg shadow-primary-500/25 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-1.5"
          >
            <span>{isLoading ? 'Finding recommendations...' : 'Ask AI'}</span>
            {!isLoading && <Send className="h-3.5 w-3.5 ml-1.5" />}
          </button>
        </div>
      </div>

      {/* ─── Centered Transparent Glass Quick Prompt Chips ─── */}
      <div className="flex flex-wrap items-center justify-center gap-2 w-full max-w-[760px] px-1">
        {QUICK_PROMPTS.map((chip) => (
          <BorderGlow
            key={chip.label}
            borderRadius={12}
            glowColor="357 92 47"
            glowRadius={16}
            glowIntensity={0.55}
            edgeSensitivity={20}
            backgroundColor="rgba(24, 24, 27, 0.6)"
            colors={['#ef4444', '#b91c1c', '#f87171']}
            className="flex items-center justify-center rounded-lg"
          >
            <button
              onClick={() => {
                setPrompt(chip.prompt);
                onSubmitPrompt(chip.prompt);
              }}
              className="px-3 h-8.5 text-[11px] sm:text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] outline-none cursor-pointer flex items-center justify-center whitespace-nowrap leading-normal bg-transparent border-0 rounded-none w-full"
            >
              {chip.label}
            </button>
          </BorderGlow>
        ))}
      </div>
    </div>
  );
};
