/**
 * MediSync Family Store
 * Manages family members and groups with persistence
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type {
  Group,
  FamilyMember,
  FamilyMemberPermissions,
  FollowStatus,
  Relationship,
} from '@/lib/types';

interface FamilyState {
  // State
  groups: Group[];
  members: FamilyMember[];
  isLoading: boolean;

  // Group CRUD
  addGroup: (group: Group) => void;
  updateGroup: (id: string, updates: Partial<Group>) => void;
  deleteGroup: (id: string) => void;
  getGroupById: (id: string) => Group | undefined;
  getGroupsByOwnerId: (ownerId: string) => Group[];
  addMemberToGroup: (groupId: string, memberId: string) => void;
  removeMemberFromGroup: (groupId: string, memberId: string) => void;

  // Family Member CRUD
  addMember: (member: FamilyMember) => void;
  updateMember: (id: string, updates: Partial<FamilyMember>) => void;
  deleteMember: (id: string) => void;
  getMemberById: (id: string) => FamilyMember | undefined;

  // Member Actions
  followMember: (memberId: string) => void;
  unfollowMember: (memberId: string) => void;
  acceptFollowRequest: (memberId: string) => void;
  rejectFollowRequest: (memberId: string) => void;
  updatePermissions: (memberId: string, permissions: Partial<FamilyMemberPermissions>) => void;
  toggleNotifications: (memberId: string) => void;

  // Getters
  getAcceptedMembers: () => FamilyMember[];
  getPendingMembers: () => FamilyMember[];
  getMembersByRelationship: (relationship: Relationship) => FamilyMember[];
  getMembersWithAlerts: () => FamilyMember[];
  getActiveMembersCount: () => number;

  // Utility
  setLoading: (loading: boolean) => void;
  clearAll: () => void;
}

export const useFamilyStore = create<FamilyState>()(
  persist(
    (set, get) => ({
      // Initial state
      groups: [],
      members: [],
      isLoading: false,

      // ==================== Group CRUD ====================

      // Add group
      addGroup: (group: Group) => {
        set((state) => ({
          groups: [...state.groups, group],
        }));
      },

      // Update group
      updateGroup: (id: string, updates: Partial<Group>) => {
        set((state) => ({
          groups: state.groups.map((group) =>
            group.id === id ? { ...group, ...updates } : group
          ),
        }));
      },

      // Delete group
      deleteGroup: (id: string) => {
        set((state) => ({
          groups: state.groups.filter((group) => group.id !== id),
        }));
      },

      // Get group by ID
      getGroupById: (id: string) => {
        return get().groups.find((group) => group.id === id);
      },

      // Get groups by owner ID
      getGroupsByOwnerId: (ownerId: string) => {
        return get().groups.filter((group) => group.ownerId === ownerId);
      },

      // Add member to group
      addMemberToGroup: (groupId: string, memberId: string) => {
        set((state) => ({
          groups: state.groups.map((group) =>
            group.id === groupId
              ? {
                  ...group,
                  memberIds: [...group.memberIds, memberId],
                }
              : group
          ),
        }));
      },

      // Remove member from group
      removeMemberFromGroup: (groupId: string, memberId: string) => {
        set((state) => ({
          groups: state.groups.map((group) =>
            group.id === groupId
              ? {
                  ...group,
                  memberIds: group.memberIds.filter((id) => id !== memberId),
                }
              : group
          ),
        }));
      },

      // ==================== Family Member CRUD ====================

      // Add member
      addMember: (member: FamilyMember) => {
        set((state) => ({
          members: [...state.members, member],
        }));
      },

      // Update member
      updateMember: (id: string, updates: Partial<FamilyMember>) => {
        set((state) => ({
          members: state.members.map((member) =>
            member.id === id ? { ...member, ...updates } : member
          ),
        }));
      },

      // Delete member
      deleteMember: (id: string) => {
        set((state) => ({
          members: state.members.filter((member) => member.id !== id),
          // Remove member from all groups
          groups: state.groups.map((group) => ({
            ...group,
            memberIds: group.memberIds.filter((memberId) => memberId !== id),
          })),
        }));
      },

      // Get member by ID
      getMemberById: (id: string) => {
        return get().members.find((member) => member.id === id);
      },

      // ==================== Member Actions ====================

      // Follow member
      followMember: (memberId: string) => {
        get().updateMember(memberId, { followStatus: 'pending' });
      },

      // Unfollow member
      unfollowMember: (memberId: string) => {
        get().deleteMember(memberId);
      },

      // Accept follow request
      acceptFollowRequest: (memberId: string) => {
        get().updateMember(memberId, { followStatus: 'accepted' });
      },

      // Reject follow request
      rejectFollowRequest: (memberId: string) => {
        get().updateMember(memberId, { followStatus: 'rejected' });
      },

      // Update permissions
      updatePermissions: (
        memberId: string,
        permissions: Partial<FamilyMemberPermissions>
      ) => {
        const member = get().getMemberById(memberId);
        if (!member) return;

        get().updateMember(memberId, {
          permissions: {
            ...member.permissions,
            ...permissions,
          },
        });
      },

      // Toggle notifications
      toggleNotifications: (memberId: string) => {
        const member = get().getMemberById(memberId);
        if (!member) return;

        get().updateMember(memberId, {
          notificationsEnabled: !member.notificationsEnabled,
        });
      },

      // ==================== Getters ====================

      // Get accepted members
      getAcceptedMembers: () => {
        return get().members.filter(
          (member) => member.followStatus === 'accepted'
        );
      },

      // Get pending members
      getPendingMembers: () => {
        return get().members.filter((member) => member.followStatus === 'pending');
      },

      // Get members by relationship
      getMembersByRelationship: (relationship: Relationship) => {
        return get()
          .members.filter(
            (member) =>
              member.relationship === relationship &&
              member.followStatus === 'accepted'
          )
          .sort((a, b) => a.name.localeCompare(b.name));
      },

      // Get members with alerts enabled
      getMembersWithAlerts: () => {
        return get().members.filter(
          (member) =>
            member.followStatus === 'accepted' &&
            member.notificationsEnabled &&
            member.permissions.canReceiveAlerts
        );
      },

      // Get active members count
      getActiveMembersCount: () => {
        return get().members.filter((member) => member.followStatus === 'accepted')
          .length;
      },

      // ==================== Utility ====================

      // Set loading state
      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      // Clear all data
      clearAll: () => {
        set({
          groups: [],
          members: [],
        });
      },
    }),
    {
      name: 'medisync_family',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        groups: state.groups,
        members: state.members,
      }),
    }
  )
);

// Selectors
export const selectGroups = (state: FamilyState) => state.groups;
export const selectMembers = (state: FamilyState) => state.members;
export const selectAcceptedMembers = (state: FamilyState) =>
  state.getAcceptedMembers();
export const selectPendingMembers = (state: FamilyState) => state.getPendingMembers();
export const selectActiveMembersCount = (state: FamilyState) =>
  state.getActiveMembersCount();
export const selectMembersWithAlerts = (state: FamilyState) =>
  state.getMembersWithAlerts();
export const selectIsLoading = (state: FamilyState) => state.isLoading;
