<template>
  <div class="location-form">
    <h2 class="location-form__title">
      {{ isEdit ? 'Edit Location' : 'Add New Location' }}
    </h2>

    <form @submit.prevent="handleSubmit" class="location-form__form">
      <!-- Name -->
      <div class="location-form__field">
        <label for="name" class="location-form__label">
          Location Name <span class="location-form__required">*</span>
        </label>
        <input
          id="name"
          v-model="formData.name"
          type="text"
          class="location-form__input"
          :class="{ 'location-form__input--error': errors.name }"
          placeholder="e.g., Downtown Branch"
          required
        />
        <p v-if="errors.name" class="location-form__error">{{ errors.name }}</p>
      </div>

      <!-- Address -->
      <div class="location-form__field">
        <label for="address" class="location-form__label">
          Address <span class="location-form__required">*</span>
        </label>
        <input
          id="address"
          v-model="formData.address"
          type="text"
          class="location-form__input"
          :class="{ 'location-form__input--error': errors.address }"
          placeholder="e.g., 123 Main Street"
          required
        />
        <p v-if="errors.address" class="location-form__error">{{ errors.address }}</p>
      </div>

      <!-- City -->
      <div class="location-form__field">
        <label for="city" class="location-form__label">
          City <span class="location-form__required">*</span>
        </label>
        <input
          id="city"
          v-model="formData.city"
          type="text"
          class="location-form__input"
          :class="{ 'location-form__input--error': errors.city }"
          placeholder="e.g., New York"
          required
        />
        <p v-if="errors.city" class="location-form__error">{{ errors.city }}</p>
      </div>

      <!-- Phone -->
      <div class="location-form__field">
        <label for="phone" class="location-form__label">Phone</label>
        <input
          id="phone"
          v-model="formData.phone"
          type="tel"
          class="location-form__input"
          placeholder="e.g., +1 (555) 123-4567"
        />
      </div>

      <!-- Email -->
      <div class="location-form__field">
        <label for="email" class="location-form__label">Email</label>
        <input
          id="email"
          v-model="formData.email"
          type="email"
          class="location-form__input"
          :class="{ 'location-form__input--error': errors.email }"
          placeholder="e.g., downtown@restaurant.com"
        />
        <p v-if="errors.email" class="location-form__error">{{ errors.email }}</p>
      </div>

      <!-- Status (only for edit) -->
      <div v-if="isEdit" class="location-form__field">
        <label class="location-form__checkbox-label">
          <input
            v-model="formData.isActive"
            type="checkbox"
            class="location-form__checkbox"
          />
          <span>Active Location</span>
        </label>
        <p class="location-form__help">
          Inactive locations won't be available for menu item assignment
        </p>
      </div>

      <!-- Map Integration Placeholder -->
      <div class="location-form__map">
        <div class="location-form__map-placeholder">
          <span class="location-form__map-icon">🗺️</span>
          <p class="location-form__map-text">
            Map integration coming soon
          </p>
          <p class="location-form__map-subtext">
            You can manually enter the address above
          </p>
        </div>
      </div>

      <!-- Actions -->
      <div class="location-form__actions">
        <button
          type="button"
          class="location-form__btn location-form__btn--cancel"
          @click="$emit('cancel')"
          :disabled="loading"
        >
          Cancel
        </button>
        <button
          type="submit"
          class="location-form__btn location-form__btn--submit"
          :disabled="loading"
        >
          <span v-if="loading" class="location-form__spinner"></span>
          <span v-else>{{ isEdit ? 'Update Location' : 'Create Location' }}</span>
        </button>
      </div>

      <!-- Error Message -->
      <div v-if="generalError" class="location-form__general-error">
        {{ generalError }}
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import type { Location } from '~/types'

interface Props {
  location?: Location | null
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  location: null,
  loading: false,
})

const emit = defineEmits<{
  submit: [data: LocationFormData]
  cancel: []
}>()

interface LocationFormData {
  name: string
  address: string
  city: string
  phone: string
  email: string
  isActive: boolean
}

const isEdit = computed(() => !!props.location)

const formData = reactive<LocationFormData>({
  name: '',
  address: '',
  city: '',
  phone: '',
  email: '',
  isActive: true,
})

const errors = reactive({
  name: '',
  address: '',
  city: '',
  email: '',
})

const generalError = ref('')

// Populate form when editing
watch(
  () => props.location,
  (location) => {
    if (location) {
      formData.name = location.name
      formData.address = location.address
      formData.city = location.city
      formData.phone = location.phone || ''
      formData.email = location.email || ''
      formData.isActive = location.isActive
    }
  },
  { immediate: true }
)

const validateForm = (): boolean => {
  let isValid = true

  // Reset errors
  errors.name = ''
  errors.address = ''
  errors.city = ''
  errors.email = ''
  generalError.value = ''

  // Validate name
  if (!formData.name.trim()) {
    errors.name = 'Location name is required'
    isValid = false
  }

  // Validate address
  if (!formData.address.trim()) {
    errors.address = 'Address is required'
    isValid = false
  }

  // Validate city
  if (!formData.city.trim()) {
    errors.city = 'City is required'
    isValid = false
  }

  // Validate email format if provided
  if (formData.email && !isValidEmail(formData.email)) {
    errors.email = 'Please enter a valid email address'
    isValid = false
  }

  return isValid
}

const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

const handleSubmit = () => {
  if (!validateForm()) {
    return
  }

  const submitData: LocationFormData = {
    name: formData.name.trim(),
    address: formData.address.trim(),
    city: formData.city.trim(),
    phone: formData.phone.trim() || '',
    email: formData.email.trim() || '',
    isActive: formData.isActive,
  }

  emit('submit', submitData)
}
</script>

<style scoped lang="scss">
@use './location-form';
</style>
