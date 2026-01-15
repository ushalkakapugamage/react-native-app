/**
 * Activity Item Component for Dashboard
 *
 * Timeline item showing recent activity
 * Includes icon, description, time, and connecting line
 */

import { Text } from '@/components/ui/text';
import { type LucideIcon } from 'lucide-react-native';
import { View } from 'react-native';

interface ActivityItemProps {
  icon: LucideIcon;
  iconColor: string;
  iconBgColor: string;
  description: string;
  time: string;
  isLast?: boolean;
}

export function ActivityItem({
  icon: Icon,
  iconColor,
  iconBgColor,
  description,
  time,
  isLast = false,
}: ActivityItemProps) {
  return (
    <View className="flex-row gap-3">
      {/* Timeline */}
      <View className="items-center">
        {/* Icon */}
        <View className={`h-10 w-10 items-center justify-center rounded-full ${iconBgColor}`}>
          <Icon size={18} className={iconColor} />
        </View>

        {/* Line */}
        {!isLast && <View className="my-1 w-0.5 flex-1 bg-border" />}
      </View>

      {/* Content */}
      <View className="flex-1 pb-4">
        <Text className="text-sm text-foreground">{description}</Text>
        <Text className="mt-1 text-xs text-muted-foreground">{time}</Text>
      </View>
    </View>
  );
}
