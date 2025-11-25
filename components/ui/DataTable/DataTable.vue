<template>
  <div class="data-table">
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
            v-for="(row, index) in paginatedData"
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
          <tr v-if="paginatedData.length === 0" class="data-table__row">
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
    <div v-if="paginated && filteredData.length > 0" class="data-table__pagination">
      <div class="data-table__pagination-info">
        Showing {{ startIndex + 1 }} to {{ endIndex }} of {{ filteredData.length }} entries
      </div>
      <div class="data-table__pagination-controls">
        <button
          class="data-table__pagination-button"
          :disabled="currentPage === 1"
          @click="goToPage(currentPage - 1)"
        >
          Previous
        </button>
        <button
          v-for="page in visiblePages"
          :key="page"
          class="data-table__pagination-button"
          :class="{ 'data-table__pagination-button--active': page === currentPage }"
          @click="goToPage(page)"
        >
          {{ page }}
        </button>
        <button
          class="data-table__pagination-button"
          :disabled="currentPage === totalPages"
          @click="goToPage(currentPage + 1)"
        >
          Next
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import EmptyState from '../EmptyState.vue'

interface Column {
  key: string
  label: string
  sortable?: boolean
}

interface Props {
  columns: Column[]
  data: any[]
  searchable?: boolean
  searchPlaceholder?: string
  paginated?: boolean
  perPage?: number
}

const props = withDefaults(defineProps<Props>(), {
  searchable: false,
  searchPlaceholder: 'Search...',
  paginated: true,
  perPage: 10
})

const searchQuery = ref('')
const sortKey = ref<string>('')
const sortOrder = ref<'asc' | 'desc'>('asc')
const currentPage = ref(1)

// Filtered data based on search
const filteredData = computed(() => {
  if (!props.searchable || !searchQuery.value) {
    return props.data
  }

  const query = searchQuery.value.toLowerCase()
  return props.data.filter(row => {
    return props.columns.some(column => {
      const value = row[column.key]
      return value && String(value).toLowerCase().includes(query)
    })
  })
})

// Sorted data
const sortedData = computed(() => {
  if (!sortKey.value) {
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

// Pagination calculations
const totalPages = computed(() => {
  if (!props.paginated) return 1
  return Math.ceil(filteredData.value.length / props.perPage)
})

const startIndex = computed(() => {
  return (currentPage.value - 1) * props.perPage
})

const endIndex = computed(() => {
  return Math.min(startIndex.value + props.perPage, filteredData.value.length)
})

const paginatedData = computed(() => {
  if (!props.paginated) {
    return sortedData.value
  }
  return sortedData.value.slice(startIndex.value, endIndex.value)
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

// Methods
const handleSort = (key: string) => {
  if (sortKey.value === key) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortKey.value = key
    sortOrder.value = 'asc'
  }
  currentPage.value = 1
}

const goToPage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
  }
}

// Reset page when search changes
watch(searchQuery, () => {
  currentPage.value = 1
})

// Reset page when data changes
watch(() => props.data, () => {
  currentPage.value = 1
})
</script>

<style scoped lang="scss">
@use './data-table';
</style>
