/**
 * Medication Form Component
 *
 * Shared form component for adding and editing medications.
 * Features:
 * - All form sections (basic info, schedule, reminders, additional)
 * - Validation with zod + react-hook-form
 * - Image upload for prescriptions
 * - Date/time pickers
 * - Edit mode with pre-populated data
 * - Delete functionality (edit mode only)
 *
 * Future enhancements:
 * - OCR to extract medication info from prescription image
 * - Drug interaction warnings
 * - Medication name autocomplete from database
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Pressable,
  Switch,
  Modal,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import Animated, {
  FadeIn,
  FadeInDown,
  SlideInDown,
} from 'react-native-reanimated';

// Components
import { Text } from '@/components/ui/text';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { DaySelector, getAllDays } from '@/components/features/medication/day-selector';
import { TimePickerInput, DEFAULT_TIMES } from '@/components/features/medication/time-picker-input';

// Types
import type {
  DayOfWeek,
  MedicationType,
  DosageUnit,
  MedicationFrequency,
  MealTiming,
  Medication,
} from '@/lib/types';

// Icons
import {
  Camera,
  Pill,
  Droplets,
  Syringe,
  Wind,
  Sparkles,
  Eye,
  X,
  Calendar,
  Info,
  Trash2,
  AlertTriangle,
} from 'lucide-react-native';

// ==================== Constants ====================

const MEDICATION_TYPES: { value: MedicationType; label: string; icon: any }[] = [
  { value: 'tablet', label: 'Tablet', icon: Pill },
  { value: 'syrup', label: 'Syrup', icon: Droplets },
  { value: 'injection', label: 'Injection', icon: Syringe },
  { value: 'drops', label: 'Drops', icon: Eye },
  { value: 'inhaler', label: 'Inhaler', icon: Wind },
  { value: 'cream', label: 'Cream', icon: Sparkles },
];

const DOSAGE_UNITS: { value: DosageUnit; label: string }[] = [
  { value: 'mg', label: 'mg' },
  { value: 'ml', label: 'ml' },
  { value: 'tablets', label: 'tablets' },
  { value: 'drops', label: 'drops' },
  { value: 'puffs', label: 'puffs' },
];

const FREQUENCIES: { value: MedicationFrequency; label: string; description: string }[] = [
  { value: 'daily', label: 'Daily', description: 'Every day' },
  { value: 'weekly', label: 'Weekly', description: 'Specific days' },
  { value: 'monthly', label: 'Monthly', description: 'Once a month' },
  { value: 'as-needed', label: 'As Needed', description: 'When required' },
];

const MEAL_TIMINGS: { value: MealTiming; label: string }[] = [
  { value: 'before', label: 'Before Meal' },
  { value: 'with', label: 'With Meal' },
  { value: 'after', label: 'After Meal' },
  { value: 'anytime', label: 'Anytime' },
];

const REMINDER_MINUTES = [5, 10, 15, 30, 60];

// ==================== Validation Schema ====================

const medicationSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters'),
  type: z.enum(['tablet', 'syrup', 'injection', 'drops', 'inhaler', 'cream']),
  dosage: z
    .string()
    .min(1, 'Dosage is required')
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, 'Must be a positive number'),
  dosageUnit: z.enum(['mg', 'ml', 'tablets', 'drops', 'puffs']),
  frequency: z.enum(['daily', 'weekly', 'monthly', 'as-needed']),
  days: z.array(z.string()).min(1, 'Select at least one day'),
  times: z.array(z.string()).min(1, 'Add at least one time'),
  mealTiming: z.enum(['before', 'with', 'after', 'anytime']),
  startDate: z.date(),
  endDate: z.date().optional().nullable(),
  hasEndDate: z.boolean(),
  remindersEnabled: z.boolean(),
  minutesBefore: z.number().min(0).max(60),
  onTimeReminder: z.boolean(),
  minutesAfter: z.number().min(0).max(60),
  notes: z.string().max(500, 'Notes must be less than 500 characters').optional(),
  doctorName: z.string().max(100, 'Doctor name must be less than 100 characters').optional(),
  refillEnabled: z.boolean(),
  refillDays: z.number().min(1).max(90).optional(),
  prescriptionImage: z.string().optional().nullable(),
});

export type MedicationFormData = z.infer<typeof medicationSchema>;

// ==================== Props Interface ====================

interface MedicationFormProps {
  mode: 'add' | 'edit';
  initialData?: Medication;
  onSave: (data: MedicationFormData) => Promise<void>;
  onDelete?: () => void;
  isSubmitting?: boolean;
  isDeleting?: boolean;
}

// ==================== Component ====================

export function MedicationForm({
  mode,
  initialData,
  onSave,
  onDelete,
  isSubmitting = false,
  isDeleting = false,
}: MedicationFormProps) {
  const scrollViewRef = useRef<ScrollView>(null);

  // Local state
  const [showDatePicker, setShowDatePicker] = useState<'start' | 'end' | null>(null);
  const [imageLoading, setImageLoading] = useState(false);
  const [showImagePreview, setShowImagePreview] = useState(false);

  // Convert initial medication data to form format
  const getDefaultValues = (): MedicationFormData => {
    if (initialData) {
      return {
        name: initialData.name,
        type: initialData.type,
        dosage: initialData.dosage,
        dosageUnit: initialData.dosageUnit,
        frequency: initialData.frequency,
        days: initialData.schedule.days,
        times: initialData.schedule.times,
        mealTiming: initialData.schedule.beforeAfterMeal || 'anytime',
        startDate: new Date(initialData.startDate),
        endDate: initialData.endDate ? new Date(initialData.endDate) : null,
        hasEndDate: !!initialData.endDate,
        remindersEnabled: initialData.reminders.enabled,
        minutesBefore: initialData.reminders.minutesBefore,
        onTimeReminder: initialData.reminders.onTime,
        minutesAfter: initialData.reminders.minutesAfter,
        notes: initialData.notes || '',
        doctorName: '',
        refillEnabled: false,
        refillDays: 7,
        prescriptionImage: initialData.prescriptionImage || null,
      };
    }

    return {
      name: '',
      type: 'tablet',
      dosage: '',
      dosageUnit: 'mg',
      frequency: 'daily',
      days: getAllDays(),
      times: DEFAULT_TIMES,
      mealTiming: 'anytime',
      startDate: new Date(),
      endDate: null,
      hasEndDate: false,
      remindersEnabled: true,
      minutesBefore: 15,
      onTimeReminder: true,
      minutesAfter: 15,
      notes: '',
      doctorName: '',
      refillEnabled: false,
      refillDays: 7,
      prescriptionImage: null,
    };
  };

  // Form setup
  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isDirty },
    reset,
  } = useForm<MedicationFormData>({
    resolver: zodResolver(medicationSchema),
    defaultValues: getDefaultValues(),
    mode: 'onBlur',
  });

  // Reset form when initialData changes (for edit mode)
  useEffect(() => {
    if (initialData) {
      reset(getDefaultValues());
    }
  }, [initialData?.id]);

  // Watched values
  const frequency = watch('frequency');
  const hasEndDate = watch('hasEndDate');
  const remindersEnabled = watch('remindersEnabled');
  const onTimeReminder = watch('onTimeReminder');
  const refillEnabled = watch('refillEnabled');
  const prescriptionImage = watch('prescriptionImage');
  const notes = watch('notes');
  const startDate = watch('startDate');

  // Check if medication has already started (for edit mode warning)
  const hasStarted = mode === 'edit' && initialData && new Date(initialData.startDate) < new Date();

  // Update days when frequency changes
  useEffect(() => {
    if (frequency === 'daily') {
      setValue('days', getAllDays());
    } else if (frequency === 'as-needed') {
      setValue('days', getAllDays());
      setValue('times', ['08:00']);
    }
  }, [frequency, setValue]);

  /**
   * Handle image upload
   */
  const handleImageUpload = useCallback(async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    Alert.alert('Upload Prescription', 'Choose an option', [
      {
        text: 'Take Photo',
        onPress: async () => {
          const { status } = await ImagePicker.requestCameraPermissionsAsync();
          if (status !== 'granted') {
            Alert.alert('Permission Denied', 'Camera permission is required.');
            return;
          }

          setImageLoading(true);
          try {
            const result = await ImagePicker.launchCameraAsync({
              mediaTypes: ImagePicker.MediaTypeOptions.Images,
              allowsEditing: true,
              aspect: [4, 3],
              quality: 0.7,
            });

            if (!result.canceled && result.assets[0]) {
              setValue('prescriptionImage', result.assets[0].uri, { shouldDirty: true });
            }
          } catch (error) {
            Alert.alert('Error', 'Failed to capture image');
          } finally {
            setImageLoading(false);
          }
        },
      },
      {
        text: 'Choose from Library',
        onPress: async () => {
          const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
          if (status !== 'granted') {
            Alert.alert('Permission Denied', 'Photo library permission is required.');
            return;
          }

          setImageLoading(true);
          try {
            const result = await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ImagePicker.MediaTypeOptions.Images,
              allowsEditing: true,
              aspect: [4, 3],
              quality: 0.7,
            });

            if (!result.canceled && result.assets[0]) {
              setValue('prescriptionImage', result.assets[0].uri, { shouldDirty: true });
            }
          } catch (error) {
            Alert.alert('Error', 'Failed to select image');
          } finally {
            setImageLoading(false);
          }
        },
      },
      ...(prescriptionImage
        ? [
            {
              text: 'Remove Image',
              style: 'destructive' as const,
              onPress: () => setValue('prescriptionImage', null, { shouldDirty: true }),
            },
          ]
        : []),
      { text: 'Cancel', style: 'cancel' as const },
    ]);
  }, [prescriptionImage, setValue]);

  /**
   * Handle date picker change
   */
  const handleDateChange = useCallback(
    (event: DateTimePickerEvent, selectedDate?: Date) => {
      if (Platform.OS === 'android') {
        setShowDatePicker(null);
      }

      if (event.type === 'dismissed') {
        setShowDatePicker(null);
        return;
      }

      if (selectedDate) {
        if (showDatePicker === 'start') {
          setValue('startDate', selectedDate, { shouldDirty: true });
        } else if (showDatePicker === 'end') {
          setValue('endDate', selectedDate, { shouldDirty: true });
        }

        if (Platform.OS === 'android') {
          setShowDatePicker(null);
        }
      }
    },
    [showDatePicker, setValue]
  );

  /**
   * Format date for display
   */
  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  /**
   * Submit form
   */
  const onSubmit = async (data: MedicationFormData) => {
    await onSave(data);
  };

  /**
   * Handle form errors
   */
  const onError = (errors: any) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    Alert.alert('Validation Error', 'Please fix the errors before saving.');
  };

  /**
   * Handle delete confirmation
   */
  const handleDeletePress = () => {
    if (!onDelete) return;

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    Alert.alert(
      `Delete ${initialData?.name || 'Medication'}?`,
      'This will permanently delete this medication and cancel all reminders. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: onDelete,
        },
      ]
    );
  };

  // ==================== Render Helpers ====================

  const SectionHeader = ({
    title,
    subtitle,
    icon: Icon,
  }: {
    title: string;
    subtitle?: string;
    icon?: any;
  }) => (
    <View className="mb-4 flex-row items-center gap-3">
      {Icon && (
        <View className="h-10 w-10 items-center justify-center rounded-full bg-primary/10">
          <Icon size={20} className="text-primary" />
        </View>
      )}
      <View className="flex-1">
        <Text className="text-lg font-semibold text-foreground">{title}</Text>
        {subtitle && (
          <Text className="text-sm text-muted-foreground">{subtitle}</Text>
        )}
      </View>
    </View>
  );

  const TypeSelector = ({
    value,
    onChange,
  }: {
    value: MedicationType;
    onChange: (type: MedicationType) => void;
  }) => (
    <View className="flex-row flex-wrap gap-2">
      {MEDICATION_TYPES.map((type) => {
        const Icon = type.icon;
        const isSelected = value === type.value;
        return (
          <Pressable
            key={type.value}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onChange(type.value);
            }}
            className={`flex-row items-center gap-2 rounded-lg border px-3 py-2 ${
              isSelected
                ? 'border-primary bg-primary/10'
                : 'border-border bg-card'
            }`}
          >
            <Icon
              size={18}
              className={isSelected ? 'text-primary' : 'text-muted-foreground'}
            />
            <Text
              className={`text-sm ${
                isSelected ? 'font-semibold text-primary' : 'text-foreground'
              }`}
            >
              {type.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );

  const FrequencySelector = ({
    value,
    onChange,
  }: {
    value: MedicationFrequency;
    onChange: (freq: MedicationFrequency) => void;
  }) => (
    <View className="gap-2">
      {FREQUENCIES.map((freq) => {
        const isSelected = value === freq.value;
        return (
          <Pressable
            key={freq.value}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onChange(freq.value);
            }}
            className={`flex-row items-center justify-between rounded-lg border px-4 py-3 ${
              isSelected
                ? 'border-primary bg-primary/10'
                : 'border-border bg-card'
            }`}
          >
            <View>
              <Text
                className={`text-base ${
                  isSelected ? 'font-semibold text-primary' : 'text-foreground'
                }`}
              >
                {freq.label}
              </Text>
              <Text className="text-xs text-muted-foreground">
                {freq.description}
              </Text>
            </View>
            <View
              className={`h-6 w-6 items-center justify-center rounded-full border-2 ${
                isSelected ? 'border-primary bg-primary' : 'border-border'
              }`}
            >
              {isSelected && <View className="h-2 w-2 rounded-full bg-white" />}
            </View>
          </Pressable>
        );
      })}
    </View>
  );

  const MinutesSelector = ({
    value,
    onChange,
    enabled,
    label,
  }: {
    value: number;
    onChange: (min: number) => void;
    enabled: boolean;
    label: string;
  }) => (
    <View
      className={`gap-2 ${!enabled ? 'opacity-50' : ''}`}
      pointerEvents={enabled ? 'auto' : 'none'}
    >
      <Text className="text-sm text-muted-foreground">{label}</Text>
      <View className="flex-row gap-2">
        {REMINDER_MINUTES.map((min) => {
          const isSelected = value === min;
          return (
            <Pressable
              key={min}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                onChange(min);
              }}
              className={`rounded-lg border px-3 py-2 ${
                isSelected
                  ? 'border-primary bg-primary/10'
                  : 'border-border bg-card'
              }`}
            >
              <Text
                className={`text-sm ${
                  isSelected ? 'font-semibold text-primary' : 'text-foreground'
                }`}
              >
                {min}m
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );

  // ==================== Main Render ====================

  return (
    <>
      {/* Form Content */}
      <ScrollView
        ref={scrollViewRef}
        className="flex-1"
        contentContainerClassName="p-6 pb-20"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Started Warning (Edit Mode) */}
        {hasStarted && (
          <Animated.View entering={FadeIn.duration(300)} className="mb-4">
            <Card className="border-warning bg-warning/10" padding="md">
              <View className="flex-row items-center gap-3">
                <AlertTriangle size={20} className="text-warning" />
                <View className="flex-1">
                  <Text className="font-semibold text-warning">
                    Medication Already Started
                  </Text>
                  <Text className="text-xs text-muted-foreground">
                    Changes will only affect future doses, not past events.
                  </Text>
                </View>
              </View>
            </Card>
          </Animated.View>
        )}

        {/* Section 1: Basic Information */}
        <Animated.View entering={FadeInDown.delay(100).duration(400)}>
          <Card className="mb-6">
            <SectionHeader
              title="Basic Information"
              subtitle="Required details about the medication"
              icon={Pill}
            />

            {/* Prescription Image Upload */}
            <View className="mb-4">
              <Pressable
                onPress={handleImageUpload}
                disabled={imageLoading}
                className="items-center justify-center rounded-xl border-2 border-dashed border-primary/50 bg-primary/5 px-4 py-6"
              >
                {imageLoading ? (
                  <ActivityIndicator size="large" color="#72A8E8" />
                ) : prescriptionImage ? (
                  <View className="items-center">
                    <Image
                      source={{ uri: prescriptionImage }}
                      className="mb-2 h-24 w-32 rounded-lg"
                      resizeMode="cover"
                    />
                    <Text className="text-sm font-medium text-primary">
                      Tap to change or remove
                    </Text>
                  </View>
                ) : (
                  <>
                    <Camera size={32} className="mb-2 text-primary" />
                    <Text className="text-base font-semibold text-primary">
                      Upload Prescription
                    </Text>
                    <Text className="text-xs text-muted-foreground">
                      Take a photo or choose from gallery
                    </Text>
                  </>
                )}
              </Pressable>
              <View className="mt-2 flex-row items-center gap-2">
                <Info size={14} className="text-muted-foreground" />
                <Text className="text-xs text-muted-foreground">
                  Auto-fill from prescription coming soon
                </Text>
              </View>
            </View>

            {/* Medication Name */}
            <Controller
              control={control}
              name="name"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Medication Name *"
                  placeholder="e.g., Aspirin, Metformin"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.name?.message}
                  autoCapitalize="words"
                  returnKeyType="next"
                />
              )}
            />

            {/* Medication Type */}
            <View className="mt-4">
              <Text className="mb-2 text-sm font-medium text-foreground">
                Medication Type *
              </Text>
              <Controller
                control={control}
                name="type"
                render={({ field: { onChange, value } }) => (
                  <TypeSelector value={value} onChange={onChange} />
                )}
              />
              {errors.type && (
                <Text className="mt-1 text-sm text-danger">
                  {errors.type.message}
                </Text>
              )}
            </View>

            {/* Dosage */}
            <View className="mt-4 flex-row gap-3">
              <View className="flex-1">
                <Controller
                  control={control}
                  name="dosage"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Input
                      label="Dosage *"
                      placeholder="e.g., 500"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      error={errors.dosage?.message}
                      type="number"
                      keyboardType="numeric"
                    />
                  )}
                />
              </View>
              <View className="w-32">
                <Text className="mb-2 text-sm font-medium text-foreground">
                  Unit *
                </Text>
                <Controller
                  control={control}
                  name="dosageUnit"
                  render={({ field: { onChange, value } }) => (
                    <View className="flex-row flex-wrap gap-1">
                      {DOSAGE_UNITS.map((unit) => (
                        <Pressable
                          key={unit.value}
                          onPress={() => {
                            Haptics.impactAsync(
                              Haptics.ImpactFeedbackStyle.Light
                            );
                            onChange(unit.value);
                          }}
                          className={`rounded-lg border px-2 py-1.5 ${
                            value === unit.value
                              ? 'border-primary bg-primary/10'
                              : 'border-border bg-card'
                          }`}
                        >
                          <Text
                            className={`text-xs ${
                              value === unit.value
                                ? 'font-semibold text-primary'
                                : 'text-foreground'
                            }`}
                          >
                            {unit.label}
                          </Text>
                        </Pressable>
                      ))}
                    </View>
                  )}
                />
              </View>
            </View>
          </Card>
        </Animated.View>

        {/* Section 2: Schedule */}
        <Animated.View entering={FadeInDown.delay(200).duration(400)}>
          <Card className="mb-6">
            <SectionHeader
              title="Schedule"
              subtitle="When to take this medication"
              icon={Calendar}
            />

            {/* Frequency */}
            <View className="mb-4">
              <Text className="mb-2 text-sm font-medium text-foreground">
                Frequency *
              </Text>
              <Controller
                control={control}
                name="frequency"
                render={({ field: { onChange, value } }) => (
                  <FrequencySelector value={value} onChange={onChange} />
                )}
              />
            </View>

            {/* Days */}
            {(frequency === 'daily' || frequency === 'weekly') && (
              <View className="mb-4">
                <Text className="mb-2 text-sm font-medium text-foreground">
                  Days *
                </Text>
                <Controller
                  control={control}
                  name="days"
                  render={({ field: { onChange, value } }) => (
                    <DaySelector
                      selectedDays={value as DayOfWeek[]}
                      onDaysChange={onChange}
                      error={errors.days?.message}
                    />
                  )}
                />
              </View>
            )}

            {/* Times */}
            <View className="mb-4">
              <Text className="mb-2 text-sm font-medium text-foreground">
                Times *
              </Text>
              <Controller
                control={control}
                name="times"
                render={({ field: { onChange, value } }) => (
                  <TimePickerInput
                    times={value}
                    onTimesChange={onChange}
                    error={errors.times?.message}
                  />
                )}
              />
            </View>

            {/* Meal Timing */}
            <View className="mb-4">
              <Text className="mb-2 text-sm font-medium text-foreground">
                Take with Meals
              </Text>
              <Controller
                control={control}
                name="mealTiming"
                render={({ field: { onChange, value } }) => (
                  <View className="flex-row flex-wrap gap-2">
                    {MEAL_TIMINGS.map((timing) => {
                      const isSelected = value === timing.value;
                      return (
                        <Pressable
                          key={timing.value}
                          onPress={() => {
                            Haptics.impactAsync(
                              Haptics.ImpactFeedbackStyle.Light
                            );
                            onChange(timing.value);
                          }}
                          className={`rounded-lg border px-3 py-2 ${
                            isSelected
                              ? 'border-primary bg-primary/10'
                              : 'border-border bg-card'
                          }`}
                        >
                          <Text
                            className={`text-sm ${
                              isSelected
                                ? 'font-semibold text-primary'
                                : 'text-foreground'
                            }`}
                          >
                            {timing.label}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                )}
              />
            </View>

            {/* Start Date */}
            <View className="mb-4">
              <Text className="mb-2 text-sm font-medium text-foreground">
                Start Date *
              </Text>
              <Controller
                control={control}
                name="startDate"
                render={({ field: { value } }) => (
                  <Pressable
                    onPress={() => setShowDatePicker('start')}
                    className="flex-row items-center gap-3 rounded-lg border border-border bg-card px-4 py-3"
                  >
                    <Calendar size={20} className="text-primary" />
                    <Text className="text-base text-foreground">
                      {formatDate(value)}
                    </Text>
                  </Pressable>
                )}
              />
            </View>

            {/* End Date */}
            <View className="mb-4">
              <View className="mb-2 flex-row items-center justify-between">
                <Text className="text-sm font-medium text-foreground">
                  End Date
                </Text>
                <Controller
                  control={control}
                  name="hasEndDate"
                  render={({ field: { onChange, value } }) => (
                    <View className="flex-row items-center gap-2">
                      <Text className="text-sm text-muted-foreground">
                        Set end date
                      </Text>
                      <Switch
                        value={value}
                        onValueChange={(val) => {
                          Haptics.impactAsync(
                            Haptics.ImpactFeedbackStyle.Light
                          );
                          onChange(val);
                          if (val && !watch('endDate')) {
                            const endDate = new Date(startDate);
                            endDate.setMonth(endDate.getMonth() + 1);
                            setValue('endDate', endDate);
                          }
                        }}
                        trackColor={{ false: '#ccc', true: '#72A8E8' }}
                        thumbColor="white"
                      />
                    </View>
                  )}
                />
              </View>
              {hasEndDate && (
                <Controller
                  control={control}
                  name="endDate"
                  render={({ field: { value } }) => (
                    <Pressable
                      onPress={() => setShowDatePicker('end')}
                      className="flex-row items-center gap-3 rounded-lg border border-border bg-card px-4 py-3"
                    >
                      <Calendar size={20} className="text-primary" />
                      <Text className="text-base text-foreground">
                        {value ? formatDate(value) : 'Select end date'}
                      </Text>
                    </Pressable>
                  )}
                />
              )}
            </View>
          </Card>
        </Animated.View>

        {/* Section 3: Reminders */}
        <Animated.View entering={FadeInDown.delay(300).duration(400)}>
          <Card className="mb-6">
            <View className="mb-4 flex-row items-center justify-between">
              <SectionHeader
                title="Reminders"
                subtitle="Get notified to take your medication"
              />
              <Controller
                control={control}
                name="remindersEnabled"
                render={({ field: { onChange, value } }) => (
                  <Switch
                    value={value}
                    onValueChange={(val) => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      onChange(val);
                    }}
                    trackColor={{ false: '#ccc', true: '#72A8E8' }}
                    thumbColor="white"
                  />
                )}
              />
            </View>

            {remindersEnabled && (
              <Animated.View entering={FadeIn.duration(200)} className="gap-4">
                <Controller
                  control={control}
                  name="minutesBefore"
                  render={({ field: { onChange, value } }) => (
                    <MinutesSelector
                      value={value}
                      onChange={onChange}
                      enabled={true}
                      label="Remind me before"
                    />
                  )}
                />

                <View className="flex-row items-center justify-between rounded-lg border border-border bg-card px-4 py-3">
                  <Text className="text-base text-foreground">
                    On time reminder
                  </Text>
                  <Controller
                    control={control}
                    name="onTimeReminder"
                    render={({ field: { onChange, value } }) => (
                      <Switch
                        value={value}
                        onValueChange={(val) => {
                          Haptics.impactAsync(
                            Haptics.ImpactFeedbackStyle.Light
                          );
                          onChange(val);
                        }}
                        trackColor={{ false: '#ccc', true: '#72A8E8' }}
                        thumbColor="white"
                      />
                    )}
                  />
                </View>

                {onTimeReminder && (
                  <Controller
                    control={control}
                    name="minutesAfter"
                    render={({ field: { onChange, value } }) => (
                      <MinutesSelector
                        value={value}
                        onChange={onChange}
                        enabled={true}
                        label="Follow-up if not taken"
                      />
                    )}
                  />
                )}
              </Animated.View>
            )}
          </Card>
        </Animated.View>

        {/* Section 4: Additional Information */}
        <Animated.View entering={FadeInDown.delay(400).duration(400)}>
          <Card className="mb-6">
            <SectionHeader
              title="Additional Information"
              subtitle="Optional details"
              icon={Info}
            />

            <View className="mb-4">
              <Controller
                control={control}
                name="notes"
                render={({ field: { onChange, onBlur, value } }) => (
                  <View>
                    <Input
                      label="Notes"
                      placeholder="e.g., Take with water, Store in refrigerator"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      error={errors.notes?.message}
                      multiline
                      numberOfLines={3}
                      className="h-24"
                    />
                    <Text className="mt-1 text-right text-xs text-muted-foreground">
                      {notes?.length || 0}/500
                    </Text>
                  </View>
                )}
              />
            </View>

            <View className="mb-4">
              <Controller
                control={control}
                name="doctorName"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    label="Prescribing Doctor"
                    placeholder="e.g., Dr. Smith"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={errors.doctorName?.message}
                  />
                )}
              />
            </View>

            <View>
              <View className="mb-2 flex-row items-center justify-between">
                <Text className="text-sm font-medium text-foreground">
                  Refill Reminder
                </Text>
                <Controller
                  control={control}
                  name="refillEnabled"
                  render={({ field: { onChange, value } }) => (
                    <Switch
                      value={value}
                      onValueChange={(val) => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        onChange(val);
                      }}
                      trackColor={{ false: '#ccc', true: '#72A8E8' }}
                      thumbColor="white"
                    />
                  )}
                />
              </View>
              {refillEnabled && (
                <Controller
                  control={control}
                  name="refillDays"
                  render={({ field: { onChange, value } }) => (
                    <View className="flex-row items-center gap-2 rounded-lg border border-border bg-card px-4 py-3">
                      <Text className="text-base text-foreground">
                        Remind me
                      </Text>
                      <View className="flex-row items-center gap-2">
                        {[3, 5, 7, 14].map((days) => (
                          <Pressable
                            key={days}
                            onPress={() => {
                              Haptics.impactAsync(
                                Haptics.ImpactFeedbackStyle.Light
                              );
                              onChange(days);
                            }}
                            className={`rounded-lg border px-2 py-1 ${
                              value === days
                                ? 'border-primary bg-primary/10'
                                : 'border-border'
                            }`}
                          >
                            <Text
                              className={`text-sm ${
                                value === days
                                  ? 'font-semibold text-primary'
                                  : 'text-foreground'
                              }`}
                            >
                              {days}d
                            </Text>
                          </Pressable>
                        ))}
                      </View>
                      <Text className="text-base text-foreground">
                        before
                      </Text>
                    </View>
                  )}
                />
              )}
            </View>
          </Card>
        </Animated.View>

        {/* Delete Button (Edit Mode Only) */}
        {mode === 'edit' && onDelete && (
          <Animated.View entering={FadeInDown.delay(500).duration(400)}>
            <Pressable
              onPress={handleDeletePress}
              disabled={isDeleting || isSubmitting}
              className={`flex-row items-center justify-center gap-2 rounded-xl border border-danger bg-danger/10 px-4 py-4 ${
                isDeleting || isSubmitting ? 'opacity-50' : 'active:bg-danger/20'
              }`}
            >
              {isDeleting ? (
                <ActivityIndicator size="small" color="#EF5350" />
              ) : (
                <Trash2 size={20} className="text-danger" />
              )}
              <Text className="text-base font-semibold text-danger">
                Delete Medication
              </Text>
            </Pressable>
          </Animated.View>
        )}
      </ScrollView>

      {/* Date Pickers */}
      {Platform.OS === 'ios' && showDatePicker && (
        <Modal
          visible={true}
          transparent
          animationType="fade"
          onRequestClose={() => setShowDatePicker(null)}
        >
          <Pressable
            className="flex-1 items-center justify-end bg-black/50"
            onPress={() => setShowDatePicker(null)}
          >
            <Animated.View
              entering={SlideInDown.springify()}
              className="w-full rounded-t-3xl bg-background"
            >
              <View className="flex-row items-center justify-between border-b border-border px-6 py-4">
                <Pressable onPress={() => setShowDatePicker(null)}>
                  <Text className="text-base text-muted-foreground">Cancel</Text>
                </Pressable>
                <Text className="text-lg font-semibold text-foreground">
                  {showDatePicker === 'start' ? 'Start Date' : 'End Date'}
                </Text>
                <Pressable onPress={() => setShowDatePicker(null)}>
                  <Text className="text-base font-semibold text-primary">Done</Text>
                </Pressable>
              </View>
              <View className="px-4 py-6">
                <DateTimePicker
                  value={
                    showDatePicker === 'start'
                      ? startDate
                      : watch('endDate') || new Date()
                  }
                  mode="date"
                  display="spinner"
                  onChange={handleDateChange}
                  minimumDate={
                    showDatePicker === 'start' && mode === 'add'
                      ? new Date()
                      : showDatePicker === 'end'
                        ? new Date(startDate.getTime() + 86400000)
                        : undefined
                  }
                  textColor="#000"
                />
              </View>
            </Animated.View>
          </Pressable>
        </Modal>
      )}

      {Platform.OS === 'android' && showDatePicker && (
        <DateTimePicker
          value={
            showDatePicker === 'start'
              ? startDate
              : watch('endDate') || new Date()
          }
          mode="date"
          display="default"
          onChange={handleDateChange}
          minimumDate={
            showDatePicker === 'start' && mode === 'add'
              ? new Date()
              : showDatePicker === 'end'
                ? new Date(startDate.getTime() + 86400000)
                : undefined
          }
        />
      )}

      {/* Image Preview Modal */}
      {prescriptionImage && (
        <Modal
          visible={showImagePreview}
          transparent
          animationType="fade"
          onRequestClose={() => setShowImagePreview(false)}
        >
          <Pressable
            className="flex-1 items-center justify-center bg-black/90"
            onPress={() => setShowImagePreview(false)}
          >
            <Pressable
              className="absolute right-4 top-16 z-10 h-10 w-10 items-center justify-center rounded-full bg-white/20"
              onPress={() => setShowImagePreview(false)}
            >
              <X size={24} color="white" />
            </Pressable>
            <Image
              source={{ uri: prescriptionImage }}
              className="h-4/5 w-full"
              resizeMode="contain"
            />
          </Pressable>
        </Modal>
      )}
    </>
  );
}

// Export for external use
export { medicationSchema };
