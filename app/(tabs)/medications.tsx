/**
 * MediSync Medications Screen
 *
 * Complete medication management with:
 * - Search (debounced, real-time)
 * - Filter (status, type, frequency)
 * - Sort (8 options including adherence)
 * - Swipe actions (edit, delete)
 * - Pull to refresh
 * - Loading skeleton
 * - Empty states
 * - FAB for adding medication
 * - Animations
 * - Performance optimizations
 */

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { MedicationListItem } from '@/components/features/medication/medication-list-item';
import {
  FilterModal,
  type MedicationFilters,
} from '@/components/features/medication/filter-modal';
import { SortMenu, type SortOption } from '@/components/features/medication/sort-menu';
import { useMedicationStore, useActivityStore } from '@/lib/stores';
import type { Medication } from '@/lib/types';
import { useRouter } from 'expo-router';
import {
  Search,
  Filter,
  SortDesc,
  Plus,
  Pill,
  X,
  AlertCircle,
} from 'lucide-react-native';
import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
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
  FadeOut,
  SlideInDown,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withDelay,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const SORT_STORAGE_KEY = '@medications_sort_preference';
const ITEM_HEIGHT = 130; // Approximate height of each medication item
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

export default function MedicationsScreen() {
  const router = useRouter();

  // Store
  const medications = useMedicationStore((state) => state.medications);
  const events = useMedicationStore((state) => state.events);
  const deleteMedication = useMedicationStore((state) => state.deleteMedication);
  const addActivity = useActivityStore((state) => state.addActivity);

  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchVisible, setSearchVisible] = useState(false);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [sortMenuVisible, setSortMenuVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Debounced search
  const debouncedSearchQuery = useDebounce(searchQuery, DEBOUNCE_DELAY);

  // Animation values
  const fabScale = useSharedValue(0);
  const searchBarHeight = useSharedValue(0);

  // Filters and sort
  const [filters, setFilters] = useState<MedicationFilters>({
    status: 'all',
    type: 'all',
    frequency: 'all',
  });
  const [sortOption, setSortOption] = useState<SortOption>('name-asc');

  // Filter chips
  type FilterChip = 'all' | 'active' | 'paused' | 'completed';
  const [activeChip, setActiveChip] = useState<FilterChip>('all');

  // Load saved preferences and animate FAB
  useEffect(() => {
    loadSortPreference();
    animateFAB();

    // Simulate initial load
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

  const loadSortPreference = async () => {
    try {
      const saved = await AsyncStorage.getItem(SORT_STORAGE_KEY);
      if (saved) {
        setSortOption(saved as SortOption);
      }
    } catch (error) {
      console.error('Failed to load sort preference', error);
    }
  };

  const saveSortPreference = async (option: SortOption) => {
    try {
      await AsyncStorage.setItem(SORT_STORAGE_KEY, option);
    } catch (error) {
      console.error('Failed to save sort preference', error);
    }
  };

  const animateFAB = () => {
    fabScale.value = withDelay(300, withSpring(1, { damping: 12, stiffness: 100 }));
  };

  /**
   * Calculate adherence rate for a medication
   */
  const getMedicationAdherence = useCallback(
    (medicationId: string): number => {
      const medicationEvents = events.filter((e) => e.medicationId === medicationId);
      if (medicationEvents.length === 0) return 100; // No events = 100% (hasn't started)

      const takenCount = medicationEvents.filter((e) => e.status === 'taken').length;
      const completedCount = medicationEvents.filter(
        (e) => e.status === 'taken' || e.status === 'missed'
      ).length;

      if (completedCount === 0) return 100;
      return Math.round((takenCount / completedCount) * 100);
    },
    [events]
  );

  /**
   * Get next dose time for sorting
   */
  const getNextDoseMinutes = useCallback((medication: Medication): number => {
    const times = medication.schedule?.times || [];
    if (times.length === 0) return Infinity;

    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    for (const time of times) {
      const [h, m] = time.split(':').map(Number);
      const timeMinutes = h * 60 + m;
      if (timeMinutes > currentMinutes) {
        return timeMinutes - currentMinutes;
      }
    }

    // Tomorrow's first dose
    const [h, m] = times[0].split(':').map(Number);
    return 24 * 60 - currentMinutes + h * 60 + m;
  }, []);

  /**
   * Filter medications based on search, filters, and chips
   */
  const filteredMedications = useMemo(() => {
    let result = medications;

    // Apply debounced search filter
    if (debouncedSearchQuery.trim()) {
      const query = debouncedSearchQuery.toLowerCase();
      result = result.filter(
        (med) =>
          med.name.toLowerCase().includes(query) ||
          med.dosage.toLowerCase().includes(query) ||
          med.type.toLowerCase().includes(query)
      );
    }

    // Apply chip filter (quick status filter)
    if (activeChip !== 'all') {
      result = result.filter((med) => {
        if (activeChip === 'active') return med.isActive;
        if (activeChip === 'paused') return !med.isActive;
        if (activeChip === 'completed') {
          return med.endDate && new Date(med.endDate) < new Date();
        }
        return true;
      });
    }

    // Apply advanced filters
    if (filters.status !== 'all') {
      result = result.filter((med) => {
        if (filters.status === 'active') return med.isActive;
        if (filters.status === 'paused') return !med.isActive;
        if (filters.status === 'completed') {
          return med.endDate && new Date(med.endDate) < new Date();
        }
        return true;
      });
    }

    if (filters.type !== 'all') {
      result = result.filter((med) => med.type.toLowerCase() === filters.type);
    }

    if (filters.frequency !== 'all') {
      result = result.filter(
        (med) => med.frequency.toLowerCase() === filters.frequency.toLowerCase()
      );
    }

    return result;
  }, [medications, debouncedSearchQuery, activeChip, filters]);

  /**
   * Sort medications
   */
  const sortedMedications = useMemo(() => {
    const sorted = [...filteredMedications];

    switch (sortOption) {
      case 'name-asc':
        return sorted.sort((a, b) => a.name.localeCompare(b.name));
      case 'name-desc':
        return sorted.sort((a, b) => b.name.localeCompare(a.name));
      case 'next-dose-asc':
        return sorted.sort((a, b) => getNextDoseMinutes(a) - getNextDoseMinutes(b));
      case 'next-dose-desc':
        return sorted.sort((a, b) => getNextDoseMinutes(b) - getNextDoseMinutes(a));
      case 'date-added-desc':
        return sorted.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      case 'date-added-asc':
        return sorted.sort(
          (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      case 'adherence-desc':
        return sorted.sort(
          (a, b) => getMedicationAdherence(b.id) - getMedicationAdherence(a.id)
        );
      case 'adherence-asc':
        return sorted.sort(
          (a, b) => getMedicationAdherence(a.id) - getMedicationAdherence(b.id)
        );
      default:
        return sorted;
    }
  }, [filteredMedications, sortOption, getNextDoseMinutes, getMedicationAdherence]);

  /**
   * Get active filter count
   */
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.status !== 'all') count++;
    if (filters.type !== 'all') count++;
    if (filters.frequency !== 'all') count++;
    return count;
  }, [filters]);

  /**
   * Handlers
   */
  const handleRefresh = async () => {
    setRefreshing(true);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // Simulate refresh
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

  const handleApplyFilters = (newFilters: MedicationFilters) => {
    setFilters(newFilters);
    // Sync chip with filter status
    if (newFilters.status !== 'all') {
      setActiveChip(newFilters.status as FilterChip);
    }
  };

  const handleSelectSort = (option: SortOption) => {
    setSortOption(option);
    saveSortPreference(option);
  };

  const handleChipPress = (chip: FilterChip) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveChip(chip);
    // Also update filters
    setFilters({
      ...filters,
      status: chip === 'all' ? 'all' : chip,
    });
  };

  const handleAddMedication = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert('Add Medication', 'Feature coming soon');
    // router.push('/medication/add');
  };

  const handleViewMedication = useCallback((medication: Medication) => {
    Alert.alert(medication.name, 'View details (feature coming soon)');
    // router.push(`/medication/${medication.id}`);
  }, []);

  const handleEditMedication = useCallback((medication: Medication) => {
    Alert.alert('Edit', `Edit ${medication.name} (feature coming soon)`);
    // router.push(`/medication/${medication.id}/edit`);
  }, []);

  const handleDeleteMedication = useCallback(
    (medication: Medication) => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      Alert.alert(
        'Delete Medication',
        `Are you sure you want to delete ${medication.name}? This will remove all scheduled reminders.`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: () => {
              deleteMedication(medication.id);
              addActivity({
                type: 'medication_taken', // Using closest type
                title: 'Medication Deleted',
                description: `Removed ${medication.name} from medications`,
              });
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            },
          },
        ]
      );
    },
    [deleteMedication, addActivity]
  );

  /**
   * Render medication item with animation
   */
  const renderMedicationItem = useCallback(
    ({ item, index }: { item: Medication; index: number }) => (
      <Animated.View
        entering={FadeInRight.delay(index * 50)
          .duration(300)
          .springify()}
      >
        <MedicationListItem
          medication={item}
          onPress={() => handleViewMedication(item)}
          onEdit={() => handleEditMedication(item)}
          onDelete={() => handleDeleteMedication(item)}
        />
      </Animated.View>
    ),
    [handleViewMedication, handleEditMedication, handleDeleteMedication]
  );

  /**
   * Get item layout for FlatList optimization
   */
  const getItemLayout = useCallback(
    (_: any, index: number) => ({
      length: ITEM_HEIGHT,
      offset: ITEM_HEIGHT * index,
      index,
    }),
    []
  );

  /**
   * Key extractor
   */
  const keyExtractor = useCallback((item: Medication) => item.id, []);

  /**
   * Render empty state
   */
  const renderEmptyState = () => {
    const hasActiveFilters =
      activeChip !== 'all' || debouncedSearchQuery.trim() !== '' || activeFilterCount > 0;

    return (
      <Animated.View
        entering={FadeIn.delay(200).duration(400)}
        className="flex-1 items-center justify-center py-20"
      >
        {hasActiveFilters ? (
          <>
            <AlertCircle size={64} className="text-muted-foreground" />
            <Text className="mt-4 text-center text-lg font-semibold text-foreground">
              No medications found
            </Text>
            <Text className="mt-2 px-8 text-center text-sm text-muted-foreground">
              Try adjusting your filters or search query
            </Text>
            <Button
              variant="outline"
              onPress={() => {
                setSearchQuery('');
                setActiveChip('all');
                setFilters({ status: 'all', type: 'all', frequency: 'all' });
              }}
              className="mt-6"
            >
              <Text className="font-medium text-foreground">Clear Filters</Text>
            </Button>
          </>
        ) : (
          <>
            <Pill size={64} className="text-muted-foreground" />
            <Text className="mt-4 text-center text-lg font-semibold text-foreground">
              No medications yet
            </Text>
            <Text className="mt-2 px-8 text-center text-sm text-muted-foreground">
              Add your first medication to start tracking your health journey
            </Text>
            <Button onPress={handleAddMedication} className="mt-6">
              <Text className="font-semibold text-white">Add Medication</Text>
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
      {[1, 2, 3, 4].map((i) => (
        <Animated.View
          key={i}
          entering={FadeIn.delay(i * 100).duration(300)}
          className="h-28 animate-pulse rounded-xl bg-muted"
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
          <Text className="text-2xl font-bold text-foreground">My Medications</Text>
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

            {/* Filter Button */}
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setFilterModalVisible(true);
              }}
              className="relative h-10 w-10 items-center justify-center rounded-full active:bg-muted"
            >
              <Filter size={20} className="text-foreground" />
              {activeFilterCount > 0 && (
                <View className="absolute right-0 top-0 h-5 w-5 items-center justify-center rounded-full bg-primary">
                  <Text className="text-xs font-bold text-white">{activeFilterCount}</Text>
                </View>
              )}
            </Pressable>

            {/* Sort Button */}
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setSortMenuVisible(true);
              }}
              className="h-10 w-10 items-center justify-center rounded-full active:bg-muted"
            >
              <SortDesc size={20} className="text-foreground" />
            </Pressable>
          </View>
        </View>

        {/* Search Bar (Animated) */}
        <Animated.View style={searchBarStyle} className="mt-4">
          <Input
            placeholder="Search medications..."
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
          contentContainerClassName="gap-2"
        >
          <FilterChipButton label="All" value="all" />
          <FilterChipButton label="Active" value="active" />
          <FilterChipButton label="Paused" value="paused" />
          <FilterChipButton label="Completed" value="completed" />
        </ScrollView>

        {/* Results Count */}
        {(debouncedSearchQuery || activeChip !== 'all' || activeFilterCount > 0) && (
          <Animated.View entering={FadeInDown.duration(200)}>
            <Text className="mt-3 text-sm text-muted-foreground">
              Found {sortedMedications.length} medication
              {sortedMedications.length !== 1 ? 's' : ''}
            </Text>
          </Animated.View>
        )}
      </View>

      {/* Medications List */}
      {isLoading ? (
        renderSkeleton()
      ) : (
        <FlatList
          data={sortedMedications}
          renderItem={renderMedicationItem}
          keyExtractor={keyExtractor}
          getItemLayout={getItemLayout}
          contentContainerStyle={{
            padding: 24,
            paddingBottom: 100, // Space for FAB
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
          onPress={handleAddMedication}
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

      {/* Filter Modal */}
      <FilterModal
        visible={filterModalVisible}
        filters={filters}
        onClose={() => setFilterModalVisible(false)}
        onApply={handleApplyFilters}
      />

      {/* Sort Menu */}
      <SortMenu
        visible={sortMenuVisible}
        selectedSort={sortOption}
        onClose={() => setSortMenuVisible(false)}
        onSelect={handleSelectSort}
      />
    </SafeAreaView>
  );
}
