# Dish Availability Control - Quick Reference

## Overview
Control which dishes are visible to customers globally and per location (PRO/BUSINESS plans).

## Global Availability Toggle

### In Menu List (Table View)
- Each menu item row shows current status (Active/Inactive)
- Status badge: Green for Active, Gray for Inactive

### In Menu Item Card
- Click the **eye icon** button to toggle availability
- **Green eye** = Active (visible to customers)
- **Crossed eye** = Inactive (hidden from customers)
- Inactive items show a red "Inactive" badge on the image

### Quick Actions
```
1. Navigate to Menu Management page
2. Find the item you want to toggle
3. Click the eye icon button
4. Status updates immediately
```

## Location-Specific Availability (PRO/BUSINESS)

### Prerequisites
- PRO or BUSINESS plan subscription
- At least one location created

### Viewing Location Availability
Location badges appear on MenuItemCard when:
- `showLocationAvailability` prop is true
- Item has location data loaded

**Badge Colors:**
- **Green** = Available at this location
- **Gray** = Unavailable at this location

### Quick Toggle Single Location
```
1. Click on a location badge on MenuItemCard
2. Availability toggles immediately
3. Badge color updates
```

## Bulk Location Management

### Opening the Location Matrix
```
1. Go to Menu Management page
2. Select multiple items using checkboxes
3. Click "Manage Locations" button in bulk actions bar
4. Location matrix modal opens
```

### Using the Location Matrix

#### Matrix Layout
- **Rows**: Menu items (with image, name, price)
- **Columns**: Locations
- **Cells**: Toggle buttons (checkmark = available, X = unavailable)

#### Bulk Actions

**Enable All Locations for All Items**
```
1. Click "Enable All" button at top
2. All items become available at all locations
```

**Disable All Locations for All Items**
```
1. Click "Disable All" button at top
2. All items become unavailable at all locations
```

**Toggle All Items for One Location**
```
1. Click the toggle button in the location column header
2. All selected items toggle for that location
```

**Toggle Individual Item-Location**
```
1. Click the toggle button in the specific cell
2. That item's availability toggles for that location only
```

### Closing the Matrix
```
1. Click the X button in modal header
2. Click outside the modal
3. Changes are saved automatically
```

## API Endpoints

### Get Location Availability
```
GET /menu-items/:id/locations
Response: LocationAvailabilityDto[]
```

### Update Single Location
```
PATCH /menu-items/:id/locations/:locationId
Body: { isAvailable: boolean }
Response: LocationAvailabilityDto
```

### Bulk Update Locations
```
POST /menu-items/bulk-location-update
Body: {
  menuItemIds: string[],
  locationIds: string[],
  isAvailable: boolean
}
Response: BulkLocationAvailabilityResponseDto
```

## Component Usage

### MenuItemCard with Location Indicators
```vue
<MenuItemCard
  :item="menuItem"
  :show-location-availability="true"
  @toggle-availability="handleToggle"
  @toggle-location="handleLocationToggle"
  @edit="handleEdit"
  @delete="handleDelete"
/>
```

### LocationAvailabilityMatrix
```vue
<LocationAvailabilityMatrix
  :items="selectedMenuItems"
  @update="handleLocationUpdate"
/>
```

## Store Actions

### Toggle Global Availability
```typescript
await menuStore.toggleAvailability(menuId, itemId)
```

### Get Location Availability
```typescript
const locations = await menuStore.getLocationAvailability(itemId)
```

### Toggle Location Availability
```typescript
await menuStore.toggleLocationAvailability(itemId, locationId)
```

### Bulk Update Locations
```typescript
await menuStore.bulkUpdateLocationAvailability(
  itemIds,
  locationIds,
  isAvailable
)
```

## Feature Access Check

```typescript
import { useFeatureAccess } from '~/composables/useFeatureAccess'

const { hasMultiLocation } = useFeatureAccess()

// In template
<div v-if="hasMultiLocation">
  <!-- Location-specific features -->
</div>
```

## Visual States

### Menu Item Card States
| State | Visual Indicator |
|-------|-----------------|
| Active | Green eye icon |
| Inactive | Crossed eye icon + Red "Inactive" badge |
| Available at location | Green location badge |
| Unavailable at location | Gray location badge |

### Matrix Toggle States
| State | Visual Indicator |
|-------|-----------------|
| Available | Green background + Checkmark icon |
| Unavailable | White background + X icon |
| Hover | Border color changes |
| Disabled | Reduced opacity |

## Common Workflows

### Scenario 1: Temporarily Disable a Dish
```
1. Find the dish in menu list
2. Click the eye icon to deactivate
3. Dish is now hidden from all customers
4. Click eye icon again to reactivate
```

### Scenario 2: Dish Available at Some Locations Only
```
1. Select the dish (checkbox)
2. Click "Manage Locations"
3. Disable all locations (click "Disable All")
4. Enable only specific locations (click individual toggles)
5. Close modal
```

### Scenario 3: Seasonal Menu for One Location
```
1. Select all seasonal items (checkboxes)
2. Click "Manage Locations"
3. Click the column toggle for the seasonal location
4. All items become available at that location
5. Close modal
```

### Scenario 4: Bulk Deactivate Items
```
1. Select multiple items (checkboxes)
2. Click "Deactivate" in bulk actions
3. All selected items become inactive globally
```

## Troubleshooting

### Location Features Not Visible
- Check if you have PRO or BUSINESS plan
- Verify MULTI_LOCATION feature is enabled
- Check if locations exist in the system

### Changes Not Saving
- Check browser console for API errors
- Verify authentication token is valid
- Check network connectivity

### Matrix Not Loading
- Verify locations exist
- Check API endpoint is accessible
- Look for error messages in the modal

## Best Practices

1. **Use Global Toggle for Permanent Changes**
   - Discontinued items
   - Out of season items

2. **Use Location Toggle for Temporary Changes**
   - Ingredient shortages at specific locations
   - Location-specific specials
   - Testing new items at select locations

3. **Use Bulk Operations for Efficiency**
   - Seasonal menu changes
   - Location openings/closings
   - Category-wide updates

4. **Regular Audits**
   - Review inactive items monthly
   - Check location availability consistency
   - Remove permanently discontinued items

## Related Documentation

- [Menu Management Guide](./MENU_LIST_USAGE.md)
- [Menu Item Form Guide](./MENU_ITEM_FORM_QUICK_REFERENCE.md)
- [Task 17 Implementation](./TASK_17_IMPLEMENTATION.md)
