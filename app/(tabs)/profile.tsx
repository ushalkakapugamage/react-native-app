/**
 * MediSync Profile Screen
 * User profile, settings, and account management
 * TODO: Implement profile editing, settings, and logout functionality
 */

import { ThemeModeSelector } from '@/components/theme-toggle';
import { useRouter } from 'expo-router';
import {
  User,
  Settings,
  Bell,
  Shield,
  Heart,
  HelpCircle,
  LogOut,
  ChevronRight,
  Moon,
  Palette,
} from 'lucide-react-native';
import { ScrollView, Text, View, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ProfileScreen() {
  const router = useRouter();

  const handleLogout = () => {
    // TODO: Implement logout logic
    console.log('Logout');
  };

  const handleShowComponentsShowcase = () => {
    router.push('/dev/components-showcase');
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="border-b border-border bg-background px-6 py-4">
          <Text className="text-2xl font-bold text-foreground">Profile</Text>
        </View>

        {/* Profile Info */}
        <View className="items-center px-6 py-8">
          <View className="h-24 w-24 items-center justify-center rounded-full bg-primary">
            <Text className="text-3xl font-bold text-primary-foreground">JD</Text>
          </View>
          <Text className="mt-4 text-xl font-bold text-foreground">John Doe</Text>
          <Text className="mt-1 text-sm text-muted-foreground">
            john.doe@example.com
          </Text>

          <Pressable className="mt-4 rounded-lg border border-border px-6 py-2">
            <Text className="text-sm font-medium text-foreground">Edit Profile</Text>
          </Pressable>
        </View>

        {/* Health Stats */}
        <View className="mx-6 mb-6 flex-row gap-3">
          <View className="flex-1 rounded-xl bg-card p-4">
            <Text className="text-sm text-muted-foreground">Medications</Text>
            <Text className="mt-1 text-2xl font-bold text-foreground">5</Text>
          </View>
          <View className="flex-1 rounded-xl bg-card p-4">
            <Text className="text-sm text-muted-foreground">Adherence</Text>
            <Text className="mt-1 text-2xl font-bold text-foreground">92%</Text>
          </View>
          <View className="flex-1 rounded-xl bg-card p-4">
            <Text className="text-sm text-muted-foreground">Streak</Text>
            <Text className="mt-1 text-2xl font-bold text-foreground">12d</Text>
          </View>
        </View>

        {/* Settings Sections */}
        <View className="px-6">
          {/* Account Section */}
          <View className="mb-6">
            <Text className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Account
            </Text>
            <View className="gap-1 rounded-xl border border-border bg-card">
              <Pressable className="flex-row items-center justify-between px-4 py-4 active:opacity-70">
                <View className="flex-row items-center gap-3">
                  <User className="h-5 w-5 text-muted-foreground" />
                  <Text className="text-base text-foreground">Personal Information</Text>
                </View>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </Pressable>

              <View className="mx-4 h-px bg-border" />

              <Pressable className="flex-row items-center justify-between px-4 py-4 active:opacity-70">
                <View className="flex-row items-center gap-3">
                  <Heart className="h-5 w-5 text-muted-foreground" />
                  <Text className="text-base text-foreground">Health Profile</Text>
                </View>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </Pressable>

              <View className="mx-4 h-px bg-border" />

              <Pressable className="flex-row items-center justify-between px-4 py-4 active:opacity-70">
                <View className="flex-row items-center gap-3">
                  <Shield className="h-5 w-5 text-muted-foreground" />
                  <Text className="text-base text-foreground">Privacy & Security</Text>
                </View>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </Pressable>
            </View>
          </View>

          {/* Preferences Section */}
          <View className="mb-6">
            <Text className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Preferences
            </Text>
            <View className="gap-1 rounded-xl border border-border bg-card">
              <Pressable className="flex-row items-center justify-between px-4 py-4 active:opacity-70">
                <View className="flex-row items-center gap-3">
                  <Bell className="h-5 w-5 text-muted-foreground" />
                  <Text className="text-base text-foreground">Notifications</Text>
                </View>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </Pressable>

              <View className="mx-4 h-px bg-border" />

              <View className="px-4 py-4">
                <View className="mb-3 flex-row items-center gap-3">
                  <Moon className="h-5 w-5 text-muted-foreground" />
                  <Text className="text-base text-foreground">Theme</Text>
                </View>
                <ThemeModeSelector />
              </View>

              <View className="mx-4 h-px bg-border" />

              <Pressable className="flex-row items-center justify-between px-4 py-4 active:opacity-70">
                <View className="flex-row items-center gap-3">
                  <Settings className="h-5 w-5 text-muted-foreground" />
                  <Text className="text-base text-foreground">General Settings</Text>
                </View>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </Pressable>
            </View>
          </View>

          {/* Support Section */}
          <View className="mb-6">
            <Text className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Support
            </Text>
            <View className="gap-1 rounded-xl border border-border bg-card">
              <Pressable className="flex-row items-center justify-between px-4 py-4 active:opacity-70">
                <View className="flex-row items-center gap-3">
                  <HelpCircle className="h-5 w-5 text-muted-foreground" />
                  <Text className="text-base text-foreground">Help & Support</Text>
                </View>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </Pressable>

              <View className="mx-4 h-px bg-border" />

              <Pressable
                onPress={handleShowComponentsShowcase}
                className="flex-row items-center justify-between px-4 py-4 active:opacity-70"
              >
                <View className="flex-row items-center gap-3">
                  <Palette className="h-5 w-5 text-muted-foreground" />
                  <View>
                    <Text className="text-base text-foreground">Components Showcase</Text>
                    <Text className="text-xs text-muted-foreground">Development Testing</Text>
                  </View>
                </View>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </Pressable>
            </View>
          </View>

          {/* Logout Button */}
          <Pressable
            onPress={handleLogout}
            className="mb-8 flex-row items-center justify-center gap-2 rounded-xl border border-danger/20 bg-danger/5 px-4 py-4 active:opacity-70"
          >
            <LogOut className="h-5 w-5 text-danger" />
            <Text className="text-base font-semibold text-danger">Logout</Text>
          </Pressable>

          {/* App Version */}
          <View className="items-center pb-8">
            <Text className="text-xs text-muted-foreground">MediSync v1.0.0</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
