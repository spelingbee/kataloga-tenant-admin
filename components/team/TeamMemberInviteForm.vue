<template>
  <div class="team-invite-form">
    <div class="team-invite-form__header">
      <h3 class="team-invite-form__title">Invite Team Member</h3>
      <button
        @click="$emit('close')"
        class="team-invite-form__close-btn"
        type="button"
      >
        ×
      </button>
    </div>

    <form @submit.prevent="handleSubmit" class="team-invite-form__form">
      <!-- Email Field -->
      <div class="team-invite-form__field">
        <label for="email" class="team-invite-form__label">
          Email Address <span class="team-invite-form__required">*</span>
        </label>
        <input
          id="email"
          v-model="formData.email"
          type="email"
          class="team-invite-form__input"
          :class="{ 'team-invite-form__input--error': errors.email }"
          placeholder="member@example.com"
          required
        />
        <p v-if="errors.email" class="team-invite-form__error">
          {{ errors.email }}
        </p>
      </div>

      <!-- First Name Field -->
      <div class="team-invite-form__field">
        <label for="firstName" class="team-invite-form__label">
          First Name <span class="team-invite-form__required">*</span>
        </label>
        <input
          id="firstName"
          v-model="formData.firstName"
          type="text"
          class="team-invite-form__input"
          :class="{ 'team-invite-form__input--error': errors.firstName }"
          placeholder="John"
          required
        />
        <p v-if="errors.firstName" class="team-invite-form__error">
          {{ errors.firstName }}
        </p>
      </div>

      <!-- Last Name Field -->
      <div class="team-invite-form__field">
        <label for="lastName" class="team-invite-form__label">
          Last Name <span class="team-invite-form__required">*</span>
        </label>
        <input
          id="lastName"
          v-model="formData.lastName"
          type="text"
          class="team-invite-form__input"
          :class="{ 'team-invite-form__input--error': errors.lastName }"
          placeholder="Doe"
          required
        />
        <p v-if="errors.lastName" class="team-invite-form__error">
          {{ errors.lastName }}
        </p>
      </div>

      <!-- Role Field -->
      <div class="team-invite-form__field">
        <label for="role" class="team-invite-form__label">
          Role <span class="team-invite-form__required">*</span>
        </label>
        <select
          id="role"
          v-model="formData.role"
          class="team-invite-form__select"
          :class="{ 'team-invite-form__select--error': errors.role }"
          required
        >
          <option value="">Select a role</option>
          <option value="TENANT_ADMIN">Admin</option>
          <option value="TENANT_STAFF">Staff</option>
        </select>
        <p v-if="errors.role" class="team-invite-form__error">
          {{ errors.role }}
        </p>
        <p class="team-invite-form__help">
          <strong>Admin:</strong> Full access to manage menu, team, and settings.<br />
          <strong>Staff:</strong> Can manage menu items but cannot manage team or settings.
        </p>
      </div>

      <!-- Error Message -->
      <div v-if="submitError" class="team-invite-form__submit-error">
        {{ submitError }}
      </div>

      <!-- Actions -->
      <div class="team-invite-form__actions">
        <button
          type="button"
          @click="$emit('close')"
          class="team-invite-form__cancel-btn"
          :disabled="loading"
        >
          Cancel
        </button>
        <button
          type="submit"
          class="team-invite-form__submit-btn"
          :disabled="loading || !isValid"
        >
          <span v-if="loading" class="team-invite-form__spinner"></span>
          <span v-else>Send Invitation</span>
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue'
import type { UserRole } from '~/types'

interface InviteFormData {
  email: string
  firstName: string
  lastName: string
  role: UserRole | ''
}

interface Props {
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
})

const emit = defineEmits<{
  submit: [data: InviteFormData]
  close: []
}>()

const formData = reactive<InviteFormData>({
  email: '',
  firstName: '',
  lastName: '',
  role: '',
})

const errors = reactive({
  email: '',
  firstName: '',
  lastName: '',
  role: '',
})

const submitError = ref('')

const isValid = computed(() => {
  return (
    formData.email &&
    formData.firstName &&
    formData.lastName &&
    formData.role &&
    !errors.email &&
    !errors.firstName &&
    !errors.lastName &&
    !errors.role
  )
})

const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

const validateField = (field: keyof typeof formData): void => {
  switch (field) {
    case 'email':
      if (!formData.email) {
        errors.email = 'Email is required'
      } else if (!validateEmail(formData.email)) {
        errors.email = 'Please enter a valid email address'
      } else {
        errors.email = ''
      }
      break
    case 'firstName':
      if (!formData.firstName) {
        errors.firstName = 'First name is required'
      } else if (formData.firstName.length < 2) {
        errors.firstName = 'First name must be at least 2 characters'
      } else {
        errors.firstName = ''
      }
      break
    case 'lastName':
      if (!formData.lastName) {
        errors.lastName = 'Last name is required'
      } else if (formData.lastName.length < 2) {
        errors.lastName = 'Last name must be at least 2 characters'
      } else {
        errors.lastName = ''
      }
      break
    case 'role':
      if (!formData.role) {
        errors.role = 'Role is required'
      } else {
        errors.role = ''
      }
      break
  }
}

const handleSubmit = (): void => {
  // Validate all fields
  validateField('email')
  validateField('firstName')
  validateField('lastName')
  validateField('role')

  if (isValid.value) {
    submitError.value = ''
    emit('submit', formData as Required<InviteFormData>)
  }
}

// Watch for field changes to validate
watch(() => formData.email, () => validateField('email'))
watch(() => formData.firstName, () => validateField('firstName'))
watch(() => formData.lastName, () => validateField('lastName'))
watch(() => formData.role, () => validateField('role'))
</script>

<style scoped lang="scss">
@use './team-member-invite-form';
</style>
