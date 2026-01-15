# MediSync Theme Configuration

Complete theme system with light/dark mode support, AsyncStorage persistence, and system theme detection.

## Overview

The MediSync theme system provides:
- ✅ Light/Dark mode switching
- ✅ System theme detection
- ✅ AsyncStorage persistence
- ✅ TypeScript support
- ✅ Tailwind CSS integration
- ✅ React Native styles support
- ✅ Feature-specific semantic colors

## Color Palette

### Brand Colors
- **Primary**: `#72A8E8` (Medical Blue) - Main brand color, calming healthcare blue
- **Secondary**: `#F8A978` (Coral) - Alerts and warm notifications

### Status Colors
- **Success**: `#4CAF50` - Medication taken, positive actions
- **Warning**: `#FFA726` - Reminder times, caution states
- **Danger**: `#EF5350` - Fall detection, missed medications, critical alerts

### Feature-Specific Colors
- **Medication Status**: taken (green), missed (red), upcoming (orange), scheduled (blue)
- **Fall Detection**: detected (red), warning (orange), safe (green)
- **Family Monitoring**: online (green), offline (gray), alert (red)

## File Structure

```
lib/
├── constants/
│   ├── theme.ts        # Complete theme object with TypeScript types
│   └── colors.ts       # Color constants for non-Tailwind use
├── providers/
│   ├── theme-provider.tsx  # Theme context provider
│   └── index.ts
├── hooks/
│   ├── use-theme-color.ts  # Theme-aware color hook
│   └── index.ts
└── theme.ts            # React Navigation theme config

app/
└── _layout.tsx         # Root layout with providers

components/
└── theme-toggle.tsx    # Example theme toggle component

global.css              # CSS variables and utility classes
tailwind.config.js      # Tailwind configuration
```

## Usage Examples

### 1. Using the Theme Hook

```tsx
import { useTheme } from '@/lib/providers';

function MyComponent() {
  const { colorScheme, themeMode, setThemeMode, toggleTheme, isLoading } = useTheme();

  return (
    <View>
      <Text>Current theme: {colorScheme}</Text>
      <Button onPress={toggleTheme}>Toggle Theme</Button>
      <Button onPress={() => setThemeMode('system')}>Use System Theme</Button>
    </View>
  );
}
```

### 2. Using Theme Colors Hook

```tsx
import { useThemeColor } from '@/lib/hooks';

function MyComponent() {
  const colors = useThemeColor();

  return (
    <View style={{ backgroundColor: colors.background }}>
      <Text style={{ color: colors.textPrimary }}>Hello World</Text>
      <View style={{ backgroundColor: colors.primary }} />
    </View>
  );
}
```

### 3. Using Tailwind Classes

```tsx
function MyComponent() {
  return (
    <View className="bg-background">
      <Text className="text-foreground text-lg font-semibold">
        Welcome to MediSync
      </Text>
      <View className="bg-primary rounded-lg p-4">
        <Text className="text-primary-foreground">Primary Button</Text>
      </View>

      {/* Status badges */}
      <View className="badge-success rounded-full px-3 py-1">
        <Text className="text-xs">Taken</Text>
      </View>

      {/* Feature-specific */}
      <View className="status-taken rounded px-2 py-1">
        <Text className="text-xs text-white">Medication Taken</Text>
      </View>
    </View>
  );
}
```

### 4. Using Color Constants

```tsx
import colors from '@/lib/constants/colors';
import { MEDISYNC_BLUE, MEDICATION_TAKEN, withOpacity } from '@/lib/constants/colors';

function MyComponent() {
  return (
    <View style={{ backgroundColor: colors.primary }}>
      <View style={{ backgroundColor: MEDISYNC_BLUE }} />
      <View style={{ backgroundColor: MEDICATION_TAKEN }} />
      <View style={{ backgroundColor: withOpacity(MEDISYNC_BLUE, 0.2) }} />
    </View>
  );
}
```

### 5. Using Theme Object

```tsx
import { theme } from '@/lib/constants/theme';

function MyComponent() {
  return (
    <View style={{
      padding: theme.spacing.md,
      borderRadius: theme.borderRadius.lg,
      backgroundColor: theme.colors.primary.DEFAULT,
      ...theme.shadows.md,
    }}>
      <Text style={{ fontSize: theme.typography.fontSize.lg }}>
        Styled with theme object
      </Text>
    </View>
  );
}
```

### 6. Theme Toggle Component

```tsx
import { ThemeToggle, ThemeModeSelector } from '@/components/theme-toggle';

function SettingsScreen() {
  return (
    <View className="p-4">
      <Text className="mb-2 text-lg font-semibold">Theme</Text>

      {/* Simple toggle */}
      <ThemeToggle />

      {/* Full selector */}
      <ThemeModeSelector />
    </View>
  );
}
```

## Available CSS Variables

### Light Mode
```css
--primary: 211 72% 68%;           /* #72A8E8 */
--secondary: 22 90% 72%;          /* #F8A978 */
--success: 122 39% 49%;           /* #4CAF50 */
--warning: 36 100% 58%;           /* #FFA726 */
--danger: 1 83% 63%;              /* #EF5350 */
--background: 0 0% 100%;          /* White */
--foreground: 0 0% 9.2%;          /* Near black */

/* Feature-specific */
--medication-taken: 122 39% 49%;
--medication-missed: 1 83% 63%;
--medication-upcoming: 36 100% 58%;
--medication-scheduled: 211 72% 68%;
```

### Dark Mode
Same color values with adjusted backgrounds:
```css
--background: 0 0% 3.9%;          /* Very dark gray */
--foreground: 0 0% 98%;           /* Off-white */
```

## Tailwind Utility Classes

### Status Badges
```tsx
<View className="badge-success" /> {/* Green badge */}
<View className="badge-warning" /> {/* Orange badge */}
<View className="badge-danger" />  {/* Red badge */}
<View className="badge-info" />    {/* Blue badge */}
```

### Medication Status
```tsx
<View className="status-taken" />     {/* Medication taken */}
<View className="status-missed" />    {/* Medication missed */}
<View className="status-upcoming" />  {/* Reminder upcoming */}
<View className="status-scheduled" /> {/* Medication scheduled */}
```

### Safe Area
```tsx
<View className="safe-area-top" />    {/* Top safe area padding */}
<View className="safe-area-bottom" /> {/* Bottom safe area padding */}
```

### Theme Transitions
```tsx
<View className="transition-theme" /> {/* Smooth color transitions */}
```

## TypeScript Types

```typescript
// Theme mode type
type ThemeMode = 'light' | 'dark' | 'system';

// Color scheme type
type ColorScheme = 'light' | 'dark';

// Theme context type
interface ThemeContextType {
  colorScheme: ColorScheme;
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
  isLoading: boolean;
  isSystemTheme: boolean;
}
```

## Customization

### Change Default Theme
```tsx
// In app/_layout.tsx
<MediSyncThemeProvider defaultTheme="dark">
  {/* Your app */}
</MediSyncThemeProvider>
```

### Change Storage Key
```tsx
<MediSyncThemeProvider
  defaultTheme="system"
  storageKey="@my_custom_theme_key"
>
  {/* Your app */}
</MediSyncThemeProvider>
```

### Add Custom Colors to Tailwind
```javascript
// In tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        custom: {
          DEFAULT: '#FF5733',
          light: '#FF8C6B',
          dark: '#CC4629',
        },
      },
    },
  },
};
```

### Add Custom CSS Variables
```css
/* In global.css */
:root {
  --custom-color: 255 87 51;
}

.dark:root {
  --custom-color: 204 70 41;
}
```

## Best Practices

1. **Use semantic colors**: Prefer `status-taken` over `bg-green-500`
2. **Use theme hooks**: Access colors through `useThemeColor()` for automatic theme switching
3. **Test both themes**: Always test your UI in both light and dark modes
4. **Use transitions**: Add `transition-theme` class for smooth theme changes
5. **Persist theme**: The theme automatically persists to AsyncStorage
6. **System theme**: Default to `'system'` for better UX

## Testing Theme Switching

```tsx
import { useTheme } from '@/lib/providers';

function ThemeTestScreen() {
  const { colorScheme, themeMode, setThemeMode, toggleTheme } = useTheme();

  return (
    <View className="flex-1 bg-background p-4">
      <Text className="text-foreground mb-4">
        Current Mode: {themeMode}
      </Text>
      <Text className="text-foreground mb-4">
        Active Scheme: {colorScheme}
      </Text>

      <Button onPress={toggleTheme}>Toggle Theme</Button>
      <Button onPress={() => setThemeMode('light')}>Light</Button>
      <Button onPress={() => setThemeMode('dark')}>Dark</Button>
      <Button onPress={() => setThemeMode('system')}>System</Button>
    </View>
  );
}
```

## Troubleshooting

### Theme not persisting
- Ensure `@react-native-async-storage/async-storage` is installed
- Check AsyncStorage permissions on native platforms

### Colors not updating
- Verify `ThemeSync` component is in `_layout.tsx`
- Check that components are using theme-aware colors

### TypeScript errors
- Ensure all type exports are imported correctly
- Run `npx tsc --noEmit` to check for type errors

## Resources

- [Tailwind CSS Documentation](https://tailwindcss.com)
- [NativeWind Documentation](https://www.nativewind.dev)
- [React Navigation Theming](https://reactnavigation.org/docs/themes)
- [AsyncStorage Documentation](https://react-native-async-storage.github.io/async-storage/)
