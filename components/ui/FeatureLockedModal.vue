<template>
  <div v-if="show" class="feature-locked-modal-overlay" @click="handleOverlayClick">
    <div class="feature-locked-modal" @click.stop>
      <div class="feature-locked-modal__header">
        <div class="feature-locked-modal__icon">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h3 class="feature-locked-modal__title">{{ title }}</h3>
        <button 
          class="feature-locked-modal__close"
          @click="handleClose"
          aria-label="Close modal"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div class="feature-locked-modal__body">
        <p class="feature-locked-modal__message">
          {{ message }}
        </p>

        <div class="feature-locked-modal__plan-info">
          <div class="feature-locked-modal__current-plan">
            <span class="feature-locked-modal__label">Current Plan:</span>
            <span class="feature-locked-modal__plan-badge feature-locked-modal__plan-badge--current">
              {{ currentPlan }}
            </span>
          </div>
          <div class="feature-locked-modal__required-plan">
            <span class="feature-locked-modal__label">Required Plan:</span>
            <span class="feature-locked-modal__plan-badge feature-locked-modal__plan-badge--required">
              {{ requiredPlan }}
            </span>
          </div>
        </div>

        <div v-if="benefits && benefits.length > 0" class="feature-locked-modal__benefits">
          <h4 class="feature-locked-modal__benefits-title">What you'll get:</h4>
          <ul class="feature-locked-modal__benefits-list">
            <li 
              v-for="(benefit, index) in benefits" 
              :key="index"
              class="feature-locked-modal__benefit-item"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              <span>{{ benefit }}</span>
            </li>
          </ul>
        </div>
      </div>

      <div class="feature-locked-modal__footer">
        <button 
          class="feature-locked-modal__button feature-locked-modal__button--secondary"
          @click="handleClose"
        >
          Maybe Later
        </button>
        <button 
          class="feature-locked-modal__button feature-locked-modal__button--primary"
          @click="handleUpgrade"
        >
          Upgrade Now
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { FeatureKey } from '~/types'

interface Props {
  show: boolean
  featureKey?: FeatureKey | null
  featureName?: string
  currentPlan?: string
  requiredPlan?: string
}

interface Emits {
  (e: 'close'): void
  (e: 'upgrade'): void
}

const props = withDefaults(defineProps<Props>(), {
  show: false,
  featureKey: null,
  featureName: '',
  currentPlan: 'FREE',
  requiredPlan: 'PRO',
})

const emit = defineEmits<Emits>()

const title = computed(() => {
  return props.featureName 
    ? `${props.featureName} is not available` 
    : 'Feature not available'
})

const message = computed(() => {
  return `This feature is only available on the ${props.requiredPlan} plan or higher. Upgrade your plan to unlock this feature and many more.`
})

const benefits = computed(() => {
  const benefitMap: Record<string, string[]> = {
    'PRO': [
      'Sales Analytics Dashboard',
      'Multi-Location Support (up to 3)',
      'Audit Trail & Change History',
      'Multi-User Access (up to 5)',
      'Basic Data Export',
    ],
    'BUSINESS': [
      'Everything in PRO',
      'Advanced Reporting & Analytics',
      'Unlimited Locations',
      'Unlimited Users',
      'API Access & Integrations',
      'Custom Branding',
      'Priority Support',
      'Advanced Data Export (PDF, Excel)',
    ],
  }
  
  return benefitMap[props.requiredPlan] || []
})

const handleClose = () => {
  emit('close')
}

const handleUpgrade = () => {
  emit('upgrade')
}

const handleOverlayClick = () => {
  handleClose()
}
</script>

<style scoped lang="scss">
@use '../../assets/scss/variables' as *;

.feature-locked-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: $spacing-md;
}

.feature-locked-modal {
  background: $bg-primary;
  border-radius: $radius-lg;
  max-width: 500px;
  width: 100%;
  box-shadow: $shadow-lg;
  animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.feature-locked-modal__header {
  padding: $spacing-lg;
  border-bottom: 1px solid $border-color;
  display: flex;
  align-items: center;
  gap: $spacing-md;
  position: relative;
}

.feature-locked-modal__icon {
  width: 48px;
  height: 48px;
  background: rgba(239, 68, 68, 0.1);
  border-radius: $radius-md;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  svg {
    width: 24px;
    height: 24px;
    color: $error-color;
  }
}

.feature-locked-modal__title {
  font-size: 1.25rem;
  font-weight: 600;
  color: $text-primary;
  margin: 0;
  flex: 1;
}

.feature-locked-modal__close {
  position: absolute;
  top: $spacing-lg;
  right: $spacing-lg;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: $spacing-xs;
  color: $text-secondary;
  transition: color $transition-base;

  &:hover {
    color: $text-primary;
  }

  svg {
    width: 20px;
    height: 20px;
  }
}

.feature-locked-modal__body {
  padding: $spacing-lg;
}

.feature-locked-modal__message {
  color: $text-secondary;
  line-height: 1.6;
  margin: 0 0 $spacing-lg 0;
}

.feature-locked-modal__plan-info {
  display: flex;
  gap: $spacing-lg;
  margin-bottom: $spacing-lg;
  padding: $spacing-md;
  background: $bg-secondary;
  border-radius: $radius-md;
}

.feature-locked-modal__current-plan {
  flex: 1;
}

.feature-locked-modal__required-plan {
  flex: 1;
}

.feature-locked-modal__label {
  display: block;
  font-size: 0.75rem;
  color: $text-secondary;
  margin-bottom: $spacing-xs;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.feature-locked-modal__plan-badge {
  display: inline-block;
  padding: $spacing-xs $spacing-sm;
  border-radius: $radius-sm;
  font-size: 0.875rem;
  font-weight: 600;
}

.feature-locked-modal__plan-badge--current {
  background: rgba(100, 116, 139, 0.1);
  color: $text-secondary;
}

.feature-locked-modal__plan-badge--required {
  background: rgba(14, 165, 233, 0.1);
  color: $primary-color;
}

.feature-locked-modal__benefits {
  margin-top: $spacing-lg;
}

.feature-locked-modal__benefits-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: $text-primary;
  margin: 0 0 $spacing-sm 0;
}

.feature-locked-modal__benefits-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.feature-locked-modal__benefit-item {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
  padding: $spacing-xs 0;
  color: $text-secondary;
  font-size: 0.875rem;

  svg {
    width: 16px;
    height: 16px;
    color: $success-color;
    flex-shrink: 0;
  }
}

.feature-locked-modal__footer {
  padding: $spacing-lg;
  border-top: 1px solid $border-color;
  display: flex;
  gap: $spacing-md;
  justify-content: flex-end;
}

.feature-locked-modal__button {
  padding: $spacing-sm $spacing-lg;
  border-radius: $radius-md;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all $transition-base;
  border: none;
}

.feature-locked-modal__button--secondary {
  background: transparent;
  color: $text-secondary;

  &:hover {
    background: $bg-secondary;
    color: $text-primary;
  }
}

.feature-locked-modal__button--primary {
  background: $primary-color;
  color: white;

  &:hover {
    background: darken($primary-color, 10%);
  }
}

@media (max-width: $breakpoint-sm) {
  .feature-locked-modal {
    max-width: 100%;
    margin: $spacing-md;
  }

  .feature-locked-modal__plan-info {
    flex-direction: column;
    gap: $spacing-md;
  }

  .feature-locked-modal__footer {
    flex-direction: column;

    button {
      width: 100%;
    }
  }
}
</style>
