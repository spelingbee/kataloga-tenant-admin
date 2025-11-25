<template>
  <Teleport to="body">
    <div class="toast-container">
      <TransitionGroup name="toast">
        <div
          v-for="toast in toasts"
          :key="toast.id"
          class="toast"
          :class="`toast--${toast.type}`"
        >
          <div class="toast__icon">{{ getIcon(toast.type) }}</div>
          <div class="toast__content">
            <div v-if="toast.title" class="toast__title">{{ toast.title }}</div>
            <div class="toast__message">{{ toast.message }}</div>
          </div>
          <button class="toast__close" @click="removeToast(toast.id)">×</button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
export interface Toast {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title?: string
  message: string
  duration?: number
}

const toasts = ref<Toast[]>([])

const getIcon = (type: string): string => {
  const icons = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ'
  }
  return icons[type as keyof typeof icons] || 'ℹ'
}

const addToast = (toast: Omit<Toast, 'id'>): void => {
  const id = `toast-${Date.now()}-${Math.random()}`
  const duration = toast.duration || 5000

  toasts.value.push({ ...toast, id })

  if (duration > 0) {
    setTimeout(() => {
      removeToast(id)
    }, duration)
  }
}

const removeToast = (id: string): void => {
  const index = toasts.value.findIndex(t => t.id === id)
  if (index > -1) {
    toasts.value.splice(index, 1)
  }
}

// Expose methods for external use
defineExpose({
  addToast,
  removeToast
})
</script>

<style scoped lang="scss">
@use './toast';
</style>
