<template>
  <div class="category-form">
    <div class="category-form__header">
      <h2 class="category-form__title">
        {{ isEditing ? 'Edit Category' : 'Create Category' }}
      </h2>
      <button
        @click="$emit('close')"
        class="category-form__close-btn"
        type="button"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>

    <form @submit.prevent="handleSubmit" class="category-form__form">
      <div class="category-form__field">
        <label for="category-name" class="category-form__label">
          Category Name <span class="category-form__required">*</span>
        </label>
        <input
          id="category-name"
          v-model="formData.name"
          type="text"
          class="category-form__input"
          :class="{ 'category-form__input--error': errors.name }"
          placeholder="e.g., Appetizers, Main Courses, Desserts"
          required
        />
        <p v-if="errors.name" class="category-form__error">
          {{ errors.name }}
        </p>
      </div>

      <div class="category-form__field">
        <label for="category-description" class="category-form__label">
          Description
        </label>
        <textarea
          id="category-description"
          v-model="formData.description"
          class="category-form__textarea"
          :class="{ 'category-form__input--error': errors.description }"
          placeholder="Optional description for this category"
          rows="3"
        ></textarea>
        <p v-if="errors.description" class="category-form__error">
          {{ errors.description }}
        </p>
      </div>

      <div v-if="submitError" class="category-form__submit-error">
        {{ submitError }}
      </div>

      <div class="category-form__actions">
        <button
          type="button"
          @click="$emit('close')"
          class="category-form__btn category-form__btn--cancel"
          :disabled="submitting"
        >
          Cancel
        </button>
        <button
          type="submit"
          class="category-form__btn category-form__btn--submit"
          :disabled="submitting || !isFormValid"
        >
          <span v-if="submitting" class="category-form__spinner"></span>
          {{ submitting ? 'Saving...' : (isEditing ? 'Update Category' : 'Create Category') }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { Category } from '~/types'

interface Props {
  category?: Category | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
  submit: [data: { name: string; description?: string }]
}>()

const isEditing = computed(() => !!props.category)

const formData = ref({
  name: '',
  description: '',
})

const errors = ref({
  name: '',
  description: '',
})

const submitError = ref('')
const submitting = ref(false)

// Initialize form data when category prop changes
watch(() => props.category, (newCategory) => {
  if (newCategory) {
    formData.value = {
      name: newCategory.name,
      description: newCategory.description || '',
    }
  } else {
    formData.value = {
      name: '',
      description: '',
    }
  }
  errors.value = { name: '', description: '' }
  submitError.value = ''
}, { immediate: true })

const isFormValid = computed(() => {
  return formData.value.name.trim().length > 0
})

const validateForm = (): boolean => {
  errors.value = { name: '', description: '' }
  let isValid = true

  if (!formData.value.name.trim()) {
    errors.value.name = 'Category name is required'
    isValid = false
  } else if (formData.value.name.trim().length < 2) {
    errors.value.name = 'Category name must be at least 2 characters'
    isValid = false
  } else if (formData.value.name.trim().length > 100) {
    errors.value.name = 'Category name must be less than 100 characters'
    isValid = false
  }

  if (formData.value.description && formData.value.description.length > 500) {
    errors.value.description = 'Description must be less than 500 characters'
    isValid = false
  }

  return isValid
}

const handleSubmit = async () => {
  if (!validateForm()) {
    return
  }

  submitting.value = true
  submitError.value = ''

  try {
    const data = {
      name: formData.value.name.trim(),
      description: formData.value.description.trim() || undefined,
    }

    emit('submit', data)
  } catch (error: any) {
    submitError.value = error.message || 'Failed to save category'
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped lang="scss">
@use './category-form';
</style>
