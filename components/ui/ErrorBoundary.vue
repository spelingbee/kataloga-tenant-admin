<template>
  <div v-if="error" class="error-boundary">
    <div class="error-boundary__content">
      <div class="error-boundary__icon">⚠️</div>
      <h2 class="error-boundary__title">{{ title }}</h2>
      <p class="error-boundary__message">{{ message }}</p>
      <div v-if="showDetails && error" class="error-boundary__details">
        <details>
          <summary class="error-boundary__details-toggle">Show error details</summary>
          <pre class="error-boundary__details-content">{{ error }}</pre>
        </details>
      </div>
      <div class="error-boundary__actions">
        <button class="error-boundary__button" @click="handleRetry">
          Try Again
        </button>
        <button class="error-boundary__button error-boundary__button--secondary" @click="handleGoHome">
          Go to Dashboard
        </button>
      </div>
    </div>
  </div>
  <slot v-else />
</template>

<script setup lang="ts">
interface Props {
  title?: string
  message?: string
  showDetails?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Something went wrong',
  message: 'An unexpected error occurred. Please try again.',
  showDetails: true
})

const error = ref<Error | null>(null)
const router = useRouter()

// Capture errors from child components
onErrorCaptured((err: Error) => {
  error.value = err
  console.error('Error captured by ErrorBoundary:', err)
  return false // Prevent error from propagating
})

const handleRetry = () => {
  error.value = null
  // Force re-render by triggering a key change in parent if needed
}

const handleGoHome = () => {
  error.value = null
  router.push('/')
}

// Reset error when route changes
watch(() => router.currentRoute.value.path, () => {
  error.value = null
})
</script>

<style scoped lang="scss">
@use '@/assets/scss/variables' as *;

.error-boundary {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  padding: $spacing-xl;
}

.error-boundary__content {
  max-width: 600px;
  text-align: center;
}

.error-boundary__icon {
  font-size: 4rem;
  margin-bottom: $spacing-lg;
}

.error-boundary__title {
  font-size: $font-size-2xl;
  font-weight: $font-weight-bold;
  color: $text-primary;
  margin-bottom: $spacing-md;
}

.error-boundary__message {
  font-size: $font-size-base;
  color: $text-secondary;
  line-height: $line-height-normal;
  margin-bottom: $spacing-xl;
}

.error-boundary__details {
  margin-bottom: $spacing-xl;
  text-align: left;
}

.error-boundary__details-toggle {
  cursor: pointer;
  color: $primary-color;
  font-size: $font-size-sm;
  font-weight: $font-weight-medium;
  padding: $spacing-sm;
  user-select: none;

  &:hover {
    color: $primary-dark;
  }
}

.error-boundary__details-content {
  margin-top: $spacing-md;
  padding: $spacing-md;
  background: $bg-secondary;
  border: 1px solid $border-color;
  border-radius: $radius-md;
  font-size: $font-size-xs;
  font-family: $font-family-mono;
  color: $error-color;
  overflow-x: auto;
  max-height: 200px;
  overflow-y: auto;
}

.error-boundary__actions {
  display: flex;
  gap: $spacing-md;
  justify-content: center;
  flex-wrap: wrap;
}

.error-boundary__button {
  padding: $spacing-sm $spacing-lg;
  border: none;
  border-radius: $radius-md;
  font-size: $font-size-base;
  font-weight: $font-weight-medium;
  cursor: pointer;
  transition: all $transition-fast;
  background: $primary-color;
  color: $text-white;

  &:hover {
    background: $primary-dark;
  }
}

.error-boundary__button--secondary {
  background: $bg-secondary;
  color: $text-primary;
  border: 1px solid $border-color;

  &:hover {
    background: $bg-tertiary;
  }
}
</style>
