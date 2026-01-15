/**
 * MediSync Button Component
 * Customized with MediSync branding and haptic feedback
 */

import { TextClassContext } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';
import * as Haptics from 'expo-haptics';
import { ActivityIndicator, Platform, Pressable } from 'react-native';

const buttonVariants = cva(
  cn(
    'group shrink-0 flex-row items-center justify-center gap-2 rounded-lg shadow-none transition-theme',
    Platform.select({
      web: 'outline-none transition-all focus-visible:ring-2 focus-visible:ring-primary/50 disabled:pointer-events-none [&_svg:not([class*="size-"])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0',
    })
  ),
  {
    variants: {
      variant: {
        default: cn(
          'bg-[#72A8E8] shadow-sm shadow-black/5 active:opacity-80',
          Platform.select({ web: 'hover:bg-[#4A8FE5]' })
        ),
        secondary: cn(
          'bg-[#F8A978] shadow-sm shadow-black/5 active:opacity-80',
          Platform.select({ web: 'hover:bg-[#F6935C]' })
        ),
        destructive: cn(
          'bg-[#EF5350] shadow-sm shadow-black/5 active:opacity-80',
          Platform.select({ web: 'hover:bg-[#E53935]' })
        ),
        success: cn(
          'bg-[#4CAF50] shadow-sm shadow-black/5 active:opacity-80',
          Platform.select({ web: 'hover:bg-[#43A047]' })
        ),
        outline: cn(
          'border-2 border-[#72A8E8] bg-transparent active:bg-[#72A8E8]/10',
          Platform.select({ web: 'hover:bg-[#72A8E8]/10' })
        ),
        ghost: cn(
          'bg-transparent active:bg-[#72A8E8]/10',
          Platform.select({ web: 'hover:bg-[#72A8E8]/10' })
        ),
        link: 'bg-transparent',
      },
      size: {
        sm: cn('h-9 px-3', Platform.select({ web: 'has-[>svg]:px-2.5' })),
        md: cn('h-11 px-5', Platform.select({ web: 'has-[>svg]:px-4' })),
        lg: cn('h-14 px-7', Platform.select({ web: 'has-[>svg]:px-6' })),
        icon: 'h-11 w-11',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

const buttonTextVariants = cva(
  cn(
    'font-semibold text-center',
    Platform.select({ web: 'pointer-events-none transition-colors' })
  ),
  {
    variants: {
      variant: {
        default: 'text-white',
        secondary: 'text-black',
        destructive: 'text-white',
        success: 'text-white',
        outline: 'text-[#72A8E8]',
        ghost: 'text-[#72A8E8]',
        link: cn(
          'text-[#72A8E8] underline',
          Platform.select({ web: 'underline-offset-4' })
        ),
      },
      size: {
        sm: 'text-sm',
        md: 'text-base',
        lg: 'text-lg',
        icon: 'text-base',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

type ButtonProps = React.ComponentProps<typeof Pressable> &
  React.RefAttributes<typeof Pressable> &
  VariantProps<typeof buttonVariants> & {
    loading?: boolean;
    hapticFeedback?: boolean;
  };

function Button({
  className,
  variant,
  size,
  loading = false,
  hapticFeedback = true,
  onPress,
  disabled,
  children,
  ...props
}: ButtonProps) {
  const handlePress = async (event: any) => {
    if (disabled || loading) return;

    // Haptic feedback on native platforms
    if (hapticFeedback && Platform.OS !== 'web') {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    onPress?.(event);
  };

  const getLoadingColor = () => {
    if (variant === 'outline' || variant === 'ghost' || variant === 'link') {
      return '#72A8E8';
    }
    if (variant === 'secondary') {
      return '#000000';
    }
    return '#FFFFFF';
  };

  return (
    <TextClassContext.Provider value={buttonTextVariants({ variant, size })}>
      <Pressable
        className={cn(
          (disabled || loading) && 'opacity-50',
          buttonVariants({ variant, size }),
          className
        )}
        disabled={disabled || loading}
        onPress={handlePress}
        role="button"
        {...props}
      >
        {loading ? (
          <ActivityIndicator color={getLoadingColor()} size="small" />
        ) : (
          children
        )}
      </Pressable>
    </TextClassContext.Provider>
  );
}

export { Button, buttonTextVariants, buttonVariants };
export type { ButtonProps };
