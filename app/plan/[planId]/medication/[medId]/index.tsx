/**
 * Medication Detail Screen
 *
 * Shows detailed information about a specific medication within a plan.
 */

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Text } from '@/components/ui/text';
import { useMedicationStore, useActivityStore } from '@/lib/stores';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  ArrowLeft,
  Edit3,
  Trash2,
  Pill,
  Clock,
  Calendar,
  Bell,
  FileText,
  Pause,
  Play,
} from 'lucide-react-native';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { Alert, Pressable, ScrollView, View } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

export default function MedicationDetailScreen() {
  const router = useRouter();
  const { planId, medId } = useLocalSearchParams<{ planId: string; medId: string }>();

  // Store
  const getPlanById = useMedicationStore((state) => state.getPlanById);
  const getMedicationById = useMedicationStore((state) => state.getMedicationById);
  const updateMedication = useMedicationStore((state) => state.updateMedication);
  const deleteMedication = useMedicationStore((state) => state.deleteMedication);
  const addActivity = useActivityStore((state) => state.addActivity);

  // Get data
  const plan = getPlanById(planId || '');
  const medication = getMedicationById(planId || '', medId || '');

  // Redirect if not found
  useEffect(() => {
    if (!planId || !medId || !plan || !medication) {
      router.back();
    }
  }, [planId, medId, plan, medication, router]);

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
   * Format date
   */
  const formatDate = (date: Date | undefined): string => {
    if (!date) return 'Not set';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  /**
   * Get day names
   */
  const getDayNames = useMemo(() => {
    const days = medication?.schedule.days || [];
    if (days.length === 7) return 'Every day';
    if (days.length === 0) return 'As needed';
    return days.map((d) => d.charAt(0).toUpperCase() + d.slice(1, 3)).join(', ');
  }, [medication?.schedule.days]);

  /**
   * Get meal timing label
   */
  const getMealTimingLabel = (): string => {
    switch (medication?.schedule.beforeAfterMeal) {
      case 'before':
        return 'Before meals';
      case 'after':
        return 'After meals';
      case 'with':
        return 'With meals';
      default:
        return 'Anytime';
    }
  };

  /**
   * Handle edit
   */
  const handleEdit = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push(`/plan/${planId}/medication/${medId}/edit`);
  };

  /**
   * Handle toggle active
   */
  const handleToggleActive = () => {
    if (!planId || !medId || !medication) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    updateMedication(planId, medId, { isActive: !medication.isActive });

    addActivity({
      type: 'medication_updated',
      title: medication.isActive ? 'Medication Paused' : 'Medication Resumed',
      description: `${medication.name} has been ${medication.isActive ? 'paused' : 'resumed'}`,
    });
  };

  /**
   * Handle delete
   */
  const handleDelete = () => {
    if (!planId || !medId || !medication || !plan) return;

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);

    Alert.alert(
      'Delete Medication',
      `Are you sure you want to remove "${medication.name}" from ${plan.planName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteMedication(planId, medId);
            addActivity({
              type: 'medication_taken',
              title: 'Medication Removed',
              description: `Removed ${medication.name} from ${plan.planName}`,
            });
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            router.back();
          },
        },
      ]
    );
  };

  if (!plan || !medication) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-background">
        <Text className="text-muted-foreground">Medication not found</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      {/* Header */}
      <View className="flex-row items-center justify-between border-b border-border px-4 py-3">
        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.back();
          }}
          className="h-10 w-10 items-center justify-center rounded-full active:bg-muted"
        >
          <ArrowLeft size={24} className="text-foreground" />
        </Pressable>
        <Text className="text-lg font-bold text-foreground">Medication Details</Text>
        <Pressable
          onPress={handleEdit}
          className="h-10 w-10 items-center justify-center rounded-full active:bg-muted"
        >
          <Edit3 size={20} className="text-foreground" />
        </Pressable>
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 24 }}
      >
        {/* Header Card */}
        <Animated.View entering={FadeInDown.delay(100).duration(300)}>
          <View className="items-center rounded-xl border border-border bg-card p-6">
            <View className="mb-4 h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Pill size={32} className="text-primary" />
            </View>
            <Text className="text-2xl font-bold text-foreground">{medication.name}</Text>
            <Text className="mt-1 text-lg text-muted-foreground">
              {medication.dosage} {medication.dosageUnit}
            </Text>
            <Badge
              variant={medication.isActive ? 'success' : 'default'}
              size="md"
              className="mt-3"
            >
              {medication.isActive ? 'Active' : 'Paused'}
            </Badge>
            <Text className="mt-2 text-sm text-muted-foreground">
              Part of: {plan.planName}
            </Text>
          </View>
        </Animated.View>

        {/* Schedule Section */}
        <Animated.View entering={FadeInDown.delay(150).duration(300)} className="mt-6">
          <Text className="mb-3 text-lg font-bold text-foreground">Schedule</Text>
          <View className="rounded-xl border border-border bg-card">
            {/* Type */}
            <View className="flex-row items-center border-b border-border p-4">
              <Pill size={20} className="text-muted-foreground" />
              <View className="ml-3 flex-1">
                <Text className="text-sm text-muted-foreground">Type</Text>
                <Text className="text-base font-medium capitalize text-foreground">
                  {medication.type}
                </Text>
              </View>
            </View>

            {/* Frequency */}
            <View className="flex-row items-center border-b border-border p-4">
              <Calendar size={20} className="text-muted-foreground" />
              <View className="ml-3 flex-1">
                <Text className="text-sm text-muted-foreground">Frequency</Text>
                <Text className="text-base font-medium capitalize text-foreground">
                  {medication.frequency.replace('-', ' ')}
                </Text>
              </View>
            </View>

            {/* Days */}
            <View className="flex-row items-center border-b border-border p-4">
              <Calendar size={20} className="text-muted-foreground" />
              <View className="ml-3 flex-1">
                <Text className="text-sm text-muted-foreground">Days</Text>
                <Text className="text-base font-medium text-foreground">{getDayNames}</Text>
              </View>
            </View>

            {/* Times */}
            <View className="flex-row items-center border-b border-border p-4">
              <Clock size={20} className="text-muted-foreground" />
              <View className="ml-3 flex-1">
                <Text className="text-sm text-muted-foreground">Times</Text>
                <Text className="text-base font-medium text-foreground">
                  {medication.schedule.times.map(formatTime).join(', ') || 'Not set'}
                </Text>
              </View>
            </View>

            {/* Meal Timing */}
            <View className="flex-row items-center p-4">
              <FileText size={20} className="text-muted-foreground" />
              <View className="ml-3 flex-1">
                <Text className="text-sm text-muted-foreground">Meal Timing</Text>
                <Text className="text-base font-medium text-foreground">
                  {getMealTimingLabel()}
                </Text>
              </View>
            </View>
          </View>
        </Animated.View>

        {/* Dates Section */}
        <Animated.View entering={FadeInDown.delay(200).duration(300)} className="mt-6">
          <Text className="mb-3 text-lg font-bold text-foreground">Dates</Text>
          <View className="rounded-xl border border-border bg-card">
            <View className="flex-row items-center border-b border-border p-4">
              <Calendar size={20} className="text-muted-foreground" />
              <View className="ml-3 flex-1">
                <Text className="text-sm text-muted-foreground">Start Date</Text>
                <Text className="text-base font-medium text-foreground">
                  {formatDate(medication.startDate)}
                </Text>
              </View>
            </View>

            <View className="flex-row items-center p-4">
              <Calendar size={20} className="text-muted-foreground" />
              <View className="ml-3 flex-1">
                <Text className="text-sm text-muted-foreground">End Date</Text>
                <Text className="text-base font-medium text-foreground">
                  {medication.endDate ? formatDate(medication.endDate) : 'Ongoing'}
                </Text>
              </View>
            </View>
          </View>
        </Animated.View>

        {/* Reminders Section */}
        <Animated.View entering={FadeInDown.delay(250).duration(300)} className="mt-6">
          <Text className="mb-3 text-lg font-bold text-foreground">Reminders</Text>
          <View className="rounded-xl border border-border bg-card p-4">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <Bell size={20} className="text-muted-foreground" />
                <Text className="ml-3 text-base font-medium text-foreground">
                  {medication.reminders.enabled ? 'Enabled' : 'Disabled'}
                </Text>
              </View>
              <Badge variant={medication.reminders.enabled ? 'success' : 'default'} size="sm">
                {medication.reminders.enabled ? 'On' : 'Off'}
              </Badge>
            </View>
            {medication.reminders.enabled && (
              <View className="mt-3 rounded-lg bg-muted/50 p-3">
                <Text className="text-sm text-muted-foreground">
                  Remind {medication.reminders.minutesBefore}min before
                  {medication.reminders.onTime && ', at time'}
                  {medication.reminders.minutesAfter > 0 &&
                    `, and ${medication.reminders.minutesAfter}min after`}
                </Text>
              </View>
            )}
          </View>
        </Animated.View>

        {/* Notes Section */}
        {medication.notes && (
          <Animated.View entering={FadeInDown.delay(300).duration(300)} className="mt-6">
            <Text className="mb-3 text-lg font-bold text-foreground">Notes</Text>
            <View className="rounded-xl border border-border bg-card p-4">
              <Text className="text-base text-foreground">{medication.notes}</Text>
            </View>
          </Animated.View>
        )}

        {/* Actions */}
        <Animated.View entering={FadeInDown.delay(350).duration(300)} className="mt-6 gap-3">
          <Button
            variant="outline"
            onPress={handleToggleActive}
            className="flex-row items-center justify-center"
          >
            {medication.isActive ? (
              <>
                <Pause size={18} className="text-foreground" />
                <Text className="ml-2 font-medium text-foreground">Pause Medication</Text>
              </>
            ) : (
              <>
                <Play size={18} className="text-foreground" />
                <Text className="ml-2 font-medium text-foreground">Resume Medication</Text>
              </>
            )}
          </Button>

          <Pressable
            onPress={handleDelete}
            className="flex-row items-center justify-center rounded-xl border border-danger bg-danger/10 p-4"
          >
            <Trash2 size={18} className="text-danger" />
            <Text className="ml-2 font-medium text-danger">Delete Medication</Text>
          </Pressable>
        </Animated.View>

        {/* Bottom spacing */}
        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
}
