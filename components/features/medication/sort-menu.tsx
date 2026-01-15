/**
 * Sort Menu Component for Medications
 *
 * Dropdown menu with sort options:
 * - Name (A-Z, Z-A)
 * - Next dose (soonest, latest)
 * - Recently added (newest, oldest)
 * - Adherence rate (highest, lowest)
 */

import React from 'react';
import { Text } from '@/components/ui/text';
import { Check, ArrowUpAZ, ArrowDownAZ, Clock, Calendar, TrendingUp, TrendingDown } from 'lucide-react-native';
import { Modal, Pressable, View, type ViewStyle } from 'react-native';
import Animated, { FadeIn, FadeOut, ZoomIn, ZoomOut } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

export type SortOption =
  | 'name-asc'
  | 'name-desc'
  | 'next-dose-asc'
  | 'next-dose-desc'
  | 'date-added-desc'
  | 'date-added-asc'
  | 'adherence-desc'
  | 'adherence-asc';

interface SortMenuProps {
  visible: boolean;
  selectedSort: SortOption;
  onClose: () => void;
  onSelect: (option: SortOption) => void;
}

interface SortOptionItem {
  value: SortOption;
  label: string;
  icon: React.ReactNode;
  group: string;
}

const sortOptions: SortOptionItem[] = [
  {
    value: 'name-asc',
    label: 'Name (A-Z)',
    icon: <ArrowUpAZ size={18} className="text-muted-foreground" />,
    group: 'Name',
  },
  {
    value: 'name-desc',
    label: 'Name (Z-A)',
    icon: <ArrowDownAZ size={18} className="text-muted-foreground" />,
    group: 'Name',
  },
  {
    value: 'next-dose-asc',
    label: 'Next dose (soonest)',
    icon: <Clock size={18} className="text-muted-foreground" />,
    group: 'Schedule',
  },
  {
    value: 'next-dose-desc',
    label: 'Next dose (latest)',
    icon: <Clock size={18} className="text-muted-foreground" />,
    group: 'Schedule',
  },
  {
    value: 'date-added-desc',
    label: 'Recently added',
    icon: <Calendar size={18} className="text-muted-foreground" />,
    group: 'Date',
  },
  {
    value: 'date-added-asc',
    label: 'Oldest first',
    icon: <Calendar size={18} className="text-muted-foreground" />,
    group: 'Date',
  },
  {
    value: 'adherence-desc',
    label: 'Adherence (highest)',
    icon: <TrendingUp size={18} className="text-success" />,
    group: 'Adherence',
  },
  {
    value: 'adherence-asc',
    label: 'Adherence (lowest)',
    icon: <TrendingDown size={18} className="text-danger" />,
    group: 'Adherence',
  },
];

export function SortMenu({ visible, selectedSort, onClose, onSelect }: SortMenuProps) {
  const handleSelect = (option: SortOption) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSelect(option);
    onClose();
  };

  if (!visible) return null;

  // Group options by category
  const groupedOptions = sortOptions.reduce(
    (acc, option) => {
      if (!acc[option.group]) {
        acc[option.group] = [];
      }
      acc[option.group].push(option);
      return acc;
    },
    {} as Record<string, SortOptionItem[]>
  );

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <View className="flex-1">
        {/* Backdrop */}
        <Animated.View
          entering={FadeIn.duration(150)}
          exiting={FadeOut.duration(150)}
          className="absolute inset-0 bg-black/30"
        >
          <Pressable className="flex-1" onPress={onClose} />
        </Animated.View>

        {/* Menu positioned at top right */}
        <View className="flex-1 items-end p-4 pt-16">
          <Animated.View
            entering={ZoomIn.duration(200).springify()}
            exiting={ZoomOut.duration(150)}
            className="w-72 overflow-hidden rounded-xl border border-border bg-card shadow-2xl"
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.15,
              shadowRadius: 16,
              elevation: 12,
            }}
          >
            {/* Header */}
            <View className="border-b border-border bg-muted/30 px-4 py-3">
              <Text className="text-sm font-semibold text-foreground">Sort by</Text>
            </View>

            {/* Options grouped */}
            <View className="py-1">
              {Object.entries(groupedOptions).map(([group, options], groupIndex) => (
                <View key={group}>
                  {/* Group divider (except first) */}
                  {groupIndex > 0 && <View className="mx-4 my-1 h-px bg-border" />}

                  {options.map((option) => (
                    <Pressable
                      key={option.value}
                      onPress={() => handleSelect(option.value)}
                      className="flex-row items-center justify-between px-4 py-3 active:bg-muted"
                    >
                      <View className="flex-row items-center gap-3">
                        {option.icon}
                        <Text
                          className={`text-sm ${
                            selectedSort === option.value
                              ? 'font-semibold text-primary'
                              : 'text-foreground'
                          }`}
                        >
                          {option.label}
                        </Text>
                      </View>
                      {selectedSort === option.value && (
                        <Check size={18} className="text-primary" />
                      )}
                    </Pressable>
                  ))}
                </View>
              ))}
            </View>
          </Animated.View>
        </View>
      </View>
    </Modal>
  );
}
