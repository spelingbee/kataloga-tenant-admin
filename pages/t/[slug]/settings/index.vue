<template>
  <div class="settings-page">
    <PageHeader 
      :title="t('settings.title')" 
      :subtitle="t('settings.subtitle')"
    />


    <!-- Loading State -->
    <div v-if="loading" class="settings-page__loading">
      <div class="loading-spinner" />
      <p>{{ t('common.loading') }}</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="settings-page__error">
      <p>{{ error }}</p>
      <button @click="refreshData">{{ t('common.retry') }}</button>
    </div>

    <!-- Settings Content -->
    <div v-else class="settings-page__content">
      <!-- Restaurant Information -->
      <div class="settings-section">
        <h2 class="settings-section__title">{{ t('settings.restaurantInfo') }}</h2>
        <div class="settings-section__content">
          <div class="form-group">
            <label for="storeName" class="form-label">{{ t('settings.restaurantName') }}</label>
            <input
              id="storeName"
              v-model="settings.storeName"
              type="text"
              class="form-input"
              :placeholder="t('settings.restaurantNamePlaceholder')"
            />
          </div>

          <div class="form-group">
            <label for="description" class="form-label">{{ t('common.description') }}</label>
            <textarea
              id="description"
              v-model="settings.description"
              class="form-textarea"
              :placeholder="t('settings.descriptionPlaceholder')"
              rows="3"
            />
          </div>

          <div class="form-group">
            <label for="phone" class="form-label">{{ t('common.phone') }}</label>
            <input
              id="phone"
              v-model="settings.phone"
              type="tel"
              class="form-input"
              :placeholder="t('settings.phonePlaceholder')"
            />
          </div>

          <div class="form-group">
            <label for="address" class="form-label">{{ t('common.address') }}</label>
            <textarea
              id="address"
              v-model="settings.address"
              class="form-textarea"
              :placeholder="t('settings.addressPlaceholder')"
              rows="2"
            />
          </div>
        </div>
      </div>

      <!-- Telegram Integration -->
      <div class="settings-section">
        <h2 class="settings-section__title">{{ t('settings.telegramIntegration') }}</h2>
        <div class="settings-section__content">
          <div class="form-group">
            <label for="telegramBotToken" class="form-label">{{ t('settings.botToken') }}</label>
            <input
              id="telegramBotToken"
              v-model="settings.telegramBotToken"
              type="password"
              class="form-input"
              :placeholder="t('settings.botTokenPlaceholder')"
            />
            <p class="form-help">
              {{ t('settings.botTokenHelp') }} <a href="https://t.me/BotFather" target="_blank">t.me/BotFather</a>
            </p>
          </div>

          <div class="form-group">
            <label class="form-label">{{ t('settings.chatStatus') }}</label>
            <div class="connection-status">
              <div 
                class="status-indicator" 
                :class="settings.telegramChatId ? 'status-indicator--connected' : 'status-indicator--disconnected'"
              />
              <span class="status-text">
                {{ settings.telegramChatId ? t('settings.connected') : t('settings.notConnected') }}
              </span>
            </div>
            <p v-if="!settings.telegramChatId" class="form-help">
              {{ t('settings.startBotHelp') }}
            </p>
          </div>

          <div v-if="settings.telegramBotToken && !settings.telegramChatId" class="form-group">
            <label class="form-label">{{ t('settings.connectBot') }}</label>
            <div class="bot-connection">
              <p class="bot-connection__text">
                {{ t('settings.connectBotDescription') }}
              </p>
              <button 
                class="bot-connection__button"
                @click="connectTelegramBot"
                :disabled="connectLoading"
              >
                <span v-if="connectLoading">{{ t('settings.connecting') }}</span>
                <span v-else>{{ t('settings.connectTelegramBot') }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- WhatsApp Integration -->
      <div class="settings-section">
        <h2 class="settings-section__title">{{ t('settings.whatsappIntegration') }}</h2>
        <div class="settings-section__content">
          <div class="form-group">
            <label for="whatsappPhone" class="form-label">{{ t('settings.whatsappPhone') }}</label>
            <input
              id="whatsappPhone"
              v-model="settings.whatsappPhone"
              type="tel"
              class="form-input"
              placeholder="+1234567890"
            />
            <p class="form-help">
              {{ t('settings.whatsappHelp') }}
            </p>
          </div>
        </div>
      </div>

      <!-- Operating Hours -->
      <div class="settings-section">
        <h2 class="settings-section__title">{{ t('settings.operatingHours') }}</h2>
        <div class="settings-section__content">
          <div class="operating-hours">
            <div v-for="day in daysOfWeek" :key="day.key" class="day-hours">
              <div class="day-hours__day">{{ t(`settings.days.${day.key}`) }}</div>
              <div class="day-hours__controls">
                <label class="checkbox-label">
                  <input
                    v-model="settings.operatingHours[day.key].isOpen"
                    type="checkbox"
                    class="checkbox-input"
                  />
                  <span class="checkbox-custom" />
                  {{ t('settings.open') }}
                </label>
                <div v-if="settings.operatingHours[day.key].isOpen" class="time-inputs">
                  <input
                    v-model="settings.operatingHours[day.key].openTime"
                    type="time"
                    class="time-input"
                  />
                  <span>{{ t('settings.to') }}</span>
                  <input
                    v-model="settings.operatingHours[day.key].closeTime"
                    type="time"
                    class="time-input"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Save Button -->
      <div class="settings-page__actions">
        <button 
          class="save-button"
          @click="saveSettings"
          :disabled="saveLoading"
        >
          <span v-if="saveLoading">{{ t('common.saving') }}</span>
          <span v-else>{{ t('settings.saveSettings') }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import {PageHeader} from "~/components/ui";

definePageMeta({
  middleware: ['auth']
})

const { t } = useI18n()
const { navigateToTenant } = useNavigation()

const loading = ref(false)
const error = ref<string | null>(null)
const saveLoading = ref(false)
const connectLoading = ref(false)

type DayKey = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday'

const daysOfWeek: { key: DayKey }[] = [
  { key: 'monday' },
  { key: 'tuesday' },
  { key: 'wednesday' },
  { key: 'thursday' },
  { key: 'friday' },
  { key: 'saturday' },
  { key: 'sunday' },
]

const settings = reactive({
  storeName: '',
  description: '',
  phone: '',
  address: '',
  telegramBotToken: '',
  telegramBotUsername: '',
  telegramChatId: null as string | null,
  whatsappPhone: '',
  operatingHours: {
    monday: { isOpen: true, openTime: '09:00', closeTime: '22:00' },
    tuesday: { isOpen: true, openTime: '09:00', closeTime: '22:00' },
    wednesday: { isOpen: true, openTime: '09:00', closeTime: '22:00' },
    thursday: { isOpen: true, openTime: '09:00', closeTime: '22:00' },
    friday: { isOpen: true, openTime: '09:00', closeTime: '23:00' },
    saturday: { isOpen: true, openTime: '09:00', closeTime: '23:00' },
    sunday: { isOpen: true, openTime: '10:00', closeTime: '21:00' },
  } as Record<DayKey, { isOpen: boolean; openTime: string; closeTime: string }>
})

const refreshData = async () => {
  loading.value = true
  error.value = null
  try {
    const { $api } = useNuxtApp()
    const data = await $api.get('/auth/tenant')
    
    // Map backend data to local settings state
    // Note: DetailDto has tenant and registration info
    const tenantInfo = data.tenant || {}
    const registrationInfo = data
    
    settings.storeName = tenantInfo.name || registrationInfo.businessName || ''
    settings.description = registrationInfo.businessDescription || ''
    settings.phone = registrationInfo.ownerPhone || ''
    settings.address = registrationInfo.businessAddress || ''
    settings.telegramBotToken = tenantInfo.telegramBotToken || ''
    settings.telegramBotUsername = tenantInfo.telegramBotUsername || ''
    settings.telegramChatId = tenantInfo.telegramChatId ? String(tenantInfo.telegramChatId) : null
    settings.whatsappPhone = tenantInfo.whatsappPhone || registrationInfo.ownerPhone || ''
    
    // If businessAddress is an object (from JSON), try to format it
    if (typeof settings.address === 'object' && settings.address !== null) {
      const addr = settings.address as any
      settings.address = addr.street || addr.address || JSON.stringify(addr)
    }

  } catch (err: any) {
    error.value = err.message || t('settings.saveFailed')
    console.error('Fetch settings error:', err)
  } finally {
    loading.value = false
  }
}

const saveSettings = async () => {
  saveLoading.value = true
  try {
    const { $api } = useNuxtApp()
    await $api.put('/auth/tenant/settings', {
      storeName: settings.storeName,
      description: settings.description,
      phone: settings.phone,
      address: settings.address,
      telegramBotToken: settings.telegramBotToken,
      whatsappPhone: settings.whatsappPhone,
      // operatingHours: settings.operatingHours // TODO: Add support for operating hours
    })
    
    alert(t('settings.saveSuccess'))
    await refreshData() // Refresh to get updated bot username if it was changed
  } catch (err: any) {
    alert(err.message || t('settings.saveFailed'))
    console.error('Save settings error:', err)
  } finally {
    saveLoading.value = false
  }
}

const connectTelegramBot = async () => {
  if (!settings.telegramBotToken) {
    alert(t('settings.enterTokenFirst'))
    return
  }
  
  connectLoading.value = true
  try {
    const { $api } = useNuxtApp()
    const config = useRuntimeConfig()
    
    // Attempt to get actual bot username for the provided token
    let botUsername = ''
    try {
      const botInfo = await $api.get(`/auth/tenant/bot-info?token=${settings.telegramBotToken}`)
      botUsername = botInfo.username
      // Optionally update the state if it was empty
      if (!settings.telegramBotUsername) {
        settings.telegramBotUsername = botUsername
      }
    } catch (err) {
      console.warn('Could not fetch bot info, falling back:', err)
      botUsername = settings.telegramBotUsername || config.public.telegramBotUsername || 'kataloga_bot'
    }
    
    const data = await $api.get('/auth/tenant')
    const tenantId = data.tenant?.id || data.tenantId
    
    if (!tenantId) {
      throw new Error('Tenant ID not found')
    }
    
    const deepLink = `https://t.me/${botUsername}?start=${tenantId}`
    
    // Open deep link
    window.open(deepLink, '_blank')
    
    alert(t('settings.startBotInTelegram'))
  } catch (err: any) {
    alert(err.message || t('settings.connectBotFailed'))
    console.error('Connect bot error:', err)
  } finally {
    connectLoading.value = false
  }
}

onMounted(() => {
  refreshData()
})
</script>

<style scoped lang="scss">
@use '@/assets/scss/variables' as *;

.settings-page {
  padding: $spacing-xl;
  max-width: 800px;
  margin: 0 auto;
  min-height: 100vh;
  background: $bg-secondary;
}

.settings-page__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: $spacing-xl;
}

.settings-page__title {
  margin: 0 0 $spacing-xs 0;
  font-size: $font-size-3xl;
  font-weight: $font-weight-bold;
  color: $text-primary;
}

.settings-page__subtitle {
  margin: 0;
  font-size: $font-size-lg;
  color: $text-secondary;
}

.settings-page__back {
  padding: $spacing-sm $spacing-md;
  background: $bg-primary;
  border: 1px solid $border-color;
  border-radius: $radius-md;
  color: $text-primary;
  cursor: pointer;
  transition: all $transition-base;
  
  &:hover {
    background: $bg-secondary;
    border-color: $primary-color;
  }
}

.settings-page__loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: $spacing-3xl;
  gap: $spacing-md;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid $border-color;
  border-top-color: $primary-color;
  border-radius: $radius-full;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.settings-page__error {
  padding: $spacing-xl;
  text-align: center;
  background: $bg-primary;
  border-radius: $radius-lg;
  box-shadow: $shadow-sm;
}

.settings-page__content {
  display: flex;
  flex-direction: column;
  gap: $spacing-xl;
}

.settings-section {
  background: $bg-primary;
  border-radius: $radius-lg;
  box-shadow: $shadow-sm;
  overflow: hidden;
}

.settings-section__title {
  margin: 0;
  padding: $spacing-lg;
  font-size: $font-size-xl;
  font-weight: $font-weight-semibold;
  color: $text-primary;
  background: $bg-secondary;
  border-bottom: 1px solid $border-color;
}

.settings-section__content {
  padding: $spacing-lg;
}

.form-group {
  margin-bottom: $spacing-lg;
  
  &:last-child {
    margin-bottom: 0;
  }
}

.form-label {
  display: block;
  margin-bottom: $spacing-xs;
  font-size: $font-size-sm;
  font-weight: $font-weight-medium;
  color: $text-primary;
}

.form-input,
.form-textarea {
  width: 100%;
  padding: $spacing-sm $spacing-md;
  border: 1px solid $border-color;
  border-radius: $radius-md;
  font-size: $font-size-sm;
  color: $text-primary;
  background: $bg-primary;
  transition: border-color $transition-base;
  
  &:focus {
    outline: none;
    border-color: $primary-color;
  }
  
  &::placeholder {
    color: $text-light;
  }
}

.form-textarea {
  resize: vertical;
  min-height: 80px;
}

.form-help {
  margin: $spacing-xs 0 0 0;
  font-size: $font-size-xs;
  color: $text-secondary;
  
  a {
    color: $primary-color;
    text-decoration: none;
    
    &:hover {
      text-decoration: underline;
    }
  }
}

.connection-status {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
  padding: $spacing-sm 0;
}

.status-indicator {
  width: 12px;
  height: 12px;
  border-radius: $radius-full;
}

.status-indicator--connected {
  background: $success-color;
}

.status-indicator--disconnected {
  background: $error-color;
}

.status-text {
  font-size: $font-size-sm;
  font-weight: $font-weight-medium;
}

.bot-connection {
  padding: $spacing-md;
  background: $bg-secondary;
  border-radius: $radius-md;
  border: 1px solid $border-color;
}

.bot-connection__text {
  margin: 0 0 $spacing-md 0;
  font-size: $font-size-sm;
  color: $text-secondary;
}

.bot-connection__button {
  padding: $spacing-sm $spacing-lg;
  background: $primary-color;
  color: $text-white;
  border: none;
  border-radius: $radius-md;
  font-size: $font-size-sm;
  font-weight: $font-weight-medium;
  cursor: pointer;
  transition: background $transition-base;
  
  &:hover:not(:disabled) {
    background: darken($primary-color, 10%);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

.operating-hours {
  display: flex;
  flex-direction: column;
  gap: $spacing-md;
}

.day-hours {
  display: flex;
  align-items: center;
  gap: $spacing-lg;
  padding: $spacing-md;
  background: $bg-secondary;
  border-radius: $radius-md;
}

.day-hours__day {
  min-width: 100px;
  font-weight: $font-weight-medium;
  color: $text-primary;
}

.day-hours__controls {
  display: flex;
  align-items: center;
  gap: $spacing-md;
  flex: 1;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: $spacing-xs;
  cursor: pointer;
  font-size: $font-size-sm;
  color: $text-primary;
}

.checkbox-input {
  display: none;
}

.checkbox-custom {
  width: 16px;
  height: 16px;
  border: 2px solid $border-color;
  border-radius: $radius-sm;
  background: $bg-primary;
  transition: all $transition-base;
  
  .checkbox-input:checked + & {
    background: $primary-color;
    border-color: $primary-color;
    
    &::after {
      content: '✓';
      display: block;
      color: $text-white;
      font-size: 10px;
      text-align: center;
      line-height: 12px;
    }
  }
}

.time-inputs {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
  
  span {
    font-size: $font-size-sm;
    color: $text-secondary;
  }
}

.time-input {
  padding: $spacing-xs $spacing-sm;
  border: 1px solid $border-color;
  border-radius: $radius-sm;
  font-size: $font-size-xs;
  color: $text-primary;
  background: $bg-primary;
  
  &:focus {
    outline: none;
    border-color: $primary-color;
  }
}

.settings-page__actions {
  display: flex;
  justify-content: center;
  padding: $spacing-lg 0;
}

.save-button {
  padding: $spacing-md $spacing-xl;
  background: $primary-color;
  color: $text-white;
  border: none;
  border-radius: $radius-md;
  font-size: $font-size-base;
  font-weight: $font-weight-semibold;
  cursor: pointer;
  transition: background $transition-base;
  min-width: 150px;
  
  &:hover:not(:disabled) {
    background: darken($primary-color, 10%);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

@media (max-width: $breakpoint-md) {
  .settings-page {
    padding: $spacing-md;
  }
  
  .settings-page__header {
    flex-direction: column;
    align-items: flex-start;
    gap: $spacing-md;
  }
  
  .day-hours {
    flex-direction: column;
    align-items: flex-start;
    gap: $spacing-sm;
  }
  
  .day-hours__controls {
    flex-direction: column;
    align-items: flex-start;
    gap: $spacing-sm;
  }
}
</style>