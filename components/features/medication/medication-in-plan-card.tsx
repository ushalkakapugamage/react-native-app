/**
 * Medication In Plan Card Component
 *
 * Displays an individual medication within a plan with:
 * - Name, dosage, type
 * - Schedule (times)
 * - Next dose
 * - Status badge
 * - Actions (edit, delete)
 */

import { Badge } from '@/components/ui/badge';
import { Text } from '@/components/ui/text';
import type { Medication, MedicationPlan } from '@/lib/types';
import {
  Clock,
  Pill,
  Trash2,
  Edit3,
  ChevronRight,
  Calendar,
} from 'lucide-react-native';
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
import { useCallback, useMemo } from 'react';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SWIPE_THRESHOLD = 80;
const DELETE_THRESHOLD = SCREEN_WIDTH * 0.4;

interface MedicationInPlanCardProps {
  medication: Medication;
  planName?: string;
  onPress: () => void;
  onEdit: () => void;
  onDelete: () => void;
  showPlanName?: boolean;
}

export function MedicationInPlanCard({
  medication,
  planName,
  onPress,
  onEdit,
  onDelete,
  showPlanName = false,
}: MedicationInPlanCardProps) {
  const translateX = useSharedValue(0);

  /**
   * Get status info
   */
  const statusInfo = useMemo(() => {
    if (!medication.isActive) {
      return {
        label: 'Paused',
        variant: 'default' as const,
        dotColor: 'bg-gray-400',
      };
    }
    if (medication.endDate && new Date(medication.endDate) < new Date()) {
      return {
        label: 'Completed',
        variant: 'info' as const,
        dotColor: 'bg-info',
      };
    }
    return {
      label: 'Active',
      variant: 'success' as const,
      dotColor: 'bg-success',
    };
  }, [medication.isActive, medication.endDate]);

  /**
   * Get next dose time
   */
  const nextDoseTime = useMemo(() => {
    const times = medication.schedule?.times || [];
    if (times.length === 0) return 'No schedule';

    const now = new Date();
    const currentHour = now.getHours();
    const currentMinutes = now.getMinutes();
    const currentTimeMinutes = currentHour * 60 + currentMinutes;

    for (const time of times) {
      const [h, m] = time.split(':').map(Number);
      const timeMinutes = h * 60 + m;
      if (timeMinutes > currentTimeMinutes) {
        return `Today at ${formatTime(time)}`;
      }
    }

    if (times[0]) {
      return `Tomorrow at ${formatTime(times[0])}`;
    }

    return 'No upcoming doses';
  }, [medication.schedule]);

  /**
   * Get schedule summary
   */
  const scheduleSummary = useMemo(() => {
    const times = medication.schedule?.times || [];
    const days = medication.schedule?.days || [];

    if (times.length === 0) return 'As needed';

    const timesText = times.length === 1
      ? formatTime(times[0])
      : `${times.length} times daily`;

    if (days.length === 7) {
      return `Daily, ${timesText}`;
    } else if (days.length > 0) {
      return `${days.length} days/week, ${timesText}`;
    }

    return timesText;
  }, [medication.schedule]);

  /**
   * Format time to 12-hour
   */
  function formatTime(time24: string): string {
    const [hours, minutes] = time24.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const hours12 = hours % 12 || 12;
    return `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`;
  }

  /**
   * Get medication type icon color
   */
  const getTypeColor = () => {
    switch (medication.type) {
      case 'tablet':
      case 'capsule':
        return 'text-primary';
      case 'syrup':
        return 'text-info';
      case 'injection':
        return 'text-danger';
      case 'inhaler':
        return 'text-success';
      case 'drops':
        return 'text-warning';
      default:
        return 'text-muted-foreground';
    }
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
   * Pan gesture for swiping
   */
  const panGesture = Gesture.Pan()
    .activeOffsetX([-10, 10])
    .onUpdate((event) => {
      const clampedX = Math.max(
        -DELETE_THRESHOLD,
        Math.min(SWIPE_THRESHOLD, event.translationX)
      );
      translateX.value = clampedX;
    })
    .onEnd((event) => {
      const shouldDelete =
        event.translationX < -DELETE_THRESHOLD * 0.8 ||
        (event.translationX < -SWIPE_THRESHOLD && event.velocityX < -500);
      const shouldShowEdit =
        event.translationX > SWIPE_THRESHOLD * 0.8 ||
        (event.translationX > SWIPE_THRESHOLD * 0.5 && event.velocityX > 500);

      if (shouldDelete) {
        translateX.value = withTiming(-SCREEN_WIDTH, { duration: 200 }, () => {
          runOnJS(handleDelete)();
        });
      } else if (shouldShowEdit) {
        translateX.value = withSpring(SWIPE_THRESHOLD, {}, () => {
          runOnJS(handleEdit)();
        });
      } else if (Math.abs(event.translationX) > SWIPE_THRESHOLD * 0.3) {
        if (event.translationX > 0) {
          translateX.value = withSpring(SWIPE_THRESHOLD);
        } else {
          translateX.value = withSpring(-SWIPE_THRESHOLD);
        }
      } else {
        translateX.value = withSpring(0);
      }
    });

  /**
   * Tap gesture
   */
  const tapGesture = Gesture.Tap().onEnd(() => {
    if (Math.abs(translateX.value) < 10) {
      runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Light);
      runOnJS(onPress)();
    } else {
      translateX.value = withSpring(0);
    }
  });

  const composedGesture = Gesture.Simultaneous(panGesture, tapGesture);

  // Animated styles
  const cardAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const deleteActionStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      translateX.value,
      [-SWIPE_THRESHOLD, -SWIPE_THRESHOLD * 0.5, 0],
      [1, 0.5, 0],
      Extrapolation.CLAMP
    );
    return { opacity };
  });

  const editActionStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      translateX.value,
      [0, SWIPE_THRESHOLD * 0.5, SWIPE_THRESHOLD],
      [0, 0.5, 1],
      Extrapolation.CLAMP
    );
    return { opacity };
  });

  return (
    <GestureHandlerRootView>
      <View className="relative mb-3">
        {/* Background Actions */}
        <View className="absolute inset-0 flex-row">
          <Animated.View
            style={editActionStyle}
            className="h-full w-20 items-center justify-center rounded-l-xl bg-primary"
          >
            <Edit3 size={20} color="white" />
            <Text className="mt-1 text-xs text-white">Edit</Text>
          </Animated.View>

          <View className="flex-1" />

          <Animated.View
            style={deleteActionStyle}
            className="h-full w-20 items-center justify-center rounded-r-xl bg-danger"
          >
            <Trash2 size={20} color="white" />
            <Text className="mt-1 text-xs text-white">Delete</Text>
          </Animated.View>
        </View>

        {/* Main Card */}
        <GestureDetector gesture={composedGesture}>
          <Animated.View
            style={cardAnimatedStyle}
            className="overflow-hidden rounded-xl border border-border bg-card"
          >
            <View className="flex-row items-center p-4">
              {/* Status Dot */}
              <View className={`mr-3 h-3 w-3 rounded-full ${statusInfo.dotColor}`} />

              {/* Medication Icon */}
              <View className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-muted">
                <Pill size={20} className={getTypeColor()} />
              </View>

              {/* Medication Info */}
              <View className="flex-1">
                <Text className="text-base font-semibold text-foreground" numberOfLines={1}>
                  {medication.name}
                </Text>
                <Text className="mt-0.5 text-sm text-muted-foreground">
                  {medication.dosage} {medication.dosageUnit} • {medication.type}
                </Text>
                {showPlanName && planName && (
                  <Text className="mt-1 text-xs text-primary" numberOfLines={1}>
                    {planName}
                  </Text>
                )}
              </View>

              {/* Right Side: Badge and Arrow */}
              <View className="items-end gap-1">
                <Badge variant={statusInfo.variant} size="sm">
                  {statusInfo.label}
                </Badge>
                <View className="flex-row items-center gap-1">
                  <Clock size={12} className="text-muted-foreground" />
                  <Text className="text-xs text-muted-foreground">{scheduleSummary}</Text>
                </View>
              </View>

              <ChevronRight size={20} className="ml-2 text-muted-foreground" />
            </View>
          </Animated.View>
        </GestureDetector>
      </View>
    </GestureHandlerRootView>
  );
}
