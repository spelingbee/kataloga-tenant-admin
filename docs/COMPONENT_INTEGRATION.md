# Component Integration with Enhanced API

This document describes how existing Vue components have been updated to work with the new Enhanced API standardization.

## Overview

The integration updates components to:
1. Use `useEnhancedApiForm` for form error handling
2. Use Enhanced Stores (e.g., `useEnhancedMenuStore`) for data management
3. Support `PaginatedResult<T>` format for tables
4. Handle API errors consistently
5. Provide better user feedback

## Updated Components

### Forms

#### MenuItemForm.vue
**Changes:**
- Uses `useEnhancedApiForm()` composable for error handling
- Supports nested field validation with dot-notation
- Auto-scrolls to first error field
- Clears errors on field change (dirty check)
- Displays global errors for unmapped validation errors

**Usage Example:**
```vue
<MenuItemForm
  :initial-data="menuItem"
  :loading="isSubmitting"
  @submit="handleSubmit"
  @cancel="handleCancel"
/>
```

**Error Handling:**
```typescript
const form = useEnhancedApiForm()

async function handleSubmit(data: Partial<MenuItem>) {
  form.setSubmitting(true)
  form.clearAllErrors()
  
  try {
    await menuStore.createMenuItem(menuId, data)
  } catch (error: any) {
    if (error.code === 'VALIDATION_ERROR') {
      form.handleValidationError(error)
    }
  } finally {
    form.setSubmitting(false)
  }
}
```

#### CategoryForm.vue
**Changes:**
- Uses `useEnhancedApiForm()` for validation
- Supports field-level error display
- Handles API validation errors automatically

### Lists and Tables

#### MenuItemList.vue
**Changes:**
- Uses `useEnhancedMenuStore` instead of legacy `useMenuStore`
- Accesses pagination through `menuStore.paginationInfo`
- Uses `menuStore.isFetching` for loading state
- Accesses errors through `menuStore.errors.items`
- Supports bulk operations with enhanced error handling

**Usage Example:**
```typescript
const menuStore = useEnhancedMenuStore()

// Access paginated data
const menuItems = computed(() => menuStore.menuItems)
const pagination = computed(() => menuStore.paginationInfo)
const loading = computed(() => menuStore.isFetching)
const error = computed(() => menuStore.errors.items?.message)

// Fetch with pagination
await menuStore.fetchMenuItems(menuId, {
  page: 1,
  limit: 20,
  search: 'pizza',
  categoryId: 'cat-123'
})
```

#### DataTable.vue
**Changes:**
- Supports both legacy `data` prop and new `paginatedData` prop
- Handles loading and error states
- Emits events for pagination, search, and sorting
- Works with server-side pagination

**Enhanced Mode Usage:**
```vue
<DataTable
  :columns="columns"
  :paginated-data="paginatedResult"
  :loading="loading"
  :error="error"
  @page-change="handlePageChange"
  @search="handleSearch"
  @sort="handleSort"
/>
```

**Legacy Mode (Backward Compatible):**
```vue
<DataTable
  :columns="columns"
  :data="items"
  :searchable="true"
  :paginated="true"
/>
```

### UI Components

#### EnhancedTable.vue (New)
A wrapper around DataTable that provides a cleaner API for enhanced mode:

```vue
<EnhancedTable
  :columns="columns"
  :paginated-data="menuStore.paginatedResult"
  :loading="menuStore.isFetching"
  :error="menuStore.errors.items?.message"
  @page-change="loadPage"
  @search="handleSearch"
>
  <template #cell-actions="{ row }">
    <button @click="editItem(row.id)">Edit</button>
    <button @click="deleteItem(row.id)">Delete</button>
  </template>
</EnhancedTable>
```

## Integration Patterns

### Pattern 1: Form with Enhanced Error Handling

```vue
<template>
  <form @submit.prevent="handleSubmit">
    <!-- Field with error handling -->
    <input
      v-model="formData.name"
      name="name"
      data-field="name"
      :class="{ 'error': form.getFieldError('name') }"
      @input="form.clearFieldError('name')"
    />
    <span v-if="form.getFieldError('name')">
      {{ form.getFieldError('name') }}
    </span>

    <!-- Global errors -->
    <div v-if="form.globalErrors.value.length > 0">
      <div v-for="error in form.globalErrors.value" :key="error">
        {{ error }}
      </div>
    </div>

    <button type="submit" :disabled="form.isSubmitting.value">
      Submit
    </button>
  </form>
</template>

<script setup lang="ts">
const form = useEnhancedApiForm()
const formData = ref({ name: '' })

async function handleSubmit() {
  form.setSubmitting(true)
  form.clearAllErrors()
  
  try {
    const { $api } = useNuxtApp()
    await $api.post('/items', formData.value)
  } catch (error: any) {
    if (error.code === 'VALIDATION_ERROR') {
      form.handleValidationError(error)
    }
  } finally {
    form.setSubmitting(false)
  }
}
</script>
```

### Pattern 2: List with Enhanced Store

```vue
<template>
  <div>
    <!-- Loading state -->
    <div v-if="store.isFetching">Loading...</div>

    <!-- Error state -->
    <div v-else-if="store.errors.items">
      {{ store.errors.items.message }}
    </div>

    <!-- Data -->
    <div v-else>
      <div v-for="item in store.menuItems" :key="item.id">
        {{ item.name }}
      </div>

      <!-- Pagination -->
      <div v-if="store.pagination">
        Page {{ store.pagination.page }} of {{ store.pagination.totalPages }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const store = useEnhancedMenuStore()

onMounted(async () => {
  await store.fetchMenus()
  if (store.currentMenu) {
    await store.fetchMenuItems(store.currentMenu.id, { page: 1, limit: 20 })
  }
})
</script>
```

### Pattern 3: Table with Server-Side Pagination

```vue
<template>
  <DataTable
    :columns="columns"
    :paginated-data="paginatedData"
    :loading="loading"
    :error="error"
    @page-change="loadPage"
    @search="handleSearch"
    @sort="handleSort"
  >
    <template #cell-actions="{ row }">
      <button @click="edit(row)">Edit</button>
    </template>
  </DataTable>
</template>

<script setup lang="ts">
const store = useEnhancedMenuStore()

const columns = [
  { key: 'name', label: 'Name', sortable: true },
  { key: 'price', label: 'Price', sortable: true },
  { key: 'actions', label: 'Actions' }
]

const paginatedData = computed(() => ({
  items: store.menuItems,
  pagination: store.paginationInfo
}))

const loading = computed(() => store.isFetching)
const error = computed(() => store.errors.items?.message)

async function loadPage(page: number) {
  if (store.currentMenu) {
    await store.fetchMenuItems(store.currentMenu.id, { page, limit: 20 })
  }
}

async function handleSearch(query: string) {
  if (store.currentMenu) {
    await store.fetchMenuItems(store.currentMenu.id, { 
      page: 1, 
      limit: 20, 
      search: query 
    })
  }
}

async function handleSort(key: string, order: 'asc' | 'desc') {
  if (store.currentMenu) {
    await store.fetchMenuItems(store.currentMenu.id, { 
      page: 1, 
      limit: 20, 
      sortBy: key,
      sortOrder: order
    })
  }
}
</script>
```

## Migration Checklist

When updating a component to use the Enhanced API:

### Forms
- [ ] Replace local error state with `useEnhancedApiForm()`
- [ ] Add `name` and `data-field` attributes to form inputs
- [ ] Use `form.getFieldError(field)` to display errors
- [ ] Use `form.clearFieldError(field)` on input events
- [ ] Handle `VALIDATION_ERROR` in catch blocks
- [ ] Display `form.globalErrors` for unmapped errors

### Lists/Tables
- [ ] Replace legacy store with enhanced store
- [ ] Update computed properties to use enhanced store getters
- [ ] Use `store.isFetching` instead of `store.loading`
- [ ] Access errors through `store.errors.{widget}`
- [ ] Use `store.paginationInfo` for pagination data
- [ ] Update API calls to use enhanced store actions

### Data Tables
- [ ] Add `paginatedData` prop support
- [ ] Add `loading` and `error` props
- [ ] Emit `page-change`, `search`, and `sort` events
- [ ] Handle both enhanced and legacy modes

## Benefits

1. **Consistent Error Handling**: All forms use the same error handling pattern
2. **Better UX**: Auto-scroll to errors, field-level validation, clear feedback
3. **Clean State**: Stores only contain business data, no API wrappers
4. **Type Safety**: Full TypeScript support with proper types
5. **Backward Compatible**: Legacy components continue to work
6. **Testable**: Enhanced components are easier to test

## Requirements Validated

- ✅ **Requirement 2.1**: Nested field validation with dot-notation
- ✅ **Requirement 2.2**: Auto-scroll to first error
- ✅ **Requirement 2.3**: Generic fallback for invisible fields
- ✅ **Requirement 2.4**: Clear errors on field change
- ✅ **Requirement 2.5**: Field focus on error
- ✅ **Requirement 3.2**: Paginated data structure
- ✅ **Requirement 6.1**: Menu list with pagination
- ✅ **Requirement 6.2**: CRUD operations with local state updates

## Next Steps

1. Update remaining form components (TeamMemberInviteForm, LocationForm)
2. Update remaining list components (TeamMemberList, LocationList)
3. Add integration tests for enhanced components
4. Update documentation with more examples
5. Create migration guide for custom components
