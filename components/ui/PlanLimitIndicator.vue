<template>
  <div class="plan-limit-indicator">
    <div class="plan-limit-indicator__header">
      <h3 class="plan-limit-indicator__title">Plan Usage</h3>
      <span v-if="planName" class="plan-limit-indicator__badge">
        {{ planName }}
      </span>
    </div>

    <div class="plan-limit-indicator__limits">
      <!-- Menu Items Limit -->
      <div class="limit-item">
        <div class="limit-item__header">
          <span class="limit-item__label">Menu Items</span>
          <span class="limit-item__count">
            {{ current.menuItems }} / {{ max.menuItems === -1 ? '∞' : max.menuItems }}
          </span>
        </div>
        <div class="limit-item__progress">
          <div 
            class="limit-item__progress-bar"
            :class="getProgressClass(current.menuItems, max.menuItems)"
            :style="{ width: getProgressWidth(current.menuItems, max.menuItems) }"
          />
        </div>
      </div>

      <!-- Categories Limit -->
      <div class="limit-item">
        <div class="limit-item__header">
          <span class="limit-item__label">Categories</span>
          <span class="limit-item__count">
            {{ current.categories }} / {{ max.categories === -1 ? '∞' : max.categories }}
          </span>
        </div>
        <div class="limit-item__progress">
          <div 
            class="limit-item__progress-bar"
            :class="getProgressClass(current.categories, max.categories)"
            :style="{ width: getProgressWidth(current.categories, max.categories) }"
          />
        </div>
      </div>

      <!-- Locations Limit (if applicable) -->
      <div v-if="max.locations > 0" class="limit-item">
        <div class="limit-item__header">
          <span class="limit-item__label">Locations</span>
          <span class="limit-item__count">
            {{ current.locations }} / {{ max.locations === -1 ? '∞' : max.locations }}
          </span>
        </div>
        <div class="limit-item__progress">
          <div 
            class="limit-item__progress-bar"
            :class="getProgressClass(current.locations, max.locations)"
            :style="{ width: getProgressWidth(current.locations, max.locations) }"
          />
        </div>
      </div>

      <!-- Users Limit (if applicable) -->
      <div v-if="max.users > 1" class="limit-item">
        <div class="limit-item__header">
          <span class="limit-item__label">Team Members</span>
          <span class="limit-item__count">
            {{ current.users }} / {{ max.users === -1 ? '∞' : max.users }}
          </span>
        </div>
        <div class="limit-item__progress">
          <div 
            class="limit-item__progress-bar"
            :class="getProgressClass(current.users, max.users)"
            :style="{ width: getProgressWidth(current.users, max.users) }"
          />
        </div>
      </div>
    </div>

    <!-- Upgrade prompt if approaching limits -->
    <div v-if="showUpgradePrompt" class="plan-limit-indicator__upgrade">
      <p class="plan-limit-indicator__upgrade-text">
        You're approaching your plan limits. Upgrade to get more capacity!
      </p>
      <button class="plan-limit-indicator__upgrade-btn" @click="$emit('upgrade')">
        Upgrade Plan
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
interface PlanLimits {
  menuItems: number
  categories: number
  locations: number
  users: number
}

interface Props {
  planName?: string
  current: PlanLimits
  max: PlanLimits
}

const props = defineProps<Props>()
defineEmits<{
  upgrade: []
}>()

/**
 * Calculate progress width percentage
 */
const getProgressWidth = (current: number, max: number): string => {
  if (max === -1) return '0%' // Unlimited
  const percentage = Math.min((current / max) * 100, 100)
  return `${percentage}%`
}

/**
 * Get progress bar color class based on usage
 */
const getProgressClass = (current: number, max: number): string => {
  if (max === -1) return 'limit-item__progress-bar--low' // Unlimited
  const percentage = (current / max) * 100
  
  if (percentage >= 90) return 'limit-item__progress-bar--critical'
  if (percentage >= 75) return 'limit-item__progress-bar--warning'
  return 'limit-item__progress-bar--normal'
}

/**
 * Show upgrade prompt if any limit is above 75%
 */
const showUpgradePrompt = computed(() => {
  const limits = [
    { current: props.current.menuItems, max: props.max.menuItems },
    { current: props.current.categories, max: props.max.categories },
    { current: props.current.locations, max: props.max.locations },
    { current: props.current.users, max: props.max.users },
  ]

  return limits.some(({ current, max }) => {
    if (max === -1) return false // Unlimited
    return (current / max) >= 0.75
  })
})
</script>

<style scoped lang="scss">
@use '@/assets/scss/variables' as *;

.plan-limit-indicator {
  padding: $spacing-lg;
  background: $bg-primary;
  border-radius: $radius-lg;
  box-shadow: $shadow-sm;
}

.plan-limit-indicator__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: $spacing-lg;
}

.plan-limit-indicator__title {
  margin: 0;
  font-size: $font-size-lg;
  font-weight: $font-weight-semibold;
  color: $text-primary;
}

.plan-limit-indicator__badge {
  padding: $spacing-xs $spacing-sm;
  font-size: $font-size-xs;
  font-weight: $font-weight-medium;
  color: $primary-color;
  background: rgba($primary-color, 0.1);
  border-radius: $radius-full;
  text-transform: uppercase;
}

.plan-limit-indicator__limits {
  display: flex;
  flex-direction: column;
  gap: $spacing-md;
}

.limit-item {
  display: flex;
  flex-direction: column;
  gap: $spacing-xs;
}

.limit-item__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.limit-item__label {
  font-size: $font-size-sm;
  font-weight: $font-weight-medium;
  color: $text-secondary;
}

.limit-item__count {
  font-size: $font-size-sm;
  font-weight: $font-weight-semibold;
  color: $text-primary;
}

.limit-item__progress {
  height: 8px;
  background: $bg-secondary;
  border-radius: $radius-full;
  overflow: hidden;
}

.limit-item__progress-bar {
  height: 100%;
  border-radius: $radius-full;
  transition: width $transition-base, background-color $transition-base;
}

.limit-item__progress-bar--normal {
  background: $success-color;
}

.limit-item__progress-bar--warning {
  background: $warning-color;
}

.limit-item__progress-bar--critical {
  background: $error-color;
}

.limit-item__progress-bar--low {
  background: $primary-color;
}

.plan-limit-indicator__upgrade {
  margin-top: $spacing-lg;
  padding: $spacing-md;
  background: rgba($warning-color, 0.1);
  border-radius: $radius-md;
  border-left: 4px solid $warning-color;
}

.plan-limit-indicator__upgrade-text {
  margin: 0 0 $spacing-sm 0;
  font-size: $font-size-sm;
  color: $text-secondary;
}

.plan-limit-indicator__upgrade-btn {
  padding: $spacing-sm $spacing-md;
  font-size: $font-size-sm;
  font-weight: $font-weight-medium;
  color: $text-white;
  background: $primary-color;
  border: none;
  border-radius: $radius-md;
  cursor: pointer;
  transition: background $transition-base;
  
  &:hover {
    background: $primary-dark;
  }
}
</style>
