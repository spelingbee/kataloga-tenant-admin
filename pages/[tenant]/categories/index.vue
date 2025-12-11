<template>
  <div class="categories-page">
    <div class="categories-page__header">
      <div>
        <h1 class="categories-page__title">Category Management</h1>
        <p class="categories-page__subtitle">
          Organize your menu items with categories. Drag and drop to reorder.
        </p>
      </div>
      <button class="categories-page__add-btn" @click="openCreateModal">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        Add Category
      </button>
    </div>

    <div v-if="categoryStore.sortedCategories.length > 0" class="categories-page__stats">
      <div class="stat-card">
        <div class="stat-card__icon stat-card__icon--primary">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
          </svg>
        </div>
        <div class="stat-card__content">
          <p class="stat-card__label">Total Categories</p>
          <p class="stat-card__value">{{ categoryStore.sortedCategories.length }}</p>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-card__icon stat-card__icon--success">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <div class="stat-card__content">
          <p class="stat-card__label">Total Items</p>
          <p class="stat-card__value">{{ totalItems }}</p>
        </div>
      </div>
    </div>

    <CategoryList
      @edit="openEditModal"
      @delete="openDeleteModal"
    />

    <!-- Create/Edit Modal -->
    <div v-if="showFormModal" class="modal-overlay" @click.self="closeFormModal">
      <CategoryForm
        :category="selectedCategory"
        @close="closeFormModal"
        @submit="handleFormSubmit"
      />
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="modal-overlay" @click.self="closeDeleteModal">
      <div class="delete-modal">
        <div class="delete-modal__header">
          <h2 class="delete-modal__title">Delete Category</h2>
          <button
            @click="closeDeleteModal"
            class="delete-modal__close-btn"
            type="button"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div class="delete-modal__content">
          <div class="delete-modal__icon">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <p class="delete-modal__message">
            Are you sure you want to delete the category
            <strong>"{{ selectedCategory?.name }}"</strong>?
          </p>
          <p v-if="(selectedCategory as any)?.itemCount > 0" class="delete-modal__warning">
            This category has {{ (selectedCategory as any).itemCount }} menu items.
            You cannot delete a category with items.
          </p>
          <p v-else class="delete-modal__info">
            This action cannot be undone.
          </p>
        </div>

        <div class="delete-modal__actions">
          <button
            type="button"
            @click="closeDeleteModal"
            class="delete-modal__btn delete-modal__btn--cancel"
            :disabled="deleting"
          >
            Cancel
          </button>
          <button
            type="button"
            @click="handleDelete"
            class="delete-modal__btn delete-modal__btn--delete"
            :disabled="deleting || (selectedCategory as any)?.itemCount > 0"
          >
            <span v-if="deleting" class="delete-modal__spinner"></span>
            {{ deleting ? 'Deleting...' : 'Delete Category' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Toast Notification -->
    <div v-if="toast.show" class="toast" :class="`toast--${toast.type}`">
      <svg v-if="toast.type === 'success'" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
      </svg>
      <svg v-else xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
      </svg>
      <span>{{ toast.message }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useCategoryStore } from '~/stores/category'
import CategoryList from '~/components/category/CategoryList.vue'
import CategoryForm from '~/components/category/CategoryForm.vue'
import type { Category } from '~/types'

definePageMeta({
  middleware: ['auth']
})

const categoryStore = useCategoryStore()

const showFormModal = ref(false)
const showDeleteModal = ref(false)
const selectedCategory = ref<Category | null>(null)
const deleting = ref(false)

const toast = ref({
  show: false,
  message: '',
  type: 'success' as 'success' | 'error',
})

const totalItems = computed(() => {
  return categoryStore.sortedCategories.reduce((sum, cat) => {
    return sum + ((cat as any).itemCount || 0)
  }, 0)
})

const openCreateModal = () => {
  selectedCategory.value = null
  showFormModal.value = true
}

const openEditModal = (category: Category) => {
  selectedCategory.value = category
  showFormModal.value = true
}

const closeFormModal = () => {
  showFormModal.value = false
  selectedCategory.value = null
}

const openDeleteModal = (category: Category) => {
  selectedCategory.value = category
  showDeleteModal.value = true
}

const closeDeleteModal = () => {
  showDeleteModal.value = false
  selectedCategory.value = null
}

const handleFormSubmit = async (data: { name: string; description?: string }) => {
  try {
    if (selectedCategory.value) {
      // Update existing category
      await categoryStore.updateCategory(selectedCategory.value.id, data)
      showToast('Category updated successfully', 'success')
    } else {
      // Create new category
      await categoryStore.createCategory(data)
      showToast('Category created successfully', 'success')
    }
    closeFormModal()
  } catch (error: any) {
    showToast(error.message || 'Failed to save category', 'error')
  }
}

const handleDelete = async () => {
  if (!selectedCategory.value) return

  deleting.value = true
  try {
    await categoryStore.deleteCategory(selectedCategory.value.id)
    showToast('Category deleted successfully', 'success')
    closeDeleteModal()
  } catch (error: any) {
    showToast(error.message || 'Failed to delete category', 'error')
  } finally {
    deleting.value = false
  }
}

const showToast = (message: string, type: 'success' | 'error') => {
  toast.value = { show: true, message, type }
  setTimeout(() => {
    toast.value.show = false
  }, 3000)
}
</script>

<style scoped lang="scss">
@use '@/assets/scss/variables' as *;

.categories-page {
  padding: $spacing-xl;
  min-height: 100vh;
  background: $bg-secondary;
}

.categories-page__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: $spacing-xl;
}

.categories-page__title {
  margin: 0 0 $spacing-xs 0;
  font-size: $font-size-3xl;
  font-weight: $font-weight-bold;
  color: $text-primary;
}

.categories-page__subtitle {
  margin: 0;
  font-size: $font-size-lg;
  color: $text-secondary;
}

.categories-page__add-btn {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
  padding: $spacing-sm $spacing-lg;
  font-size: $font-size-base;
  font-weight: $font-weight-medium;
  color: $text-white;
  background: $primary-color;
  border: none;
  border-radius: $radius-md;
  cursor: pointer;
  transition: background $transition-base;
  
  svg {
    width: 20px;
    height: 20px;
  }
  
  &:hover {
    background: $primary-dark;
  }
}

.categories-page__stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: $spacing-lg;
  margin-bottom: $spacing-xl;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: $spacing-md;
  padding: $spacing-lg;
  background: $bg-primary;
  border: 1px solid $border-color;
  border-radius: $radius-lg;
}

.stat-card__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: $radius-lg;
  
  svg {
    width: 24px;
    height: 24px;
  }
}

.stat-card__icon--primary {
  background: rgba($primary-color, 0.1);
  color: $primary-color;
}

.stat-card__icon--success {
  background: rgba($success-color, 0.1);
  color: $success-color;
}

.stat-card__content {
  flex: 1;
}

.stat-card__label {
  margin: 0 0 $spacing-xs 0;
  font-size: $font-size-sm;
  color: $text-secondary;
}

.stat-card__value {
  margin: 0;
  font-size: $font-size-2xl;
  font-weight: $font-weight-bold;
  color: $text-primary;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: $z-modal-backdrop;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: $spacing-lg;
  background: $bg-overlay;
}

.delete-modal {
  width: 100%;
  max-width: 500px;
  background: $bg-primary;
  border-radius: $radius-lg;
  box-shadow: $shadow-xl;
}

.delete-modal__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: $spacing-lg $spacing-xl;
  border-bottom: 1px solid $border-color;
}

.delete-modal__title {
  margin: 0;
  font-size: $font-size-2xl;
  font-weight: $font-weight-semibold;
  color: $text-primary;
}

.delete-modal__close-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 0;
  background: transparent;
  border: none;
  border-radius: $radius-md;
  color: $text-secondary;
  cursor: pointer;
  transition: all $transition-base;
  
  svg {
    width: 20px;
    height: 20px;
  }
  
  &:hover {
    background: $bg-secondary;
    color: $text-primary;
  }
}

.delete-modal__content {
  padding: $spacing-xl;
  text-align: center;
}

.delete-modal__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  margin: 0 auto $spacing-lg;
  background: rgba($error-color, 0.1);
  border-radius: $radius-full;
  color: $error-color;
  
  svg {
    width: 32px;
    height: 32px;
  }
}

.delete-modal__message {
  margin: 0 0 $spacing-md 0;
  font-size: $font-size-lg;
  color: $text-primary;
  
  strong {
    color: $error-color;
  }
}

.delete-modal__warning {
  margin: 0;
  padding: $spacing-md;
  font-size: $font-size-sm;
  color: $error-color;
  background: rgba($error-color, 0.1);
  border: 1px solid rgba($error-color, 0.3);
  border-radius: $radius-md;
}

.delete-modal__info {
  margin: 0;
  font-size: $font-size-sm;
  color: $text-secondary;
}

.delete-modal__actions {
  display: flex;
  gap: $spacing-md;
  justify-content: flex-end;
  padding: $spacing-lg $spacing-xl;
  border-top: 1px solid $border-color;
}

.delete-modal__btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: $spacing-sm;
  padding: $spacing-sm $spacing-lg;
  font-size: $font-size-base;
  font-weight: $font-weight-medium;
  border: none;
  border-radius: $radius-md;
  cursor: pointer;
  transition: all $transition-base;
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
}

.delete-modal__btn--cancel {
  color: $text-primary;
  background: $bg-secondary;
  border: 1px solid $border-color;
  
  &:hover {
    background: $bg-tertiary;
  }
  
  &:disabled {
    &:hover {
      background: $bg-secondary;
    }
  }
}

.delete-modal__btn--delete {
  color: $text-white;
  background: $error-color;
  
  &:hover {
    background: darken($error-color, 10%);
  }
  
  &:disabled {
    &:hover {
      background: $error-color;
    }
  }
}

.delete-modal__spinner {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid rgba($text-white, 0.3);
  border-top-color: $text-white;
  border-radius: $radius-full;
  animation: spin 0.6s linear infinite;
}

.toast {
  position: fixed;
  bottom: $spacing-xl;
  right: $spacing-xl;
  z-index: $z-tooltip;
  display: flex;
  align-items: center;
  gap: $spacing-sm;
  padding: $spacing-md $spacing-lg;
  background: $bg-primary;
  border-radius: $radius-lg;
  box-shadow: $shadow-xl;
  animation: slideIn 0.3s ease-out;
  
  svg {
    width: 20px;
    height: 20px;
  }
  
  span {
    font-size: $font-size-base;
    font-weight: $font-weight-medium;
  }
}

.toast--success {
  border-left: 4px solid $success-color;
  color: $success-color;
}

.toast--error {
  border-left: 4px solid $error-color;
  color: $error-color;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: $breakpoint-md) {
  .categories-page {
    padding: $spacing-lg;
  }
  
  .categories-page__header {
    flex-direction: column;
    align-items: flex-start;
    gap: $spacing-md;
  }
  
  .categories-page__add-btn {
    width: 100%;
    justify-content: center;
  }
  
  .categories-page__stats {
    grid-template-columns: 1fr;
  }
}
</style>
