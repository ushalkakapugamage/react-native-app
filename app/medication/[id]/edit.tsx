/**
 * Edit Medication Screen
 *
 * Uses the shared MedicationForm component for editing existing medications.
 * Loads medication data from store and pre-populates the form.
 */

import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Animated, { FadeIn } from 'react-native-reanimated';

// Components
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import {
  MedicationForm,
  type MedicationFormData,
} from '@/components/features/medication/medication-form';

// Store
import { useMedicationStore, useActivityStore } from '@/lib/stores';
import type { DayOfWeek, Medication } from '@/lib/types';

// Icons
import { ChevronLeft, Save, Trash2 } from 'lucide-react-native';

export default function EditMedicationScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  // Stores
  const getMedicationById = useMedicationStore((state) => state.getMedicationById);
  const updateMedication = useMedicationStore((state) => state.updateMedication);
  const deleteMedication = useMedicationStore((state) => state.deleteMedication);
  const addActivity = useActivityStore((state) => state.addActivity);

  // State
  const [medication, setMedication] = useState<Medication | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

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
   * Handle back navigation
   */
  const handleBack = useCallback(() => {
    if (hasUnsavedChanges) {
      Alert.alert(
        'Discard changes?',
        'Your changes will not be saved.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Discard',
            style: 'destructive',
            onPress: () => router.back(),
          },
        ]
      );
    } else {
      router.back();
    }
  }, [hasUnsavedChanges, router]);

  /**
   * Save medication changes
   */
  const handleSave = async (data: MedicationFormData) => {
    if (!medication) return;

    setIsSubmitting(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      // Create updated medication object
      const updates: Partial<Medication> = {
        name: data.name.trim(),
        dosage: data.dosage,
        dosageUnit: data.dosageUnit,
        type: data.type,
        frequency: data.frequency,
        schedule: {
          days: data.days as DayOfWeek[],
          times: data.times,
          beforeAfterMeal: data.mealTiming,
        },
        reminders: {
          enabled: data.remindersEnabled,
          minutesBefore: data.minutesBefore,
          onTime: data.onTimeReminder,
          minutesAfter: data.minutesAfter,
        },
        startDate: data.startDate,
        endDate: data.hasEndDate && data.endDate ? data.endDate : undefined,
        prescriptionImage: data.prescriptionImage || undefined,
        notes: data.notes?.trim() || undefined,
      };

      // Update in store
      updateMedication(medication.id, updates);

      // Add activity
      addActivity({
        type: 'medication_added', // Using this type for edits too
        title: 'Medication Updated',
        description: `Updated ${data.name} ${data.dosage}${data.dosageUnit}`,
        metadata: { medicationId: medication.id },
      });

      // TODO: Reschedule notifications if reminders changed
      // if (data.remindersEnabled) {
      //   await rescheduleMedicationReminders(medication.id, updates);
      // }

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Success', 'Medication updated successfully!', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error) {
      console.error('Failed to update medication:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Error', 'Failed to update medication. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

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
              // Delete from store
              deleteMedication(medication.id);

              // Add activity
              addActivity({
                type: 'medication_added',
                title: 'Medication Deleted',
                description: `Deleted ${medication.name}`,
                metadata: { medicationId: medication.id },
              });

              // TODO: Cancel scheduled notifications
              // await cancelMedicationReminders(medication.id);

              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

              // Navigate back to medications list
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

  // Error state (medication not found)
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

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        {/* Header */}
        <Animated.View
          entering={FadeIn.duration(300)}
          className="flex-row items-center justify-between border-b border-border bg-background px-4 py-3"
        >
          <Pressable
            onPress={handleBack}
            className="h-10 w-10 items-center justify-center rounded-full active:bg-muted"
          >
            <ChevronLeft size={24} className="text-foreground" />
          </Pressable>

          <Text className="text-lg font-semibold text-foreground">
            Edit Medication
          </Text>

          <Button
            size="sm"
            onPress={() => {
              // Trigger form submission via ref or context
              // For now, this is handled by the form's internal submit
            }}
            disabled={isSubmitting || isDeleting}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <>
                <Save size={18} color="white" />
                <Text className="ml-1 font-semibold text-white">Save</Text>
              </>
            )}
          </Button>
        </Animated.View>

        {/* Form */}
        <MedicationForm
          mode="edit"
          initialData={medication}
          onSave={handleSave}
          onDelete={handleDelete}
          isSubmitting={isSubmitting}
          isDeleting={isDeleting}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
