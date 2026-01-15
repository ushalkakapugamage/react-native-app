/**
 * Medication Detail Routes Layout
 * Stack navigation for individual medication screens (view, edit)
 */

import { Stack } from 'expo-router';

export default function MedicationDetailLayout() {
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
      <Stack.Screen name="index" />
      <Stack.Screen name="edit" />
    </Stack>
  );
}
