import { enhancedToast, type ToastOptions } from '~/services/enhanced-toast.service'

/**
 * Toast notification composable
 * Provides a standardized interface for showing notifications
 */
export const useToast = () => {
  /**
   * Show success notification
   */
  const success = (message: string, options?: ToastOptions) => {
    return enhancedToast.success(message, options)
  }

  /**
   * Show error notification
   */
  const error = (message: string, requestId?: string, options?: ToastOptions) => {
    return enhancedToast.error(message, requestId, options)
  }

  /**
   * Show warning notification
   */
  const warning = (message: string, requestId?: string, options?: ToastOptions) => {
    return enhancedToast.warning(message, requestId, options)
  }

  /**
   * Show info notification
   */
  const info = (message: string, options?: ToastOptions) => {
    return enhancedToast.info(message, options)
  }

  /**
   * Dismiss notification by ID
   */
  const dismiss = (id: string) => {
    enhancedToast.dismiss(id)
  }

  /**
   * Dismiss all notifications
   */
  const dismissAll = () => {
    enhancedToast.dismissAll()
  }

  return {
    success,
    error,
    warning,
    info,
    dismiss,
    dismissAll,
    // For backward compatibility with simpler components
    setToastInstance: (instance: any) => {
      // Legacy method, not used in the new enhanced system
    }
  }
}

