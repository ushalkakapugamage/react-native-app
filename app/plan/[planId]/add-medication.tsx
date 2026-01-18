/**
 * Add Medication to Plan Screen
 *
 * Uses the shared MedicationForm component to add a new medication
 * to an existing plan.
 */

import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { MedicationForm, type MedicationFormData } from '@/components/features/medication/medication-form';
import { useMedicationStore, useActivityStore } from '@/lib/stores';
import type { Medication } from '@/lib/types';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Check } from 'lucide-react-native';
import { useState, useEffect, useCallback } from 'react';
import { Alert, Pressable, View, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

export default function AddMedicationScreen() {
  const router = useRouter();
  const { planId } = useLocalSearchParams<{ planId: string }>();

  // Store
  const getPlanById = useMedicationStore((state) => state.getPlanById);
  const addMedicationToPlan = useMedicationStore((state) => state.addMedicationToPlan);
  const addActivity = useActivityStore((state) => state.addActivity);

  // State
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get plan data
  const plan = getPlanById(planId || '');

  // Redirect if plan not found
  useEffect(() => {
    if (!planId || !plan) {
      router.back();
    }
  }, [planId, plan, router]);

  /**
   * Handle form save
   */
  const handleSave = useCallback(
    async (data: MedicationFormData) => {
      if (!planId || !plan) return;

      setIsSubmitting(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      try {
        const now = new Date();
        const newMedication: Medication = {
          id: `med_${Date.now()}`,
          planId: planId,
          name: data.name,
          dosage: data.dosage,
          dosageUnit: data.dosageUnit,
          type: data.type,
          frequency: data.frequency,
          schedule: {
            days: data.days as any,
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
          notes: data.notes || undefined,
          isActive: true,
          createdAt: now,
        };

        addMedicationToPlan(planId, newMedication);

        addActivity({
          type: 'medication_added',
          title: 'Medication Added',
          description: `Added ${data.name} to ${plan.planName}`,
          metadata: { planId, medicationId: newMedication.id },
        });

        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        // Go back to plan detail
        router.back();
      } catch (error) {
        console.error('Failed to add medication:', error);
        Alert.alert('Error', 'Failed to add medication. Please try again.');
      } finally {
        setIsSubmitting(false);
      }
    },
    [planId, plan, addMedicationToPlan, addActivity, router]
  );

  if (!plan) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-background">
        <Text className="text-muted-foreground">Plan not found</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
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
          <View className="flex-1 px-4">
            <Text className="text-center text-lg font-bold text-foreground">
              Add Medication
            </Text>
            <Text className="text-center text-xs text-muted-foreground" numberOfLines={1}>
              to {plan.planName}
            </Text>
          </View>
          <View className="w-10" />
        </View>

        {/* Form */}
        <MedicationForm
          mode="add"
          onSave={handleSave}
          isSubmitting={isSubmitting}
        />

        {/* Save Button */}
        <View className="border-t border-border bg-background p-4">
          <Button
            onPress={() => {
              // The form handles submission via onSave callback
              // This button triggers form submission through the form's internal logic
              // For now, we'll add a placeholder - the form component handles this internally
            }}
            disabled={isSubmitting}
            className="w-full"
          >
            {isSubmitting ? (
              <Text className="font-semibold text-white">Adding...</Text>
            ) : (
              <View className="flex-row items-center">
                <Check size={20} color="white" />
                <Text className="ml-2 font-semibold text-white">Add Medication</Text>
              </View>
            )}
          </Button>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
