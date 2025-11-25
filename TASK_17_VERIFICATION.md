# Task 17: Dish Availability Control - Verification Guide

## Overview
This document provides a comprehensive checklist to verify that all dish availability control features are working correctly.

## Prerequisites

### Backend Setup
- [ ] Backend server is running
- [ ] Database has test data:
  - [ ] At least one tenant
  - [ ] At least one menu
  - [ ] At least 5 menu items
  - [ ] At least 2 locations (for PRO/BUSINESS testing)
  - [ ] Menu items have location availability records

### Frontend Setup
- [ ] Tenant admin app is running
- [ ] User is authenticated
- [ ] User has TENANT_ADMIN or TENANT_STAFF role

## Test Cases

### 1. Global Availability Toggle

#### 1.1 Toggle from Menu List (Table View)
- [ ] Navigate to `/menu`
- [ ] Verify menu items are displayed in table
- [ ] Verify each item shows status badge (Active/Inactive)
- [ ] Active items show green "Active" badge
- [ ] Inactive items show gray "Inactive" badge

#### 1.2 Toggle from Menu Item Card
- [ ] Find an active menu item
- [ ] Verify green eye icon is displayed
- [ ] Click the eye icon
- [ ] Verify icon changes to crossed eye
- [ ] Verify red "Inactive" badge appears on image
- [ ] Click the eye icon again
- [ ] Verify icon changes back to green eye
- [ ] Verify "Inactive" badge disappears

#### 1.3 API Integration
- [ ] Open browser DevTools Network tab
- [ ] Toggle an item's availability
- [ ] Verify PATCH request to `/menu/:menuId/items/:itemId`
- [ ] Verify request body contains `isActive: true/false`
- [ ] Verify response is successful (200)
- [ ] Verify UI updates immediately

### 2. Location-Specific Availability (PRO/BUSINESS)

#### 2.1 Feature Access Check
- [ ] Verify user has PRO or BUSINESS plan
- [ ] Select one or more menu items
- [ ] Verify "Manage Locations" button appears in bulk actions
- [ ] If FREE plan, verify button does NOT appear

#### 2.2 Location Badges on Menu Item Card
- [ ] Set `showLocationAvailability={true}` on MenuItemCard
- [ ] Verify location badges section appears
- [ ] Verify each location shows as a badge
- [ ] Available locations show green badge
- [ ] Unavailable locations show gray badge
- [ ] Hover over badge shows tooltip with location name and status

#### 2.3 Quick Toggle from Badge
- [ ] Click on a green (available) location badge
- [ ] Verify badge turns gray
- [ ] Verify API call to PATCH `/menu-items/:id/locations/:locationId`
- [ ] Click on a gray (unavailable) location badge
- [ ] Verify badge turns green
- [ ] Verify API call is made

### 3. Location Availability Matrix

#### 3.1 Opening the Matrix
- [ ] Navigate to `/menu`
- [ ] Select 2-3 menu items using checkboxes
- [ ] Verify bulk actions bar appears
- [ ] Verify "Manage Locations" button is visible
- [ ] Click "Manage Locations"
- [ ] Verify modal opens with backdrop
- [ ] Verify modal shows "Manage Location Availability" title
- [ ] Verify close button (X) is visible

#### 3.2 Matrix Display
- [ ] Verify table is displayed
- [ ] Verify rows show selected menu items
- [ ] Each row shows:
  - [ ] Item image (or placeholder)
  - [ ] Item name
  - [ ] Item price
- [ ] Verify columns show locations
- [ ] Each column header shows:
  - [ ] Location name
  - [ ] Column toggle button
- [ ] Verify cells show toggle buttons
- [ ] Available cells show green background + checkmark
- [ ] Unavailable cells show white background + X icon

#### 3.3 Loading States
- [ ] Verify loading spinner appears while fetching locations
- [ ] Verify "Loading locations..." message
- [ ] After loading, verify table appears

#### 3.4 Empty State
- [ ] Test with tenant that has no locations
- [ ] Verify empty state message appears
- [ ] Verify message: "No locations found. Create locations first..."
- [ ] Verify location icon is displayed

#### 3.5 Error State
- [ ] Simulate API error (disconnect network)
- [ ] Verify error message appears
- [ ] Verify error icon is displayed
- [ ] Verify error text is shown

### 4. Bulk Operations

#### 4.1 Enable All
- [ ] Open location matrix with some unavailable items
- [ ] Click "Enable All" button
- [ ] Verify all toggle buttons turn green
- [ ] Verify all show checkmark icons
- [ ] Verify API call to POST `/menu-items/bulk-location-update`
- [ ] Verify request body:
  ```json
  {
    "menuItemIds": ["id1", "id2", ...],
    "locationIds": ["loc1", "loc2", ...],
    "isAvailable": true
  }
  ```

#### 4.2 Disable All
- [ ] Click "Disable All" button
- [ ] Verify all toggle buttons turn white
- [ ] Verify all show X icons
- [ ] Verify API call to POST `/menu-items/bulk-location-update`
- [ ] Verify `isAvailable: false` in request body

#### 4.3 Column Toggle
- [ ] Click column toggle button for first location
- [ ] Verify all items in that column toggle
- [ ] If all were available, they become unavailable
- [ ] If mixed or all unavailable, they become available
- [ ] Verify API call to POST `/menu-items/bulk-location-update`
- [ ] Verify only that location's ID in `locationIds` array

#### 4.4 Individual Toggle
- [ ] Click a single cell toggle button
- [ ] Verify only that cell changes state
- [ ] Verify API call to PATCH `/menu-items/:id/locations/:locationId`
- [ ] Verify other cells remain unchanged

### 5. Matrix Interactions

#### 5.1 Hover Effects
- [ ] Hover over toggle buttons
- [ ] Verify border color changes
- [ ] Hover over column toggle button
- [ ] Verify background color changes

#### 5.2 Disabled State
- [ ] While an API call is in progress
- [ ] Verify all buttons show reduced opacity
- [ ] Verify cursor changes to not-allowed
- [ ] Verify buttons don't respond to clicks

#### 5.3 Summary Display
- [ ] Verify summary at bottom of matrix
- [ ] Verify shows: "Managing availability for X item(s) across Y location(s)"
- [ ] Verify counts are correct

### 6. Modal Behavior

#### 6.1 Closing the Modal
- [ ] Click X button in header
- [ ] Verify modal closes
- [ ] Open modal again
- [ ] Click outside modal (on backdrop)
- [ ] Verify modal closes
- [ ] Open modal again
- [ ] Press Escape key
- [ ] Verify modal closes (if implemented)

#### 6.2 Scrolling
- [ ] Test with many items (10+)
- [ ] Verify modal content scrolls vertically
- [ ] Verify header stays fixed
- [ ] Test with many locations (5+)
- [ ] Verify table scrolls horizontally

#### 6.3 After Closing
- [ ] Make changes in matrix
- [ ] Close modal
- [ ] Verify menu list refreshes
- [ ] Verify changes are reflected

### 7. Store Integration

#### 7.1 Menu Store Actions
Open browser console and test:

```javascript
// Get menu store
const menuStore = useMenuStore()

// Test getLocationAvailability
await menuStore.getLocationAvailability('item-id')
// Verify returns array of LocationAvailability

// Test toggleLocationAvailability
await menuStore.toggleLocationAvailability('item-id', 'location-id')
// Verify toggles availability

// Test bulkUpdateLocationAvailability
await menuStore.bulkUpdateLocationAvailability(
  ['item1', 'item2'],
  ['loc1', 'loc2'],
  true
)
// Verify bulk update works
```

#### 7.2 State Updates
- [ ] Toggle availability
- [ ] Verify `menuStore.menuItems` updates
- [ ] Verify item's `locations` array updates
- [ ] Verify UI reflects state changes

### 8. Styling Verification

#### 8.1 SCSS Compliance
- [ ] Verify no hardcoded colors (all use variables)
- [ ] Verify BEM naming without nested selectors
- [ ] Verify proper spacing using variables
- [ ] Verify transitions are smooth
- [ ] Verify border-radius uses variables

#### 8.2 Responsive Design
- [ ] Test on desktop (1920x1080)
- [ ] Test on laptop (1366x768)
- [ ] Test on tablet (768x1024)
- [ ] Verify modal is responsive
- [ ] Verify table scrolls on small screens

#### 8.3 Visual Consistency
- [ ] Colors match design system
- [ ] Fonts match design system
- [ ] Spacing is consistent
- [ ] Icons are consistent size
- [ ] Buttons have consistent styling

### 9. Error Handling

#### 9.1 Network Errors
- [ ] Disconnect network
- [ ] Try to toggle availability
- [ ] Verify error is caught
- [ ] Verify user-friendly error message (if implemented)
- [ ] Reconnect network
- [ ] Verify functionality resumes

#### 9.2 Invalid Data
- [ ] Try to toggle non-existent item
- [ ] Verify 404 error is handled
- [ ] Try to toggle non-existent location
- [ ] Verify 404 error is handled

#### 9.3 Permission Errors
- [ ] Test with FREE plan user
- [ ] Try to access location features
- [ ] Verify 403 error is handled
- [ ] Verify features are hidden

### 10. Performance

#### 10.1 Load Times
- [ ] Measure time to load location matrix
- [ ] Should be < 2 seconds for 50 items
- [ ] Measure time to toggle single item
- [ ] Should be < 500ms

#### 10.2 Bulk Operations
- [ ] Test bulk update with 20 items x 5 locations
- [ ] Should complete in < 3 seconds
- [ ] Verify no UI freezing
- [ ] Verify loading indicators appear

### 11. Accessibility

#### 11.1 Keyboard Navigation
- [ ] Tab through toggle buttons
- [ ] Verify focus indicators are visible
- [ ] Press Enter/Space to toggle
- [ ] Verify toggles work

#### 11.2 Screen Reader
- [ ] Test with screen reader
- [ ] Verify buttons have proper labels
- [ ] Verify status changes are announced
- [ ] Verify modal has proper ARIA attributes

#### 11.3 Color Contrast
- [ ] Verify text has sufficient contrast
- [ ] Verify icons are visible
- [ ] Verify disabled states are distinguishable

## Requirements Checklist

### Requirement 5: Dish Availability Control
- [ ] 5.1: Toggle switch for dish availability in MenuItemCard ✓
- [ ] 5.2: Immediate update of isActive status ✓
- [ ] 5.3: Dish hidden from customer-facing menu when disabled ✓
- [ ] 5.4: Visual indicator for availability status ✓
- [ ] 5.5: Bulk enable/disable operations ✓

### Requirement 11: Location-Specific Dish Availability
- [ ] 11.1: Toggle dish availability for a location ✓
- [ ] 11.2: Display availability status for each location ✓
- [ ] 11.3: Hide dish from customer menu for specific location only ✓
- [ ] 11.4: Bulk updates with location selection ✓
- [ ] 11.5: Maintain global status separate from location-specific status ✓

## Known Issues

Document any issues found during testing:

1. **Issue:** [Description]
   - **Severity:** High/Medium/Low
   - **Steps to Reproduce:** [Steps]
   - **Expected:** [Expected behavior]
   - **Actual:** [Actual behavior]

## Sign-off

- [ ] All test cases passed
- [ ] All requirements validated
- [ ] No critical issues found
- [ ] Documentation is complete
- [ ] Ready for production

**Tested by:** _______________
**Date:** _______________
**Version:** _______________
