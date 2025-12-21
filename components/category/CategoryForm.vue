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
          name="name"
          data-field="name"
          class="category-form__input"
          :class="{ 'category-form__input--error': form.getFieldError('name') }"
          placeholder="e.g., Appetizers, Main Courses, Desserts"
          required
          @input="form.clearFieldError('name')"
        />
        <p v-if="form.getFieldError('name')" class="category-form__error">
          {{ form.getFieldError('name') }}
        </p>
      </div>

      <div class="category-form__field">
        <label for="category-description" class="category-form__label">
          Description
        </label>
        <textarea
          id="category-description"
          v-model="formData.description"
          name="description"
          data-field="description"
          class="category-form__textarea"
          :class="{ 'category-form__input--error': form.getFieldError('description') }"
          placeholder="Optional description for this category"
          rows="3"
          @input="form.clearFieldError('description')"
        ></textarea>
        <p v-if="form.getFieldError('description')" class="category-form__error">
          {{ form.getFieldError('description') }}
        </p>
      </div>

      <div v-if="form.globalErrors.value.length > 0" class="category-form__submit-error">
        <div v-for="error in form.globalErrors.value" :key="error">
          {{ error }}
        </div>
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
import { useEnhancedApiForm } from '~/composables/useEnhancedApiForm'
import type { Category } from '~/types'

interface Props {
  category?: Category | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
  submit: [data: { name: string; description?: string }]
}>()

// Use Enhanced API Form for better error handling
const form = useEnhancedApiForm()

const isEditing = computed(() => !!props.category)

const formData = ref({
  name: '',
  description: '',
})

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
  form.clearAllErrors()
}, { immediate: true })

const isFormValid = computed(() => {
  return formData.value.name.trim().length > 0 && !form.hasErrors.value
})

const validateForm = (): boolean => {
  form.clearAllErrors()
  let isValid = true

  if (!formData.value.name.trim()) {
    form.handleValidationError({
      code: 'VALIDATION_ERROR',
      message: 'Validation failed',
      details: [{
        field: 'name',
        message: 'Category name is required'
      }]
    })
    isValid = false
  } else if (formData.value.name.trim().length < 2) {
    form.handleValidationError({
      code: 'VALIDATION_ERROR',
      message: 'Validation failed',
      details: [{
        field: 'name',
        message: 'Category name must be at least 2 characters'
      }]
    })
    isValid = false
  } else if (formData.value.name.trim().length > 100) {
    form.handleValidationError({
      code: 'VALIDATION_ERROR',
      message: 'Validation failed',
      details: [{
        field: 'name',
        message: 'Category name must be less than 100 characters'
      }]
    })
    isValid = false
  }

  if (formData.value.description && formData.value.description.length > 500) {
    form.handleValidationError({
      code: 'VALIDATION_ERROR',
      message: 'Validation failed',
      details: [{
        field: 'description',
        message: 'Description must be less than 500 characters'
      }]
    })
    isValid = false
  }

  return isValid
}

const handleSubmit = async () => {
  if (!validateForm()) {
    return
  }

  submitting.value = true
  form.setSubmitting(true)

  try {
    const data = {
      name: formData.value.name.trim(),
      description: formData.value.description.trim() || undefined,
    }

    emit('submit', data)
  } catch (error: any) {
    // Handle API errors through the enhanced form
    if (error.code === 'VALIDATION_ERROR') {
      form.handleValidationError(error)
    } else {
      form.handleValidationError({
        code: 'SUBMIT_ERROR',
        message: error.message || 'Failed to save category',
        details: []
      })
    }
  } finally {
    submitting.value = false
    form.setSubmitting(false)
  }
}
</script>

<style scoped lang="scss">
@use './category-form';
</style>
