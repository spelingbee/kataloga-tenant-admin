<template>
  <form class="menu-item-form" @submit.prevent="handleSubmit">
    <div class="menu-item-form__section">
      <h2 class="menu-item-form__section-title">{{ t('menu.basicInfo') }}</h2>

      <div class="menu-item-form__field">
        <label for="name" class="menu-item-form__label">
          {{ t('common.name') }} <span class="menu-item-form__required">*</span>
        </label>
        <input
          id="name"
          v-model="formData.name"
          type="text"
          name="name"
          data-field="name"
          class="menu-item-form__input"
          :class="{ 'menu-item-form__input--error': form.getFieldError('name') }"
          :placeholder="t('menu.enterName')"
          maxlength="100"
          @blur="validateField('name')"
          @input="form.clearFieldError('name')"
        />
        <span v-if="form.getFieldError('name')" class="menu-item-form__error">
          {{ form.getFieldError('name') }}
        </span>
      </div>

      <div class="menu-item-form__field">
        <label for="description" class="menu-item-form__label">
          {{ t('common.description') }}
        </label>
        <textarea
          id="description"
          v-model="formData.description"
          name="description"
          data-field="description"
          class="menu-item-form__textarea"
          :class="{ 'menu-item-form__input--error': form.getFieldError('description') }"
          :placeholder="t('menu.enterDescription')"
          rows="4"
          maxlength="500"
          @blur="validateField('description')"
          @input="form.clearFieldError('description')"
        />
        <div class="menu-item-form__field-info">
          <span v-if="form.getFieldError('description')" class="menu-item-form__error">
            {{ form.getFieldError('description') }}
          </span>
          <span class="menu-item-form__char-count">
            {{ formData.description?.length || 0 }}/500
          </span>
        </div>
      </div>

      <div class="menu-item-form__row">
        <div class="menu-item-form__field">
          <label for="price" class="menu-item-form__label">
            {{ t('common.price') }} <span class="menu-item-form__required">*</span>
          </label>
          <div class="menu-item-form__input-group">
            <span class="menu-item-form__input-prefix">{{ suffix }}</span>
            <input
              id="price"
              v-model="formData.price"
              type="number"
              step="0.01"
              min="0.01"
              max="999999.99"
              name="price"
              data-field="price"
              class="menu-item-form__input menu-item-form__input--with-prefix"
              :class="{ 'menu-item-form__input--error': form.getFieldError('price') }"
              placeholder="0.00"
              @blur="validateField('price')"
              @input="form.clearFieldError('price')"
            />
          </div>
          <span v-if="form.getFieldError('price')" class="menu-item-form__error">
            {{ form.getFieldError('price') }}
          </span>
        </div>

        <div class="menu-item-form__field">
          <label for="categoryId" class="menu-item-form__label">
            {{ t('common.category') }}
          </label>
          <select
            id="categoryId"
            v-model="formData.categoryId"
            name="categoryId"
            data-field="categoryId"
            class="menu-item-form__select"
            :class="{ 'menu-item-form__select--error': form.getFieldError('categoryId') }"
            @blur="validateField('categoryId')"
            @change="form.clearFieldError('categoryId')"
          >
            <option value="">{{ t('menu.selectCategory') }}</option>
            <option
              v-for="category in categories"
              :key="category.id"
              :value="category.id"
            >
              {{ category.name }}
            </option>
          </select>
          <span v-if="form.getFieldError('categoryId')" class="menu-item-form__error">
            {{ form.getFieldError('categoryId') }}
          </span>
        </div>
      </div>

      <div class="menu-item-form__field">
        <label for="allergens" class="menu-item-form__label">
          {{ t('menu.allergens') }}
        </label>
        <input
          id="allergens"
          v-model="formData.allergens"
          type="text"
          class="menu-item-form__input"
          :placeholder="t('menu.allergensPlaceholder')"
        />
        <span class="menu-item-form__field-hint">
          {{ t('menu.allergensHelp') }}
        </span>
      </div>
    </div>

    <div class="menu-item-form__section">
      <h2 class="menu-item-form__section-title">{{ t('common.image') }}</h2>

      <div class="menu-item-form__field">
        <label for="imageUrl" class="menu-item-form__label">
          {{ t('menu.imageUrl') }}
        </label>
        <div class="menu-item-form__image-input-group">
          <input
            id="imageUrl"
            v-model="formData.imageUrl"
            type="url"
            name="imageUrl"
            data-field="imageUrl"
            class="menu-item-form__input"
            :class="{ 'menu-item-form__input--error': form.getFieldError('imageUrl') }"
            placeholder="https://example.com/image.jpg"
            @blur="validateField('imageUrl')"
            @input="form.clearFieldError('imageUrl')"
          />
          <div class="menu-item-form__upload-wrapper">
            <button 
              type="button" 
              class="menu-item-form__upload-btn"
              :disabled="isUploading"
              @click="triggerFileUpload"
            >
              <svg v-if="!isUploading" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="btn-icon">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              <span v-if="isUploading">{{ t('common.loading') }}</span>
              <span v-else>{{ t('common.upload') }}</span>
            </button>
            <input
              ref="fileInput"
              type="file"
              accept="image/*"
              class="menu-item-form__hidden-file"
              @change="handleFileUpload"
            />
          </div>
        </div>
        <span v-if="form.getFieldError('imageUrl')" class="menu-item-form__error">
          {{ form.getFieldError('imageUrl') }}
        </span>
        <span class="menu-item-form__field-hint">
          {{ t('menu.imageFormats') }}
        </span>
      </div>

      <div v-if="formData.imageUrl" class="menu-item-form__image-preview">
        <img
          :src="mediaService.resolveImageUrl(formData.imageUrl)"
          :alt="formData.name || 'Menu item preview'"
          class="menu-item-form__image"
          @error="handleImageError"
        />
      </div>
    </div>

    <div class="menu-item-form__section">
      <h2 class="menu-item-form__section-title">{{ t('menu.availability') }}</h2>

      <div class="menu-item-form__field">
        <label class="menu-item-form__checkbox-label">
          <input
            v-model="formData.isActive"
            type="checkbox"
            class="menu-item-form__checkbox"
          />
          <span>{{ t('menu.availabilityHelp') }}</span>
        </label>
      </div>
    </div>

    <div v-if="form.globalErrors.value.length > 0" class="menu-item-form__general-error">
      <div v-for="error in form.globalErrors.value" :key="error">
        {{ error }}
      </div>
    </div>

    <div class="menu-item-form__actions">
      <button
        type="button"
        class="menu-item-form__btn menu-item-form__btn--secondary"
        @click="$emit('cancel')"
        :disabled="loading"
      >
        {{ t('common.cancel') }}
      </button>
      <button
        type="submit"
        class="menu-item-form__btn menu-item-form__btn--primary"
        :disabled="loading || !isFormValid"
      >
        <LoadingSpinner v-if="loading" size="sm" />
        <span v-else>{{ submitLabel }}</span>
      </button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useEnhancedApiForm } from '~/composables/useEnhancedApiForm'
import { useCurrency } from '~/composables/useCurrency'
import { useMediaService } from '~/services/media.service'
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

const { t } = useI18n()
const { suffix } = useCurrency()
const mediaService = useMediaService()
const form = useEnhancedApiForm()
const categoryStore = useCategoryStore()

const fileInput = ref<HTMLInputElement | null>(null)
const isUploading = ref(false)

const formData = ref<Partial<MenuItem>>({
  name: '',
  description: '',
  price: undefined,
  imageUrl: '',
  allergens: '',
  categoryId: '',
  isActive: true,
})

const categories = computed(() => categoryStore.sortedCategories)

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

onMounted(async () => {
  try {
    await categoryStore.fetchCategories()
  } catch (error) {
    console.error('Failed to load categories:', error)
  }
})

const triggerFileUpload = () => {
  fileInput.value?.click()
}

const handleFileUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  isUploading.value = true
  try {
    const imageUrl = await mediaService.uploadImage(file)
    formData.value.imageUrl = imageUrl
    form.clearFieldError('imageUrl')
  } catch (error) {
    console.error('Upload failed:', error)
  } finally {
    isUploading.value = false
    target.value = ''
  }
}

const validateField = (field: string): boolean => {
  form.clearFieldError(field)
  switch (field) {
    case 'name':
      if (!formData.value.name || formData.value.name.trim().length === 0) return false
      if (formData.value.name.length > 100) return false
      break
    case 'description':
      if (formData.value.description && formData.value.description.length > 500) return false
      break
    case 'price':
      if (!formData.value.price) return false
      const price = Number(formData.value.price)
      if (isNaN(price) || price < 0.01 || price > 999999.99) return false
      break
    case 'imageUrl':
      if (formData.value.imageUrl) {
        // Allow absolute URLs or relative paths starting with /
        const urlPattern = /^(https?:\/\/|\/)/
        if (!urlPattern.test(formData.value.imageUrl)) return false
      }
      break
  }
  return true
}

const validateForm = (): boolean => {
  const fields = ['name', 'price', 'description', 'imageUrl']
  return fields.every(validateField)
}

const isFormValid = computed(() => {
  return (
    formData.value.name &&
    formData.value.name.trim().length > 0 &&
    formData.value.price &&
    Number(formData.value.price) >= 0.01 &&
    !form.hasErrors.value
  )
})

const handleSubmit = () => {
  form.clearAllErrors()
  if (!validateForm()) return

  const submitData: Partial<MenuItem> = {
    name: formData.value.name?.trim(),
    description: formData.value.description?.trim() || undefined,
    price: Number(formData.value.price),
    imageUrl: formData.value.imageUrl?.trim() || undefined,
    allergens: formData.value.allergens?.trim() || undefined,
    categoryId: formData.value.categoryId ? formData.value.categoryId : undefined,
    isActive: formData.value.isActive,
  }
  emit('submit', submitData)
}

const handleImageError = () => {
  // If image fails to load, maybe show a toast or just a placeholder
  console.warn('Image failed to load')
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
  padding-left: $spacing-3xl;
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

.menu-item-form__image-input-group {
  display: flex;
  gap: $spacing-md;
  
  .menu-item-form__input {
    flex: 1;
  }
}

.menu-item-form__upload-wrapper {
  position: relative;
}

.menu-item-form__upload-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: $spacing-sm;
  padding: $spacing-sm $spacing-lg;
  font-size: $font-size-sm;
  font-weight: $font-weight-medium;
  color: $text-primary;
  background: $bg-tertiary;
  border: 1px solid $border-color;
  border-radius: $radius-md;
  cursor: pointer;
  white-space: nowrap;
  transition: all $transition-base;
  
  .btn-icon {
    width: 16px;
    height: 16px;
  }
  
  &:hover:not(:disabled) {
    background: $bg-primary;
    border-color: $primary-color;
    color: $primary-color;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

.menu-item-form__hidden-file {
  position: absolute;
  top: 0;
  left: 0;
  width: 0;
  height: 0;
  opacity: 0;
  visibility: hidden;
  pointer-events: none;
}

.menu-item-form__actions {
  display: flex;
  justify-content: flex-end;
  gap: $spacing-md;
  padding-top: $spacing-xl;
  border-top: 1px solid $border-color;
  margin-top: $spacing-xl;
}

.menu-item-form__btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: $spacing-sm;
  padding: $spacing-md $spacing-2xl;
  font-size: $font-size-base;
  font-weight: $font-weight-semibold;
  border-radius: $radius-md;
  cursor: pointer;
  transition: all $transition-base;
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

.menu-item-form__btn--secondary {
  color: $text-secondary;
  background: $bg-tertiary;
  border: 1px solid $border-color;
  
  &:hover:not(:disabled) {
    background: $bg-primary;
    color: $text-primary;
    border-color: $text-light;
  }
}

.menu-item-form__btn--primary {
  color: $text-white;
  background: $primary-color;
  border: 1px solid $primary-dark;
  box-shadow: 0 2px 4px rgba($primary-color, 0.2);
  
  &:hover:not(:disabled) {
    background: $primary-dark;
    transform: translateY(-1px);
    box-shadow: 0 4px 6px rgba($primary-color, 0.3);
  }
  
  &:active:not(:disabled) {
    transform: translateY(0);
  }
}
</style>
