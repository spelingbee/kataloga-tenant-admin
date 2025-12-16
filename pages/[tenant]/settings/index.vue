<template>
  <div class="settings-page">
    <div class="settings-page__header">
      <div>
        <h1 class="settings-page__title">Settings</h1>
        <p class="settings-page__subtitle">
          Manage your restaurant settings and preferences
        </p>
      </div>
      <button class="settings-page__back" @click="navigateToTenant('/')">
        ← Back to Dashboard
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="settings-page__loading">
      <div class="loading-spinner" />
      <p>Loading settings...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="settings-page__error">
      <p>{{ error }}</p>
      <button @click="refreshData">Retry</button>
    </div>

    <!-- Settings Content -->
    <div v-else class="settings-page__content">
      <!-- Restaurant Information -->
      <div class="settings-section">
        <h2 class="settings-section__title">Restaurant Information</h2>
        <div class="settings-section__content">
          <div class="form-group">
            <label for="storeName" class="form-label">Restaurant Name</label>
            <input
              id="storeName"
              v-model="settings.storeName"
              type="text"
              class="form-input"
              placeholder="Enter restaurant name"
            />
          </div>

          <div class="form-group">
            <label for="description" class="form-label">Description</label>
            <textarea
              id="description"
              v-model="settings.description"
              class="form-textarea"
              placeholder="Brief description of your restaurant"
              rows="3"
            />
          </div>

          <div class="form-group">
            <label for="phone" class="form-label">Phone Number</label>
            <input
              id="phone"
              v-model="settings.phone"
              type="tel"
              class="form-input"
              placeholder="Restaurant phone number"
            />
          </div>

          <div class="form-group">
            <label for="address" class="form-label">Address</label>
            <textarea
              id="address"
              v-model="settings.address"
              class="form-textarea"
              placeholder="Restaurant address"
              rows="2"
            />
          </div>
        </div>
      </div>

      <!-- Telegram Integration -->
      <div class="settings-section">
        <h2 class="settings-section__title">Telegram Integration</h2>
        <div class="settings-section__content">
          <div class="form-group">
            <label for="telegramBotToken" class="form-label">Bot Token</label>
            <input
              id="telegramBotToken"
              v-model="settings.telegramBotToken"
              type="password"
              class="form-input"
              placeholder="Your Telegram bot token"
            />
            <p class="form-help">
              Get your bot token from <a href="https://t.me/BotFather" target="_blank">@BotFather</a>
            </p>
          </div>

          <div class="form-group">
            <label class="form-label">Chat Connection Status</label>
            <div class="connection-status">
              <div 
                class="status-indicator" 
                :class="settings.telegramChatId ? 'status-indicator--connected' : 'status-indicator--disconnected'"
              />
              <span class="status-text">
                {{ settings.telegramChatId ? 'Connected' : 'Not Connected' }}
              </span>
            </div>
            <p v-if="!settings.telegramChatId" class="form-help">
              Start your bot to receive order notifications
            </p>
          </div>

          <div v-if="settings.telegramBotToken && !settings.telegramChatId" class="form-group">
            <label class="form-label">Connect Your Bot</label>
            <div class="bot-connection">
              <p class="bot-connection__text">
                Click the button below to connect your Telegram bot and start receiving order notifications.
              </p>
              <button 
                class="bot-connection__button"
                @click="connectTelegramBot"
                :disabled="connectLoading"
              >
                <span v-if="connectLoading">Connecting...</span>
                <span v-else>Connect Telegram Bot</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- WhatsApp Integration -->
      <div class="settings-section">
        <h2 class="settings-section__title">WhatsApp Integration</h2>
        <div class="settings-section__content">
          <div class="form-group">
            <label for="whatsappPhone" class="form-label">WhatsApp Phone Number</label>
            <input
              id="whatsappPhone"
              v-model="settings.whatsappPhone"
              type="tel"
              class="form-input"
              placeholder="+1234567890"
            />
            <p class="form-help">
              Used for bank transfer payment instructions
            </p>
          </div>
        </div>
      </div>

      <!-- Operating Hours -->
      <div class="settings-section">
        <h2 class="settings-section__title">Operating Hours</h2>
        <div class="settings-section__content">
          <div class="operating-hours">
            <div v-for="day in daysOfWeek" :key="day.key" class="day-hours">
              <div class="day-hours__day">{{ day.name }}</div>
              <div class="day-hours__controls">
                <label class="checkbox-label">
                  <input
                    v-model="settings.operatingHours[day.key].isOpen"
                    type="checkbox"
                    class="checkbox-input"
                  />
                  <span class="checkbox-custom" />
                  Open
                </label>
                <div v-if="settings.operatingHours[day.key].isOpen" class="time-inputs">
                  <input
                    v-model="settings.operatingHours[day.key].openTime"
                    type="time"
                    class="time-input"
                  />
                  <span>to</span>
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
          <span v-if="saveLoading">Saving...</span>
          <span v-else>Save Settings</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'

definePageMeta({
  middleware: ['auth']
})

const { navigateToTenant } = useNavigation()

const loading = ref(false)
const error = ref<string | null>(null)
const saveLoading = ref(false)
const connectLoading = ref(false)

type DayKey = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday'

const daysOfWeek: { key: DayKey; name: string }[] = [
  { key: 'monday', name: 'Monday' },
  { key: 'tuesday', name: 'Tuesday' },
  { key: 'wednesday', name: 'Wednesday' },
  { key: 'thursday', name: 'Thursday' },
  { key: 'friday', name: 'Friday' },
  { key: 'saturday', name: 'Saturday' },
  { key: 'sunday', name: 'Sunday' },
]

const settings = reactive({
  storeName: '',
  description: '',
  phone: '',
  address: '',
  telegramBotToken: '',
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
    // TODO: Implement API call to fetch tenant settings
    await new Promise(resolve => setTimeout(resolve, 1000)) // Mock delay
    
    // Mock data - replace with real API response
    Object.assign(settings, {
      storeName: 'My Restaurant',
      description: 'Delicious food delivered fresh',
      phone: '+1234567890',
      address: '123 Main St, City, State 12345',
      telegramBotToken: '',
      telegramChatId: null,
      whatsappPhone: '+1234567890',
    })
  } catch (err: any) {
    error.value = err.message || 'Failed to load settings'
  } finally {
    loading.value = false
  }
}

const saveSettings = async () => {
  saveLoading.value = true
  try {
    // TODO: Implement API call to save settings
    await new Promise(resolve => setTimeout(resolve, 1000)) // Mock delay
    
    // Show success notification
    alert('Settings saved successfully!')
  } catch (err: any) {
    alert(err.message || 'Failed to save settings')
  } finally {
    saveLoading.value = false
  }
}

const connectTelegramBot = async () => {
  if (!settings.telegramBotToken) {
    alert('Please enter your bot token first')
    return
  }
  
  connectLoading.value = true
  try {
    // TODO: Implement API call to generate deep link and connect bot
    await new Promise(resolve => setTimeout(resolve, 1000)) // Mock delay
    
    // Mock deep link generation
    const botUsername = 'your_bot_username' // This would come from API
    const tenantId = 'tenant_123' // This would come from current tenant
    const deepLink = `https://t.me/${botUsername}?start=${tenantId}`
    
    // Open deep link
    window.open(deepLink, '_blank')
    
    alert('Please start the bot in Telegram to complete the connection')
  } catch (err: any) {
    alert(err.message || 'Failed to connect bot')
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