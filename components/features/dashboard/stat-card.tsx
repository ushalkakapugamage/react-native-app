/**
 * Stat Card Component for Dashboard
 *
 * Displays a statistic with icon, number, and label
 * Supports trend indicators and tap actions
 */

import { Text } from '@/components/ui/text';
import { TrendingUp } from 'lucide-react-native';
import { type LucideIcon } from 'lucide-react-native';
import { Pressable, View } from 'react-native';
import * as Haptics from 'expo-haptics';

interface StatCardProps {
  icon: LucideIcon;
  iconColor: string;
  iconBgColor: string;
  value: string | number;
  label: string;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  onPress?: () => void;
}

export function StatCard({
  icon: Icon,
  iconColor,
  iconBgColor,
  value,
  label,
  trend,
  onPress,
}: StatCardProps) {
  const handlePress = () => {
    if (onPress) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onPress();
    }
  };

  return (
    <Pressable
      onPress={handlePress}
      disabled={!onPress}
      className="w-36 rounded-xl border border-border bg-card p-4 active:opacity-80"
    >
      {/* Icon */}
      <View className={`h-10 w-10 items-center justify-center rounded-lg ${iconBgColor}`}>
        <Icon size={20} className={iconColor} />
      </View>

      {/* Value */}
      <Text className="mt-3 text-2xl font-bold text-foreground">{value}</Text>

      {/* Label */}
      <Text className="mt-1 text-xs text-muted-foreground">{label}</Text>

      {/* Trend */}
      {trend && (
        <View className="mt-2 flex-row items-center gap-1">
          <TrendingUp
            size={12}
            className={trend.isPositive ? 'text-success' : 'text-danger'}
            style={{
              transform: [{ rotate: trend.isPositive ? '0deg' : '180deg' }],
            }}
          />
          <Text
            className={`text-xs font-medium ${
              trend.isPositive ? 'text-success' : 'text-danger'
            }`}
          >
            {trend.value}
          </Text>
        </View>
      )}
    </Pressable>
  );
}
