/**
 * MediSync Medication Store
 * Manages medication data with persistence
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { Medication, MedicationEvent, DayOfWeek } from '@/lib/types';

interface MedicationState {
  // State
  medications: Medication[];
  events: MedicationEvent[];
  isLoading: boolean;

  // Medication CRUD
  addMedication: (medication: Medication) => void;
  updateMedication: (id: string, updates: Partial<Medication>) => void;
  deleteMedication: (id: string) => void;
  getMedicationById: (id: string) => Medication | undefined;

  // Event Management
  addEvent: (event: MedicationEvent) => void;
  updateEvent: (id: string, updates: Partial<MedicationEvent>) => void;
  deleteEvent: (id: string) => void;

  // Helper methods
  getActiveMedications: () => Medication[];
  getInactiveMedications: () => Medication[];
  getUpcomingMedications: (hours?: number) => Medication[];
  getMedicationsByDay: (day: DayOfWeek) => Medication[];
  getActiveCount: () => number;
  getMedicationsForToday: () => Medication[];
  getTodayEvents: () => MedicationEvent[];
  getPendingEvents: () => MedicationEvent[];
  getTakenEventsCount: () => number;
  getMissedEventsCount: () => number;
  calculateAdherenceRate: (days?: number) => number;

  // Utility
  setLoading: (loading: boolean) => void;
  clearAll: () => void;
}

export const useMedicationStore = create<MedicationState>()(
  persist(
    (set, get) => ({
      // Initial state
      medications: [],
      events: [],
      isLoading: false,

      // Add medication
      addMedication: (medication: Medication) => {
        set((state) => ({
          medications: [...state.medications, medication],
        }));
      },

      // Update medication
      updateMedication: (id: string, updates: Partial<Medication>) => {
        set((state) => ({
          medications: state.medications.map((med) =>
            med.id === id ? { ...med, ...updates } : med
          ),
        }));
      },

      // Delete medication
      deleteMedication: (id: string) => {
        set((state) => ({
          medications: state.medications.filter((med) => med.id !== id),
          events: state.events.filter((event) => event.medicationId !== id),
        }));
      },

      // Get medication by ID
      getMedicationById: (id: string) => {
        return get().medications.find((med) => med.id === id);
      },

      // Add event
      addEvent: (event: MedicationEvent) => {
        set((state) => ({
          events: [...state.events, event],
        }));
      },

      // Update event
      updateEvent: (id: string, updates: Partial<MedicationEvent>) => {
        set((state) => ({
          events: state.events.map((event) =>
            event.id === id ? { ...event, ...updates } : event
          ),
        }));
      },

      // Delete event
      deleteEvent: (id: string) => {
        set((state) => ({
          events: state.events.filter((event) => event.id !== id),
        }));
      },

      // Get active medications
      getActiveMedications: () => {
        return get().medications.filter((med) => med.isActive);
      },

      // Get inactive medications
      getInactiveMedications: () => {
        return get().medications.filter((med) => !med.isActive);
      },

      // Get upcoming medications (next N hours)
      getUpcomingMedications: (hours: number = 24) => {
        const now = new Date();
        const futureTime = new Date(now.getTime() + hours * 60 * 60 * 1000);

        return get()
          .medications.filter((med) => {
            if (!med.isActive) return false;

            // Check if any scheduled time is within the next N hours
            const dayNames: DayOfWeek[] = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
            const today = dayNames[now.getDay()];
            if (!med.schedule.days.includes(today)) return false;

            return med.schedule.times.some((time) => {
              const [hours, minutes] = time.split(':').map(Number);
              const scheduledTime = new Date(now);
              scheduledTime.setHours(hours, minutes, 0, 0);

              return scheduledTime >= now && scheduledTime <= futureTime;
            });
          })
          .sort((a, b) => {
            const aTime = a.schedule.times[0];
            const bTime = b.schedule.times[0];
            return aTime.localeCompare(bTime);
          });
      },

      // Get medications by day of week
      getMedicationsByDay: (day: DayOfWeek) => {
        return get()
          .medications.filter(
            (med) => med.isActive && med.schedule.days.includes(day)
          )
          .sort((a, b) => {
            const aTime = a.schedule.times[0];
            const bTime = b.schedule.times[0];
            return aTime.localeCompare(bTime);
          });
      },

      // Get active medication count
      getActiveCount: () => {
        return get().medications.filter((med) => med.isActive).length;
      },

      // Get medications for today
      getMedicationsForToday: () => {
        const today = new Date()
          .toLocaleDateString('en-US', { weekday: 'long' })
          .toLowerCase() as DayOfWeek;
        return get().getMedicationsByDay(today);
      },

      // Get today's events
      getTodayEvents: () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        return get().events.filter((event) => {
          const scheduledTime = new Date(event.scheduledTime);
          return scheduledTime >= today && scheduledTime < tomorrow;
        });
      },

      // Get pending events
      getPendingEvents: () => {
        return get().events.filter((event) => event.status === 'pending');
      },

      // Get taken events count for today
      getTakenEventsCount: () => {
        return get()
          .getTodayEvents()
          .filter((event) => event.status === 'taken').length;
      },

      // Get missed events count for today
      getMissedEventsCount: () => {
        return get()
          .getTodayEvents()
          .filter((event) => event.status === 'missed').length;
      },

      // Calculate adherence rate for last N days
      calculateAdherenceRate: (days: number = 7) => {
        const now = new Date();
        const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
        startDate.setHours(0, 0, 0, 0);

        const events = get().events.filter((event) => {
          const scheduledTime = new Date(event.scheduledTime);
          return (
            scheduledTime >= startDate &&
            scheduledTime <= now &&
            (event.status === 'taken' || event.status === 'missed')
          );
        });

        if (events.length === 0) {
          // If no events, check if there are active medications
          const activeMeds = get().getActiveMedications();
          return activeMeds.length > 0 ? 0 : 100;
        }

        const takenCount = events.filter((event) => event.status === 'taken').length;
        return Math.round((takenCount / events.length) * 100);
      },

      // Set loading state
      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      // Clear all medications and events
      clearAll: () => {
        set({
          medications: [],
          events: [],
        });
      },
    }),
    {
      name: 'medisync_medications',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        medications: state.medications,
        events: state.events,
      }),
    }
  )
);

// Selectors
export const selectMedications = (state: MedicationState) => state.medications;
export const selectEvents = (state: MedicationState) => state.events;
export const selectActiveMedications = (state: MedicationState) =>
  state.getActiveMedications();
export const selectUpcomingMedications = (state: MedicationState) =>
  state.getUpcomingMedications();
export const selectMedicationsForToday = (state: MedicationState) =>
  state.getMedicationsForToday();
export const selectActiveCount = (state: MedicationState) => state.getActiveCount();
export const selectAdherenceRate = (state: MedicationState) =>
  state.calculateAdherenceRate();
export const selectIsLoading = (state: MedicationState) => state.isLoading;
