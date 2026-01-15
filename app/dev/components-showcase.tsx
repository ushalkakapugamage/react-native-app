/**
 * MediSync Components Showcase
 * Development screen for testing all UI components
 */

import { Avatar, AvatarGroup } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { LoadingSpinner, MiniSpinner } from '@/components/ui/loading-spinner';
import { Text } from '@/components/ui/text';
import { useState } from 'react';
import {
  Heart,
  Mail,
  Lock,
  User,
  Search,
  AlertCircle,
  CheckCircle,
  Plus,
} from 'lucide-react-native';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ComponentsShowcase() {
  const [loadingButton, setLoadingButton] = useState(false);

  const handleLoadingTest = () => {
    setLoadingButton(true);
    setTimeout(() => setLoadingButton(false), 2000);
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-6 py-4"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="mb-6">
          <Text className="text-3xl font-bold text-foreground">
            MediSync UI Components
          </Text>
          <Text className="mt-1 text-sm text-muted-foreground">
            Component showcase for development testing
          </Text>
        </View>

        {/* Buttons Section */}
        <View className="mb-8">
          <Text className="mb-4 text-xl font-semibold text-foreground">
            Buttons
          </Text>

          {/* Button Variants */}
          <View className="mb-4">
            <Text className="mb-2 text-sm font-medium text-muted-foreground">
              Variants
            </Text>
            <View className="gap-3">
              <Button variant="default">
                <Text>Default (Primary)</Text>
              </Button>
              <Button variant="secondary">
                <Text>Secondary (Coral)</Text>
              </Button>
              <Button variant="success">
                <Text>Success (Green)</Text>
              </Button>
              <Button variant="destructive">
                <Text>Destructive (Red)</Text>
              </Button>
              <Button variant="outline">
                <Text>Outline</Text>
              </Button>
              <Button variant="ghost">
                <Text>Ghost</Text>
              </Button>
              <Button variant="link">
                <Text>Link</Text>
              </Button>
            </View>
          </View>

          {/* Button Sizes */}
          <View className="mb-4">
            <Text className="mb-2 text-sm font-medium text-muted-foreground">
              Sizes
            </Text>
            <View className="gap-3">
              <Button size="sm">
                <Text>Small Button</Text>
              </Button>
              <Button size="md">
                <Text>Medium Button (Default)</Text>
              </Button>
              <Button size="lg">
                <Text>Large Button</Text>
              </Button>
              <View className="flex-row gap-2">
                <Button size="icon">
                  <Heart className="text-white" size={20} />
                </Button>
                <Button size="icon" variant="outline">
                  <Plus className="text-primary" size={20} />
                </Button>
              </View>
            </View>
          </View>

          {/* Button States */}
          <View className="mb-4">
            <Text className="mb-2 text-sm font-medium text-muted-foreground">
              States
            </Text>
            <View className="gap-3">
              <Button loading={loadingButton} onPress={handleLoadingTest}>
                <Text>Loading State (Click me)</Text>
              </Button>
              <Button disabled>
                <Text>Disabled Button</Text>
              </Button>
            </View>
          </View>

          {/* Button with Icons */}
          <View>
            <Text className="mb-2 text-sm font-medium text-muted-foreground">
              With Icons
            </Text>
            <View className="gap-3">
              <Button>
                <Plus className="text-white" size={18} />
                <Text>Add Medication</Text>
              </Button>
              <Button variant="outline">
                <CheckCircle className="text-primary" size={18} />
                <Text>Mark as Taken</Text>
              </Button>
            </View>
          </View>
        </View>

        {/* Inputs Section */}
        <View className="mb-8">
          <Text className="mb-4 text-xl font-semibold text-foreground">
            Inputs
          </Text>

          <View className="gap-4">
            {/* Basic Input */}
            <Input placeholder="Basic input" />

            {/* With Label */}
            <Input label="Email Address" placeholder="you@example.com" />

            {/* With Icon */}
            <Input
              label="Search"
              placeholder="Search medications..."
              leftIcon={<Search size={20} className="text-muted-foreground" />}
            />

            {/* Email Type */}
            <Input
              label="Email"
              type="email"
              placeholder="john@example.com"
              leftIcon={<Mail size={20} className="text-muted-foreground" />}
            />

            {/* Password Type */}
            <Input
              label="Password"
              type="password"
              placeholder="Enter your password"
              leftIcon={<Lock size={20} className="text-muted-foreground" />}
            />

            {/* With Error */}
            <Input
              label="Email"
              error="Invalid email address"
              placeholder="you@example.com"
              leftIcon={<Mail size={20} className="text-muted-foreground" />}
            />

            {/* With Success */}
            <Input
              label="Username"
              success
              placeholder="johndoe"
              leftIcon={<User size={20} className="text-muted-foreground" />}
            />

            {/* With Helper Text */}
            <Input
              label="Phone Number"
              helperText="We'll send you a verification code"
              placeholder="+1 (555) 123-4567"
            />
          </View>
        </View>

        {/* Cards Section */}
        <View className="mb-8">
          <Text className="mb-4 text-xl font-semibold text-foreground">
            Cards
          </Text>

          <View className="gap-4">
            {/* Default Card */}
            <Card variant="default">
              <Text className="font-medium">Default Card</Text>
              <Text className="text-sm text-muted-foreground">
                White background with border
              </Text>
            </Card>

            {/* Elevated Card */}
            <Card variant="elevated">
              <Text className="font-medium">Elevated Card</Text>
              <Text className="text-sm text-muted-foreground">
                White background with shadow
              </Text>
            </Card>

            {/* Outlined Card */}
            <Card variant="outlined">
              <Text className="font-medium">Outlined Card</Text>
              <Text className="text-sm text-muted-foreground">
                Transparent with border
              </Text>
            </Card>

            {/* Pressable Card */}
            <Card
              variant="elevated"
              pressable
              onPress={() => console.log('Card pressed')}
            >
              <Text className="font-medium">Pressable Card</Text>
              <Text className="text-sm text-muted-foreground">
                Tap me! (with press animation)
              </Text>
            </Card>

            {/* Full Card with Subcomponents */}
            <Card variant="elevated">
              <CardHeader>
                <CardTitle>
                  <Text>Medication Reminder</Text>
                </CardTitle>
                <CardDescription>
                  <Text>Daily vitamin supplement</Text>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <View className="flex-row items-center justify-between">
                  <View>
                    <Text className="font-medium">Vitamin D 1000 IU</Text>
                    <Text className="text-sm text-muted-foreground">
                      1 capsule with lunch
                    </Text>
                  </View>
                  <Badge variant="success" dot>
                    Taken
                  </Badge>
                </View>
              </CardContent>
              <CardFooter>
                <Button size="sm" variant="outline" className="flex-1">
                  <Text>Details</Text>
                </Button>
              </CardFooter>
            </Card>
          </View>
        </View>

        {/* Badges Section */}
        <View className="mb-8">
          <Text className="mb-4 text-xl font-semibold text-foreground">
            Badges
          </Text>

          {/* Badge Variants */}
          <View className="mb-4">
            <Text className="mb-2 text-sm font-medium text-muted-foreground">
              Variants
            </Text>
            <View className="flex-row flex-wrap gap-2">
              <Badge variant="default">Default</Badge>
              <Badge variant="success">Success</Badge>
              <Badge variant="warning">Warning</Badge>
              <Badge variant="danger">Danger</Badge>
              <Badge variant="info">Info</Badge>
            </View>
          </View>

          {/* Badge Sizes */}
          <View className="mb-4">
            <Text className="mb-2 text-sm font-medium text-muted-foreground">
              Sizes
            </Text>
            <View className="flex-row flex-wrap items-center gap-2">
              <Badge size="sm" variant="info">
                Small
              </Badge>
              <Badge size="md" variant="info">
                Medium
              </Badge>
              <Badge size="lg" variant="info">
                Large
              </Badge>
            </View>
          </View>

          {/* Badge with Dots */}
          <View className="mb-4">
            <Text className="mb-2 text-sm font-medium text-muted-foreground">
              With Dot Indicators
            </Text>
            <View className="flex-row flex-wrap gap-2">
              <Badge variant="success" dot>
                Active
              </Badge>
              <Badge variant="warning" dot>
                Pending
              </Badge>
              <Badge variant="danger" dot>
                Critical
              </Badge>
              <Badge variant="info" dot>
                Online
              </Badge>
            </View>
          </View>

          {/* Medication Status Examples */}
          <View>
            <Text className="mb-2 text-sm font-medium text-muted-foreground">
              Medication Status Examples
            </Text>
            <View className="flex-row flex-wrap gap-2">
              <Badge variant="success" dot>
                Taken
              </Badge>
              <Badge variant="danger" dot>
                Missed
              </Badge>
              <Badge variant="warning" dot>
                Upcoming
              </Badge>
              <Badge variant="info" dot>
                Scheduled
              </Badge>
            </View>
          </View>
        </View>

        {/* Avatars Section */}
        <View className="mb-8">
          <Text className="mb-4 text-xl font-semibold text-foreground">
            Avatars
          </Text>

          {/* Avatar Sizes */}
          <View className="mb-4">
            <Text className="mb-2 text-sm font-medium text-muted-foreground">
              Sizes
            </Text>
            <View className="flex-row items-end gap-3">
              <View className="items-center gap-1">
                <Avatar size="sm" fallback="John Doe" />
                <Text className="text-xs text-muted-foreground">Small</Text>
              </View>
              <View className="items-center gap-1">
                <Avatar size="md" fallback="Jane Smith" />
                <Text className="text-xs text-muted-foreground">Medium</Text>
              </View>
              <View className="items-center gap-1">
                <Avatar size="lg" fallback="Bob Wilson" />
                <Text className="text-xs text-muted-foreground">Large</Text>
              </View>
              <View className="items-center gap-1">
                <Avatar size="xl" fallback="Alice Brown" />
                <Text className="text-xs text-muted-foreground">X-Large</Text>
              </View>
            </View>
          </View>

          {/* Avatar with Status */}
          <View className="mb-4">
            <Text className="mb-2 text-sm font-medium text-muted-foreground">
              With Status Indicators
            </Text>
            <View className="flex-row gap-3">
              <View className="items-center gap-1">
                <Avatar
                  size="lg"
                  fallback="John Doe"
                  status="online"
                  showStatus
                />
                <Text className="text-xs text-muted-foreground">Online</Text>
              </View>
              <View className="items-center gap-1">
                <Avatar
                  size="lg"
                  fallback="Jane Smith"
                  status="away"
                  showStatus
                />
                <Text className="text-xs text-muted-foreground">Away</Text>
              </View>
              <View className="items-center gap-1">
                <Avatar
                  size="lg"
                  fallback="Bob Wilson"
                  status="busy"
                  showStatus
                />
                <Text className="text-xs text-muted-foreground">Busy</Text>
              </View>
              <View className="items-center gap-1">
                <Avatar
                  size="lg"
                  fallback="Alice Brown"
                  status="offline"
                  showStatus
                />
                <Text className="text-xs text-muted-foreground">Offline</Text>
              </View>
            </View>
          </View>

          {/* Avatar with Ring */}
          <View className="mb-4">
            <Text className="mb-2 text-sm font-medium text-muted-foreground">
              With Ring Border
            </Text>
            <View className="flex-row gap-3">
              <Avatar size="lg" fallback="Mary Johnson" ring />
              <Avatar size="lg" fallback="Robert Johnson" ring />
            </View>
          </View>

          {/* Avatar Group */}
          <View>
            <Text className="mb-2 text-sm font-medium text-muted-foreground">
              Avatar Group
            </Text>
            <AvatarGroup max={4} size="md">
              <Avatar fallback="John Doe" />
              <Avatar fallback="Jane Smith" />
              <Avatar fallback="Bob Wilson" />
              <Avatar fallback="Alice Brown" />
              <Avatar fallback="Charlie Davis" />
              <Avatar fallback="Diana Evans" />
            </AvatarGroup>
          </View>
        </View>

        {/* Loading Spinners Section */}
        <View className="mb-8">
          <Text className="mb-4 text-xl font-semibold text-foreground">
            Loading Spinners
          </Text>

          {/* Spinner Sizes */}
          <View className="mb-4">
            <Text className="mb-2 text-sm font-medium text-muted-foreground">
              Sizes
            </Text>
            <View className="gap-4">
              <Card variant="elevated" padding="sm">
                <LoadingSpinner size="sm" />
              </Card>
              <Card variant="elevated" padding="sm">
                <LoadingSpinner size="md" />
              </Card>
              <Card variant="elevated" padding="sm">
                <LoadingSpinner size="lg" />
              </Card>
            </View>
          </View>

          {/* With Text */}
          <View className="mb-4">
            <Text className="mb-2 text-sm font-medium text-muted-foreground">
              With Text
            </Text>
            <Card variant="elevated" padding="sm">
              <LoadingSpinner text="Loading medications..." />
            </Card>
          </View>

          {/* Custom Colors */}
          <View className="mb-4">
            <Text className="mb-2 text-sm font-medium text-muted-foreground">
              Custom Colors
            </Text>
            <View className="gap-4">
              <Card variant="elevated" padding="sm">
                <LoadingSpinner color="#4CAF50" text="Syncing..." />
              </Card>
              <Card variant="elevated" padding="sm">
                <LoadingSpinner color="#EF5350" text="Error loading..." />
              </Card>
            </View>
          </View>

          {/* Mini Spinner */}
          <View>
            <Text className="mb-2 text-sm font-medium text-muted-foreground">
              Mini Spinner (Inline)
            </Text>
            <Card variant="elevated">
              <View className="flex-row items-center gap-2">
                <MiniSpinner />
                <Text className="text-sm text-muted-foreground">
                  Syncing data...
                </Text>
              </View>
            </Card>
          </View>
        </View>

        {/* Combined Example */}
        <View className="mb-8">
          <Text className="mb-4 text-xl font-semibold text-foreground">
            Combined Example
          </Text>

          <Card variant="elevated">
            <View className="flex-row items-start justify-between">
              <View className="flex-row gap-3">
                <Avatar
                  size="lg"
                  fallback="Mary Johnson"
                  status="online"
                  showStatus
                  ring
                />
                <View className="flex-1">
                  <Text className="text-lg font-semibold">Mary Johnson</Text>
                  <Text className="text-sm text-muted-foreground">Mother</Text>
                  <View className="mt-2 flex-row gap-2">
                    <Badge variant="success" dot size="sm">
                      4/5 Medications
                    </Badge>
                    <Badge variant="info" size="sm">
                      92% Health
                    </Badge>
                  </View>
                </View>
              </View>
            </View>

            <View className="mt-4 h-px bg-border" />

            <View className="mt-4 flex-row gap-2">
              <Button size="sm" variant="outline" className="flex-1">
                <Text>Message</Text>
              </Button>
              <Button size="sm" className="flex-1">
                <Text>View Details</Text>
              </Button>
            </View>
          </Card>
        </View>

        {/* Footer */}
        <View className="mb-6 rounded-lg bg-muted/30 p-4">
          <Text className="text-center text-sm text-muted-foreground">
            All components support light/dark themes automatically
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
