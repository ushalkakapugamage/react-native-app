/**
 * MediSync TypeScript Types
 * Complete type definitions for the application
 */

// ==================== User Types ====================

export interface HealthInfo {
  allergies?: string[];
  bloodType?: 'A+' | 'A-' | 'B+' | 'B-' | 'O+' | 'O-' | 'AB+' | 'AB-';
  height?: number; // in cm
  weight?: number; // in kg
  bmi?: number;
  medications?: string[];
  conditions?: string[];
}

export interface User {
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

// ==================== Medication Types ====================

export type DosageUnit = 'mg' | 'ml' | 'tablets' | 'drops' | 'puffs' | 'patches' | 'units';

export type MedicationType = 'tablet' | 'capsule' | 'syrup' | 'injection' | 'drops' | 'inhaler' | 'patch' | 'cream' | 'other';

export type MedicationFrequency = 'daily' | 'weekly' | 'monthly' | 'as-needed';

export type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

export type MealTiming = 'before' | 'after' | 'with' | 'anytime';

export type PlanStatus = 'active' | 'paused' | 'completed';

export interface MedicationSchedule {
  days: DayOfWeek[];
  times: string[]; // e.g., ['08:00', '14:00', '20:00']
  beforeAfterMeal?: MealTiming;
}

export interface ReminderSettings {
  enabled: boolean;
  minutesBefore: number; // default 15
  onTime: boolean;
  minutesAfter: number; // default 15
}

export interface MedicationPlan {
  id: string;
  userId: string;
  planName: string;                    // e.g., "Diabetes Management", "Heart Condition Treatment"
  condition?: string;                  // e.g., "Type 2 Diabetes", "Hypertension" (optional)
  prescribedBy?: string;               // Doctor name (optional)
  prescriptionImage?: string;          // Image of the prescription (base64 or URI)
  prescriptionDate?: Date;             // When prescribed
  medications: Medication[];           // Array of medications in this plan
  notes?: string;                      // Plan-level notes
  isActive: boolean;
  status: PlanStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface Medication {
  id: string;
  planId: string;                      // Reference to parent plan
  name: string;
  dosage: string;
  dosageUnit: DosageUnit;
  type: MedicationType;
  frequency: MedicationFrequency;
  schedule: MedicationSchedule;
  reminders: ReminderSettings;
  startDate: Date;
  endDate?: Date;
  notes?: string;                      // Medication-specific notes
  isActive: boolean;
  createdAt: Date;
}

// ==================== Medication Event Types ====================

export type MedicationEventStatus = 'pending' | 'taken' | 'missed' | 'skipped';

export interface MedicationEvent {
  planId: string;
  id: string;
  medicationId: string;
  scheduledTime: Date;
  takenTime?: Date;
  status: MedicationEventStatus;
  notes?: string;
}

// ==================== Notification Types ====================

export type NotificationType = 'medication' | 'fall-alert' | 'family-update' | 'system';

export type NotificationPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: Date;
  isRead: boolean;
  priority: NotificationPriority;
  actionUrl?: string;
  metadata?: Record<string, any>;
}

// ==================== Family & Group Types ====================

export interface Group {
  id: string;
  name: string;
  description?: string;
  ownerId: string;
  memberIds: string[];
  createdAt: Date;
}

export type Relationship = 'parent' | 'child' | 'spouse' | 'sibling' | 'caregiver' | 'other';

export type FollowStatus = 'pending' | 'accepted' | 'rejected';

export interface FamilyMemberPermissions {
  canViewMedications: boolean;
  canReceiveAlerts: boolean;
  canEditSchedule: boolean;
}

export interface FamilyMember {
  id: string;
  userId: string;
  name: string;
  avatar?: string;
  relationship: Relationship;
  followStatus: FollowStatus;
  permissions: FamilyMemberPermissions;
  notificationsEnabled: boolean;
}

// ==================== Store State Types ====================

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface MedicationState {
  plans: MedicationPlan[];
  events: MedicationEvent[];
  isLoading: boolean;
}

export interface NotificationState {
  notifications: Notification[];
  isLoading: boolean;
}

export interface FamilyState {
  groups: Group[];
  members: FamilyMember[];
  isLoading: boolean;
}

// ==================== API Response Types ====================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// ==================== Utility Types ====================

export type ID = string;

export type Timestamp = Date;

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};
