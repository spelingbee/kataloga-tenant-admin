<template>
  <div class="location-availability-matrix">
    <div class="location-availability-matrix__header">
      <h3 class="location-availability-matrix__title">Location Availability</h3>
      <p class="location-availability-matrix__description">
        Control which locations have access to selected menu items
      </p>
    </div>

    <div v-if="loading" class="location-availability-matrix__loading">
      <div class="spinner"></div>
      <p>Loading locations...</p>
    </div>

    <div v-else-if="error" class="location-availability-matrix__error">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <p>{{ error }}</p>
    </div>

    <div v-else-if="locations.length === 0" class="location-availability-matrix__empty">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
      <p>No locations found. Create locations first to manage availability.</p>
    </div>

    <div v-else class="location-availability-matrix__content">
      <!-- Bulk actions -->
      <div class="location-availability-matrix__bulk-actions">
        <button
          class="location-availability-matrix__bulk-btn location-availability-matrix__bulk-btn--enable"
          @click="bulkUpdate(true)"
          :disabled="updating"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
          Enable All
        </button>
        <button
          class="location-availability-matrix__bulk-btn location-availability-matrix__bulk-btn--disable"
          @click="bulkUpdate(false)"
          :disabled="updating"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
          Disable All
        </button>
      </div>

      <!-- Matrix table -->
      <div class="location-availability-matrix__table-wrapper">
        <table class="location-availability-matrix__table">
          <thead>
            <tr>
              <th class="location-availability-matrix__table-header">Menu Item</th>
              <th
                v-for="location in locations"
                :key="location.id"
                class="location-availability-matrix__table-header location-availability-matrix__table-header--location"
              >
                <div class="location-availability-matrix__location-header">
                  <span>{{ location.name }}</span>
                  <button
                    class="location-availability-matrix__column-toggle"
                    @click="toggleColumn(location.id)"
                    :disabled="updating"
                    :title="`Toggle all items for ${location.name}`"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                    </svg>
                  </button>
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="item in items"
              :key="item.id"
              class="location-availability-matrix__table-row"
            >
              <td class="location-availability-matrix__table-cell location-availability-matrix__table-cell--item">
                <div class="location-availability-matrix__item-info">
                  <img
                    v-if="item.imageUrl"
                    :src="item.imageUrl"
                    :alt="item.name"
                    class="location-availability-matrix__item-image"
                  />
                  <div class="location-availability-matrix__item-details">
                    <span class="location-availability-matrix__item-name">{{ item.name }}</span>
                    <span class="location-availability-matrix__item-price">${{ formatPrice(item.price) }}</span>
                  </div>
                </div>
              </td>
              <td
                v-for="location in locations"
                :key="`${item.id}-${location.id}`"
                class="location-availability-matrix__table-cell location-availability-matrix__table-cell--toggle"
              >
                <button
                  class="location-availability-matrix__toggle"
                  :class="{
                    'location-availability-matrix__toggle--active': isAvailable(item.id, location.id)
                  }"
                  @click="toggleAvailability(item.id, location.id)"
                  :disabled="updating"
                  :title="isAvailable(item.id, location.id) ? 'Available' : 'Unavailable'"
                >
                  <svg v-if="isAvailable(item.id, location.id)" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <svg v-else xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Summary -->
      <div class="location-availability-matrix__summary">
        <p>
          Managing availability for <strong>{{ items.length }}</strong> item{{ items.length !== 1 ? 's' : '' }}
          across <strong>{{ locations.length }}</strong> location{{ locations.length !== 1 ? 's' : '' }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import type { MenuItem, Location } from '~/types'

interface Props {
  items: MenuItem[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update': []
}>()

const locations = ref<Location[]>([])
const loading = ref(false)
const updating = ref(false)
const error = ref<string | null>(null)

// Track availability state
const availabilityMap = ref<Map<string, Map<string, boolean>>>(new Map())

const api = useApi()

onMounted(async () => {
  await loadLocations()
  await loadAvailability()
})

const loadLocations = async () => {
  loading.value = true
  error.value = null

  try {
    locations.value = await api.get<Location[]>('/locations')
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Failed to load locations'
    console.error('Error loading locations:', err)
  } finally {
    loading.value = false
  }
}

const loadAvailability = async () => {
  if (props.items.length === 0) return

  try {
    // Load location availability for each item
    for (const item of props.items) {
      const locationData = await api.get<any[]>(`/menu-items/${item.id}/locations`)
      
      const itemMap = new Map<string, boolean>()
      locationData.forEach(loc => {
        itemMap.set(loc.locationId, loc.isAvailable)
      })
      
      availabilityMap.value.set(item.id, itemMap)
    }
  } catch (err: any) {
    console.error('Error loading availability:', err)
  }
}

const isAvailable = (itemId: string, locationId: string): boolean => {
  return availabilityMap.value.get(itemId)?.get(locationId) ?? false
}

const toggleAvailability = async (itemId: string, locationId: string) => {
  updating.value = true

  try {
    const currentValue = isAvailable(itemId, locationId)
    
    await api.patch(`/menu-items/${itemId}/locations/${locationId}`, {
      isAvailable: !currentValue
    })
    
    // Update local state
    const itemMap = availabilityMap.value.get(itemId) || new Map()
    itemMap.set(locationId, !currentValue)
    availabilityMap.value.set(itemId, itemMap)
    
    emit('update')
  } catch (err: any) {
    console.error('Error toggling availability:', err)
    // TODO: Show error notification
  } finally {
    updating.value = false
  }
}

const toggleColumn = async (locationId: string) => {
  updating.value = true

  try {
    // Check if all items are currently available at this location
    const allAvailable = props.items.every(item => isAvailable(item.id, locationId))
    const newValue = !allAvailable

    // Bulk update all items for this location
    const itemIds = props.items.map(item => item.id)
    
    await api.post('/menu-items/bulk-location-update', {
      menuItemIds: itemIds,
      locationIds: [locationId],
      isAvailable: newValue
    })
    
    // Update local state
    props.items.forEach(item => {
      const itemMap = availabilityMap.value.get(item.id) || new Map()
      itemMap.set(locationId, newValue)
      availabilityMap.value.set(item.id, itemMap)
    })
    
    emit('update')
  } catch (err: any) {
    console.error('Error toggling column:', err)
    // TODO: Show error notification
  } finally {
    updating.value = false
  }
}

const bulkUpdate = async (isAvailable: boolean) => {
  updating.value = true

  try {
    const itemIds = props.items.map(item => item.id)
    const locationIds = locations.value.map(loc => loc.id)
    
    await api.post('/menu-items/bulk-location-update', {
      menuItemIds: itemIds,
      locationIds,
      isAvailable
    })
    
    // Update local state
    props.items.forEach(item => {
      const itemMap = new Map<string, boolean>()
      locationIds.forEach(locId => {
        itemMap.set(locId, isAvailable)
      })
      availabilityMap.value.set(item.id, itemMap)
    })
    
    emit('update')
  } catch (err: any) {
    console.error('Error bulk updating:', err)
    // TODO: Show error notification
  } finally {
    updating.value = false
  }
}

const formatPrice = (price: number): string => {
  return price.toFixed(2)
}
</script>

<style scoped lang="scss">
@use '@/assets/scss/variables' as *;

.location-availability-matrix {
  background: $bg-primary;
  border: 1px solid $border-color;
  border-radius: $radius-lg;
  padding: $spacing-xl;
}

.location-availability-matrix__header {
  margin-bottom: $spacing-lg;
}

.location-availability-matrix__title {
  margin: 0 0 $spacing-xs 0;
  font-size: $font-size-xl;
  font-weight: $font-weight-semibold;
  color: $text-primary;
}

.location-availability-matrix__description {
  margin: 0;
  font-size: $font-size-sm;
  color: $text-secondary;
}

.location-availability-matrix__loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: $spacing-xl;
  gap: $spacing-md;
  color: $text-secondary;
  
  .spinner {
    width: 40px;
    height: 40px;
    border: 3px solid $border-color;
    border-top-color: $primary-color;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.location-availability-matrix__error {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: $spacing-sm;
  padding: $spacing-xl;
  color: $error-color;
  
  svg {
    width: 48px;
    height: 48px;
  }
  
  p {
    margin: 0;
    text-align: center;
  }
}

.location-availability-matrix__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: $spacing-sm;
  padding: $spacing-xl;
  color: $text-secondary;
  
  svg {
    width: 48px;
    height: 48px;
  }
  
  p {
    margin: 0;
    text-align: center;
  }
}

.location-availability-matrix__bulk-actions {
  display: flex;
  gap: $spacing-sm;
  margin-bottom: $spacing-lg;
}

.location-availability-matrix__bulk-btn {
  display: flex;
  align-items: center;
  gap: $spacing-xs;
  padding: $spacing-sm $spacing-md;
  font-size: $font-size-sm;
  font-weight: $font-weight-medium;
  border: 1px solid $border-color;
  border-radius: $radius-md;
  background: $bg-primary;
  cursor: pointer;
  transition: all $transition-base;
  
  svg {
    width: 16px;
    height: 16px;
  }
  
  &:hover {
    background: $bg-secondary;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

.location-availability-matrix__bulk-btn--enable {
  color: $success-color;
  
  &:hover {
    border-color: $success-color;
    background: rgba($success-color, 0.1);
  }
}

.location-availability-matrix__bulk-btn--disable {
  color: $error-color;
  
  &:hover {
    border-color: $error-color;
    background: rgba($error-color, 0.1);
  }
}

.location-availability-matrix__table-wrapper {
  overflow-x: auto;
  margin-bottom: $spacing-lg;
}

.location-availability-matrix__table {
  width: 100%;
  border-collapse: collapse;
  font-size: $font-size-sm;
}

.location-availability-matrix__table-header {
  padding: $spacing-md;
  text-align: left;
  font-weight: $font-weight-semibold;
  color: $text-primary;
  background: $bg-secondary;
  border-bottom: 2px solid $border-color;
  white-space: nowrap;
}

.location-availability-matrix__table-header--location {
  text-align: center;
  min-width: 120px;
}

.location-availability-matrix__location-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: $spacing-xs;
}

.location-availability-matrix__column-toggle {
  padding: $spacing-xs;
  border: 1px solid $border-color;
  border-radius: $radius-sm;
  background: $bg-primary;
  cursor: pointer;
  transition: all $transition-base;
  
  svg {
    width: 14px;
    height: 14px;
    color: $text-secondary;
  }
  
  &:hover {
    background: $bg-secondary;
    border-color: $primary-color;
    
    svg {
      color: $primary-color;
    }
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

.location-availability-matrix__table-row {
  &:hover {
    background: $bg-secondary;
  }
}

.location-availability-matrix__table-cell {
  padding: $spacing-md;
  border-bottom: 1px solid $border-color;
}

.location-availability-matrix__table-cell--item {
  font-weight: $font-weight-medium;
}

.location-availability-matrix__table-cell--toggle {
  text-align: center;
}

.location-availability-matrix__item-info {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
}

.location-availability-matrix__item-image {
  width: 40px;
  height: 40px;
  object-fit: cover;
  border-radius: $radius-sm;
}

.location-availability-matrix__item-details {
  display: flex;
  flex-direction: column;
  gap: $spacing-xs;
}

.location-availability-matrix__item-name {
  font-size: $font-size-sm;
  color: $text-primary;
}

.location-availability-matrix__item-price {
  font-size: $font-size-xs;
  color: $text-secondary;
}

.location-availability-matrix__toggle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: 2px solid $border-color;
  border-radius: $radius-md;
  background: $bg-primary;
  cursor: pointer;
  transition: all $transition-base;
  
  svg {
    width: 18px;
    height: 18px;
    color: $text-light;
  }
  
  &:hover {
    border-color: $primary-color;
    background: $bg-secondary;
    
    svg {
      color: $primary-color;
    }
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

.location-availability-matrix__toggle--active {
  border-color: $success-color;
  background: rgba($success-color, 0.1);
  
  svg {
    color: $success-color;
  }
  
  &:hover {
    border-color: $success-color;
    background: rgba($success-color, 0.2);
    
    svg {
      color: $success-color;
    }
  }
}

.location-availability-matrix__summary {
  padding-top: $spacing-md;
  border-top: 1px solid $border-color;
  
  p {
    margin: 0;
    font-size: $font-size-sm;
    color: $text-secondary;
    text-align: center;
    
    strong {
      color: $text-primary;
      font-weight: $font-weight-semibold;
    }
  }
}
</style>
