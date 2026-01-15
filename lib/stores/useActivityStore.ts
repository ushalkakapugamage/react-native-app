/**
 * MediSync Activity Store
 * Manages activity log for dashboard timeline
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type ActivityType =
  | 'medication_taken'
  | 'medication_missed'
  | 'medication_skipped'
  | 'fall_alert'
  | 'family_added'
  | 'family_removed'
  | 'reminder_sent'
  | 'medication_added'
  | 'medication_updated'
  | 'group_created'
  | 'device_paired';

export interface Activity {
  id: string;
  type: ActivityType;
  title: string;
  description: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

interface ActivityState {
  // State
  activities: Activity[];
  isLoading: boolean;

  // Actions
  addActivity: (activity: Omit<Activity, 'id' | 'timestamp'>) => void;
  removeActivity: (id: string) => void;
  clearAll: () => void;
  clearOlderThan: (days: number) => void;

  // Getters
  getRecentActivities: (limit?: number) => Activity[];
  getActivitiesByType: (type: ActivityType) => Activity[];
  getActivitiesForDay: (date: Date) => Activity[];

  // Utility
  setLoading: (loading: boolean) => void;
}

export const useActivityStore = create<ActivityState>()(
  persist(
    (set, get) => ({
      // Initial state
      activities: [],
      isLoading: false,

      // Add activity
      addActivity: (activityData) => {
        const activity: Activity = {
          ...activityData,
          id: `activity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          timestamp: new Date(),
        };

        set((state) => ({
          activities: [activity, ...state.activities].slice(0, 100), // Keep last 100 activities
        }));
      },

      // Remove activity
      removeActivity: (id: string) => {
        set((state) => ({
          activities: state.activities.filter((activity) => activity.id !== id),
        }));
      },

      // Clear all activities
      clearAll: () => {
        set({ activities: [] });
      },

      // Clear activities older than N days
      clearOlderThan: (days: number) => {
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - days);

        set((state) => ({
          activities: state.activities.filter(
            (activity) => new Date(activity.timestamp) >= cutoff
          ),
        }));
      },

      // Get recent activities (sorted by timestamp, newest first)
      getRecentActivities: (limit: number = 5) => {
        return get()
          .activities.slice(0, limit)
          .sort(
            (a, b) =>
              new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
          );
      },

      // Get activities by type
      getActivitiesByType: (type: ActivityType) => {
        return get()
          .activities.filter((activity) => activity.type === type)
          .sort(
            (a, b) =>
              new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
          );
      },

      // Get activities for a specific day
      getActivitiesForDay: (date: Date) => {
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        return get()
          .activities.filter((activity) => {
            const activityDate = new Date(activity.timestamp);
            return activityDate >= startOfDay && activityDate <= endOfDay;
          })
          .sort(
            (a, b) =>
              new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
          );
      },

      // Set loading state
      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },
    }),
    {
      name: 'medisync_activities',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        activities: state.activities,
      }),
    }
  )
);

// Selectors
export const selectActivities = (state: ActivityState) => state.activities;
export const selectRecentActivities = (state: ActivityState) =>
  state.getRecentActivities();
export const selectIsLoading = (state: ActivityState) => state.isLoading;

// Helper function to create activity
export const createActivity = (
  type: ActivityType,
  title: string,
  description: string,
  metadata?: Record<string, any>
): Omit<Activity, 'id' | 'timestamp'> => ({
  type,
  title,
  description,
  metadata,
});

// Helper to format relative time
export const formatRelativeTime = (date: Date): string => {
  const now = new Date();
  const diffMs = now.getTime() - new Date(date).getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  return new Date(date).toLocaleDateString();
};
