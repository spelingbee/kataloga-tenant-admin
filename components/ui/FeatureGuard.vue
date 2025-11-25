<template>
  <div v-if="hasAccess" class="feature-guard">
    <slot />
  </div>
  <div v-else-if="showFallback" class="feature-guard-locked">
    <div class="feature-guard-locked__content">
      <div class="feature-guard-locked__icon">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      </div>
      <div class="feature-guard-locked__text">
        <h4 class="feature-guard-locked__title">
          {{ fallbackTitle }}
        </h4>
        <p class="feature-guard-locked__message">
          {{ fallbackMessage }}
        </p>
        <button 
          class="feature-guard-locked__button"
          @click="handleUpgrade"
        >
          Upgrade to {{ requiredPlan }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { FeatureKey } from '~/types'

interface Props {
  feature: FeatureKey
  showFallback?: boolean
  fallbackTitle?: string
  fallbackMessage?: string
}

const props = withDefaults(defineProps<Props>(), {
  showFallback: true,
  fallbackTitle: 'Feature Locked',
  fallbackMessage: 'Upgrade your plan to access this feature',
})

const { hasFeature, getRequiredPlan, redirectToUpgrade } = useFeatureAccess()

const hasAccess = computed(() => hasFeature(props.feature))

const requiredPlan = computed(() => getRequiredPlan(props.feature))

const handleUpgrade = () => {
  redirectToUpgrade(props.feature)
}
</script>

<style scoped lang="scss">
@use '../../assets/scss/variables' as *;

.feature-guard {
  width: 100%;
}

.feature-guard-locked {
  width: 100%;
  padding: $spacing-xl;
  background: $bg-secondary;
  border: 2px dashed $border-color;
  border-radius: $radius-lg;
}

.feature-guard-locked__content {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: $spacing-md;
}

.feature-guard-locked__icon {
  width: 64px;
  height: 64px;
  background: rgba(100, 116, 139, 0.1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;

  svg {
    width: 32px;
    height: 32px;
    color: $text-secondary;
  }
}

.feature-guard-locked__text {
  max-width: 400px;
}

.feature-guard-locked__title {
  font-size: 1.125rem;
  font-weight: 600;
  color: $text-primary;
  margin: 0 0 $spacing-xs 0;
}

.feature-guard-locked__message {
  font-size: 0.875rem;
  color: $text-secondary;
  margin: 0 0 $spacing-md 0;
  line-height: 1.5;
}

.feature-guard-locked__button {
  padding: $spacing-sm $spacing-lg;
  background: $primary-color;
  color: white;
  border: none;
  border-radius: $radius-md;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: background $transition-base;

  &:hover {
    background: darken($primary-color, 10%);
  }
}

@media (max-width: $breakpoint-sm) {
  .feature-guard-locked {
    padding: $spacing-lg;
  }

  .feature-guard-locked__icon {
    width: 48px;
    height: 48px;

    svg {
      width: 24px;
      height: 24px;
    }
  }
}
</style>
