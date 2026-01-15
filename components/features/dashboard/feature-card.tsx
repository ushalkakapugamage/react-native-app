/**
 * Feature Card Component for Dashboard
 *
 * Large tappable card with icon, title, subtitle, and arrow
 * Used for main dashboard actions
 */

import { Text } from '@/components/ui/text';
import { ChevronRight, type LucideIcon } from 'lucide-react-native';
import { Pressable, View } from 'react-native';
import * as Haptics from 'expo-haptics';

interface FeatureCardProps {
  icon: LucideIcon;
  iconColor: string;
  iconBgColor: string;
  title: string;
  subtitle: string;
  onPress: () => void;
}

export function FeatureCard({
  icon: Icon,
  iconColor,
  iconBgColor,
  title,
  subtitle,
  onPress,
}: FeatureCardProps) {
  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  return (
    <Pressable
      onPress={handlePress}
      className="flex-1 rounded-xl border border-border bg-card p-4 active:opacity-80"
    >
      {/* Icon */}
      <View className={`h-12 w-12 items-center justify-center rounded-lg ${iconBgColor}`}>
        <Icon size={24} className={iconColor} />
      </View>

      {/* Title */}
      <Text className="mt-3 text-base font-semibold text-foreground">{title}</Text>

      {/* Subtitle */}
      <Text className="mt-1 text-xs text-muted-foreground">{subtitle}</Text>

      {/* Arrow */}
      <View className="absolute right-4 top-4">
        <ChevronRight size={20} className="text-muted-foreground" />
      </View>
    </Pressable>
  );
}
