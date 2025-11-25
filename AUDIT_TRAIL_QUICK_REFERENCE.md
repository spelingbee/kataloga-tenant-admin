# Audit Trail Quick Reference

## Overview
The Audit Trail feature provides complete change history for all tenant operations including menu, category, and location modifications. This feature is only available for PRO and BUSINESS plans.

## Components

### 1. AuditLogList Component
**Location:** `components/ui/AuditLogList.vue`

**Features:**
- Display audit logs in a table format
- Filter by entity type (menu, menu_item, category, location)
- Filter by action (CREATE, UPDATE, DELETE, BULK_UPDATE)
- Filter by date range (start date and end date)
- Pagination support (50 items per page)
- View detailed information for each log entry

**Usage:**
```vue
<template>
  <AuditLogList />
</template>
```

### 2. AuditLogDetails Component
**Location:** `components/ui/AuditLogDetails.vue`

**Features:**
- Display detailed information about a specific audit log
- Show user information (name, email, ID)
- Display before/after values for changes
- Format changes in a readable way
- Show raw JSON for complex changes

**Usage:**
```vue
<template>
  <AuditLogDetails :log="selectedLog" />
</template>
```

## API Endpoint

### GET /tenant/audit
Retrieve audit logs for the authenticated tenant.

**Query Parameters:**
- `entityType` (optional): Filter by entity type (menu, menu_item, category, location, menu_item_location)
- `action` (optional): Filter by action (MENU_CREATE, MENU_UPDATE, MENU_DELETE, MENU_BULK_UPDATE)
- `startDate` (optional): Start date for filtering (ISO 8601 format)
- `endDate` (optional): End date for filtering (ISO 8601 format)
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 50, max: 100)

**Response:**
```json
{
  "data": [
    {
      "id": "log-123",
      "action": "MENU_ITEM_UPDATE",
      "resource": "menu_item",
      "resourceId": "item-456",
      "user": {
        "id": "user-789",
        "email": "admin@example.com",
        "firstName": "John",
        "lastName": "Doe"
      },
      "details": {
        "tenantId": "tenant-123",
        "menuItemId": "item-456",
        "changes": {
          "price": {
            "before": 10.99,
            "after": 12.99
          }
        }
      },
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 50,
    "total": 150,
    "totalPages": 3,
    "hasNextPage": true,
    "hasPreviousPage": false
  }
}
```

## Page Route

### /audit
Main audit trail page that displays the audit log list.

**Access:** Requires PRO or BUSINESS plan (AUDIT_TRAIL feature)

**Middleware:** `auth` (requires authentication)

## Feature Access Control

The audit trail feature is protected by the `AUDIT_TRAIL` feature key. Users without this feature will be redirected to the subscription upgrade page.

**Feature Check:**
```typescript
const { hasFeature, redirectToUpgrade } = useFeatureAccess();

onMounted(async () => {
  const hasAccess = await hasFeature('audit_trail');
  if (!hasAccess) {
    redirectToUpgrade('audit_trail');
  }
});
```

## Styling

All components follow the project's SCSS guidelines:
- BEM methodology without nested selectors
- Variables for all colors, spacing, and other design tokens
- Component-specific styles in separate SCSS files
- Maximum 2-3 levels of nesting with context

**SCSS Files:**
- `components/ui/_audit-log-list.scss`
- `components/ui/_audit-log-details.scss`

## Filter Options

### Entity Types
- `menu` - Menu operations
- `menu_item` - Menu item operations
- `category` - Category operations
- `location` - Location operations
- `menu_item_location` - Item location availability operations

### Actions
- `MENU_CREATE` - Resource creation
- `MENU_UPDATE` - Resource update
- `MENU_DELETE` - Resource deletion
- `MENU_BULK_UPDATE` - Bulk operations

## Date Formatting

Dates are displayed in a human-readable format:
- List view: `Jan 15, 2024, 10:30 AM`
- Details view: `January 15, 2024, 10:30:00 AM`

## Pagination

- Default: 50 items per page
- Maximum: 100 items per page
- Navigation: Previous/Next buttons
- Display: Current page and total pages

## Error Handling

The component handles the following error scenarios:
- Loading state with spinner
- Error state with retry button
- Empty state when no logs found
- Feature access denied (redirects to upgrade page)

## Future Enhancements

1. Export audit logs to CSV/Excel (BUSINESS plan)
2. Advanced filtering (by user, by specific resource ID)
3. Audit log statistics and charts
4. Real-time updates using WebSockets
5. Audit log retention policies
6. Audit log search functionality

## Requirements Validation

This implementation satisfies the following requirements:
- **14.1**: Display audit logs with timestamp and user information ✓
- **14.2**: Show who made changes (user name and email) ✓
- **14.3**: Filter by date range and entity type ✓
- **14.4**: Display before and after values for changes ✓
- **14.5**: Display only changes for authenticated tenant's data ✓

## Testing

To test the audit trail feature:

1. Navigate to `/audit` page
2. Verify feature access control (should redirect if FREE plan)
3. Test filtering by entity type
4. Test filtering by action
5. Test date range filtering
6. Test pagination
7. Test viewing detailed information
8. Verify proper display of before/after values
