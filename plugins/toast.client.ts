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
    const { success, error, warning, info, setToastInstance } = useToast();
    
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
        
        // In a real implementation, this would show a UI toast
        // For now, we'll just log to console to prevent errors
      }
    };
    
    // Initialize the toast instance
    setToastInstance(simpleToastInstance);
    
    // Create toast interface that matches what Enhanced API Service expects
    const toastInterface = {
      success: (msg: string, options?: any) => success(msg),
      error: (msg: string, options?: any) => error(msg),
      warning: (msg: string, options?: any) => warning(msg),
      info: (msg: string, options?: any) => info(msg),
      dismiss: (id: string) => {
        // Note: Current toast composable doesn't support dismiss by ID
        // This is a placeholder for future implementation
        console.log('[Toast Dismiss]', id);
      }
    };

    return {
      provide: {
        toast: toastInterface
      }
    };
  }
});
