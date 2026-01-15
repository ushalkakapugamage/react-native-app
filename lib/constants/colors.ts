/**
 * MediSync Color Constants
 * Color constants for non-Tailwind use (React Native styles, theme provider, etc.)
 * Semantic color names for better code readability
 */

// ==================== Primary Colors ====================
export const MEDISYNC_BLUE = '#72A8E8';
export const MEDISYNC_BLUE_LIGHT = '#88BDF3';
export const MEDISYNC_BLUE_LIGHTER = '#B0D3F7';
export const MEDISYNC_BLUE_LIGHTEST = '#EBF4FD';
export const MEDISYNC_BLUE_DARK = '#2F72D1';
export const MEDISYNC_BLUE_DARKER = '#2459A5';
export const MEDISYNC_BLUE_DARKEST = '#081729';

// ==================== Secondary Colors ====================
export const CORAL = '#F8A978';
export const CORAL_LIGHT = '#F9C29F';
export const CORAL_LIGHTER = '#FBD7BF';
export const CORAL_LIGHTEST = '#FEF5EF';
export const CORAL_DARK = '#F47940';
export const CORAL_DARKER = '#D65E28';
export const CORAL_DARKEST = '#3D1B0A';

// ==================== Status Colors ====================

// Success (Medication Taken)
export const SUCCESS = '#4CAF50';
export const SUCCESS_LIGHT = '#81C784';
export const SUCCESS_LIGHTER = '#C8E6C9';
export const SUCCESS_LIGHTEST = '#E8F5E9';
export const SUCCESS_DARK = '#388E3C';
export const SUCCESS_DARKER = '#2E7D32';
export const SUCCESS_DARKEST = '#0D3D11';

// Warning (Reminder Time)
export const WARNING = '#FFA726';
export const WARNING_LIGHT = '#FFB74D';
export const WARNING_LIGHTER = '#FFCC80';
export const WARNING_LIGHTEST = '#FFF3E0';
export const WARNING_DARK = '#F57C00';
export const WARNING_DARKER = '#EF6C00';
export const WARNING_DARKEST = '#8B3000';

// Danger (Fall Detected, Missed Medication)
export const DANGER = '#EF5350';
export const DANGER_LIGHT = '#E57373';
export const DANGER_LIGHTER = '#EF9A9A';
export const DANGER_LIGHTEST = '#FFEBEE';
export const DANGER_DARK = '#D32F2F';
export const DANGER_DARKER = '#C62828';
export const DANGER_DARKEST = '#6D1010';

// ==================== Neutral Colors ====================
export const NEUTRAL_50 = '#FAFAFA';
export const NEUTRAL_100 = '#F5F5F5';
export const NEUTRAL_200 = '#E5E5E5';
export const NEUTRAL_300 = '#D4D4D4';
export const NEUTRAL_400 = '#A3A3A3';
export const NEUTRAL_500 = '#737373';
export const NEUTRAL_600 = '#525252';
export const NEUTRAL_700 = '#404040';
export const NEUTRAL_800 = '#262626';
export const NEUTRAL_900 = '#171717';
export const NEUTRAL_950 = '#0A0A0A';

// ==================== Semantic Color Names ====================

// Backgrounds
export const BACKGROUND_LIGHT = '#FFFFFF';
export const BACKGROUND_DARK = '#0A0A0A';
export const SURFACE_LIGHT = '#F5F5F5';
export const SURFACE_DARK = '#171717';
export const SURFACE_ELEVATED_LIGHT = '#FFFFFF';
export const SURFACE_ELEVATED_DARK = '#262626';

// Text Colors
export const TEXT_PRIMARY_LIGHT = '#171717';
export const TEXT_PRIMARY_DARK = '#FAFAFA';
export const TEXT_SECONDARY_LIGHT = '#525252';
export const TEXT_SECONDARY_DARK = '#A3A3A3';
export const TEXT_DISABLED_LIGHT = '#D4D4D4';
export const TEXT_DISABLED_DARK = '#404040';
export const TEXT_ON_PRIMARY = '#FFFFFF';
export const TEXT_ON_SECONDARY = '#000000';
export const TEXT_ON_SUCCESS = '#FFFFFF';
export const TEXT_ON_WARNING = '#000000';
export const TEXT_ON_DANGER = '#FFFFFF';

// Border Colors
export const BORDER_LIGHT = '#E5E5E5';
export const BORDER_DARK = '#404040';
export const DIVIDER_LIGHT = '#F5F5F5';
export const DIVIDER_DARK = '#262626';

// ==================== Feature-Specific Colors ====================

// Medication
export const MEDICATION_TAKEN = SUCCESS;
export const MEDICATION_MISSED = DANGER;
export const MEDICATION_UPCOMING = WARNING;
export const MEDICATION_SCHEDULED = MEDISYNC_BLUE;

// Fall Detection
export const FALL_DETECTED = DANGER;
export const FALL_WARNING = WARNING;
export const FALL_SAFE = SUCCESS;

// Family Monitoring
export const FAMILY_ONLINE = SUCCESS;
export const FAMILY_OFFLINE = NEUTRAL_400;
export const FAMILY_ALERT = DANGER;

// Notifications
export const NOTIFICATION_INFO = MEDISYNC_BLUE;
export const NOTIFICATION_SUCCESS = SUCCESS;
export const NOTIFICATION_WARNING = WARNING;
export const NOTIFICATION_ERROR = DANGER;

// ==================== Color Palettes (Grouped for Export) ====================

export const PRIMARY_PALETTE = {
  50: '#EBF4FD',
  100: '#D7E9FB',
  200: '#B0D3F7',
  300: '#88BDF3',
  400: '#72A8E8',
  500: '#4A8FE5',
  600: '#2F72D1',
  700: '#2459A5',
  800: '#1A4179',
  900: '#0F294D',
  950: '#081729',
  DEFAULT: '#72A8E8',
  foreground: '#FFFFFF',
};

export const SECONDARY_PALETTE = {
  50: '#FEF5EF',
  100: '#FDEBDF',
  200: '#FBD7BF',
  300: '#F9C29F',
  400: '#F8A978',
  500: '#F6935C',
  600: '#F47940',
  700: '#D65E28',
  800: '#A3481D',
  900: '#703213',
  950: '#3D1B0A',
  DEFAULT: '#F8A978',
  foreground: '#000000',
};

export const SUCCESS_PALETTE = {
  50: '#E8F5E9',
  100: '#C8E6C9',
  200: '#A5D6A7',
  300: '#81C784',
  400: '#66BB6A',
  500: '#4CAF50',
  600: '#43A047',
  700: '#388E3C',
  800: '#2E7D32',
  900: '#1B5E20',
  950: '#0D3D11',
  DEFAULT: '#4CAF50',
  foreground: '#FFFFFF',
};

export const WARNING_PALETTE = {
  50: '#FFF3E0',
  100: '#FFE0B2',
  200: '#FFCC80',
  300: '#FFB74D',
  400: '#FFA726',
  500: '#FF9800',
  600: '#FB8C00',
  700: '#F57C00',
  800: '#EF6C00',
  900: '#E65100',
  950: '#8B3000',
  DEFAULT: '#FFA726',
  foreground: '#000000',
};

export const DANGER_PALETTE = {
  50: '#FFEBEE',
  100: '#FFCDD2',
  200: '#EF9A9A',
  300: '#E57373',
  400: '#EF5350',
  500: '#F44336',
  600: '#E53935',
  700: '#D32F2F',
  800: '#C62828',
  900: '#B71C1C',
  950: '#6D1010',
  DEFAULT: '#EF5350',
  foreground: '#FFFFFF',
};

export const NEUTRAL_PALETTE = {
  50: '#FAFAFA',
  100: '#F5F5F5',
  200: '#E5E5E5',
  300: '#D4D4D4',
  400: '#A3A3A3',
  500: '#737373',
  600: '#525252',
  700: '#404040',
  800: '#262626',
  900: '#171717',
  950: '#0A0A0A',
};

// ==================== Opacity Helpers ====================

/**
 * Convert hex color to rgba with opacity
 * @param hex - Hex color string (e.g., '#72A8E8')
 * @param opacity - Opacity value between 0 and 1
 * @returns rgba color string
 */
export const withOpacity = (hex: string, opacity: number): string => {
  // Remove # if present
  const cleanHex = hex.replace('#', '');

  // Convert to RGB
  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);

  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

// ==================== Pre-defined Opacity Variants ====================

export const PRIMARY_WITH_OPACITY = {
  10: withOpacity(MEDISYNC_BLUE, 0.1),
  20: withOpacity(MEDISYNC_BLUE, 0.2),
  30: withOpacity(MEDISYNC_BLUE, 0.3),
  40: withOpacity(MEDISYNC_BLUE, 0.4),
  50: withOpacity(MEDISYNC_BLUE, 0.5),
  60: withOpacity(MEDISYNC_BLUE, 0.6),
  70: withOpacity(MEDISYNC_BLUE, 0.7),
  80: withOpacity(MEDISYNC_BLUE, 0.8),
  90: withOpacity(MEDISYNC_BLUE, 0.9),
};

export const BLACK_WITH_OPACITY = {
  5: 'rgba(0, 0, 0, 0.05)',
  10: 'rgba(0, 0, 0, 0.1)',
  20: 'rgba(0, 0, 0, 0.2)',
  30: 'rgba(0, 0, 0, 0.3)',
  40: 'rgba(0, 0, 0, 0.4)',
  50: 'rgba(0, 0, 0, 0.5)',
  60: 'rgba(0, 0, 0, 0.6)',
  70: 'rgba(0, 0, 0, 0.7)',
  80: 'rgba(0, 0, 0, 0.8)',
  90: 'rgba(0, 0, 0, 0.9)',
};

export const WHITE_WITH_OPACITY = {
  5: 'rgba(255, 255, 255, 0.05)',
  10: 'rgba(255, 255, 255, 0.1)',
  20: 'rgba(255, 255, 255, 0.2)',
  30: 'rgba(255, 255, 255, 0.3)',
  40: 'rgba(255, 255, 255, 0.4)',
  50: 'rgba(255, 255, 255, 0.5)',
  60: 'rgba(255, 255, 255, 0.6)',
  70: 'rgba(255, 255, 255, 0.7)',
  80: 'rgba(255, 255, 255, 0.8)',
  90: 'rgba(255, 255, 255, 0.9)',
};

// ==================== Default Export ====================

export default {
  // Brand Colors
  primary: MEDISYNC_BLUE,
  secondary: CORAL,

  // Status Colors
  success: SUCCESS,
  warning: WARNING,
  danger: DANGER,

  // Palettes
  primaryPalette: PRIMARY_PALETTE,
  secondaryPalette: SECONDARY_PALETTE,
  successPalette: SUCCESS_PALETTE,
  warningPalette: WARNING_PALETTE,
  dangerPalette: DANGER_PALETTE,
  neutralPalette: NEUTRAL_PALETTE,

  // Backgrounds
  background: {
    light: BACKGROUND_LIGHT,
    dark: BACKGROUND_DARK,
  },
  surface: {
    light: SURFACE_LIGHT,
    dark: SURFACE_DARK,
  },

  // Text
  text: {
    primary: {
      light: TEXT_PRIMARY_LIGHT,
      dark: TEXT_PRIMARY_DARK,
    },
    secondary: {
      light: TEXT_SECONDARY_LIGHT,
      dark: TEXT_SECONDARY_DARK,
    },
  },

  // Borders
  border: {
    light: BORDER_LIGHT,
    dark: BORDER_DARK,
  },

  // Feature-specific
  medication: {
    taken: MEDICATION_TAKEN,
    missed: MEDICATION_MISSED,
    upcoming: MEDICATION_UPCOMING,
    scheduled: MEDICATION_SCHEDULED,
  },

  fallDetection: {
    detected: FALL_DETECTED,
    warning: FALL_WARNING,
    safe: FALL_SAFE,
  },

  family: {
    online: FAMILY_ONLINE,
    offline: FAMILY_OFFLINE,
    alert: FAMILY_ALERT,
  },

  // Helpers
  withOpacity,
};
