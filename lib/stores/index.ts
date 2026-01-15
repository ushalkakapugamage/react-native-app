/**
 * MediSync Stores
 * Centralized export for all Zustand stores
 */

// Auth Store
export {
  useAuthStore,
  selectUser,
  selectToken,
  selectIsAuthenticated,
  selectIsLoading as selectAuthIsLoading,
} from './useAuthStore';

// Medication Store
export {
  useMedicationStore,
  selectMedications,
  selectEvents,
  selectActiveMedications,
  selectUpcomingMedications,
  selectMedicationsForToday,
  selectActiveCount,
  selectAdherenceRate,
  selectIsLoading as selectMedicationIsLoading,
} from './useMedicationStore';

// Notification Store
export {
  useNotificationStore,
  selectNotifications,
  selectUnreadCount,
  selectUnreadNotifications,
  selectRecentNotifications,
  selectIsLoading as selectNotificationIsLoading,
  createNotification,
} from './useNotificationStore';

// Family Store
export {
  useFamilyStore,
  selectGroups,
  selectMembers,
  selectAcceptedMembers,
  selectPendingMembers,
  selectActiveMembersCount,
  selectMembersWithAlerts,
  selectIsLoading as selectFamilyIsLoading,
} from './useFamilyStore';

// Activity Store
export {
  useActivityStore,
  selectActivities,
  selectRecentActivities,
  selectIsLoading as selectActivityIsLoading,
  createActivity,
  formatRelativeTime,
} from './useActivityStore';
export type { Activity, ActivityType } from './useActivityStore';

// Re-export types
export type { User, HealthInfo } from '@/lib/types';
export type { Medication, MedicationEvent, MedicationSchedule } from '@/lib/types';
export type { Notification, NotificationType, NotificationPriority } from '@/lib/types';
export type { Group, FamilyMember, FamilyMemberPermissions } from '@/lib/types';
