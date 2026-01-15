/**
 * Progress Bar Component for Onboarding
 *
 * Shows visual progress through multi-step forms
 * Animates width changes smoothly
 */

import { Text } from '@/components/ui/text';
import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
  showLabel?: boolean;
}

export function ProgressBar({ currentStep, totalSteps, showLabel = true }: ProgressBarProps) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming((currentStep / totalSteps) * 100, {
      duration: 300,
    });
  }, [currentStep, totalSteps]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      width: `${progress.value}%`,
    };
  });

  return (
    <View className="gap-2">
      {showLabel && (
        <Text className="text-center text-sm text-muted-foreground">
          Step {currentStep} of {totalSteps}
        </Text>
      )}
      <View className="h-2 w-full overflow-hidden rounded-full bg-muted">
        <Animated.View
          className="h-full rounded-full bg-primary"
          style={animatedStyle}
        />
      </View>
    </View>
  );
}
