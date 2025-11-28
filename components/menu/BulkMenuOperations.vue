<template>
  <div class="bulk-menu-operations">
    <div class="bulk-menu-operations__header">
      <h3 class="bulk-menu-operations__title">Bulk Operations</h3>
      <p class="bulk-menu-operations__subtitle">
        {{ selectedCount }} item(s) selected
      </p>
    </div>

    <div class="bulk-menu-operations__actions">
      <button
        class="bulk-menu-operations__btn bulk-menu-operations__btn--activate"
        @click="showActivateDialog = true"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Activate
      </button>

      <button
        class="bulk-menu-operations__btn bulk-menu-operations__btn--deactivate"
        @click="showDeactivateDialog = true"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Deactivate
      </button>

      <button
        class="bulk-menu-operations__btn bulk-menu-operations__btn--price"
        @click="showPriceDialog = true"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Update Price
      </button>

      <button
        class="bulk-menu-operations__btn bulk-menu-operations__btn--category"
        @click="showCategoryDialog = true"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
        </svg>
        Change Category
      </button>
    </div>

    <!-- Activate Confirmation Dialog -->
    <div v-if="showActivateDialog" class="bulk-menu-operations__overlay" @click="showActivateDialog = false">
      <div class="bulk-menu-operations__dialog" @click.stop>
        <div class="bulk-menu-operations__dialog-header">
          <h4>Activate Items</h4>
          <button class="bulk-menu-operations__close" @click="showActivateDialog = false">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div class="bulk-menu-operations__dialog-body">
          <p>Are you sure you want to activate {{ selectedCount }} item(s)?</p>
          <p class="bulk-menu-operations__dialog-note">
            These items will become visible to customers.
          </p>
        </div>
        <div class="bulk-menu-operations__dialog-footer">
          <button
            class="bulk-menu-operations__dialog-btn bulk-menu-operations__dialog-btn--cancel"
            @click="showActivateDialog = false"
          >
            Cancel
          </button>
          <button
            class="bulk-menu-operations__dialog-btn bulk-menu-operations__dialog-btn--confirm"
            @click="handleActivate"
            :disabled="loading"
          >
            {{ loading ? 'Activating...' : 'Activate' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Deactivate Confirmation Dialog -->
    <div v-if="showDeactivateDialog" class="bulk-menu-operations__overlay" @click="showDeactivateDialog = false">
      <div class="bulk-menu-operations__dialog" @click.stop>
        <div class="bulk-menu-operations__dialog-header">
          <h4>Deactivate Items</h4>
          <button class="bulk-menu-operations__close" @click="showDeactivateDialog = false">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div class="bulk-menu-operations__dialog-body">
          <p>Are you sure you want to deactivate {{ selectedCount }} item(s)?</p>
          <p class="bulk-menu-operations__dialog-note">
            These items will be hidden from customers.
          </p>
        </div>
        <div class="bulk-menu-operations__dialog-footer">
          <button
            class="bulk-menu-operations__dialog-btn bulk-menu-operations__dialog-btn--cancel"
            @click="showDeactivateDialog = false"
          >
            Cancel
          </button>
          <button
            class="bulk-menu-operations__dialog-btn bulk-menu-operations__dialog-btn--confirm"
            @click="handleDeactivate"
            :disabled="loading"
          >
            {{ loading ? 'Deactivating...' : 'Deactivate' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Price Update Dialog -->
    <div v-if="showPriceDialog" class="bulk-menu-operations__overlay" @click="closePriceDialog">
      <div class="bulk-menu-operations__dialog" @click.stop>
        <div class="bulk-menu-operations__dialog-header">
          <h4>Update Price</h4>
          <button class="bulk-menu-operations__close" @click="closePriceDialog">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div class="bulk-menu-operations__dialog-body">
          <p>Update price for {{ selectedCount }} item(s)</p>
          
          <div class="bulk-menu-operations__form-group">
            <label class="bulk-menu-operations__label">Update Method</label>
            <select v-model="priceUpdateMethod" class="bulk-menu-operations__select">
              <option value="set">Set to specific price</option>
              <option value="increase">Increase by amount</option>
              <option value="decrease">Decrease by amount</option>
              <option value="percentage">Increase by percentage</option>
            </select>
          </div>

          <div class="bulk-menu-operations__form-group">
            <label class="bulk-menu-operations__label">
              {{ priceUpdateMethod === 'percentage' ? 'Percentage (%)' : 'Amount ($)' }}
            </label>
            <input
              v-model.number="priceValue"
              type="number"
              step="0.01"
              min="0"
              class="bulk-menu-operations__input"
              :placeholder="priceUpdateMethod === 'percentage' ? 'e.g., 10' : 'e.g., 2.50'"
            />
          </div>

          <p v-if="priceError" class="bulk-menu-operations__error">{{ priceError }}</p>
        </div>
        <div class="bulk-menu-operations__dialog-footer">
          <button
            class="bulk-menu-operations__dialog-btn bulk-menu-operations__dialog-btn--cancel"
            @click="closePriceDialog"
          >
            Cancel
          </button>
          <button
            class="bulk-menu-operations__dialog-btn bulk-menu-operations__dialog-btn--confirm"
            @click="handlePriceUpdate"
            :disabled="loading || !priceValue"
          >
            {{ loading ? 'Updating...' : 'Update Price' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Category Change Dialog -->
    <div v-if="showCategoryDialog" class="bulk-menu-operations__overlay" @click="closeCategoryDialog">
      <div class="bulk-menu-operations__dialog" @click.stop>
        <div class="bulk-menu-operations__dialog-header">
          <h4>Change Category</h4>
          <button class="bulk-menu-operations__close" @click="closeCategoryDialog">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div class="bulk-menu-operations__dialog-body">
          <p>Change category for {{ selectedCount }} item(s)</p>
          
          <div class="bulk-menu-operations__form-group">
            <label class="bulk-menu-operations__label">Select Category</label>
            <select v-model="selectedCategoryId" class="bulk-menu-operations__select">
              <option value="">No Category</option>
              <option v-for="category in categories" :key="category.id" :value="category.id">
                {{ category.name }}
              </option>
            </select>
          </div>

          <p v-if="categoryError" class="bulk-menu-operations__error">{{ categoryError }}</p>
        </div>
        <div class="bulk-menu-operations__dialog-footer">
          <button
            class="bulk-menu-operations__dialog-btn bulk-menu-operations__dialog-btn--cancel"
            @click="closeCategoryDialog"
          >
            Cancel
          </button>
          <button
            class="bulk-menu-operations__dialog-btn bulk-menu-operations__dialog-btn--confirm"
            @click="handleCategoryChange"
            :disabled="loading"
          >
            {{ loading ? 'Updating...' : 'Change Category' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useMenuStore } from '~/stores/menu'
import { useCategoryStore } from '~/stores/category'

const props = defineProps<{
  selectedCount: number
}>()

const emit = defineEmits<{
  (e: 'success', message: string): void
  (e: 'error', message: string): void
}>()

const menuStore = useMenuStore()
const categoryStore = useCategoryStore()

// State
const loading = ref(false)
const showActivateDialog = ref(false)
const showDeactivateDialog = ref(false)
const showPriceDialog = ref(false)
const showCategoryDialog = ref(false)

// Price update state
const priceUpdateMethod = ref<'set' | 'increase' | 'decrease' | 'percentage'>('set')
const priceValue = ref<number | null>(null)
const priceError = ref('')

// Category change state
const selectedCategoryId = ref('')
const categoryError = ref('')

// Computed
const categories = computed(() => categoryStore.categories)

/**
 * Handle activate
 */
const handleActivate = async () => {
  if (!menuStore.currentMenu) return

  loading.value = true
  try {
    const selectedIds = Array.from(menuStore.selectedItems)
    await menuStore.bulkUpdateItems(menuStore.currentMenu.id, selectedIds, { isActive: true })
    
    showActivateDialog.value = false
    emit('success', `Successfully activated ${selectedIds.length} item(s)`)
  } catch (error: any) {
    emit('error', error.message || 'Failed to activate items')
  } finally {
    loading.value = false
  }
}

/**
 * Handle deactivate
 */
const handleDeactivate = async () => {
  if (!menuStore.currentMenu) return

  loading.value = true
  try {
    const selectedIds = Array.from(menuStore.selectedItems)
    await menuStore.bulkUpdateItems(menuStore.currentMenu.id, selectedIds, { isActive: false })
    
    showDeactivateDialog.value = false
    emit('success', `Successfully deactivated ${selectedIds.length} item(s)`)
  } catch (error: any) {
    emit('error', error.message || 'Failed to deactivate items')
  } finally {
    loading.value = false
  }
}

/**
 * Handle price update
 */
const handlePriceUpdate = async () => {
  if (!menuStore.currentMenu || !priceValue.value) return

  // Validate price
  if (priceValue.value <= 0) {
    priceError.value = 'Price must be greater than 0'
    return
  }

  loading.value = true
  priceError.value = ''

  try {
    const selectedIds = Array.from(menuStore.selectedItems)
    await menuStore.bulkUpdatePrice(
      menuStore.currentMenu.id,
      selectedIds,
      priceUpdateMethod.value,
      priceValue.value
    )
    
    closePriceDialog()
    emit('success', `Successfully updated price for ${selectedIds.length} item(s)`)
  } catch (error: any) {
    priceError.value = error.message || 'Failed to update prices'
  } finally {
    loading.value = false
  }
}

/**
 * Handle category change
 */
const handleCategoryChange = async () => {
  if (!menuStore.currentMenu) return

  loading.value = true
  categoryError.value = ''

  try {
    const selectedIds = Array.from(menuStore.selectedItems)
    await menuStore.bulkUpdateItems(menuStore.currentMenu.id, selectedIds, {
      categoryId: selectedCategoryId.value || undefined
    })
    
    closeCategoryDialog()
    emit('success', `Successfully changed category for ${selectedIds.length} item(s)`)
  } catch (error: any) {
    categoryError.value = error.message || 'Failed to change category'
  } finally {
    loading.value = false
  }
}

/**
 * Close dialogs and reset state
 */
const closePriceDialog = () => {
  showPriceDialog.value = false
  priceValue.value = null
  priceError.value = ''
  priceUpdateMethod.value = 'set'
}

const closeCategoryDialog = () => {
  showCategoryDialog.value = false
  selectedCategoryId.value = ''
  categoryError.value = ''
}
</script>

<style scoped lang="scss">
@use './bulk-menu-operations';
</style>
