/**
 * Day Selector Component
 *
 * A row of 7 day checkboxes for medication scheduling.
 * Features:
 * - Visual toggle for each day
 * - Select all / clear all functionality
 * - Accessible labels
 * - Haptic feedback
 */

import React, { useCallback } from 'react';
import { View, Pressable } from 'react-native';
import { Text } from '@/components/ui/text';
import type { DayOfWeek } from '@/lib/types';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolateColor,
} from 'react-native-reanimated';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface DaySelectorProps {
  selectedDays: DayOfWeek[];
  onDaysChange: (days: DayOfWeek[]) => void;
  disabled?: boolean;
  error?: string;
}

interface DayButtonProps {
  day: DayOfWeek;
  label: string;
  shortLabel: string;
  isSelected: boolean;
  onToggle: () => void;
  disabled?: boolean;
}

const ALL_DAYS: { day: DayOfWeek; label: string; shortLabel: string }[] = [
  { day: 'monday', label: 'Monday', shortLabel: 'M' },
  { day: 'tuesday', label: 'Tuesday', shortLabel: 'T' },
  { day: 'wednesday', label: 'Wednesday', shortLabel: 'W' },
  { day: 'thursday', label: 'Thursday', shortLabel: 'T' },
  { day: 'friday', label: 'Friday', shortLabel: 'F' },
  { day: 'saturday', label: 'Saturday', shortLabel: 'S' },
  { day: 'sunday', label: 'Sunday', shortLabel: 'S' },
];

function DayButton({
  day,
  label,
  shortLabel,
  isSelected,
  onToggle,
  disabled = false,
}: DayButtonProps) {
  const scale = useSharedValue(1);

  const handlePress = () => {
    if (disabled) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    scale.value = withSpring(0.9, { damping: 15 }, () => {
      scale.value = withSpring(1);
    });
    onToggle();
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      onPress={handlePress}
      disabled={disabled}
      style={animatedStyle}
      accessibilityLabel={`${label}, ${isSelected ? 'selected' : 'not selected'}`}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: isSelected, disabled }}
      className={`h-11 w-11 items-center justify-center rounded-full ${
        isSelected
          ? 'bg-primary'
          : 'border border-border bg-card'
      } ${disabled ? 'opacity-50' : ''}`}
    >
      <Text
        className={`text-sm font-semibold ${
          isSelected ? 'text-white' : 'text-foreground'
        }`}
      >
        {shortLabel}
      </Text>
    </AnimatedPressable>
  );
}

export function DaySelector({
  selectedDays,
  onDaysChange,
  disabled = false,
  error,
}: DaySelectorProps) {
  const toggleDay = useCallback(
    (day: DayOfWeek) => {
      if (selectedDays.includes(day)) {
        onDaysChange(selectedDays.filter((d) => d !== day));
      } else {
        onDaysChange([...selectedDays, day]);
      }
    },
    [selectedDays, onDaysChange]
  );

  const selectAll = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onDaysChange(ALL_DAYS.map((d) => d.day));
  }, [onDaysChange]);

  const clearAll = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onDaysChange([]);
  }, [onDaysChange]);

  const allSelected = selectedDays.length === ALL_DAYS.length;
  const noneSelected = selectedDays.length === 0;

  return (
    <View className="gap-3">
      {/* Day Buttons */}
      <View className="flex-row justify-between">
        {ALL_DAYS.map((dayInfo) => (
          <DayButton
            key={dayInfo.day}
            day={dayInfo.day}
            label={dayInfo.label}
            shortLabel={dayInfo.shortLabel}
            isSelected={selectedDays.includes(dayInfo.day)}
            onToggle={() => toggleDay(dayInfo.day)}
            disabled={disabled}
          />
        ))}
      </View>

      {/* Quick Actions */}
      <View className="flex-row gap-2">
        <Pressable
          onPress={selectAll}
          disabled={disabled || allSelected}
          className={`rounded-lg px-3 py-1.5 ${
            allSelected ? 'bg-muted' : 'bg-primary/10'
          }`}
        >
          <Text
            className={`text-xs font-medium ${
              allSelected ? 'text-muted-foreground' : 'text-primary'
            }`}
          >
            Select All
          </Text>
        </Pressable>
        <Pressable
          onPress={clearAll}
          disabled={disabled || noneSelected}
          className={`rounded-lg px-3 py-1.5 ${
            noneSelected ? 'bg-muted' : 'bg-muted'
          }`}
        >
          <Text
            className={`text-xs font-medium ${
              noneSelected ? 'text-muted-foreground' : 'text-foreground'
            }`}
          >
            Clear All
          </Text>
        </Pressable>
      </View>

      {/* Error Message */}
      {error && <Text className="text-sm text-danger">{error}</Text>}
    </View>
  );
}

// Export helper to get all days
export const getAllDays = (): DayOfWeek[] => ALL_DAYS.map((d) => d.day);
