<template>
  <div class="locations-page">
    <!-- Feature Access Guard -->
    <div v-if="!hasMultiLocation" class="locations-page__locked">
      <div class="locations-page__locked-content">
        <div class="locations-page__locked-icon">🔒</div>
        <h2 class="locations-page__locked-title">Multi-Location Feature</h2>
        <p class="locations-page__locked-text">
          Manage multiple restaurant locations with location-specific menu availability.
          This feature is available on PRO and BUSINESS plans.
        </p>
        <div class="locations-page__locked-features">
          <div class="locations-page__locked-feature">
            <span class="locations-page__locked-feature-icon">✓</span>
            <span>Manage multiple locations</span>
          </div>
          <div class="locations-page__locked-feature">
            <span class="locations-page__locked-feature-icon">✓</span>
            <span>Location-specific menu availability</span>
          </div>
          <div class="locations-page__locked-feature">
            <span class="locations-page__locked-feature-icon">✓</span>
            <span>Individual location statistics</span>
          </div>
        </div>
        <button class="locations-page__locked-btn" @click="handleUpgrade">
          Upgrade Plan
        </button>
      </div>
    </div>

    <!-- Main Content (when feature is available) -->
    <div v-else class="locations-page__content">
      <!-- Modal for Add/Edit -->
      <div v-if="showForm" class="locations-page__modal">
        <div class="locations-page__modal-backdrop" @click="closeForm"></div>
        <div class="locations-page__modal-content">
          <LocationForm
            :location="selectedLocation"
            :loading="locationStore.loading"
            @submit="handleFormSubmit"
            @cancel="closeForm"
          />
        </div>
      </div>

      <!-- Location List -->
      <LocationList
        :locations="locationStore.locations"
        :loading="locationStore.loading"
        @add="openAddForm"
        @edit="openEditForm"
        @toggleStatus="handleToggleStatus"
        @delete="handleDelete"
      />

      <!-- Toast Notification -->
      <div v-if="notification.show" class="locations-page__toast" :class="`locations-page__toast--${notification.type}`">
        {{ notification.message }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import type { Location } from '~/types'
import { FeatureKey } from '~/types'
import LocationList from '~/components/location/LocationList.vue'
import LocationForm from '~/components/location/LocationForm.vue'

// Define page meta
definePageMeta({
  middleware: ['auth'],
  layout: 'default',
})

const router = useRouter()
const locationStore = useLocationStore()
const { hasMultiLocation, requireFeature } = useFeatureAccess()

const showForm = ref(false)
const selectedLocation = ref<Location | null>(null)

const { navigateToTenant } = useNavigation()

const handleUpgrade = () => {
  navigateToTenant('/subscription')
}

const notification = reactive({
  show: false,
  message: '',
  type: 'success' as 'success' | 'error',
})

const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
  notification.message = message
  notification.type = type
  notification.show = true

  setTimeout(() => {
    notification.show = false
  }, 3000)
}

const openAddForm = () => {
  selectedLocation.value = null
  showForm.value = true
}

const openEditForm = (location: Location) => {
  selectedLocation.value = location
  showForm.value = true
}

const closeForm = () => {
  showForm.value = false
  selectedLocation.value = null
}

const handleFormSubmit = async (data: any) => {
  try {
    if (selectedLocation.value) {
      // Update existing location
      await locationStore.updateLocation(selectedLocation.value.id, data)
      showNotification('Location updated successfully')
    } else {
      // Create new location
      await locationStore.createLocation(data)
      showNotification('Location created successfully')
    }
    closeForm()
  } catch (error: any) {
    showNotification(error.message || 'Failed to save location', 'error')
  }
}

const handleToggleStatus = async (locationId: string) => {
  try {
    await locationStore.toggleLocationStatus(locationId)
    showNotification('Location status updated')
  } catch (error: any) {
    showNotification(error.message || 'Failed to update location status', 'error')
  }
}

const handleDelete = async (locationId: string) => {
  try {
    await locationStore.deleteLocation(locationId)
    showNotification('Location deleted successfully')
  } catch (error: any) {
    showNotification(error.message || 'Failed to delete location', 'error')
  }
}

onMounted(async () => {
  // In Mini App mode, redirect to dashboard
  const isMiniAppMode = true // This could be configurable later
  if (isMiniAppMode) {
    const route = useRoute()
    const tenantSlug = route.params.tenant as string
    await navigateToTenant('/')
    return
  }
  
  // Check feature access and show modal if needed
  if (!hasMultiLocation.value) {
    requireFeature(FeatureKey.MULTI_LOCATION)
  } else {
    try {
      await locationStore.fetchLocations()
    } catch (error) {
      showNotification('Failed to load locations', 'error')
    }
  }
})
</script>

<style scoped lang="scss">
@use '@/assets/scss/variables' as *;

.locations-page {
  padding: $spacing-xl;
  max-width: $max-content-width;
  margin: 0 auto;
}

.locations-page__locked {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
}

.locations-page__locked-content {
  max-width: 500px;
  text-align: center;
  padding: $spacing-2xl;
  background: $bg-primary;
  border: 2px solid $border-color;
  border-radius: $radius-xl;
  box-shadow: $shadow-lg;
}

.locations-page__locked-icon {
  font-size: 4rem;
  margin-bottom: $spacing-lg;
}

.locations-page__locked-title {
  font-size: $font-size-2xl;
  font-weight: $font-weight-bold;
  color: $text-primary;
  margin: 0 0 $spacing-md 0;
}

.locations-page__locked-text {
  color: $text-secondary;
  line-height: $line-height-relaxed;
  margin: 0 0 $spacing-xl 0;
}

.locations-page__locked-features {
  display: flex;
  flex-direction: column;
  gap: $spacing-md;
  margin-bottom: $spacing-xl;
  text-align: left;
}

.locations-page__locked-feature {
  display: flex;
  align-items: center;
  gap: $spacing-md;
  padding: $spacing-md;
  background: $bg-secondary;
  border-radius: $radius-md;
  color: $text-primary;
}

.locations-page__locked-feature-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  background: $success-color;
  color: $text-white;
  border-radius: $radius-full;
  font-weight: $font-weight-bold;
  font-size: $font-size-sm;
}

.locations-page__locked-btn {
  padding: $spacing-md $spacing-xl;
  background: $primary-color;
  color: $text-white;
  border: none;
  border-radius: $radius-md;
  font-size: $font-size-base;
  font-weight: $font-weight-semibold;
  cursor: pointer;
  transition: background $transition-base;

  &:hover {
    background: $primary-dark;
  }
}

.locations-page__content {
  position: relative;
}

.locations-page__modal {
  position: fixed;
  inset: 0;
  z-index: $z-modal;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: $spacing-lg;
}

.locations-page__modal-backdrop {
  position: absolute;
  inset: 0;
  background: $bg-overlay;
  z-index: $z-modal-backdrop;
}

.locations-page__modal-content {
  position: relative;
  z-index: $z-modal;
  background: $bg-primary;
  border-radius: $radius-xl;
  padding: $spacing-2xl;
  max-width: 700px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: $shadow-xl;
}

.locations-page__toast {
  position: fixed;
  bottom: $spacing-xl;
  right: $spacing-xl;
  padding: $spacing-md $spacing-lg;
  background: $bg-primary;
  border-radius: $radius-md;
  box-shadow: $shadow-lg;
  z-index: $z-tooltip;
  animation: slideIn 0.3s ease-out;
}

.locations-page__toast--success {
  border-left: 4px solid $success-color;
  color: $success-color;
}

.locations-page__toast--error {
  border-left: 4px solid $error-color;
  color: $error-color;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@media (max-width: $breakpoint-md) {
  .locations-page {
    padding: $spacing-md;
  }

  .locations-page__modal {
    padding: $spacing-md;
  }

  .locations-page__modal-content {
    padding: $spacing-lg;
    max-height: 95vh;
  }

  .locations-page__toast {
    bottom: $spacing-md;
    right: $spacing-md;
    left: $spacing-md;
  }
}
</style>
