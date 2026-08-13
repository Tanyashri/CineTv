import React, { createContext, useContext, useState, useEffect } from 'react';
import type { RecommendationCandidate } from '../services/recommendation.service';
import type { RejectedCandidate } from '../utils/recommendation-validator';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  candidates?: RecommendationCandidate[];
  rejectedCandidates?: RejectedCandidate[];
  detectedEmotion?: string;
  predictedOutcome?: string;
  mode?: string;
  isStreaming?: boolean;
}

export interface UserPreferences {
  preferredLanguage: string;
  defaultMode: string;
  maxRuntime: number;
  minRating: number;
  hideWatched: boolean;
  preferredRegion?: string;
}

export interface RecommendationContextType {
  messages: ChatMessage[];
  addMessage: (msg: Omit<ChatMessage, 'id' | 'timestamp'>) => string;
  updateMessage: (id: string, updates: Partial<ChatMessage>) => void;
  clearMessages: () => void;

  // Preferences & Filters
  activeTriggers: string[];
  toggleTrigger: (triggerName: string) => void;
  setTriggers: (triggers: string[]) => void;
  userPreferences: UserPreferences;
  updatePreferences: (prefs: Partial<UserPreferences>) => void;

  // Feedback State Lists
  favorites: number[];
  disliked: number[];
  watched: number[];
  watchLater: number[];
  toggleFavorite: (movieId: number) => void;
  toggleDisliked: (movieId: number) => void;
  toggleWatched: (movieId: number) => void;
  toggleWatchLater: (movieId: number) => void;

  // Modals & UI Controls
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;
  isSettingsOpen: boolean;
  setIsSettingsOpen: (open: boolean) => void;
  isTriggerPanelOpen: boolean;
  setIsTriggerPanelOpen: (open: boolean) => void;
  activeTrailerUrl: string | null;
  setActiveTrailerUrl: (url: string | null) => void;
  trailerVideoKeys: string[];
  setTrailerVideoKeys: (keys: string[]) => void;
  trailerMovieTitle: string;
  setTrailerMovieTitle: (title: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isTherapistMode: boolean;
  setIsTherapistMode: (active: boolean) => void;
}

const RecommendationContext = createContext<RecommendationContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY_FAVS = 'cinetv_favorites';
const LOCAL_STORAGE_KEY_DISLIKED = 'cinetv_disliked';
const LOCAL_STORAGE_KEY_WATCHED = 'cinetv_watched';
const LOCAL_STORAGE_KEY_LATER = 'cinetv_watch_later';
const LOCAL_STORAGE_KEY_TRIGGERS = 'cinetv_active_triggers';
const LOCAL_STORAGE_KEY_PREFS = 'cinetv_user_prefs';

export const RecommendationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'welcome-msg',
      sender: 'ai',
      text: 'Hello! I am your AI Cinema Companion. Tell me how you feel, what you\'re in the mood for, or select a Recommendation Mode below to begin.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [favorites, setFavorites] = useState<number[]>(() => {
    try { return JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY_FAVS) || '[]'); } catch { return []; }
  });

  const [disliked, setDisliked] = useState<number[]>(() => {
    try { return JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY_DISLIKED) || '[]'); } catch { return []; }
  });

  const [watched, setWatched] = useState<number[]>(() => {
    try { return JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY_WATCHED) || '[]'); } catch { return []; }
  });

  const [watchLater, setWatchLater] = useState<number[]>(() => {
    try { return JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY_LATER) || '[]'); } catch { return []; }
  });

  const [activeTriggers, setActiveTriggersState] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY_TRIGGERS) || '[]'); } catch { return []; }
  });

  const [userPreferences, setUserPreferences] = useState<UserPreferences>(() => {
    try {
      const parsed = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY_PREFS) || 'null');
      return {
        preferredLanguage: 'en',
        defaultMode: 'all',
        maxRuntime: 180,
        minRating: 0,
        hideWatched: false,
        preferredRegion: 'IN',
        ...parsed,
      };
    } catch {
      return {
        preferredLanguage: 'en',
        defaultMode: 'all',
        maxRuntime: 180,
        minRating: 0,
        hideWatched: false,
        preferredRegion: 'IN',
      };
    }
  });

  // Modal & UI overlay states
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isTriggerPanelOpen, setIsTriggerPanelOpen] = useState(false);
  const [activeTrailerUrl, setActiveTrailerUrl] = useState<string | null>(null);
  const [trailerVideoKeys, setTrailerVideoKeys] = useState<string[]>([]);
  const [trailerMovieTitle, setTrailerMovieTitle] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isTherapistMode, setIsTherapistMode] = useState(false);

  // Sync state to localStorage
  useEffect(() => { localStorage.setItem(LOCAL_STORAGE_KEY_FAVS, JSON.stringify(favorites)); }, [favorites]);
  useEffect(() => { localStorage.setItem(LOCAL_STORAGE_KEY_DISLIKED, JSON.stringify(disliked)); }, [disliked]);
  useEffect(() => { localStorage.setItem(LOCAL_STORAGE_KEY_WATCHED, JSON.stringify(watched)); }, [watched]);
  useEffect(() => { localStorage.setItem(LOCAL_STORAGE_KEY_LATER, JSON.stringify(watchLater)); }, [watchLater]);
  useEffect(() => { localStorage.setItem(LOCAL_STORAGE_KEY_TRIGGERS, JSON.stringify(activeTriggers)); }, [activeTriggers]);
  useEffect(() => { localStorage.setItem(LOCAL_STORAGE_KEY_PREFS, JSON.stringify(userPreferences)); }, [userPreferences]);

  const addMessage = (msg: Omit<ChatMessage, 'id' | 'timestamp'>): string => {
    const id = `msg-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newMessage: ChatMessage = { ...msg, id, timestamp };
    setMessages((prev) => [...prev, newMessage]);
    return id;
  };

  const updateMessage = (id: string, updates: Partial<ChatMessage>) => {
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, ...updates } : m)));
  };

  const clearMessages = () => {
    setMessages([]);
  };

  const toggleTrigger = (triggerName: string) => {
    setActiveTriggersState((prev) =>
      prev.includes(triggerName) ? prev.filter((t) => t !== triggerName) : [...prev, triggerName],
    );
  };

  const setTriggers = (triggers: string[]) => {
    setActiveTriggersState(triggers);
  };

  const updatePreferences = (prefs: Partial<UserPreferences>) => {
    setUserPreferences((prev) => ({ ...prev, ...prefs }));
  };

  const toggleFavorite = (movieId: number) => {
    setFavorites((prev) => (prev.includes(movieId) ? prev.filter((id) => id !== movieId) : [...prev, movieId]));
  };

  const toggleDisliked = (movieId: number) => {
    setDisliked((prev) => (prev.includes(movieId) ? prev.filter((id) => id !== movieId) : [...prev, movieId]));
  };

  const toggleWatched = (movieId: number) => {
    setWatched((prev) => (prev.includes(movieId) ? prev.filter((id) => id !== movieId) : [...prev, movieId]));
  };

  const toggleWatchLater = (movieId: number) => {
    setWatchLater((prev) => (prev.includes(movieId) ? prev.filter((id) => id !== movieId) : [...prev, movieId]));
  };

  return (
    <RecommendationContext.Provider
      value={{
        messages,
        addMessage,
        updateMessage,
        clearMessages,
        activeTriggers,
        toggleTrigger,
        setTriggers,
        userPreferences,
        updatePreferences,
        favorites,
        disliked,
        watched,
        watchLater,
        toggleFavorite,
        toggleDisliked,
        toggleWatched,
        toggleWatchLater,
        isSearchOpen,
        setIsSearchOpen,
        isSettingsOpen,
        setIsSettingsOpen,
        isTriggerPanelOpen,
        setIsTriggerPanelOpen,
        activeTrailerUrl,
        setActiveTrailerUrl,
        trailerVideoKeys,
        setTrailerVideoKeys,
        trailerMovieTitle,
        setTrailerMovieTitle,
        searchQuery,
        setSearchQuery,
        isTherapistMode,
        setIsTherapistMode,
      }}
    >
      {children}
    </RecommendationContext.Provider>
  );
};

export function useRecommendation() {
  const context = useContext(RecommendationContext);
  if (!context) {
    throw new Error('useRecommendation must be used within a RecommendationProvider');
  }
  return context;
}
