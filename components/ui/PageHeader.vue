<template>
  <div class="page-header">
    <div class="page-header__left">
      <button 
        v-if="showBackButton" 
        class="page-header__back-btn" 
        @click="handleBack"
        :title="`Back to ${backLabel}`"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        {{ backLabel }}
      </button>
      
      <div class="page-header__titles">
        <h1 class="page-header__title">{{ title }}</h1>
        <p v-if="subtitle" class="page-header__subtitle">{{ subtitle }}</p>
      </div>
    </div>
    
    <div class="page-header__actions">
      <slot name="actions" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useNavigation } from '~/composables/useNavigation'

interface Props {
  title: string
  subtitle?: string
  backTo?: string
  backLabel?: string
  showBackButton?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  backTo: '/',
  backLabel: 'Dashboard',
  showBackButton: true
})

const { navigateToTenant } = useNavigation()

const handleBack = () => {
  navigateToTenant(props.backTo)
}
</script>

<style scoped lang="scss">
@use '@/assets/scss/variables' as *;

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: $spacing-xl;
  gap: $spacing-md;
}

.page-header__left {
  display: flex;
  align-items: flex-start;
  gap: $spacing-lg;
}

.page-header__back-btn {
  display: flex;
  align-items: center;
  gap: $spacing-xs;
  padding: $spacing-xs $spacing-sm;
  background: transparent;
  border: 1px solid $border-color;
  border-radius: $radius-md;
  color: $text-secondary;
  font-size: $font-size-sm;
  font-weight: $font-weight-medium;
  cursor: pointer;
  transition: all $transition-base;
  margin-top: 4px;
  white-space: nowrap;

  svg {
    width: 16px;
    height: 16px;
  }

  &:hover {
    background: $bg-secondary;
    color: $primary-color;
    border-color: $primary-color;
    transform: translateX(-2px);
  }
}

.page-header__titles {
  display: flex;
  flex-direction: column;
}

.page-header__title {
  margin: 0;
  font-size: $font-size-3xl;
  font-weight: $font-weight-bold;
  color: $text-primary;
  line-height: 1.2;
}

.page-header__subtitle {
  margin: $spacing-xs 0 0 0;
  font-size: $font-size-lg;
  color: $text-secondary;
}

.page-header__actions {
  display: flex;
  align-items: center;
  gap: $spacing-md;
}

@media (max-width: $breakpoint-md) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .page-header__left {
    flex-direction: column;
    gap: $spacing-sm;
  }
  
  .page-header__back-btn {
    margin-top: 0;
  }
  
  .page-header__actions {
    width: 100%;
    justify-content: flex-start;
  }
}
</style>
