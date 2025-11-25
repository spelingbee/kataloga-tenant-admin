<template>
  <div class="menu-item-card">
    <div class="menu-item-card__image-container">
      <img
        v-if="item.imageUrl"
        :src="item.imageUrl"
        :alt="item.name"
        class="menu-item-card__image"
      />
      <div v-else class="menu-item-card__image-placeholder">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
      <div
        v-if="!item.isActive"
        class="menu-item-card__inactive-badge"
      >
        Inactive
      </div>
    </div>

    <div class="menu-item-card__content">
      <div class="menu-item-card__header">
        <h3 class="menu-item-card__title">{{ item.name }}</h3>
        <span class="menu-item-card__price">${{ formatPrice(item.price) }}</span>
      </div>

      <p v-if="item.description" class="menu-item-card__description">
        {{ item.description }}
      </p>

      <div v-if="item.category" class="menu-item-card__category">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
        </svg>
        {{ item.category.name }}
      </div>

      <div v-if="item.allergens" class="menu-item-card__allergens">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        {{ item.allergens }}
      </div>

      <!-- Location availability indicators -->
      <div
        v-if="showLocationAvailability && item.locations && item.locations.length > 0"
        class="menu-item-card__locations"
      >
        <div class="menu-item-card__locations-header">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span>Locations:</span>
        </div>
        <div class="menu-item-card__locations-list">
          <button
            v-for="location in item.locations"
            :key="location.locationId"
            class="menu-item-card__location-badge"
            :class="{
              'menu-item-card__location-badge--available': location.isAvailable,
              'menu-item-card__location-badge--unavailable': !location.isAvailable
            }"
            @click.stop="$emit('toggle-location', item.id, location.locationId)"
            :title="`${location.locationName}: ${location.isAvailable ? 'Available' : 'Unavailable'}`"
          >
            {{ location.locationName }}
          </button>
        </div>
      </div>

      <div class="menu-item-card__actions">
        <button
          class="menu-item-card__action-btn menu-item-card__action-btn--toggle"
          :class="{ 'menu-item-card__action-btn--active': item.isActive }"
          @click="$emit('toggle-availability', item.id)"
          :title="item.isActive ? 'Deactivate' : 'Activate'"
        >
          <svg v-if="item.isActive" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
          </svg>
        </button>

        <button
          class="menu-item-card__action-btn menu-item-card__action-btn--edit"
          @click="$emit('edit', item.id)"
          title="Edit"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </button>

        <button
          class="menu-item-card__action-btn menu-item-card__action-btn--delete"
          @click="$emit('delete', item.id)"
          title="Delete"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { MenuItem } from '~/types'

interface Props {
  item: MenuItem
  showLocationAvailability?: boolean
}

withDefaults(defineProps<Props>(), {
  showLocationAvailability: false
})

defineEmits<{
  'toggle-availability': [id: string]
  'toggle-location': [itemId: string, locationId: string]
  'edit': [id: string]
  'delete': [id: string]
}>()

const formatPrice = (price: number): string => {
  return price.toFixed(2)
}
</script>

<style scoped lang="scss">
@use '@/assets/scss/variables' as *;

.menu-item-card {
  background: $bg-primary;
  border: 1px solid $border-color;
  border-radius: $radius-lg;
  overflow: hidden;
  transition: box-shadow $transition-base, transform $transition-base;
  
  &:hover {
    box-shadow: $shadow-md;
    transform: translateY(-2px);
  }
}

.menu-item-card__image-container {
  position: relative;
  width: 100%;
  height: 200px;
  background: $bg-secondary;
  overflow: hidden;
}

.menu-item-card__image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.menu-item-card__image-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  color: $text-light;
  
  svg {
    width: 64px;
    height: 64px;
  }
}

.menu-item-card__inactive-badge {
  position: absolute;
  top: $spacing-sm;
  right: $spacing-sm;
  padding: $spacing-xs $spacing-sm;
  font-size: $font-size-xs;
  font-weight: $font-weight-semibold;
  color: $text-white;
  background: $error-color;
  border-radius: $radius-sm;
  text-transform: uppercase;
}

.menu-item-card__content {
  padding: $spacing-lg;
}

.menu-item-card__header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: $spacing-md;
  margin-bottom: $spacing-sm;
}

.menu-item-card__title {
  margin: 0;
  font-size: $font-size-lg;
  font-weight: $font-weight-semibold;
  color: $text-primary;
  line-height: $line-height-tight;
}

.menu-item-card__price {
  flex-shrink: 0;
  font-size: $font-size-xl;
  font-weight: $font-weight-bold;
  color: $primary-color;
}

.menu-item-card__description {
  margin: 0 0 $spacing-md 0;
  font-size: $font-size-sm;
  color: $text-secondary;
  line-height: $line-height-normal;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.menu-item-card__category {
  display: inline-flex;
  align-items: center;
  gap: $spacing-xs;
  padding: $spacing-xs $spacing-sm;
  font-size: $font-size-xs;
  color: $text-secondary;
  background: $bg-secondary;
  border-radius: $radius-sm;
  margin-bottom: $spacing-sm;
  
  svg {
    width: 14px;
    height: 14px;
  }
}

.menu-item-card__allergens {
  display: flex;
  align-items: center;
  gap: $spacing-xs;
  font-size: $font-size-xs;
  color: $warning-color;
  margin-bottom: $spacing-md;
  
  svg {
    width: 14px;
    height: 14px;
  }
}

.menu-item-card__locations {
  margin-bottom: $spacing-md;
  padding: $spacing-sm;
  background: $bg-secondary;
  border-radius: $radius-sm;
}

.menu-item-card__locations-header {
  display: flex;
  align-items: center;
  gap: $spacing-xs;
  margin-bottom: $spacing-xs;
  font-size: $font-size-xs;
  font-weight: $font-weight-medium;
  color: $text-secondary;
  
  svg {
    width: 14px;
    height: 14px;
  }
}

.menu-item-card__locations-list {
  display: flex;
  flex-wrap: wrap;
  gap: $spacing-xs;
}

.menu-item-card__location-badge {
  padding: $spacing-xs $spacing-sm;
  font-size: $font-size-xs;
  font-weight: $font-weight-medium;
  border: 1px solid $border-color;
  border-radius: $radius-sm;
  background: $bg-primary;
  cursor: pointer;
  transition: all $transition-base;
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: $shadow-sm;
  }
}

.menu-item-card__location-badge--available {
  color: $success-color;
  border-color: $success-color;
  background: rgba($success-color, 0.1);
  
  &:hover {
    background: rgba($success-color, 0.2);
  }
}

.menu-item-card__location-badge--unavailable {
  color: $text-light;
  border-color: $border-color;
  background: $bg-primary;
  opacity: 0.6;
  
  &:hover {
    opacity: 1;
    border-color: $text-secondary;
  }
}

.menu-item-card__actions {
  display: flex;
  gap: $spacing-sm;
  padding-top: $spacing-md;
  border-top: 1px solid $border-color;
}

.menu-item-card__action-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: $spacing-sm;
  font-size: $font-size-sm;
  font-weight: $font-weight-medium;
  border: 1px solid $border-color;
  border-radius: $radius-md;
  background: $bg-primary;
  cursor: pointer;
  transition: all $transition-base;
  
  svg {
    width: 18px;
    height: 18px;
  }
  
  &:hover {
    background: $bg-secondary;
  }
}

.menu-item-card__action-btn--toggle {
  color: $text-secondary;
  
  &:hover {
    color: $primary-color;
    border-color: $primary-color;
  }
}

.menu-item-card__action-btn--toggle.menu-item-card__action-btn--active {
  color: $success-color;
  border-color: $success-color;
  
  &:hover {
    background: rgba($success-color, 0.1);
  }
}

.menu-item-card__action-btn--edit {
  color: $info-color;
  
  &:hover {
    border-color: $info-color;
    background: rgba($info-color, 0.1);
  }
}

.menu-item-card__action-btn--delete {
  color: $error-color;
  
  &:hover {
    border-color: $error-color;
    background: rgba($error-color, 0.1);
  }
}
</style>
