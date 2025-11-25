# UI Components Guide

This guide provides documentation for all reusable UI components in the Tenant Admin Dashboard.

## Table of Contents

1. [DataTable](#datatable)
2. [Modal Components](#modal-components)
3. [Toast Notifications](#toast-notifications)
4. [LoadingSpinner](#loadingspinner)
5. [EmptyState](#emptystate)
6. [ErrorBoundary](#errorboundary)

---

## DataTable

A feature-rich data table component with pagination, sorting, and search functionality.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `columns` | `Column[]` | required | Array of column definitions |
| `data` | `any[]` | required | Array of data rows |
| `searchable` | `boolean` | `false` | Enable search functionality |
| `searchPlaceholder` | `string` | `'Search...'` | Placeholder text for search input |
| `paginated` | `boolean` | `true` | Enable pagination |
| `perPage` | `number` | `10` | Number of rows per page |

### Column Definition

```typescript
interface Column {
  key: string        // Property key in data object
  label: string      // Column header label
  sortable?: boolean // Enable sorting for this column
}
```

### Usage

```vue
<template>
  <DataTable
    :columns="columns"
    :data="menuItems"
    searchable
    :per-page="20"
  >
    <!-- Custom cell rendering -->
    <template #cell-price="{ value }">
      ${{ value.toFixed(2) }}
    </template>
    
    <template #cell-actions="{ row }">
      <button @click="editItem(row)">Edit</button>
      <button @click="deleteItem(row)">Delete</button>
    </template>
    
    <!-- Custom empty state -->
    <template #empty>
      <EmptyState
        icon="🍽️"
        title="No menu items"
        description="Start by adding your first menu item"
      />
    </template>
  </DataTable>
</template>

<script setup lang="ts">
const columns = [
  { key: 'name', label: 'Name', sortable: true },
  { key: 'price', label: 'Price', sortable: true },
  { key: 'category', label: 'Category', sortable: true },
  { key: 'actions', label: 'Actions' }
]

const menuItems = ref([
  { name: 'Burger', price: 12.99, category: 'Main' },
  { name: 'Salad', price: 8.99, category: 'Appetizer' }
])
</script>
```

---

## Modal Components

Three modal variants are available: Base Modal, Confirm Dialog, and Form Dialog.

### Modal (Base)

Basic modal component for custom content.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `modelValue` | `boolean` | required | Controls modal visibility |
| `closeOnOverlay` | `boolean` | `true` | Close modal when clicking overlay |
| `size` | `'sm' \| 'md' \| 'lg' \| 'xl'` | `'md'` | Modal size |

#### Usage

```vue
<template>
  <Modal v-model="isOpen" size="lg">
    <div style="padding: 2rem;">
      <h2>Custom Modal Content</h2>
      <p>Your content here...</p>
    </div>
  </Modal>
</template>

<script setup lang="ts">
const isOpen = ref(false)
</script>
```

### ConfirmDialog

Pre-styled confirmation dialog with icon and actions.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `modelValue` | `boolean` | required | Controls dialog visibility |
| `title` | `string` | required | Dialog title |
| `message` | `string` | required | Dialog message |
| `confirmText` | `string` | `'Confirm'` | Confirm button text |
| `cancelText` | `string` | `'Cancel'` | Cancel button text |
| `variant` | `'primary' \| 'danger' \| 'warning'` | `'primary'` | Dialog style variant |
| `closeOnOverlay` | `boolean` | `true` | Close on overlay click |

#### Events

- `@confirm` - Emitted when confirm button is clicked
- `@cancel` - Emitted when cancel button is clicked

#### Usage

```vue
<template>
  <ConfirmDialog
    v-model="showDeleteConfirm"
    title="Delete Menu Item"
    message="Are you sure you want to delete this item? This action cannot be undone."
    confirm-text="Delete"
    cancel-text="Cancel"
    variant="danger"
    @confirm="handleDelete"
    @cancel="handleCancel"
  />
</template>

<script setup lang="ts">
const showDeleteConfirm = ref(false)

const handleDelete = () => {
  // Delete logic
}

const handleCancel = () => {
  // Cancel logic
}
</script>
```

### FormDialog

Modal optimized for forms with header, body, and footer.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `modelValue` | `boolean` | required | Controls dialog visibility |
| `title` | `string` | required | Dialog title |
| `submitText` | `string` | `'Submit'` | Submit button text |
| `cancelText` | `string` | `'Cancel'` | Cancel button text |
| `loading` | `boolean` | `false` | Show loading state on submit button |
| `closeOnOverlay` | `boolean` | `true` | Close on overlay click |
| `showFooter` | `boolean` | `true` | Show footer with buttons |
| `size` | `'sm' \| 'md' \| 'lg' \| 'xl'` | `'md'` | Dialog size |

#### Events

- `@submit` - Emitted when submit button is clicked
- `@cancel` - Emitted when cancel button is clicked

#### Slots

- `default` - Form content
- `footer` - Custom footer (replaces default buttons)

#### Usage

```vue
<template>
  <FormDialog
    v-model="showForm"
    title="Add Menu Item"
    submit-text="Save"
    :loading="saving"
    @submit="handleSubmit"
    @cancel="handleCancel"
  >
    <form @submit.prevent="handleSubmit">
      <div class="form-group">
        <label>Name</label>
        <input v-model="form.name" type="text" required />
      </div>
      <div class="form-group">
        <label>Price</label>
        <input v-model="form.price" type="number" step="0.01" required />
      </div>
    </form>
  </FormDialog>
</template>

<script setup lang="ts">
const showForm = ref(false)
const saving = ref(false)
const form = reactive({
  name: '',
  price: 0
})

const handleSubmit = async () => {
  saving.value = true
  try {
    // Save logic
    await saveMenuItem(form)
    showForm.value = false
  } finally {
    saving.value = false
  }
}
</script>
```

---

## Toast Notifications

Global toast notification system for user feedback.

### Toast Types

- `success` - Success messages (green)
- `error` - Error messages (red)
- `warning` - Warning messages (orange)
- `info` - Informational messages (blue)

### Usage

First, add the Toast component to your app.vue:

```vue
<!-- app.vue -->
<template>
  <div>
    <NuxtPage />
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

Then use the `useToast` composable anywhere:

```vue
<script setup lang="ts">
const { success, error, warning, info } = useToast()

// Simple message
const handleSuccess = () => {
  success('Item saved successfully!')
}

// With title and custom duration
const handleError = () => {
  error({
    title: 'Save Failed',
    message: 'Unable to save the item. Please try again.',
    duration: 8000 // 8 seconds
  })
}

// Warning
const handleWarning = () => {
  warning({
    title: 'Approaching Limit',
    message: 'You have used 45 of 50 menu items.'
  })
}

// Info
const handleInfo = () => {
  info('Your changes have been saved as draft.')
}
</script>
```

### Toast Options

```typescript
interface ToastOptions {
  title?: string      // Optional title
  message: string     // Required message
  duration?: number   // Duration in ms (default: 5000, 0 = no auto-close)
}
```

---

## LoadingSpinner

Simple loading spinner component.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Spinner size |

### Usage

```vue
<template>
  <div>
    <LoadingSpinner size="sm" />
    <LoadingSpinner size="md" />
    <LoadingSpinner size="lg" />
    
    <!-- In a button -->
    <button :disabled="loading">
      <LoadingSpinner v-if="loading" size="sm" />
      <span v-else>Save</span>
    </button>
  </div>
</template>
```

---

## EmptyState

Component for displaying empty states with icon, title, and optional action.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `icon` | `string` | `'📭'` | Emoji or icon to display |
| `title` | `string` | required | Empty state title |
| `description` | `string` | - | Optional description text |

### Slots

- `action` - Optional action button or link

### Usage

```vue
<template>
  <EmptyState
    icon="🍽️"
    title="No menu items yet"
    description="Start building your menu by adding your first item"
  >
    <template #action>
      <button @click="openAddForm">Add First Item</button>
    </template>
  </EmptyState>
</template>
```

---

## ErrorBoundary

Component for catching and displaying errors in child components.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | `string` | `'Something went wrong'` | Error title |
| `message` | `string` | `'An unexpected error occurred...'` | Error message |
| `showDetails` | `boolean` | `true` | Show error details toggle |

### Usage

Wrap any component that might throw errors:

```vue
<template>
  <ErrorBoundary>
    <SomeComponentThatMightFail />
  </ErrorBoundary>
</template>
```

Custom error messages:

```vue
<template>
  <ErrorBoundary
    title="Failed to Load Data"
    message="We couldn't load your menu items. Please check your connection and try again."
    :show-details="false"
  >
    <MenuItemList />
  </ErrorBoundary>
</template>
```

The ErrorBoundary provides:
- Automatic error catching from child components
- "Try Again" button to reset error state
- "Go to Dashboard" button for navigation
- Optional error details display for debugging

---

## Best Practices

### DataTable

- Use custom cell slots for complex rendering (actions, badges, formatted values)
- Enable sorting only for columns that make sense to sort
- Provide meaningful empty states
- Keep per-page values reasonable (10-50 items)

### Modals

- Use ConfirmDialog for destructive actions (delete, cancel)
- Use FormDialog for data entry
- Use base Modal for custom layouts
- Always provide clear titles and messages
- Use appropriate variants (danger for delete, warning for caution)

### Toast Notifications

- Use success for completed actions
- Use error for failures that need attention
- Use warning for non-critical issues
- Use info for neutral information
- Keep messages concise and actionable
- Don't overuse toasts - they can be disruptive

### EmptyState

- Use friendly, encouraging language
- Provide clear next steps via action slot
- Use relevant emojis/icons
- Keep descriptions brief

### ErrorBoundary

- Wrap entire page sections or complex components
- Provide context-specific error messages
- Hide technical details in production
- Always provide recovery options

---

## Styling

All components follow the project's SCSS guidelines:
- BEM methodology without nested selectors
- Variables for all values (colors, spacing, etc.)
- Co-located styles with components
- Responsive design with mobile-first approach

See `SCSS_RULES.md` for complete styling guidelines.
