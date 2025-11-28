// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  
  modules: ['@pinia/nuxt'],
  
  css: ['~/assets/scss/main.scss'],
  
  devServer: {
    port: 3003,
  },
  
  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: '@use "~/assets/scss/variables" as *;'
        }
      }
    }
  },
  
  runtimeConfig: {
    public: {
      apiBaseUrl: process.env.NUXT_PUBLIC_API_BASE_URL || 'http://localhost:3000',
      // Tenant extracted from path (app.kataloga.kg/{tenant}) or subdomain (vip.kataloga.kg)
      appDomain: process.env.NUXT_PUBLIC_APP_DOMAIN || 'localhost:3003'
    }
  },
  
  typescript: {
    strict: true,
    typeCheck: true
  },
  
  app: {
    head: {
      title: 'Tenant Admin Dashboard',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Manage your restaurant menu and operations' }
      ]
    }
  }
})
