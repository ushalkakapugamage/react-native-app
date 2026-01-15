/**
 * MediSync Multi-Step Onboarding Wizard
 *
 * 3-step onboarding process:
 * Step 1: Profile Setup (mandatory)
 * Step 2: Health Information (optional)
 * Step 3: Notification Preferences (optional)
 */

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { ProgressBar } from '@/components/features/onboarding/progress-bar';
import { StepIndicator } from '@/components/features/onboarding/step-indicator';
import { useAuthStore } from '@/lib/stores';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import * as Notifications from 'expo-notifications';
import {
  Camera,
  User,
  Calendar,
  Droplet,
  Ruler,
  Weight,
  Pill,
  AlertTriangle,
  Users,
  Bell,
  ChevronLeft,
} from 'lucide-react-native';
import { useState, useRef } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  View,
  Switch,
  Image,
  Keyboard,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Haptics from 'expo-haptics';
import Animated, {
  FadeInLeft,
  FadeInRight,
  FadeOutLeft,
  FadeOutRight,
} from 'react-native-reanimated';

type Gender = 'male' | 'female' | 'other' | 'prefer_not_to_say';
type BloodType = 'A+' | 'A-' | 'B+' | 'B-' | 'O+' | 'O-' | 'AB+' | 'AB-' | 'Unknown';
type HeightUnit = 'cm' | 'ft';
type WeightUnit = 'kg' | 'lbs';

interface ProfileData {
  photo?: string;
  name: string;
  dateOfBirth: Date;
  gender: Gender;
}

interface HealthData {
  allergies: string;
  bloodType: BloodType;
  heightCm: number | null;
  weightKg: number | null;
}

interface NotificationPreferences {
  medicationReminders: boolean;
  fallAlerts: boolean;
  familyNotifications: boolean;
  generalUpdates: boolean;
  reminderTimingMinutes: number;
}

export default function OnboardingScreen() {
  const router = useRouter();
  const { user, setUser } = useAuthStore();
  const [currentStep, setCurrentStep] = useState(1);
  const scrollViewRef = useRef<ScrollView>(null);

  // Step 1: Profile Data
  const [profileData, setProfileData] = useState<ProfileData>({
    photo: user?.avatar,
    name: user?.name || '',
    dateOfBirth: user?.dateOfBirth || new Date(),
    gender: (user?.gender as Gender) || 'prefer_not_to_say',
  });
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Step 2: Health Data
  const [healthData, setHealthData] = useState<HealthData>({
    allergies: user?.healthInfo?.allergies?.join(', ') || '',
    bloodType: (user?.healthInfo?.bloodType as BloodType) || 'Unknown',
    heightCm: user?.healthInfo?.height || null,
    weightKg: user?.healthInfo?.weight || null,
  });
  const [heightUnit, setHeightUnit] = useState<HeightUnit>('cm');
  const [weightUnit, setWeightUnit] = useState<WeightUnit>('kg');

  // Step 3: Notification Preferences
  const [notificationPrefs, setNotificationPrefs] = useState<NotificationPreferences>({
    medicationReminders: true,
    fallAlerts: true,
    familyNotifications: true,
    generalUpdates: true,
    reminderTimingMinutes: 15,
  });

  /**
   * Calculate age from date of birth
   */
  const calculateAge = (dob: Date): number => {
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  /**
   * Calculate BMI
   */
  const calculateBMI = (): number | null => {
    if (!healthData.heightCm || !healthData.weightKg) return null;
    const heightM = healthData.heightCm / 100;
    const bmi = healthData.weightKg / (heightM * heightM);
    return Math.round(bmi * 10) / 10;
  };

  /**
   * Get BMI interpretation
   */
  const getBMIInterpretation = (bmi: number): { label: string; color: string } => {
    if (bmi < 18.5) return { label: 'Underweight', color: 'text-info' };
    if (bmi < 25) return { label: 'Normal', color: 'text-success' };
    if (bmi < 30) return { label: 'Overweight', color: 'text-warning' };
    return { label: 'Obese', color: 'text-danger' };
  };

  /**
   * Handle profile photo selection
   */
  const handleSelectPhoto = async () => {
    Alert.alert('Profile Photo', 'Choose an option', [
      {
        text: 'Take Photo',
        onPress: async () => {
          const { status } = await ImagePicker.requestCameraPermissionsAsync();
          if (status !== 'granted') {
            Alert.alert('Permission Denied', 'Camera permission is required.');
            return;
          }
          const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.5,
          });
          if (!result.canceled && result.assets[0]) {
            setProfileData({ ...profileData, photo: result.assets[0].uri });
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
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.5,
          });
          if (!result.canceled && result.assets[0]) {
            setProfileData({ ...profileData, photo: result.assets[0].uri });
          }
        },
      },
      {
        text: 'Skip',
        style: 'cancel',
      },
    ]);
  };

  /**
   * Convert height from cm to feet/inches
   */
  const cmToFeet = (cm: number): { feet: number; inches: number } => {
    const totalInches = cm / 2.54;
    const feet = Math.floor(totalInches / 12);
    const inches = Math.round(totalInches % 12);
    return { feet, inches };
  };

  /**
   * Convert height from feet/inches to cm
   */
  const feetToCm = (feet: number, inches: number): number => {
    return Math.round((feet * 12 + inches) * 2.54);
  };

  /**
   * Navigate to next step
   */
  const handleNext = () => {
    // Validate Step 1
    if (currentStep === 1) {
      if (!profileData.name.trim()) {
        Alert.alert('Name Required', 'Please enter your full name.');
        return;
      }
      const age = calculateAge(profileData.dateOfBirth);
      if (age < 13) {
        Alert.alert('Age Requirement', 'You must be at least 13 years old to use MediSync.');
        return;
      }
    }

    Keyboard.dismiss();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
      scrollViewRef.current?.scrollTo({ y: 0, animated: false });
    }
  };

  /**
   * Navigate to previous step
   */
  const handleBack = () => {
    if (currentStep > 1) {
      Keyboard.dismiss();
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setCurrentStep(currentStep - 1);
      scrollViewRef.current?.scrollTo({ y: 0, animated: false });
    }
  };

  /**
   * Skip to final step
   */
  const handleSkip = () => {
    if (currentStep < 3) {
      Keyboard.dismiss();
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setCurrentStep(3);
      scrollViewRef.current?.scrollTo({ y: 0, animated: false });
    }
  };

  /**
   * Complete onboarding
   */
  const handleFinish = async () => {
    Keyboard.dismiss();
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      // Request notification permissions
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Notification Permission',
          'You can enable notifications later in settings.',
          [{ text: 'OK' }]
        );
      }

      // Update user data in store
      if (user) {
        const updatedUser = {
          ...user,
          name: profileData.name,
          avatar: profileData.photo,
          dateOfBirth: profileData.dateOfBirth,
          gender: profileData.gender,
          healthInfo: {
            bloodType: healthData.bloodType !== 'Unknown' ? healthData.bloodType : undefined,
            height: healthData.heightCm || undefined,
            weight: healthData.weightKg || undefined,
            allergies: healthData.allergies
              ? healthData.allergies.split(',').map((a) => a.trim()).filter(Boolean)
              : [],
            conditions: [],
          },
        };

        setUser(updatedUser);
      }

      // Show success message
      Alert.alert(
        'Welcome to MediSync!',
        'Your profile has been set up successfully.',
        [
          {
            text: 'Get Started',
            onPress: () => {
              router.replace('/(tabs)');
            },
          },
        ]
      );
    } catch (error) {
      console.error('Onboarding completion error:', error);
      Alert.alert('Error', 'Failed to complete onboarding. Please try again.');
    }
  };

  /**
   * Render Step 1: Profile Setup
   */
  const renderStep1 = () => (
    <Animated.View
      entering={currentStep === 1 ? FadeInRight : FadeInLeft}
      exiting={currentStep === 1 ? FadeOutLeft : FadeOutRight}
      className="gap-6"
    >
      {/* Title */}
      <View>
        <Text className="text-2xl font-bold text-foreground">Set Up Your Profile</Text>
        <Text className="mt-1 text-sm text-muted-foreground">
          Tell us a bit about yourself
        </Text>
      </View>

      {/* Profile Photo */}
      <View className="items-center">
        <Pressable onPress={handleSelectPhoto} className="relative">
          {profileData.photo ? (
            <Image
              source={{ uri: profileData.photo }}
              className="h-32 w-32 rounded-full"
            />
          ) : (
            <View className="h-32 w-32 items-center justify-center rounded-full bg-muted">
              <Camera size={40} className="text-muted-foreground" />
            </View>
          )}
          <View className="absolute bottom-0 right-0 h-10 w-10 items-center justify-center rounded-full bg-primary">
            <Camera size={20} className="text-white" />
          </View>
        </Pressable>
        <Text className="mt-2 text-xs text-muted-foreground">Tap to add photo</Text>
      </View>

      {/* Full Name */}
      <Input
        label="Full Name"
        placeholder="Enter your full name"
        value={profileData.name}
        onChangeText={(text) => setProfileData({ ...profileData, name: text })}
        leftIcon={<User size={20} className="text-muted-foreground" />}
        autoCapitalize="words"
      />

      {/* Date of Birth */}
      <View>
        <Text className="mb-2 text-sm font-medium text-foreground">Date of Birth</Text>
        <Pressable
          onPress={() => setShowDatePicker(true)}
          className="flex-row items-center gap-3 rounded-lg border border-border bg-card px-4 py-3"
        >
          <Calendar size={20} className="text-muted-foreground" />
          <Text className="flex-1 text-base text-foreground">
            {profileData.dateOfBirth.toLocaleDateString()}
          </Text>
        </Pressable>
        <Text className="mt-1 text-xs text-muted-foreground">
          Age: {calculateAge(profileData.dateOfBirth)} years
        </Text>
      </View>

      {showDatePicker && (
        <DateTimePicker
          value={profileData.dateOfBirth}
          mode="date"
          display="spinner"
          maximumDate={new Date()}
          onChange={(event, date) => {
            setShowDatePicker(Platform.OS === 'ios');
            if (date) {
              setProfileData({ ...profileData, dateOfBirth: date });
            }
          }}
        />
      )}

      {/* Gender */}
      <View>
        <Text className="mb-2 text-sm font-medium text-foreground">Gender</Text>
        <View className="gap-2">
          {[
            { value: 'male', label: 'Male' },
            { value: 'female', label: 'Female' },
            { value: 'other', label: 'Other' },
            { value: 'prefer_not_to_say', label: 'Prefer not to say' },
          ].map((option) => (
            <Pressable
              key={option.value}
              onPress={() => {
                setProfileData({ ...profileData, gender: option.value as Gender });
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
              className={`rounded-lg border px-4 py-3 ${
                profileData.gender === option.value
                  ? 'border-primary bg-primary/10'
                  : 'border-border bg-card'
              }`}
            >
              <Text
                className={`text-base ${
                  profileData.gender === option.value
                    ? 'font-semibold text-primary'
                    : 'text-foreground'
                }`}
              >
                {option.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>
    </Animated.View>
  );

  /**
   * Render Step 2: Health Information
   */
  const renderStep2 = () => {
    const bmi = calculateBMI();
    const bmiInfo = bmi ? getBMIInterpretation(bmi) : null;

    return (
      <Animated.View
        entering={currentStep === 2 ? (currentStep > 1 ? FadeInRight : FadeInLeft) : FadeInRight}
        exiting={FadeOutLeft}
        className="gap-6"
      >
        {/* Title */}
        <View>
          <Text className="text-2xl font-bold text-foreground">Health Information</Text>
          <Text className="mt-1 text-sm text-muted-foreground">
            Help us personalize your experience (optional)
          </Text>
        </View>

        {/* Allergies */}
        <View>
          <Text className="mb-2 text-sm font-medium text-foreground">Allergies</Text>
          <TextInput
            className="min-h-[100px] rounded-lg border border-border bg-card px-4 py-3 text-base text-foreground"
            placeholder="e.g., Penicillin, Peanuts, Latex"
            placeholderTextColor="#A3A3A3"
            value={healthData.allergies}
            onChangeText={(text) => setHealthData({ ...healthData, allergies: text })}
            multiline
            maxLength={500}
            textAlignVertical="top"
          />
          <Text className="mt-1 text-xs text-muted-foreground">
            {healthData.allergies.length}/500 characters
          </Text>
        </View>

        {/* Blood Type */}
        <View>
          <Text className="mb-2 text-sm font-medium text-foreground">Blood Type</Text>
          <View className="flex-row flex-wrap gap-2">
            {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-', 'Unknown'].map((type) => (
              <Pressable
                key={type}
                onPress={() => {
                  setHealthData({ ...healthData, bloodType: type as BloodType });
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
                className={`rounded-lg border px-4 py-2 ${
                  healthData.bloodType === type
                    ? 'border-danger bg-danger/10'
                    : 'border-border bg-card'
                }`}
              >
                <Text
                  className={`text-sm ${
                    healthData.bloodType === type
                      ? 'font-semibold text-danger'
                      : 'text-foreground'
                  }`}
                >
                  {type}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Height */}
        <View>
          <View className="mb-2 flex-row items-center justify-between">
            <Text className="text-sm font-medium text-foreground">Height</Text>
            <View className="flex-row gap-2">
              <Pressable
                onPress={() => setHeightUnit('cm')}
                className={`rounded px-3 py-1 ${
                  heightUnit === 'cm' ? 'bg-primary' : 'bg-muted'
                }`}
              >
                <Text className={`text-xs ${heightUnit === 'cm' ? 'text-white' : 'text-foreground'}`}>
                  cm
                </Text>
              </Pressable>
              <Pressable
                onPress={() => setHeightUnit('ft')}
                className={`rounded px-3 py-1 ${
                  heightUnit === 'ft' ? 'bg-primary' : 'bg-muted'
                }`}
              >
                <Text className={`text-xs ${heightUnit === 'ft' ? 'text-white' : 'text-foreground'}`}>
                  ft
                </Text>
              </Pressable>
            </View>
          </View>
          {heightUnit === 'cm' ? (
            <Input
              placeholder="175"
              keyboardType="numeric"
              value={healthData.heightCm?.toString() || ''}
              onChangeText={(text) => {
                const val = parseInt(text) || null;
                setHealthData({ ...healthData, heightCm: val });
              }}
              leftIcon={<Ruler size={20} className="text-muted-foreground" />}
            />
          ) : (
            <View className="flex-row gap-2">
              <Input
                placeholder="5"
                keyboardType="numeric"
                containerClassName="flex-1"
                value={
                  healthData.heightCm ? cmToFeet(healthData.heightCm).feet.toString() : ''
                }
                onChangeText={(text) => {
                  const feet = parseInt(text) || 0;
                  const inches = healthData.heightCm ? cmToFeet(healthData.heightCm).inches : 0;
                  setHealthData({ ...healthData, heightCm: feetToCm(feet, inches) });
                }}
              />
              <Text className="py-3 text-base text-foreground">ft</Text>
              <Input
                placeholder="9"
                keyboardType="numeric"
                containerClassName="flex-1"
                value={
                  healthData.heightCm ? cmToFeet(healthData.heightCm).inches.toString() : ''
                }
                onChangeText={(text) => {
                  const inches = parseInt(text) || 0;
                  const feet = healthData.heightCm ? cmToFeet(healthData.heightCm).feet : 0;
                  setHealthData({ ...healthData, heightCm: feetToCm(feet, inches) });
                }}
              />
              <Text className="py-3 text-base text-foreground">in</Text>
            </View>
          )}
        </View>

        {/* Weight */}
        <View>
          <View className="mb-2 flex-row items-center justify-between">
            <Text className="text-sm font-medium text-foreground">Weight</Text>
            <View className="flex-row gap-2">
              <Pressable
                onPress={() => setWeightUnit('kg')}
                className={`rounded px-3 py-1 ${
                  weightUnit === 'kg' ? 'bg-primary' : 'bg-muted'
                }`}
              >
                <Text className={`text-xs ${weightUnit === 'kg' ? 'text-white' : 'text-foreground'}`}>
                  kg
                </Text>
              </Pressable>
              <Pressable
                onPress={() => setWeightUnit('lbs')}
                className={`rounded px-3 py-1 ${
                  weightUnit === 'lbs' ? 'bg-primary' : 'bg-muted'
                }`}
              >
                <Text className={`text-xs ${weightUnit === 'lbs' ? 'text-white' : 'text-foreground'}`}>
                  lbs
                </Text>
              </Pressable>
            </View>
          </View>
          <Input
            placeholder={weightUnit === 'kg' ? '70' : '154'}
            keyboardType="numeric"
            value={
              healthData.weightKg
                ? weightUnit === 'kg'
                  ? healthData.weightKg.toString()
                  : Math.round(healthData.weightKg * 2.20462).toString()
                : ''
            }
            onChangeText={(text) => {
              const val = parseFloat(text) || null;
              const weightKg = weightUnit === 'kg' ? val : val ? val / 2.20462 : null;
              setHealthData({ ...healthData, weightKg });
            }}
            leftIcon={<Weight size={20} className="text-muted-foreground" />}
          />
        </View>

        {/* BMI */}
        {bmi && bmiInfo && (
          <View className="rounded-lg bg-muted p-4">
            <Text className="text-sm font-medium text-foreground">Body Mass Index (BMI)</Text>
            <View className="mt-2 flex-row items-center justify-between">
              <Text className="text-2xl font-bold text-foreground">{bmi}</Text>
              <Text className={`text-sm font-semibold ${bmiInfo.color}`}>
                {bmiInfo.label}
              </Text>
            </View>
          </View>
        )}
      </Animated.View>
    );
  };

  /**
   * Render Step 3: Notification Preferences
   */
  const renderStep3 = () => (
    <Animated.View
      entering={FadeInRight}
      exiting={FadeOutLeft}
      className="gap-6"
    >
      {/* Title */}
      <View>
        <Text className="text-2xl font-bold text-foreground">Stay Informed</Text>
        <Text className="mt-1 text-sm text-muted-foreground">
          Customize your notification preferences
        </Text>
      </View>

      {/* Notification Toggles */}
      <View className="gap-4">
        {/* Medication Reminders */}
        <View className="flex-row items-start gap-3 rounded-lg border border-border bg-card p-4">
          <View className="h-10 w-10 items-center justify-center rounded-full bg-primary/10">
            <Pill size={20} className="text-primary" />
          </View>
          <View className="flex-1">
            <Text className="text-base font-semibold text-foreground">
              Medication Reminders
            </Text>
            <Text className="mt-1 text-xs text-muted-foreground">
              Get notified about your medication schedule
            </Text>
          </View>
          <Switch
            value={notificationPrefs.medicationReminders}
            onValueChange={(value) => {
              setNotificationPrefs({ ...notificationPrefs, medicationReminders: value });
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
            trackColor={{ false: '#E5E5E5', true: '#72A8E8' }}
          />
        </View>

        {/* Fall Detection Alerts */}
        <View className="flex-row items-start gap-3 rounded-lg border border-border bg-card p-4">
          <View className="h-10 w-10 items-center justify-center rounded-full bg-danger/10">
            <AlertTriangle size={20} className="text-danger" />
          </View>
          <View className="flex-1">
            <Text className="text-base font-semibold text-foreground">
              Fall Detection Alerts
            </Text>
            <Text className="mt-1 text-xs text-muted-foreground">
              Receive immediate alerts for fall detection
            </Text>
          </View>
          <Switch
            value={notificationPrefs.fallAlerts}
            onValueChange={(value) => {
              setNotificationPrefs({ ...notificationPrefs, fallAlerts: value });
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
            trackColor={{ false: '#E5E5E5', true: '#72A8E8' }}
          />
        </View>

        {/* Family Notifications */}
        <View className="flex-row items-start gap-3 rounded-lg border border-border bg-card p-4">
          <View className="h-10 w-10 items-center justify-center rounded-full bg-secondary/10">
            <Users size={20} className="text-secondary" />
          </View>
          <View className="flex-1">
            <Text className="text-base font-semibold text-foreground">
              Family Notifications
            </Text>
            <Text className="mt-1 text-xs text-muted-foreground">
              Updates about family members you're monitoring
            </Text>
          </View>
          <Switch
            value={notificationPrefs.familyNotifications}
            onValueChange={(value) => {
              setNotificationPrefs({ ...notificationPrefs, familyNotifications: value });
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
            trackColor={{ false: '#E5E5E5', true: '#72A8E8' }}
          />
        </View>

        {/* General Updates */}
        <View className="flex-row items-start gap-3 rounded-lg border border-border bg-card p-4">
          <View className="h-10 w-10 items-center justify-center rounded-full bg-info/10">
            <Bell size={20} className="text-info" />
          </View>
          <View className="flex-1">
            <Text className="text-base font-semibold text-foreground">General Updates</Text>
            <Text className="mt-1 text-xs text-muted-foreground">
              App updates and health tips
            </Text>
          </View>
          <Switch
            value={notificationPrefs.generalUpdates}
            onValueChange={(value) => {
              setNotificationPrefs({ ...notificationPrefs, generalUpdates: value });
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
            trackColor={{ false: '#E5E5E5', true: '#72A8E8' }}
          />
        </View>
      </View>

      {/* Reminder Timing */}
      {notificationPrefs.medicationReminders && (
        <View>
          <Text className="mb-2 text-sm font-medium text-foreground">Reminder Timing</Text>
          <View className="gap-2">
            {[
              { value: 15, label: '15 minutes before' },
              { value: 30, label: '30 minutes before' },
              { value: 60, label: '1 hour before' },
            ].map((option) => (
              <Pressable
                key={option.value}
                onPress={() => {
                  setNotificationPrefs({
                    ...notificationPrefs,
                    reminderTimingMinutes: option.value,
                  });
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
                className={`rounded-lg border px-4 py-3 ${
                  notificationPrefs.reminderTimingMinutes === option.value
                    ? 'border-primary bg-primary/10'
                    : 'border-border bg-card'
                }`}
              >
                <Text
                  className={`text-base ${
                    notificationPrefs.reminderTimingMinutes === option.value
                      ? 'font-semibold text-primary'
                      : 'text-foreground'
                  }`}
                >
                  {option.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      )}
    </Animated.View>
  );

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        {/* Header with Progress */}
        <View className="border-b border-border bg-background px-6 py-4">
          <ProgressBar currentStep={currentStep} totalSteps={3} />
          <View className="mt-4">
            <StepIndicator currentStep={currentStep} totalSteps={3} />
          </View>
        </View>

        {/* Content */}
        <ScrollView
          ref={scrollViewRef}
          className="flex-1"
          contentContainerClassName="px-6 py-6"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
        </ScrollView>

        {/* Navigation Buttons */}
        <View className="border-t border-border bg-background px-6 py-4">
          <View className="flex-row items-center gap-3">
            {/* Back Button */}
            {currentStep > 1 && (
              <Button
                variant="outline"
                size="lg"
                onPress={handleBack}
                className="flex-row items-center gap-2"
              >
                <ChevronLeft size={20} className="text-foreground" />
                <Text className="text-base font-medium text-foreground">Back</Text>
              </Button>
            )}

            {/* Skip Button */}
            {currentStep === 2 && (
              <Button
                variant="ghost"
                size="lg"
                onPress={handleSkip}
                className="flex-1"
              >
                <Text className="text-base font-medium text-foreground">Skip</Text>
              </Button>
            )}

            {/* Next/Finish Button */}
            <Button
              size="lg"
              onPress={currentStep === 3 ? handleFinish : handleNext}
              className="flex-1"
            >
              <Text className="text-base font-semibold text-white">
                {currentStep === 3 ? 'Finish' : 'Next'}
              </Text>
            </Button>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
