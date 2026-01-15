/**
 * MediSync Theme Color Hook
 * Provides typed access to theme colors based on current color scheme
 */

import { useTheme } from '@/lib/providers';
import colors from '@/lib/constants/colors';

/**
 * Hook to get theme-aware colors
 * Returns colors that automatically adapt to light/dark mode
 *
 * @example
 * const themeColors = useThemeColor();
 * <View style={{ backgroundColor: themeColors.background }} />
 */
export function useThemeColor() {
  const { colorScheme } = useTheme();
  const isDark = colorScheme === 'dark';

  return {
    // Backgrounds
    background: isDark ? colors.background.dark : colors.background.light,
    surface: isDark ? colors.surface.dark : colors.surface.light,

    // Text
    textPrimary: isDark ? colors.text.primary.dark : colors.text.primary.light,
    textSecondary: isDark ? colors.text.secondary.dark : colors.text.secondary.light,

    // Borders
    border: isDark ? colors.border.dark : colors.border.light,

    // Brand colors (same in both modes)
    primary: colors.primary,
    secondary: colors.secondary,

    // Status colors (same in both modes)
    success: colors.success,
    warning: colors.warning,
    danger: colors.danger,

    // Feature-specific colors
    medication: colors.medication,
    fallDetection: colors.fallDetection,
    family: colors.family,

    // Color scheme info
    isDark,
    colorScheme,
  };
}

/**
 * Hook to get a specific theme color by key
 * Useful for conditional styling based on theme
 *
 * @example
 * const backgroundColor = useThemeColorByKey('background');
 * const primaryColor = useThemeColorByKey('primary');
 */
export function useThemeColorByKey(
  key: 'background' | 'surface' | 'textPrimary' | 'textSecondary' | 'border' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger'
) {
  const themeColors = useThemeColor();
  return themeColors[key];
}

export default useThemeColor;
