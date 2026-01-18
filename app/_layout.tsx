import '@/global.css';

import { NAV_THEME } from '@/lib/theme';
import { ThemeProvider as MediSyncThemeProvider, useTheme } from '@/lib/providers';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';
import { PortalHost } from '@rn-primitives/portal';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'nativewind';
import { useEffect, useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

/**
 * React Query client configuration
 * Handles data fetching, caching, and synchronization
 */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      gcTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
      refetchOnWindowFocus: true,
    },
  },
});

/**
 * Theme synchronization component
 * Syncs MediSync theme provider with nativewind color scheme
 */
function ThemeSync({ children }: { children: React.ReactNode }) {
  const { colorScheme: mediSyncColorScheme } = useTheme();
  const { setColorScheme } = useColorScheme();

  // Sync MediSync theme with nativewind
  useEffect(() => {
    setColorScheme(mediSyncColorScheme);
  }, [mediSyncColorScheme, setColorScheme]);

  return <>{children}</>;
}

/**
 * Navigation wrapper with proper theme
 */
function NavigationWrapper({ children }: { children: React.ReactNode }) {
  const { colorScheme } = useTheme();

  return (
    <NavigationThemeProvider value={NAV_THEME[colorScheme]}>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      {children}
    </NavigationThemeProvider>
  );
}

/**
 * Root layout component
 * Wraps the app with all necessary providers:
 * - SafeAreaProvider: Safe area insets for notches/status bars
 * - MediSyncThemeProvider: Theme context with persistence
 * - QueryClientProvider: React Query for data fetching
 * - NavigationThemeProvider: React Navigation theme
 * - PortalHost: Modal/popover support
 */
export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Add any app initialization logic here
    setIsReady(true);
  }, []);

  if (!isReady) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <MediSyncThemeProvider defaultTheme="system">
          <ThemeSync>
            <NavigationWrapper>
              <Stack
                screenOptions={{
                  headerShown: false,
                  contentStyle: {
                    backgroundColor: 'transparent',
                  },
                  animation: 'fade',
                }}
              />
              <PortalHost />
            </NavigationWrapper>
          </ThemeSync>
        </MediSyncThemeProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
