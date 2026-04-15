/**
 * Nuxt App Type Declarations
 * 
 * Extends Nuxt app with custom plugins and services
 */

import type { ApiClient } from '~/utils/api'

// Toast interface that matches what our plugins provide
interface ToastInterface {
  success: (msg: string, options?: any) => void;
  error: (msg: string, options?: any) => void;
  warning: (msg: string, options?: any) => void;
  info: (msg: string, options?: any) => void;
  dismiss: (id: string) => void;
}

declare module '#app' {
  interface NuxtApp {
    $api: ApiClient;
    $toast: ToastInterface;
  }
}

declare module 'vue' {
  interface ComponentCustomProperties {
    $api: ApiClient;
    $toast: ToastInterface;
  }
}

// Ensure this file is treated as a module
export {};