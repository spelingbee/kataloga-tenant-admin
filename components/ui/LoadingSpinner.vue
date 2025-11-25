<template>
  <div class="loading-spinner" :class="sizeClass">
    <div class="loading-spinner__circle"></div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  size?: 'sm' | 'md' | 'lg'
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md'
})

const sizeClass = computed(() => `loading-spinner--${props.size}`)
</script>

<style scoped lang="scss">
@use '@/assets/scss/variables' as *;

.loading-spinner {
  display: inline-block;
}

.loading-spinner__circle {
  border: 2px solid $border-color;
  border-top-color: $primary-color;
  border-radius: $radius-full;
  animation: spin 0.6s linear infinite;
}

.loading-spinner--sm .loading-spinner__circle {
  width: 16px;
  height: 16px;
}

.loading-spinner--md .loading-spinner__circle {
  width: 24px;
  height: 24px;
}

.loading-spinner--lg .loading-spinner__circle {
  width: 32px;
  height: 32px;
  border-width: 3px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
