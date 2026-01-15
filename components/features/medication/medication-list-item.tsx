/**
 * Medication List Item Component
 *
 * Displays a medication in the list with:
 * - Name, dosage, type
 * - Next dose time
 * - Status badge
 * - Color-coded left border
 * - Swipe actions (left: delete, right: edit)
 * - Tap to view details
 */

import { Badge } from '@/components/ui/badge';
import { Text } from '@/components/ui/text';
import type { Medication } from '@/lib/types';
import { Clock, Pill, Trash2, Edit3 } from 'lucide-react-native';
import { Pressable, View, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';
import { useCallback } from 'react';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SWIPE_THRESHOLD = 80;
const DELETE_THRESHOLD = SCREEN_WIDTH * 0.4;

interface MedicationListItemProps {
  medication: Medication;
  onPress: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function MedicationListItem({
  medication,
  onPress,
  onEdit,
  onDelete,
}: MedicationListItemProps) {
  const translateX = useSharedValue(0);
  const itemHeight = useSharedValue(80);
  const itemOpacity = useSharedValue(1);
  const isRemoving = useSharedValue(false);

  /**
   * Get status info
   */
  const getStatusInfo = () => {
    if (!medication.isActive) {
      return {
        label: 'Paused',
        variant: 'default' as const,
        borderColor: 'border-l-gray-400',
      };
    }
    if (medication.endDate && new Date(medication.endDate) < new Date()) {
      return {
        label: 'Completed',
        variant: 'info' as const,
        borderColor: 'border-l-info',
      };
    }
    return {
      label: 'Active',
      variant: 'success' as const,
      borderColor: 'border-l-success',
    };
  };

  /**
   * Get next dose time
   */
  const getNextDoseTime = () => {
    const times = medication.schedule?.times || [];
    if (times.length === 0) return 'No schedule';

    const now = new Date();
    const currentHour = now.getHours();
    const currentMinutes = now.getMinutes();
    const currentTimeMinutes = currentHour * 60 + currentMinutes;

    // Find next time today
    for (const time of times) {
      const [h, m] = time.split(':').map(Number);
      const timeMinutes = h * 60 + m;
      if (timeMinutes > currentTimeMinutes) {
        return `Today at ${formatTime(time)}`;
      }
    }

    // If no time left today, return first time tomorrow
    if (times[0]) {
      return `Tomorrow at ${formatTime(times[0])}`;
    }

    return 'No upcoming doses';
  };

  /**
   * Format time to 12-hour
   */
  const formatTime = (time24: string): string => {
    const [hours, minutes] = time24.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const hours12 = hours % 12 || 12;
    return `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  /**
   * Handle edit action
   */
  const handleEdit = useCallback(() => {
    translateX.value = withSpring(0);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onEdit();
  }, [onEdit]);

  /**
   * Handle delete action
   */
  const handleDelete = useCallback(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    onDelete();
  }, [onDelete]);

  /**
   * Animate item removal
   */
  const animateRemoval = useCallback(() => {
    isRemoving.value = true;
    itemHeight.value = withTiming(0, { duration: 300 });
    itemOpacity.value = withTiming(0, { duration: 200 });
  }, []);

  /**
   * Pan gesture for swiping
   */
  const panGesture = Gesture.Pan()
    .activeOffsetX([-10, 10])
    .onUpdate((event) => {
      // Limit swipe distance
      const clampedX = Math.max(
        -DELETE_THRESHOLD,
        Math.min(SWIPE_THRESHOLD, event.translationX)
      );
      translateX.value = clampedX;

      // Haptic feedback at threshold
      if (
        Math.abs(event.translationX) > SWIPE_THRESHOLD * 0.8 &&
        Math.abs(translateX.value) < SWIPE_THRESHOLD
      ) {
        runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Light);
      }
    })
    .onEnd((event) => {
      const shouldDelete =
        event.translationX < -DELETE_THRESHOLD * 0.8 ||
        (event.translationX < -SWIPE_THRESHOLD && event.velocityX < -500);
      const shouldShowEdit =
        event.translationX > SWIPE_THRESHOLD * 0.8 ||
        (event.translationX > SWIPE_THRESHOLD * 0.5 && event.velocityX > 500);

      if (shouldDelete) {
        // Full swipe delete
        translateX.value = withTiming(-SCREEN_WIDTH, { duration: 200 }, () => {
          runOnJS(handleDelete)();
        });
      } else if (shouldShowEdit) {
        // Show edit action then trigger
        translateX.value = withSpring(SWIPE_THRESHOLD, {}, () => {
          runOnJS(handleEdit)();
        });
      } else if (Math.abs(event.translationX) > SWIPE_THRESHOLD * 0.3) {
        // Snap to show action buttons
        if (event.translationX > 0) {
          translateX.value = withSpring(SWIPE_THRESHOLD);
        } else {
          translateX.value = withSpring(-SWIPE_THRESHOLD);
        }
      } else {
        // Reset to center
        translateX.value = withSpring(0);
      }
    });

  /**
   * Tap gesture for viewing details
   */
  const tapGesture = Gesture.Tap().onEnd(() => {
    if (Math.abs(translateX.value) < 10) {
      runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Light);
      runOnJS(onPress)();
    } else {
      translateX.value = withSpring(0);
    }
  });

  /**
   * Long press gesture for action menu
   */
  const longPressGesture = Gesture.LongPress()
    .minDuration(400)
    .onStart(() => {
      runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Medium);
    });

  // Combine gestures
  const composedGesture = Gesture.Simultaneous(
    panGesture,
    Gesture.Exclusive(longPressGesture, tapGesture)
  );

  // Animated styles
  const cardAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const containerAnimatedStyle = useAnimatedStyle(() => ({
    height: isRemoving.value ? itemHeight.value : undefined,
    opacity: itemOpacity.value,
    marginBottom: isRemoving.value ? 0 : 12,
  }));

  const deleteActionStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      translateX.value,
      [-SWIPE_THRESHOLD, -SWIPE_THRESHOLD * 0.5, 0],
      [1, 0.5, 0],
      Extrapolation.CLAMP
    );
    const scale = interpolate(
      translateX.value,
      [-DELETE_THRESHOLD, -SWIPE_THRESHOLD, 0],
      [1.2, 1, 0.8],
      Extrapolation.CLAMP
    );
    return {
      opacity,
      transform: [{ scale }],
    };
  });

  const editActionStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      translateX.value,
      [0, SWIPE_THRESHOLD * 0.5, SWIPE_THRESHOLD],
      [0, 0.5, 1],
      Extrapolation.CLAMP
    );
    const scale = interpolate(
      translateX.value,
      [0, SWIPE_THRESHOLD],
      [0.8, 1],
      Extrapolation.CLAMP
    );
    return {
      opacity,
      transform: [{ scale }],
    };
  });

  const statusInfo = getStatusInfo();

  return (
    <GestureHandlerRootView>
      <Animated.View style={containerAnimatedStyle} className="relative">
        {/* Background Actions */}
        <View className="absolute inset-0 flex-row">
          {/* Edit Action (Right swipe reveals left side) */}
          <Animated.View
            style={editActionStyle}
            className="h-full w-20 items-center justify-center rounded-l-xl bg-primary"
          >
            <Edit3 size={24} color="white" />
            <Text className="mt-1 text-xs font-medium text-white">Edit</Text>
          </Animated.View>

          {/* Spacer */}
          <View className="flex-1" />

          {/* Delete Action (Left swipe reveals right side) */}
          <Animated.View
            style={deleteActionStyle}
            className="h-full w-20 items-center justify-center rounded-r-xl bg-danger"
          >
            <Trash2 size={24} color="white" />
            <Text className="mt-1 text-xs font-medium text-white">Delete</Text>
          </Animated.View>
        </View>

        {/* Main Card */}
        <GestureDetector gesture={composedGesture}>
          <Animated.View
            style={cardAnimatedStyle}
            className={`overflow-hidden rounded-xl border border-border bg-card ${statusInfo.borderColor} border-l-4`}
          >
            <View className="p-4">
              {/* Header: Name and Status */}
              <View className="flex-row items-start justify-between">
                <View className="flex-1 pr-2">
                  <Text
                    className="text-base font-semibold text-foreground"
                    numberOfLines={1}
                  >
                    {medication.name}
                  </Text>
                  <View className="mt-1 flex-row items-center gap-2">
                    <Pill size={14} className="text-muted-foreground" />
                    <Text className="text-sm text-muted-foreground" numberOfLines={1}>
                      {medication.dosage} {medication.dosageUnit} • {medication.type}
                    </Text>
                  </View>
                </View>
                <Badge variant={statusInfo.variant} size="sm">
                  {statusInfo.label}
                </Badge>
              </View>

              {/* Next Dose */}
              <View className="mt-3 flex-row items-center gap-2">
                <Clock size={14} className="text-muted-foreground" />
                <Text className="text-xs text-muted-foreground">{getNextDoseTime()}</Text>
              </View>

              {/* Frequency */}
              {medication.frequency && (
                <View className="mt-2">
                  <Text className="text-xs capitalize text-muted-foreground">
                    {medication.frequency.replace('-', ' ')}
                  </Text>
                </View>
              )}
            </View>
          </Animated.View>
        </GestureDetector>
      </Animated.View>
    </GestureHandlerRootView>
  );
}
