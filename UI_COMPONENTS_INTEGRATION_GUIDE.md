# UI Components Integration Guide

Quick guide to integrate the new UI components into your existing pages.

## Step 1: Setup Toast Notifications (Required)

Add Toast component to your `app.vue`:

```vue
<!-- app.vue -->
<template>
  <div>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
    <Toast ref="toastRef" />
  </div>
</template>

<script setup lang="ts">
import Toast from '~/components/ui/Toast/Toast.vue'

const toastRef = ref()
const { setToastInstance } = useToast()

onMounted(() => {
  if (toastRef.value) {
    setToastInstance(toastRef.value)
  }
})
</script>
```

## Step 2: Replace Existing Components

### Replace Manual Tables with DataTable

**Before:**
```vue
<table>
  <thead>
    <tr>
      <th>Name</th>
      <th>Price</th>
    </tr>
  </thead>
  <tbody>
    <tr v-for="item in items" :key="item.id">
      <td>{{ item.name }}</td>
      <td>{{ item.price }}</td>
    </tr>
  </tbody>
</table>
```

**After:**
```vue
<DataTable
  :columns="[
    { key: 'name', label: 'Name', sortable: true },
    { key: 'price', label: 'Price', sortable: true },
    { key: 'actions', label: 'Actions' }
  ]"
  :data="items"
  searchable
  :per-page="20"
>
  <template #cell-actions="{ row }">
    <button @click="edit(row)">Edit</button>
    <button @click="remove(row)">Delete</button>
  </template>
</DataTable>
```

### Replace Alert/Confirm with ConfirmDialog

**Before:**
```typescript
if (confirm('Are you sure you want to delete this item?')) {
  await deleteItem(id)
}
```

**After:**
```vue
<template>
  <ConfirmDialog
    v-model="showConfirm"
    title="Delete Menu Item"
    message="Are you sure you want to delete this item? This action cannot be undone."
    variant="danger"
    @confirm="handleDelete"
  />
</template>

<script setup lang="ts">
const showConfirm = ref(false)
const itemToDelete = ref(null)

const confirmDelete = (item) => {
  itemToDelete.value = item
  showConfirm.value = true
}

const handleDelete = async () => {
  await deleteItem(itemToDelete.value.id)
  success('Item deleted successfully')
}
</script>
```

### Replace Manual Modals with FormDialog

**Before:**
```vue
<div v-if="showModal" class="modal-overlay" @click="showModal = false">
  <div class="modal" @click.stop>
    <h2>Add Item</h2>
    <form @submit.prevent="handleSubmit">
      <!-- form fields -->
      <button type="submit">Save</button>
      <button @click="showModal = false">Cancel</button>
    </form>
  </div>
</div>
```

**After:**
```vue
<FormDialog
  v-model="showModal"
  title="Add Item"
  :loading="saving"
  @submit="handleSubmit"
>
  <form @submit.prevent="handleSubmit">
    <!-- form fields -->
  </form>
</FormDialog>
```

### Replace Manual Notifications with Toast

**Before:**
```typescript
alert('Item saved successfully!')
```

**After:**
```typescript
const { success, error } = useToast()

try {
  await saveItem()
  success('Item saved successfully!')
} catch (e) {
  error('Failed to save item')
}
```

### Add Empty States

**Before:**
```vue
<div v-if="items.length === 0">
  <p>No items found</p>
</div>
```

**After:**
```vue
<EmptyState
  icon="🍽️"
  title="No menu items yet"
  description="Start building your menu by adding your first item"
>
  <template #action>
    <button @click="showAddForm = true">Add First Item</button>
  </template>
</EmptyState>
```

### Add Loading States

**Before:**
```vue
<button :disabled="loading">
  {{ loading ? 'Saving...' : 'Save' }}
</button>
```

**After:**
```vue
<button :disabled="loading">
  <LoadingSpinner v-if="loading" size="sm" />
  <span v-else>Save</span>
</button>
```

### Wrap Error-Prone Components

**Before:**
```vue
<MenuItemList />
```

**After:**
```vue
<ErrorBoundary
  title="Failed to Load Menu Items"
  message="We couldn't load your menu items. Please check your connection and try again."
>
  <MenuItemList />
</ErrorBoundary>
```

## Step 3: Update Existing Pages

### Menu List Page (`pages/menu/index.vue`)

```vue
<template>
  <div class="menu-page">
    <div class="page-header">
      <h1>Menu Items</h1>
      <button @click="showAddForm = true">Add Item</button>
    </div>

    <ErrorBoundary>
      <DataTable
        :columns="columns"
        :data="menuStore.items"
        searchable
        search-placeholder="Search menu items..."
        :per-page="20"
      >
        <template #cell-price="{ value }">
          ${{ value.toFixed(2) }}
        </template>

        <template #cell-isActive="{ value, row }">
          <label class="toggle">
            <input
              type="checkbox"
              :checked="value"
              @change="toggleActive(row)"
            />
            <span>{{ value ? 'Active' : 'Inactive' }}</span>
          </label>
        </template>

        <template #cell-actions="{ row }">
          <button @click="editItem(row)">Edit</button>
          <button @click="confirmDelete(row)">Delete</button>
        </template>

        <template #empty>
          <EmptyState
            icon="🍽️"
            title="No menu items yet"
            description="Start building your menu by adding your first item"
          >
            <template #action>
              <button @click="showAddForm = true">Add First Item</button>
            </template>
          </EmptyState>
        </template>
      </DataTable>
    </ErrorBoundary>

    <!-- Add/Edit Form -->
    <FormDialog
      v-model="showAddForm"
      :title="editingItem ? 'Edit Menu Item' : 'Add Menu Item'"
      :loading="saving"
      @submit="handleSave"
    >
      <MenuItemForm v-model="formData" />
    </FormDialog>

    <!-- Delete Confirmation -->
    <ConfirmDialog
      v-model="showDeleteConfirm"
      title="Delete Menu Item"
      :message="`Are you sure you want to delete ${itemToDelete?.name}?`"
      variant="danger"
      @confirm="handleDelete"
    />
  </div>
</template>

<script setup lang="ts">
import DataTable from '~/components/ui/DataTable/DataTable.vue'
import FormDialog from '~/components/ui/Modal/FormDialog.vue'
import ConfirmDialog from '~/components/ui/Modal/ConfirmDialog.vue'
import EmptyState from '~/components/ui/EmptyState.vue'
import ErrorBoundary from '~/components/ui/ErrorBoundary.vue'

const { success, error } = useToast()
const menuStore = useMenuStore()

const columns = [
  { key: 'name', label: 'Name', sortable: true },
  { key: 'price', label: 'Price', sortable: true },
  { key: 'category', label: 'Category', sortable: true },
  { key: 'isActive', label: 'Status' },
  { key: 'actions', label: 'Actions' }
]

const showAddForm = ref(false)
const showDeleteConfirm = ref(false)
const editingItem = ref(null)
const itemToDelete = ref(null)
const saving = ref(false)
const formData = ref({})

const toggleActive = async (item) => {
  try {
    await menuStore.updateItem(item.id, { isActive: !item.isActive })
    success(`${item.name} is now ${!item.isActive ? 'active' : 'inactive'}`)
  } catch (e) {
    error('Failed to update item status')
  }
}

const editItem = (item) => {
  editingItem.value = item
  formData.value = { ...item }
  showAddForm.value = true
}

const confirmDelete = (item) => {
  itemToDelete.value = item
  showDeleteConfirm.value = true
}

const handleDelete = async () => {
  try {
    await menuStore.deleteItem(itemToDelete.value.id)
    success('Menu item deleted successfully')
  } catch (e) {
    error('Failed to delete menu item')
  }
}

const handleSave = async () => {
  saving.value = true
  try {
    if (editingItem.value) {
      await menuStore.updateItem(editingItem.value.id, formData.value)
      success('Menu item updated successfully')
    } else {
      await menuStore.createItem(formData.value)
      success('Menu item created successfully')
    }
    showAddForm.value = false
    editingItem.value = null
    formData.value = {}
  } catch (e) {
    error('Failed to save menu item')
  } finally {
    saving.value = false
  }
}
</script>
```

### Category List Page (`pages/categories/index.vue`)

Similar pattern - replace table with DataTable, add ConfirmDialog, FormDialog, etc.

### Location List Page (`pages/locations/index.vue`)

Similar pattern - use the same components.

## Step 4: Common Patterns

### CRUD Operations

```typescript
// Create
const handleCreate = async () => {
  saving.value = true
  try {
    await store.create(formData.value)
    success('Created successfully!')
    showForm.value = false
  } catch (e) {
    error('Failed to create')
  } finally {
    saving.value = false
  }
}

// Update
const handleUpdate = async () => {
  saving.value = true
  try {
    await store.update(item.id, formData.value)
    success('Updated successfully!')
    showForm.value = false
  } catch (e) {
    error('Failed to update')
  } finally {
    saving.value = false
  }
}

// Delete
const handleDelete = async () => {
  try {
    await store.delete(item.id)
    success('Deleted successfully!')
  } catch (e) {
    error('Failed to delete')
  }
}
```

### Form Validation

```typescript
const handleSubmit = async () => {
  // Validate
  if (!formData.value.name) {
    error('Name is required')
    return
  }

  if (formData.value.price <= 0) {
    error('Price must be greater than 0')
    return
  }

  // Save
  await handleSave()
}
```

### Loading States

```vue
<template>
  <div v-if="loading" class="loading-container">
    <LoadingSpinner size="lg" />
    <p>Loading...</p>
  </div>
  <div v-else>
    <!-- Content -->
  </div>
</template>
```

### Error Handling

```typescript
const loadData = async () => {
  loading.value = true
  try {
    await store.fetchItems()
  } catch (e) {
    error({
      title: 'Failed to Load Data',
      message: 'Please check your connection and try again.'
    })
  } finally {
    loading.value = false
  }
}
```

## Step 5: Testing

After integration, test:

1. **DataTable**
   - Pagination works
   - Sorting works
   - Search filters correctly
   - Custom cells render

2. **Modals**
   - Open/close properly
   - Forms submit correctly
   - Confirmations work

3. **Toast**
   - Notifications appear
   - Auto-dismiss works
   - Multiple toasts stack

4. **Empty States**
   - Show when no data
   - Actions work

5. **Error Boundaries**
   - Catch errors
   - Recovery works

## Step 6: Cleanup

Remove old code:
- Old table markup
- Manual modal implementations
- Alert/confirm calls
- Custom loading spinners
- Manual empty state divs

## Tips

1. **Start small**: Integrate one page at a time
2. **Test thoroughly**: Check all interactions
3. **Use TypeScript**: Let types guide you
4. **Follow patterns**: Use the examples as templates
5. **Keep it simple**: Don't over-complicate

## Common Issues

### Toast not working
- Make sure Toast is added to app.vue
- Check that setToastInstance is called in onMounted
- Verify useToast is imported correctly

### DataTable not sorting
- Ensure sortable: true is set on columns
- Check that data is an array
- Verify column keys match data properties

### Modal not closing
- Check v-model binding
- Verify closeOnOverlay prop
- Ensure emit is working

### Styles not applying
- Check SCSS imports
- Verify variables are imported
- Check for scoped style conflicts

## Support

For more details, see:
- `UI_COMPONENTS_GUIDE.md` - Full documentation
- `UI_COMPONENTS_EXAMPLES.md` - More examples
- `UI_COMPONENTS_QUICK_REFERENCE.md` - Quick reference

## Next Steps

1. Add Toast to app.vue
2. Update menu list page
3. Update category list page
4. Update location list page
5. Update team management page
6. Test all pages
7. Remove old code
8. Deploy!

Happy coding! 🚀
