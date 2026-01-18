/**
 * Plan Routes Layout
 * Stack navigation for medication plan screens
 */

import { Stack } from 'expo-router';

export default function PlanLayout() {
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
