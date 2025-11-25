<template>
  <div class="location-list">
    <!-- Header -->
    <div class="location-list__header">
      <h2 class="location-list__title">Locations</h2>
      <button class="location-list__add-btn" @click="$emit('add')">
        <span class="location-list__add-icon">+</span>
        Add Location
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="location-list__loading">
      <div class="location-list__spinner"></div>
      <p>Loading locations...</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="!loading && locations.length === 0" class="location-list__empty">
      <div class="location-list__empty-icon">📍</div>
      <h3 class="location-list__empty-title">No locations yet</h3>
      <p class="location-list__empty-text">
        Add your first location to manage menu availability across different addresses.
      </p>
      <button class="location-list__empty-btn" @click="$emit('add')">
        Add Location
      </button>
    </div>

    <!-- Locations Grid -->
    <div v-else class="location-list__grid">
      <div
        v-for="location in locations"
        :key="location.id"
        class="location-card"
        :class="{ 'location-card--inactive': !location.isActive }"
      >
        <!-- Status Badge -->
        <div class="location-card__status">
          <span
            class="location-card__status-badge"
            :class="{
              'location-card__status-badge--active': location.isActive,
              'location-card__status-badge--inactive': !location.isActive,
            }"
          >
            {{ location.isActive ? 'Active' : 'Inactive' }}
          </span>
        </div>

        <!-- Location Info -->
        <div class="location-card__content">
          <h3 class="location-card__name">{{ location.name }}</h3>
          <p class="location-card__address">
            {{ location.address }}, {{ location.city }}
          </p>
          
          <div v-if="location.phone || location.email" class="location-card__contact">
            <p v-if="location.phone" class="location-card__contact-item">
              <span class="location-card__contact-icon">📞</span>
              {{ location.phone }}
            </p>
            <p v-if="location.email" class="location-card__contact-item">
              <span class="location-card__contact-icon">✉️</span>
              {{ location.email }}
            </p>
          </div>

          <!-- Stats -->
          <div v-if="locationStats[location.id]" class="location-card__stats">
            <div class="location-card__stat">
              <span class="location-card__stat-value">
                {{ locationStats[location.id].itemsAvailable }}
              </span>
              <span class="location-card__stat-label">Items Available</span>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="location-card__actions">
          <button
            class="location-card__action-btn location-card__action-btn--toggle"
            @click="handleToggleStatus(location.id)"
            :title="location.isActive ? 'Deactivate' : 'Activate'"
          >
            {{ location.isActive ? '⏸️' : '▶️' }}
          </button>
          <button
            class="location-card__action-btn location-card__action-btn--edit"
            @click="$emit('edit', location)"
            title="Edit"
          >
            ✏️
          </button>
          <button
            class="location-card__action-btn location-card__action-btn--delete"
            @click="handleDelete(location.id)"
            title="Delete"
          >
            🗑️
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { Location } from '~/types'

interface Props {
  locations: Location[]
  loading: boolean
}

interface LocationStats {
  itemsAvailable: number
  totalItems: number
}

const props = defineProps<Props>()

const emit = defineEmits<{
  add: []
  edit: [location: Location]
  toggleStatus: [locationId: string]
  delete: [locationId: string]
}>()

const locationStats = ref<Record<string, LocationStats>>({})

const loadLocationStats = async () => {
  const locationStore = useLocationStore()
  
  for (const location of props.locations) {
    try {
      const stats = await locationStore.fetchLocationStats(location.id)
      locationStats.value[location.id] = stats
    } catch (error) {
      console.error(`Failed to load stats for location ${location.id}:`, error)
    }
  }
}

const handleToggleStatus = (locationId: string) => {
  emit('toggleStatus', locationId)
}

const handleDelete = (locationId: string) => {
  if (confirm('Are you sure you want to delete this location? This action cannot be undone.')) {
    emit('delete', locationId)
  }
}

onMounted(() => {
  if (props.locations.length > 0) {
    loadLocationStats()
  }
})
</script>

<style scoped lang="scss">
@use './location-list';
</style>
