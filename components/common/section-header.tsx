/**
 * Section Header Component
 *
 * Reusable section header with title and optional "View All" link
 */

import { Text } from '@/components/ui/text';
import { Pressable, View } from 'react-native';
import * as Haptics from 'expo-haptics';

interface SectionHeaderProps {
  title: string;
  actionText?: string;
  onActionPress?: () => void;
}

export function SectionHeader({ title, actionText, onActionPress }: SectionHeaderProps) {
  const handleActionPress = () => {
    if (onActionPress) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onActionPress();
    }
  };

  return (
    <View className="flex-row items-center justify-between">
      <Text className="text-lg font-bold text-foreground">{title}</Text>
      {actionText && onActionPress && (
        <Pressable onPress={handleActionPress}>
          <Text className="text-sm font-medium text-primary">{actionText}</Text>
        </Pressable>
      )}
    </View>
  );
}
