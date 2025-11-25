# Menu List Component - Usage Guide

## Overview

The MenuItemList component provides a comprehensive interface for viewing and managing menu items with search, filtering, pagination, and bulk operations.

## Basic Usage

### In a Page

```vue
<template>
  <div class="menu-page">
    <MenuItemList />
  </div>
</template>

<script setup lang="ts">
import MenuItemList from '~/components/menu/MenuItemList.vue'

definePageMeta({
  middleware: ['auth']
})
</script>
```

## Store Usage

### Accessing Menu Store

```typescript
import { useMenuStore } from '~/stores/menu'

const menuStore = useMenuStore()

// Fetch menus
await menuStore.fetchMenus()

// Fetch menu items with filters
await menuStore.fetchMenuItems('menu-id', {
  page: 1,
  limit: 20,
  search: 'pizza',
  categoryId: 'category-id',
  isActive: true,
  minPrice: 10,
  maxPrice: 50
})

// Create menu item
await menuStore.createMenuItem('menu-id', {
  name: 'Margherita Pizza',
  description: 'Classic pizza with tomato and mozzarella',
  price: 12.99,
  categoryId: 'category-id',
  isActive: true
})

// Update menu item
await menuStore.updateMenuItem('menu-id', 'item-id', {
  price: 14.99
})

// Delete menu item
await menuStore.deleteMenuItem('menu-id', 'item-id')

// Toggle availability
await menuStore.toggleAvailability('menu-id', 'item-id')

// Bulk update
await menuStore.bulkUpdateItems('menu-id', ['item-1', 'item-2'], {
  isActive: false
})
```

### Selection Management

```typescript
// Toggle single item selection
menuStore.toggleItemSelection('item-id')

// Select all items on current page
menuStore.selectAllItems()

// Clear all selections
menuStore.clearSelection()

// Check if item is selected
const isSelected = menuStore.isItemSelected('item-id')

// Get selected items
const selectedCount = menuStore.selectedItemsCount
const selectedItems = menuStore.selectedItemsList
```

## Features

### 1. Search

- Real-time search with 500ms debounce
- Searches menu item names
- Clears on filter reset

### 2. Filters

**Category Filter:**
```typescript
// Filter by category
filters.categoryId = 'category-id'
```

**Status Filter:**
```typescript
// Show only active items
filters.isActive = 'true'

// Show only inactive items
filters.isActive = 'false'

// Show all items
filters.isActive = ''
```

**Price Range Filter:**
```typescript
// Filter by price range
filters.minPrice = 10
filters.maxPrice = 50
```

### 3. Pagination

- 20 items per page (configurable)
- Previous/Next navigation
- Direct page number selection
- Shows current page and total pages
- Displays total items count

### 4. Bulk Operations

**Bulk Activate:**
1. Select items using checkboxes
2. Click "Activate" button
3. Confirm action
4. Items are activated

**Bulk Deactivate:**
1. Select items using checkboxes
2. Click "Deactivate" button
3. Confirm action
4. Items are deactivated

### 5. Individual Actions

**Edit:**
- Click edit icon
- Navigates to `/menu/items/:id`

**Delete:**
- Click delete icon
- Confirm deletion
- Item is removed

## Customization

### Changing Items Per Page

In `MenuItemList.vue`:

```typescript
const loadMenuItems = async () => {
  const params = {
    page: currentPage.value,
    limit: 50, // Change from 20 to 50
    // ... other params
  }
  await menuStore.fetchMenuItems(menuStore.currentMenu.id, params)
}
```

### Custom Filters

Add new filter in component:

```vue
<select v-model="filters.locationId" @change="applyFilters">
  <option value="">All Locations</option>
  <option v-for="location in locations" :key="location.id" :value="location.id">
    {{ location.name }}
  </option>
</select>
```

Update filter params:

```typescript
const params = {
  // ... existing params
  locationId: filters.value.locationId || undefined,
}
```

### Styling Customization

Modify `_menu-item-list.scss`:

```scss
// Change primary color for selected items
.menu-item-list__row--selected {
  background: rgba($success-color, 0.05); // Instead of primary
}

// Change pagination button style
.pagination-btn {
  border-radius: $radius-lg; // Instead of md
}
```

## API Requirements

The component expects these backend endpoints:

### GET /menu
Returns array of menus for the tenant.

### GET /menu/:menuId/items
Returns paginated menu items with filters.

**Query Parameters:**
- `page` (number): Page number
- `limit` (number): Items per page
- `sortBy` (string): Sort field
- `sortOrder` ('asc' | 'desc'): Sort direction
- `search` (string): Search query
- `categoryId` (string): Filter by category
- `minPrice` (number): Minimum price
- `maxPrice` (number): Maximum price
- `isActive` (boolean): Filter by status
- `locationId` (string): Filter by location

**Response:**
```json
{
  "data": [
    {
      "id": "item-1",
      "name": "Margherita Pizza",
      "description": "Classic pizza",
      "price": 12.99,
      "imageUrl": "https://...",
      "isActive": true,
      "categoryId": "category-1",
      "category": {
        "id": "category-1",
        "name": "Pizzas"
      }
    }
  ],
  "total": 100,
  "page": 1,
  "limit": 20,
  "totalPages": 5
}
```

### POST /menu/:menuId/items
Create new menu item.

### PATCH /menu/:menuId/items/:itemId
Update menu item.

### DELETE /menu/:menuId/items/:itemId
Delete menu item.

### POST /menu/:menuId/items/bulk-update
Bulk update menu items.

**Request Body:**
```json
{
  "itemIds": ["item-1", "item-2"],
  "data": {
    "isActive": false
  }
}
```

## Error Handling

The component handles these error scenarios:

1. **Loading Error**: Shows error message with retry button
2. **Empty State**: Shows when no items exist
3. **API Errors**: Displays error from API response
4. **Network Errors**: Shows generic error message

## Accessibility

- Keyboard navigation supported
- Semantic HTML elements
- ARIA labels on interactive elements
- Focus states on all interactive elements
- Color contrast meets WCAG standards

## Performance

- Debounced search (500ms)
- Pagination limits data load
- Efficient re-renders with computed properties
- Lazy loading of images (browser native)

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- ES6+ features used
- CSS Grid and Flexbox for layout

## Future Enhancements

Potential improvements for future tasks:

1. **Advanced Sorting**: Click column headers to sort
2. **Column Visibility**: Toggle which columns to show
3. **Export**: Export filtered results to CSV
4. **Saved Filters**: Save and load filter presets
5. **Drag & Drop**: Reorder items
6. **Inline Editing**: Edit price/status without navigation
7. **Image Preview**: Hover to see larger image
8. **Keyboard Shortcuts**: Quick actions with keyboard
