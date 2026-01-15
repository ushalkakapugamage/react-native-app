/**
 * MediSync Login Screen with Firebase Authentication
 *
 * Features:
 * - Email/Password authentication
 * - Google Sign-In (OAuth)
 * - Form validation with react-hook-form + zod
 * - Loading states and error handling
 * - Password show/hide toggle
 * - Forgot password link
 * - Sign up navigation
 *
 * FIREBASE SETUP REQUIRED:
 * 1. Configure Firebase in lib/firebase/config.ts
 * 2. Enable Email/Password authentication in Firebase Console
 * 3. Configure Google Sign-In OAuth client IDs in lib/firebase/auth.ts
 * 4. Test with real Firebase credentials
 */

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { useAuthStore } from '@/lib/stores';
import {
  signInWithEmail,
  signInWithGoogleCredential,
  useGoogleAuth,
  convertFirebaseUserToAppUser,
  getIdToken,
} from '@/lib/firebase/auth';
import { zodResolver } from '@hookform/resolvers/zod';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Heart, Mail, Lock, Eye, EyeOff } from 'lucide-react-native';
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { z } from 'zod';

// Validation schema
const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(8, 'Password must be at least 8 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginScreen() {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const passwordInputRef = useRef<TextInput>(null);

  // Google Auth configuration
  const [request, response, promptAsync] = useGoogleAuth();

  // React Hook Form setup
  const {
    control,
    handleSubmit,
    formState: { errors },
    setError,
    reset,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

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
      handleGoogleSignIn(response.params.id_token);
    } else if (response?.type === 'error') {
      setIsGoogleLoading(false);
      Alert.alert('Google Sign-In Error', 'Failed to sign in with Google. Please try again.');
    } else if (response?.type === 'cancel') {
      setIsGoogleLoading(false);
      // User cancelled - no need to show error
    }
  }, [response]);

  /**
   * Handle email/password login submission
   */
  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);

    try {
      // Haptic feedback
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      // Sign in with Firebase
      const userCredential = await signInWithEmail(data.email, data.password);

      // Convert Firebase user to app user format
      const appUser = convertFirebaseUserToAppUser(userCredential.user);

      // Get Firebase ID token for API authentication
      const idToken = await getIdToken(userCredential.user);

      // Login to store (persists to AsyncStorage)
      await login(appUser, idToken);

      // Show success message
      Alert.alert('Welcome Back!', `Hello, ${appUser.name}!`, [
        {
          text: 'Continue',
          onPress: () => {
            // Navigate to main app
            router.replace('/(tabs)');
          },
        },
      ]);
    } catch (error: any) {
      console.error('Login error:', error);

      // Show user-friendly error message
      Alert.alert('Login Failed', error.message || 'An error occurred during login.');

      // Clear password field on error
      reset({ email: data.email, password: '' });
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle Google Sign-In
   */
  const handleGoogleSignInPress = async () => {
    setIsGoogleLoading(true);

    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      // Check if Google auth is configured
      if (!request) {
        Alert.alert(
          'Google Sign-In Not Configured',
          'Please configure Google OAuth client IDs in lib/firebase/auth.ts.\n\nSee setup instructions in the file comments.'
        );
        setIsGoogleLoading(false);
        return;
      }

      // Prompt Google Sign-In
      await promptAsync();
    } catch (error) {
      console.error('Google sign-in error:', error);
      Alert.alert('Error', 'Failed to initiate Google sign-in.');
      setIsGoogleLoading(false);
    }
  };

  /**
   * Complete Google Sign-In with Firebase
   */
  const handleGoogleSignIn = async (idToken: string) => {
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
      Alert.alert('Welcome!', `Hello, ${appUser.name}!`, [
        {
          text: 'Continue',
          onPress: () => {
            router.replace('/(tabs)');
          },
        },
      ]);
    } catch (error: any) {
      console.error('Google sign-in completion error:', error);
      Alert.alert('Google Sign-In Failed', error.message || 'Please try again.');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  /**
   * Handle Forgot Password
   */
  const handleForgotPassword = () => {
    // TODO: Implement forgot password screen
    Alert.alert(
      'Password Reset',
      'Password reset feature coming soon.\n\nYou will receive a reset link via email.',
      [{ text: 'OK' }]
    );
  };

  /**
   * Navigate to Sign Up
   */
  const handleSignUp = () => {
    router.push('/(auth)/signup');
  };

  /**
   * Toggle password visibility
   */
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
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
              <Text className="mt-6 text-3xl font-bold text-white">Welcome Back</Text>
              <Text className="mt-2 text-base text-white/90">
                Sign in to continue to MediSync
              </Text>
            </LinearGradient>

            {/* Login Form */}
            <View className="mt-6 px-6">
              <View className="gap-4">
                {/* Email Input */}
                <Controller
                  control={control}
                  name="email"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Input
                      label="Email"
                      placeholder="Enter your email"
                      type="email"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      error={errors.email?.message}
                      leftIcon={<Mail size={20} className="text-muted-foreground" />}
                      autoFocus
                      autoCapitalize="none"
                      keyboardType="email-address"
                      returnKeyType="next"
                      onSubmitEditing={() => passwordInputRef.current?.focus()}
                      editable={!isLoading && !isGoogleLoading}
                    />
                  )}
                />

                {/* Password Input */}
                <Controller
                  control={control}
                  name="password"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Input
                      ref={passwordInputRef}
                      label="Password"
                      placeholder="Enter your password"
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
                      returnKeyType="done"
                      onSubmitEditing={handleSubmit(onSubmit)}
                      editable={!isLoading && !isGoogleLoading}
                    />
                  )}
                />

                {/* Forgot Password */}
                <View className="items-end">
                  <Pressable onPress={handleForgotPassword} className="py-1">
                    <Text className="text-sm font-medium text-primary">Forgot Password?</Text>
                  </Pressable>
                </View>

                {/* Login Button */}
                <Button
                  size="lg"
                  loading={isLoading}
                  onPress={handleSubmit(onSubmit)}
                  disabled={isGoogleLoading}
                  className="mt-2"
                >
                  <Text className="text-base font-semibold text-white">Login</Text>
                </Button>
              </View>

              {/* Divider */}
              <View className="my-8 flex-row items-center">
                <View className="h-px flex-1 bg-border" />
                <Text className="px-4 text-sm text-muted-foreground">OR</Text>
                <View className="h-px flex-1 bg-border" />
              </View>

              {/* Google Sign-In Button */}
              <Button
                variant="outline"
                size="lg"
                loading={isGoogleLoading}
                onPress={handleGoogleSignInPress}
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

              {/* Sign Up Link */}
              <View className="mt-8 flex-row items-center justify-center gap-2">
                <Text className="text-sm text-muted-foreground">Don't have an account?</Text>
                <Pressable onPress={handleSignUp}>
                  <Text className="text-sm font-semibold text-primary">Sign Up</Text>
                </Pressable>
              </View>

              {/* Firebase Setup Instructions (Development) */}
              {__DEV__ && (
                <View className="mt-6 rounded-lg bg-warning/10 p-4">
                  <Text className="text-xs font-semibold text-warning">
                    Firebase Setup Required:
                  </Text>
                  <Text className="mt-1 text-xs text-muted-foreground">
                    1. Configure Firebase in lib/firebase/config.ts
                  </Text>
                  <Text className="text-xs text-muted-foreground">
                    2. Enable Email/Password in Firebase Console
                  </Text>
                  <Text className="text-xs text-muted-foreground">
                    3. Add Google OAuth Client IDs in lib/firebase/auth.ts
                  </Text>
                  <Text className="mt-2 text-xs text-muted-foreground">
                    See file comments for detailed instructions.
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
