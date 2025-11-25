<template>
  <div class="category-list">
    <div v-if="loading" class="category-list__loading">
      <div class="category-list__spinner"></div>
      <p>Loading categories...</p>
    </div>

    <div v-else-if="error" class="category-list__error">
      <p>{{ error }}</p>
      <button @click="loadCategories" class="category-list__retry-btn">
        Retry
      </button>
    </div>

    <div v-else-if="sortedCategories.length === 0" class="category-list__empty">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
      </svg>
      <h3>No categories yet</h3>
      <p>Create your first category to organize your menu items</p>
    </div>

    <div v-else class="category-list__container">
      <draggable
        v-model="localCategories"
        item-key="id"
        handle=".category-card__drag-handle"
        @end="handleDragEnd"
        class="category-list__grid"
      >
        <template #item="{ element: category }">
          <div class="category-card">
            <div class="category-card__drag-handle">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8h16M4 16h16" />
              </svg>
            </div>

            <div class="category-card__content">
              <h3 class="category-card__name">{{ category.name }}</h3>
              <p v-if="category.description" class="category-card__description">
                {{ category.description }}
              </p>
              <div class="category-card__stats">
                <span class="category-card__stat">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  {{ (category as any).itemCount || 0 }} items
                </span>
                <span class="category-card__order">Order: {{ category.displayOrder }}</span>
              </div>
            </div>

            <div class="category-card__actions">
              <button
                @click="$emit('edit', category)"
                class="category-card__action-btn category-card__action-btn--edit"
                title="Edit category"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <button
                @click="$emit('delete', category)"
                class="category-card__action-btn category-card__action-btn--delete"
                title="Delete category"
                :disabled="(category as any).itemCount > 0"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        </template>
      </draggable>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import draggable from 'vuedraggable'
import { useCategoryStore } from '~/stores/category'
import type { Category } from '~/types'

const emit = defineEmits<{
  edit: [category: Category]
  delete: [category: Category]
}>()

const categoryStore = useCategoryStore()

const loading = computed(() => categoryStore.loading)
const error = computed(() => categoryStore.error)
const sortedCategories = computed(() => categoryStore.sortedCategories)

const localCategories = ref<Category[]>([])

// Sync local categories with store
watch(sortedCategories, (newCategories) => {
  localCategories.value = [...newCategories]
}, { immediate: true })

const loadCategories = async () => {
  try {
    await categoryStore.fetchCategories()
  } catch (error) {
    console.error('Failed to load categories:', error)
  }
}

const handleDragEnd = async () => {
  // Update display orders based on new positions
  const categoryOrders = localCategories.value.map((category, index) => ({
    id: category.id,
    displayOrder: index,
  }))

  try {
    await categoryStore.reorderCategories(categoryOrders)
  } catch (error) {
    console.error('Failed to reorder categories:', error)
    // Revert to original order on error
    localCategories.value = [...sortedCategories.value]
  }
}

// Load categories on mount
onMounted(() => {
  loadCategories()
})
</script>

<style scoped lang="scss">
@use './category-list';
</style>
