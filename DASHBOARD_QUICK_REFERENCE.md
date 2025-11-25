# Dashboard Quick Reference

## Overview

The Tenant Admin Dashboard provides a comprehensive overview of your restaurant's operations, including menu statistics, quick actions, and plan usage indicators.

## Components

### DashboardOverview
**Location**: `components/dashboard/DashboardOverview.vue`

Main dashboard component that orchestrates all dashboard features.

**Features**:
- Key metrics display
- Quick action buttons
- Plan usage indicators
- Recent activity feed
- Loading and error states

### PlanLimitIndicator
**Location**: `components/ui/PlanLimitIndicator.vue`

Displays current plan usage against limits with visual progress bars.

**Props**:
```typescript
{
  planName?: string           // Plan name (FREE, PRO, BUSINESS)
  current: PlanLimits        // Current usage
  max: PlanLimits            // Maximum limits
}
```

**Events**:
- `@upgrade` - Emitted when upgrade button is clicked

## Store

### Dashboard Store
**Location**: `stores/dashboard.ts`

**State**:
```typescript
{
  metrics: DashboardMetrics | null
  analytics: SalesAnalytics | null
  loading: boolean
  error: string | null
}
```

**Actions**:
- `fetchMetrics()` - Fetch menu and category counts
- `fetchAnalytics()` - Fetch sales data (PRO/BUSINESS only)
- `fetchDashboardData()` - Fetch all data
- `clearDashboard()` - Clear state

## API Endpoints Used

### Menu Metrics
```
GET /menu?page=1&limit=100
```
Returns menus with items for counting.

### Category Metrics
```
GET /categories?page=1&limit=1
```
Returns category count in meta.

### Analytics (PRO/BUSINESS only)
```
GET /analytics/overview?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
```
Returns sales analytics for the specified date range.

## Metrics Displayed

### Basic Metrics (All Plans)
1. **Total Menu Items** - Count of all menu items across all menus
2. **Active Menu Items** - Count of items with `isActive: true`
3. **Total Categories** - Count of all categories

### Premium Metrics (PRO/BUSINESS)
4. **Today's Revenue** - Total revenue for current day
5. **Today's Orders** - Total orders for current day

## Quick Actions

### Available to All Plans
- **Add Menu Item** → `/menu/items/new`
- **Manage Categories** → `/categories`
- **View All Items** → `/menu`

### Available to PRO/BUSINESS
- **View Analytics** → `/analytics`

## Plan Limits

### Progress Bar Colors
- **Green** (0-74%): Normal usage
- **Yellow** (75-89%): Approaching limit
- **Red** (90-100%): Critical usage

### Upgrade Prompt
Appears automatically when any limit reaches 75% usage.

## Usage Example

```vue
<template>
  <DashboardOverview />
</template>

<script setup>
import DashboardOverview from '~/components/dashboard/DashboardOverview.vue'

definePageMeta({
  middleware: ['auth']
})
</script>
```

## Customization

### Adding New Metrics
1. Update `DashboardMetrics` interface in `stores/dashboard.ts`
2. Fetch data in `fetchMetrics()` action
3. Add metric card in `DashboardOverview.vue`

### Adding Quick Actions
1. Add button in `quick-actions__grid` section
2. Use conditional rendering for plan-specific actions
3. Add SVG icon and navigation handler

### Styling
All styles use SCSS variables from `assets/scss/_variables.scss`:
- Colors: `$primary-color`, `$success-color`, etc.
- Spacing: `$spacing-sm`, `$spacing-md`, etc.
- Shadows: `$shadow-sm`, `$shadow-md`, etc.

## Error Handling

The dashboard handles errors gracefully:
- **Network errors**: Shows error message with retry button
- **403 Forbidden**: Silently skips analytics for FREE plan
- **Missing data**: Shows 0 for metrics

## Performance

- Metrics are fetched once on mount
- Analytics data is optional (won't block dashboard)
- Loading state prevents multiple simultaneous requests
- Error state allows manual retry

## Future Enhancements

- Real-time updates via WebSocket
- Customizable dashboard widgets
- Export dashboard data
- Dashboard preferences (show/hide sections)
- More detailed analytics charts
