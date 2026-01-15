/**
 * Password Strength Indicator Component
 *
 * Displays:
 * - Visual strength bar (red/yellow/green)
 * - Requirements checklist with checkmarks
 * - Real-time feedback as user types
 */

import { Text } from '@/components/ui/text';
import { Check } from 'lucide-react-native';
import { View } from 'react-native';

interface PasswordRequirement {
  label: string;
  met: boolean;
}

interface PasswordStrengthProps {
  password: string;
  showRequirements?: boolean;
}

/**
 * Calculate password strength and requirements
 */
export function calculatePasswordStrength(password: string) {
  const requirements = {
    minLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  };

  const requirementsMet = Object.values(requirements).filter(Boolean).length;

  // Strength calculation
  let strength: 'weak' | 'medium' | 'strong' = 'weak';
  if (requirementsMet >= 4) {
    strength = 'strong';
  } else if (requirementsMet >= 2) {
    strength = 'medium';
  }

  return {
    strength,
    requirementsMet,
    requirements,
  };
}

/**
 * Password Strength Indicator Component
 */
export function PasswordStrength({ password, showRequirements = true }: PasswordStrengthProps) {
  const { strength, requirements } = calculatePasswordStrength(password);

  // Don't show anything if password is empty
  if (!password) {
    return null;
  }

  // Strength bar colors and widths
  const strengthConfig = {
    weak: {
      color: 'bg-danger',
      width: 'w-1/4',
      label: 'Weak',
      textColor: 'text-danger',
    },
    medium: {
      color: 'bg-warning',
      width: 'w-1/2',
      label: 'Medium',
      textColor: 'text-warning',
    },
    strong: {
      color: 'bg-success',
      width: 'w-full',
      label: 'Strong',
      textColor: 'text-success',
    },
  };

  const config = strengthConfig[strength];

  return (
    <View className="gap-2">
      {/* Strength Bar */}
      <View className="gap-1">
        <View className="flex-row items-center justify-between">
          <Text className="text-xs text-muted-foreground">Password Strength</Text>
          <Text className={`text-xs font-semibold ${config.textColor}`}>{config.label}</Text>
        </View>
        <View className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <View className={`h-full ${config.color} ${config.width} rounded-full`} />
        </View>
      </View>

      {/* Requirements Checklist */}
      {showRequirements && (
        <View className="gap-1">
          <RequirementItem
            label="At least 8 characters"
            met={requirements.minLength}
          />
          <RequirementItem
            label="One uppercase letter"
            met={requirements.hasUppercase}
          />
          <RequirementItem
            label="One number"
            met={requirements.hasNumber}
          />
          <RequirementItem
            label="One special character"
            met={requirements.hasSpecialChar}
          />
        </View>
      )}
    </View>
  );
}

/**
 * Single requirement item with checkmark
 */
function RequirementItem({ label, met }: { label: string; met: boolean }) {
  return (
    <View className="flex-row items-center gap-2">
      <View
        className={`h-4 w-4 items-center justify-center rounded-full ${
          met ? 'bg-success' : 'bg-muted'
        }`}
      >
        {met && <Check size={10} className="text-white" strokeWidth={3} />}
      </View>
      <Text className={`text-xs ${met ? 'text-success' : 'text-muted-foreground'}`}>
        {label}
      </Text>
    </View>
  );
}
