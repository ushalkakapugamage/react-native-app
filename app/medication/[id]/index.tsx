/**
 * Medication Detail Screen
 *
 * Displays detailed information about a specific medication.
 * Provides navigation to edit screen and quick actions.
 */

import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  ScrollView,
  Alert,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

// Components
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

// Store
import { useMedicationStore, useActivityStore } from '@/lib/stores';
import type { Medication, DayOfWeek } from '@/lib/types';

// Icons
import {
  ChevronLeft,
  Edit,
  Trash2,
  Pill,
  Droplets,
  Syringe,
  Wind,
  Sparkles,
  Eye,
  Calendar,
  Clock,
  Bell,
  AlertTriangle,
  Check,
  FileText,
  Utensils,
} from 'lucide-react-native';

// Day labels for display
const DAY_LABELS: Record<DayOfWeek, string> = {
  monday: 'Mon',
  tuesday: 'Tue',
  wednesday: 'Wed',
  thursday: 'Thu',
  friday: 'Fri',
  saturday: 'Sat',
  sunday: 'Sun',
};

// Medication type icons
const TYPE_ICONS: Record<string, any> = {
  tablet: Pill,
  syrup: Droplets,
  injection: Syringe,
  drops: Eye,
  inhaler: Wind,
  cream: Sparkles,
};

// Meal timing labels
const MEAL_LABELS: Record<string, string> = {
  before: 'Before Meal',
  with: 'With Meal',
  after: 'After Meal',
  anytime: 'Anytime',
};

/**
 * Format time string to 12-hour format
 */
const formatTime = (time24: string): string => {
  const [hours, minutes] = time24.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const hours12 = hours % 12 || 12;
  return `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`;
};

/**
 * Format date for display
 */
const formatDate = (date: Date | string): string => {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

export default function MedicationDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  // Stores
  const getMedicationById = useMedicationStore((state) => state.getMedicationById);
  const deleteMedication = useMedicationStore((state) => state.deleteMedication);
  const addActivity = useActivityStore((state) => state.addActivity);

  // State
  const [medication, setMedication] = useState<Medication | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  /**
   * Load medication data on mount
   */
  useEffect(() => {
    if (!id) {
      Alert.alert('Error', 'No medication ID provided', [
        { text: 'OK', onPress: () => router.back() },
      ]);
      return;
    }

    const loadedMedication = getMedicationById(id);

    if (!loadedMedication) {
      Alert.alert('Not Found', 'Medication not found. It may have been deleted.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
      return;
    }

    setMedication(loadedMedication);
    setIsLoading(false);
  }, [id, getMedicationById, router]);

  /**
   * Navigate to edit screen
   */
  const handleEdit = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/medication/${id}/edit`);
  }, [router, id]);

  /**
   * Delete medication
   */
  const handleDelete = useCallback(() => {
    if (!medication) return;

    Alert.alert(
      'Delete Medication',
      `Are you sure you want to delete "${medication.name}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setIsDeleting(true);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

            try {
              deleteMedication(medication.id);

              addActivity({
                type: 'medication_added',
                title: 'Medication Deleted',
                description: `Deleted ${medication.name}`,
                metadata: { medicationId: medication.id },
              });

              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              router.replace('/(tabs)/medications');
            } catch (error) {
              console.error('Failed to delete medication:', error);
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
              Alert.alert('Error', 'Failed to delete medication. Please try again.');
              setIsDeleting(false);
            }
          },
        },
      ]
    );
  }, [medication, deleteMedication, addActivity, router]);

  // Loading state
  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-background" edges={['top']}>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#6366f1" />
          <Text className="mt-4 text-muted-foreground">Loading medication...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Error state
  if (!medication) {
    return (
      <SafeAreaView className="flex-1 bg-background" edges={['top']}>
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-lg font-semibold text-foreground">
            Medication not found
          </Text>
          <Text className="mt-2 text-center text-muted-foreground">
            This medication may have been deleted.
          </Text>
          <Button className="mt-6" onPress={() => router.back()}>
            <Text className="font-semibold text-white">Go Back</Text>
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  const TypeIcon = TYPE_ICONS[medication.type] || Pill;

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      {/* Header */}
      <Animated.View
        entering={FadeIn.duration(300)}
        className="flex-row items-center justify-between border-b border-border bg-background px-4 py-3"
      >
        <Pressable
          onPress={() => router.back()}
          className="h-10 w-10 items-center justify-center rounded-full active:bg-muted"
        >
          <ChevronLeft size={24} className="text-foreground" />
        </Pressable>

        <Text className="text-lg font-semibold text-foreground">
          Medication Details
        </Text>

        <Pressable
          onPress={handleEdit}
          className="h-10 w-10 items-center justify-center rounded-full active:bg-muted"
        >
          <Edit size={20} className="text-primary" />
        </Pressable>
      </Animated.View>

      <ScrollView
        className="flex-1"
        contentContainerClassName="p-4 gap-4 pb-8"
        showsVerticalScrollIndicator={false}
      >
        {/* Medication Header Card */}
        <Animated.View entering={FadeInDown.duration(300).delay(100)}>
          <Card className="p-5">
            <View className="flex-row items-start gap-4">
              <View className="h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                <TypeIcon size={32} className="text-primary" />
              </View>
              <View className="flex-1">
                <Text className="text-xl font-bold text-foreground">
                  {medication.name}
                </Text>
                <Text className="mt-1 text-lg text-muted-foreground">
                  {medication.dosage} {medication.dosageUnit}
                </Text>
                <View className="mt-2 flex-row gap-2">
                  <Badge variant={medication.isActive ? 'default' : 'secondary'}>
                    <Text className="text-xs font-medium text-white">
                      {medication.isActive ? 'Active' : 'Inactive'}
                    </Text>
                  </Badge>
                  <Badge variant="outline">
                    <Text className="text-xs font-medium text-foreground capitalize">
                      {medication.frequency}
                    </Text>
                  </Badge>
                </View>
              </View>
            </View>
          </Card>
        </Animated.View>

        {/* Schedule Section */}
        <Animated.View entering={FadeInDown.duration(300).delay(200)}>
          <Card className="p-5">
            <View className="mb-4 flex-row items-center gap-2">
              <Calendar size={20} className="text-primary" />
              <Text className="text-base font-semibold text-foreground">Schedule</Text>
            </View>

            {/* Days */}
            <View className="mb-4">
              <Text className="mb-2 text-sm text-muted-foreground">Days</Text>
              <View className="flex-row flex-wrap gap-2">
                {medication.schedule.days.map((day) => (
                  <Badge key={day} variant="secondary">
                    <Text className="text-xs font-medium text-foreground">
                      {DAY_LABELS[day]}
                    </Text>
                  </Badge>
                ))}
              </View>
            </View>

            {/* Times */}
            <View className="mb-4">
              <Text className="mb-2 text-sm text-muted-foreground">Times</Text>
              <View className="flex-row flex-wrap gap-2">
                {medication.schedule.times.map((time, index) => (
                  <View
                    key={index}
                    className="flex-row items-center gap-1 rounded-lg bg-muted px-3 py-1.5"
                  >
                    <Clock size={14} className="text-muted-foreground" />
                    <Text className="text-sm font-medium text-foreground">
                      {formatTime(time)}
                    </Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Meal Timing */}
            {medication.schedule.beforeAfterMeal && (
              <View className="flex-row items-center gap-2">
                <Utensils size={16} className="text-muted-foreground" />
                <Text className="text-sm text-muted-foreground">
                  {MEAL_LABELS[medication.schedule.beforeAfterMeal]}
                </Text>
              </View>
            )}
          </Card>
        </Animated.View>

        {/* Duration Section */}
        <Animated.View entering={FadeInDown.duration(300).delay(300)}>
          <Card className="p-5">
            <View className="mb-4 flex-row items-center gap-2">
              <Calendar size={20} className="text-primary" />
              <Text className="text-base font-semibold text-foreground">Duration</Text>
            </View>

            <View className="gap-3">
              <View className="flex-row justify-between">
                <Text className="text-sm text-muted-foreground">Start Date</Text>
                <Text className="text-sm font-medium text-foreground">
                  {formatDate(medication.startDate)}
                </Text>
              </View>

              {medication.endDate && (
                <View className="flex-row justify-between">
                  <Text className="text-sm text-muted-foreground">End Date</Text>
                  <Text className="text-sm font-medium text-foreground">
                    {formatDate(medication.endDate)}
                  </Text>
                </View>
              )}

              {!medication.endDate && (
                <View className="flex-row items-center gap-2">
                  <AlertTriangle size={14} className="text-warning" />
                  <Text className="text-sm text-muted-foreground">
                    No end date set (ongoing medication)
                  </Text>
                </View>
              )}
            </View>
          </Card>
        </Animated.View>

        {/* Reminders Section */}
        <Animated.View entering={FadeInDown.duration(300).delay(400)}>
          <Card className="p-5">
            <View className="mb-4 flex-row items-center justify-between">
              <View className="flex-row items-center gap-2">
                <Bell size={20} className="text-primary" />
                <Text className="text-base font-semibold text-foreground">Reminders</Text>
              </View>
              <Badge variant={medication.reminders.enabled ? 'default' : 'secondary'}>
                <Text className="text-xs font-medium text-white">
                  {medication.reminders.enabled ? 'On' : 'Off'}
                </Text>
              </Badge>
            </View>

            {medication.reminders.enabled && (
              <View className="gap-2">
                {medication.reminders.minutesBefore > 0 && (
                  <View className="flex-row items-center gap-2">
                    <Check size={14} className="text-success" />
                    <Text className="text-sm text-muted-foreground">
                      {medication.reminders.minutesBefore} minutes before
                    </Text>
                  </View>
                )}
                {medication.reminders.onTime && (
                  <View className="flex-row items-center gap-2">
                    <Check size={14} className="text-success" />
                    <Text className="text-sm text-muted-foreground">At scheduled time</Text>
                  </View>
                )}
                {medication.reminders.minutesAfter > 0 && (
                  <View className="flex-row items-center gap-2">
                    <Check size={14} className="text-success" />
                    <Text className="text-sm text-muted-foreground">
                      {medication.reminders.minutesAfter} minutes after (if missed)
                    </Text>
                  </View>
                )}
              </View>
            )}
          </Card>
        </Animated.View>

        {/* Notes Section */}
        {medication.notes && (
          <Animated.View entering={FadeInDown.duration(300).delay(500)}>
            <Card className="p-5">
              <View className="mb-3 flex-row items-center gap-2">
                <FileText size={20} className="text-primary" />
                <Text className="text-base font-semibold text-foreground">Notes</Text>
              </View>
              <Text className="text-sm text-muted-foreground">{medication.notes}</Text>
            </Card>
          </Animated.View>
        )}

        {/* Action Buttons */}
        <Animated.View
          entering={FadeInDown.duration(300).delay(600)}
          className="gap-3 pt-2"
        >
          <Button onPress={handleEdit} className="w-full">
            <Edit size={18} color="white" />
            <Text className="ml-2 font-semibold text-white">Edit Medication</Text>
          </Button>

          <Button
            variant="outline"
            onPress={handleDelete}
            disabled={isDeleting}
            className="w-full border-danger"
          >
            {isDeleting ? (
              <ActivityIndicator size="small" color="#ef4444" />
            ) : (
              <>
                <Trash2 size={18} className="text-danger" />
                <Text className="ml-2 font-semibold text-danger">Delete Medication</Text>
              </>
            )}
          </Button>
        </Animated.View>

        {/* Metadata */}
        <Animated.View entering={FadeInDown.duration(300).delay(700)}>
          <View className="mt-2 items-center">
            <Text className="text-xs text-muted-foreground">
              Added on {formatDate(medication.createdAt)}
            </Text>
          </View>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}
