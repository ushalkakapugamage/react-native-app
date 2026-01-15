# MediSync Zustand Stores

Complete state management using Zustand with AsyncStorage persistence.

## Overview

MediSync uses Zustand for state management with the following stores:
- **AuthStore** - User authentication and session
- **MedicationStore** - Medications and medication events
- **NotificationStore** - App notifications and alerts
- **FamilyStore** - Family members and groups

All stores are persisted to AsyncStorage and automatically rehydrate on app start.

## File Structure

```
lib/
├── types/
│   └── index.ts              # TypeScript interfaces
└── stores/
    ├── useAuthStore.ts       # Auth state management
    ├── useMedicationStore.ts # Medication management
    ├── useNotificationStore.ts # Notifications
    ├── useFamilyStore.ts     # Family & groups
    └── index.ts              # Barrel export
```

## TypeScript Types

### User Types
```typescript
interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  dateOfBirth: Date;
  gender: 'male' | 'female' | 'other' | 'prefer-not-to-say';
  phoneNumber?: string;
  createdAt: Date;
  healthInfo?: HealthInfo;
}

interface HealthInfo {
  allergies?: string[];
  bloodType?: 'A+' | 'A-' | 'B+' | 'B-' | 'O+' | 'O-' | 'AB+' | 'AB-';
  height?: number; // cm
  weight?: number; // kg
  bmi?: number;
  medications?: string[];
  conditions?: string[];
}
```

### Medication Types
```typescript
interface Medication {
  id: string;
  userId: string;
  name: string;
  dosage: string;
  dosageUnit: 'mg' | 'ml' | 'tablets' | 'drops' | 'puffs';
  type: 'tablet' | 'syrup' | 'injection' | 'drops' | 'inhaler' | 'cream';
  frequency: 'daily' | 'weekly' | 'monthly' | 'as-needed';
  schedule: MedicationSchedule;
  reminders: ReminderSettings;
  startDate: Date;
  endDate?: Date;
  prescriptionImage?: string;
  notes?: string;
  isActive: boolean;
  createdAt: Date;
}

interface MedicationSchedule {
  days: ('monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday')[];
  times: string[]; // ['08:00', '14:00', '20:00']
  beforeAfterMeal?: 'before' | 'after' | 'with' | 'anytime';
}
```

### Notification Types
```typescript
interface Notification {
  id: string;
  type: 'medication' | 'fall-alert' | 'family-update' | 'system';
  title: string;
  message: string;
  timestamp: Date;
  isRead: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  actionUrl?: string;
  metadata?: Record<string, any>;
}
```

### Family Types
```typescript
interface FamilyMember {
  id: string;
  userId: string;
  name: string;
  avatar?: string;
  relationship: 'parent' | 'child' | 'spouse' | 'sibling' | 'caregiver' | 'other';
  followStatus: 'pending' | 'accepted' | 'rejected';
  permissions: FamilyMemberPermissions;
  notificationsEnabled: boolean;
}

interface Group {
  id: string;
  name: string;
  description?: string;
  ownerId: string;
  memberIds: string[];
  createdAt: Date;
}
```

## Usage Examples

### Auth Store

#### Login
```tsx
import { useAuthStore } from '@/lib/stores';

function LoginScreen() {
  const login = useAuthStore((state) => state.login);

  const handleLogin = async () => {
    const user = {
      id: '123',
      email: 'john@example.com',
      name: 'John Doe',
      dateOfBirth: new Date('1990-01-01'),
      gender: 'male' as const,
      createdAt: new Date(),
    };

    await login(user, 'auth_token_here');
  };

  return <Button onPress={handleLogin}>Login</Button>;
}
```

#### Access User
```tsx
import { useAuthStore, selectUser } from '@/lib/stores';

function ProfileScreen() {
  const user = useAuthStore(selectUser);

  return <Text>Welcome, {user?.name}</Text>;
}
```

#### Logout
```tsx
import { useAuthStore } from '@/lib/stores';

function LogoutButton() {
  const logout = useAuthStore((state) => state.logout);

  return <Button onPress={logout}>Logout</Button>;
}
```

### Medication Store

#### Add Medication
```tsx
import { useMedicationStore } from '@/lib/stores';
import type { Medication } from '@/lib/types';

function AddMedicationScreen() {
  const addMedication = useMedicationStore((state) => state.addMedication);

  const handleAdd = () => {
    const medication: Medication = {
      id: 'med_123',
      userId: 'user_123',
      name: 'Aspirin',
      dosage: '100',
      dosageUnit: 'mg',
      type: 'tablet',
      frequency: 'daily',
      schedule: {
        days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
        times: ['08:00', '20:00'],
        beforeAfterMeal: 'after',
      },
      reminders: {
        enabled: true,
        minutesBefore: 15,
        onTime: true,
        minutesAfter: 15,
      },
      startDate: new Date(),
      isActive: true,
      createdAt: new Date(),
    };

    addMedication(medication);
  };

  return <Button onPress={handleAdd}>Add Medication</Button>;
}
```

#### Get Today's Medications
```tsx
import { useMedicationStore, selectMedicationsForToday } from '@/lib/stores';

function TodayMedicationsScreen() {
  const medications = useMedicationStore(selectMedicationsForToday);

  return (
    <View>
      {medications.map((med) => (
        <Text key={med.id}>{med.name} - {med.dosage}{med.dosageUnit}</Text>
      ))}
    </View>
  );
}
```

#### Get Active Count
```tsx
import { useMedicationStore, selectActiveCount } from '@/lib/stores';

function MedicationBadge() {
  const activeCount = useMedicationStore(selectActiveCount);

  return <Text>Active Medications: {activeCount}</Text>;
}
```

#### Update Medication
```tsx
import { useMedicationStore } from '@/lib/stores';

function EditMedicationScreen({ medicationId }: { medicationId: string }) {
  const updateMedication = useMedicationStore((state) => state.updateMedication);

  const handleUpdate = () => {
    updateMedication(medicationId, {
      dosage: '200',
      notes: 'Increased dosage per doctor',
    });
  };

  return <Button onPress={handleUpdate}>Update Dosage</Button>;
}
```

### Notification Store

#### Add Notification
```tsx
import { useNotificationStore, createNotification } from '@/lib/stores';

function MedicationReminderService() {
  const addNotification = useNotificationStore((state) => state.addNotification);

  const sendReminder = () => {
    const notification = createNotification(
      'medication',
      'Medication Reminder',
      'Time to take Aspirin 100mg',
      'high',
      { medicationId: 'med_123' }
    );

    addNotification(notification);
  };

  return <Button onPress={sendReminder}>Send Reminder</Button>;
}
```

#### Display Unread Count
```tsx
import { useNotificationStore, selectUnreadCount } from '@/lib/stores';

function NotificationBadge() {
  const unreadCount = useNotificationStore(selectUnreadCount);

  if (unreadCount === 0) return null;

  return (
    <View className="absolute -right-1 -top-1 h-5 w-5 rounded-full bg-danger">
      <Text className="text-xs text-white">{unreadCount}</Text>
    </View>
  );
}
```

#### Mark as Read
```tsx
import { useNotificationStore } from '@/lib/stores';

function NotificationItem({ notificationId }: { notificationId: string }) {
  const markAsRead = useNotificationStore((state) => state.markAsRead);

  const handlePress = () => {
    markAsRead(notificationId);
  };

  return <Pressable onPress={handlePress}>...</Pressable>;
}
```

#### Clear All Notifications
```tsx
import { useNotificationStore } from '@/lib/stores';

function ClearAllButton() {
  const clearAll = useNotificationStore((state) => state.clearAll);

  return <Button onPress={clearAll}>Clear All</Button>;
}
```

### Family Store

#### Add Family Member
```tsx
import { useFamilyStore } from '@/lib/stores';
import type { FamilyMember } from '@/lib/types';

function AddFamilyMemberScreen() {
  const addMember = useFamilyStore((state) => state.addMember);

  const handleAdd = () => {
    const member: FamilyMember = {
      id: 'member_123',
      userId: 'user_456',
      name: 'Mary Johnson',
      relationship: 'parent',
      followStatus: 'pending',
      permissions: {
        canViewMedications: true,
        canReceiveAlerts: true,
        canEditSchedule: false,
      },
      notificationsEnabled: true,
    };

    addMember(member);
  };

  return <Button onPress={handleAdd}>Add Family Member</Button>;
}
```

#### Accept Follow Request
```tsx
import { useFamilyStore } from '@/lib/stores';

function FollowRequestItem({ memberId }: { memberId: string }) {
  const acceptFollowRequest = useFamilyStore((state) => state.acceptFollowRequest);
  const rejectFollowRequest = useFamilyStore((state) => state.rejectFollowRequest);

  return (
    <View>
      <Button onPress={() => acceptFollowRequest(memberId)}>Accept</Button>
      <Button onPress={() => rejectFollowRequest(memberId)}>Reject</Button>
    </View>
  );
}
```

#### Get Accepted Members
```tsx
import { useFamilyStore, selectAcceptedMembers } from '@/lib/stores';

function FamilyListScreen() {
  const members = useFamilyStore(selectAcceptedMembers);

  return (
    <View>
      {members.map((member) => (
        <Text key={member.id}>{member.name} - {member.relationship}</Text>
      ))}
    </View>
  );
}
```

#### Update Permissions
```tsx
import { useFamilyStore } from '@/lib/stores';

function MemberPermissionsScreen({ memberId }: { memberId: string }) {
  const updatePermissions = useFamilyStore((state) => state.updatePermissions);

  const toggleMedicationView = () => {
    updatePermissions(memberId, {
      canViewMedications: true,
    });
  };

  return <Button onPress={toggleMedicationView}>Allow Medication View</Button>;
}
```

## Advanced Usage

### Combining Multiple Stores
```tsx
import { useAuthStore, useMedicationStore, useNotificationStore } from '@/lib/stores';

function DashboardScreen() {
  const user = useAuthStore((state) => state.user);
  const activeCount = useMedicationStore((state) => state.getActiveCount());
  const unreadCount = useNotificationStore((state) => state.getUnreadCount());

  return (
    <View>
      <Text>Welcome, {user?.name}</Text>
      <Text>Active Medications: {activeCount}</Text>
      <Text>Unread Notifications: {unreadCount}</Text>
    </View>
  );
}
```

### Using Selectors for Performance
```tsx
import { useMedicationStore } from '@/lib/stores';

// Good: Only re-renders when active count changes
function MedicationCount() {
  const activeCount = useMedicationStore((state) => state.getActiveCount());
  return <Text>{activeCount}</Text>;
}

// Bad: Re-renders on any medication store change
function MedicationCountBad() {
  const store = useMedicationStore();
  return <Text>{store.getActiveCount()}</Text>;
}
```

### Subscribing to Store Changes
```tsx
import { useEffect } from 'react';
import { useMedicationStore } from '@/lib/stores';

function MedicationSyncService() {
  useEffect(() => {
    const unsubscribe = useMedicationStore.subscribe(
      (state) => state.medications,
      (medications) => {
        // Sync medications to server
        console.log('Medications changed:', medications);
      }
    );

    return unsubscribe;
  }, []);

  return null;
}
```

## Persistence

All stores automatically persist to AsyncStorage with these keys:
- `medisync_auth` - Authentication state
- `medisync_medications` - Medications and events
- `medisync_notifications` - Notifications
- `medisync_family` - Family members and groups

### Clear All Persisted Data
```tsx
import AsyncStorage from '@react-native-async-storage/async-storage';

const clearAllData = async () => {
  await AsyncStorage.multiRemove([
    'medisync_auth',
    'medisync_medications',
    'medisync_notifications',
    'medisync_family',
  ]);
};
```

## Best Practices

1. **Use selectors** for better performance
2. **Keep actions simple** - Complex logic should be in helper functions
3. **Normalize data** - Store IDs and use getters to join data
4. **Avoid deep nesting** - Keep state flat where possible
5. **Use TypeScript** - All stores are fully typed
6. **Handle errors** - Wrap async actions in try-catch
7. **Clear on logout** - Auth store automatically clears all stores

## Testing Stores

```tsx
import { renderHook, act } from '@testing-library/react-native';
import { useMedicationStore } from '@/lib/stores';

test('should add medication', () => {
  const { result } = renderHook(() => useMedicationStore());

  act(() => {
    result.current.addMedication(mockMedication);
  });

  expect(result.current.medications).toHaveLength(1);
});
```

## Migration from Other State Management

If migrating from Redux/Context:
1. Replace `useSelector` with Zustand selectors
2. Replace `dispatch(action())` with direct store calls
3. Remove reducers, actions, and action creators
4. Update TypeScript types to match store interfaces

## TODO

- [ ] Add optimistic updates for API calls
- [ ] Implement undo/redo functionality
- [ ] Add data validation middleware
- [ ] Set up store DevTools for debugging
- [ ] Add rate limiting for API actions
- [ ] Implement conflict resolution for offline sync
