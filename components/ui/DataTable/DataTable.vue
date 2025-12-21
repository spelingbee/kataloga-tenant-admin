<template>
  <div class="data-table">
    <!-- Loading State -->
    <div v-if="loading" class="data-table__loading">
      <div class="data-table__spinner"></div>
      <p>Loading data...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="data-table__error">
      <p>{{ error }}</p>
      <slot name="error-actions">
        <button @click="emit('retry')" class="data-table__retry-btn">
          Retry
        </button>
      </slot>
    </div>

    <template v-else>
      <!-- Search -->
      <div v-if="searchable" class="data-table__search">
        <input
          v-model="searchQuery"
          type="text"
          class="data-table__search-input"
          :placeholder="searchPlaceholder"
        />
      </div>

      <!-- Table -->
      <div class="data-table__wrapper">
        <table class="data-table__table">
          <thead class="data-table__thead">
            <tr class="data-table__row">
              <th
                v-for="column in columns"
                :key="column.key"
                class="data-table__header"
                :class="{
                  'data-table__header--sortable': column.sortable,
                  'data-table__header--sorted': sortKey === column.key
                }"
                @click="column.sortable ? handleSort(column.key) : null"
              >
                <div class="data-table__header-content">
                  <span>{{ column.label }}</span>
                  <span v-if="column.sortable && sortKey === column.key" class="data-table__sort-icon">
                    {{ sortOrder === 'asc' ? '↑' : '↓' }}
                  </span>
                </div>
              </th>
            </tr>
          </thead>
          <tbody class="data-table__tbody">
            <tr
              v-for="(row, index) in displayData"
              :key="index"
              class="data-table__row"
            >
              <td
                v-for="column in columns"
                :key="column.key"
                class="data-table__cell"
              >
                <slot
                  :name="`cell-${column.key}`"
                  :row="row"
                  :value="row[column.key]"
                >
                  {{ row[column.key] }}
                </slot>
              </td>
            </tr>
            <tr v-if="displayData.length === 0" class="data-table__row">
              <td :colspan="columns.length" class="data-table__cell data-table__cell--empty">
                <slot name="empty">
                  <EmptyState
                    icon="📋"
                    title="No data available"
                    description="There are no items to display"
                  />
                </slot>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div v-if="paginated && paginationInfo.totalItems > 0" class="data-table__pagination">
        <div class="data-table__pagination-info">
          Showing {{ ((paginationInfo.page - 1) * paginationInfo.limit) + 1 }} to {{ Math.min(paginationInfo.page * paginationInfo.limit, paginationInfo.totalItems) }} of {{ paginationInfo.totalItems }} entries
        </div>
        <div class="data-table__pagination-controls">
          <button
            class="data-table__pagination-button"
            :disabled="paginationInfo.page === 1"
            @click="goToPage(paginationInfo.page - 1)"
          >
            Previous
          </button>
          <button
            v-for="page in visiblePages"
            :key="page"
            class="data-table__pagination-button"
            :class="{ 'data-table__pagination-button--active': page === paginationInfo.page }"
            @click="goToPage(page)"
          >
            {{ page }}
          </button>
          <button
            class="data-table__pagination-button"
            :disabled="paginationInfo.page === paginationInfo.totalPages"
            @click="goToPage(paginationInfo.page + 1)"
          >
            Next
          </button>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import EmptyState from '../EmptyState.vue'

interface Column {
  key: string
  label: string
  sortable?: boolean
}

interface PaginatedResult<T> {
  items: T[]
  pagination: {
    page: number
    limit: number
    totalItems: number
    totalPages: number
  }
}

interface Props {
  columns: Column[]
  data?: any[] // For backward compatibility
  paginatedData?: PaginatedResult<any> // New enhanced format
  searchable?: boolean
  searchPlaceholder?: string
  paginated?: boolean
  perPage?: number
  loading?: boolean
  error?: string | null
}

const props = withDefaults(defineProps<Props>(), {
  searchable: false,
  searchPlaceholder: 'Search...',
  paginated: true,
  perPage: 10,
  loading: false,
  error: null
})

const emit = defineEmits<{
  'page-change': [page: number]
  'search': [query: string]
  'sort': [key: string, order: 'asc' | 'desc']
  'retry': []
}>()

const searchQuery = ref('')
const sortKey = ref<string>('')
const sortOrder = ref<'asc' | 'desc'>('asc')

// Determine data source (enhanced or legacy)
const tableData = computed(() => {
  if (props.paginatedData) {
    return props.paginatedData.items
  }
  return props.data || []
})

const paginationInfo = computed(() => {
  if (props.paginatedData) {
    return props.paginatedData.pagination
  }
  // Legacy pagination calculation
  return {
    page: 1,
    limit: props.perPage,
    totalItems: tableData.value.length,
    totalPages: Math.ceil(tableData.value.length / props.perPage)
  }
})

// For enhanced mode, we don't do local filtering/sorting
// The parent component handles this via API calls
const shouldUseLocalOperations = computed(() => {
  return !props.paginatedData && props.data
})

// Filtered data based on search (only for legacy mode)
const filteredData = computed(() => {
  if (!shouldUseLocalOperations.value || !props.searchable || !searchQuery.value) {
    return tableData.value
  }

  const query = searchQuery.value.toLowerCase()
  return tableData.value.filter(row => {
    return props.columns.some(column => {
      const value = row[column.key]
      return value && String(value).toLowerCase().includes(query)
    })
  })
})

// Sorted data (only for legacy mode)
const sortedData = computed(() => {
  if (!shouldUseLocalOperations.value || !sortKey.value) {
    return filteredData.value
  }

  return [...filteredData.value].sort((a, b) => {
    const aVal = a[sortKey.value]
    const bVal = b[sortKey.value]

    if (aVal === bVal) return 0

    const comparison = aVal > bVal ? 1 : -1
    return sortOrder.value === 'asc' ? comparison : -comparison
  })
})

// Display data - either from enhanced pagination or local operations
const displayData = computed(() => {
  if (props.paginatedData) {
    // Enhanced mode: data is already paginated from API
    return props.paginatedData.items
  }
  
  // Legacy mode: apply local pagination
  if (!props.paginated) {
    return sortedData.value
  }
  
  const start = (paginationInfo.value.page - 1) * props.perPage
  const end = start + props.perPage
  return sortedData.value.slice(start, end)
})

const visiblePages = computed(() => {
  const pages: number[] = []
  const maxVisible = 5
  const currentPage = paginationInfo.value.page
  const totalPages = paginationInfo.value.totalPages
  
  let start = Math.max(1, currentPage - Math.floor(maxVisible / 2))
  let end = Math.min(totalPages, start + maxVisible - 1)

  if (end - start < maxVisible - 1) {
    start = Math.max(1, end - maxVisible + 1)
  }

  for (let i = start; i <= end; i++) {
    pages.push(i)
  }

  return pages
})

// Methods
const handleSort = (key: string) => {
  if (shouldUseLocalOperations.value) {
    // Legacy mode: handle sorting locally
    if (sortKey.value === key) {
      sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
    } else {
      sortKey.value = key
      sortOrder.value = 'asc'
    }
  } else {
    // Enhanced mode: emit sort event for parent to handle
    const newOrder = sortKey.value === key && sortOrder.value === 'asc' ? 'desc' : 'asc'
    sortKey.value = key
    sortOrder.value = newOrder
    emit('sort', key, newOrder)
  }
}

const goToPage = (page: number) => {
  const totalPages = paginationInfo.value.totalPages
  if (page >= 1 && page <= totalPages) {
    if (shouldUseLocalOperations.value) {
      // Legacy mode: update local page
      // Note: In legacy mode we'd need to track currentPage locally
      // For now, emit the event for consistency
      emit('page-change', page)
    } else {
      // Enhanced mode: emit page change event
      emit('page-change', page)
    }
  }
}

const handleSearch = () => {
  if (shouldUseLocalOperations.value) {
    // Legacy mode: search is handled by computed properties
    return
  } else {
    // Enhanced mode: emit search event
    emit('search', searchQuery.value)
  }
}

// Debounced search for enhanced mode
let searchTimeout: NodeJS.Timeout | null = null
const debouncedSearch = () => {
  if (searchTimeout) clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    handleSearch()
  }, 500)
}

// Watch for search changes in enhanced mode
watch(searchQuery, () => {
  if (!shouldUseLocalOperations.value) {
    debouncedSearch()
  }
})
</script>

<style scoped lang="scss">
@use './data-table';
</style>
