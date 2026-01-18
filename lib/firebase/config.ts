/**
 * Firebase Configuration
 *
 * SETUP INSTRUCTIONS:
 * 1. Go to Firebase Console: https://console.firebase.google.com/
 * 2. Create a new project or select existing project
 * 3. Click "Add app" and select Web (</>) platform
 * 4. Register your app with a nickname (e.g., "MediSync")
 * 5. Copy the firebaseConfig object values
 * 6. Replace the placeholder values below with your actual Firebase config
 * 7. Enable Authentication:
 *    - Go to Authentication > Sign-in method
 *    - Enable "Email/Password" provider
 *    - Enable "Google" provider (for Google Sign-In)
 *
 * IMPORTANT: Keep these values secure in production!
 * Consider using environment variables or expo-constants for sensitive data.
 */

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, initializeAuth, Auth } from 'firebase/auth';
// @ts-ignore - getReactNativePersistence is available in react-native environment
import { getReactNativePersistence } from '@firebase/auth/dist/rn/index.js';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Firebase configuration
// TODO: Replace these placeholder values with your actual Firebase config
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-app.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-app.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id",
  // measurementId: "your-measurement-id" // Optional: for Firebase Analytics
};

// Initialize Firebase app (only if not already initialized)
let app;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

// Initialize Auth with AsyncStorage persistence for React Native
let auth: Auth;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} catch (error) {
  // If auth is already initialized, get the existing instance
  auth = getAuth(app);
}

export { app, auth };
export default app;
