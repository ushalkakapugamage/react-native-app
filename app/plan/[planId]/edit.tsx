/**
 * Edit Plan Screen
 *
 * Edit plan details:
 * - Plan Name
 * - Medical Condition
 * - Prescribed By
 * - Prescription Date
 * - Prescription Image
 * - Notes
 */

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { useMedicationStore, useActivityStore } from '@/lib/stores';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import {
  ArrowLeft,
  Camera,
  Calendar,
  Stethoscope,
  User,
  FileText,
  X,
  Check,
} from 'lucide-react-native';
import { useState, useEffect } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  View,
  Image,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function EditPlanScreen() {
  const router = useRouter();
  const { planId } = useLocalSearchParams<{ planId: string }>();

  // Store
  const getPlanById = useMedicationStore((state) => state.getPlanById);
  const updatePlan = useMedicationStore((state) => state.updatePlan);
  const addActivity = useActivityStore((state) => state.addActivity);

  // Get plan data
  const plan = getPlanById(planId || '');

  // Form state - initialize from plan
  const [planName, setPlanName] = useState('');
  const [condition, setCondition] = useState('');
  const [prescribedBy, setPrescribedBy] = useState('');
  const [prescriptionDate, setPrescriptionDate] = useState<Date | undefined>(undefined);
  const [prescriptionImage, setPrescriptionImage] = useState<string | undefined>(undefined);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Initialize form from plan data
  useEffect(() => {
    if (plan) {
      setPlanName(plan.planName);
      setCondition(plan.condition || '');
      setPrescribedBy(plan.prescribedBy || '');
      setPrescriptionDate(plan.prescriptionDate ? new Date(plan.prescriptionDate) : undefined);
      setPrescriptionImage(plan.prescriptionImage);
      setNotes(plan.notes || '');
    }
  }, [plan]);

  // Redirect if plan not found
  useEffect(() => {
    if (!planId || !plan) {
      router.back();
    }
  }, [planId, plan, router]);

  // Validation
  const isValid = planName.trim().length > 0;

  /**
   * Handle image selection
   */
  const handleSelectImage = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    Alert.alert('Update Prescription', 'Choose an option', [
      {
        text: 'Take Photo',
        onPress: async () => {
          const { status } = await ImagePicker.requestCameraPermissionsAsync();
          if (status !== 'granted') {
            Alert.alert('Permission Denied', 'Camera permission is required.');
            return;
          }
          const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            quality: 0.8,
          });
          if (!result.canceled && result.assets[0]) {
            setPrescriptionImage(result.assets[0].uri);
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
          const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            quality: 0.8,
          });
          if (!result.canceled && result.assets[0]) {
            setPrescriptionImage(result.assets[0].uri);
          }
        },
      },
      ...(prescriptionImage
        ? [
            {
              text: 'Remove Image',
              style: 'destructive' as const,
              onPress: () => setPrescriptionImage(undefined),
            },
          ]
        : []),
      {
        text: 'Cancel',
        style: 'cancel',
      },
    ]);
  };

  /**
   * Handle date change
   */
  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setPrescriptionDate(selectedDate);
    }
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async () => {
    if (!isValid || !planId) {
      Alert.alert('Error', 'Please enter a plan name');
      return;
    }

    setIsSubmitting(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      updatePlan(planId, {
        planName: planName.trim(),
        condition: condition.trim() || undefined,
        prescribedBy: prescribedBy.trim() || undefined,
        prescriptionDate: prescriptionDate,
        prescriptionImage: prescriptionImage,
        notes: notes.trim() || undefined,
      });

      addActivity({
        type: 'medication_updated',
        title: 'Plan Updated',
        description: `Updated ${planName}`,
        metadata: { planId },
      });

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.back();
    } catch (error) {
      console.error('Failed to update plan:', error);
      Alert.alert('Error', 'Failed to update plan. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Format date for display
   */
  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

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
          <Text className="text-lg font-bold text-foreground">Edit Plan</Text>
          <View className="w-10" />
        </View>

        <ScrollView
          className="flex-1"
          contentContainerStyle={{ padding: 24 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Plan Name */}
          <Animated.View entering={FadeInDown.delay(100).duration(300)}>
            <Text className="mb-2 text-sm font-medium text-foreground">
              Plan Name <Text className="text-danger">*</Text>
            </Text>
            <Input
              placeholder="e.g., Diabetes Management"
              value={planName}
              onChangeText={setPlanName}
              leftIcon={<FileText size={20} className="text-muted-foreground" />}
            />
          </Animated.View>

          {/* Medical Condition */}
          <Animated.View entering={FadeInDown.delay(150).duration(300)} className="mt-6">
            <Text className="mb-2 text-sm font-medium text-foreground">
              Medical Condition
            </Text>
            <Input
              placeholder="e.g., Type 2 Diabetes"
              value={condition}
              onChangeText={setCondition}
              leftIcon={<Stethoscope size={20} className="text-muted-foreground" />}
            />
          </Animated.View>

          {/* Prescribed By */}
          <Animated.View entering={FadeInDown.delay(200).duration(300)} className="mt-6">
            <Text className="mb-2 text-sm font-medium text-foreground">
              Prescribed By
            </Text>
            <Input
              placeholder="Doctor's name"
              value={prescribedBy}
              onChangeText={setPrescribedBy}
              leftIcon={<User size={20} className="text-muted-foreground" />}
            />
          </Animated.View>

          {/* Prescription Date */}
          <Animated.View entering={FadeInDown.delay(250).duration(300)} className="mt-6">
            <Text className="mb-2 text-sm font-medium text-foreground">
              Prescription Date
            </Text>
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setShowDatePicker(true);
              }}
              className="flex-row items-center rounded-xl border border-border bg-card px-4 py-3"
            >
              <Calendar size={20} className="text-muted-foreground" />
              <Text className="ml-3 flex-1 text-foreground">
                {prescriptionDate ? formatDate(prescriptionDate) : 'Select date'}
              </Text>
              {prescriptionDate && (
                <Pressable
                  onPress={() => setPrescriptionDate(undefined)}
                  className="ml-2"
                >
                  <X size={18} className="text-muted-foreground" />
                </Pressable>
              )}
            </Pressable>

            {showDatePicker && (
              <DateTimePicker
                value={prescriptionDate || new Date()}
                mode="date"
                display="default"
                onChange={handleDateChange}
                maximumDate={new Date()}
              />
            )}
          </Animated.View>

          {/* Prescription Image */}
          <Animated.View entering={FadeInDown.delay(300).duration(300)} className="mt-6">
            <Text className="mb-2 text-sm font-medium text-foreground">
              Prescription Image
            </Text>
            {prescriptionImage ? (
              <View className="relative overflow-hidden rounded-xl border border-border">
                <Image
                  source={{ uri: prescriptionImage }}
                  className="h-48 w-full"
                  resizeMode="cover"
                />
                <Pressable
                  onPress={() => setPrescriptionImage(undefined)}
                  className="absolute right-2 top-2 h-8 w-8 items-center justify-center rounded-full bg-danger"
                >
                  <X size={18} color="white" />
                </Pressable>
                <Pressable
                  onPress={handleSelectImage}
                  className="absolute bottom-2 right-2 flex-row items-center rounded-full bg-primary px-4 py-2"
                >
                  <Camera size={16} color="white" />
                  <Text className="ml-2 text-sm font-medium text-white">Change</Text>
                </Pressable>
              </View>
            ) : (
              <Pressable
                onPress={handleSelectImage}
                className="h-32 items-center justify-center rounded-xl border-2 border-dashed border-border bg-muted/30"
              >
                <View className="mb-2 h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <Camera size={24} className="text-primary" />
                </View>
                <Text className="text-sm font-medium text-foreground">
                  Upload Prescription
                </Text>
                <Text className="mt-1 text-xs text-muted-foreground">
                  Take a photo or choose from gallery
                </Text>
              </Pressable>
            )}
          </Animated.View>

          {/* Notes */}
          <Animated.View entering={FadeInDown.delay(350).duration(300)} className="mt-6">
            <Text className="mb-2 text-sm font-medium text-foreground">Notes</Text>
            <Input
              placeholder="Additional notes about this plan..."
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={3}
              style={{ height: 80, textAlignVertical: 'top' }}
            />
          </Animated.View>

          {/* Spacer for button */}
          <View className="h-24" />
        </ScrollView>

        {/* Save Button */}
        <View className="absolute bottom-0 left-0 right-0 border-t border-border bg-background p-6">
          <Button
            onPress={handleSubmit}
            disabled={!isValid || isSubmitting}
            className="w-full"
          >
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
