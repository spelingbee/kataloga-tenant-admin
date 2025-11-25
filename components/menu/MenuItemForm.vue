<template>
  <form class="menu-item-form" @submit.prevent="handleSubmit">
    <div class="menu-item-form__section">
      <h2 class="menu-item-form__section-title">Basic Information</h2>

      <div class="menu-item-form__field">
        <label for="name" class="menu-item-form__label">
          Name <span class="menu-item-form__required">*</span>
        </label>
        <input
          id="name"
          v-model="formData.name"
          type="text"
          class="menu-item-form__input"
          :class="{ 'menu-item-form__input--error': errors.name }"
          placeholder="Enter menu item name"
          maxlength="100"
          @blur="validateField('name')"
        />
        <span v-if="errors.name" class="menu-item-form__error">
          {{ errors.name }}
        </span>
      </div>

      <div class="menu-item-form__field">
        <label for="description" class="menu-item-form__label">
          Description
        </label>
        <textarea
          id="description"
          v-model="formData.description"
          class="menu-item-form__textarea"
          :class="{ 'menu-item-form__input--error': errors.description }"
          placeholder="Enter menu item description"
          rows="4"
          maxlength="500"
          @blur="validateField('description')"
        />
        <div class="menu-item-form__field-info">
          <span v-if="errors.description" class="menu-item-form__error">
            {{ errors.description }}
          </span>
          <span class="menu-item-form__char-count">
            {{ formData.description?.length || 0 }}/500
          </span>
        </div>
      </div>

      <div class="menu-item-form__row">
        <div class="menu-item-form__field">
          <label for="price" class="menu-item-form__label">
            Price <span class="menu-item-form__required">*</span>
          </label>
          <div class="menu-item-form__input-group">
            <span class="menu-item-form__input-prefix">$</span>
            <input
              id="price"
              v-model="formData.price"
              type="number"
              step="0.01"
              min="0.01"
              max="999999.99"
              class="menu-item-form__input menu-item-form__input--with-prefix"
              :class="{ 'menu-item-form__input--error': errors.price }"
              placeholder="0.00"
              @blur="validateField('price')"
            />
          </div>
          <span v-if="errors.price" class="menu-item-form__error">
            {{ errors.price }}
          </span>
        </div>

        <div class="menu-item-form__field">
          <label for="categoryId" class="menu-item-form__label">
            Category
          </label>
          <select
            id="categoryId"
            v-model="formData.categoryId"
            class="menu-item-form__select"
            :class="{ 'menu-item-form__input--error': errors.categoryId }"
            @blur="validateField('categoryId')"
          >
            <option value="">Select a category</option>
            <option
              v-for="category in categories"
              :key="category.id"
              :value="category.id"
            >
              {{ category.name }}
            </option>
          </select>
          <span v-if="errors.categoryId" class="menu-item-form__error">
            {{ errors.categoryId }}
          </span>
        </div>
      </div>

      <div class="menu-item-form__field">
        <label for="allergens" class="menu-item-form__label">
          Allergens
        </label>
        <input
          id="allergens"
          v-model="formData.allergens"
          type="text"
          class="menu-item-form__input"
          placeholder="e.g., Nuts, Dairy, Gluten"
        />
        <span class="menu-item-form__field-hint">
          List any allergens separated by commas
        </span>
      </div>
    </div>

    <div class="menu-item-form__section">
      <h2 class="menu-item-form__section-title">Image</h2>

      <div class="menu-item-form__field">
        <label for="imageUrl" class="menu-item-form__label">
          Image URL
        </label>
        <input
          id="imageUrl"
          v-model="formData.imageUrl"
          type="url"
          class="menu-item-form__input"
          :class="{ 'menu-item-form__input--error': errors.imageUrl }"
          placeholder="https://example.com/image.jpg"
          @blur="validateField('imageUrl')"
        />
        <span v-if="errors.imageUrl" class="menu-item-form__error">
          {{ errors.imageUrl }}
        </span>
        <span class="menu-item-form__field-hint">
          Supported formats: JPG, JPEG, PNG, GIF, WebP
        </span>
      </div>

      <div v-if="formData.imageUrl" class="menu-item-form__image-preview">
        <img
          :src="formData.imageUrl"
          :alt="formData.name || 'Menu item preview'"
          class="menu-item-form__preview-image"
          @error="handleImageError"
        />
      </div>
    </div>

    <div class="menu-item-form__section">
      <h2 class="menu-item-form__section-title">Availability</h2>

      <div class="menu-item-form__field">
        <label class="menu-item-form__checkbox-label">
          <input
            v-model="formData.isActive"
            type="checkbox"
            class="menu-item-form__checkbox"
          />
          <span>Item is active and available to customers</span>
        </label>
      </div>
    </div>

    <div v-if="generalError" class="menu-item-form__general-error">
      {{ generalError }}
    </div>

    <div class="menu-item-form__actions">
      <button
        type="button"
        class="menu-item-form__button menu-item-form__button--secondary"
        @click="$emit('cancel')"
        :disabled="loading"
      >
        Cancel
      </button>
      <button
        type="submit"
        class="menu-item-form__button menu-item-form__button--primary"
        :disabled="loading || !isFormValid"
      >
        <LoadingSpinner v-if="loading" size="small" />
        <span v-else>{{ submitLabel }}</span>
      </button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import type { MenuItem, Category } from '~/types'
import LoadingSpinner from '~/components/ui/LoadingSpinner.vue'

interface Props {
  initialData?: Partial<MenuItem>
  submitLabel?: string
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  submitLabel: 'Save',
  loading: false,
})

const emit = defineEmits<{
  submit: [data: Partial<MenuItem>]
  cancel: []
}>()

const categoryStore = useCategoryStore()

const formData = ref<Partial<MenuItem>>({
  name: '',
  description: '',
  price: undefined,
  imageUrl: '',
  allergens: '',
  categoryId: '',
  isActive: true,
})

const errors = ref<Record<string, string>>({})
const generalError = ref<string>('')

const categories = computed(() => categoryStore.sortedCategories)

// Initialize form with initial data
watch(
  () => props.initialData,
  (newData) => {
    if (newData) {
      formData.value = {
        name: newData.name || '',
        description: newData.description || '',
        price: newData.price,
        imageUrl: newData.imageUrl || '',
        allergens: newData.allergens || '',
        categoryId: newData.categoryId || '',
        isActive: newData.isActive !== undefined ? newData.isActive : true,
      }
    }
  },
  { immediate: true }
)

// Load categories on mount
onMounted(async () => {
  try {
    await categoryStore.fetchCategories()
  } catch (error) {
    console.error('Failed to load categories:', error)
  }
})

const validateField = (field: string): boolean => {
  errors.value[field] = ''

  switch (field) {
    case 'name':
      if (!formData.value.name || formData.value.name.trim().length === 0) {
        errors.value.name = 'Name is required'
        return false
      }
      if (formData.value.name.length > 100) {
        errors.value.name = 'Name must be 100 characters or less'
        return false
      }
      break

    case 'description':
      if (formData.value.description && formData.value.description.length > 500) {
        errors.value.description = 'Description must be 500 characters or less'
        return false
      }
      break

    case 'price':
      if (!formData.value.price) {
        errors.value.price = 'Price is required'
        return false
      }
      const price = Number(formData.value.price)
      if (isNaN(price) || price < 0.01) {
        errors.value.price = 'Price must be at least $0.01'
        return false
      }
      if (price > 999999.99) {
        errors.value.price = 'Price cannot exceed $999,999.99'
        return false
      }
      break

    case 'imageUrl':
      if (formData.value.imageUrl) {
        const urlPattern = /^https?:\/\/.+/i
        if (!urlPattern.test(formData.value.imageUrl)) {
          errors.value.imageUrl = 'Please enter a valid URL'
          return false
        }
        const imagePattern = /\.(jpg|jpeg|png|gif|webp)$/i
        if (!imagePattern.test(formData.value.imageUrl)) {
          errors.value.imageUrl = 'Image must be JPG, JPEG, PNG, GIF, or WebP'
          return false
        }
      }
      break
  }

  return true
}

const validateForm = (): boolean => {
  const fields = ['name', 'price', 'description', 'imageUrl']
  let isValid = true

  fields.forEach((field) => {
    if (!validateField(field)) {
      isValid = false
    }
  })

  return isValid
}

const isFormValid = computed(() => {
  return (
    formData.value.name &&
    formData.value.name.trim().length > 0 &&
    formData.value.price &&
    Number(formData.value.price) >= 0.01 &&
    Object.keys(errors.value).every((key) => !errors.value[key])
  )
})

const handleSubmit = () => {
  generalError.value = ''

  if (!validateForm()) {
    generalError.value = 'Please fix the errors above'
    return
  }

  // Clean up empty strings
  const submitData: Partial<MenuItem> = {
    name: formData.value.name?.trim(),
    description: formData.value.description?.trim() || undefined,
    price: Number(formData.value.price),
    imageUrl: formData.value.imageUrl?.trim() || undefined,
    allergens: formData.value.allergens?.trim() || undefined,
    categoryId: formData.value.categoryId || undefined,
    isActive: formData.value.isActive,
  }

  emit('submit', submitData)
}

const handleImageError = () => {
  errors.value.imageUrl = 'Failed to load image. Please check the URL.'
}
</script>

<style scoped lang="scss">
@use '@/assets/scss/variables' as *;

.menu-item-form {
  max-width: 800px;
}

.menu-item-form__section {
  margin-bottom: $spacing-2xl;
  padding: $spacing-xl;
  background: $bg-primary;
  border: 1px solid $border-color;
  border-radius: $radius-lg;
}

.menu-item-form__section-title {
  margin: 0 0 $spacing-lg 0;
  font-size: $font-size-xl;
  font-weight: $font-weight-semibold;
  color: $text-primary;
}

.menu-item-form__field {
  margin-bottom: $spacing-lg;
  
  &:last-child {
    margin-bottom: 0;
  }
}

.menu-item-form__row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: $spacing-lg;
  
  @media (max-width: $breakpoint-md) {
    grid-template-columns: 1fr;
  }
}

.menu-item-form__label {
  display: block;
  margin-bottom: $spacing-sm;
  font-size: $font-size-sm;
  font-weight: $font-weight-medium;
  color: $text-primary;
}

.menu-item-form__required {
  color: $error-color;
}

.menu-item-form__input {
  width: 100%;
  padding: $spacing-sm $spacing-md;
  font-size: $font-size-base;
  color: $text-primary;
  background: $bg-primary;
  border: 1px solid $border-color;
  border-radius: $radius-md;
  transition: border-color $transition-base, box-shadow $transition-base;
  
  &:focus {
    outline: none;
    border-color: $primary-color;
    box-shadow: 0 0 0 3px rgba($primary-color, 0.1);
  }
  
  &::placeholder {
    color: $text-light;
  }
}

.menu-item-form__input--error {
  border-color: $error-color;
  
  &:focus {
    box-shadow: 0 0 0 3px rgba($error-color, 0.1);
  }
}

.menu-item-form__input-group {
  position: relative;
  display: flex;
  align-items: center;
}

.menu-item-form__input-prefix {
  position: absolute;
  left: $spacing-md;
  font-size: $font-size-base;
  font-weight: $font-weight-medium;
  color: $text-secondary;
  pointer-events: none;
}

.menu-item-form__input--with-prefix {
  padding-left: $spacing-xl;
}

.menu-item-form__textarea {
  width: 100%;
  padding: $spacing-sm $spacing-md;
  font-size: $font-size-base;
  font-family: $font-family-base;
  color: $text-primary;
  background: $bg-primary;
  border: 1px solid $border-color;
  border-radius: $radius-md;
  resize: vertical;
  transition: border-color $transition-base, box-shadow $transition-base;
  
  &:focus {
    outline: none;
    border-color: $primary-color;
    box-shadow: 0 0 0 3px rgba($primary-color, 0.1);
  }
  
  &::placeholder {
    color: $text-light;
  }
}

.menu-item-form__select {
  width: 100%;
  padding: $spacing-sm $spacing-md;
  font-size: $font-size-base;
  color: $text-primary;
  background: $bg-primary;
  border: 1px solid $border-color;
  border-radius: $radius-md;
  cursor: pointer;
  transition: border-color $transition-base, box-shadow $transition-base;
  
  &:focus {
    outline: none;
    border-color: $primary-color;
    box-shadow: 0 0 0 3px rgba($primary-color, 0.1);
  }
}

.menu-item-form__field-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: $spacing-xs;
}

.menu-item-form__field-hint {
  display: block;
  margin-top: $spacing-xs;
  font-size: $font-size-xs;
  color: $text-secondary;
}

.menu-item-form__char-count {
  font-size: $font-size-xs;
  color: $text-light;
}

.menu-item-form__error {
  display: block;
  margin-top: $spacing-xs;
  font-size: $font-size-xs;
  color: $error-color;
}

.menu-item-form__checkbox-label {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
  font-size: $font-size-base;
  color: $text-primary;
  cursor: pointer;
}

.menu-item-form__checkbox {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.menu-item-form__image-preview {
  margin-top: $spacing-md;
  padding: $spacing-md;
  background: $bg-secondary;
  border: 1px solid $border-color;
  border-radius: $radius-md;
}

.menu-item-form__preview-image {
  width: 100%;
  max-width: 400px;
  height: auto;
  border-radius: $radius-md;
}

.menu-item-form__general-error {
  padding: $spacing-md;
  margin-bottom: $spacing-lg;
  font-size: $font-size-sm;
  color: $error-color;
  background: rgba($error-color, 0.1);
  border: 1px solid $error-color;
  border-radius: $radius-md;
}

.menu-item-form__actions {
  display: flex;
  justify-content: flex-end;
  gap: $spacing-md;
  padding-top: $spacing-xl;
}

.menu-item-form__button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: $spacing-sm;
  padding: $spacing-sm $spacing-xl;
  font-size: $font-size-base;
  font-weight: $font-weight-medium;
  border: none;
  border-radius: $radius-md;
  cursor: pointer;
  transition: all $transition-base;
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

.menu-item-form__button--secondary {
  color: $text-primary;
  background: $bg-secondary;
  border: 1px solid $border-color;
  
  &:hover:not(:disabled) {
    background: $bg-tertiary;
  }
}

.menu-item-form__button--primary {
  color: $text-white;
  background: $primary-color;
  
  &:hover:not(:disabled) {
    background: $primary-dark;
  }
}
</style>
