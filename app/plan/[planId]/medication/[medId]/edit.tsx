/**
 * Edit Medication Screen
 *
 * Uses the shared MedicationForm component to edit a medication
 * within a plan.
 */

import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { MedicationForm, type MedicationFormData } from '@/components/features/medication/medication-form';
import { useMedicationStore, useActivityStore } from '@/lib/stores';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Check } from 'lucide-react-native';
import { useState, useEffect, useCallback } from 'react';
import { Alert, Pressable, View, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

export default function EditMedicationScreen() {
  const router = useRouter();
  const { planId, medId } = useLocalSearchParams<{ planId: string; medId: string }>();

  // Store
  const getPlanById = useMedicationStore((state) => state.getPlanById);
  const getMedicationById = useMedicationStore((state) => state.getMedicationById);
  const updateMedication = useMedicationStore((state) => state.updateMedication);
  const deleteMedication = useMedicationStore((state) => state.deleteMedication);
  const addActivity = useActivityStore((state) => state.addActivity);

  // State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

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
   * Handle form save
   */
  const handleSave = useCallback(
    async (data: MedicationFormData) => {
      if (!planId || !medId || !plan) return;

      setIsSubmitting(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      try {
        updateMedication(planId, medId, {
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
        });

        addActivity({
          type: 'medication_updated',
          title: 'Medication Updated',
          description: `Updated ${data.name} in ${plan.planName}`,
          metadata: { planId, medicationId: medId },
        });

        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        router.back();
      } catch (error) {
        console.error('Failed to update medication:', error);
        Alert.alert('Error', 'Failed to update medication. Please try again.');
      } finally {
        setIsSubmitting(false);
      }
    },
    [planId, medId, plan, updateMedication, addActivity, router]
  );

  /**
   * Handle delete
   */
  const handleDelete = useCallback(async () => {
    if (!planId || !medId || !plan || !medication) return;

    setIsDeleting(true);

    try {
      deleteMedication(planId, medId);

      addActivity({
        type: 'medication_taken',
        title: 'Medication Removed',
        description: `Removed ${medication.name} from ${plan.planName}`,
        metadata: { planId, medicationId: medId },
      });

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace(`/plan/${planId}`);
    } catch (error) {
      console.error('Failed to delete medication:', error);
      Alert.alert('Error', 'Failed to delete medication. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  }, [planId, medId, plan, medication, deleteMedication, addActivity, router]);

  if (!plan || !medication) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-background">
        <Text className="text-muted-foreground">Medication not found</Text>
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
              Edit Medication
            </Text>
            <Text className="text-center text-xs text-muted-foreground" numberOfLines={1}>
              {medication.name}
            </Text>
          </View>
          <View className="w-10" />
        </View>

        {/* Form */}
        <MedicationForm
          mode="edit"
          initialData={{
            ...medication,
            userId: '',
            prescriptionImage: undefined,
          } as any}
          onSave={handleSave}
          onDelete={handleDelete}
          isSubmitting={isSubmitting}
          isDeleting={isDeleting}
        />

        {/* Save Button */}
        <View className="border-t border-border bg-background p-4">
          <Button disabled={isSubmitting || isDeleting} className="w-full">
            {isSubmitting ? (
              <Text className="font-semibold text-white">Saving...</Text>
            ) : (
              <View className="flex-row items-center">
                <Check size={20} color="white" />
                <Text className="ml-2 font-semibold text-white">Save Changes</Text>
              </View>
            )}
          </Button>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
