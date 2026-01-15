# MediSync UI Components

Customized React Native Reusables components with MediSync branding.

## Components

### 1. Button

Fully-featured button with MediSync colors, loading states, and haptic feedback.

**Variants:**
- `default` - Primary blue (#72A8E8)
- `secondary` - Coral (#F8A978)
- `destructive` - Red (#EF5350)
- `success` - Green (#4CAF50)
- `outline` - Transparent with primary border
- `ghost` - Transparent background
- `link` - Text link style

**Sizes:**
- `sm` - Small (h-9)
- `md` - Medium (h-11) - Default
- `lg` - Large (h-14)
- `icon` - Square (h-11 w-11)

**Props:**
- `loading` - Shows loading spinner
- `hapticFeedback` - Haptic feedback on press (default: true)
- `disabled` - Disabled state with opacity

**Examples:**

```tsx
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';

// Default button
<Button>
  <Text>Click me</Text>
</Button>

// With variants
<Button variant="secondary" size="lg">
  <Text>Secondary Large</Text>
</Button>

// Loading state
<Button loading>
  <Text>Loading...</Text>
</Button>

// Outline with icon
<Button variant="outline" size="sm">
  <Icon as={Plus} />
  <Text>Add</Text>
</Button>

// Disabled
<Button disabled>
  <Text>Disabled</Text>
</Button>
```

### 2. Input

Full-featured text input with icons, labels, validation states, and password toggle.

**Props:**
- `label` - Optional label above input
- `error` - Error message (shows red border)
- `helperText` - Helper text below input
- `success` - Success state (green border)
- `leftIcon` - Icon on left side
- `rightIcon` - Icon on right side
- `type` - 'text' | 'password' | 'email' | 'number'

**Examples:**

```tsx
import { Input } from '@/components/ui/input';
import { Mail, Lock } from 'lucide-react-native';

// Basic input
<Input placeholder="Enter your name" />

// With label
<Input
  label="Email"
  placeholder="you@example.com"
  type="email"
/>

// With icon
<Input
  label="Email"
  placeholder="you@example.com"
  leftIcon={<Mail size={20} className="text-muted-foreground" />}
/>

// Password with toggle
<Input
  label="Password"
  type="password"
  placeholder="Enter password"
/>

// With error
<Input
  label="Email"
  error="Invalid email address"
  placeholder="you@example.com"
/>

// With success
<Input
  label="Email"
  success
  placeholder="you@example.com"
/>

// With helper text
<Input
  label="Email"
  helperText="We'll never share your email"
  placeholder="you@example.com"
/>
```

### 3. Card

Versatile card component with variants and optional pressable functionality.

**Variants:**
- `default` - White background with border
- `elevated` - White background with shadow
- `outlined` - Border only, transparent background

**Padding:**
- `none` - No padding
- `sm` - Small padding (p-3)
- `md` - Medium padding (p-4) - Default
- `lg` - Large padding (p-6)

**Props:**
- `pressable` - Makes card pressable with press animation
- `onPress` - Press handler (requires pressable=true)

**Subcomponents:**
- `CardHeader` - Header section
- `CardTitle` - Title text
- `CardDescription` - Description text
- `CardContent` - Main content
- `CardFooter` - Footer section

**Examples:**

```tsx
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Text } from '@/components/ui/text';

// Basic card
<Card>
  <Text>Card content</Text>
</Card>

// Elevated card with padding
<Card variant="elevated" padding="lg">
  <Text>Elevated card</Text>
</Card>

// Pressable card
<Card pressable onPress={() => console.log('Pressed')}>
  <Text>Tap me</Text>
</Card>

// Full card with subcomponents
<Card variant="elevated">
  <CardHeader>
    <CardTitle>
      <Text>Medication Reminder</Text>
    </CardTitle>
    <CardDescription>
      <Text>Take your daily vitamins</Text>
    </CardDescription>
  </CardHeader>
  <CardContent>
    <Text>1 tablet after breakfast</Text>
  </CardContent>
  <CardFooter>
    <Button>Mark as Taken</Button>
  </CardFooter>
</Card>
```

### 4. Badge

Status badges with semantic colors and dot indicators.

**Variants:**
- `default` - Gray background
- `success` - Green (#4CAF50)
- `warning` - Orange (#FFA726)
- `danger` - Red (#EF5350)
- `info` - Blue (#72A8E8)

**Sizes:**
- `sm` - Small
- `md` - Medium - Default
- `lg` - Large

**Props:**
- `dot` - Shows colored dot indicator
- `textClassName` - Custom text styles

**Examples:**

```tsx
import { Badge } from '@/components/ui/badge';

// Basic badges
<Badge>Default</Badge>
<Badge variant="success">Taken</Badge>
<Badge variant="warning">Pending</Badge>
<Badge variant="danger">Missed</Badge>
<Badge variant="info">Scheduled</Badge>

// With dot indicator
<Badge variant="success" dot>Active</Badge>

// Different sizes
<Badge size="sm">Small</Badge>
<Badge size="md">Medium</Badge>
<Badge size="lg">Large</Badge>

// Custom styles
<Badge variant="info" className="px-4">
  Custom Padding
</Badge>
```

### 5. Avatar

User avatars with status indicators, fallbacks, and grouping.

**Sizes:**
- `sm` - 32px (h-8 w-8)
- `md` - 40px (h-10 w-10) - Default
- `lg` - 56px (h-14 w-14)
- `xl` - 80px (h-20 w-20)

**Props:**
- `source` - Image source
- `alt` - Alt text for image
- `fallback` - Name for initials fallback
- `status` - 'online' | 'offline' | 'away' | 'busy'
- `showStatus` - Show status indicator
- `ring` - Show border ring

**Examples:**

```tsx
import { Avatar, AvatarGroup } from '@/components/ui/avatar';

// Avatar with image
<Avatar
  source={{ uri: 'https://example.com/avatar.jpg' }}
  alt="John Doe"
/>

// Avatar with initials fallback
<Avatar
  fallback="John Doe"
  size="lg"
/>

// With status indicator
<Avatar
  fallback="John Doe"
  status="online"
  showStatus
/>

// With ring
<Avatar
  source={{ uri: 'https://example.com/avatar.jpg' }}
  ring
/>

// Avatar Group
<AvatarGroup max={3} size="md">
  <Avatar fallback="John Doe" />
  <Avatar fallback="Jane Smith" />
  <Avatar fallback="Bob Wilson" />
  <Avatar fallback="Alice Brown" />
</AvatarGroup>
```

### 6. Loading Spinner

Loading indicators with optional text and full-screen mode.

**Sizes:**
- `sm` - Small
- `md` - Medium - Default
- `lg` - Large

**Props:**
- `color` - Spinner color (default: #72A8E8)
- `text` - Optional text below spinner
- `fullScreen` - Full screen centered spinner

**Examples:**

```tsx
import { LoadingSpinner, MiniSpinner } from '@/components/ui/loading-spinner';

// Basic spinner
<LoadingSpinner />

// With text
<LoadingSpinner text="Loading medications..." />

// Full screen
<LoadingSpinner fullScreen text="Please wait..." />

// Different sizes
<LoadingSpinner size="sm" />
<LoadingSpinner size="lg" />

// Custom color
<LoadingSpinner color="#4CAF50" text="Syncing..." />

// Mini spinner (for inline use)
<MiniSpinner size={16} color="#72A8E8" />
```

## Color Reference

### Primary Colors
- **Primary**: `#72A8E8` - MediSync Blue
- **Secondary**: `#F8A978` - Coral for alerts
- **Success**: `#4CAF50` - Green for success states
- **Warning**: `#FFA726` - Orange for warnings
- **Danger**: `#EF5350` - Red for errors/critical

### Semantic Usage
- **Medication Taken**: Success green
- **Medication Missed**: Danger red
- **Medication Upcoming**: Warning orange
- **Medication Scheduled**: Primary blue
- **Fall Detected**: Danger red
- **Family Online**: Success green
- **Family Offline**: Neutral gray

## Usage Patterns

### Form Example
```tsx
<View className="gap-4 p-6">
  <Input
    label="Full Name"
    placeholder="John Doe"
    leftIcon={<User size={20} className="text-muted-foreground" />}
  />

  <Input
    label="Email"
    type="email"
    placeholder="john@example.com"
    leftIcon={<Mail size={20} className="text-muted-foreground" />}
  />

  <Input
    label="Password"
    type="password"
    placeholder="Enter password"
  />

  <Button size="lg">
    <Text>Sign Up</Text>
  </Button>
</View>
```

### Medication Card Example
```tsx
<Card variant="elevated" pressable onPress={() => {}}>
  <View className="flex-row items-center justify-between">
    <View className="flex-1">
      <Text className="text-lg font-semibold">Aspirin 100mg</Text>
      <Text className="text-sm text-muted-foreground">
        1 tablet after meals
      </Text>
    </View>
    <Badge variant="success" dot>Taken</Badge>
  </View>
</Card>
```

### Family Member Card Example
```tsx
<Card>
  <View className="flex-row items-center gap-3">
    <Avatar
      fallback="Mary Johnson"
      status="online"
      showStatus
      size="lg"
    />
    <View className="flex-1">
      <Text className="font-semibold">Mary Johnson</Text>
      <Text className="text-sm text-muted-foreground">Mother</Text>
    </View>
    <Badge variant="success" dot>Online</Badge>
  </View>
</Card>
```

### Loading States
```tsx
// Button loading
<Button loading>
  <Text>Saving...</Text>
</Button>

// Screen loading
<LoadingSpinner fullScreen text="Loading medications..." />

// Inline loading
<View className="flex-row items-center gap-2">
  <MiniSpinner />
  <Text>Syncing...</Text>
</View>
```

## Best Practices

1. **Consistency** - Use the same variant for similar actions across the app
2. **Accessibility** - Always provide meaningful text/labels
3. **Feedback** - Use loading states for async actions
4. **Haptics** - Keep haptic feedback enabled for better UX
5. **Colors** - Use semantic colors (success/warning/danger) appropriately
6. **Spacing** - Use consistent padding/gaps from theme
7. **Dark Mode** - All components support dark mode automatically

## Future Enhancements

- [ ] Add tooltip component
- [ ] Add modal/dialog component
- [ ] Add dropdown/select component
- [ ] Add tabs component
- [ ] Add progress bar component
- [ ] Add skeleton loader component
- [ ] Add toast notification component
