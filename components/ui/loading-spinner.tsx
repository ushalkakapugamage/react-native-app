/**
 * MediSync Loading Spinner Component
 * Centered loading indicator with optional text
 */

import { cn } from '@/lib/utils';
import { ActivityIndicator, Text, View, type ViewProps } from 'react-native';

export interface LoadingSpinnerProps extends ViewProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  text?: string;
  fullScreen?: boolean;
}

export function LoadingSpinner({
  size = 'md',
  color = '#72A8E8',
  text,
  fullScreen = false,
  className,
  ...props
}: LoadingSpinnerProps) {
  const getSize = () => {
    switch (size) {
      case 'sm':
        return 'small' as const;
      case 'lg':
        return 'large' as const;
      default:
        return 'large' as const;
    }
  };

  const getTextSize = () => {
    switch (size) {
      case 'sm':
        return 'text-sm';
      case 'lg':
        return 'text-lg';
      default:
        return 'text-base';
    }
  };

  const content = (
    <View
      className={cn(
        'items-center justify-center',
        fullScreen ? 'flex-1' : 'py-8',
        className
      )}
      {...props}
    >
      <ActivityIndicator size={getSize()} color={color} />
      {text && (
        <Text
          className={cn(
            'mt-3 font-medium text-muted-foreground',
            getTextSize()
          )}
        >
          {text}
        </Text>
      )}
    </View>
  );

  if (fullScreen) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        {content}
      </View>
    );
  }

  return content;
}

// Mini inline spinner (for buttons, etc.)
export interface MiniSpinnerProps {
  size?: number;
  color?: string;
  className?: string;
}

export function MiniSpinner({
  size = 16,
  color = '#72A8E8',
  className,
}: MiniSpinnerProps) {
  return (
    <View className={cn('items-center justify-center', className)}>
      <ActivityIndicator size="small" color={color} style={{ transform: [{ scale: size / 20 }] }} />
    </View>
  );
}
