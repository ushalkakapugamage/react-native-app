/**
 * Firebase Authentication Helper Functions
 *
 * This module provides authentication functions for:
 * - Email/Password sign-in
 * - Google Sign-In (OAuth)
 * - Sign out
 * - User conversion utilities
 */

import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  sendEmailVerification,
  signOut as firebaseSignOut,
  GoogleAuthProvider,
  signInWithCredential,
  UserCredential,
  User as FirebaseUser,
} from 'firebase/auth';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { auth } from './config';
import type { User } from '@/lib/types';

// Enable WebBrowser for Google Sign-In
WebBrowser.maybeCompleteAuthSession();

/**
 * Error messages for common Firebase auth errors
 */
const AUTH_ERROR_MESSAGES: Record<string, string> = {
  'auth/user-not-found': 'No account found with this email. Please sign up.',
  'auth/wrong-password': 'Incorrect password. Please try again.',
  'auth/invalid-email': 'Please enter a valid email address.',
  'auth/user-disabled': 'This account has been disabled. Contact support.',
  'auth/too-many-requests': 'Too many failed attempts. Please try again later.',
  'auth/network-request-failed': 'Network error. Please check your connection.',
  'auth/operation-not-allowed': 'Email/password sign-in is not enabled.',
  'auth/invalid-credential': 'Invalid credentials. Please try again.',
  'auth/weak-password': 'Password should be at least 8 characters.',
  'auth/email-already-in-use': 'An account with this email already exists.',
};

/**
 * Get user-friendly error message from Firebase error code
 */
export function getAuthErrorMessage(errorCode: string): string {
  return AUTH_ERROR_MESSAGES[errorCode] || 'Authentication failed. Please try again.';
}

/**
 * Convert Firebase User to App User format
 */
export function convertFirebaseUserToAppUser(firebaseUser: FirebaseUser): User {
  return {
    id: firebaseUser.uid,
    email: firebaseUser.email || '',
    name: firebaseUser.displayName || 'User',
    avatar: firebaseUser.photoURL || undefined,
    // Set default values for required fields
    dateOfBirth: new Date('1990-01-01'), // TODO: Collect during onboarding
    gender: 'other', // TODO: Collect during onboarding
    phoneNumber: firebaseUser.phoneNumber || undefined,
    createdAt: firebaseUser.metadata.creationTime
      ? new Date(firebaseUser.metadata.creationTime)
      : new Date(),
    // healthInfo will be added later during profile completion
  };
}

/**
 * Sign in with Email and Password
 *
 * @param email - User's email address
 * @param password - User's password
 * @returns Promise with UserCredential
 * @throws Error with user-friendly message
 */
export async function signInWithEmail(
  email: string,
  password: string
): Promise<UserCredential> {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential;
  } catch (error: any) {
    const errorMessage = getAuthErrorMessage(error.code);
    throw new Error(errorMessage);
  }
}

/**
 * Sign up with Email and Password
 *
 * Creates a new user account with email/password and updates their profile.
 * Also sends an email verification link.
 *
 * @param email - User's email address
 * @param password - User's password (min 8 characters)
 * @param displayName - User's full name
 * @returns Promise with UserCredential
 * @throws Error with user-friendly message
 */
export async function signUpWithEmail(
  email: string,
  password: string,
  displayName: string
): Promise<UserCredential> {
  try {
    // Create user account
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);

    // Update user profile with display name
    await updateProfile(userCredential.user, {
      displayName: displayName,
    });

    // Send email verification
    try {
      await sendEmailVerification(userCredential.user);
    } catch (emailError) {
      // Don't fail signup if email verification fails
      console.warn('Email verification failed to send:', emailError);
    }

    return userCredential;
  } catch (error: any) {
    const errorMessage = getAuthErrorMessage(error.code);
    throw new Error(errorMessage);
  }
}

/**
 * Google Sign-In Configuration
 *
 * SETUP INSTRUCTIONS FOR GOOGLE SIGN-IN:
 *
 * 1. In Firebase Console:
 *    - Go to Authentication > Sign-in method
 *    - Enable Google provider
 *    - Note the Web SDK configuration
 *
 * 2. Get OAuth Client IDs:
 *    - Go to Google Cloud Console: https://console.cloud.google.com/
 *    - Select your Firebase project
 *    - Go to APIs & Services > Credentials
 *    - Create OAuth 2.0 Client IDs for:
 *      a) Web application (for Expo web)
 *      b) iOS (for iOS app)
 *      c) Android (for Android app)
 *
 * 3. Add the Client IDs below:
 *    - Replace the placeholder values
 *    - For Expo, you need the Web Client ID and platform-specific IDs
 *
 * 4. Configure app.json:
 *    - Add the scheme for deep linking
 *    - Add bundleIdentifier (iOS) and package (Android)
 */

// TODO: Replace these with your actual Google OAuth Client IDs
const GOOGLE_WEB_CLIENT_ID = 'your-web-client-id.apps.googleusercontent.com';
const GOOGLE_IOS_CLIENT_ID = 'your-ios-client-id.apps.googleusercontent.com';
const GOOGLE_ANDROID_CLIENT_ID = 'your-android-client-id.apps.googleusercontent.com';

// Expo Auth Session Configuration for Google
export const useGoogleAuth = () => {
  return Google.useIdTokenAuthRequest({
    clientId: GOOGLE_WEB_CLIENT_ID,
    iosClientId: GOOGLE_IOS_CLIENT_ID,
    androidClientId: GOOGLE_ANDROID_CLIENT_ID,
  });
};

/**
 * Sign in with Google
 *
 * This function is called after the user completes Google authentication
 *
 * @param idToken - Google ID token from auth response
 * @returns Promise with UserCredential
 * @throws Error with user-friendly message
 */
export async function signInWithGoogleCredential(
  idToken: string
): Promise<UserCredential> {
  try {
    const credential = GoogleAuthProvider.credential(idToken);
    const userCredential = await signInWithCredential(auth, credential);
    return userCredential;
  } catch (error: any) {
    const errorMessage = getAuthErrorMessage(error.code);
    throw new Error(errorMessage);
  }
}

/**
 * Sign out the current user
 *
 * @throws Error if sign out fails
 */
export async function signOut(): Promise<void> {
  try {
    await firebaseSignOut(auth);
  } catch (error: any) {
    throw new Error('Sign out failed. Please try again.');
  }
}

/**
 * Get Firebase ID Token for authenticated user
 * Used for API authentication
 *
 * @param user - Firebase User object
 * @returns Promise with ID token string
 */
export async function getIdToken(user: FirebaseUser): Promise<string> {
  try {
    const token = await user.getIdToken();
    return token;
  } catch (error) {
    throw new Error('Failed to get authentication token.');
  }
}

/**
 * Check if user email is verified
 */
export function isEmailVerified(user: FirebaseUser): boolean {
  return user.emailVerified;
}

/**
 * Get current authenticated user
 */
export function getCurrentUser(): FirebaseUser | null {
  return auth.currentUser;
}

/**
 * Listen to auth state changes
 *
 * @param callback - Function to call when auth state changes
 * @returns Unsubscribe function
 */
export function onAuthStateChanged(callback: (user: FirebaseUser | null) => void) {
  return auth.onAuthStateChanged(callback);
}
