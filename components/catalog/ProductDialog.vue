<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { Product } from '~/types/business'
import { useEnhancedMenuStore } from '~/stores/enhanced-menu'
import { useCategoryStore } from '~/stores/category'

const props = defineProps<{
  modelValue: boolean
  product?: Product | null
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'saved', product: Product): void
}>()

const { t } = useI18n()
const menuStore = useEnhancedMenuStore()
const categoryStore = useCategoryStore()

const isNew = computed(() => !props.product)

const formData = ref({
  name: '',
  basePrice: 0,
  description: '',
  imageUrl: '',
  categoryId: '',
  inStock: true,
  type: 'PHYSICAL' as const
})

const resetForm = () => {
  if (props.product) {
    formData.value = {
      name: props.product.name,
      basePrice: props.product.basePrice,
      description: '', // Products themselves don't have descriptions in current schema, but we can add it if needed
      imageUrl: props.product.imageUrl || '',
      categoryId: props.product.categoryId || '',
      inStock: props.product.inStock,
      type: props.product.type
    }
  } else {
    formData.value = {
      name: '',
      basePrice: 0,
      description: '',
      imageUrl: '',
      categoryId: '',
      inStock: true,
      type: 'PHYSICAL'
    }
  }
}

watch(() => props.modelValue, (val) => {
  if (val) {
    resetForm()
    if (categoryStore.categories.length === 0) {
      categoryStore.fetchCategories()
    }
  }
})

const handleClose = () => {
  emit('update:modelValue', false)
}

const isSubmitting = ref(false)
const error = ref<string | null>(null)

const handleSubmit = async () => {
  isSubmitting.value = true
  error.ref = null
  
  try {
    let savedProduct: Product
    if (isNew.value) {
      savedProduct = await menuStore.createCatalogProduct(formData.value)
    } else {
      savedProduct = await menuStore.updateCatalogProduct(props.product!.id, formData.value)
    }
    emit('saved', savedProduct)
    handleClose()
  } catch (err: any) {
    error.value = err.message || 'Ошибка при сохранении товара'
  } finally {
    isSubmitting.value = false
  }
}

const handleImageUploaded = (url: string) => {
  formData.value.imageUrl = url
}

// Utility for image display
const { $api } = useNuxtApp()
const resolveImageUrl = (path?: string) => {
  if (!path) return ''
  if (path.startsWith('http')) return path
  return `${$api.defaults.baseURL.replace('/api', '')}${path}`
}
</script>

<template>
  <FormDialog
    :model-value="modelValue"
    @update:model-value="emit('update:modelValue', $event)"
    :title="isNew ? t('catalog.addProduct') : t('common.edit')"
    :loading="isSubmitting"
    @confirm="handleSubmit"
    @cancel="handleClose"
    size="md"
  >
    <div class="product-form">
      <div v-if="error" class="product-form__error">
        {{ error }}
      </div>

      <div class="product-form__grid">
        <!-- Image Section -->
        <div class="product-form__image-section">
          <ImageUpload
            :model-value="formData.imageUrl"
            @update:model-value="handleImageUploaded"
            :preview-url="resolveImageUrl(formData.imageUrl)"
            folder="products"
          />
        </div>

        <!-- Details Section -->
        <div class="product-form__details">
          <div class="form-group">
            <label>{{ t('common.name') }}</label>
            <input 
              v-model="formData.name" 
              type="text" 
              class="form-input" 
              :placeholder="t('menu.enterName')"
              required
            >
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>{{ t('common.price') }} ({{ t('common.base') }})</label>
              <input 
                v-model.number="formData.basePrice" 
                type="number" 
                step="0.01" 
                class="form-input"
                required
              >
            </div>

            <div class="form-group">
              <label>{{ t('common.category') }}</label>
              <select v-model="formData.categoryId" class="form-select">
                <option value="">{{ t('menu.uncategorized') }}</option>
                <option 
                  v-for="cat in categoryStore.categories" 
                  :key="cat.id" 
                  :value="cat.id"
                >
                  {{ cat.name }}
                </option>
              </select>
            </div>
          </div>

          <div class="form-group">
            <label class="checkbox-label">
              <input v-model="formData.inStock" type="checkbox" class="form-checkbox">
              <span>{{ t('common.inStock') || 'В наличии' }}</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  </FormDialog>
</template>

<style scoped>
.product-form {
  padding: 0.5rem;
}

.product-form__grid {
  display: grid;
  grid-template-columns: 200px 1fr;
  gap: 1.5rem;
}

@media (max-width: 640px) {
  .product-form__grid {
    grid-template-columns: 1fr;
  }
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-secondary);
  margin-bottom: 0.5rem;
}

.form-input, .form-select {
  width: 100%;
  padding: 0.625rem;
  border: 1px solid var(--border-color);
  border-radius: 0.5rem;
  background: var(--bg-surface);
  color: var(--text-primary);
  font-size: 0.9375rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  user-select: none;
}

.form-checkbox {
  width: 1rem;
  height: 1rem;
  accent-color: var(--primary-color);
}

.product-form__error {
  padding: 0.75rem;
  border-radius: 0.5rem;
  background: var(--error-bg);
  color: var(--error-text);
  margin-bottom: 1.5rem;
  font-size: 0.875rem;
}
</style>
