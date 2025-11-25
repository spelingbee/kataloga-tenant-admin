<template>
  <ModalBase
    v-model="isOpen"
    :close-on-overlay="closeOnOverlay"
    size="sm"
  >
    <div class="confirm-dialog">
      <div class="confirm-dialog__header">
        <div class="confirm-dialog__icon" :class="`confirm-dialog__icon--${variant}`">
          {{ getIcon() }}
        </div>
        <h3 class="confirm-dialog__title">{{ title }}</h3>
      </div>
      <div class="confirm-dialog__body">
        <p class="confirm-dialog__message">{{ message }}</p>
      </div>
      <div class="confirm-dialog__footer">
        <button
          class="confirm-dialog__button confirm-dialog__button--secondary"
          @click="handleCancel"
        >
          {{ cancelText }}
        </button>
        <button
          class="confirm-dialog__button"
          :class="`confirm-dialog__button--${variant}`"
          @click="handleConfirm"
        >
          {{ confirmText }}
        </button>
      </div>
    </div>
  </ModalBase>
</template>

<script setup lang="ts">
import ModalBase from './ModalBase.vue'

interface Props {
  modelValue: boolean
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  variant?: 'primary' | 'danger' | 'warning'
  closeOnOverlay?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  confirmText: 'Confirm',
  cancelText: 'Cancel',
  variant: 'primary',
  closeOnOverlay: true
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'confirm': []
  'cancel': []
}>()

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const getIcon = (): string => {
  const icons = {
    primary: 'ℹ️',
    danger: '⚠️',
    warning: '⚠️'
  }
  return icons[props.variant]
}

const handleConfirm = () => {
  emit('confirm')
  isOpen.value = false
}

const handleCancel = () => {
  emit('cancel')
  isOpen.value = false
}
</script>

<style scoped lang="scss">
@use './base';
@use './confirm-dialog';
</style>
