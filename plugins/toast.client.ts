/**
 * Toast Plugin
 * 
 * Provides toast notification functionality for the application
 * This plugin should load before the enhanced-api plugin
 */

export default defineNuxtPlugin({
  name: 'toast',
  setup(nuxtApp) {
    // Initialize toast functionality
    const toast = useToast();
    const { success, error, warning, info, dismiss, setToastInstance } = toast;
    
    // Create a simple toast instance for initialization
    const simpleToastInstance = {
      addToast: (toast: any) => {
        // Simple console-based toast for development/fallback
        const typeEmoji = {
          success: '✅',
          error: '❌', 
          warning: '⚠️',
          info: 'ℹ️'
        };
        
        console.log(`${typeEmoji[toast.type as keyof typeof typeEmoji] || '📢'} ${toast.message}`);
      }
    };
    
    // Initialize the toast instance
    setToastInstance(simpleToastInstance);
    
    // Create toast interface that matches what Enhanced API Service expects
    const toastInterface = {
      success: (msg: string, options?: any) => success(msg, options),
      error: (msg: string, requestId?: string, options?: any) => error(msg, requestId, options),
      warning: (msg: string, requestId?: string, options?: any) => warning(msg, requestId, options),
      info: (msg: string, options?: any) => info(msg, options),
      dismiss: (id: string) => dismiss(id)
    };


    return {
      provide: {
        toast: toastInterface
      }
    };
  }
});
