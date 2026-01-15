/**
 * MediSync Input Component
 * Full-featured text input with icons, labels, and states
 */

import { cn } from '@/lib/utils';
import { Eye, EyeOff } from 'lucide-react-native';
import { forwardRef, useState } from 'react';
import {
  Platform,
  Pressable,
  Text,
  TextInput,
  type TextInputProps,
  View,
} from 'react-native';

export interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  helperText?: string;
  success?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerClassName?: string;
  labelClassName?: string;
  inputClassName?: string;
  type?: 'text' | 'password' | 'email' | 'number';
}

const Input = forwardRef<React.ElementRef<typeof TextInput>, InputProps>(
  (
    {
      label,
      error,
      helperText,
      success,
      leftIcon,
      rightIcon,
      containerClassName,
      labelClassName,
      inputClassName,
      type = 'text',
      className,
      secureTextEntry,
      ...props
    },
    ref
  ) => {
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [isFocused, setIsFocused] = useState(false);

    const isPassword = type === 'password' || secureTextEntry;
    const isSecure = isPassword && !isPasswordVisible;

    // Determine border color
    const getBorderColor = () => {
      if (error) return 'border-[#EF5350]'; // Danger
      if (success) return 'border-[#4CAF50]'; // Success
      if (isFocused) return 'border-[#72A8E8]'; // Primary
      return 'border-border';
    };

    const getInputProps = (): Partial<TextInputProps> => {
      const baseProps = {
        keyboardType: 'default' as const,
        autoCapitalize: 'sentences' as const,
        autoComplete: 'off' as const,
      };

      if (type === 'email') {
        return {
          ...baseProps,
          keyboardType: 'email-address',
          autoCapitalize: 'none',
          autoComplete: 'email',
        };
      }

      if (type === 'number') {
        return {
          ...baseProps,
          keyboardType: 'numeric',
          autoComplete: 'off',
        };
      }

      if (type === 'password') {
        return {
          ...baseProps,
          autoCapitalize: 'none',
          autoComplete: Platform.select({
            ios: 'password',
            android: 'password',
            default: 'off',
          }),
        };
      }

      return baseProps;
    };

    return (
      <View className={cn('gap-2', containerClassName)}>
        {/* Label */}
        {label && (
          <Text
            className={cn(
              'text-sm font-medium text-foreground',
              labelClassName
            )}
          >
            {label}
          </Text>
        )}

        {/* Input Container */}
        <View
          className={cn(
            'flex-row items-center gap-3 rounded-lg border bg-card px-4 py-3 transition-theme',
            getBorderColor(),
            className
          )}
        >
          {/* Left Icon */}
          {leftIcon && <View className="opacity-70">{leftIcon}</View>}

          {/* Text Input */}
          <TextInput
            ref={ref}
            className={cn(
              'flex-1 text-base text-foreground',
              Platform.select({
                web: 'outline-none',
              }),
              inputClassName
            )}
            placeholderTextColor="#A3A3A3"
            secureTextEntry={isSecure}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            {...getInputProps()}
            {...props}
          />

          {/* Password Toggle */}
          {isPassword && (
            <Pressable
              onPress={() => setIsPasswordVisible(!isPasswordVisible)}
              className="active:opacity-70"
            >
              {isPasswordVisible ? (
                <EyeOff size={20} className="text-muted-foreground" />
              ) : (
                <Eye size={20} className="text-muted-foreground" />
              )}
            </Pressable>
          )}

          {/* Right Icon */}
          {!isPassword && rightIcon && (
            <View className="opacity-70">{rightIcon}</View>
          )}
        </View>

        {/* Error or Helper Text */}
        {error && (
          <Text className="text-sm text-[#EF5350]">{error}</Text>
        )}
        {!error && helperText && (
          <Text className="text-sm text-muted-foreground">{helperText}</Text>
        )}
        {!error && !helperText && success && (
          <Text className="text-sm text-[#4CAF50]">Looks good!</Text>
        )}
      </View>
    );
  }
);

Input.displayName = 'Input';

export { Input };
