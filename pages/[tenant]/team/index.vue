<template>
  <div class="team-page">
    <!-- Feature Access Guard -->
    <div v-if="!hasMultiUser" class="team-page__locked">
      <div class="team-page__locked-content">
        <div class="team-page__locked-icon">🔒</div>
        <h2 class="team-page__locked-title">Team Management</h2>
        <p class="team-page__locked-description">
          Team management is available on PRO and BUSINESS plans. Upgrade your plan to
          invite team members and collaborate with your staff.
        </p>
        <div class="team-page__locked-features">
          <h3 class="team-page__locked-features-title">With Team Management you can:</h3>
          <ul class="team-page__locked-features-list">
            <li>Invite multiple team members</li>
            <li>Assign roles (Admin or Staff)</li>
            <li>Control access to features</li>
            <li>Track team activity</li>
          </ul>
        </div>
        <NuxtLink to="/subscription" class="team-page__upgrade-btn">
          View Plans & Upgrade
        </NuxtLink>
      </div>
    </div>

    <!-- Team Management Content -->
    <div v-else class="team-page__content">
      <div class="team-page__header">
        <div>
          <h1 class="team-page__title">Team Management</h1>
          <p class="team-page__subtitle">
            Manage your team members and their access levels
          </p>
        </div>
      </div>

      <!-- Team Member List -->
      <TeamMemberList
        :members="teamStore.members"
        :loading="teamStore.loading"
        :error="teamStore.error"
        :pagination="teamStore.pagination"
        :limits="teamStore.limits"
        :current-user-id="authStore.user?.id"
        :has-multi-user="hasMultiUser"
        @invite="showInviteModal = true"
        @change-role="handleChangeRole"
        @remove="handleRemove"
        @page-change="handlePageChange"
        @retry="loadTeamMembers"
      />
    </div>

    <!-- Invite Modal -->
    <Modal v-model="showInviteModal">
      <TeamMemberInviteForm
        :loading="inviteLoading"
        @submit="handleInvite"
        @close="showInviteModal = false"
      />
    </Modal>

    <!-- Change Role Modal -->
    <Modal v-model="showRoleModal">
      <div class="team-page__role-modal">
        <div class="team-page__role-modal-header">
          <h3 class="team-page__role-modal-title">Change Role</h3>
          <button
            @click="showRoleModal = false"
            class="team-page__role-modal-close"
            type="button"
          >
            ×
          </button>
        </div>
        <div class="team-page__role-modal-body">
          <p class="team-page__role-modal-text">
            Change role for <strong>{{ selectedMember?.firstName }} {{ selectedMember?.lastName }}</strong>
          </p>
          <div class="team-page__role-modal-field">
            <label for="newRole" class="team-page__role-modal-label">New Role</label>
            <select
              id="newRole"
              v-model="newRole"
              class="team-page__role-modal-select"
            >
              <option value="TENANT_ADMIN">Admin</option>
              <option value="TENANT_STAFF">Staff</option>
            </select>
          </div>
        </div>
        <div class="team-page__role-modal-actions">
          <button
            @click="showRoleModal = false"
            class="team-page__role-modal-cancel"
            :disabled="roleLoading"
          >
            Cancel
          </button>
          <button
            @click="confirmRoleChange"
            class="team-page__role-modal-confirm"
            :disabled="roleLoading || !newRole"
          >
            <span v-if="roleLoading" class="team-page__spinner"></span>
            <span v-else>Change Role</span>
          </button>
        </div>
      </div>
    </Modal>

    <!-- Remove Confirmation Modal -->
    <Modal v-model="showRemoveModal">
      <div class="team-page__remove-modal">
        <div class="team-page__remove-modal-header">
          <h3 class="team-page__remove-modal-title">Remove Team Member</h3>
          <button
            @click="showRemoveModal = false"
            class="team-page__remove-modal-close"
            type="button"
          >
            ×
          </button>
        </div>
        <div class="team-page__remove-modal-body">
          <p class="team-page__remove-modal-text">
            Are you sure you want to remove
            <strong>{{ selectedMember?.firstName }} {{ selectedMember?.lastName }}</strong>
            from your team? This action cannot be undone.
          </p>
        </div>
        <div class="team-page__remove-modal-actions">
          <button
            @click="showRemoveModal = false"
            class="team-page__remove-modal-cancel"
            :disabled="removeLoading"
          >
            Cancel
          </button>
          <button
            @click="confirmRemove"
            class="team-page__remove-modal-confirm"
            :disabled="removeLoading"
          >
            <span v-if="removeLoading" class="team-page__spinner"></span>
            <span v-else>Remove Member</span>
          </button>
        </div>
      </div>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useTeamStore } from '~/stores/team'
import { useAuthStore } from '~/stores/auth'
import { useFeatureAccess } from '~/composables/useFeatureAccess'
import type { User, UserRole } from '~/types'
import { FeatureKey } from '~/types'
import TeamMemberList from '~/components/team/TeamMemberList.vue'
import TeamMemberInviteForm from '~/components/team/TeamMemberInviteForm.vue'
import Modal from '~/components/ui/Modal.vue'

definePageMeta({
  middleware: 'auth',
})

const teamStore = useTeamStore()
const authStore = useAuthStore()
const { hasMultiUser, requireFeature } = useFeatureAccess()

const showInviteModal = ref(false)
const showRoleModal = ref(false)
const showRemoveModal = ref(false)
const inviteLoading = ref(false)
const roleLoading = ref(false)
const removeLoading = ref(false)
const selectedMember = ref<User | null>(null)
const newRole = ref<UserRole | ''>('')

const loadTeamMembers = async (page: number = 1): Promise<void> => {
  try {
    await teamStore.fetchMembers(page)
    await teamStore.fetchLimits()
  } catch (error) {
    console.error('Failed to load team members:', error)
  }
}

const handleInvite = async (data: any): Promise<void> => {
  inviteLoading.value = true
  try {
    await teamStore.inviteMember(data)
    showInviteModal.value = false
    // Show success notification (you can add a toast notification here)
    alert('Team member invited successfully!')
  } catch (error: any) {
    alert(error.message || 'Failed to invite team member')
  } finally {
    inviteLoading.value = false
  }
}

const handleChangeRole = (member: User): void => {
  selectedMember.value = member
  newRole.value = member.role
  showRoleModal.value = true
}

const confirmRoleChange = async (): Promise<void> => {
  if (!selectedMember.value || !newRole.value) return

  roleLoading.value = true
  try {
    await teamStore.updateMemberRole(selectedMember.value.id, newRole.value as UserRole)
    showRoleModal.value = false
    alert('Role updated successfully!')
  } catch (error: any) {
    alert(error.message || 'Failed to update role')
  } finally {
    roleLoading.value = false
  }
}

const handleRemove = (member: User): void => {
  selectedMember.value = member
  showRemoveModal.value = true
}

const confirmRemove = async (): Promise<void> => {
  if (!selectedMember.value) return

  removeLoading.value = true
  try {
    await teamStore.removeMember(selectedMember.value.id)
    showRemoveModal.value = false
    alert('Team member removed successfully!')
  } catch (error: any) {
    alert(error.message || 'Failed to remove team member')
  } finally {
    removeLoading.value = false
  }
}

const handlePageChange = (page: number): void => {
  loadTeamMembers(page)
}

onMounted(() => {
  // Check feature access and show modal if needed
  if (!hasMultiUser.value) {
    requireFeature(FeatureKey.MULTI_USER)
  } else {
    loadTeamMembers()
  }
})
</script>

<style scoped lang="scss">
@use '../../assets/scss/variables' as *;

.team-page {
  padding: $spacing-xl;
  max-width: 1200px;
  margin: 0 auto;
}

.team-page__locked {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
}

.team-page__locked-content {
  text-align: center;
  max-width: 500px;
  padding: $spacing-xl;
  background: $bg-primary;
  border-radius: $radius-lg;
  box-shadow: $shadow-md;
}

.team-page__locked-icon {
  font-size: 4rem;
  margin-bottom: $spacing-md;
}

.team-page__locked-title {
  font-size: 1.75rem;
  font-weight: 600;
  color: $text-primary;
  margin-bottom: $spacing-sm;
}

.team-page__locked-description {
  color: $text-secondary;
  margin-bottom: $spacing-lg;
  line-height: 1.6;
}

.team-page__locked-features {
  text-align: left;
  margin-bottom: $spacing-xl;
}

.team-page__locked-features-title {
  font-size: 1rem;
  font-weight: 600;
  color: $text-primary;
  margin-bottom: $spacing-sm;
}

.team-page__locked-features-list {
  list-style: none;
  padding: 0;
  margin: 0;

  li {
    padding: $spacing-xs 0;
    color: $text-secondary;

    &::before {
      content: '✓ ';
      color: $success-color;
      font-weight: 600;
      margin-right: $spacing-xs;
    }
  }
}

.team-page__upgrade-btn {
  display: inline-block;
  padding: $spacing-sm $spacing-xl;
  background: $primary-color;
  color: $bg-primary;
  text-decoration: none;
  border-radius: $radius-md;
  font-weight: 500;
  transition: background $transition-base;

  &:hover {
    background: darken($primary-color, 10%);
  }
}

.team-page__content {
  background: $bg-primary;
}

.team-page__header {
  margin-bottom: $spacing-xl;
}

.team-page__title {
  font-size: 2rem;
  font-weight: 600;
  color: $text-primary;
  margin-bottom: $spacing-xs;
}

.team-page__subtitle {
  color: $text-secondary;
  margin: 0;
}

.team-page__role-modal {
  background: $bg-primary;
  border-radius: $radius-lg;
  max-width: 400px;
  width: 100%;
}

.team-page__role-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: $spacing-lg;
  border-bottom: 1px solid $border-color;
}

.team-page__role-modal-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: $text-primary;
  margin: 0;
}

.team-page__role-modal-close {
  background: none;
  border: none;
  font-size: 2rem;
  color: $text-secondary;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: $radius-sm;
  transition: all $transition-base;

  &:hover {
    background: $bg-secondary;
    color: $text-primary;
  }
}

.team-page__role-modal-body {
  padding: $spacing-lg;
}

.team-page__role-modal-text {
  margin-bottom: $spacing-md;
  color: $text-primary;
}

.team-page__role-modal-field {
  margin-bottom: $spacing-md;
}

.team-page__role-modal-label {
  display: block;
  margin-bottom: $spacing-xs;
  font-weight: 500;
  color: $text-primary;
  font-size: 0.875rem;
}

.team-page__role-modal-select {
  width: 100%;
  padding: $spacing-sm $spacing-md;
  border: 1px solid $border-color;
  border-radius: $radius-md;
  font-size: 0.875rem;
  color: $text-primary;
  background: $bg-primary;
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: $primary-color;
  }
}

.team-page__role-modal-actions {
  display: flex;
  gap: $spacing-md;
  justify-content: flex-end;
  padding: $spacing-lg;
  border-top: 1px solid $border-color;
}

.team-page__role-modal-cancel {
  padding: $spacing-sm $spacing-lg;
  background: $bg-secondary;
  border: 1px solid $border-color;
  border-radius: $radius-md;
  color: $text-primary;
  font-weight: 500;
  cursor: pointer;
  transition: all $transition-base;

  &:hover:not(:disabled) {
    background: $border-color;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

.team-page__role-modal-confirm {
  padding: $spacing-sm $spacing-lg;
  background: $primary-color;
  border: none;
  border-radius: $radius-md;
  color: $bg-primary;
  font-weight: 500;
  cursor: pointer;
  transition: background $transition-base;
  display: flex;
  align-items: center;
  gap: $spacing-xs;
  min-width: 120px;
  justify-content: center;

  &:hover:not(:disabled) {
    background: darken($primary-color, 10%);
  }

  &:disabled {
    background: $border-color;
    cursor: not-allowed;
  }
}

.team-page__remove-modal {
  background: $bg-primary;
  border-radius: $radius-lg;
  max-width: 400px;
  width: 100%;
}

.team-page__remove-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: $spacing-lg;
  border-bottom: 1px solid $border-color;
}

.team-page__remove-modal-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: $text-primary;
  margin: 0;
}

.team-page__remove-modal-close {
  background: none;
  border: none;
  font-size: 2rem;
  color: $text-secondary;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: $radius-sm;
  transition: all $transition-base;

  &:hover {
    background: $bg-secondary;
    color: $text-primary;
  }
}

.team-page__remove-modal-body {
  padding: $spacing-lg;
}

.team-page__remove-modal-text {
  color: $text-primary;
  line-height: 1.6;
  margin: 0;
}

.team-page__remove-modal-actions {
  display: flex;
  gap: $spacing-md;
  justify-content: flex-end;
  padding: $spacing-lg;
  border-top: 1px solid $border-color;
}

.team-page__remove-modal-cancel {
  padding: $spacing-sm $spacing-lg;
  background: $bg-secondary;
  border: 1px solid $border-color;
  border-radius: $radius-md;
  color: $text-primary;
  font-weight: 500;
  cursor: pointer;
  transition: all $transition-base;

  &:hover:not(:disabled) {
    background: $border-color;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

.team-page__remove-modal-confirm {
  padding: $spacing-sm $spacing-lg;
  background: $error-color;
  border: none;
  border-radius: $radius-md;
  color: $bg-primary;
  font-weight: 500;
  cursor: pointer;
  transition: background $transition-base;
  display: flex;
  align-items: center;
  gap: $spacing-xs;
  min-width: 140px;
  justify-content: center;

  &:hover:not(:disabled) {
    background: darken($error-color, 10%);
  }

  &:disabled {
    background: $border-color;
    cursor: not-allowed;
  }
}

.team-page__spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: $bg-primary;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
