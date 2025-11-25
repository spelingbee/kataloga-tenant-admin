# Menu Item Sales History - Quick Reference

## Overview
The Menu Item Sales History feature allows tenant admins with PRO or BUSINESS plans to view detailed sales history for individual menu items, including quantity sold, revenue, and sales trends over time.

## Components

### MenuItemSalesHistory.vue
**Location:** `components/dashboard/MenuItemSalesHistory.vue`

Main component that displays sales history for a specific menu item.

**Props:**
- `menuItemId` (string, required): ID of the menu item
- `menuItemName` (string, optional): Name of the menu item

**Features:**
- Date range filter
- Summary cards (total quantity, total revenue)
- Sales trend chart
- Sales records table
- Export to CSV (BUSINESS plan only)

**Usage:**
```vue
<MenuItemSalesHistory
  :menu-item-id="itemId"
  :menu-item-name="itemName"
  @close="handleClose"
/>
```

### ItemSalesTrendChart.vue
**Location:** `components/dashboard/ItemSalesTrendChart.vue`

Chart component that visualizes sales trends for a menu item.

**Props:**
- `sales` (SaleRecord[], required): Array of sale records

**Features:**
- Dual-axis chart (revenue and quantity)
- Interactive tooltips
- SVG-based rendering
- Responsive design

**Usage:**
```vue
<ItemSalesTrendChart :sales="salesHistory.sales" />
```

## Pages

### Item Sales History Page
**Location:** `pages/analytics/items/[id].vue`

Dedicated page for viewing item sales history.

**Route:** `/analytics/items/:id?name=ItemName`

**Query Parameters:**
- `name` (optional): Menu item name for display

## Store Methods

### Analytics Store
**Location:** `stores/analytics.ts`

**New Methods:**

#### fetchItemSalesHistory
```typescript
await analyticsStore.fetchItemSalesHistory(menuItemId, dateRange)
```
Fetches sales history for a specific menu item.

**Parameters:**
- `menuItemId` (string): ID of the menu item
- `dateRange` (optional): Object with `startDate` and `endDate`

**Returns:** Updates `itemSalesHistory` state

#### exportItemSalesHistory
```typescript
await analyticsStore.exportItemSalesHistory(menuItemId, dateRange)
```
Exports item sales history to CSV (BUSINESS plan only).

**Parameters:**
- `menuItemId` (string): ID of the menu item
- `dateRange` (optional): Object with `startDate` and `endDate`

**Returns:** Triggers CSV download

## Types

### MenuItemSalesHistory
```typescript
interface MenuItemSalesHistory {
  menuItemId: string
  menuItemName: string
  totalQuantity: number
  totalRevenue: number
  sales: SaleRecord[]
}
```

### SaleRecord
```typescript
interface SaleRecord {
  id: string
  date: string
  quantity: number
  totalAmount: number
}
```

## API Endpoints

### Get Item Sales History
```
GET /analytics/items/:id/history
```

**Query Parameters:**
- `startDate` (optional): Start date for filtering (YYYY-MM-DD)
- `endDate` (optional): End date for filtering (YYYY-MM-DD)

**Response:**
```json
{
  "menuItemId": "item_123",
  "menuItemName": "Margherita Pizza",
  "totalQuantity": 150,
  "totalRevenue": 2250.00,
  "sales": [
    {
      "id": "sale_1",
      "date": "2024-01-15",
      "quantity": 10,
      "totalAmount": 150.00
    }
  ]
}
```

### Export Item Sales History
```
GET /analytics/items/:id/history/export
```

**Query Parameters:**
- `startDate` (optional): Start date for filtering
- `endDate` (optional): End date for filtering
- `format`: Export format (default: 'csv')

**Response:** CSV file download

## Navigation

### From Top Selling Items Chart
Click on any item in the top-selling items chart to view its sales history.

**Implementation:**
```typescript
const viewItemHistory = (item: TopSellingItem) => {
  router.push({
    path: `/analytics/items/${item.menuItemId}`,
    query: { name: item.menuItemName },
  })
}
```

### Direct URL
Navigate directly to: `/analytics/items/:id?name=ItemName`

## Feature Access Control

The sales history feature requires PRO or BUSINESS plan:

```typescript
const { hasSalesAnalytics, hasDataExport } = useFeatureAccess()

// Sales history viewing: PRO or BUSINESS
if (hasSalesAnalytics.value) {
  // Show sales history
}

// CSV export: BUSINESS only
if (hasDataExport.value) {
  // Show export button
}
```

## Styling

All components follow the project SCSS rules:
- BEM methodology without nested selectors
- Variables for all values (colors, spacing, etc.)
- Co-located styles with components
- Responsive design with mobile breakpoints

## Date Formatting

### Display Format
```typescript
const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date)
}
```

### Currency Format
```typescript
const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value)
}
```

## Example Usage

### View Sales History from Analytics Dashboard
```vue
<template>
  <TopSellingItemsChart :items="topItems" />
</template>
```
Click on any item → Navigates to `/analytics/items/:id`

### Programmatic Navigation
```typescript
import { useRouter } from 'vue-router'

const router = useRouter()

const viewSalesHistory = (itemId: string, itemName: string) => {
  router.push({
    path: `/analytics/items/${itemId}`,
    query: { name: itemName },
  })
}
```

### Export Sales History
```typescript
import { useAnalyticsStore } from '~/stores/analytics'

const analyticsStore = useAnalyticsStore()

const exportHistory = async () => {
  const dateRange = {
    startDate: '2024-01-01',
    endDate: '2024-01-31',
  }
  await analyticsStore.exportItemSalesHistory(itemId, dateRange)
}
```

## Requirements Validation

This implementation satisfies the following requirements:

- **7.1**: Display sales history for specific item ✓
- **7.2**: Show total quantity sold and total revenue ✓
- **7.3**: Filter sales history by date range ✓
- **7.4**: Export to CSV (BUSINESS plan only) ✓
- **7.5**: Display sales trend chart for visual analysis ✓
- **7.6**: Navigate from analytics dashboard to item history ✓

## Testing

To test the implementation:

1. Navigate to `/analytics` (requires PRO/BUSINESS plan)
2. Click on any item in the "Top Selling Items" chart
3. Verify sales history page loads with item data
4. Test date range filter
5. Verify chart displays correctly
6. Test CSV export (BUSINESS plan only)
7. Test close button returns to analytics dashboard

## Notes

- Sales history is only available for PRO and BUSINESS plans
- CSV export is only available for BUSINESS plan
- Date range defaults to last 30 days
- Chart uses SVG rendering for consistency with other charts
- All data is filtered by tenant context automatically
