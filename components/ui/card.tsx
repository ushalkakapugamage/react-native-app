/**
 * MediSync Card Component
 * Versatile card with variants and pressable option
 */

import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';
import { forwardRef } from 'react';
import { Platform, Pressable, View, type ViewProps } from 'react-native';

const cardVariants = cva(
  'rounded-xl overflow-hidden transition-theme',
  {
    variants: {
      variant: {
        default: 'bg-card border border-border',
        elevated: cn(
          'bg-card',
          Platform.select({
            ios: 'shadow-md shadow-black/10',
            android: 'elevation-2',
            web: 'shadow-md shadow-black/10',
          })
        ),
        outlined: 'bg-transparent border-2 border-border',
      },
      padding: {
        none: '',
        sm: 'p-3',
        md: 'p-4',
        lg: 'p-6',
      },
    },
    defaultVariants: {
      variant: 'default',
      padding: 'md',
    },
  }
);

interface BaseCardProps extends VariantProps<typeof cardVariants> {
  className?: string;
  children?: React.ReactNode;
}

// Non-pressable card
interface CardViewProps extends ViewProps, BaseCardProps {
  pressable?: false;
  onPress?: never;
}

// Pressable card
interface CardPressableProps
  extends Omit<React.ComponentProps<typeof Pressable>, 'children'>,
    BaseCardProps {
  pressable: true;
}

type CardProps = CardViewProps | CardPressableProps;

const Card = forwardRef<View, CardProps>(
  ({ variant, padding, className, pressable, children, ...props }, ref) => {
    const baseClassName = cn(cardVariants({ variant, padding }), className);

    if (pressable) {
      const { onPress, ...pressableProps } = props as CardPressableProps;
      return (
        <Pressable
          ref={ref as any}
          onPress={onPress}
          className={cn(baseClassName, 'active:opacity-80')}
          {...pressableProps}
        >
          {children}
        </Pressable>
      );
    }

    return (
      <View ref={ref} className={baseClassName} {...(props as ViewProps)}>
        {children}
      </View>
    );
  }
);

Card.displayName = 'Card';

// Card subcomponents
const CardHeader = forwardRef<
  View,
  ViewProps & { className?: string }
>(({ className, ...props }, ref) => (
  <View ref={ref} className={cn('flex-col gap-1.5 pb-4', className)} {...props} />
));
CardHeader.displayName = 'CardHeader';

const CardTitle = forwardRef<
  View,
  ViewProps & { className?: string }
>(({ className, ...props }, ref) => (
  <View ref={ref} className={cn('text-lg font-semibold text-foreground', className)} {...props} />
));
CardTitle.displayName = 'CardTitle';

const CardDescription = forwardRef<
  View,
  ViewProps & { className?: string }
>(({ className, ...props }, ref) => (
  <View ref={ref} className={cn('text-sm text-muted-foreground', className)} {...props} />
));
CardDescription.displayName = 'CardDescription';

const CardContent = forwardRef<
  View,
  ViewProps & { className?: string }
>(({ className, ...props }, ref) => (
  <View ref={ref} className={cn('', className)} {...props} />
));
CardContent.displayName = 'CardContent';

const CardFooter = forwardRef<
  View,
  ViewProps & { className?: string }
>(({ className, ...props }, ref) => (
  <View ref={ref} className={cn('flex-row items-center pt-4', className)} {...props} />
));
CardFooter.displayName = 'CardFooter';

export {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  cardVariants,
};
export type { CardProps };
