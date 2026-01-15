# MediSync Navigation Structure

Complete Expo Router navigation setup with authentication flow and tab-based main navigation.

## Navigation Flow

```
app/
├── _layout.tsx                 # Root layout with all providers
├── index.tsx                   # Entry point (auth check & redirect)
│
├── (auth)/                     # Authentication flow
│   ├── _layout.tsx            # Auth stack layout
│   ├── onboarding.tsx         # First-time user onboarding
│   ├── login.tsx              # Sign in screen
│   └── signup.tsx             # Sign up screen
│
└── (tabs)/                     # Main app tabs
    ├── _layout.tsx            # Tab navigator with custom styling
    ├── index.tsx              # Dashboard (Home)
    ├── medications.tsx        # Medications list & management
    ├── family.tsx             # Family members monitoring
    ├── notifications.tsx      # Notifications & alerts
    └── profile.tsx            # User profile & settings
```

## Navigation Structure

### Root Layout (`app/_layout.tsx`)
All providers wrapped in proper hierarchy:
1. **SafeAreaProvider** - Safe area insets for mobile devices
2. **QueryClientProvider** - React Query for data fetching
3. **MediSyncThemeProvider** - Theme context with persistence
4. **NavigationThemeProvider** - React Navigation theming
5. **PortalHost** - Modal/popover support

### Entry Point (`app/index.tsx`)
- Checks authentication status
- Redirects based on state:
  - Not seen onboarding → `/(auth)/onboarding`
  - Not authenticated → `/(auth)/login`
  - Authenticated → `/(tabs)`

### Authentication Flow (`app/(auth)/`)

#### Onboarding Screen
- First-time user experience
- Feature highlights:
  - Medication reminders with multi-time alerts
  - Fall detection with emergency alerts
  - Family care and monitoring
- "Get Started" → Login
- "Skip" → Login

#### Login Screen
- Email and password authentication
- "Forgot Password" link
- "Sign Up" navigation
- TODO: Implement actual API authentication

#### Sign Up Screen
- Full name, email, password, confirm password
- Form validation
- Back to login
- TODO: Implement actual API registration

### Main App Tabs (`app/(tabs)/`)

#### Dashboard Tab (index.tsx)
**Features:**
- Welcome header with user name
- Theme toggle
- Quick stats cards:
  - Today's medications progress (3/5)
  - Health score (85/100)
- Upcoming medications list
- Recent activity feed
- All cards styled with theme colors

#### Medications Tab
**Features:**
- Search medications
- Filter options
- Active medications list with:
  - Medication name & dosage
  - Instructions
  - Schedule (times per day)
  - Start date & duration
  - Edit/Take Now buttons
- Add new medication button
- Empty state for no medications

#### Family Tab
**Features:**
- Family members list with:
  - Name, relationship, online status
  - Health stats (medications taken, health score)
  - View details button
- Add family member card
- Empty state for no family members

#### Notifications Tab
**Features:**
- Grouped by date (Today, Yesterday, etc.)
- Notification types:
  - Medication reminders
  - Medication taken confirmations
  - Missed medication alerts
  - Family member alerts
  - New family member notifications
- Unread indicators
- Filter options
- Empty state for no notifications

#### Profile Tab
**Features:**
- User profile with avatar initials
- Edit profile button
- Health stats summary:
  - Active medications count
  - Adherence percentage
  - Current streak
- Settings sections:
  - **Account**: Personal info, health profile, privacy
  - **Preferences**: Notifications, theme selector, general settings
  - **Support**: Help & support
- Logout button
- App version

## Tab Bar Configuration

Custom styled tab bar with:
- **Colors**: Primary (#72A8E8) for active, gray for inactive
- **Icons**: Lucide React Native icons
- **Height**: 88px (iOS), 65px (Android)
- **Spacing**: Proper padding for safe areas
- **Tabs**:
  1. 🏠 Dashboard (Home icon)
  2. 💊 Medications (Pill icon)
  3. 👨‍👩‍👧 Family (Users icon)
  4. 🔔 Notifications (Bell icon)
  5. 👤 Profile (User icon)

## Navigation Types

All screens are fully typed with TypeScript. Navigation types are inferred from Expo Router.

## Usage Examples

### Navigate to Login
```tsx
import { router } from 'expo-router';

// Replace (removes back stack)
router.replace('/(auth)/login');

// Push (adds to back stack)
router.push('/(auth)/login');
```

### Navigate to Tabs
```tsx
router.replace('/(tabs)');
```

### Navigate to Specific Tab
```tsx
router.push('/(tabs)/medications');
```

### Go Back
```tsx
router.back();
```

## Authentication Flow

### Current Implementation
All screens have placeholder TODOs for actual implementation:

```tsx
// TODO: Replace with actual auth logic
const checkAuthStatus = async () => {
  // Check AsyncStorage/SecureStore for token
  const token = await AsyncStorage.getItem('@auth_token');
  setIsAuthenticated(!!token);
};
```

### Recommended Implementation
1. **Use SecureStore** for sensitive tokens
2. **Use AsyncStorage** for non-sensitive data (onboarding status)
3. **Implement JWT** or session-based auth
4. **Add auth context** for global auth state

## Providers Setup

### React Query Configuration
```tsx
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,      // 1 minute
      gcTime: 5 * 60 * 1000,     // 5 minutes
      retry: 1,
      refetchOnWindowFocus: true,
    },
  },
});
```

### Theme Provider
- System theme detection by default
- Persists to AsyncStorage
- Auto-syncs with NativeWind

## Screen Options

All screens have:
- `headerShown: false` - Custom headers
- `animation: 'fade'` - Smooth transitions
- `contentStyle: { backgroundColor: 'transparent' }` - Theme-aware

## TODO Items

### Authentication
- [ ] Implement actual login API
- [ ] Implement actual signup API
- [ ] Add JWT token handling
- [ ] Add refresh token logic
- [ ] Add biometric authentication
- [ ] Implement forgot password flow
- [ ] Add email verification

### Navigation
- [ ] Add deep linking
- [ ] Add notification badges
- [ ] Implement medication details screen
- [ ] Implement family member details screen
- [ ] Add settings screens
- [ ] Add help & support screens

### Features
- [ ] Implement medication CRUD
- [ ] Implement family member management
- [ ] Implement notification system
- [ ] Add push notifications
- [ ] Implement health profile
- [ ] Add data visualization

## Testing Navigation

### Test Auth Flow
1. Start app → Should show onboarding
2. Skip/Get Started → Should show login
3. Click Sign Up → Should show signup
4. After login → Should show dashboard

### Test Tabs
1. Navigate between all 5 tabs
2. Verify tab bar active state
3. Check theme consistency
4. Test theme toggle in dashboard and profile

## Dependencies

### Installed
- ✅ `@tanstack/react-query` - Data fetching & caching
- ✅ `react-native-safe-area-context` - Safe area support
- ✅ `@react-native-async-storage/async-storage` - Local storage
- ✅ `expo-router` - File-based routing
- ✅ `lucide-react-native` - Icons

### Recommended for Future
- `expo-secure-store` - Secure token storage
- `react-native-mmkv` - Fast key-value storage
- `@react-native-firebase/messaging` - Push notifications
- `react-native-biometrics` - Biometric auth

## File Structure Summary

```
app/
├── _layout.tsx                 ✅ Root with providers
├── index.tsx                   ✅ Auth check & redirect
├── (auth)/
│   ├── _layout.tsx            ✅ Auth stack
│   ├── onboarding.tsx         ✅ Feature highlights
│   ├── login.tsx              ✅ Email/password
│   └── signup.tsx             ✅ Registration
└── (tabs)/
    ├── _layout.tsx            ✅ Custom tab bar
    ├── index.tsx              ✅ Dashboard with stats
    ├── medications.tsx        ✅ Med list & search
    ├── family.tsx             ✅ Family members
    ├── notifications.tsx      ✅ Alerts & notifs
    └── profile.tsx            ✅ Settings & profile
```

All screens are fully styled with MediSync theme colors and ready for feature implementation!
