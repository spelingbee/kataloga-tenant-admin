// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  
  modules: [
    '@pinia/nuxt',
    '@nuxtjs/i18n'
  ],
  
  i18n: {
    locales: [
      { code: 'en', iso: 'en-US', name: 'English', file: 'en.json' },
      { code: 'ru', iso: 'ru-RU', name: 'Русский', file: 'ru.json' },
      { code: 'ky', iso: 'ky-KG', name: 'Кыргызча', file: 'ky.json' }
    ],
    langDir: 'locales',
    defaultLocale: 'ru',
    strategy: 'no_prefix',
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'tenant_admin_locale',
      redirectOn: 'root',
      alwaysRedirect: false,
      fallbackLocale: 'en'
    }
  },
  
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
      apiBaseUrl: process.env.NUXT_PUBLIC_API_URL || 'http://localhost:3001',
      // Tenant extracted from path (app.kataloga.org/{tenant}) or subdomain (vip.kataloga.org)
      appDomain: process.env.NUXT_PUBLIC_APP_DOMAIN || 'kataloga.org'
    }
  },
  
  typescript: {
    strict: true,
    typeCheck: false
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
