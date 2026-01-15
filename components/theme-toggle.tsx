/**
 * MediSync Theme Toggle Component
 * Example component showing how to toggle between light/dark themes
 */

import { useTheme } from '@/lib/providers';
import { Moon, Sun } from 'lucide-react-native';
import { Pressable, View } from 'react-native';

export function ThemeToggle() {
  const { colorScheme, toggleTheme } = useTheme();

  return (
    <Pressable
      onPress={toggleTheme}
      className="h-10 w-10 items-center justify-center rounded-full bg-muted transition-theme active:opacity-70"
    >
      <View className="transition-theme">
        {colorScheme === 'dark' ? (
          <Sun className="h-5 w-5 text-foreground" />
        ) : (
          <Moon className="h-5 w-5 text-foreground" />
        )}
      </View>
    </Pressable>
  );
}

/**
 * Theme mode selector component
 * Allows selecting between light, dark, and system theme
 */
export function ThemeModeSelector() {
  const { themeMode, setThemeMode, colorScheme } = useTheme();

  const modes: Array<{ value: 'light' | 'dark' | 'system'; label: string }> = [
    { value: 'light', label: 'Light' },
    { value: 'dark', label: 'Dark' },
    { value: 'system', label: 'System' },
  ];

  return (
    <View className="flex-row rounded-lg bg-muted p-1">
      {modes.map((mode) => (
        <Pressable
          key={mode.value}
          onPress={() => setThemeMode(mode.value)}
          className={`flex-1 rounded-md px-4 py-2 ${
            themeMode === mode.value
              ? 'bg-primary'
              : 'bg-transparent'
          }`}
        >
          <View className="items-center">
            <View
              className={`text-sm font-medium ${
                themeMode === mode.value
                  ? 'text-primary-foreground'
                  : 'text-muted-foreground'
              }`}
            >
              {mode.label}
            </View>
          </View>
        </Pressable>
      ))}
    </View>
  );
}

export default ThemeToggle;
