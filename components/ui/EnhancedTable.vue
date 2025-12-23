<template>
  <div class="enhanced-table">
    <DataTable
      :columns="columns"
      :paginated-data="paginatedData"
      :loading="loading"
      :error="error"
      :searchable="searchable"
      :search-placeholder="searchPlaceholder"
      @page-change="handlePageChange"
      @search="handleSearch"
      @sort="handleSort"
      @retry="handleRetry"
    >
      <!-- Pass through all slots -->
      <template v-for="(_, name) in $slots" #[name]="slotData">
        <slot :name="name" v-bind="slotData" />
      </template>
    </DataTable>
  </div>
</template>

<script setup lang="ts">
import DataTable from './DataTable/DataTable.vue'
import type { PaginatedResult } from '~/types/enhanced-api'

interface Column {
  key: string
  label: string
  sortable?: boolean
}

interface Props {
  columns: Column[]
  paginatedData?: PaginatedResult<any>
  loading?: boolean
  error?: string | null
  searchable?: boolean
  searchPlaceholder?: string
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  error: null,
  searchable: true,
  searchPlaceholder: 'Search...'
})

const emit = defineEmits<{
  'page-change': [page: number]
  'search': [query: string]
  'sort': [key: string, order: 'asc' | 'desc']
  'retry': []
}>()

const handlePageChange = (page: number) => {
  emit('page-change', page)
}

const handleSearch = (query: string) => {
  emit('search', query)
}

const handleSort = (key: string, order: 'asc' | 'desc') => {
  emit('sort', key, order)
}

const handleRetry = () => {
  emit('retry')
}
</script>

<style scoped lang="scss">
.enhanced-table {
  // Add any enhanced table specific styles here
}
</style>