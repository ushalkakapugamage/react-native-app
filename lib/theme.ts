import { DarkTheme, DefaultTheme, type Theme } from '@react-navigation/native';

/**
 * MediSync Theme Configuration
 * Colors optimized for medical app: calming blue primary, coral alerts
 */
export const THEME = {
  light: {
    // Backgrounds
    background: 'hsl(0 0% 100%)', // Pure white
    foreground: 'hsl(0 0% 9.2%)', // Near black text
    card: 'hsl(0 0% 100%)',
    cardForeground: 'hsl(0 0% 9.2%)',
    popover: 'hsl(0 0% 100%)',
    popoverForeground: 'hsl(0 0% 9.2%)',

    // Primary - MediSync Blue #72A8E8
    primary: 'hsl(211 72% 68%)', // #72A8E8
    primaryForeground: 'hsl(0 0% 100%)',

    // Secondary - Coral for alerts #F8A978
    secondary: 'hsl(22 90% 72%)', // #F8A978
    secondaryForeground: 'hsl(0 0% 0%)',

    // Muted - Light gray backgrounds
    muted: 'hsl(0 0% 96.1%)',
    mutedForeground: 'hsl(0 0% 32.2%)',

    // Accent - Slightly darker than muted
    accent: 'hsl(0 0% 96.1%)',
    accentForeground: 'hsl(0 0% 9.2%)',

    // Destructive - Danger red #EF5350
    destructive: 'hsl(1 83% 63%)', // #EF5350
    destructiveForeground: 'hsl(0 0% 100%)',

    // Borders & Inputs
    border: 'hsl(0 0% 89.8%)',
    input: 'hsl(0 0% 89.8%)',
    ring: 'hsl(211 72% 68%)', // Primary color

    // Border radius
    radius: '0.75rem', // 12px

    // Status colors for charts/badges
    success: 'hsl(122 39% 49%)', // #4CAF50
    warning: 'hsl(36 100% 58%)', // #FFA726
    danger: 'hsl(1 83% 63%)', // #EF5350
    info: 'hsl(211 72% 68%)', // Primary
  },
  dark: {
    // Backgrounds - Dark mode
    background: 'hsl(0 0% 3.9%)', // Very dark gray
    foreground: 'hsl(0 0% 98%)', // Off-white text
    card: 'hsl(0 0% 9.2%)', // Slightly lighter than background
    cardForeground: 'hsl(0 0% 98%)',
    popover: 'hsl(0 0% 3.9%)',
    popoverForeground: 'hsl(0 0% 98%)',

    // Primary - MediSync Blue (slightly adjusted for dark mode)
    primary: 'hsl(211 72% 68%)', // #72A8E8
    primaryForeground: 'hsl(0 0% 100%)',

    // Secondary - Coral (slightly adjusted for dark mode)
    secondary: 'hsl(22 90% 72%)', // #F8A978
    secondaryForeground: 'hsl(0 0% 0%)',

    // Muted - Dark gray backgrounds
    muted: 'hsl(0 0% 14.9%)',
    mutedForeground: 'hsl(0 0% 63.9%)',

    // Accent
    accent: 'hsl(0 0% 14.9%)',
    accentForeground: 'hsl(0 0% 98%)',

    // Destructive
    destructive: 'hsl(1 83% 63%)', // #EF5350
    destructiveForeground: 'hsl(0 0% 100%)',

    // Borders & Inputs
    border: 'hsl(0 0% 14.9%)',
    input: 'hsl(0 0% 14.9%)',
    ring: 'hsl(211 72% 68%)', // Primary color

    // Border radius
    radius: '0.75rem', // 12px

    // Status colors for charts/badges
    success: 'hsl(122 39% 49%)', // #4CAF50
    warning: 'hsl(36 100% 58%)', // #FFA726
    danger: 'hsl(1 83% 63%)', // #EF5350
    info: 'hsl(211 72% 68%)', // Primary
  },
};
 
/**
 * React Navigation theme configuration
 * Maps MediSync theme to React Navigation's expected format
 */
export const NAV_THEME: Record<'light' | 'dark', Theme> = {
  light: {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      background: THEME.light.background,
      border: THEME.light.border,
      card: THEME.light.card,
      notification: THEME.light.danger,
      primary: THEME.light.primary,
      text: THEME.light.foreground,
    },
  },
  dark: {
    ...DarkTheme,
    colors: {
      ...DarkTheme.colors,
      background: THEME.dark.background,
      border: THEME.dark.border,
      card: THEME.dark.card,
      notification: THEME.dark.danger,
      primary: THEME.dark.primary,
      text: THEME.dark.foreground,
    },
  },
};