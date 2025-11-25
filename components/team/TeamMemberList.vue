<template>
  <div class="team-member-list">
    <!-- Header with Add Button -->
    <div class="team-member-list__header">
      <h2 class="team-member-list__title">Team Members</h2>
      <button
        v-if="canAddMembers && hasMultiUser"
        class="team-member-list__add-btn"
        @click="$emit('invite')"
        :disabled="!canAddMembers"
      >
        <span class="team-member-list__add-icon">+</span>
        Invite Member
      </button>
    </div>

    <!-- Plan Limit Indicator -->
    <div v-if="limits" class="team-member-list__limits">
      <div class="team-member-list__limits-text">
        <span class="team-member-list__limits-count">
          {{ limits.current }} / {{ limits.limit }}
        </span>
        team members
      </div>
      <div class="team-member-list__limits-bar">
        <div
          class="team-member-list__limits-progress"
          :style="{ width: `${(limits.current / limits.limit) * 100}%` }"
          :class="{
            'team-member-list__limits-progress--warning': limits.remaining <= 2,
            'team-member-list__limits-progress--full': !limits.canCreate,
          }"
        ></div>
      </div>
      <p v-if="!limits.canCreate" class="team-member-list__limits-message">
        You've reached your team member limit. Upgrade your plan to add more members.
      </p>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="team-member-list__loading">
      <div class="team-member-list__spinner"></div>
      <p>Loading team members...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="team-member-list__error">
      <p>{{ error }}</p>
      <button @click="$emit('retry')" class="team-member-list__retry-btn">
        Retry
      </button>
    </div>

    <!-- Empty State -->
    <div v-else-if="members.length === 0" class="team-member-list__empty">
      <p>No team members yet.</p>
      <button
        v-if="hasMultiUser"
        @click="$emit('invite')"
        class="team-member-list__invite-btn"
      >
        Invite Your First Member
      </button>
    </div>

    <!-- Members Table -->
    <div v-else class="team-member-list__table-wrapper">
      <table class="team-member-list__table">
        <thead class="team-member-list__thead">
          <tr class="team-member-list__row">
            <th class="team-member-list__th">Name</th>
            <th class="team-member-list__th">Email</th>
            <th class="team-member-list__th">Role</th>
            <th class="team-member-list__th">Status</th>
            <th class="team-member-list__th">Joined</th>
            <th class="team-member-list__th team-member-list__th--actions">
              Actions
            </th>
          </tr>
        </thead>
        <tbody class="team-member-list__tbody">
          <tr
            v-for="member in members"
            :key="member.id"
            class="team-member-list__row"
          >
            <td class="team-member-list__td">
              <div class="team-member-list__name">
                <div class="team-member-list__avatar">
                  {{ getInitials(member) }}
                </div>
                <span>{{ member.firstName }} {{ member.lastName }}</span>
              </div>
            </td>
            <td class="team-member-list__td">{{ member.email }}</td>
            <td class="team-member-list__td">
              <span
                class="team-member-list__role-badge"
                :class="`team-member-list__role-badge--${member.role.toLowerCase()}`"
              >
                {{ formatRole(member.role) }}
              </span>
            </td>
            <td class="team-member-list__td">
              <span
                class="team-member-list__status-badge"
                :class="{
                  'team-member-list__status-badge--active': isActive(member),
                  'team-member-list__status-badge--inactive': !isActive(member),
                }"
              >
                {{ isActive(member) ? 'Active' : 'Inactive' }}
              </span>
            </td>
            <td class="team-member-list__td">
              {{ formatDate(member.createdAt) }}
            </td>
            <td class="team-member-list__td team-member-list__td--actions">
              <div class="team-member-list__actions">
                <button
                  v-if="canManageRole(member)"
                  @click="$emit('change-role', member)"
                  class="team-member-list__action-btn"
                  title="Change Role"
                >
                  <span class="team-member-list__action-icon">👤</span>
                </button>
                <button
                  v-if="canRemove(member)"
                  @click="$emit('remove', member)"
                  class="team-member-list__action-btn team-member-list__action-btn--danger"
                  title="Remove Member"
                >
                  <span class="team-member-list__action-icon">🗑️</span>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div v-if="pagination.totalPages > 1" class="team-member-list__pagination">
      <button
        @click="$emit('page-change', pagination.page - 1)"
        :disabled="pagination.page === 1"
        class="team-member-list__page-btn"
      >
        Previous
      </button>
      <span class="team-member-list__page-info">
        Page {{ pagination.page }} of {{ pagination.totalPages }}
      </span>
      <button
        @click="$emit('page-change', pagination.page + 1)"
        :disabled="pagination.page === pagination.totalPages"
        class="team-member-list__page-btn"
      >
        Next
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { User } from '~/types'

interface Props {
  members: User[]
  loading: boolean
  error: string | null
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  limits: {
    current: number
    limit: number
    remaining: number
    canCreate: boolean
  } | null
  currentUserId?: string
  hasMultiUser: boolean
}

const props = defineProps<Props>()

defineEmits<{
  invite: []
  'change-role': [member: User]
  remove: [member: User]
  'page-change': [page: number]
  retry: []
}>()

const canAddMembers = computed(() => props.limits?.canCreate ?? true)

const getInitials = (member: User): string => {
  return `${member.firstName.charAt(0)}${member.lastName.charAt(0)}`.toUpperCase()
}

const formatRole = (role: string): string => {
  return role.replace('TENANT_', '').replace('_', ' ')
}

const isActive = (member: User): boolean => {
  // Assuming there's an isActive field or we check deletedAt
  return true // Placeholder - adjust based on actual User type
}

const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

const canManageRole = (member: User): boolean => {
  // Can't change own role
  return member.id !== props.currentUserId
}

const canRemove = (member: User): boolean => {
  // Can't remove yourself
  return member.id !== props.currentUserId
}
</script>

<style scoped lang="scss">
@use './team-member-list';
</style>
