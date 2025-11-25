<template>
  <div class="subscription-details">
    <div class="subscription-details__header">
      <div class="subscription-details__plan-info">
        <h2 class="subscription-details__plan-name">{{ planDisplayName }}</h2>
        <span :class="statusClass">{{ statusText }}</span>
      </div>
      <div class="subscription-details__billing">
        <p class="subscription-details__price">{{ formattedPrice }}</p>
        <p class="subscription-details__cycle">{{ billingCycle }}</p>
      </div>
    </div>

    <div class="subscription-details__dates">
      <div class="subscription-details__date-item">
        <span class="subscription-details__date-label">Start Date</span>
        <span class="subscription-details__date-value">{{ formattedStartDate }}</span>
      </div>
      <div class="subscription-details__date-item">
        <span class="subscription-details__date-label">{{ endDateLabel }}</span>
        <span class="subscription-details__date-value">{{ formattedEndDate }}</span>
      </div>
    </div>

    <div class="subscription-details__features">
      <h3 class="subscription-details__features-title">Plan Features</h3>
      <ul class="subscription-details__features-list">
        <li
          v-for="feature in planFeatures"
          :key="feature.key"
          class="subscription-details__feature-item"
        >
          <span class="subscription-details__feature-icon">✓</span>
          <span class="subscription-details__feature-text">{{ feature.label }}</span>
        </li>
      </ul>
    </div>

    <div class="subscription-details__usage">
      <h3 class="subscription-details__usage-title">Usage & Limits</h3>
      <div class="subscription-details__usage-items">
        <div
          v-for="usage in usageData"
          :key="usage.label"
          class="subscription-details__usage-item"
        >
          <div class="subscription-details__usage-header">
            <span class="subscription-details__usage-label">{{ usage.label }}</span>
            <span class="subscription-details__usage-count">
              {{ usage.current }} / {{ usage.max === -1 ? 'Unlimited' : usage.max }}
            </span>
          </div>
          <div class="subscription-details__usage-bar">
            <div
              class="subscription-details__usage-progress"
              :style="{ width: usage.percentage + '%' }"
              :class="{ 'subscription-details__usage-progress--warning': usage.percentage >= 80 }"
            ></div>
          </div>
        </div>
      </div>
    </div>

    <div class="subscription-details__actions">
      <button
        v-if="!isBusinessPlan"
        class="subscription-details__upgrade-btn"
        @click="$emit('upgrade')"
      >
        Upgrade Plan
      </button>
      <button
        class="subscription-details__manage-btn"
        @click="$emit('manage')"
      >
        Manage Subscription
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Subscription } from '~/types'

interface UsageData {
  label: string
  current: number
  max: number
  percentage: number
}

interface Props {
  subscription: Subscription
  usage: {
    users: { current: number; max: number }
    locations: { current: number; max: number }
    menuItems: { current: number; max: number }
    categories: { current: number; max: number }
  }
}

const props = defineProps<Props>()

defineEmits<{
  upgrade: []
  manage: []
}>()

const planDisplayName = computed(() => props.subscription.plan.displayName)

const statusText = computed(() => {
  switch (props.subscription.status) {
    case 'TRIAL':
      return 'Trial'
    case 'ACTIVE':
      return 'Active'
    case 'CANCELED':
      return 'Canceled'
    case 'EXPIRED':
      return 'Expired'
    default:
      return props.subscription.status
  }
})

const statusClass = computed(() => {
  return `subscription-details__status subscription-details__status--${props.subscription.status.toLowerCase()}`
})

const formattedPrice = computed(() => {
  const price = props.subscription.plan.price
  return price === 0 ? 'Free' : `$${price.toFixed(2)}`
})

const billingCycle = computed(() => {
  if (props.subscription.plan.price === 0) return ''
  return `per ${props.subscription.plan.billingCycle}`
})

const formattedStartDate = computed(() => {
  return new Date(props.subscription.startDate).toLocaleDateString()
})

const formattedEndDate = computed(() => {
  return new Date(props.subscription.endDate).toLocaleDateString()
})

const endDateLabel = computed(() => {
  return props.subscription.status === 'TRIAL' ? 'Trial Ends' : 'Next Billing Date'
})

const isBusinessPlan = computed(() => props.subscription.plan.name === 'BUSINESS')

const planFeatures = computed(() => {
  const features = props.subscription.plan.features || []
  const featureLabels: Record<string, string> = {
    sales_analytics: 'Sales Analytics Dashboard',
    advanced_reporting: 'Advanced Reporting',
    api_access: 'API Access',
    custom_branding: 'Custom Branding',
    multi_location: 'Multi-Location Support',
    audit_trail: 'Audit Trail & History',
    data_export: 'Data Export (CSV, Excel, PDF)',
    multi_user: 'Multi-User Access',
    priority_support: 'Priority Support',
  }

  return features
    .filter((f) => f.isEnabled)
    .map((f) => ({
      key: f.featureKey,
      label: featureLabels[f.featureKey] || f.featureKey,
    }))
})

const usageData = computed((): UsageData[] => {
  const calculatePercentage = (current: number, max: number): number => {
    if (max === -1) return 0 // Unlimited
    return Math.min((current / max) * 100, 100)
  }

  return [
    {
      label: 'Users',
      current: props.usage.users.current,
      max: props.usage.users.max,
      percentage: calculatePercentage(props.usage.users.current, props.usage.users.max),
    },
    {
      label: 'Locations',
      current: props.usage.locations.current,
      max: props.usage.locations.max,
      percentage: calculatePercentage(props.usage.locations.current, props.usage.locations.max),
    },
    {
      label: 'Menu Items',
      current: props.usage.menuItems.current,
      max: props.usage.menuItems.max,
      percentage: calculatePercentage(props.usage.menuItems.current, props.usage.menuItems.max),
    },
    {
      label: 'Categories',
      current: props.usage.categories.current,
      max: props.usage.categories.max,
      percentage: calculatePercentage(props.usage.categories.current, props.usage.categories.max),
    },
  ]
})
</script>

<style scoped lang="scss">
@use './subscription-details';
</style>
