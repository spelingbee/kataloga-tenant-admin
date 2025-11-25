<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="modelValue" class="modal-overlay" @click="handleOverlayClick">
        <div class="modal" :class="sizeClass" @click.stop>
          <slot />
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
interface Props {
  modelValue: boolean
  closeOnOverlay?: boolean
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

const props = withDefaults(defineProps<Props>(), {
  closeOnOverlay: true,
  size: 'md'
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const sizeClass = computed(() => `modal--${props.size}`)

const handleOverlayClick = (): void => {
  if (props.closeOnOverlay) {
    emit('update:modelValue', false)
  }
}

// Prevent body scroll when modal is open
watch(
  () => props.modelValue,
  (isOpen) => {
    if (process.client) {
      if (isOpen) {
        document.body.style.overflow = 'hidden'
      } else {
        document.body.style.overflow = ''
      }
    }
  }
)

// Cleanup on unmount
onUnmounted(() => {
  if (process.client) {
    document.body.style.overflow = ''
  }
})
</script>

<style scoped lang="scss">
@use '../../assets/scss/variables' as *;

.modal-overlay {
  position: fixed;
  inset: 0;
  background: $bg-overlay;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: $z-modal;
  padding: $spacing-md;
}

.modal {
  background: $bg-primary;
  border-radius: $radius-lg;
  box-shadow: $shadow-xl;
  max-height: 90vh;
  overflow-y: auto;
  width: 100%;
}

.modal--sm {
  max-width: 400px;
}

.modal--md {
  max-width: 600px;
}

.modal--lg {
  max-width: 800px;
}

.modal--xl {
  max-width: 1200px;
}

.modal-enter-active,
.modal-leave-active {
  transition: opacity $transition-base;
}

.modal-enter-active .modal,
.modal-leave-active .modal {
  transition: transform $transition-base;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal,
.modal-leave-to .modal {
  transform: scale(0.95);
}
</style>
