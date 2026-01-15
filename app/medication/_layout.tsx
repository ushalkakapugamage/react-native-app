/**
 * Medication Routes Layout
 * Stack navigation for medication-related screens
 */

import { Stack } from 'expo-router';

export default function MedicationLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        contentStyle: {
          backgroundColor: 'transparent',
        },
      }}
    >
      <Stack.Screen name="add" />
      <Stack.Screen name="[id]" />
    </Stack>
  );
}
