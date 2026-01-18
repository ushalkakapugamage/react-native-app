/**
 * Plan Card Component
 *
 * Displays a medication plan in the list with:
 * - Plan name, condition
 * - Number of medications
 * - Status badge
 * - Prescription image thumbnail (if exists)
 * - Next upcoming medication from this plan
 * - Swipe actions (left: delete, right: edit)
 * - Tap to view plan details
 */

import { Badge } from '@/components/ui/badge';
import { Text } from '@/components/ui/text';
import type { MedicationPlan } from '@/lib/types';
import {
  Clock,
  Pill,
  Trash2,
  Edit3,
  FileText,
  Stethoscope,
} from 'lucide-react-native';
import { View, Dimensions, Image } from 'react-native';
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

interface PlanCardProps {
  plan: MedicationPlan;
  onPress: () => void;
  onEdit: () => void;
  onDelete: () => void;
  nextMedicationTime?: string;
}

export function PlanCard({
  plan,
  onPress,
  onEdit,
  onDelete,
  nextMedicationTime,
}: PlanCardProps) {
  const translateX = useSharedValue(0);
  const itemHeight = useSharedValue(130);
  const itemOpacity = useSharedValue(1);
  const isRemoving = useSharedValue(false);

  /**
   * Get status info based on plan status
   */
  const statusInfo = useMemo(() => {
    switch (plan.status) {
      case 'active':
        return {
          label: 'Active',
          variant: 'success' as const,
          borderColor: 'border-l-[#4CAF50]',
        };
      case 'paused':
        return {
          label: 'Paused',
          variant: 'warning' as const,
          borderColor: 'border-l-[#FFA726]',
        };
      case 'completed':
        return {
          label: 'Completed',
          variant: 'info' as const,
          borderColor: 'border-l-[#72A8E8]',
        };
      default:
        return {
          label: 'Active',
          variant: 'success' as const,
          borderColor: 'border-l-[#4CAF50]',
        };
    }
  }, [plan.status]);

  /**
   * Get medication count text
   */
  const medicationCountText = useMemo(() => {
    const count = plan.medications?.length || 0;
    return count === 1 ? '1 medication' : `${count} medications`;
  }, [plan.medications]);

  /**
   * Get active medication count
   */
  const activeMedicationCount = useMemo(() => {
    return plan.medications?.filter((m) => m.isActive).length || 0;
  }, [plan.medications]);

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
   * Long press gesture
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

  return (
    <GestureHandlerRootView>
      <Animated.View style={containerAnimatedStyle} className="relative">
        {/* Background Actions */}
        <View className="absolute inset-0 flex-row">
          {/* Edit Action */}
          <Animated.View
            style={editActionStyle}
            className="h-full w-20 items-center justify-center rounded-l-xl bg-primary"
          >
            <Edit3 size={24} color="white" />
            <Text className="mt-1 text-xs font-medium text-white">Edit</Text>
          </Animated.View>

          <View className="flex-1" />

          {/* Delete Action */}
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
              {/* Header Row: Plan Info and Prescription Image */}
              <View className="flex-row items-start justify-between">
                {/* Left: Plan Info */}
                <View className="flex-1 pr-3">
                  {/* Plan Name */}
                  <Text
                    className="text-lg font-bold text-foreground"
                    numberOfLines={1}
                  >
                    {plan.planName}
                  </Text>

                  {/* Condition (if exists) */}
                  {plan.condition && (
                    <View className="mt-1 flex-row items-center gap-1.5">
                      <Stethoscope size={14} className="text-muted-foreground" />
                      <Text className="text-sm text-muted-foreground" numberOfLines={1}>
                        {plan.condition}
                      </Text>
                    </View>
                  )}

                  {/* Medication Count */}
                  <View className="mt-2 flex-row items-center gap-1.5">
                    <Pill size={14} className="text-primary" />
                    <Text className="text-sm font-medium text-foreground">
                      {medicationCountText}
                    </Text>
                    {activeMedicationCount > 0 && activeMedicationCount !== plan.medications.length && (
                      <Text className="text-xs text-muted-foreground">
                        ({activeMedicationCount} active)
                      </Text>
                    )}
                  </View>
                </View>

                {/* Right: Status Badge and Prescription Thumbnail */}
                <View className="items-end gap-2">
                  <Badge variant={statusInfo.variant} size="sm">
                    {statusInfo.label}
                  </Badge>

                  {/* Prescription Image Thumbnail */}
                  {plan.prescriptionImage ? (
                    <View className="h-12 w-12 overflow-hidden rounded-lg border border-border">
                      <Image
                        source={{ uri: plan.prescriptionImage }}
                        className="h-full w-full"
                        resizeMode="cover"
                      />
                    </View>
                  ) : (
                    <View className="h-12 w-12 items-center justify-center rounded-lg border border-dashed border-border bg-muted/30">
                      <FileText size={20} className="text-muted-foreground" />
                    </View>
                  )}
                </View>
              </View>

              {/* Footer: Next Dose and Doctor */}
              <View className="mt-3 flex-row items-center justify-between border-t border-border pt-3">
                {/* Next Medication Time */}
                {nextMedicationTime ? (
                  <View className="flex-row items-center gap-1.5">
                    <Clock size={14} className="text-warning" />
                    <Text className="text-xs text-muted-foreground">
                      Next: {nextMedicationTime}
                    </Text>
                  </View>
                ) : (
                  <View className="flex-row items-center gap-1.5">
                    <Clock size={14} className="text-muted-foreground" />
                    <Text className="text-xs text-muted-foreground">
                      No upcoming doses
                    </Text>
                  </View>
                )}

                {/* Prescribed By */}
                {plan.prescribedBy && (
                  <Text className="text-xs text-muted-foreground" numberOfLines={1}>
                    Dr. {plan.prescribedBy}
                  </Text>
                )}
              </View>
            </View>
          </Animated.View>
        </GestureDetector>
      </Animated.View>
    </GestureHandlerRootView>
  );
}
