/**
 * MediSync Dashboard Screen
 *
 * Complete dashboard with:
 * - Gradient header with avatar and notifications
 * - Quick stats (4 cards)
 * - Feature cards (6 cards in 2x3 grid)
 * - Upcoming medications list
 * - Recent activity timeline
 * - Pull to refresh
 * - Real-time data from Zustand stores
 * - Animated elements with stagger effects
 */

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Text } from '@/components/ui/text';
import { StatCard } from '@/components/features/dashboard/stat-card';
import { FeatureCard } from '@/components/features/dashboard/feature-card';
import { ActivityItem } from '@/components/features/dashboard/activity-item';
import { SectionHeader } from '@/components/common/section-header';
import {
  useAuthStore,
  useMedicationStore,
  useNotificationStore,
  useFamilyStore,
  useActivityStore,
  formatRelativeTime,
} from '@/lib/stores';
import type { ActivityType } from '@/lib/stores';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import {
  Bell,
  Pill,
  CheckCircle,
  Clock,
  Users,
  Camera,
  Plus,
  List,
  Heart,
  Watch,
  AlertTriangle,
  X,
  UserPlus,
  Activity,
} from 'lucide-react-native';
import { useState, useMemo, useEffect, useCallback } from 'react';
import {
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  View,
  Image,
} from 'react-native';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInRight,
  useSharedValue,
  withSpring,
  useAnimatedStyle,
  withDelay,
  withSequence,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

// Animated wrapper components
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const AnimatedView = Animated.createAnimatedComponent(View);

export default function DashboardScreen() {
  const router = useRouter();

  // Store state
  const { user } = useAuthStore();
  const medications = useMedicationStore((state) => state.medications);
  const events = useMedicationStore((state) => state.events);
  const calculateAdherenceRate = useMedicationStore(
    (state) => state.calculateAdherenceRate
  );
  const getMedicationsForToday = useMedicationStore(
    (state) => state.getMedicationsForToday
  );
  const updateEvent = useMedicationStore((state) => state.updateEvent);
  const addEvent = useMedicationStore((state) => state.addEvent);
  const notifications = useNotificationStore((state) => state.notifications);
  const members = useFamilyStore((state) => state.members);
  const activities = useActivityStore((state) => state.activities);
  const getRecentActivities = useActivityStore((state) => state.getRecentActivities);
  const addActivity = useActivityStore((state) => state.addActivity);

  // Local state
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Animation values
  const headerOpacity = useSharedValue(0);
  const contentOffset = useSharedValue(50);

  // Initialize animations on mount
  useEffect(() => {
    headerOpacity.value = withDelay(100, withSpring(1));
    contentOffset.value = withDelay(200, withSpring(0));

    // Simulate initial load
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  // Animated header style
  const headerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
  }));

  /**
   * Get greeting based on time of day
   */
  const getGreeting = (): string => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'Good morning';
    if (hour >= 12 && hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  /**
   * Get unread notifications count
   */
  const unreadCount = useMemo(() => {
    return notifications.filter((n) => !n.isRead).length;
  }, [notifications]);

  /**
   * Get today's medications count
   */
  const todaysMedicationsCount = useMemo(() => {
    const todayMeds = getMedicationsForToday();
    return todayMeds.length;
  }, [medications, getMedicationsForToday]);

  /**
   * Calculate adherence rate (last 7 days)
   */
  const adherenceRate = useMemo(() => {
    return calculateAdherenceRate(7);
  }, [events, calculateAdherenceRate]);

  /**
   * Get upcoming reminders count (next 24 hours)
   */
  const upcomingRemindersCount = useMemo(() => {
    // Count medication reminders from active medications scheduled for today
    const todayMeds = getMedicationsForToday();
    let reminderCount = 0;

    todayMeds.forEach((med) => {
      if (med.reminders.enabled) {
        reminderCount += med.schedule.times.length;
      }
    });

    return reminderCount;
  }, [medications, getMedicationsForToday]);

  /**
   * Get upcoming medications (next 3)
   */
  const upcomingMedications = useMemo(() => {
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    const todayMeds = getMedicationsForToday();

    // Create list of upcoming medication doses
    const upcomingDoses: Array<{
      id: string;
      medicationId: string;
      name: string;
      dosage: string;
      time: string;
      status: 'pending' | 'taken' | 'missed' | 'scheduled';
    }> = [];

    todayMeds.forEach((med) => {
      med.schedule.times.forEach((time, index) => {
        // Check if there's an event for this time
        const existingEvent = events.find(
          (e) =>
            e.medicationId === med.id &&
            new Date(e.scheduledTime).toDateString() === now.toDateString() &&
            new Date(e.scheduledTime).getHours() === parseInt(time.split(':')[0]) &&
            new Date(e.scheduledTime).getMinutes() === parseInt(time.split(':')[1])
        );

        let status: 'pending' | 'taken' | 'missed' | 'scheduled' = 'scheduled';
        if (existingEvent) {
          status = existingEvent.status as 'pending' | 'taken' | 'missed';
        } else if (time < currentTime) {
          status = 'pending'; // Past time but no event = pending
        }

        upcomingDoses.push({
          id: `${med.id}-${index}`,
          medicationId: med.id,
          name: med.name,
          dosage: `${med.dosage} ${med.dosageUnit}`,
          time: formatTime(time),
          status,
        });
      });
    });

    // Sort by time and filter to show pending/scheduled first
    return upcomingDoses
      .sort((a, b) => a.time.localeCompare(b.time))
      .filter((dose) => dose.status === 'pending' || dose.status === 'scheduled')
      .slice(0, 3);
  }, [medications, events, getMedicationsForToday]);

  /**
   * Format time to 12-hour format
   */
  const formatTime = (time24: string): string => {
    const [hours, minutes] = time24.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const hours12 = hours % 12 || 12;
    return `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  /**
   * Get recent activity (last 5 events)
   */
  const recentActivity = useMemo(() => {
    const recent = getRecentActivities(5);

    // If no activities in store, show mock data for demo
    if (recent.length === 0 && medications.length === 0) {
      return [
        {
          id: 'mock-1',
          type: 'medication_taken' as ActivityType,
          description: 'Welcome to MediSync!',
          time: 'Just now',
        },
        {
          id: 'mock-2',
          type: 'reminder_sent' as ActivityType,
          description: 'Add your first medication to get started',
          time: 'Now',
        },
      ];
    }

    return recent.map((activity) => ({
      id: activity.id,
      type: activity.type,
      description: activity.description,
      time: formatRelativeTime(activity.timestamp),
    }));
  }, [activities, getRecentActivities, medications.length]);

  /**
   * Pull to refresh handler
   */
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // Simulate data refresh
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setRefreshing(false);
  }, []);

  /**
   * Handle upload prescription
   */
  const handleUploadPrescription = async () => {
    Alert.alert('Upload Prescription', 'Choose an option', [
      {
        text: 'Take Photo',
        onPress: async () => {
          const { status } = await ImagePicker.requestCameraPermissionsAsync();
          if (status !== 'granted') {
            Alert.alert('Permission Denied', 'Camera permission is required.');
            return;
          }
          const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 0.8,
          });
          if (!result.canceled && result.assets[0]) {
            // Navigate to add medication with image
            Alert.alert('Success', 'Prescription captured! (Feature coming soon)');
          }
        },
      },
      {
        text: 'Choose from Library',
        onPress: async () => {
          const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
          if (status !== 'granted') {
            Alert.alert('Permission Denied', 'Photo library permission is required.');
            return;
          }
          const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 0.8,
          });
          if (!result.canceled && result.assets[0]) {
            // Navigate to add medication with image
            Alert.alert('Success', 'Prescription selected! (Feature coming soon)');
          }
        },
      },
      {
        text: 'Cancel',
        style: 'cancel',
      },
    ]);
  };

  /**
   * Handle mark medication as taken
   */
  const handleMarkAsTaken = useCallback(
    (medicationId: string, time: string) => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      // Find the medication
      const med = medications.find((m) => m.id === medicationId);
      if (!med) return;

      // Create or update the event
      const now = new Date();
      const eventId = `event_${medicationId}_${Date.now()}`;

      addEvent({
        id: eventId,
        medicationId,
        scheduledTime: now,
        takenTime: now,
        status: 'taken',
      });

      // Add activity
      addActivity({
        type: 'medication_taken',
        title: 'Medication Taken',
        description: `Took ${med.name} ${med.dosage} ${med.dosageUnit}`,
        metadata: { medicationId, time },
      });

      Alert.alert('Success', `${med.name} marked as taken!`);
    },
    [medications, addEvent, addActivity]
  );

  /**
   * Get activity icon and colors
   */
  const getActivityIcon = (type: ActivityType | string) => {
    switch (type) {
      case 'medication_taken':
        return {
          icon: CheckCircle,
          iconColor: 'text-success',
          iconBgColor: 'bg-success/10',
        };
      case 'medication_missed':
        return {
          icon: X,
          iconColor: 'text-danger',
          iconBgColor: 'bg-danger/10',
        };
      case 'medication_skipped':
        return {
          icon: X,
          iconColor: 'text-warning',
          iconBgColor: 'bg-warning/10',
        };
      case 'fall_alert':
        return {
          icon: AlertTriangle,
          iconColor: 'text-danger',
          iconBgColor: 'bg-danger/10',
        };
      case 'family_added':
        return {
          icon: UserPlus,
          iconColor: 'text-primary',
          iconBgColor: 'bg-primary/10',
        };
      case 'family_removed':
        return {
          icon: Users,
          iconColor: 'text-muted-foreground',
          iconBgColor: 'bg-muted',
        };
      case 'reminder_sent':
        return {
          icon: Bell,
          iconColor: 'text-warning',
          iconBgColor: 'bg-warning/10',
        };
      case 'medication_added':
        return {
          icon: Plus,
          iconColor: 'text-success',
          iconBgColor: 'bg-success/10',
        };
      case 'medication_updated':
        return {
          icon: Pill,
          iconColor: 'text-primary',
          iconBgColor: 'bg-primary/10',
        };
      case 'group_created':
        return {
          icon: Users,
          iconColor: 'text-secondary',
          iconBgColor: 'bg-secondary/10',
        };
      case 'device_paired':
        return {
          icon: Watch,
          iconColor: 'text-info',
          iconBgColor: 'bg-info/10',
        };
      default:
        return {
          icon: Activity,
          iconColor: 'text-muted-foreground',
          iconBgColor: 'bg-muted',
        };
    }
  };

  // Loading skeleton
  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-background" edges={['top']}>
        <View className="flex-1 items-center justify-center">
          <Animated.View entering={FadeIn.duration(300)}>
            <View className="h-12 w-12 animate-pulse rounded-full bg-muted" />
            <Text className="mt-4 text-muted-foreground">Loading...</Text>
          </Animated.View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header with Gradient */}
        <Animated.View style={headerAnimatedStyle}>
          <LinearGradient
            colors={['#72A8E8', '#4A8FE0']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="px-6 pb-6 pt-4"
            style={{ borderBottomLeftRadius: 24, borderBottomRightRadius: 24 }}
          >
            <View className="flex-row items-center justify-between">
              {/* User Avatar */}
              <Pressable
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  router.push('/(tabs)/profile');
                }}
              >
                {user?.avatar ? (
                  <Image
                    source={{ uri: user.avatar }}
                    className="h-12 w-12 rounded-full"
                  />
                ) : (
                  <View className="h-12 w-12 items-center justify-center rounded-full bg-white/20">
                    <Text className="text-lg font-bold text-white">
                      {user?.name?.charAt(0) || 'U'}
                    </Text>
                  </View>
                )}
              </Pressable>

              {/* Greeting */}
              <View className="flex-1 px-4">
                <Text className="text-sm text-white/80">{getGreeting()}</Text>
                <Text className="text-lg font-bold text-white">
                  {user?.name || 'User'}
                </Text>
              </View>

              {/* Notification Bell */}
              <Pressable
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  router.push('/(tabs)/notifications');
                }}
                className="relative"
              >
                <View className="h-10 w-10 items-center justify-center rounded-full bg-white/20">
                  <Bell size={20} className="text-white" />
                </View>
                {unreadCount > 0 && (
                  <View className="absolute -right-1 -top-1 h-5 w-5 items-center justify-center rounded-full bg-danger">
                    <Text className="text-xs font-bold text-white">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </Text>
                  </View>
                )}
              </Pressable>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Quick Stats Section */}
        <Animated.View
          entering={FadeInDown.delay(100).duration(400).springify()}
          className="mt-6"
        >
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerClassName="gap-3 px-6"
          >
            <StatCard
              icon={Pill}
              iconColor="text-primary"
              iconBgColor="bg-primary/10"
              value={todaysMedicationsCount}
              label="Today's Meds"
              onPress={() => router.push('/(tabs)/medications')}
            />
            <StatCard
              icon={CheckCircle}
              iconColor="text-success"
              iconBgColor="bg-success/10"
              value={`${adherenceRate}%`}
              label="Adherence Rate"
              trend={
                adherenceRate >= 80
                  ? { value: '+5%', isPositive: true }
                  : adherenceRate >= 50
                    ? { value: '-2%', isPositive: false }
                    : undefined
              }
              onPress={() => router.push('/(tabs)/medications')}
            />
            <StatCard
              icon={Clock}
              iconColor="text-warning"
              iconBgColor="bg-warning/10"
              value={upcomingRemindersCount}
              label="Reminders"
              onPress={() => router.push('/(tabs)/notifications')}
            />
            <StatCard
              icon={Users}
              iconColor="text-secondary"
              iconBgColor="bg-secondary/10"
              value={members.length}
              label="Family Members"
              onPress={() => router.push('/(tabs)/family')}
            />
          </ScrollView>
        </Animated.View>

        {/* Feature Cards Section */}
        <Animated.View
          entering={FadeInDown.delay(200).duration(400).springify()}
          className="mt-6 px-6"
        >
          <View className="flex-row gap-3">
            {/* Row 1 */}
            <FeatureCard
              icon={Camera}
              iconColor="text-primary"
              iconBgColor="bg-primary/10"
              title="Upload Prescription"
              subtitle="Add medication from prescription"
              onPress={handleUploadPrescription}
            />
            <FeatureCard
              icon={Plus}
              iconColor="text-success"
              iconBgColor="bg-success/10"
              title="Add Medicine"
              subtitle="Manually add medication"
              onPress={() => Alert.alert('Add Medicine', 'Feature coming soon')}
            />
          </View>

          <View className="mt-3 flex-row gap-3">
            {/* Row 2 */}
            <FeatureCard
              icon={List}
              iconColor="text-secondary"
              iconBgColor="bg-secondary/10"
              title="My Medications"
              subtitle="View all medications"
              onPress={() => router.push('/(tabs)/medications')}
            />
            <FeatureCard
              icon={Users}
              iconColor="text-warning"
              iconBgColor="bg-warning/10"
              title="Groups"
              subtitle="Manage family groups"
              onPress={() => router.push('/(tabs)/family')}
            />
          </View>

          <View className="mt-3 flex-row gap-3">
            {/* Row 3 */}
            <FeatureCard
              icon={Heart}
              iconColor="text-danger"
              iconBgColor="bg-danger/10"
              title="Family / Friends"
              subtitle="Connect with loved ones"
              onPress={() => router.push('/(tabs)/family')}
            />
            <FeatureCard
              icon={Watch}
              iconColor="text-info"
              iconBgColor="bg-info/10"
              title="Pair Watch"
              subtitle="Connect wearable device"
              onPress={() => Alert.alert('Pair Watch', 'Feature coming soon')}
            />
          </View>
        </Animated.View>

        {/* Upcoming Medications Section */}
        <Animated.View
          entering={FadeInDown.delay(300).duration(400).springify()}
          className="mt-6 px-6"
        >
          <SectionHeader
            title="Upcoming Medications"
            actionText="View All"
            onActionPress={() => router.push('/(tabs)/medications')}
          />

          <View className="mt-3 gap-3">
            {upcomingMedications.length > 0 ? (
              upcomingMedications.map((med, index) => (
                <Animated.View
                  key={med.id}
                  entering={FadeInRight.delay(350 + index * 100)
                    .duration(300)
                    .springify()}
                >
                  <Pressable
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      Alert.alert('Medication Details', `View ${med.name} details`);
                    }}
                    className="rounded-xl border border-border bg-card p-4 active:opacity-80"
                  >
                    <View className="flex-row items-start justify-between">
                      <View className="flex-1">
                        <View className="flex-row items-center gap-2">
                          <Clock size={16} className="text-muted-foreground" />
                          <Text className="text-sm font-medium text-muted-foreground">
                            {med.time}
                          </Text>
                        </View>
                        <Text className="mt-2 text-base font-semibold text-foreground">
                          {med.name}
                        </Text>
                        <Text className="mt-1 text-sm text-muted-foreground">
                          {med.dosage}
                        </Text>
                      </View>
                      <View className="items-end gap-2">
                        <Badge
                          variant={
                            med.status === 'pending'
                              ? 'warning'
                              : med.status === 'taken'
                                ? 'success'
                                : med.status === 'missed'
                                  ? 'danger'
                                  : 'default'
                          }
                        >
                          {med.status === 'pending'
                            ? 'Pending'
                            : med.status === 'taken'
                              ? 'Taken'
                              : med.status === 'missed'
                                ? 'Missed'
                                : 'Scheduled'}
                        </Badge>
                        {(med.status === 'pending' || med.status === 'scheduled') && (
                          <Button
                            size="sm"
                            variant="outline"
                            onPress={() => handleMarkAsTaken(med.medicationId, med.time)}
                            className="mt-2"
                          >
                            <Text className="text-xs">Mark as Taken</Text>
                          </Button>
                        )}
                      </View>
                    </View>
                  </Pressable>
                </Animated.View>
              ))
            ) : (
              <Animated.View entering={FadeIn.delay(400).duration(300)}>
                <View className="items-center rounded-xl border border-border bg-card p-8">
                  <Pill size={40} className="text-muted-foreground" />
                  <Text className="mt-3 text-base font-medium text-foreground">
                    No upcoming medications
                  </Text>
                  <Text className="mt-1 text-center text-sm text-muted-foreground">
                    Add your medications to get started
                  </Text>
                  <Button
                    size="sm"
                    onPress={() => Alert.alert('Add Medication', 'Feature coming soon')}
                    className="mt-4"
                  >
                    <Text className="text-sm">Add Medication</Text>
                  </Button>
                </View>
              </Animated.View>
            )}
          </View>
        </Animated.View>

        {/* Recent Activity Section */}
        <Animated.View
          entering={FadeInDown.delay(400).duration(400).springify()}
          className="mt-6 px-6 pb-6"
        >
          <SectionHeader title="Recent Activity" />

          <View className="mt-3">
            {recentActivity.length > 0 ? (
              recentActivity.map((activity, index) => {
                const { icon, iconColor, iconBgColor } = getActivityIcon(activity.type);
                return (
                  <Animated.View
                    key={activity.id}
                    entering={FadeInRight.delay(450 + index * 80)
                      .duration(250)
                      .springify()}
                  >
                    <ActivityItem
                      icon={icon}
                      iconColor={iconColor}
                      iconBgColor={iconBgColor}
                      description={activity.description}
                      time={activity.time}
                      isLast={index === recentActivity.length - 1}
                    />
                  </Animated.View>
                );
              })
            ) : (
              <Animated.View entering={FadeIn.delay(500).duration(300)}>
                <View className="items-center rounded-xl border border-border bg-card p-8">
                  <Activity size={40} className="text-muted-foreground" />
                  <Text className="mt-3 text-base font-medium text-foreground">
                    No recent activity
                  </Text>
                  <Text className="mt-1 text-center text-sm text-muted-foreground">
                    Your activity will appear here
                  </Text>
                </View>
              </Animated.View>
            )}
          </View>
        </Animated.View>

        {/* Development Mode: Add Sample Data */}
        {__DEV__ && medications.length === 0 && (
          <Animated.View
            entering={FadeIn.delay(600).duration(300)}
            className="mx-6 mb-6 rounded-lg bg-info/10 p-4"
          >
            <Text className="text-xs font-semibold text-info">
              Development Mode - No Data
            </Text>
            <Text className="mt-1 text-xs text-muted-foreground">
              Complete onboarding or add medications to see dashboard data
            </Text>
            <Button
              size="sm"
              variant="outline"
              className="mt-3"
              onPress={() => {
                // Add sample medication
                useMedicationStore.getState().addMedication({
                  id: `med_${Date.now()}`,
                  userId: user?.id || 'demo',
                  name: 'Aspirin',
                  dosage: '100',
                  dosageUnit: 'mg',
                  type: 'tablet',
                  frequency: 'daily',
                  schedule: {
                    days: [
                      'monday',
                      'tuesday',
                      'wednesday',
                      'thursday',
                      'friday',
                      'saturday',
                      'sunday',
                    ],
                    times: ['08:00', '14:00', '20:00'],
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
                });

                // Add activity
                addActivity({
                  type: 'medication_added',
                  title: 'Medication Added',
                  description: 'Added Aspirin 100mg to your medications',
                });

                Alert.alert('Success', 'Sample medication added!');
              }}
            >
              <Text className="text-xs">Add Sample Medication</Text>
            </Button>
          </Animated.View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
