# Menu Item Form - Quick Reference

## Routes

| Route | Purpose | Component |
|-------|---------|-----------|
| `/menu` | Menu list | `pages/menu/index.vue` |
| `/menu/items/new` | Create new item | `pages/menu/items/new.vue` |
| `/menu/items/:id` | Edit existing item | `pages/menu/items/[id].vue` |

## Components

### MenuItemForm
**Location:** `components/menu/MenuItemForm.vue`

```vue
<MenuItemForm
  :initial-data="item"
  submit-label="Save"
  :loading="false"
  @submit="handleSubmit"
  @cancel="handleCancel"
/>
```

**Props:**
- `initialData?: Partial<MenuItem>` - Pre-fill form data
- `submitLabel?: string` - Button text (default: "Save")
- `loading?: boolean` - Show loading state

**Events:**
- `submit(data: Partial<MenuItem>)` - Form submitted
- `cancel()` - Cancel clicked

### MenuItemCard
**Location:** `components/menu/MenuItemCard.vue`

```vue
<MenuItemCard
  :item="menuItem"
  @toggle-availability="handleToggle"
  @edit="handleEdit"
  @delete="handleDelete"
/>
```

**Props:**
- `item: MenuItem` - Menu item to display

**Events:**
- `toggle-availability(id: string)` - Toggle clicked
- `edit(id: string)` - Edit clicked
- `delete(id: string)` - Delete clicked

## Form Fields

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| Name | Text | Yes | 1-100 chars |
| Description | Textarea | No | Max 500 chars |
| Price | Number | Yes | $0.01 - $999,999.99 |
| Image URL | URL | No | Valid URL, image extension |
| Category | Select | No | Valid category ID |
| Allergens | Text | No | Free text |
| Active | Checkbox | No | Boolean |

## Store Methods

```typescript
// Create
await menuStore.createMenuItem(menuId, data)

// Update
await menuStore.updateMenuItem(menuId, itemId, data)

// Delete
await menuStore.deleteMenuItem(menuId, itemId)

// Toggle
await menuStore.toggleAvailability(menuId, itemId)
```

## Validation Rules

```typescript
// Name
required: true
minLength: 1
maxLength: 100

// Description
maxLength: 500

// Price
required: true
min: 0.01
max: 999999.99
decimals: 2

// Image URL
pattern: /^https?:\/\/.+/
extension: /\.(jpg|jpeg|png|gif|webp)$/i
```

## Error Handling

```typescript
try {
  await menuStore.createMenuItem(menuId, data)
  // Success - navigate away
} catch (error) {
  // Show error message
  error.value = error.response?.data?.message || 'Failed to create'
}
```

## Navigation

```typescript
// Go to create page
navigateTo('/menu/items/new')

// Go to edit page
navigateTo(`/menu/items/${itemId}`)

// Go back to menu list
navigateTo('/menu')
```

## Common Patterns

### Create Flow
```typescript
const handleCreate = async (data: Partial<MenuItem>) => {
  loading.value = true
  try {
    await menuStore.createMenuItem(menuStore.currentMenu.id, data)
    await router.push('/menu')
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}
```

### Edit Flow
```typescript
const handleUpdate = async (data: Partial<MenuItem>) => {
  loading.value = true
  try {
    await menuStore.updateMenuItem(menuStore.currentMenu.id, itemId, data)
    await router.push('/menu')
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}
```

### Delete Flow
```typescript
const handleDelete = async (itemId: string) => {
  if (confirm('Delete this item?')) {
    try {
      await menuStore.deleteMenuItem(menuStore.currentMenu.id, itemId)
    } catch (err) {
      console.error('Delete failed:', err)
    }
  }
}
```

## Styling Classes

### Form
- `.menu-item-form` - Main container
- `.menu-item-form__section` - Form section
- `.menu-item-form__field` - Form field wrapper
- `.menu-item-form__label` - Field label
- `.menu-item-form__input` - Text input
- `.menu-item-form__textarea` - Textarea
- `.menu-item-form__select` - Select dropdown
- `.menu-item-form__error` - Error message
- `.menu-item-form__button` - Button

### Card
- `.menu-item-card` - Main container
- `.menu-item-card__image` - Item image
- `.menu-item-card__title` - Item name
- `.menu-item-card__price` - Item price
- `.menu-item-card__description` - Item description
- `.menu-item-card__category` - Category badge
- `.menu-item-card__actions` - Action buttons

## Testing Checklist

- [ ] Create with all fields
- [ ] Create with required only
- [ ] Edit existing item
- [ ] Validate all fields
- [ ] Test image preview
- [ ] Test cancel button
- [ ] Test error handling
- [ ] Test navigation
- [ ] Test responsive design

## Troubleshooting

**Form not submitting?**
- Check required fields are filled
- Check validation errors
- Check console for errors

**Image not showing?**
- Check URL is valid
- Check image is publicly accessible
- Check CORS settings

**Categories not loading?**
- Check categories exist
- Check category store
- Check API connection

**Changes not saving?**
- Check backend is running
- Check network tab for errors
- Check store methods

## Quick Commands

```bash
# Start backend
cd apps/backend && npm run start:dev

# Start tenant-admin
cd apps/tenant-admin && npm run dev

# Check diagnostics
# Use getDiagnostics tool in Kiro
```
