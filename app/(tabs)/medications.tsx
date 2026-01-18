/**
 * MediSync Medication Plans Screen
 *
 * Complete medication plan management with:
 * - Search (debounced, real-time)
 * - Filter (status)
 * - Sort options
 * - Swipe actions (edit, delete)
 * - Pull to refresh
 * - Loading skeleton
 * - Empty states
 * - FAB for adding new plan
 * - Animations
 */

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { PlanCard } from '@/components/features/medication/plan-card';
import { useMedicationStore, useActivityStore } from '@/lib/stores';
import type { MedicationPlan } from '@/lib/types';
import { useRouter } from 'expo-router';
import {
  Search,
  Plus,
  FileText,
  X,
  AlertCircle,
} from 'lucide-react-native';
import { useState, useMemo, useCallback, useEffect } from 'react';
import {
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  View,
  ScrollView,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInRight,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const ITEM_HEIGHT = 140;
const DEBOUNCE_DELAY = 300;

// Custom hook for debounced value
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

type SortOption = 'name-asc' | 'name-desc' | 'date-desc' | 'date-asc' | 'medications-desc';

export default function MedicationPlansScreen() {
  const router = useRouter();

  // Store
  const plans = useMedicationStore((state) => state.plans);
  const deletePlan = useMedicationStore((state) => state.deletePlan);
  const getUpcomingMedications = useMedicationStore((state) => state.getUpcomingMedications);
  const addActivity = useActivityStore((state) => state.addActivity);

  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchVisible, setSearchVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [sortOption, setSortOption] = useState<SortOption>('date-desc');

  // Debounced search
  const debouncedSearchQuery = useDebounce(searchQuery, DEBOUNCE_DELAY);

  // Animation values
  const fabScale = useSharedValue(0);
  const searchBarHeight = useSharedValue(0);

  // Filter chips
  type FilterChip = 'all' | 'active' | 'paused' | 'completed';
  const [activeChip, setActiveChip] = useState<FilterChip>('all');

  // Load and animate on mount
  useEffect(() => {
    animateFAB();
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  // Animate search bar
  useEffect(() => {
    searchBarHeight.value = withSpring(searchVisible ? 56 : 0, {
      damping: 15,
      stiffness: 100,
    });
  }, [searchVisible]);

  const animateFAB = () => {
    fabScale.value = withDelay(300, withSpring(1, { damping: 12, stiffness: 100 }));
  };

  /**
   * Get next medication time for a plan
   */
  const getNextMedicationTimeForPlan = useCallback(
    (planId: string): string | undefined => {
      const upcoming = getUpcomingMedications(24);
      const planUpcoming = upcoming.find((u) => u.plan.id === planId);
      if (planUpcoming) {
        const hours = planUpcoming.nextDose.getHours();
        const minutes = planUpcoming.nextDose.getMinutes();
        const period = hours >= 12 ? 'PM' : 'AM';
        const hours12 = hours % 12 || 12;
        return `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`;
      }
      return undefined;
    },
    [getUpcomingMedications]
  );

  /**
   * Filter plans based on search and filter chips
   */
  const filteredPlans = useMemo(() => {
    let result = plans;

    // Apply search filter
    if (debouncedSearchQuery.trim()) {
      const query = debouncedSearchQuery.toLowerCase();
      result = result.filter(
        (plan) =>
          plan.planName.toLowerCase().includes(query) ||
          plan.condition?.toLowerCase().includes(query) ||
          plan.prescribedBy?.toLowerCase().includes(query) ||
          plan.medications.some((med) => med.name.toLowerCase().includes(query))
      );
    }

    // Apply status filter
    if (activeChip !== 'all') {
      result = result.filter((plan) => plan.status === activeChip);
    }

    return result;
  }, [plans, debouncedSearchQuery, activeChip]);

  /**
   * Sort plans
   */
  const sortedPlans = useMemo(() => {
    const sorted = [...filteredPlans];

    switch (sortOption) {
      case 'name-asc':
        return sorted.sort((a, b) => a.planName.localeCompare(b.planName));
      case 'name-desc':
        return sorted.sort((a, b) => b.planName.localeCompare(a.planName));
      case 'date-desc':
        return sorted.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      case 'date-asc':
        return sorted.sort(
          (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      case 'medications-desc':
        return sorted.sort((a, b) => b.medications.length - a.medications.length);
      default:
        return sorted;
    }
  }, [filteredPlans, sortOption]);

  /**
   * Handlers
   */
  const handleRefresh = async () => {
    setRefreshing(true);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handleToggleSearch = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setSearchVisible(!searchVisible);
    if (searchVisible) {
      setSearchQuery('');
    }
  };

  const handleChipPress = (chip: FilterChip) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveChip(chip);
  };

  const handleAddPlan = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/plan/add');
  };

  const handleViewPlan = useCallback((plan: MedicationPlan) => {
   router.push({ pathname: '/plan/[planId]', params: { planId: plan.id } });

  }, [router]);

  const handleEditPlan = useCallback((plan: MedicationPlan) => {
    router.push({ pathname: '/plan/[planId]/edit', params: { planId: plan.id } });
  }, [router]);

  const handleDeletePlan = useCallback(
    (plan: MedicationPlan) => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      Alert.alert(
        'Delete Plan',
        `Are you sure you want to delete "${plan.planName}"? This will remove all ${plan.medications.length} medications in this plan.`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: () => {
              deletePlan(plan.id);
              addActivity({
                type: 'medication_taken',
                title: 'Plan Deleted',
                description: `Removed ${plan.planName} with ${plan.medications.length} medications`,
              });
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            },
          },
        ]
      );
    },
    [deletePlan, addActivity]
  );

  /**
   * Render plan item
   */
  const renderPlanItem = useCallback(
    ({ item, index }: { item: MedicationPlan; index: number }) => (
      <Animated.View
        entering={FadeInRight.delay(index * 50)
          .duration(300)
          .springify()}
      >
        <PlanCard
          plan={item}
          onPress={() => handleViewPlan(item)}
          onEdit={() => handleEditPlan(item)}
          onDelete={() => handleDeletePlan(item)}
          nextMedicationTime={getNextMedicationTimeForPlan(item.id)}
        />
      </Animated.View>
    ),
    [handleViewPlan, handleEditPlan, handleDeletePlan, getNextMedicationTimeForPlan]
  );

  const getItemLayout = useCallback(
    (_: any, index: number) => ({
      length: ITEM_HEIGHT,
      offset: ITEM_HEIGHT * index,
      index,
    }),
    []
  );

  const keyExtractor = useCallback((item: MedicationPlan) => item.id, []);

  /**
   * Render empty state
   */
  const renderEmptyState = () => {
    const hasActiveFilters =
      activeChip !== 'all' || debouncedSearchQuery.trim() !== '';

    return (
      <Animated.View
        entering={FadeIn.delay(200).duration(400)}
        className="flex-1 items-center justify-center py-20"
      >
        {hasActiveFilters ? (
          <>
            <AlertCircle size={64} className="text-muted-foreground" />
            <Text className="mt-4 text-center text-lg font-semibold text-foreground">
              No plans found
            </Text>
            <Text className="mt-2 px-8 text-center text-sm text-muted-foreground">
              Try adjusting your filters or search query
            </Text>
            <Button
              variant="outline"
              onPress={() => {
                setSearchQuery('');
                setActiveChip('all');
              }}
              className="mt-6"
            >
              <Text className="font-medium text-foreground">Clear Filters</Text>
            </Button>
          </>
        ) : (
          <>
            <FileText size={64} className="text-muted-foreground" />
            <Text className="mt-4 text-center text-lg font-semibold text-foreground">
              No medication plans yet
            </Text>
            <Text className="mt-2 px-8 text-center text-sm text-muted-foreground">
              Create your first plan from a doctor's prescription
            </Text>
            <Button onPress={handleAddPlan} className="mt-6">
              <Text className="font-semibold text-white">Create Plan</Text>
            </Button>
          </>
        )}
      </Animated.View>
    );
  };

  /**
   * Render loading skeleton
   */
  const renderSkeleton = () => (
    <View className="gap-3 p-6">
      {[1, 2, 3].map((i) => (
        <Animated.View
          key={i}
          entering={FadeIn.delay(i * 100).duration(300)}
          className="h-32 animate-pulse rounded-xl bg-muted"
        />
      ))}
    </View>
  );

  /**
   * Filter chip button component
   */
  const FilterChipButton = ({ label, value }: { label: string; value: FilterChip }) => (
    <Pressable
      onPress={() => handleChipPress(value)}
      className={`rounded-full border px-4 py-2 ${
        activeChip === value ? 'border-primary bg-primary' : 'border-border bg-transparent'
      }`}
    >
      <Text
        className={`text-sm font-medium ${
          activeChip === value ? 'text-white' : 'text-foreground'
        }`}
      >
        {label}
      </Text>
    </Pressable>
  );

  // FAB animated style
  const fabAnimatedStyle = useAnimatedStyle(() => {
    const scale = interpolate(fabScale.value, [0, 1], [0, 1], Extrapolation.CLAMP);
    const rotate = interpolate(fabScale.value, [0, 1], [180, 0], Extrapolation.CLAMP);
    return {
      transform: [{ scale }, { rotate: `${rotate}deg` }],
    };
  });

  // Search bar animated style
  const searchBarStyle = useAnimatedStyle(() => ({
    height: searchBarHeight.value,
    opacity: interpolate(searchBarHeight.value, [0, 56], [0, 1], Extrapolation.CLAMP),
    overflow: 'hidden' as const,
  }));

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      {/* Header */}
      <View className="border-b border-border bg-background px-6 py-4">
        <View className="flex-row items-center justify-between">
          <Text className="text-2xl font-bold text-foreground">Medication Plans</Text>
          <View className="flex-row gap-1">
            {/* Search Toggle */}
            <Pressable
              onPress={handleToggleSearch}
              className={`h-10 w-10 items-center justify-center rounded-full ${
                searchVisible ? 'bg-primary/10' : ''
              } active:bg-muted`}
            >
              {searchVisible ? (
                <X size={20} className="text-primary" />
              ) : (
                <Search size={20} className="text-foreground" />
              )}
            </Pressable>
          </View>
        </View>

        {/* Search Bar (Animated) */}
        <Animated.View style={searchBarStyle} className="mt-4">
          <Input
            placeholder="Search plans, medications..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            leftIcon={<Search size={20} className="text-muted-foreground" />}
            rightIcon={
              searchQuery ? (
                <Pressable onPress={() => setSearchQuery('')}>
                  <X size={20} className="text-muted-foreground" />
                </Pressable>
              ) : undefined
            }
            autoFocus={searchVisible}
          />
        </Animated.View>

        {/* Filter Chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mt-4"
          contentContainerStyle={{ gap: 8 }}
        >
          <FilterChipButton label="All Plans" value="all" />
          <FilterChipButton label="Active" value="active" />
          <FilterChipButton label="Paused" value="paused" />
          <FilterChipButton label="Completed" value="completed" />
        </ScrollView>

        {/* Results Count */}
        {(debouncedSearchQuery || activeChip !== 'all') && (
          <Animated.View entering={FadeInDown.duration(200)}>
            <Text className="mt-3 text-sm text-muted-foreground">
              Found {sortedPlans.length} plan{sortedPlans.length !== 1 ? 's' : ''}
            </Text>
          </Animated.View>
        )}
      </View>

      {/* Plans List */}
      {isLoading ? (
        renderSkeleton()
      ) : (
        <FlatList
          data={sortedPlans}
          renderItem={renderPlanItem}
          keyExtractor={keyExtractor}
          getItemLayout={getItemLayout}
          contentContainerStyle={{
            padding: 24,
            paddingBottom: 100,
            flexGrow: 1,
          }}
          ListEmptyComponent={renderEmptyState}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
          showsVerticalScrollIndicator={false}
          initialNumToRender={10}
          maxToRenderPerBatch={10}
          windowSize={5}
          removeClippedSubviews={Platform.OS === 'android'}
        />
      )}

      {/* Floating Action Button */}
      <Animated.View
        style={[
          fabAnimatedStyle,
          {
            position: 'absolute',
            bottom: 24,
            right: 24,
          },
        ]}
      >
        <Pressable
          onPress={handleAddPlan}
          className="h-14 w-14 items-center justify-center rounded-full bg-primary active:opacity-80"
          style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 8,
          }}
        >
          <Plus size={28} color="white" />
        </Pressable>
      </Animated.View>
    </SafeAreaView>
  );
}
