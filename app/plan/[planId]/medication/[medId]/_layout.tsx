/**
 * Medication Detail Routes Layout
 */

import { Stack } from 'expo-router';

export default function MedicationDetailLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: 'transparent',
        },
        animation: 'slide_from_right',
      }}
    />
  );
}
