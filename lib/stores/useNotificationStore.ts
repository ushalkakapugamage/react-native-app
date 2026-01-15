/**
 * MediSync Notification Store
 * Manages notifications with persistence
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { Notification, NotificationType, NotificationPriority } from '@/lib/types';

interface NotificationState {
  // State
  notifications: Notification[];
  isLoading: boolean;

  // Actions
  addNotification: (notification: Notification) => void;
  removeNotification: (id: string) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
  clearRead: () => void;

  // Getters
  getUnreadCount: () => number;
  getNotificationsByType: (type: NotificationType) => Notification[];
  getNotificationsByPriority: (priority: NotificationPriority) => Notification[];
  getRecentNotifications: (limit?: number) => Notification[];
  getUnreadNotifications: () => Notification[];

  // Utility
  setLoading: (loading: boolean) => void;
}

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set, get) => ({
      // Initial state
      notifications: [],
      isLoading: false,

      // Add notification
      addNotification: (notification: Notification) => {
        set((state) => ({
          notifications: [notification, ...state.notifications],
        }));
      },

      // Remove notification
      removeNotification: (id: string) => {
        set((state) => ({
          notifications: state.notifications.filter((notif) => notif.id !== id),
        }));
      },

      // Mark notification as read
      markAsRead: (id: string) => {
        set((state) => ({
          notifications: state.notifications.map((notif) =>
            notif.id === id ? { ...notif, isRead: true } : notif
          ),
        }));
      },

      // Mark all notifications as read
      markAllAsRead: () => {
        set((state) => ({
          notifications: state.notifications.map((notif) => ({
            ...notif,
            isRead: true,
          })),
        }));
      },

      // Clear all notifications
      clearAll: () => {
        set({ notifications: [] });
      },

      // Clear read notifications
      clearRead: () => {
        set((state) => ({
          notifications: state.notifications.filter((notif) => !notif.isRead),
        }));
      },

      // Get unread count
      getUnreadCount: () => {
        return get().notifications.filter((notif) => !notif.isRead).length;
      },

      // Get notifications by type
      getNotificationsByType: (type: NotificationType) => {
        return get()
          .notifications.filter((notif) => notif.type === type)
          .sort(
            (a, b) =>
              new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
          );
      },

      // Get notifications by priority
      getNotificationsByPriority: (priority: NotificationPriority) => {
        return get()
          .notifications.filter((notif) => notif.priority === priority)
          .sort(
            (a, b) =>
              new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
          );
      },

      // Get recent notifications
      getRecentNotifications: (limit: number = 10) => {
        return get()
          .notifications.slice(0, limit)
          .sort(
            (a, b) =>
              new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
          );
      },

      // Get unread notifications
      getUnreadNotifications: () => {
        return get()
          .notifications.filter((notif) => !notif.isRead)
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
      name: 'medisync_notifications',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        notifications: state.notifications,
      }),
    }
  )
);

// Selectors
export const selectNotifications = (state: NotificationState) => state.notifications;
export const selectUnreadCount = (state: NotificationState) => state.getUnreadCount();
export const selectUnreadNotifications = (state: NotificationState) =>
  state.getUnreadNotifications();
export const selectRecentNotifications = (state: NotificationState) =>
  state.getRecentNotifications();
export const selectIsLoading = (state: NotificationState) => state.isLoading;

// Helper function to create notifications
export const createNotification = (
  type: NotificationType,
  title: string,
  message: string,
  priority: NotificationPriority = 'medium',
  metadata?: Record<string, any>
): Notification => {
  return {
    id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type,
    title,
    message,
    timestamp: new Date(),
    isRead: false,
    priority,
    metadata,
  };
};
