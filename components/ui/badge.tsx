/**
 * MediSync Badge Component
 * Status badges with semantic colors
 */

import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';
import { forwardRef } from 'react';
import { Text, View, type ViewProps } from 'react-native';

const badgeVariants = cva(
  'flex-row items-center justify-center rounded-full transition-theme',
  {
    variants: {
      variant: {
        default: 'bg-neutral-100 dark:bg-neutral-800',
        success: 'bg-[#4CAF50]/10',
        warning: 'bg-[#FFA726]/10',
        danger: 'bg-[#EF5350]/10',
        info: 'bg-[#72A8E8]/10',
      },
      size: {
        sm: 'px-2 py-0.5',
        md: 'px-2.5 py-1',
        lg: 'px-3 py-1.5',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

const badgeTextVariants = cva('font-medium', {
  variants: {
    variant: {
      default: 'text-neutral-700 dark:text-neutral-300',
      success: 'text-[#4CAF50]',
      warning: 'text-[#FFA726]',
      danger: 'text-[#EF5350]',
      info: 'text-[#72A8E8]',
    },
    size: {
      sm: 'text-xs',
      md: 'text-sm',
      lg: 'text-base',
    },
  },
  defaultVariants: {
    variant: 'default',
    size: 'md',
  },
});

const badgeDotVariants = cva('rounded-full', {
  variants: {
    variant: {
      default: 'bg-neutral-700 dark:bg-neutral-300',
      success: 'bg-[#4CAF50]',
      warning: 'bg-[#FFA726]',
      danger: 'bg-[#EF5350]',
      info: 'bg-[#72A8E8]',
    },
    size: {
      sm: 'h-1.5 w-1.5',
      md: 'h-2 w-2',
      lg: 'h-2.5 w-2.5',
    },
  },
  defaultVariants: {
    variant: 'default',
    size: 'md',
  },
});

interface BadgeProps
  extends ViewProps,
    VariantProps<typeof badgeVariants> {
  children?: string | React.ReactNode;
  dot?: boolean;
  textClassName?: string;
}

const Badge = forwardRef<View, BadgeProps>(
  (
    {
      className,
      variant,
      size,
      children,
      dot = false,
      textClassName,
      ...props
    },
    ref
  ) => {
    return (
      <View
        ref={ref}
        className={cn(badgeVariants({ variant, size }), className)}
        {...props}
      >
        {dot && (
          <View
            className={cn(
              badgeDotVariants({ variant, size }),
              typeof children === 'string' && 'mr-1.5'
            )}
          />
        )}
        {typeof children === 'string' ? (
          <Text
            className={cn(badgeTextVariants({ variant, size }), textClassName)}
          >
            {children}
          </Text>
        ) : (
          children
        )}
      </View>
    );
  }
);

Badge.displayName = 'Badge';

export { Badge, badgeVariants, badgeTextVariants };
export type { BadgeProps };
