/**
 * MediSync Medication Store
 * Manages medication plans and medications with persistence
 *
 * Architecture: Users create Medication Plans (prescriptions from doctors)
 * and add individual medications to each plan.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { MedicationPlan, Medication, MedicationEvent, DayOfWeek } from '@/lib/types';

interface UpcomingMedication {
  plan: MedicationPlan;
  medication: Medication;
  nextDose: Date;
  time: string;
}

interface MedicationStore {
  // State
  plans: MedicationPlan[];
  events: MedicationEvent[];
  isLoading: boolean;

  // Plan CRUD
  addPlan: (plan: MedicationPlan) => void;
  updatePlan: (planId: string, updates: Partial<MedicationPlan>) => void;
  deletePlan: (planId: string) => void;
  getPlanById: (planId: string) => MedicationPlan | undefined;

  // Medication CRUD (within plans)
  addMedicationToPlan: (planId: string, medication: Medication) => void;
  updateMedication: (planId: string, medicationId: string, updates: Partial<Medication>) => void;
  deleteMedication: (planId: string, medicationId: string) => void;
  getMedicationById: (planId: string, medicationId: string) => Medication | undefined;

  // Events
  addEvent: (event: MedicationEvent) => void;
  updateEvent: (eventId: string, updates: Partial<MedicationEvent>) => void;
  deleteEvent: (eventId: string) => void;
  getEventsByPlan: (planId: string) => MedicationEvent[];
  getEventsByMedication: (medicationId: string) => MedicationEvent[];

  // Helpers
  getAllMedications: () => Medication[];
  getActivePlans: () => MedicationPlan[];
  getPausedPlans: () => MedicationPlan[];
  getCompletedPlans: () => MedicationPlan[];
  getUpcomingMedications: (hours?: number) => UpcomingMedication[];
  getMedicationsForToday: () => Array<{ plan: MedicationPlan; medication: Medication }>;
  getTodaysMedicationsCount: () => number;
  getActiveCount: () => number;
  getTodayEvents: () => MedicationEvent[];
  getPendingEvents: () => MedicationEvent[];
  getTakenEventsCount: () => number;
  getMissedEventsCount: () => number;
  calculateAdherenceRate: (days?: number) => number;
  calculatePlanAdherenceRate: (planId: string, days?: number) => number;

  // Utility
  setLoading: (loading: boolean) => void;
  clearAll: () => void;
}

export const useMedicationStore = create<MedicationStore>()(
  persist(
    (set, get) => ({
      // Initial state
      plans: [],
      events: [],
      isLoading: false,

      // ==================== Plan CRUD ====================

      addPlan: (plan: MedicationPlan) => {
        set((state) => ({
          plans: [...state.plans, plan],
        }));
      },

      updatePlan: (planId: string, updates: Partial<MedicationPlan>) => {
        set((state) => ({
          plans: state.plans.map((plan) =>
            plan.id === planId
              ? { ...plan, ...updates, updatedAt: new Date() }
              : plan
          ),
        }));
      },

      deletePlan: (planId: string) => {
        set((state) => ({
          plans: state.plans.filter((plan) => plan.id !== planId),
          events: state.events.filter((event) => event.planId !== planId),
        }));
      },

      getPlanById: (planId: string) => {
        return get().plans.find((plan) => plan.id === planId);
      },

      // ==================== Medication CRUD ====================

      addMedicationToPlan: (planId: string, medication: Medication) => {
        set((state) => ({
          plans: state.plans.map((plan) =>
            plan.id === planId
              ? {
                  ...plan,
                  medications: [...plan.medications, medication],
                  updatedAt: new Date(),
                }
              : plan
          ),
        }));
      },

      updateMedication: (planId: string, medicationId: string, updates: Partial<Medication>) => {
        set((state) => ({
          plans: state.plans.map((plan) =>
            plan.id === planId
              ? {
                  ...plan,
                  medications: plan.medications.map((med) =>
                    med.id === medicationId ? { ...med, ...updates } : med
                  ),
                  updatedAt: new Date(),
                }
              : plan
          ),
        }));
      },

      deleteMedication: (planId: string, medicationId: string) => {
        set((state) => ({
          plans: state.plans.map((plan) =>
            plan.id === planId
              ? {
                  ...plan,
                  medications: plan.medications.filter((med) => med.id !== medicationId),
                  updatedAt: new Date(),
                }
              : plan
          ),
          events: state.events.filter((event) => event.medicationId !== medicationId),
        }));
      },

      getMedicationById: (planId: string, medicationId: string) => {
        const plan = get().plans.find((p) => p.id === planId);
        return plan?.medications.find((m) => m.id === medicationId);
      },

      // ==================== Event Management ====================

      addEvent: (event: MedicationEvent) => {
        set((state) => ({
          events: [...state.events, event],
        }));
      },

      updateEvent: (eventId: string, updates: Partial<MedicationEvent>) => {
        set((state) => ({
          events: state.events.map((event) =>
            event.id === eventId ? { ...event, ...updates } : event
          ),
        }));
      },

      deleteEvent: (eventId: string) => {
        set((state) => ({
          events: state.events.filter((event) => event.id !== eventId),
        }));
      },

      getEventsByPlan: (planId: string) => {
        return get().events.filter((event) => event.planId === planId);
      },

      getEventsByMedication: (medicationId: string) => {
        return get().events.filter((event) => event.medicationId === medicationId);
      },

      // ==================== Helpers ====================

      getAllMedications: () => {
        return get().plans.flatMap((plan) => plan.medications);
      },

      getActivePlans: () => {
        return get().plans.filter((plan) => plan.isActive && plan.status === 'active');
      },

      getPausedPlans: () => {
        return get().plans.filter((plan) => plan.status === 'paused');
      },

      getCompletedPlans: () => {
        return get().plans.filter((plan) => plan.status === 'completed');
      },

      getUpcomingMedications: (hours: number = 24): UpcomingMedication[] => {
        const now = new Date();
        const futureTime = new Date(now.getTime() + hours * 60 * 60 * 1000);
        const dayNames: DayOfWeek[] = [
          'sunday',
          'monday',
          'tuesday',
          'wednesday',
          'thursday',
          'friday',
          'saturday',
        ];
        const today = dayNames[now.getDay()];

        const upcoming: UpcomingMedication[] = [];

        get().plans.forEach((plan) => {
          if (!plan.isActive || plan.status !== 'active') return;

          plan.medications.forEach((medication) => {
            if (!medication.isActive) return;
            if (!medication.schedule.days.includes(today)) return;

            medication.schedule.times.forEach((time) => {
              const [hours, minutes] = time.split(':').map(Number);
              const scheduledTime = new Date(now);
              scheduledTime.setHours(hours, minutes, 0, 0);

              if (scheduledTime >= now && scheduledTime <= futureTime) {
                upcoming.push({
                  plan,
                  medication,
                  nextDose: scheduledTime,
                  time,
                });
              }
            });
          });
        });

        // Sort by next dose time
        return upcoming.sort(
          (a, b) => a.nextDose.getTime() - b.nextDose.getTime()
        );
      },

      getMedicationsForToday: () => {
        const today = new Date()
          .toLocaleDateString('en-US', { weekday: 'long' })
          .toLowerCase() as DayOfWeek;

        const result: Array<{ plan: MedicationPlan; medication: Medication }> = [];

        get().plans.forEach((plan) => {
          if (!plan.isActive || plan.status !== 'active') return;

          plan.medications.forEach((medication) => {
            if (medication.isActive && medication.schedule.days.includes(today)) {
              result.push({ plan, medication });
            }
          });
        });

        // Sort by first scheduled time
        return result.sort((a, b) => {
          const aTime = a.medication.schedule.times[0] || '23:59';
          const bTime = b.medication.schedule.times[0] || '23:59';
          return aTime.localeCompare(bTime);
        });
      },

      getTodaysMedicationsCount: () => {
        return get().getMedicationsForToday().length;
      },

      getActiveCount: () => {
        return get().getAllMedications().filter((med) => med.isActive).length;
      },

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

      getPendingEvents: () => {
        return get().events.filter((event) => event.status === 'pending');
      },

      getTakenEventsCount: () => {
        return get()
          .getTodayEvents()
          .filter((event) => event.status === 'taken').length;
      },

      getMissedEventsCount: () => {
        return get()
          .getTodayEvents()
          .filter((event) => event.status === 'missed').length;
      },

      calculateAdherenceRate: (days: number = 7): number => {
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
          const activeMeds = get().getAllMedications().filter((m) => m.isActive);
          return activeMeds.length > 0 ? 0 : 100;
        }

        const takenCount = events.filter((event) => event.status === 'taken').length;
        return Math.round((takenCount / events.length) * 100);
      },

      calculatePlanAdherenceRate: (planId: string, days: number = 7): number => {
        const now = new Date();
        const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
        startDate.setHours(0, 0, 0, 0);

        const events = get().events.filter((event) => {
          const scheduledTime = new Date(event.scheduledTime);
          return (
            event.planId === planId &&
            scheduledTime >= startDate &&
            scheduledTime <= now &&
            (event.status === 'taken' || event.status === 'missed')
          );
        });

        if (events.length === 0) {
          const plan = get().getPlanById(planId);
          const activeMeds = plan?.medications.filter((m) => m.isActive) || [];
          return activeMeds.length > 0 ? 0 : 100;
        }

        const takenCount = events.filter((event) => event.status === 'taken').length;
        return Math.round((takenCount / events.length) * 100);
      },

      // ==================== Utility ====================

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      clearAll: () => {
        set({
          plans: [],
          events: [],
        });
      },
    }),
    {
      name: 'medisync_medication_plans',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        plans: state.plans,
        events: state.events,
      }),
    }
  )
);

// ==================== Selectors ====================

export const selectPlans = (state: MedicationStore) => state.plans;
export const selectEvents = (state: MedicationStore) => state.events;
export const selectActivePlans = (state: MedicationStore) => state.getActivePlans();
export const selectAllMedications = (state: MedicationStore) => state.getAllMedications();
export const selectUpcomingMedications = (state: MedicationStore) => state.getUpcomingMedications();
export const selectMedicationsForToday = (state: MedicationStore) => state.getMedicationsForToday();
export const selectActiveCount = (state: MedicationStore) => state.getActiveCount();
export const selectAdherenceRate = (state: MedicationStore) => state.calculateAdherenceRate();
export const selectIsLoading = (state: MedicationStore) => state.isLoading;
