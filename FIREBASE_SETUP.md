# Firebase Authentication Setup Guide

Complete guide for setting up Firebase Authentication in MediSync.

## 📋 Table of Contents

1. [Firebase Project Setup](#firebase-project-setup)
2. [Configure Firebase in App](#configure-firebase-in-app)
3. [Enable Authentication Providers](#enable-authentication-providers)
4. [Google Sign-In Configuration](#google-sign-in-configuration)
5. [Testing](#testing)
6. [Troubleshooting](#troubleshooting)

---

## 🔥 Firebase Project Setup

### Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"** or select an existing project
3. Enter project name: **"MediSync"** (or your preferred name)
4. Enable Google Analytics (optional but recommended)
5. Click **"Create project"**

### Step 2: Add Web App to Firebase

1. In your Firebase project, click the **Web icon** (`</>`)
2. Register your app:
   - App nickname: **"MediSync Web"**
   - Check **"Also set up Firebase Hosting"** (optional)
3. Click **"Register app"**
4. **IMPORTANT:** Copy the `firebaseConfig` object shown
5. Click **"Continue to console"**

### Step 3: Get Your Firebase Config

You should see something like this:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "medisync-xxxxx.firebaseapp.com",
  projectId: "medisync-xxxxx",
  storageBucket: "medisync-xxxxx.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890",
  measurementId: "G-XXXXXXXXXX" // Optional
};
```

---

## ⚙️ Configure Firebase in App

### Update `lib/firebase/config.ts`

Replace the placeholder values with your actual Firebase config:

```typescript
const firebaseConfig = {
  apiKey: "YOUR_ACTUAL_API_KEY",
  authDomain: "YOUR_ACTUAL_AUTH_DOMAIN",
  projectId: "YOUR_ACTUAL_PROJECT_ID",
  storageBucket: "YOUR_ACTUAL_STORAGE_BUCKET",
  messagingSenderId: "YOUR_ACTUAL_MESSAGING_SENDER_ID",
  appId: "YOUR_ACTUAL_APP_ID",
};
```

**Where to find each value:**
- All values are in the `firebaseConfig` object from Step 2 above
- Or go to: Project Settings → General → Your apps → Web app

---

## 🔐 Enable Authentication Providers

### Enable Email/Password Authentication

1. In Firebase Console, go to **Authentication**
2. Click **"Get started"** (if first time)
3. Go to **"Sign-in method"** tab
4. Click **"Email/Password"**
5. Toggle **"Enable"** to ON
6. Click **"Save"**

✅ Email/Password authentication is now enabled!

### Enable Google Sign-In

1. In the same **"Sign-in method"** tab
2. Click **"Google"**
3. Toggle **"Enable"** to ON
4. Set **"Project public-facing name"**: **"MediSync"**
5. Set **"Project support email"**: Your email
6. Click **"Save"**

✅ Google Sign-In is now enabled in Firebase!

---

## 🔑 Google Sign-In Configuration

Google Sign-In requires OAuth 2.0 Client IDs for each platform.

### Step 1: Access Google Cloud Console

1. From Firebase Console, click **⚙️ Project Settings**
2. Scroll to **"Your apps"** section
3. Under the Web app, click **"SDK setup and configuration"**
4. Note the **Web API Key** (starts with `AIza...`)
5. Click **"Manage service accounts"** → Opens Google Cloud Console

OR directly go to: [Google Cloud Console](https://console.cloud.google.com/)

### Step 2: Create OAuth 2.0 Client IDs

1. In Google Cloud Console, go to:
   - **APIs & Services** → **Credentials**
2. Click **"+ CREATE CREDENTIALS"** → **"OAuth client ID"**

#### A. Web Client ID (for Expo web)

1. Application type: **Web application**
2. Name: **"MediSync Web Client"**
3. Authorized JavaScript origins:
   - `http://localhost`
   - `http://localhost:19006`
   - `https://auth.expo.io`
4. Authorized redirect URIs:
   - `http://localhost:19006`
   - `https://auth.expo.io/@YOUR_EXPO_USERNAME/medisync-app`
5. Click **"CREATE"**
6. **Copy the Client ID** (format: `xxxxx.apps.googleusercontent.com`)

#### B. iOS Client ID

1. Application type: **iOS**
2. Name: **"MediSync iOS Client"**
3. Bundle ID: Get from `app.json` → `expo.ios.bundleIdentifier`
   - Example: `com.yourcompany.medisync`
4. Click **"CREATE"**
5. **Copy the Client ID**

#### C. Android Client ID

1. Application type: **Android**
2. Name: **"MediSync Android Client"**
3. Package name: Get from `app.json` → `expo.android.package`
   - Example: `com.yourcompany.medisync`
4. SHA-1 certificate fingerprint:
   - Development: Run `expo credentials:manager` and get debug keystore
   - Or use: `keytool -list -v -keystore ~/.android/debug.keystore`
   - Default password: `android`
5. Click **"CREATE"**
6. **Copy the Client ID**

### Step 3: Update `lib/firebase/auth.ts`

Replace the placeholder Client IDs:

```typescript
const GOOGLE_WEB_CLIENT_ID = 'YOUR_WEB_CLIENT_ID.apps.googleusercontent.com';
const GOOGLE_IOS_CLIENT_ID = 'YOUR_IOS_CLIENT_ID.apps.googleusercontent.com';
const GOOGLE_ANDROID_CLIENT_ID = 'YOUR_ANDROID_CLIENT_ID.apps.googleusercontent.com';
```

### Step 4: Update `app.json`

Ensure your `app.json` has the bundle identifiers:

```json
{
  "expo": {
    "name": "MediSync",
    "slug": "medisync-app",
    "scheme": "medisync",
    "ios": {
      "bundleIdentifier": "com.yourcompany.medisync"
    },
    "android": {
      "package": "com.yourcompany.medisync"
    }
  }
}
```

---

## 🧪 Testing

### Test Email/Password Login

1. **Create a test user in Firebase:**
   - Go to Firebase Console → Authentication → Users
   - Click **"Add user"**
   - Email: `test@medisync.com`
   - Password: `Test1234!` (at least 8 characters)
   - Click **"Add user"**

2. **Test in the app:**
   - Launch the app: `npm start`
   - Go to login screen
   - Enter email: `test@medisync.com`
   - Enter password: `Test1234!`
   - Click **"Login"**
   - ✅ Should see "Welcome Back!" alert and navigate to home

### Test Google Sign-In

1. **Ensure Google OAuth Client IDs are configured** (see above)
2. **Test in the app:**
   - Click **"Continue with Google"** button
   - Google sign-in popup should appear
   - Select your Google account
   - ✅ Should see "Welcome!" alert and navigate to home

**Note:** Google Sign-In may not work in Expo Go app. Build a development build:
```bash
npx expo prebuild
npx expo run:ios
# or
npx expo run:android
```

### Verify Authentication

After successful login, check:

1. **Firebase Console:**
   - Go to Authentication → Users
   - Your logged-in user should appear in the list

2. **App State:**
   - User data is stored in `useAuthStore`
   - Persisted to AsyncStorage
   - Token stored for API calls

---

## 🔧 Troubleshooting

### Issue: "Unable to resolve firebase"

**Solution:** Ensure Firebase is installed:
```bash
npm install firebase
```

### Issue: "auth/invalid-api-key"

**Solution:**
- Check `lib/firebase/config.ts` has correct `apiKey`
- Verify API key in Firebase Console → Project Settings → General

### Issue: "auth/unauthorized-domain"

**Solution:**
- Go to Firebase Console → Authentication → Settings → Authorized domains
- Add your domain (e.g., `localhost`, your Expo domain)

### Issue: Google Sign-In shows "Error 400: redirect_uri_mismatch"

**Solution:**
- Check redirect URIs in Google Cloud Console → Credentials
- Add: `https://auth.expo.io/@YOUR_EXPO_USERNAME/medisync-app`
- For local testing, add: `http://localhost:19006`

### Issue: Google Sign-In doesn't work in Expo Go

**Solution:**
Google Sign-In requires a custom build. Create a development build:
```bash
npx expo install expo-dev-client
npx expo prebuild
npx expo run:ios  # or run:android
```

### Issue: "auth/configuration-not-found"

**Solution:**
- Enable Google Sign-In provider in Firebase Console
- Authentication → Sign-in method → Google → Enable

### Issue: "expo-auth-session not found"

**Solution:**
```bash
npx expo install expo-auth-session expo-web-browser expo-crypto
```

---

## 📚 Additional Resources

- [Firebase Authentication Docs](https://firebase.google.com/docs/auth)
- [Expo Authentication Guide](https://docs.expo.dev/guides/authentication/)
- [Google Sign-In for Expo](https://docs.expo.dev/guides/google-authentication/)
- [Firebase JS SDK Reference](https://firebase.google.com/docs/reference/js/auth)

---

## 🔒 Security Best Practices

### 1. Never commit Firebase config to public repos
   - Use environment variables in production
   - Consider using `expo-constants` with `.env` files

### 2. Enable App Check (recommended for production)
   - Firebase Console → App Check
   - Protects against abuse

### 3. Set up Security Rules
   - Firebase Console → Firestore/Storage → Rules
   - Restrict access to authenticated users

### 4. Enable Multi-Factor Authentication (optional)
   - Firebase Console → Authentication → Sign-in method
   - Add 2FA for enhanced security

---

## ✅ Checklist

Before deploying to production:

- [ ] Firebase project created
- [ ] Firebase config added to `lib/firebase/config.ts`
- [ ] Email/Password provider enabled
- [ ] Google provider enabled
- [ ] Web OAuth Client ID configured
- [ ] iOS OAuth Client ID configured
- [ ] Android OAuth Client ID configured
- [ ] Client IDs added to `lib/firebase/auth.ts`
- [ ] Bundle identifiers set in `app.json`
- [ ] Tested email/password login
- [ ] Tested Google Sign-In
- [ ] Verified users appear in Firebase Console
- [ ] App Check enabled (production)
- [ ] Security rules configured (production)

---

## 🎉 You're All Set!

Your MediSync app now has fully functional Firebase Authentication with:
- ✅ Email/Password sign-in
- ✅ Google Sign-In
- ✅ Secure token management
- ✅ Persistent authentication
- ✅ User-friendly error handling

For support, check the [Firebase Community](https://firebase.google.com/support) or [Expo Forums](https://forums.expo.dev/).
