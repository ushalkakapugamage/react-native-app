/**
 * Plan Detail Routes Layout
 * Stack navigation for individual plan screens
 */

import { Stack } from 'expo-router';

export default function PlanDetailLayout() {
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
