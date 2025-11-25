import type { Toast } from '~/components/ui/Toast/Toast.vue'

interface ToastOptions {
  title?: string
  message: string
  duration?: number
}

let toastInstance: any = null

export const useToast = () => {
  const setToastInstance = (instance: any) => {
    toastInstance = instance
  }

  const showToast = (type: Toast['type'], options: ToastOptions | string) => {
    if (!toastInstance) {
      console.warn('Toast instance not initialized')
      return
    }

    const toastData = typeof options === 'string'
      ? { message: options }
      : options

    toastInstance.addToast({
      type,
      ...toastData
    })
  }

  const success = (options: ToastOptions | string) => {
    showToast('success', options)
  }

  const error = (options: ToastOptions | string) => {
    showToast('error', options)
  }

  const warning = (options: ToastOptions | string) => {
    showToast('warning', options)
  }

  const info = (options: ToastOptions | string) => {
    showToast('info', options)
  }

  return {
    setToastInstance,
    success,
    error,
    warning,
    info
  }
}
