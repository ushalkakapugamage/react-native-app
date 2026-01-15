/**
 * Filter Modal Component for Medications
 *
 * Bottom sheet modal with filter options:
 * - Status (All, Active, Paused, Completed)
 * - Type (All, Tablet, Syrup, etc.)
 * - Frequency (All, Daily, Weekly, etc.)
 * - Date Range (optional)
 */

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { X, Check, Calendar } from 'lucide-react-native';
import { Modal, Pressable, ScrollView, View } from 'react-native';
import Animated, { FadeIn, FadeOut, SlideInDown, SlideOutDown } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

export interface MedicationFilters {
  status: 'all' | 'active' | 'paused' | 'completed';
  type: string;
  frequency: string;
  startDate?: Date;
  endDate?: Date;
}

interface FilterModalProps {
  visible: boolean;
  filters: MedicationFilters;
  onClose: () => void;
  onApply: (filters: MedicationFilters) => void;
}

const MEDICATION_TYPES = [
  { value: 'all', label: 'All Types' },
  { value: 'tablet', label: 'Tablet' },
  { value: 'syrup', label: 'Syrup' },
  { value: 'injection', label: 'Injection' },
  { value: 'drops', label: 'Drops' },
  { value: 'inhaler', label: 'Inhaler' },
  { value: 'cream', label: 'Cream' },
];

const FREQUENCIES = [
  { value: 'all', label: 'All Frequencies' },
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'as-needed', label: 'As Needed' },
];

const STATUSES = [
  { value: 'all', label: 'All Status' },
  { value: 'active', label: 'Active' },
  { value: 'paused', label: 'Paused' },
  { value: 'completed', label: 'Completed' },
];

export function FilterModal({ visible, filters, onClose, onApply }: FilterModalProps) {
  const [tempFilters, setTempFilters] = useState<MedicationFilters>(filters);

  useEffect(() => {
    if (visible) {
      setTempFilters(filters);
    }
  }, [filters, visible]);

  const handleApply = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onApply(tempFilters);
    onClose();
  };

  const handleClear = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setTempFilters({
      status: 'all',
      type: 'all',
      frequency: 'all',
    });
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (tempFilters.status !== 'all') count++;
    if (tempFilters.type !== 'all') count++;
    if (tempFilters.frequency !== 'all') count++;
    return count;
  };

  const FilterOption = ({
    label,
    selected,
    onSelect,
  }: {
    label: string;
    selected: boolean;
    onSelect: () => void;
  }) => (
    <Pressable
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onSelect();
      }}
      className={`flex-row items-center justify-between rounded-lg border px-4 py-3 ${
        selected ? 'border-primary bg-primary/10' : 'border-border bg-card'
      }`}
    >
      <Text
        className={`text-base ${selected ? 'font-semibold text-primary' : 'text-foreground'}`}
      >
        {label}
      </Text>
      {selected && <Check size={18} className="text-primary" />}
    </Pressable>
  );

  const FilterSection = ({
    title,
    children,
  }: {
    title: string;
    children: React.ReactNode;
  }) => (
    <View className="mb-6">
      <Text className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        {title}
      </Text>
      <View className="gap-2">{children}</View>
    </View>
  );

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <View className="flex-1 justify-end">
        {/* Backdrop */}
        <Animated.View
          entering={FadeIn.duration(200)}
          exiting={FadeOut.duration(200)}
          className="absolute inset-0 bg-black/50"
        >
          <Pressable className="flex-1" onPress={onClose} />
        </Animated.View>

        {/* Modal Content */}
        <Animated.View
          entering={SlideInDown.springify().damping(15)}
          exiting={SlideOutDown.duration(200)}
          className="max-h-[85%] rounded-t-3xl bg-background"
        >
          {/* Header */}
          <View className="flex-row items-center justify-between border-b border-border px-6 py-4">
            <View>
              <Text className="text-xl font-bold text-foreground">Filter Medications</Text>
              {getActiveFilterCount() > 0 && (
                <Text className="mt-1 text-xs text-muted-foreground">
                  {getActiveFilterCount()} filter{getActiveFilterCount() !== 1 ? 's' : ''} active
                </Text>
              )}
            </View>
            <Pressable
              onPress={onClose}
              className="h-10 w-10 items-center justify-center rounded-full active:bg-muted"
            >
              <X size={24} className="text-muted-foreground" />
            </Pressable>
          </View>

          {/* Content */}
          <ScrollView
            className="flex-1 px-6 py-4"
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            {/* Status Filter */}
            <FilterSection title="Status">
              {STATUSES.map((status) => (
                <FilterOption
                  key={status.value}
                  label={status.label}
                  selected={tempFilters.status === status.value}
                  onSelect={() =>
                    setTempFilters({
                      ...tempFilters,
                      status: status.value as MedicationFilters['status'],
                    })
                  }
                />
              ))}
            </FilterSection>

            {/* Type Filter */}
            <FilterSection title="Medication Type">
              {MEDICATION_TYPES.map((type) => (
                <FilterOption
                  key={type.value}
                  label={type.label}
                  selected={tempFilters.type === type.value}
                  onSelect={() => setTempFilters({ ...tempFilters, type: type.value })}
                />
              ))}
            </FilterSection>

            {/* Frequency Filter */}
            <FilterSection title="Frequency">
              {FREQUENCIES.map((freq) => (
                <FilterOption
                  key={freq.value}
                  label={freq.label}
                  selected={tempFilters.frequency === freq.value}
                  onSelect={() => setTempFilters({ ...tempFilters, frequency: freq.value })}
                />
              ))}
            </FilterSection>

            {/* Extra padding for scroll */}
            <View className="h-4" />
          </ScrollView>

          {/* Footer Actions */}
          <View className="flex-row gap-3 border-t border-border px-6 py-4 pb-8">
            <Button
              variant="outline"
              size="lg"
              onPress={handleClear}
              className="flex-1"
              disabled={getActiveFilterCount() === 0}
            >
              <Text
                className={`text-base font-medium ${
                  getActiveFilterCount() === 0 ? 'text-muted-foreground' : 'text-foreground'
                }`}
              >
                Clear All
              </Text>
            </Button>
            <Button size="lg" onPress={handleApply} className="flex-1">
              <Text className="text-base font-semibold text-white">Apply Filters</Text>
            </Button>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}
