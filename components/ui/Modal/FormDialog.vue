<template>
  <ModalBase
    v-model="isOpen"
    :close-on-overlay="closeOnOverlay"
    :size="size"
  >
    <div class="form-dialog">
      <div class="form-dialog__header">
        <h3 class="form-dialog__title">{{ title }}</h3>
        <button class="form-dialog__close" @click="handleClose">×</button>
      </div>
      <div class="form-dialog__body">
        <slot />
      </div>
      <div v-if="showFooter" class="form-dialog__footer">
        <slot name="footer">
          <button
            class="form-dialog__button form-dialog__button--secondary"
            @click="handleCancel"
          >
            {{ cancelText }}
          </button>
          <button
            class="form-dialog__button form-dialog__button--primary"
            :disabled="loading"
            @click="handleSubmit"
          >
            <LoadingSpinner v-if="loading" size="sm" />
            <span v-else>{{ submitText }}</span>
          </button>
        </slot>
      </div>
    </div>
  </ModalBase>
</template>

<script setup lang="ts">
import ModalBase from './ModalBase.vue'
import LoadingSpinner from '../LoadingSpinner.vue'

interface Props {
  modelValue: boolean
  title: string
  submitText?: string
  cancelText?: string
  loading?: boolean
  closeOnOverlay?: boolean
  showFooter?: boolean
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

const props = withDefaults(defineProps<Props>(), {
  submitText: 'Submit',
  cancelText: 'Cancel',
  loading: false,
  closeOnOverlay: true,
  showFooter: true,
  size: 'md'
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'submit': []
  'cancel': []
}>()

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const handleClose = () => {
  isOpen.value = false
}

const handleSubmit = () => {
  emit('submit')
}

const handleCancel = () => {
  emit('cancel')
  isOpen.value = false
}
</script>

<style scoped lang="scss">
@use './base';
@use './form-dialog';
</style>
