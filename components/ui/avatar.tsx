/**
 * MediSync Avatar Component
 * User avatars with status indicators and fallbacks
 */

import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';
import { forwardRef } from 'react';
import { Image, type ImageProps, Text, View } from 'react-native';

const avatarVariants = cva(
  'relative items-center justify-center overflow-hidden rounded-full bg-primary/10',
  {
    variants: {
      size: {
        sm: 'h-8 w-8',
        md: 'h-10 w-10',
        lg: 'h-14 w-14',
        xl: 'h-20 w-20',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  }
);

const avatarTextVariants = cva('font-semibold text-primary', {
  variants: {
    size: {
      sm: 'text-xs',
      md: 'text-sm',
      lg: 'text-lg',
      xl: 'text-2xl',
    },
  },
  defaultVariants: {
    size: 'md',
  },
});

const avatarStatusVariants = cva(
  'absolute rounded-full border-2 border-background',
  {
    variants: {
      size: {
        sm: 'h-2 w-2 bottom-0 right-0',
        md: 'h-2.5 w-2.5 bottom-0 right-0',
        lg: 'h-3.5 w-3.5 bottom-0.5 right-0.5',
        xl: 'h-5 w-5 bottom-1 right-1',
      },
      status: {
        online: 'bg-[#4CAF50]',
        offline: 'bg-neutral-400',
        away: 'bg-[#FFA726]',
        busy: 'bg-[#EF5350]',
      },
    },
    defaultVariants: {
      size: 'md',
      status: 'offline',
    },
  }
);

interface AvatarProps extends VariantProps<typeof avatarVariants> {
  source?: ImageProps['source'];
  alt?: string;
  fallback?: string;
  status?: 'online' | 'offline' | 'away' | 'busy';
  showStatus?: boolean;
  ring?: boolean;
  className?: string;
  imageClassName?: string;
}

const Avatar = forwardRef<View, AvatarProps>(
  (
    {
      source,
      alt = '',
      fallback = '',
      status = 'offline',
      showStatus = false,
      ring = false,
      size,
      className,
      imageClassName,
    },
    ref
  ) => {
    // Generate initials from fallback text (first 2 letters)
    const getInitials = (text: string): string => {
      if (!text) return '?';
      const words = text.trim().split(/\s+/);
      if (words.length >= 2) {
        return (words[0][0] + words[1][0]).toUpperCase();
      }
      return text.substring(0, 2).toUpperCase();
    };

    const initials = getInitials(fallback || alt);

    return (
      <View
        ref={ref}
        className={cn(
          avatarVariants({ size }),
          ring && 'border-2 border-primary',
          className
        )}
      >
        {source ? (
          <Image
            source={source}
            alt={alt}
            className={cn('h-full w-full', imageClassName)}
            resizeMode="cover"
          />
        ) : (
          <Text className={avatarTextVariants({ size })}>{initials}</Text>
        )}

        {/* Status Indicator */}
        {showStatus && (
          <View className={avatarStatusVariants({ size, status })} />
        )}
      </View>
    );
  }
);

Avatar.displayName = 'Avatar';

// Avatar Group Component
interface AvatarGroupProps {
  children: React.ReactNode;
  max?: number;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const AvatarGroup = forwardRef<View, AvatarGroupProps>(
  ({ children, max = 3, size = 'md', className }, ref) => {
    const childArray = React.Children.toArray(children);
    const displayChildren = max ? childArray.slice(0, max) : childArray;
    const remainingCount = childArray.length - displayChildren.length;

    const getSizeClass = () => {
      switch (size) {
        case 'sm':
          return 'h-8 w-8';
        case 'lg':
          return 'h-14 w-14';
        case 'xl':
          return 'h-20 w-20';
        default:
          return 'h-10 w-10';
      }
    };

    return (
      <View ref={ref} className={cn('flex-row', className)}>
        {displayChildren.map((child, index) => (
          <View
            key={index}
            className={cn('', index > 0 && '-ml-3')}
            style={{ zIndex: displayChildren.length - index }}
          >
            {child}
          </View>
        ))}
        {remainingCount > 0 && (
          <View
            className={cn(
              'items-center justify-center rounded-full bg-neutral-200 dark:bg-neutral-800 -ml-3',
              getSizeClass()
            )}
            style={{ zIndex: 0 }}
          >
            <Text
              className={cn(
                'font-semibold text-neutral-700 dark:text-neutral-300',
                avatarTextVariants({ size })
              )}
            >
              +{remainingCount}
            </Text>
          </View>
        )}
      </View>
    );
  }
);

AvatarGroup.displayName = 'AvatarGroup';

export { Avatar, AvatarGroup, avatarVariants };
export type { AvatarProps, AvatarGroupProps };
