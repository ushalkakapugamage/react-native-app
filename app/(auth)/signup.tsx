/**
 * MediSync Signup Screen with Firebase Authentication
 *
 * Features:
 * - Email/Password signup with Firebase
 * - Google Sign-In (OAuth)
 * - Form validation with react-hook-form + zod
 * - Password strength indicator with requirements checklist
 * - Password confirmation
 * - Terms & Conditions checkbox
 * - Loading states and error handling
 * - Email verification sent on signup
 *
 * FIREBASE SETUP REQUIRED:
 * See FIREBASE_SETUP.md for complete instructions
 */

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { PasswordStrength } from '@/components/features/auth/password-strength';
import { useAuthStore } from '@/lib/stores';
import {
  signUpWithEmail,
  signInWithGoogleCredential,
  useGoogleAuth,
  convertFirebaseUserToAppUser,
  getIdToken,
} from '@/lib/firebase/auth';
import { zodResolver } from '@hookform/resolvers/zod';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Heart, Mail, Lock, Eye, EyeOff, User } from 'lucide-react-native';
import { useEffect, useState, useRef } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  View,
  Animated,
  TextInput,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { z } from 'zod';

// Validation schema
const signupSchema = z.object({
  name: z
    .string()
    .min(1, 'Full name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be less than 50 characters'),
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: z
    .string()
    .min(1, 'Please confirm your password'),
  termsAccepted: z
    .boolean()
    .refine((val) => val === true, {
      message: 'You must accept the terms and conditions',
    }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type SignupFormData = z.infer<typeof signupSchema>;

export default function SignupScreen() {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const emailInputRef = useRef<TextInput>(null);
  const passwordInputRef = useRef<TextInput>(null);
  const confirmPasswordInputRef = useRef<TextInput>(null);

  // Google Auth configuration
  const [request, response, promptAsync] = useGoogleAuth();

  // React Hook Form setup
  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      termsAccepted: false,
    },
  });

  // Watch password for strength indicator
  const password = watch('password');
  const termsAccepted = watch('termsAccepted');

  // Fade in animation on mount
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  // Handle Google Sign-In response
  useEffect(() => {
    if (response?.type === 'success') {
      handleGoogleSignUp(response.params.id_token);
    } else if (response?.type === 'error') {
      setIsGoogleLoading(false);
      Alert.alert('Google Sign-Up Error', 'Failed to sign up with Google. Please try again.');
    } else if (response?.type === 'cancel') {
      setIsGoogleLoading(false);
      // User cancelled - no need to show error
    }
  }, [response]);

  /**
   * Handle email/password signup submission
   */
  const onSubmit = async (data: SignupFormData) => {
    setIsLoading(true);

    try {
      // Haptic feedback
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      // Create account with Firebase
      const userCredential = await signUpWithEmail(data.email, data.password, data.name);

      // Convert Firebase user to app user format
      const appUser = convertFirebaseUserToAppUser(userCredential.user);

      // Get Firebase ID token for API authentication
      const idToken = await getIdToken(userCredential.user);

      // Login to store (persists to AsyncStorage)
      await login(appUser, idToken);

      // Show success message
      Alert.alert(
        'Account Created!',
        `Welcome to MediSync, ${appUser.name}!\n\nA verification email has been sent to ${data.email}.`,
        [
          {
            text: 'Continue',
            onPress: () => {
              // Navigate to onboarding
              router.replace('/(auth)/onboarding');
            },
          },
        ]
      );
    } catch (error: any) {
      console.error('Signup error:', error);

      // Show user-friendly error message
      Alert.alert('Signup Failed', error.message || 'An error occurred during signup.');

      // Clear password fields on error
      reset({
        name: data.name,
        email: data.email,
        password: '',
        confirmPassword: '',
        termsAccepted: data.termsAccepted,
      });
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle Google Sign-Up
   */
  const handleGoogleSignUpPress = async () => {
    setIsGoogleLoading(true);

    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      // Check if Google auth is configured
      if (!request) {
        Alert.alert(
          'Google Sign-Up Not Configured',
          'Please configure Google OAuth client IDs in lib/firebase/auth.ts.\n\nSee FIREBASE_SETUP.md for instructions.'
        );
        setIsGoogleLoading(false);
        return;
      }

      // Prompt Google Sign-In
      await promptAsync();
    } catch (error) {
      console.error('Google sign-up error:', error);
      Alert.alert('Error', 'Failed to initiate Google sign-up.');
      setIsGoogleLoading(false);
    }
  };

  /**
   * Complete Google Sign-Up with Firebase
   */
  const handleGoogleSignUp = async (idToken: string) => {
    try {
      // Sign in to Firebase with Google credential
      const userCredential = await signInWithGoogleCredential(idToken);

      // Convert Firebase user to app user format
      const appUser = convertFirebaseUserToAppUser(userCredential.user);

      // Get Firebase ID token
      const firebaseIdToken = await getIdToken(userCredential.user);

      // Login to store
      await login(appUser, firebaseIdToken);

      // Show success message
      Alert.alert('Welcome to MediSync!', `Hello, ${appUser.name}!`, [
        {
          text: 'Continue',
          onPress: () => {
            router.replace('/(auth)/onboarding');
          },
        },
      ]);
    } catch (error: any) {
      console.error('Google sign-up completion error:', error);
      Alert.alert('Google Sign-Up Failed', error.message || 'Please try again.');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  /**
   * Navigate to Login
   */
  const handleLogin = () => {
    router.back();
  };

  /**
   * Toggle password visibility
   */
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  /**
   * Toggle confirm password visibility
   */
  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  /**
   * Open Terms & Conditions
   */
  const openTerms = () => {
    // TODO: Replace with actual terms URL
    Alert.alert('Terms & Conditions', 'Terms & Conditions will be available soon.');
    // Linking.openURL('https://medisync.app/terms');
  };

  /**
   * Open Privacy Policy
   */
  const openPrivacy = () => {
    // TODO: Replace with actual privacy URL
    Alert.alert('Privacy Policy', 'Privacy Policy will be available soon.');
    // Linking.openURL('https://medisync.app/privacy');
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView
          className="flex-1"
          contentContainerClassName="pb-6"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Animated.View style={{ opacity: fadeAnim }} className="flex-1">
            {/* Gradient Header */}
            <LinearGradient
              colors={['#72A8E8', '#4A8FE0']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              className="items-center px-6 pb-12 pt-8"
              style={{ borderBottomLeftRadius: 24, borderBottomRightRadius: 24 }}
            >
              {/* Logo */}
              <View className="h-24 w-24 items-center justify-center rounded-full bg-white/20">
                <Heart className="h-12 w-12 text-white" fill="white" />
              </View>

              {/* Title */}
              <Text className="mt-6 text-3xl font-bold text-white">Create Account</Text>
              <Text className="mt-2 text-base text-white/90">Join MediSync today</Text>
            </LinearGradient>

            {/* Signup Form */}
            <View className="mt-6 px-6">
              <View className="gap-4">
                {/* Full Name Input */}
                <Controller
                  control={control}
                  name="name"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Input
                      label="Full Name"
                      placeholder="Enter your full name"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      error={errors.name?.message}
                      leftIcon={<User size={20} className="text-muted-foreground" />}
                      autoFocus
                      autoCapitalize="words"
                      returnKeyType="next"
                      onSubmitEditing={() => emailInputRef.current?.focus()}
                      editable={!isLoading && !isGoogleLoading}
                    />
                  )}
                />

                {/* Email Input */}
                <Controller
                  control={control}
                  name="email"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Input
                      ref={emailInputRef}
                      label="Email"
                      placeholder="Enter your email"
                      type="email"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      error={errors.email?.message}
                      leftIcon={<Mail size={20} className="text-muted-foreground" />}
                      autoCapitalize="none"
                      keyboardType="email-address"
                      returnKeyType="next"
                      onSubmitEditing={() => passwordInputRef.current?.focus()}
                      editable={!isLoading && !isGoogleLoading}
                    />
                  )}
                />

                {/* Password Input */}
                <View className="gap-2">
                  <Controller
                    control={control}
                    name="password"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <Input
                        ref={passwordInputRef}
                        label="Password"
                        placeholder="Create password"
                        type={showPassword ? 'text' : 'password'}
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        error={errors.password?.message}
                        leftIcon={<Lock size={20} className="text-muted-foreground" />}
                        rightIcon={
                          <Pressable onPress={togglePasswordVisibility}>
                            {showPassword ? (
                              <EyeOff size={20} className="text-muted-foreground" />
                            ) : (
                              <Eye size={20} className="text-muted-foreground" />
                            )}
                          </Pressable>
                        }
                        returnKeyType="next"
                        onSubmitEditing={() => confirmPasswordInputRef.current?.focus()}
                        editable={!isLoading && !isGoogleLoading}
                      />
                    )}
                  />

                  {/* Password Strength Indicator */}
                  <PasswordStrength password={password} />
                </View>

                {/* Confirm Password Input */}
                <Controller
                  control={control}
                  name="confirmPassword"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Input
                      ref={confirmPasswordInputRef}
                      label="Confirm Password"
                      placeholder="Re-enter password"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      error={errors.confirmPassword?.message}
                      leftIcon={<Lock size={20} className="text-muted-foreground" />}
                      rightIcon={
                        <Pressable onPress={toggleConfirmPasswordVisibility}>
                          {showConfirmPassword ? (
                            <EyeOff size={20} className="text-muted-foreground" />
                          ) : (
                            <Eye size={20} className="text-muted-foreground" />
                          )}
                        </Pressable>
                      }
                      returnKeyType="done"
                      onSubmitEditing={handleSubmit(onSubmit)}
                      editable={!isLoading && !isGoogleLoading}
                    />
                  )}
                />

                {/* Terms & Conditions Checkbox */}
                <Controller
                  control={control}
                  name="termsAccepted"
                  render={({ field: { onChange, value } }) => (
                    <View className="gap-1">
                      <Pressable
                        onPress={() => {
                          onChange(!value);
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        }}
                        className="flex-row items-start gap-3"
                      >
                        {/* Checkbox */}
                        <View
                          className={`mt-0.5 h-5 w-5 items-center justify-center rounded border-2 ${
                            value
                              ? 'border-primary bg-primary'
                              : 'border-muted-foreground bg-transparent'
                          }`}
                        >
                          {value && (
                            <Text className="text-xs font-bold text-white">✓</Text>
                          )}
                        </View>

                        {/* Text */}
                        <View className="flex-1">
                          <Text className="text-sm text-foreground">
                            I agree to the{' '}
                            <Text
                              className="text-sm font-semibold text-primary"
                              onPress={(e) => {
                                e.stopPropagation();
                                openTerms();
                              }}
                            >
                              Terms & Conditions
                            </Text>{' '}
                            and{' '}
                            <Text
                              className="text-sm font-semibold text-primary"
                              onPress={(e) => {
                                e.stopPropagation();
                                openPrivacy();
                              }}
                            >
                              Privacy Policy
                            </Text>
                          </Text>
                        </View>
                      </Pressable>
                      {errors.termsAccepted && (
                        <Text className="text-xs text-danger">
                          {errors.termsAccepted.message}
                        </Text>
                      )}
                    </View>
                  )}
                />

                {/* Sign Up Button */}
                <Button
                  size="lg"
                  loading={isLoading}
                  onPress={handleSubmit(onSubmit)}
                  disabled={isGoogleLoading}
                  className="mt-2"
                >
                  <Text className="text-base font-semibold text-white">Create Account</Text>
                </Button>
              </View>

              {/* Divider */}
              <View className="my-8 flex-row items-center">
                <View className="h-px flex-1 bg-border" />
                <Text className="px-4 text-sm text-muted-foreground">OR</Text>
                <View className="h-px flex-1 bg-border" />
              </View>

              {/* Google Sign-Up Button */}
              <Button
                variant="outline"
                size="lg"
                loading={isGoogleLoading}
                onPress={handleGoogleSignUpPress}
                disabled={isLoading || !request}
                className="flex-row items-center gap-3"
              >
                {!isGoogleLoading && (
                  <View className="h-5 w-5 items-center justify-center rounded bg-white">
                    <Text className="text-xs font-bold" style={{ color: '#4285F4' }}>
                      G
                    </Text>
                  </View>
                )}
                <Text className="text-base font-medium text-foreground">
                  Continue with Google
                </Text>
              </Button>

              {/* Login Link */}
              <View className="mt-8 flex-row items-center justify-center gap-2">
                <Text className="text-sm text-muted-foreground">Already have an account?</Text>
                <Pressable onPress={handleLogin}>
                  <Text className="text-sm font-semibold text-primary">Login</Text>
                </Pressable>
              </View>

              {/* Firebase Setup Instructions (Development) */}
              {__DEV__ && (
                <View className="mt-6 rounded-lg bg-info/10 p-4">
                  <Text className="text-xs font-semibold text-info">
                    Firebase Setup Required:
                  </Text>
                  <Text className="mt-1 text-xs text-muted-foreground">
                    See FIREBASE_SETUP.md for complete setup instructions.
                  </Text>
                </View>
              )}
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
