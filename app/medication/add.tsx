/**
 * Add Medication Screen
 *
 * Uses the shared MedicationForm component for adding new medications.
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
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
import { useMedicationStore, useAuthStore, useActivityStore } from '@/lib/stores';
import type { DayOfWeek } from '@/lib/types';

// Icons
import { ChevronLeft, Save } from 'lucide-react-native';

export default function AddMedicationScreen() {
  const router = useRouter();

  // Stores
  const { user } = useAuthStore();
  const addMedication = useMedicationStore((state) => state.addMedication);
  const medications = useMedicationStore((state) => state.medications);
  const addActivity = useActivityStore((state) => state.addActivity);

  // State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  /**
   * Handle back navigation
   */
  const handleBack = useCallback(() => {
    if (hasUnsavedChanges) {
      Alert.alert(
        'Discard changes?',
        'Your medication will not be saved.',
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
   * Check for duplicate medication
   */
  const checkDuplicate = useCallback(
    (name: string): boolean => {
      return medications.some(
        (med) => med.name.toLowerCase() === name.toLowerCase()
      );
    },
    [medications]
  );

  /**
   * Save medication
   */
  const handleSave = async (data: MedicationFormData) => {
    // Check for duplicate
    if (checkDuplicate(data.name)) {
      return new Promise<void>((resolve, reject) => {
        Alert.alert(
          'Duplicate Medication',
          `You already have a medication named "${data.name}". Do you want to add it anyway?`,
          [
            { text: 'Cancel', style: 'cancel', onPress: () => reject() },
            {
              text: 'Add Anyway',
              onPress: async () => {
                await saveMedication(data);
                resolve();
              },
            },
          ]
        );
      });
    }

    await saveMedication(data);
  };

  const saveMedication = async (data: MedicationFormData) => {
    setIsSubmitting(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      // Generate unique ID
      const medicationId = `med_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Create medication object
      const medication = {
        id: medicationId,
        userId: user?.id || 'anonymous',
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
        isActive: true,
        createdAt: new Date(),
      };

      // Add to store
      addMedication(medication);

      // Add activity
      addActivity({
        type: 'medication_added',
        title: 'Medication Added',
        description: `Added ${medication.name} ${medication.dosage}${medication.dosageUnit}`,
        metadata: { medicationId },
      });

      // TODO: Schedule notifications if reminders enabled
      // if (data.remindersEnabled) {
      //   await scheduleMedicationReminders(medication);
      // }

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Success', 'Medication added successfully!', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error) {
      console.error('Failed to add medication:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Error', 'Failed to add medication. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

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
            Add Medication
          </Text>

          <Button
            size="sm"
            onPress={() => {
              // Trigger form submission via ref or context
              // For now, this is handled by the form's internal submit
            }}
            disabled={isSubmitting}
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
          mode="add"
          onSave={handleSave}
          isSubmitting={isSubmitting}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
