<template>
  <div class="menu-item-list">
    <!-- Toast Notifications -->
    <div v-if="successMessage" class="menu-item-list__toast menu-item-list__toast--success">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <span>{{ successMessage }}</span>
    </div>

    <div v-if="errorMessage" class="menu-item-list__toast menu-item-list__toast--error">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <span>{{ errorMessage }}</span>
    </div>

    <!-- Filters and Search -->
    <div class="menu-item-list__filters">
      <div class="menu-item-list__search">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search menu items..."
          class="menu-item-list__search-input"
          @input="debouncedSearch"
        />
      </div>

      <div class="menu-item-list__filter-row">
        <select v-model="filters.categoryId" class="menu-item-list__select" @change="applyFilters">
          <option value="">All Categories</option>
          <option v-for="category in categories" :key="category.id" :value="category.id">
            {{ category.name }}
          </option>
        </select>

        <select v-model="filters.isActive" class="menu-item-list__select" @change="applyFilters">
          <option value="">All Status</option>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>

        <div class="menu-item-list__price-filter">
          <input
            v-model.number="filters.minPrice"
            type="number"
            placeholder="Min Price"
            class="menu-item-list__price-input"
            @change="applyFilters"
          />
          <span>-</span>
          <input
            v-model.number="filters.maxPrice"
            type="number"
            placeholder="Max Price"
            class="menu-item-list__price-input"
            @change="applyFilters"
          />
        </div>

        <button class="menu-item-list__clear-btn" @click="clearFilters">
          Clear Filters
        </button>
      </div>
    </div>

    <!-- Bulk Actions Bar -->
    <div v-if="hasSelectedItems" class="menu-item-list__bulk-actions">
      <div class="menu-item-list__bulk-info">
        <span>{{ selectedItemsCount }} item(s) selected</span>
        <button class="menu-item-list__clear-selection" @click="clearSelection">
          Clear Selection
        </button>
      </div>
      <div class="menu-item-list__bulk-buttons">
        <button
          v-if="hasMultiLocation"
          class="bulk-action-btn bulk-action-btn--location"
          @click="showLocationMatrix = true"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Manage Locations
        </button>
        <button class="bulk-action-btn bulk-action-btn--operations" @click="showBulkOperations = true">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
          Bulk Operations
        </button>
      </div>
    </div>

    <!-- Bulk Operations Modal -->
    <div v-if="showBulkOperations" class="menu-item-list__modal-overlay" @click="closeBulkOperations">
      <div class="menu-item-list__modal menu-item-list__modal--wide" @click.stop>
        <div class="menu-item-list__modal-header">
          <h2>Bulk Operations</h2>
          <button class="menu-item-list__modal-close" @click="closeBulkOperations">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div class="menu-item-list__modal-content">
          <BulkMenuOperations
            :selected-count="selectedItemsCount"
            @success="handleBulkSuccess"
            @error="handleBulkError"
          />
        </div>
      </div>
    </div>

    <!-- Location Availability Matrix Modal -->
    <div v-if="showLocationMatrix" class="menu-item-list__modal-overlay" @click="closeLocationMatrix">
      <div class="menu-item-list__modal" @click.stop>
        <div class="menu-item-list__modal-header">
          <h2>Manage Location Availability</h2>
          <button class="menu-item-list__modal-close" @click="closeLocationMatrix">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div class="menu-item-list__modal-content">
          <LocationAvailabilityMatrix
            :items="selectedMenuItems"
            @update="handleLocationUpdate"
          />
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="menu-item-list__loading">
      <div class="loading-spinner" />
      <p>Loading menu items...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="menu-item-list__error">
      <p>{{ error }}</p>
      <button @click="loadMenuItems">Retry</button>
    </div>

    <!-- Empty State -->
    <div v-else-if="menuItems.length === 0" class="menu-item-list__empty">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      <h3>No menu items found</h3>
      <p>Get started by adding your first menu item</p>
      <button class="menu-item-list__add-btn" @click="handleAddItem">
        Add Menu Item
      </button>
    </div>

    <!-- Menu Items Table -->
    <div v-else class="menu-item-list__table-container">
      <table class="menu-item-list__table">
        <thead class="menu-item-list__thead">
          <tr>
            <th class="menu-item-list__th menu-item-list__th--checkbox">
              <input
                type="checkbox"
                :checked="isAllSelected"
                @change="toggleSelectAll"
              />
            </th>
            <th class="menu-item-list__th">Image</th>
            <th class="menu-item-list__th">Name</th>
            <th class="menu-item-list__th">Category</th>
            <th class="menu-item-list__th">Price</th>
            <th class="menu-item-list__th">Status</th>
            <th class="menu-item-list__th">Actions</th>
          </tr>
        </thead>
        <tbody class="menu-item-list__tbody">
          <tr
            v-for="item in menuItems"
            :key="item.id"
            class="menu-item-list__row"
            :class="{ 'menu-item-list__row--selected': isItemSelected(item.id) }"
          >
            <td class="menu-item-list__td menu-item-list__td--checkbox">
              <input
                type="checkbox"
                :checked="isItemSelected(item.id)"
                @change="toggleItemSelection(item.id)"
              />
            </td>
            <td class="menu-item-list__td">
              <div class="menu-item-list__image">
                <img v-if="item.imageUrl" :src="item.imageUrl" :alt="item.name" />
                <div v-else class="menu-item-list__image-placeholder">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
            </td>
            <td class="menu-item-list__td">
              <div class="menu-item-list__name">
                {{ item.name }}
                <span v-if="item.description" class="menu-item-list__description">
                  {{ truncateText(item.description, 50) }}
                </span>
              </div>
            </td>
            <td class="menu-item-list__td">
              <span v-if="item.category" class="menu-item-list__category">
                {{ item.category.name }}
              </span>
              <span v-else class="menu-item-list__category menu-item-list__category--uncategorized">
                Uncategorized
              </span>
            </td>
            <td class="menu-item-list__td">
              <span class="menu-item-list__price">${{ item.price.toFixed(2) }}</span>
            </td>
            <td class="menu-item-list__td">
              <span
                class="menu-item-list__status"
                :class="item.isActive ? 'menu-item-list__status--active' : 'menu-item-list__status--inactive'"
              >
                {{ item.isActive ? 'Active' : 'Inactive' }}
              </span>
            </td>
            <td class="menu-item-list__td">
              <div class="menu-item-list__actions">
                <button
                  class="action-btn action-btn--edit"
                  title="Edit"
                  @click="editItem(item.id)"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button
                  class="action-btn action-btn--delete"
                  title="Delete"
                  @click="deleteItem(item.id)"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div v-if="totalPages > 1" class="menu-item-list__pagination">
      <button
        class="pagination-btn"
        :disabled="currentPage === 1"
        @click="goToPage(currentPage - 1)"
      >
        Previous
      </button>
      
      <div class="pagination-pages">
        <button
          v-for="page in visiblePages"
          :key="page"
          class="pagination-page"
          :class="{ 'pagination-page--active': page === currentPage }"
          @click="goToPage(page)"
        >
          {{ page }}
        </button>
      </div>
      
      <button
        class="pagination-btn"
        :disabled="currentPage === totalPages"
        @click="goToPage(currentPage + 1)"
      >
        Next
      </button>
      
      <div class="pagination-info">
        <span>Page {{ currentPage }} of {{ totalPages }}</span>
        <span>{{ totalItems }} total items</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useMenuStore } from '~/stores/menu'
import { useCategoryStore } from '~/stores/category'
import { useFeatureAccess } from '~/composables/useFeatureAccess'
import LocationAvailabilityMatrix from './LocationAvailabilityMatrix.vue'
import BulkMenuOperations from './BulkMenuOperations.vue'

const menuStore = useMenuStore()
const categoryStore = useCategoryStore()
const router = useRouter()
const { hasMultiLocation } = useFeatureAccess()

// State
const searchQuery = ref('')
const showLocationMatrix = ref(false)
const showBulkOperations = ref(false)
const successMessage = ref('')
const errorMessage = ref('')
const filters = ref({
  categoryId: '',
  isActive: '',
  minPrice: undefined as number | undefined,
  maxPrice: undefined as number | undefined,
})

// Computed
const loading = computed(() => menuStore.loading)
const error = computed(() => menuStore.error)
const menuItems = computed(() => menuStore.menuItems)
const totalItems = computed(() => menuStore.totalItems)
const currentPage = computed(() => menuStore.currentPage)
const totalPages = computed(() => menuStore.totalPages)
const hasSelectedItems = computed(() => menuStore.hasSelectedItems)
const selectedItemsCount = computed(() => menuStore.selectedItemsCount)
const categories = computed(() => categoryStore.categories)

const isAllSelected = computed(() => {
  return menuItems.value.length > 0 && 
    menuItems.value.every(item => menuStore.isItemSelected(item.id))
})

const visiblePages = computed(() => {
  const pages: number[] = []
  const maxVisible = 5
  let start = Math.max(1, currentPage.value - Math.floor(maxVisible / 2))
  let end = Math.min(totalPages.value, start + maxVisible - 1)
  
  if (end - start < maxVisible - 1) {
    start = Math.max(1, end - maxVisible + 1)
  }
  
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  
  return pages
})

// Debounced search
let searchTimeout: NodeJS.Timeout | null = null
const debouncedSearch = () => {
  if (searchTimeout) clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    applyFilters()
  }, 500)
}

/**
 * Load menu items with current filters
 */
const loadMenuItems = async () => {
  try {
    // First fetch menus to get the current menu
    if (!menuStore.currentMenu) {
      await menuStore.fetchMenus()
    }
    
    // If we have a current menu, fetch its items
    if (menuStore.currentMenu) {
      const params = {
        page: currentPage.value,
        limit: 20,
        search: searchQuery.value || undefined,
        categoryId: filters.value.categoryId || undefined,
        isActive: filters.value.isActive ? filters.value.isActive === 'true' : undefined,
        minPrice: filters.value.minPrice,
        maxPrice: filters.value.maxPrice,
      }
      
      await menuStore.fetchMenuItems(menuStore.currentMenu.id, params)
    }
  } catch (error) {
    console.error('Error loading menu items:', error)
  }
}

/**
 * Apply filters
 */
const applyFilters = () => {
  menuStore.currentPage = 1
  loadMenuItems()
}

/**
 * Clear all filters
 */
const clearFilters = () => {
  searchQuery.value = ''
  filters.value = {
    categoryId: '',
    isActive: '',
    minPrice: undefined,
    maxPrice: undefined,
  }
  applyFilters()
}

/**
 * Pagination
 */
const goToPage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    menuStore.currentPage = page
    loadMenuItems()
  }
}

/**
 * Selection
 */
const toggleItemSelection = (itemId: string) => {
  menuStore.toggleItemSelection(itemId)
}

const toggleSelectAll = () => {
  if (isAllSelected.value) {
    menuStore.clearSelection()
  } else {
    menuStore.selectAllItems()
  }
}

const clearSelection = () => {
  menuStore.clearSelection()
}

const isItemSelected = (itemId: string) => {
  return menuStore.isItemSelected(itemId)
}

const selectedMenuItems = computed(() => {
  return menuStore.selectedItemsList
})

/**
 * Location matrix
 */
const closeLocationMatrix = () => {
  showLocationMatrix.value = false
}

const handleLocationUpdate = () => {
  // Optionally reload menu items to reflect changes
  loadMenuItems()
}

/**
 * Bulk operations
 */
const closeBulkOperations = () => {
  showBulkOperations.value = false
}

const handleBulkSuccess = async (message: string) => {
  successMessage.value = message
  showBulkOperations.value = false
  await loadMenuItems()
  
  // Clear success message after 3 seconds
  setTimeout(() => {
    successMessage.value = ''
  }, 3000)
}

const handleBulkError = (message: string) => {
  errorMessage.value = message
  
  // Clear error message after 5 seconds
  setTimeout(() => {
    errorMessage.value = ''
  }, 5000)
}

/**
 * Item actions
 */
const { navigateToTenant } = useNavigation()

const editItem = (itemId: string) => {
  navigateToTenant(`/menu/items/${itemId}`)
}

const deleteItem = async (itemId: string) => {
  if (!menuStore.currentMenu) return
  
  const item = menuItems.value.find(i => i.id === itemId)
  if (item && confirm(`Delete "${item.name}"?`)) {
    try {
      await menuStore.deleteMenuItem(menuStore.currentMenu.id, itemId)
    } catch (error) {
      console.error('Delete error:', error)
    }
  }
}

/**
 * Utility functions
 */
const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

const handleAddItem = () => {
  navigateToTenant('/menu/items/new')
}

// Load data on mount
onMounted(async () => {
  try {
    console.log('MenuItemList: Starting to load data')
    await categoryStore.fetchCategories()
    console.log('MenuItemList: Categories loaded')
    await loadMenuItems()
    console.log('MenuItemList: Menu items loaded, count:', menuItems.value.length)
  } catch (error) {
    console.error('Error loading initial data:', error)
  }
})
</script>


<style scoped lang="scss">
@use './menu-item-list';
</style>
