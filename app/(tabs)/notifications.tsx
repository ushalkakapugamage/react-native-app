/**
 * MediSync Notifications Screen
 * View all notifications and alerts
 * TODO: Implement notification list, filters, and mark as read
 */

import { Bell, Pill, Users, AlertCircle, CheckCircle, Filter } from 'lucide-react-native';
import { ScrollView, Text, View, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function NotificationsScreen() {
  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      {/* Header */}
      <View className="border-b border-border bg-background px-6 py-4">
        <View className="flex-row items-center justify-between">
          <Text className="text-2xl font-bold text-foreground">Notifications</Text>
          <Pressable>
            <Filter className="h-5 w-5 text-muted-foreground" />
          </Pressable>
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Today Section */}
        <View className="px-6 py-4">
          <Text className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Today
          </Text>

          <View className="gap-3">
            {/* Notification 1 - Medication Reminder */}
            <Pressable className="rounded-xl border border-border bg-card p-4 active:opacity-70">
              <View className="flex-row items-start gap-3">
                <View className="h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <Bell className="h-5 w-5 text-primary" />
                </View>
                <View className="flex-1">
                  <View className="flex-row items-center justify-between">
                    <Text className="text-sm font-semibold text-foreground">
                      Medication Reminder
                    </Text>
                    <View className="h-2 w-2 rounded-full bg-primary" />
                  </View>
                  <Text className="mt-1 text-sm text-muted-foreground">
                    Time to take Aspirin 100mg
                  </Text>
                  <Text className="mt-2 text-xs text-muted-foreground">2 min ago</Text>
                </View>
              </View>
            </Pressable>

            {/* Notification 2 - Medication Taken */}
            <Pressable className="rounded-xl border border-border bg-card p-4 active:opacity-70">
              <View className="flex-row items-start gap-3">
                <View className="h-10 w-10 items-center justify-center rounded-full bg-success/10">
                  <CheckCircle className="h-5 w-5 text-success" />
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-semibold text-foreground">
                    Medication Taken
                  </Text>
                  <Text className="mt-1 text-sm text-muted-foreground">
                    You took Vitamin D 1000 IU
                  </Text>
                  <Text className="mt-2 text-xs text-muted-foreground">1 hour ago</Text>
                </View>
              </View>
            </Pressable>

            {/* Notification 3 - Family Alert */}
            <Pressable className="rounded-xl border border-border bg-card p-4 active:opacity-70">
              <View className="flex-row items-start gap-3">
                <View className="h-10 w-10 items-center justify-center rounded-full bg-warning/10">
                  <AlertCircle className="h-5 w-5 text-warning" />
                </View>
                <View className="flex-1">
                  <View className="flex-row items-center justify-between">
                    <Text className="text-sm font-semibold text-foreground">
                      Family Alert
                    </Text>
                    <View className="h-2 w-2 rounded-full bg-warning" />
                  </View>
                  <Text className="mt-1 text-sm text-muted-foreground">
                    Mom missed her medication
                  </Text>
                  <Text className="mt-2 text-xs text-muted-foreground">3 hours ago</Text>
                </View>
              </View>
            </Pressable>
          </View>
        </View>

        {/* Yesterday Section */}
        <View className="px-6 py-4">
          <Text className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Yesterday
          </Text>

          <View className="gap-3">
            {/* Notification 4 */}
            <Pressable className="rounded-xl border border-border bg-card p-4 active:opacity-70">
              <View className="flex-row items-start gap-3">
                <View className="h-10 w-10 items-center justify-center rounded-full bg-success/10">
                  <Pill className="h-5 w-5 text-success" />
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-semibold text-foreground">
                    All Medications Taken
                  </Text>
                  <Text className="mt-1 text-sm text-muted-foreground">
                    You completed all 5 medications yesterday
                  </Text>
                  <Text className="mt-2 text-xs text-muted-foreground">Yesterday</Text>
                </View>
              </View>
            </Pressable>

            {/* Notification 5 */}
            <Pressable className="rounded-xl border border-border bg-card p-4 active:opacity-70">
              <View className="flex-row items-start gap-3">
                <View className="h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <Users className="h-5 w-5 text-primary" />
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-semibold text-foreground">
                    New Family Member
                  </Text>
                  <Text className="mt-1 text-sm text-muted-foreground">
                    Robert Johnson joined your family
                  </Text>
                  <Text className="mt-2 text-xs text-muted-foreground">Yesterday</Text>
                </View>
              </View>
            </Pressable>

            {/* Notification 6 */}
            <Pressable className="rounded-xl border border-border bg-card p-4 active:opacity-70">
              <View className="flex-row items-start gap-3">
                <View className="h-10 w-10 items-center justify-center rounded-full bg-danger/10">
                  <AlertCircle className="h-5 w-5 text-danger" />
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-semibold text-foreground">
                    Missed Medication
                  </Text>
                  <Text className="mt-1 text-sm text-muted-foreground">
                    You missed Metformin 500mg
                  </Text>
                  <Text className="mt-2 text-xs text-muted-foreground">Yesterday</Text>
                </View>
              </View>
            </Pressable>
          </View>
        </View>

        {/* Empty state for when no notifications */}
        {/* <View className="flex-1 items-center justify-center py-20">
          <View className="h-24 w-24 items-center justify-center rounded-full bg-muted">
            <Bell className="h-12 w-12 text-muted-foreground" />
          </View>
          <Text className="mt-4 text-center text-lg font-semibold text-foreground">
            No Notifications
          </Text>
          <Text className="mt-2 text-center text-sm text-muted-foreground">
            You're all caught up!
          </Text>
        </View> */}
      </ScrollView>
    </SafeAreaView>
  );
}
