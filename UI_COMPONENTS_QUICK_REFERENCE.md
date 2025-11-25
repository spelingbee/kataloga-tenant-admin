# UI Components Quick Reference

Quick reference for all reusable UI components.

## Import Components

```typescript
// Individual imports
import DataTable from '~/components/ui/DataTable/DataTable.vue'
import Modal from '~/components/ui/Modal.vue'
import ConfirmDialog from '~/components/ui/Modal/ConfirmDialog.vue'
import FormDialog from '~/components/ui/Modal/FormDialog.vue'
import Toast from '~/components/ui/Toast/Toast.vue'
import LoadingSpinner from '~/components/ui/LoadingSpinner.vue'
import EmptyState from '~/components/ui/EmptyState.vue'
import ErrorBoundary from '~/components/ui/ErrorBoundary.vue'

// Bulk import (if needed)
import { DataTable, Modal, ConfirmDialog, FormDialog } from '~/components/ui'
```

## DataTable

```vue
<DataTable
  :columns="[
    { key: 'name', label: 'Name', sortable: true },
    { key: 'price', label: 'Price', sortable: true }
  ]"
  :data="items"
  searchable
  :per-page="10"
>
  <template #cell-price="{ value }">
    ${{ value.toFixed(2) }}
  </template>
</DataTable>
```

## Modal

```vue
<Modal v-model="isOpen" size="md">
  <div style="padding: 2rem;">Content</div>
</Modal>
```

## ConfirmDialog

```vue
<ConfirmDialog
  v-model="show"
  title="Delete Item"
  message="Are you sure?"
  variant="danger"
  @confirm="handleDelete"
/>
```

## FormDialog

```vue
<FormDialog
  v-model="show"
  title="Add Item"
  :loading="saving"
  @submit="handleSubmit"
>
  <form><!-- fields --></form>
</FormDialog>
```

## Toast

```typescript
const { success, error, warning, info } = useToast()

success('Saved!')
error({ title: 'Error', message: 'Failed to save' })
warning('Approaching limit')
info('Session expires soon')
```

## LoadingSpinner

```vue
<LoadingSpinner size="sm" />
<LoadingSpinner size="md" />
<LoadingSpinner size="lg" />
```

## EmptyState

```vue
<EmptyState
  icon="🍽️"
  title="No items"
  description="Add your first item"
>
  <template #action>
    <button>Add Item</button>
  </template>
</EmptyState>
```

## ErrorBoundary

```vue
<ErrorBoundary>
  <ComponentThatMightFail />
</ErrorBoundary>
```

## Common Patterns

### CRUD List with DataTable

```vue
<DataTable :columns="columns" :data="items" searchable>
  <template #cell-actions="{ row }">
    <button @click="edit(row)">Edit</button>
    <button @click="confirmDelete(row)">Delete</button>
  </template>
  <template #empty>
    <EmptyState title="No items" />
  </template>
</DataTable>
```

### Delete Confirmation

```vue
<ConfirmDialog
  v-model="showConfirm"
  title="Delete Item"
  message="This cannot be undone"
  variant="danger"
  @confirm="async () => {
    await deleteItem()
    success('Deleted!')
  }"
/>
```

### Form with Loading

```vue
<FormDialog
  v-model="showForm"
  title="Edit Item"
  :loading="saving"
  @submit="async () => {
    saving = true
    try {
      await save()
      success('Saved!')
      showForm = false
    } catch (e) {
      error('Failed to save')
    } finally {
      saving = false
    }
  }"
>
  <form><!-- fields --></form>
</FormDialog>
```

### Loading State

```vue
<button :disabled="loading">
  <LoadingSpinner v-if="loading" size="sm" />
  <span v-else>Save</span>
</button>
```

### Error Handling

```vue
<ErrorBoundary
  title="Failed to Load"
  message="Check your connection"
>
  <DataList />
</ErrorBoundary>
```

## Styling Tips

All components use SCSS variables:

```scss
@use '@/assets/scss/variables' as *;

.custom-component {
  padding: $spacing-md;
  background: $bg-primary;
  border: 1px solid $border-color;
  border-radius: $radius-md;
  color: $text-primary;
}
```

Common variables:
- Colors: `$primary-color`, `$success-color`, `$error-color`, `$warning-color`
- Spacing: `$spacing-xs`, `$spacing-sm`, `$spacing-md`, `$spacing-lg`, `$spacing-xl`
- Radius: `$radius-sm`, `$radius-md`, `$radius-lg`
- Text: `$text-primary`, `$text-secondary`, `$text-light`
- Background: `$bg-primary`, `$bg-secondary`, `$bg-tertiary`

## Component Sizes

### Modal Sizes
- `sm`: 400px
- `md`: 600px (default)
- `lg`: 800px
- `xl`: 1200px

### Spinner Sizes
- `sm`: 16px
- `md`: 24px (default)
- `lg`: 32px

## Best Practices

1. **Always provide feedback**: Use toasts for user actions
2. **Confirm destructive actions**: Use ConfirmDialog for delete/cancel
3. **Show loading states**: Use LoadingSpinner during async operations
4. **Handle empty states**: Use EmptyState with clear actions
5. **Catch errors**: Wrap components with ErrorBoundary
6. **Keep modals focused**: One purpose per modal
7. **Make tables searchable**: Enable search for large datasets
8. **Provide clear messages**: Be specific in titles and descriptions

## Accessibility

All components include:
- Keyboard navigation support
- ARIA labels where appropriate
- Focus management in modals
- Screen reader friendly markup
- Semantic HTML elements

## Performance

- DataTable: Virtualization for 1000+ rows (use pagination)
- Modals: Teleported to body, lazy rendered
- Toast: Auto-cleanup after duration
- ErrorBoundary: Prevents error propagation

## Browser Support

All components work in:
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)
