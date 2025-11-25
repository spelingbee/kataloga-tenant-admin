# UI Components Examples

This document provides practical examples of using all UI components together.

## Complete Example Page

```vue
<template>
  <div class="demo-page">
    <h1>UI Components Demo</h1>

    <!-- Toast Notifications Demo -->
    <section class="demo-section">
      <h2>Toast Notifications</h2>
      <div class="demo-buttons">
        <button @click="showSuccessToast">Success Toast</button>
        <button @click="showErrorToast">Error Toast</button>
        <button @click="showWarningToast">Warning Toast</button>
        <button @click="showInfoToast">Info Toast</button>
      </div>
    </section>

    <!-- Modal Variants Demo -->
    <section class="demo-section">
      <h2>Modal Variants</h2>
      <div class="demo-buttons">
        <button @click="showBaseModal = true">Base Modal</button>
        <button @click="showConfirmDialog = true">Confirm Dialog</button>
        <button @click="showFormDialog = true">Form Dialog</button>
      </div>
    </section>

    <!-- DataTable Demo -->
    <section class="demo-section">
      <h2>DataTable</h2>
      <DataTable
        :columns="tableColumns"
        :data="tableData"
        searchable
        :per-page="5"
      >
        <template #cell-price="{ value }">
          <span class="price">${{ value.toFixed(2) }}</span>
        </template>
        
        <template #cell-status="{ value }">
          <span :class="`badge badge--${value ? 'success' : 'danger'}`">
            {{ value ? 'Active' : 'Inactive' }}
          </span>
        </template>
        
        <template #cell-actions="{ row }">
          <button @click="editItem(row)">Edit</button>
          <button @click="deleteItem(row)">Delete</button>
        </template>
      </DataTable>
    </section>

    <!-- Loading States Demo -->
    <section class="demo-section">
      <h2>Loading Spinners</h2>
      <div class="demo-spinners">
        <div>
          <p>Small</p>
          <LoadingSpinner size="sm" />
        </div>
        <div>
          <p>Medium</p>
          <LoadingSpinner size="md" />
        </div>
        <div>
          <p>Large</p>
          <LoadingSpinner size="lg" />
        </div>
      </div>
    </section>

    <!-- Empty State Demo -->
    <section class="demo-section">
      <h2>Empty State</h2>
      <EmptyState
        icon="🍽️"
        title="No menu items yet"
        description="Start building your menu by adding your first item"
      >
        <template #action>
          <button @click="showFormDialog = true">Add First Item</button>
        </template>
      </EmptyState>
    </section>

    <!-- Error Boundary Demo -->
    <section class="demo-section">
      <h2>Error Boundary</h2>
      <button @click="triggerError = !triggerError">
        {{ triggerError ? 'Reset' : 'Trigger Error' }}
      </button>
      <ErrorBoundary>
        <ComponentThatMightFail :should-fail="triggerError" />
      </ErrorBoundary>
    </section>

    <!-- Modals -->
    <Modal v-model="showBaseModal" size="md">
      <div style="padding: 2rem;">
        <h2>Base Modal</h2>
        <p>This is a basic modal with custom content.</p>
        <button @click="showBaseModal = false">Close</button>
      </div>
    </Modal>

    <ConfirmDialog
      v-model="showConfirmDialog"
      title="Delete Menu Item"
      message="Are you sure you want to delete this item? This action cannot be undone."
      confirm-text="Delete"
      cancel-text="Cancel"
      variant="danger"
      @confirm="handleConfirmDelete"
      @cancel="handleCancelDelete"
    />

    <FormDialog
      v-model="showFormDialog"
      title="Add Menu Item"
      submit-text="Save"
      :loading="formLoading"
      @submit="handleFormSubmit"
      @cancel="handleFormCancel"
    >
      <form @submit.prevent="handleFormSubmit">
        <div class="form-group">
          <label>Name</label>
          <input v-model="formData.name" type="text" required />
        </div>
        <div class="form-group">
          <label>Price</label>
          <input v-model="formData.price" type="number" step="0.01" required />
        </div>
        <div class="form-group">
          <label>Category</label>
          <select v-model="formData.category" required>
            <option value="">Select category</option>
            <option value="appetizer">Appetizer</option>
            <option value="main">Main Course</option>
            <option value="dessert">Dessert</option>
          </select>
        </div>
      </form>
    </FormDialog>
  </div>
</template>

<script setup lang="ts">
import DataTable from '~/components/ui/DataTable/DataTable.vue'
import Modal from '~/components/ui/Modal.vue'
import ConfirmDialog from '~/components/ui/Modal/ConfirmDialog.vue'
import FormDialog from '~/components/ui/Modal/FormDialog.vue'
import LoadingSpinner from '~/components/ui/LoadingSpinner.vue'
import EmptyState from '~/components/ui/EmptyState.vue'
import ErrorBoundary from '~/components/ui/ErrorBoundary.vue'

const { success, error, warning, info } = useToast()

// Toast demos
const showSuccessToast = () => {
  success({
    title: 'Success!',
    message: 'Your changes have been saved successfully.'
  })
}

const showErrorToast = () => {
  error({
    title: 'Error',
    message: 'Failed to save changes. Please try again.'
  })
}

const showWarningToast = () => {
  warning({
    title: 'Warning',
    message: 'You are approaching your plan limit.'
  })
}

const showInfoToast = () => {
  info('Your session will expire in 5 minutes.')
}

// Modal demos
const showBaseModal = ref(false)
const showConfirmDialog = ref(false)
const showFormDialog = ref(false)

const handleConfirmDelete = () => {
  success('Item deleted successfully')
}

const handleCancelDelete = () => {
  info('Delete cancelled')
}

// Form dialog
const formLoading = ref(false)
const formData = reactive({
  name: '',
  price: 0,
  category: ''
})

const handleFormSubmit = async () => {
  formLoading.value = true
  try {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500))
    success('Menu item added successfully')
    showFormDialog.value = false
    // Reset form
    formData.name = ''
    formData.price = 0
    formData.category = ''
  } catch (err) {
    error('Failed to add menu item')
  } finally {
    formLoading.value = false
  }
}

const handleFormCancel = () => {
  info('Form cancelled')
}

// DataTable demo
const tableColumns = [
  { key: 'name', label: 'Name', sortable: true },
  { key: 'price', label: 'Price', sortable: true },
  { key: 'category', label: 'Category', sortable: true },
  { key: 'status', label: 'Status', sortable: true },
  { key: 'actions', label: 'Actions' }
]

const tableData = ref([
  { name: 'Burger', price: 12.99, category: 'Main', status: true },
  { name: 'Caesar Salad', price: 8.99, category: 'Appetizer', status: true },
  { name: 'Pasta Carbonara', price: 14.99, category: 'Main', status: true },
  { name: 'Tiramisu', price: 6.99, category: 'Dessert', status: false },
  { name: 'Margherita Pizza', price: 11.99, category: 'Main', status: true },
  { name: 'Bruschetta', price: 7.99, category: 'Appetizer', status: true }
])

const editItem = (row: any) => {
  info(`Editing ${row.name}`)
}

const deleteItem = (row: any) => {
  showConfirmDialog.value = true
}

// Error boundary demo
const triggerError = ref(false)

// Component that can fail
const ComponentThatMightFail = defineComponent({
  props: {
    shouldFail: Boolean
  },
  setup(props) {
    if (props.shouldFail) {
      throw new Error('This is a simulated error!')
    }
    return () => h('div', { class: 'success-message' }, 'Component loaded successfully!')
  }
})
</script>

<style scoped lang="scss">
@use '@/assets/scss/variables' as *;

.demo-page {
  padding: $spacing-xl;
  max-width: 1200px;
  margin: 0 auto;
}

.demo-section {
  margin-bottom: $spacing-3xl;
  padding: $spacing-xl;
  background: $bg-primary;
  border: 1px solid $border-color;
  border-radius: $radius-lg;
}

.demo-buttons {
  display: flex;
  gap: $spacing-md;
  flex-wrap: wrap;

  button {
    padding: $spacing-sm $spacing-lg;
    background: $primary-color;
    color: $text-white;
    border: none;
    border-radius: $radius-md;
    cursor: pointer;
    font-weight: $font-weight-medium;
    transition: background $transition-fast;

    &:hover {
      background: $primary-dark;
    }
  }
}

.demo-spinners {
  display: flex;
  gap: $spacing-xl;

  > div {
    text-align: center;

    p {
      margin-bottom: $spacing-sm;
      color: $text-secondary;
    }
  }
}

.price {
  font-weight: $font-weight-semibold;
  color: $success-color;
}

.badge {
  padding: $spacing-xs $spacing-sm;
  border-radius: $radius-sm;
  font-size: $font-size-xs;
  font-weight: $font-weight-medium;
}

.badge--success {
  background: rgba($success-color, 0.1);
  color: $success-color;
}

.badge--danger {
  background: rgba($error-color, 0.1);
  color: $error-color;
}

.form-group {
  margin-bottom: $spacing-lg;

  label {
    display: block;
    margin-bottom: $spacing-xs;
    font-weight: $font-weight-medium;
    color: $text-primary;
  }

  input,
  select {
    width: 100%;
    padding: $spacing-sm;
    border: 1px solid $border-color;
    border-radius: $radius-md;
    font-size: $font-size-base;

    &:focus {
      outline: none;
      border-color: $primary-color;
    }
  }
}

.success-message {
  padding: $spacing-lg;
  background: rgba($success-color, 0.1);
  color: $success-color;
  border-radius: $radius-md;
  text-align: center;
}
</style>
```

## Integration with App

To use Toast notifications globally, update your `app.vue`:

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

## Real-World Usage Examples

### Menu Management with DataTable

```vue
<template>
  <div class="menu-management">
    <div class="header">
      <h1>Menu Items</h1>
      <button @click="showAddForm = true">Add Item</button>
    </div>

    <DataTable
      :columns="columns"
      :data="menuItems"
      searchable
      search-placeholder="Search menu items..."
      :per-page="20"
    >
      <template #cell-image="{ value }">
        <img :src="value" alt="Item" class="item-image" />
      </template>

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

    <!-- Add/Edit Form -->
    <FormDialog
      v-model="showAddForm"
      :title="editingItem ? 'Edit Menu Item' : 'Add Menu Item'"
      :loading="saving"
      @submit="handleSave"
    >
      <!-- Form fields here -->
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
const { success, error } = useToast()
const menuStore = useMenuStore()

const columns = [
  { key: 'image', label: 'Image' },
  { key: 'name', label: 'Name', sortable: true },
  { key: 'price', label: 'Price', sortable: true },
  { key: 'category', label: 'Category', sortable: true },
  { key: 'isActive', label: 'Status' },
  { key: 'actions', label: 'Actions' }
]

const menuItems = computed(() => menuStore.items)
const showAddForm = ref(false)
const showDeleteConfirm = ref(false)
const editingItem = ref(null)
const itemToDelete = ref(null)
const saving = ref(false)

const toggleActive = async (item: any) => {
  try {
    await menuStore.updateItem(item.id, { isActive: !item.isActive })
    success(`${item.name} is now ${!item.isActive ? 'active' : 'inactive'}`)
  } catch (err) {
    error('Failed to update item status')
  }
}

const editItem = (item: any) => {
  editingItem.value = item
  showAddForm.value = true
}

const confirmDelete = (item: any) => {
  itemToDelete.value = item
  showDeleteConfirm.value = true
}

const handleDelete = async () => {
  try {
    await menuStore.deleteItem(itemToDelete.value.id)
    success('Menu item deleted successfully')
  } catch (err) {
    error('Failed to delete menu item')
  }
}

const handleSave = async () => {
  saving.value = true
  try {
    // Save logic
    success('Menu item saved successfully')
    showAddForm.value = false
  } catch (err) {
    error('Failed to save menu item')
  } finally {
    saving.value = false
  }
}
</script>
```

This demonstrates real-world integration of all UI components in a typical CRUD interface.
