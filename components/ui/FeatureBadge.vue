<template>
  <span 
    v-if="showBadge"
    class="feature-badge"
    :class="badgeClass"
    :title="tooltipText"
  >
    {{ badgeText }}
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  requiredPlan: 'PRO' | 'BUSINESS'
  variant?: 'default' | 'compact'
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default',
})

const showBadge = computed(() => {
  return !!props.requiredPlan
})

const badgeText = computed(() => {
  if (props.variant === 'compact') {
    return props.requiredPlan === 'BUSINESS' ? 'B' : 'P'
  }
  return props.requiredPlan
})

const badgeClass = computed(() => {
  return [
    `feature-badge--${props.requiredPlan.toLowerCase()}`,
    `feature-badge--${props.variant}`,
  ]
})

const tooltipText = computed(() => {
  return `${props.requiredPlan} plan required`
})
</script>

<style scoped lang="scss">
@use '../../assets/scss/variables' as *;

.feature-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 0.625rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-radius: $radius-sm;
  cursor: help;
}

.feature-badge--default {
  padding: 2px 6px;
}

.feature-badge--compact {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  padding: 0;
}

.feature-badge--pro {
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
}

.feature-badge--business {
  background: rgba(168, 85, 247, 0.1);
  color: #a855f7;
}
</style>
