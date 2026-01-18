/**
 * Plan Detail Screen
 *
 * Shows:
 * 1. Plan Header (name, condition, doctor, prescription image)
 * 2. Medications in this plan
 * 3. Plan statistics
 * 4. Actions (add medication, edit, pause, delete)
 */

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Text } from '@/components/ui/text';
import { MedicationInPlanCard } from '@/components/features/medication/medication-in-plan-card';
import { useMedicationStore, useActivityStore } from '@/lib/stores';
import type { Medication } from '@/lib/types';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  ArrowLeft,
  Plus,
  Edit3,
  Trash2,
  Pause,
  Play,
  Calendar,
  Stethoscope,
  User,
  Image as ImageIcon,
  Pill,
  Clock,
  CheckCircle,
  MoreVertical,
} from 'lucide-react-native';
import { useState, useCallback, useMemo, useEffect } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  View,
  Image,
  RefreshControl,
  Modal,
} from 'react-native';
import Animated, { FadeIn, FadeInDown, FadeInRight } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

export default function PlanDetailScreen() {
  const router = useRouter();
  const { planId } = useLocalSearchParams<{ planId: string }>();

  // Store
  const getPlanById = useMedicationStore((state) => state.getPlanById);
  const updatePlan = useMedicationStore((state) => state.updatePlan);
  const deletePlan = useMedicationStore((state) => state.deletePlan);
  const deleteMedication = useMedicationStore((state) => state.deleteMedication);
  const calculatePlanAdherenceRate = useMedicationStore((state) => state.calculatePlanAdherenceRate);
  const addActivity = useActivityStore((state) => state.addActivity);

  // State
  const [refreshing, setRefreshing] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [showActionsMenu, setShowActionsMenu] = useState(false);

  // Get plan data
  const plan = getPlanById(planId || '');

  // Redirect if plan not found
  useEffect(() => {
    if (!planId || !plan) {
      router.back();
    }
  }, [planId, plan, router]);

  // Calculate adherence rate
  const adherenceRate = useMemo(() => {
    if (!planId) return 0;
    return calculatePlanAdherenceRate(planId);
  }, [planId, calculatePlanAdherenceRate]);

  // Get active medications count
  const activeMedicationsCount = useMemo(() => {
    return plan?.medications.filter((m) => m.isActive).length || 0;
  }, [plan?.medications]);

  /**
   * Handle refresh
   */
  const handleRefresh = async () => {
    setRefreshing(true);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setTimeout(() => setRefreshing(false), 500);
  };

  /**
   * Handle add medication
   */
  const handleAddMedication = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push(`/plan/${planId}/add-medication`);
  };

  /**
   * Handle view medication
   */
  const handleViewMedication = useCallback(
    (medication: Medication) => {
      router.push(`/plan/${planId}/medication/${medication.id}`);
    },
    [router, planId]
  );

  /**
   * Handle edit medication
   */
  const handleEditMedication = useCallback(
    (medication: Medication) => {
      router.push(`/plan/${planId}/medication/${medication.id}/edit`);
    },
    [router, planId]
  );

  /**
   * Handle delete medication
   */
  const handleDeleteMedication = useCallback(
    (medication: Medication) => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      Alert.alert(
        'Delete Medication',
        `Are you sure you want to remove "${medication.name}" from this plan?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: () => {
              if (planId) {
                deleteMedication(planId, medication.id);
                addActivity({
                  type: 'medication_taken',
                  title: 'Medication Removed',
                  description: `Removed ${medication.name} from ${plan?.planName}`,
                });
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              }
            },
          },
        ]
      );
    },
    [planId, plan?.planName, deleteMedication, addActivity]
  );

  /**
   * Handle edit plan
   */
  const handleEditPlan = () => {
    setShowActionsMenu(false);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push(`/plan/${planId}/edit`);
  };

  /**
   * Handle toggle pause
   */
  const handleTogglePause = () => {
    setShowActionsMenu(false);
    if (!plan || !planId) return;

    const newStatus = plan.status === 'paused' ? 'active' : 'paused';
    updatePlan(planId, {
      status: newStatus,
      isActive: newStatus === 'active',
    });

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    addActivity({
      type: 'medication_updated',
      title: newStatus === 'paused' ? 'Plan Paused' : 'Plan Resumed',
      description: `${plan.planName} has been ${newStatus === 'paused' ? 'paused' : 'resumed'}`,
    });
  };

  /**
   * Handle delete plan
   */
  const handleDeletePlan = () => {
    setShowActionsMenu(false);
    if (!plan || !planId) return;

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    Alert.alert(
      'Delete Plan',
      `Are you sure you want to delete "${plan.planName}"? This will remove all ${plan.medications.length} medications.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deletePlan(planId);
            addActivity({
              type: 'medication_taken',
              title: 'Plan Deleted',
              description: `Removed ${plan.planName} with ${plan.medications.length} medications`,
            });
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            router.back();
          },
        },
      ]
    );
  };

  /**
   * Format date
   */
  const formatDate = (date: Date | undefined): string => {
    if (!date) return 'Not set';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (!plan) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-background">
        <Text className="text-muted-foreground">Plan not found</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      {/* Header */}
      <View className="flex-row items-center justify-between border-b border-border px-4 py-3">
        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.back();
          }}
          className="h-10 w-10 items-center justify-center rounded-full active:bg-muted"
        >
          <ArrowLeft size={24} className="text-foreground" />
        </Pressable>
        <Text className="flex-1 text-center text-lg font-bold text-foreground" numberOfLines={1}>
          {plan.planName}
        </Text>
        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setShowActionsMenu(true);
          }}
          className="h-10 w-10 items-center justify-center rounded-full active:bg-muted"
        >
          <MoreVertical size={24} className="text-foreground" />
        </Pressable>
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {/* Plan Info Card */}
        <Animated.View entering={FadeInDown.delay(100).duration(300)} className="m-4">
          <View className="rounded-xl border border-border bg-card p-4">
            {/* Status Badge */}
            <View className="mb-3 flex-row items-center justify-between">
              <Badge
                variant={
                  plan.status === 'active'
                    ? 'success'
                    : plan.status === 'paused'
                      ? 'warning'
                      : 'info'
                }
                size="md"
              >
                {plan.status.charAt(0).toUpperCase() + plan.status.slice(1)}
              </Badge>
              {plan.prescriptionDate && (
                <View className="flex-row items-center">
                  <Calendar size={14} className="text-muted-foreground" />
                  <Text className="ml-1 text-xs text-muted-foreground">
                    {formatDate(plan.prescriptionDate)}
                  </Text>
                </View>
              )}
            </View>

            {/* Condition */}
            {plan.condition && (
              <View className="mb-2 flex-row items-center">
                <Stethoscope size={16} className="text-primary" />
                <Text className="ml-2 text-base font-medium text-foreground">
                  {plan.condition}
                </Text>
              </View>
            )}

            {/* Doctor */}
            {plan.prescribedBy && (
              <View className="mb-2 flex-row items-center">
                <User size={16} className="text-muted-foreground" />
                <Text className="ml-2 text-sm text-muted-foreground">
                  Dr. {plan.prescribedBy}
                </Text>
              </View>
            )}

            {/* Prescription Image */}
            {plan.prescriptionImage && (
              <Pressable
                onPress={() => setShowImageModal(true)}
                className="mt-3 overflow-hidden rounded-lg border border-border"
              >
                <Image
                  source={{ uri: plan.prescriptionImage }}
                  className="h-32 w-full"
                  resizeMode="cover"
                />
                <View className="absolute bottom-2 right-2 flex-row items-center rounded-full bg-black/50 px-3 py-1">
                  <ImageIcon size={14} color="white" />
                  <Text className="ml-1 text-xs text-white">Tap to view</Text>
                </View>
              </Pressable>
            )}

            {/* Notes */}
            {plan.notes && (
              <View className="mt-3 rounded-lg bg-muted/50 p-3">
                <Text className="text-sm text-muted-foreground">{plan.notes}</Text>
              </View>
            )}
          </View>
        </Animated.View>

        {/* Stats Row */}
        <Animated.View
          entering={FadeInDown.delay(150).duration(300)}
          className="mx-4 flex-row gap-3"
        >
          <View className="flex-1 rounded-xl border border-border bg-card p-4">
            <View className="mb-2 h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <Pill size={20} className="text-primary" />
            </View>
            <Text className="text-2xl font-bold text-foreground">
              {plan.medications.length}
            </Text>
            <Text className="text-xs text-muted-foreground">Medications</Text>
          </View>
          <View className="flex-1 rounded-xl border border-border bg-card p-4">
            <View className="mb-2 h-10 w-10 items-center justify-center rounded-full bg-success/10">
              <CheckCircle size={20} className="text-success" />
            </View>
            <Text className="text-2xl font-bold text-foreground">{adherenceRate}%</Text>
            <Text className="text-xs text-muted-foreground">Adherence</Text>
          </View>
          <View className="flex-1 rounded-xl border border-border bg-card p-4">
            <View className="mb-2 h-10 w-10 items-center justify-center rounded-full bg-warning/10">
              <Clock size={20} className="text-warning" />
            </View>
            <Text className="text-2xl font-bold text-foreground">
              {activeMedicationsCount}
            </Text>
            <Text className="text-xs text-muted-foreground">Active</Text>
          </View>
        </Animated.View>

        {/* Medications Section */}
        <Animated.View entering={FadeInDown.delay(200).duration(300)} className="mt-6">
          <View className="mb-3 flex-row items-center justify-between px-4">
            <Text className="text-lg font-bold text-foreground">Medications</Text>
            <Button size="sm" onPress={handleAddMedication}>
              <View className="flex-row items-center">
                <Plus size={16} color="white" />
                <Text className="ml-1 text-sm font-medium text-white">Add</Text>
              </View>
            </Button>
          </View>

          <View className="px-4">
            {plan.medications.length > 0 ? (
              plan.medications.map((medication, index) => (
                <Animated.View
                  key={medication.id}
                  entering={FadeInRight.delay(250 + index * 50).duration(300)}
                >
                  <MedicationInPlanCard
                    medication={medication}
                    onPress={() => handleViewMedication(medication)}
                    onEdit={() => handleEditMedication(medication)}
                    onDelete={() => handleDeleteMedication(medication)}
                  />
                </Animated.View>
              ))
            ) : (
              <View className="items-center rounded-xl border border-dashed border-border bg-muted/30 py-12">
                <Pill size={48} className="text-muted-foreground" />
                <Text className="mt-4 text-base font-medium text-foreground">
                  No medications yet
                </Text>
                <Text className="mt-1 text-sm text-muted-foreground">
                  Add medications to this plan
                </Text>
                <Button onPress={handleAddMedication} className="mt-4">
                  <View className="flex-row items-center">
                    <Plus size={18} color="white" />
                    <Text className="ml-2 font-medium text-white">Add Medication</Text>
                  </View>
                </Button>
              </View>
            )}
          </View>
        </Animated.View>

        {/* Bottom spacing */}
        <View className="h-8" />
      </ScrollView>

      {/* Actions Menu Modal */}
      <Modal
        visible={showActionsMenu}
        transparent
        animationType="fade"
        onRequestClose={() => setShowActionsMenu(false)}
      >
        <Pressable
          onPress={() => setShowActionsMenu(false)}
          className="flex-1 items-center justify-end bg-black/50"
        >
          <Animated.View
            entering={FadeIn.duration(200)}
            className="w-full rounded-t-3xl bg-card p-6"
          >
            <View className="mb-4 h-1 w-12 self-center rounded-full bg-border" />

            <Pressable
              onPress={handleEditPlan}
              className="flex-row items-center rounded-xl p-4 active:bg-muted"
            >
              <View className="mr-4 h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <Edit3 size={20} className="text-primary" />
              </View>
              <View className="flex-1">
                <Text className="font-medium text-foreground">Edit Plan</Text>
                <Text className="text-sm text-muted-foreground">
                  Modify plan details
                </Text>
              </View>
            </Pressable>

            <Pressable
              onPress={handleTogglePause}
              className="flex-row items-center rounded-xl p-4 active:bg-muted"
            >
              <View className="mr-4 h-10 w-10 items-center justify-center rounded-full bg-warning/10">
                {plan.status === 'paused' ? (
                  <Play size={20} className="text-warning" />
                ) : (
                  <Pause size={20} className="text-warning" />
                )}
              </View>
              <View className="flex-1">
                <Text className="font-medium text-foreground">
                  {plan.status === 'paused' ? 'Resume Plan' : 'Pause Plan'}
                </Text>
                <Text className="text-sm text-muted-foreground">
                  {plan.status === 'paused'
                    ? 'Resume all medication reminders'
                    : 'Pause all medication reminders'}
                </Text>
              </View>
            </Pressable>

            <Pressable
              onPress={handleDeletePlan}
              className="flex-row items-center rounded-xl p-4 active:bg-muted"
            >
              <View className="mr-4 h-10 w-10 items-center justify-center rounded-full bg-danger/10">
                <Trash2 size={20} className="text-danger" />
              </View>
              <View className="flex-1">
                <Text className="font-medium text-danger">Delete Plan</Text>
                <Text className="text-sm text-muted-foreground">
                  Remove plan and all medications
                </Text>
              </View>
            </Pressable>

            <Button
              variant="outline"
              onPress={() => setShowActionsMenu(false)}
              className="mt-4"
            >
              <Text className="font-medium text-foreground">Cancel</Text>
            </Button>
          </Animated.View>
        </Pressable>
      </Modal>

      {/* Image Modal */}
      <Modal
        visible={showImageModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowImageModal(false)}
      >
        <Pressable
          onPress={() => setShowImageModal(false)}
          className="flex-1 items-center justify-center bg-black/90"
        >
          {plan.prescriptionImage && (
            <Image
              source={{ uri: plan.prescriptionImage }}
              className="h-4/5 w-11/12"
              resizeMode="contain"
            />
          )}
          <Pressable
            onPress={() => setShowImageModal(false)}
            className="absolute right-4 top-12 h-12 w-12 items-center justify-center rounded-full bg-white/20"
          >
            <Text className="text-2xl text-white">×</Text>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}
