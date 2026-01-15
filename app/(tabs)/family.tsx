/**
 * MediSync Family Screen
 * View and manage family members for monitoring
 * TODO: Implement family member list, sharing, and health monitoring
 */

import { Plus, UserPlus, Activity, Heart } from 'lucide-react-native';
import { ScrollView, Text, View, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function FamilyScreen() {
  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      {/* Header */}
      <View className="border-b border-border bg-background px-6 py-4">
        <View className="flex-row items-center justify-between">
          <Text className="text-2xl font-bold text-foreground">Family</Text>
          <Pressable className="h-10 w-10 items-center justify-center rounded-full bg-primary active:opacity-80">
            <Plus className="h-5 w-5 text-primary-foreground" />
          </Pressable>
        </View>
        <Text className="mt-1 text-sm text-muted-foreground">
          Monitor your loved ones' health
        </Text>
      </View>

      <ScrollView className="flex-1 px-6 py-4" showsVerticalScrollIndicator={false}>
        {/* Family Members */}
        <View>
          <Text className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Family Members
          </Text>

          <View className="gap-3">
            {/* Family Member Card 1 */}
            <View className="rounded-xl border border-border bg-card p-4">
              <View className="flex-row items-start justify-between">
                <View className="flex-row gap-3">
                  <View className="h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                    <Text className="text-xl font-bold text-primary">MJ</Text>
                  </View>
                  <View className="flex-1">
                    <Text className="text-lg font-semibold text-foreground">
                      Mary Johnson
                    </Text>
                    <Text className="mt-0.5 text-sm text-muted-foreground">Mother</Text>
                    <View className="mt-2 flex-row items-center gap-1">
                      <View className="h-2 w-2 rounded-full bg-success" />
                      <Text className="text-xs text-muted-foreground">Online</Text>
                    </View>
                  </View>
                </View>
              </View>

              <View className="mb-3 mt-3 h-px bg-border" />

              {/* Health Stats */}
              <View className="flex-row gap-3">
                <View className="flex-1 rounded-lg bg-success/5 p-3">
                  <View className="flex-row items-center gap-2">
                    <Activity className="h-4 w-4 text-success" />
                    <Text className="text-xs text-muted-foreground">Medications</Text>
                  </View>
                  <Text className="mt-1 text-lg font-semibold text-foreground">
                    4/5
                  </Text>
                </View>
                <View className="flex-1 rounded-lg bg-primary/5 p-3">
                  <View className="flex-row items-center gap-2">
                    <Heart className="h-4 w-4 text-primary" />
                    <Text className="text-xs text-muted-foreground">Health</Text>
                  </View>
                  <Text className="mt-1 text-lg font-semibold text-foreground">
                    92%
                  </Text>
                </View>
              </View>

              <Pressable className="mt-3 rounded-lg border border-border py-2">
                <Text className="text-center text-sm font-medium text-foreground">
                  View Details
                </Text>
              </Pressable>
            </View>

            {/* Family Member Card 2 */}
            <View className="rounded-xl border border-border bg-card p-4">
              <View className="flex-row items-start justify-between">
                <View className="flex-row gap-3">
                  <View className="h-14 w-14 items-center justify-center rounded-full bg-secondary/10">
                    <Text className="text-xl font-bold text-secondary">RJ</Text>
                  </View>
                  <View className="flex-1">
                    <Text className="text-lg font-semibold text-foreground">
                      Robert Johnson
                    </Text>
                    <Text className="mt-0.5 text-sm text-muted-foreground">Father</Text>
                    <View className="mt-2 flex-row items-center gap-1">
                      <View className="h-2 w-2 rounded-full bg-muted-foreground" />
                      <Text className="text-xs text-muted-foreground">
                        Last seen 2h ago
                      </Text>
                    </View>
                  </View>
                </View>
              </View>

              <View className="mb-3 mt-3 h-px bg-border" />

              {/* Health Stats */}
              <View className="flex-row gap-3">
                <View className="flex-1 rounded-lg bg-warning/5 p-3">
                  <View className="flex-row items-center gap-2">
                    <Activity className="h-4 w-4 text-warning" />
                    <Text className="text-xs text-muted-foreground">Medications</Text>
                  </View>
                  <Text className="mt-1 text-lg font-semibold text-foreground">
                    2/3
                  </Text>
                </View>
                <View className="flex-1 rounded-lg bg-primary/5 p-3">
                  <View className="flex-row items-center gap-2">
                    <Heart className="h-4 w-4 text-primary" />
                    <Text className="text-xs text-muted-foreground">Health</Text>
                  </View>
                  <Text className="mt-1 text-lg font-semibold text-foreground">
                    88%
                  </Text>
                </View>
              </View>

              <Pressable className="mt-3 rounded-lg border border-border py-2">
                <Text className="text-center text-sm font-medium text-foreground">
                  View Details
                </Text>
              </Pressable>
            </View>
          </View>
        </View>

        {/* Add Family Member Card */}
        <Pressable className="mt-4 rounded-xl border border-dashed border-border bg-muted/30 p-6 active:opacity-70">
          <View className="items-center">
            <View className="h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <UserPlus className="h-6 w-6 text-primary" />
            </View>
            <Text className="mt-3 text-sm font-semibold text-foreground">
              Add Family Member
            </Text>
            <Text className="mt-1 text-center text-xs text-muted-foreground">
              Invite family members to monitor their health
            </Text>
          </View>
        </Pressable>

        {/* Empty state for when no family members */}
        {/* <View className="flex-1 items-center justify-center py-20">
          <View className="h-24 w-24 items-center justify-center rounded-full bg-muted">
            <Users className="h-12 w-12 text-muted-foreground" />
          </View>
          <Text className="mt-4 text-center text-lg font-semibold text-foreground">
            No Family Members Yet
          </Text>
          <Text className="mt-2 px-8 text-center text-sm text-muted-foreground">
            Add family members to monitor their health and medications
          </Text>
          <Pressable className="mt-6 rounded-lg bg-primary px-6 py-3">
            <Text className="text-sm font-semibold text-primary-foreground">
              Add Family Member
            </Text>
          </Pressable>
        </View> */}
      </ScrollView>
    </SafeAreaView>
  );
}
