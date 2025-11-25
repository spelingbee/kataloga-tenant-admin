# Location Management - Quick Reference

## Overview
The Location Management feature allows PRO and BUSINESS plan users to manage multiple restaurant/cafe locations with location-specific menu availability.

## Access
- **URL**: `/locations`
- **Required Plan**: PRO or BUSINESS
- **Required Role**: TENANT_ADMIN or TENANT_STAFF

## Features

### 1. View Locations
- Grid layout showing all locations
- Each card displays:
  - Location name
  - Address and city
  - Contact info (phone, email)
  - Status badge (Active/Inactive)
  - Items available count
- Empty state when no locations exist

### 2. Add Location
1. Click "Add Location" button
2. Fill in required fields:
   - Location Name
   - Address
   - City
3. Optionally add:
   - Phone number
   - Email address
4. Click "Create Location"

### 3. Edit Location
1. Click edit button (✏️) on location card
2. Modify any field
3. Toggle "Active Location" checkbox if needed
4. Click "Update Location"

### 4. Toggle Location Status
- Click toggle button (⏸️ for active, ▶️ for inactive)
- Status changes immediately
- Inactive locations appear dimmed

### 5. Delete Location
1. Click delete button (🗑️)
2. Confirm deletion in dialog
3. Location is permanently removed

## API Endpoints

### Get All Locations
```
GET /locations
Authorization: Bearer {token}
```

### Get Location Stats
```
GET /locations/:id/stats
Authorization: Bearer {token}
```

### Create Location
```
POST /locations
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Downtown Branch",
  "address": "123 Main Street",
  "city": "New York",
  "phone": "+1 (555) 123-4567",
  "email": "downtown@restaurant.com"
}
```

### Update Location
```
PATCH /locations/:id
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Downtown Branch - Updated",
  "isActive": false
}
```

### Delete Location
```
DELETE /locations/:id
Authorization: Bearer {token}
```

## Store Usage

### Import Store
```typescript
import { useLocationStore } from '~/stores/location'

const locationStore = useLocationStore()
```

### Fetch Locations
```typescript
await locationStore.fetchLocations()
```

### Create Location
```typescript
const newLocation = await locationStore.createLocation({
  name: 'Downtown Branch',
  address: '123 Main Street',
  city: 'New York',
  phone: '+1 (555) 123-4567',
  email: 'downtown@restaurant.com'
})
```

### Update Location
```typescript
await locationStore.updateLocation(locationId, {
  name: 'Updated Name',
  isActive: false
})
```

### Toggle Status
```typescript
await locationStore.toggleLocationStatus(locationId)
```

### Delete Location
```typescript
await locationStore.deleteLocation(locationId)
```

### Get Location by ID
```typescript
const location = locationStore.getLocationById(locationId)
```

### Get Active Locations
```typescript
const activeLocations = locationStore.activeLocations
```

## Component Usage

### LocationList Component
```vue
<template>
  <LocationList
    :locations="locationStore.locations"
    :loading="locationStore.loading"
    @add="handleAdd"
    @edit="handleEdit"
    @toggleStatus="handleToggleStatus"
    @delete="handleDelete"
  />
</template>

<script setup lang="ts">
import LocationList from '~/components/location/LocationList.vue'

const locationStore = useLocationStore()

const handleAdd = () => {
  // Open add form
}

const handleEdit = (location: Location) => {
  // Open edit form with location data
}

const handleToggleStatus = async (locationId: string) => {
  await locationStore.toggleLocationStatus(locationId)
}

const handleDelete = async (locationId: string) => {
  await locationStore.deleteLocation(locationId)
}
</script>
```

### LocationForm Component
```vue
<template>
  <LocationForm
    :location="selectedLocation"
    :loading="loading"
    @submit="handleSubmit"
    @cancel="handleCancel"
  />
</template>

<script setup lang="ts">
import LocationForm from '~/components/location/LocationForm.vue'

const selectedLocation = ref<Location | null>(null)
const loading = ref(false)

const handleSubmit = async (data: LocationFormData) => {
  loading.value = true
  try {
    if (selectedLocation.value) {
      await locationStore.updateLocation(selectedLocation.value.id, data)
    } else {
      await locationStore.createLocation(data)
    }
  } finally {
    loading.value = false
  }
}

const handleCancel = () => {
  // Close form
}
</script>
```

## Feature Access Check

### In Component
```vue
<script setup lang="ts">
const { hasMultiLocation } = useFeatureAccess()

// Show upgrade prompt if feature not available
if (!hasMultiLocation.value) {
  // Display upgrade prompt
}
</script>
```

### In Middleware
```typescript
// middleware/location-access.ts
export default defineNuxtRouteMiddleware((to, from) => {
  const { hasMultiLocation } = useFeatureAccess()
  
  if (!hasMultiLocation.value) {
    return navigateTo('/subscription')
  }
})
```

## Styling

### SCSS Variables Used
```scss
// Colors
$primary-color
$success-color
$error-color
$text-primary
$text-secondary
$bg-primary
$bg-secondary
$border-color

// Spacing
$spacing-xs, $spacing-sm, $spacing-md, $spacing-lg, $spacing-xl

// Radius
$radius-sm, $radius-md, $radius-lg, $radius-full

// Shadows
$shadow-sm, $shadow-md, $shadow-lg

// Transitions
$transition-base

// Breakpoints
$breakpoint-md
```

### BEM Classes
```scss
// LocationList
.location-list
.location-list__header
.location-list__title
.location-list__add-btn
.location-list__grid
.location-card
.location-card__status
.location-card__name
.location-card__actions

// LocationForm
.location-form
.location-form__title
.location-form__field
.location-form__label
.location-form__input
.location-form__error
.location-form__actions
```

## Error Handling

### Common Errors
1. **Feature Not Available**: User doesn't have PRO/BUSINESS plan
2. **Validation Error**: Required fields missing or invalid
3. **Network Error**: API request failed
4. **Plan Limit Exceeded**: Maximum locations reached

### Error Messages
```typescript
try {
  await locationStore.createLocation(data)
} catch (error: any) {
  if (error.response?.status === 403) {
    // Feature not available
    showNotification('This feature requires PRO or BUSINESS plan', 'error')
  } else if (error.response?.status === 400) {
    // Validation error
    showNotification(error.response.data.message, 'error')
  } else {
    // Generic error
    showNotification('Failed to create location', 'error')
  }
}
```

## Best Practices

### 1. Always Check Feature Access
```typescript
const { hasMultiLocation } = useFeatureAccess()

if (!hasMultiLocation.value) {
  // Show upgrade prompt
  return
}
```

### 2. Handle Loading States
```typescript
const loading = ref(false)

const handleAction = async () => {
  loading.value = true
  try {
    await locationStore.someAction()
  } finally {
    loading.value = false
  }
}
```

### 3. Provide User Feedback
```typescript
try {
  await locationStore.createLocation(data)
  showNotification('Location created successfully', 'success')
} catch (error) {
  showNotification('Failed to create location', 'error')
}
```

### 4. Validate Before Submit
```typescript
const validateForm = (): boolean => {
  if (!formData.name.trim()) {
    errors.name = 'Location name is required'
    return false
  }
  return true
}

const handleSubmit = () => {
  if (!validateForm()) return
  // Submit form
}
```

### 5. Confirm Destructive Actions
```typescript
const handleDelete = (locationId: string) => {
  if (confirm('Are you sure you want to delete this location?')) {
    locationStore.deleteLocation(locationId)
  }
}
```

## Troubleshooting

### Issue: Locations not loading
**Solution**: Check if user has PRO/BUSINESS plan and is authenticated

### Issue: Form validation not working
**Solution**: Ensure all required fields have values and email format is valid

### Issue: Status toggle not working
**Solution**: Check network connection and backend API availability

### Issue: Statistics not showing
**Solution**: Ensure backend `/locations/:id/stats` endpoint is working

### Issue: Modal not closing
**Solution**: Check if backdrop click handler is properly bound

## Future Enhancements
- Google Maps integration for address selection
- Bulk location operations
- Location import/export
- Operating hours management
- Location-specific analytics
- Distance calculations between locations
