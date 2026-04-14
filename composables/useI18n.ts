import { ref, computed } from 'vue'
import ru from '~/locales/ru.json'
import en from '~/locales/en.json'
import ky from '~/locales/ky.json'

const locales = {
  ru,
  en,
  ky
}

const currentLocale = ref<'ru' | 'en' | 'ky'>('ru')

export const useI18n = () => {
  const locale = computed({
    get: () => currentLocale.value,
    set: (val: 'ru' | 'en' | 'ky') => {
      currentLocale.value = val
      if (process.client) {
        localStorage.setItem('locale', val)
      }
    }
  })

  const t = (key: string, params?: Record<string, any>): string => {
    const keys = key.split('.')
    let value: any = locales[currentLocale.value]
    
    for (const k of keys) {
      if (value && typeof value === 'object') {
        value = value[k]
      } else {
        return key
      }
    }
    
    if (typeof value !== 'string') {
      return key
    }
    
    // Replace parameters
    if (params) {
      return value.replace(/\{(\w+)\}/g, (match, param) => {
        return params[param] !== undefined ? String(params[param]) : match
      })
    }
    
    return value
  }

  const setLocale = (newLocale: 'ru' | 'en' | 'ky') => {
    locale.value = newLocale
  }

  const availableLocales = [
    { code: 'ru', name: 'Русский' },
    { code: 'en', name: 'English' },
    { code: 'ky', name: 'Кыргызча' }
  ]

  return {
    locale,
    t,
    setLocale,
    locales: availableLocales
  }
}

// Initialize locale from localStorage on client
if (process.client) {
  const savedLocale = localStorage.getItem('locale') as 'ru' | 'en' | 'ky' | null
  if (savedLocale && ['ru', 'en', 'ky'].includes(savedLocale)) {
    currentLocale.value = savedLocale
  }
}
