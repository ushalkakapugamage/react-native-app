/**
 * Time Picker Input Component
 *
 * A list of time inputs for medication scheduling.
 * Features:
 * - Add/remove time slots
 * - Native time picker
 * - Auto-sort times
 * - Duplicate prevention
 * - Haptic feedback
 */

import React, { useState, useCallback } from 'react';
import { View, Pressable, Modal, Platform } from 'react-native';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { Clock, Plus, Minus, X } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import Animated, {
  FadeIn,
  FadeOut,
  SlideInRight,
  SlideOutRight,
  Layout,
} from 'react-native-reanimated';

interface TimePickerInputProps {
  times: string[];
  onTimesChange: (times: string[]) => void;
  disabled?: boolean;
  error?: string;
  maxTimes?: number;
}

interface TimeSlotProps {
  time: string;
  onEdit: () => void;
  onRemove: () => void;
  disabled?: boolean;
  canRemove: boolean;
}

/**
 * Format time string to 12-hour format for display
 */
const formatTime = (time24: string): string => {
  const [hours, minutes] = time24.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const hours12 = hours % 12 || 12;
  return `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`;
};

/**
 * Convert Date to HH:MM string
 */
const dateToTimeString = (date: Date): string => {
  return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
};

/**
 * Convert HH:MM string to Date
 */
const timeStringToDate = (time: string): Date => {
  const [hours, minutes] = time.split(':').map(Number);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date;
};

/**
 * Sort times chronologically
 */
const sortTimes = (times: string[]): string[] => {
  return [...times].sort((a, b) => {
    const [aH, aM] = a.split(':').map(Number);
    const [bH, bM] = b.split(':').map(Number);
    return aH * 60 + aM - (bH * 60 + bM);
  });
};

function TimeSlot({ time, onEdit, onRemove, disabled, canRemove }: TimeSlotProps) {
  return (
    <Animated.View
      entering={SlideInRight.springify()}
      exiting={SlideOutRight.springify()}
      layout={Layout.springify()}
      className="flex-row items-center gap-2"
    >
      <Pressable
        onPress={() => {
          if (!disabled) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onEdit();
          }
        }}
        disabled={disabled}
        className={`flex-1 flex-row items-center gap-3 rounded-lg border border-border bg-card px-4 py-3 ${
          disabled ? 'opacity-50' : 'active:bg-muted'
        }`}
      >
        <Clock size={20} className="text-primary" />
        <Text className="flex-1 text-base font-medium text-foreground">
          {formatTime(time)}
        </Text>
      </Pressable>

      {canRemove && (
        <Pressable
          onPress={() => {
            if (!disabled) {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              onRemove();
            }
          }}
          disabled={disabled}
          className={`h-12 w-12 items-center justify-center rounded-lg bg-danger/10 ${
            disabled ? 'opacity-50' : 'active:bg-danger/20'
          }`}
        >
          <Minus size={20} className="text-danger" />
        </Pressable>
      )}
    </Animated.View>
  );
}

export function TimePickerInput({
  times,
  onTimesChange,
  disabled = false,
  error,
  maxTimes = 10,
}: TimePickerInputProps) {
  const [showPicker, setShowPicker] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [tempTime, setTempTime] = useState<Date>(new Date());

  /**
   * Open picker to add new time
   */
  const handleAddTime = useCallback(() => {
    if (times.length >= maxTimes) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // Default to next hour or 8am if no times yet
    const defaultTime = new Date();
    if (times.length === 0) {
      defaultTime.setHours(8, 0, 0, 0);
    } else {
      // Find a time that doesn't conflict
      const lastTime = times[times.length - 1];
      const [hours, minutes] = lastTime.split(':').map(Number);
      defaultTime.setHours(hours + 4, minutes, 0, 0);
      if (defaultTime.getHours() >= 24) {
        defaultTime.setHours(8, 0, 0, 0);
      }
    }

    setTempTime(defaultTime);
    setEditingIndex(null);
    setShowPicker(true);
  }, [times, maxTimes]);

  /**
   * Open picker to edit existing time
   */
  const handleEditTime = useCallback((index: number) => {
    setTempTime(timeStringToDate(times[index]));
    setEditingIndex(index);
    setShowPicker(true);
  }, [times]);

  /**
   * Remove a time slot
   */
  const handleRemoveTime = useCallback(
    (index: number) => {
      const newTimes = times.filter((_, i) => i !== index);
      onTimesChange(newTimes);
    },
    [times, onTimesChange]
  );

  /**
   * Handle time picker change
   */
  const handleTimeChange = useCallback(
    (event: DateTimePickerEvent, selectedDate?: Date) => {
      if (Platform.OS === 'android') {
        setShowPicker(false);
      }

      if (event.type === 'dismissed') {
        setShowPicker(false);
        return;
      }

      if (selectedDate) {
        setTempTime(selectedDate);

        // On Android, confirm immediately
        if (Platform.OS === 'android') {
          confirmTime(selectedDate);
        }
      }
    },
    []
  );

  /**
   * Confirm selected time
   */
  const confirmTime = useCallback(
    (date: Date = tempTime) => {
      const newTime = dateToTimeString(date);

      // Check for duplicates
      const isDuplicate = times.some((t, i) => t === newTime && i !== editingIndex);
      if (isDuplicate) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        setShowPicker(false);
        return;
      }

      let newTimes: string[];
      if (editingIndex !== null) {
        // Edit existing
        newTimes = times.map((t, i) => (i === editingIndex ? newTime : t));
      } else {
        // Add new
        newTimes = [...times, newTime];
      }

      // Sort times
      onTimesChange(sortTimes(newTimes));
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setShowPicker(false);
    },
    [times, tempTime, editingIndex, onTimesChange]
  );

  const canAddMore = times.length < maxTimes;

  return (
    <View className="gap-3">
      {/* Time Slots */}
      {times.length > 0 && (
        <View className="gap-2">
          {sortTimes(times).map((time, index) => (
            <TimeSlot
              key={`${time}-${index}`}
              time={time}
              onEdit={() => handleEditTime(index)}
              onRemove={() => handleRemoveTime(index)}
              disabled={disabled}
              canRemove={times.length > 1}
            />
          ))}
        </View>
      )}

      {/* Add Time Button */}
      {canAddMore && (
        <Pressable
          onPress={handleAddTime}
          disabled={disabled}
          className={`flex-row items-center justify-center gap-2 rounded-lg border border-dashed border-primary/50 bg-primary/5 px-4 py-3 ${
            disabled ? 'opacity-50' : 'active:bg-primary/10'
          }`}
        >
          <Plus size={20} className="text-primary" />
          <Text className="text-base font-medium text-primary">
            Add Time {times.length > 0 && `(${times.length}/${maxTimes})`}
          </Text>
        </Pressable>
      )}

      {/* Error Message */}
      {error && <Text className="text-sm text-danger">{error}</Text>}

      {/* iOS Modal Picker */}
      {Platform.OS === 'ios' && (
        <Modal
          visible={showPicker}
          transparent
          animationType="fade"
          onRequestClose={() => setShowPicker(false)}
        >
          <Pressable
            className="flex-1 items-center justify-end bg-black/50"
            onPress={() => setShowPicker(false)}
          >
            <Animated.View
              entering={FadeIn.duration(200)}
              exiting={FadeOut.duration(200)}
              className="w-full rounded-t-3xl bg-background"
            >
              {/* Header */}
              <View className="flex-row items-center justify-between border-b border-border px-6 py-4">
                <Pressable onPress={() => setShowPicker(false)}>
                  <Text className="text-base text-muted-foreground">Cancel</Text>
                </Pressable>
                <Text className="text-lg font-semibold text-foreground">
                  {editingIndex !== null ? 'Edit Time' : 'Add Time'}
                </Text>
                <Pressable onPress={() => confirmTime()}>
                  <Text className="text-base font-semibold text-primary">Done</Text>
                </Pressable>
              </View>

              {/* Picker */}
              <View className="px-4 py-6">
                <DateTimePicker
                  value={tempTime}
                  mode="time"
                  display="spinner"
                  onChange={handleTimeChange}
                  textColor="#000"
                />
              </View>
            </Animated.View>
          </Pressable>
        </Modal>
      )}

      {/* Android Inline Picker */}
      {Platform.OS === 'android' && showPicker && (
        <DateTimePicker
          value={tempTime}
          mode="time"
          display="default"
          onChange={handleTimeChange}
        />
      )}
    </View>
  );
}

// Export common time presets
export const TIME_PRESETS = {
  morning: '08:00',
  noon: '12:00',
  afternoon: '14:00',
  evening: '18:00',
  night: '20:00',
  bedtime: '22:00',
};

export const DEFAULT_TIMES = ['08:00', '14:00', '20:00'];
