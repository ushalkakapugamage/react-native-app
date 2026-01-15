/**
 * Development Layout
 * Layout for development and testing screens
 */

import { Stack } from 'expo-router';

export default function DevLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: 'transparent',
        },
        animation: 'fade',
      }}
    >
      <Stack.Screen name="components-showcase" />
    </Stack>
  );
}
