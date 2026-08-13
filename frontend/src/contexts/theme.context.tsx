import React, { createContext, useContext, useEffect, useState } from 'react';

export type RecommendationModeId =
  | 'all'
  | 'comfort'
  | 'feel-good'
  | 'hidden-gems'
  | 'mind-bending'
  | 'date-night'
  | 'family-night'
  | 'weekend-marathon'
  | 'award-winners'
  | 'international'
  | 'anime'
  | 'documentary'
  | 'classic-cinema';

export type ThemePreference = 'dark' | 'light' | 'system';
export type ActiveTheme = 'dark' | 'light';

export interface ThemeContextType {
  themePreference: ThemePreference;
  setThemePreference: (pref: ThemePreference) => void;
  themeMode: ActiveTheme;
  toggleThemeMode: () => void;
  activeMode: RecommendationModeId;
  setActiveMode: (mode: RecommendationModeId) => void;
  adaptiveThemeClass: string;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [themePreference, setThemePreferenceState] = useState<ThemePreference>(() => {
    return (localStorage.getItem('cinetv_theme_pref') as ThemePreference) || 'dark';
  });

  const [activeMode, setActiveModeState] = useState<RecommendationModeId>(() => {
    return (localStorage.getItem('cinetv_active_mode') as RecommendationModeId) || 'all';
  });

  const [effectiveTheme, setEffectiveTheme] = useState<ActiveTheme>('dark');

  useEffect(() => {
    localStorage.setItem('cinetv_theme_pref', themePreference);

    const updateResolvedTheme = () => {
      let resolvedTheme: ActiveTheme = 'dark';
      if (themePreference === 'system') {
        const isSystemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        resolvedTheme = isSystemDark ? 'dark' : 'light';
      } else {
        resolvedTheme = themePreference;
      }

      setEffectiveTheme(resolvedTheme);
      document.documentElement.classList.remove('dark', 'light');
      document.documentElement.classList.add(resolvedTheme);
    };

    updateResolvedTheme();

    if (themePreference === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const listener = () => updateResolvedTheme();
      mediaQuery.addEventListener('change', listener);
      return () => mediaQuery.removeEventListener('change', listener);
    }
  }, [themePreference]);

  const setThemePreference = (pref: ThemePreference) => {
    setThemePreferenceState(pref);
  };

  const toggleThemeMode = () => {
    setThemePreferenceState((prev) => {
      if (prev === 'dark') return 'light';
      if (prev === 'light') return 'system';
      return 'dark';
    });
  };

  const setActiveMode = (mode: RecommendationModeId) => {
    setActiveModeState(mode);
    localStorage.setItem('cinetv_active_mode', mode);
  };

  return (
    <ThemeContext.Provider
      value={{
        themePreference,
        setThemePreference,
        themeMode: effectiveTheme,
        toggleThemeMode,
        activeMode,
        setActiveMode,
        adaptiveThemeClass: effectiveTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
