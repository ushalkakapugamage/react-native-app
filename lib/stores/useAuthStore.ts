/**
 * MediSync Auth Store
 * Manages user authentication state with persistence
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { User } from '@/lib/types';

interface AuthState {
  // State
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Actions
  login: (user: User, token: string) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User) => void;
  updateUser: (updates: Partial<User>) => void;
  checkAuth: () => Promise<boolean>;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      // Login user
      login: async (user: User, token: string) => {
        try {
          set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          console.error('Login error:', error);
          throw error;
        }
      },

      // Logout user
      logout: async () => {
        try {
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
          });

          // Clear all stores on logout
          await AsyncStorage.multiRemove([
            'medisync_auth',
            'medisync_medications',
            'medisync_notifications',
            'medisync_family',
          ]);
        } catch (error) {
          console.error('Logout error:', error);
          throw error;
        }
      },

      // Set user
      setUser: (user: User) => {
        set({ user });
      },

      // Update user
      updateUser: (updates: Partial<User>) => {
        const currentUser = get().user;
        if (!currentUser) return;

        set({
          user: {
            ...currentUser,
            ...updates,
          },
        });
      },

      // Check authentication status
      checkAuth: async () => {
        try {
          const { token, user } = get();

          // Check if token exists and is valid
          if (!token || !user) {
            set({ isAuthenticated: false });
            return false;
          }

          // TODO: Validate token with API
          // const response = await fetch('/api/auth/verify', {
          //   headers: { Authorization: `Bearer ${token}` }
          // });

          // For now, just check if token exists
          set({ isAuthenticated: true });
          return true;
        } catch (error) {
          console.error('Auth check error:', error);
          set({ isAuthenticated: false });
          return false;
        }
      },

      // Set loading state
      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },
    }),
    {
      name: 'medisync_auth',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// Selectors
export const selectUser = (state: AuthState) => state.user;
export const selectToken = (state: AuthState) => state.token;
export const selectIsAuthenticated = (state: AuthState) => state.isAuthenticated;
export const selectIsLoading = (state: AuthState) => state.isLoading;
