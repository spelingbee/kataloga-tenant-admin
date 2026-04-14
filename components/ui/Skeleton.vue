<template>
  <div class="skeleton" :class="skeletonClass">
    <div class="skeleton__shimmer"></div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  width?: string
  height?: string
  variant?: 'text' | 'circular' | 'rectangular' | 'card'
  animation?: 'pulse' | 'wave' | 'none'
}

const props = withDefaults(defineProps<Props>(), {
  width: '100%',
  height: '20px',
  variant: 'rectangular',
  animation: 'wave'
})

const skeletonClass = computed(() => ({
  [`skeleton--${props.variant}`]: true,
  [`skeleton--${props.animation}`]: true
}))
</script>

<style scoped lang="scss">
.skeleton {
  position: relative;
  overflow: hidden;
  background-color: #e0e0e0;
  
  &--text {
    border-radius: 4px;
    height: v-bind(height);
    width: v-bind(width);
  }
  
  &--circular {
    border-radius: 50%;
    width: v-bind(width);
    height: v-bind(width);
  }
  
  &--rectangular {
    border-radius: 4px;
    width: v-bind(width);
    height: v-bind(height);
  }
  
  &--card {
    border-radius: 8px;
    width: v-bind(width);
    height: v-bind(height);
  }
  
  &--wave {
    .skeleton__shimmer {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(
        90deg,
        transparent,
        rgba(255, 255, 255, 0.5),
        transparent
      );
      animation: wave 1.5s infinite;
    }
  }
  
  &--pulse {
    animation: pulse 1.5s ease-in-out infinite;
  }
}

@keyframes wave {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}
</style>
