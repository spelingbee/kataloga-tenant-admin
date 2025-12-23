/**
 * Enhanced Toast Plugin
 * 
 * Integrates the enhanced toast system with Nuxt
 * Requirement 9.1: RequestId display in toast notifications
 */

import { enhancedToast } from '~/services/enhanced-toast.service';

export default defineNuxtPlugin({
  name: 'enhanced-toast',
  dependsOn: ['toast'], // Load after basic toast plugin
  setup(nuxtApp) {
    // Initialize enhanced toast service
    if (import.meta.client) {
      // The service will auto-initialize its container
    }

    // Only provide enhanced toast, don't override $toast
    return {
      provide: {
        enhancedToast
      }
    };
  }
});