/**
 * MediSync Theme Provider
 * Provides theme context with light/dark mode switching
 * Persists theme preference to AsyncStorage
 * Supports system theme detection
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme as useSystemColorScheme } from 'react-native';

const THEME_STORAGE_KEY = '@medisync_theme_preference';

export type ThemeMode = 'light' | 'dark' | 'system';
export type ColorScheme = 'light' | 'dark';

export interface ThemeContextType {
  /** Current color scheme being used (light or dark) */
  colorScheme: ColorScheme;
  /** User's theme preference (light, dark, or system) */
  themeMode: ThemeMode;
  /** Set the theme mode */
  setThemeMode: (mode: ThemeMode) => void;
  /** Toggle between light and dark mode */
  toggleTheme: () => void;
  /** Check if theme is currently loading from storage */
  isLoading: boolean;
  /** Check if using system theme */
  isSystemTheme: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export interface ThemeProviderProps {
  children: React.ReactNode;
  /** Default theme mode if no preference is stored */
  defaultTheme?: ThemeMode;
  /** Storage key for persisting theme preference */
  storageKey?: string;
}

export function ThemeProvider({
  children,
  defaultTheme = 'system',
  storageKey = THEME_STORAGE_KEY,
}: ThemeProviderProps) {
  const systemColorScheme = useSystemColorScheme();
  const [themeMode, setThemeModeState] = useState<ThemeMode>(defaultTheme);
  const [isLoading, setIsLoading] = useState(true);

  // Determine the actual color scheme to use
  const colorScheme: ColorScheme =
    themeMode === 'system'
      ? systemColorScheme ?? 'light'
      : themeMode;

  const isSystemTheme = themeMode === 'system';

  // Load theme preference from AsyncStorage on mount
  useEffect(() => {
    loadThemePreference();
  }, []);

  // Update when system color scheme changes (only if using system theme)
  useEffect(() => {
    if (themeMode === 'system') {
      // System theme changed, no need to persist
      setIsLoading(false);
    }
  }, [systemColorScheme, themeMode]);

  /**
   * Load theme preference from AsyncStorage
   */
  const loadThemePreference = async () => {
    try {
      const storedTheme = await AsyncStorage.getItem(storageKey);
      if (storedTheme && isValidThemeMode(storedTheme)) {
        setThemeModeState(storedTheme as ThemeMode);
      } else {
        setThemeModeState(defaultTheme);
      }
    } catch (error) {
      console.error('Failed to load theme preference:', error);
      setThemeModeState(defaultTheme);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Save theme preference to AsyncStorage
   */
  const saveThemePreference = async (mode: ThemeMode) => {
    try {
      await AsyncStorage.setItem(storageKey, mode);
    } catch (error) {
      console.error('Failed to save theme preference:', error);
    }
  };

  /**
   * Set the theme mode and persist to AsyncStorage
   */
  const setThemeMode = (mode: ThemeMode) => {
    if (!isValidThemeMode(mode)) {
      console.warn(`Invalid theme mode: ${mode}`);
      return;
    }

    setThemeModeState(mode);
    saveThemePreference(mode);
  };

  /**
   * Toggle between light and dark mode
   * If currently using system theme, toggle to explicit light/dark
   */
  const toggleTheme = () => {
    if (themeMode === 'system') {
      // If using system theme, toggle to opposite of current system preference
      const newMode = systemColorScheme === 'dark' ? 'light' : 'dark';
      setThemeMode(newMode);
    } else {
      // Toggle between light and dark
      setThemeMode(themeMode === 'light' ? 'dark' : 'light');
    }
  };

  const value: ThemeContextType = {
    colorScheme,
    themeMode,
    setThemeMode,
    toggleTheme,
    isLoading,
    isSystemTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

/**
 * Hook to access theme context
 * @throws Error if used outside of ThemeProvider
 */
export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);

  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }

  return context;
}

/**
 * Type guard to check if a string is a valid theme mode
 */
function isValidThemeMode(mode: string): mode is ThemeMode {
  return mode === 'light' || mode === 'dark' || mode === 'system';
}

// Export types
export type { ThemeContextType, ThemeProviderProps };
