/**
 * Step Indicator Component
 *
 * Displays dots to show current step in multi-step flow
 * Current step: large, filled, primary color
 * Past steps: filled, primary color
 * Future steps: outlined, gray
 */

import { View } from 'react-native';

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

export function StepIndicator({ currentStep, totalSteps }: StepIndicatorProps) {
  return (
    <View className="flex-row items-center justify-center gap-2">
      {Array.from({ length: totalSteps }).map((_, index) => {
        const stepNumber = index + 1;
        const isCurrentStep = stepNumber === currentStep;
        const isPastStep = stepNumber < currentStep;
        const isFutureStep = stepNumber > currentStep;

        return (
          <View
            key={stepNumber}
            className={`rounded-full ${
              isCurrentStep
                ? 'h-3 w-3 bg-primary'
                : isPastStep
                  ? 'h-2 w-2 bg-primary'
                  : 'h-2 w-2 border border-muted-foreground bg-transparent'
            }`}
          />
        );
      })}
    </View>
  );
}
