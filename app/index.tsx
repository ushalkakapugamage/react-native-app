/**
 * MediSync Entry Point
 * Checks authentication status and redirects accordingly
 */

import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';

export default function Index() {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  /**
   * Check authentication status
   * TODO: Replace with actual auth logic (AsyncStorage, SecureStore, or API call)
   */
  const checkAuthStatus = async () => {
    try {
      // Simulate auth check
      await new Promise((resolve) => setTimeout(resolve, 500));

      // TODO: Replace with actual auth check
      // const token = await AsyncStorage.getItem('@auth_token');
      // const onboarding = await AsyncStorage.getItem('@has_seen_onboarding');

      // For now, always show onboarding/login for new setup
      setIsAuthenticated(false);
      setHasSeenOnboarding(false);
    } catch (error) {
      console.error('Error checking auth status:', error);
      setIsAuthenticated(false);
      setHasSeenOnboarding(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading spinner while checking auth
  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" className="text-primary" />
      </View>
    );
  }

  // Redirect based on auth status
  if (!hasSeenOnboarding) {
    return <Redirect href="/(auth)/onboarding" />;
  }

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  return <Redirect href="/(tabs)" />;
}
