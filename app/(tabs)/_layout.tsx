/**
 * MediSync Tabs Layout
 * Bottom tab navigator with custom styling
 * Tabs: Dashboard, Medications, Family, Notifications, Profile
 */

import { useTheme } from '@/lib/providers';
import { Tabs } from 'expo-router';
import { Home, Pill, Users, Bell, User } from 'lucide-react-native';
import { Platform } from 'react-native';

export default function TabsLayout() {
  const { colorScheme } = useTheme();
  const isDark = colorScheme === 'dark';

  // Theme colors
  const colors = {
    primary: '#72A8E8',
    background: isDark ? '#0A0A0A' : '#FFFFFF',
    cardBackground: isDark ? '#171717' : '#F5F5F5',
    text: isDark ? '#FAFAFA' : '#171717',
    textSecondary: isDark ? '#A3A3A3' : '#525252',
    border: isDark ? '#262626' : '#E5E5E5',
  };

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: Platform.OS === 'ios' ? 88 : 65,
          paddingBottom: Platform.OS === 'ios' ? 28 : 12,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
          marginTop: 4,
        },
        tabBarIconStyle: {
          marginTop: 4,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="medications"
        options={{
          title: 'Medications',
          tabBarIcon: ({ color, size }) => <Pill size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="family"
        options={{
          title: 'Family',
          tabBarIcon: ({ color, size }) => <Users size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          title: 'Notifications',
          tabBarIcon: ({ color, size }) => <Bell size={size} color={color} />,
          tabBarBadge: undefined, // TODO: Add badge count for unread notifications
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
