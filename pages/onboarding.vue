<template>
  <div class="onboarding-page">
    <div class="onboarding-wizard">
      <div class="onboarding-wizard__header">
        <h1 class="onboarding-wizard__title">Quick Setup</h1>
        <p class="onboarding-wizard__subtitle">Get your restaurant online in 5 minutes</p>
        
        <!-- Progress indicator -->
        <div class="progress-indicator">
          <div 
            v-for="step in steps" 
            :key="step.id"
            class="progress-indicator__step"
            :class="{
              'progress-indicator__step--active': currentStep === step.id,
              'progress-indicator__step--completed': currentStep > step.id
            }"
          >
            <div class="progress-indicator__circle">
              <Icon 
                v-if="currentStep > step.id" 
                name="check" 
                class="progress-indicator__check"
              />
              <span v-else class="progress-indicator__number">{{ step.id }}</span>
            </div>
            <span class="progress-indicator__label">{{ step.label }}</span>
          </div>
        </div>
      </div>

      <div class="onboarding-wizard__content">
        <!-- Step 1: Email & Password -->
        <div v-if="currentStep === 1" class="wizard-step">
          <h2 class="wizard-step__title">Create Your Account</h2>
          <p class="wizard-step__description">Enter your email and create a secure password</p>
          
          <form class="wizard-form" @submit.prevent="nextStep">
            <div class="form-group">
              <label for="email" class="form-group__label">Email Address</label>
              <input
                id="email"
                v-model="formData.email"
                type="email"
                class="form-group__input"
                :class="{ 'form-group__input--error': errors.email }"
                placeholder="your@email.com"
                required
                autocomplete="email"
              />
              <span v-if="errors.email" class="form-group__error">{{ errors.email }}</span>
            </div>

            <div class="form-group">
              <label for="password" class="form-group__label">Password</label>
              <input
                id="password"
                v-model="formData.password"
                type="password"
                class="form-group__input"
                :class="{ 'form-group__input--error': errors.password }"
                placeholder="Create a secure password"
                required
                autocomplete="new-password"
              />
              <span v-if="errors.password" class="form-group__error">{{ errors.password }}</span>
              <div class="form-group__hint">
                Must be at least 6 characters with uppercase, lowercase, and number
              </div>
            </div>

            <div class="wizard-actions">
              <button type="submit" class="btn btn--primary btn--full">
                Continue
              </button>
            </div>
          </form>
        </div>

        <!-- Step 2: Store Name -->
        <div v-if="currentStep === 2" class="wizard-step">
          <h2 class="wizard-step__title">Name Your Restaurant</h2>
          <p class="wizard-step__description">This will be displayed to your customers</p>
          
          <form class="wizard-form" @submit.prevent="nextStep">
            <div class="form-group">
              <label for="storeName" class="form-group__label">Restaurant Name</label>
              <input
                id="storeName"
                v-model="formData.storeName"
                type="text"
                class="form-group__input"
                :class="{ 'form-group__input--error': errors.storeName }"
                placeholder="e.g. Mario's Pizza"
                required
              />
              <span v-if="errors.storeName" class="form-group__error">{{ errors.storeName }}</span>
            </div>

            <div class="wizard-actions">
              <button type="button" class="btn btn--secondary" @click="previousStep">
                Back
              </button>
              <button type="submit" class="btn btn--primary">
                Continue
              </button>
            </div>
          </form>
        </div>

        <!-- Step 3: Bot Token -->
        <div v-if="currentStep === 3" class="wizard-step">
          <h2 class="wizard-step__title">Connect Telegram Bot</h2>
          <p class="wizard-step__description">Get order notifications directly in Telegram</p>
          
          <div class="bot-setup">
            <div class="bot-setup__instructions">
              <div class="bot-setup__header">
                <Icon name="telegram" class="bot-setup__telegram-icon" />
                <div>
                  <h3 class="bot-setup__subtitle">Create Your Telegram Bot</h3>
                  <p class="bot-setup__intro">
                    A Telegram bot will send you instant notifications when customers place orders.
                  </p>
                </div>
              </div>

              <div class="bot-setup__guide">
                <h4 class="bot-setup__guide-title">Step-by-step guide:</h4>
                <ol class="bot-setup__steps">
                  <li>
                    <strong>Open @BotFather</strong>
                    <p>Search for "@BotFather" in Telegram or click the button below</p>
                  </li>
                  <li>
                    <strong>Start creating your bot</strong>
                    <p>Send the command: <code>/newbot</code></p>
                  </li>
                  <li>
                    <strong>Choose a display name</strong>
                    <p>Example: "{{ formData.storeName || 'Your Restaurant' }} Bot"</p>
                  </li>
                  <li>
                    <strong>Choose a username</strong>
                    <p>Must end with "bot". Example: "{{ generateBotUsername() }}"</p>
                  </li>
                  <li>
                    <strong>Copy your bot token</strong>
                    <p>BotFather will give you a token like: <code>123456789:ABCdefGHIjklMNOpqrsTUVwxyz</code></p>
                  </li>
                  <li>
                    <strong>Paste the token below</strong>
                    <p>This connects your bot to your restaurant</p>
                  </li>
                </ol>
              </div>
              
              <div class="bot-setup__actions">
                <a 
                  href="https://t.me/BotFather" 
                  target="_blank" 
                  class="btn btn--outline"
                >
                  <Icon name="external-link" />
                  Open @BotFather in Telegram
                </a>
                
                <div class="bot-setup__help">
                  <details class="bot-setup__faq">
                    <summary>Need help? Common questions</summary>
                    <div class="bot-setup__faq-content">
                      <div class="faq-item">
                        <strong>Q: What if my username is taken?</strong>
                        <p>Try adding numbers or your city name: "mariospizza2024bot" or "mariospizzanybot"</p>
                      </div>
                      <div class="faq-item">
                        <strong>Q: Is my bot token secure?</strong>
                        <p>Yes, we store it securely and only use it to send you order notifications.</p>
                      </div>
                      <div class="faq-item">
                        <strong>Q: Can I change this later?</strong>
                        <p>Absolutely! You can update your bot settings anytime in your dashboard.</p>
                      </div>
                    </div>
                  </details>
                </div>
              </div>
            </div>

            <form class="wizard-form" @submit.prevent="nextStep">
              <div class="form-group">
                <label for="telegramBotToken" class="form-group__label">
                  Bot Token (Optional)
                </label>
                <input
                  id="telegramBotToken"
                  v-model="formData.telegramBotToken"
                  type="text"
                  class="form-group__input"
                  :class="{ 'form-group__input--error': errors.telegramBotToken }"
                  placeholder="123456789:ABCdefGHIjklMNOpqrsTUVwxyz"
                />
                <span v-if="errors.telegramBotToken" class="form-group__error">{{ errors.telegramBotToken }}</span>
                <div class="form-group__hint">
                  You can skip this step and add it later in settings
                </div>
              </div>

              <div class="wizard-actions">
                <button type="button" class="btn btn--secondary" @click="previousStep">
                  Back
                </button>
                <button type="button" class="btn btn--ghost" @click="skipBotSetup">
                  Skip for now
                </button>
                <button type="submit" class="btn btn--primary">
                  Continue
                </button>
              </div>
            </form>
          </div>
        </div>

        <!-- Step 4: Connect Bot -->
        <div v-if="currentStep === 4" class="wizard-step">
          <h2 class="wizard-step__title">Connect Your Bot</h2>
          <p class="wizard-step__description">Link your Telegram account to receive notifications</p>
          
          <div class="bot-connection">
            <div v-if="!registrationResult?.deepLink" class="bot-connection__error">
              <Icon name="alert-circle" class="bot-connection__error-icon" />
              <p>Unable to generate bot connection link. You can connect manually later.</p>
              <button class="btn btn--primary" @click="completeOnboarding">
                Continue to Dashboard
              </button>
            </div>
            
            <div v-else class="bot-connection__success">
              <div class="bot-connection__instructions">
                <Icon name="telegram" class="bot-connection__icon" />
                <h3>Almost done!</h3>
                <p>Click the button below to connect your Telegram account:</p>
              </div>

              <div class="bot-connection__actions">
                <a 
                  :href="registrationResult.deepLink" 
                  target="_blank"
                  class="btn btn--primary btn--large"
                  @click="startPolling"
                >
                  <Icon name="telegram" />
                  Connect Telegram Bot
                </a>
              </div>

              <div v-if="isPolling" class="bot-connection__status">
                <div class="loading-spinner"></div>
                <p>Waiting for connection...</p>
                <p class="bot-connection__status-hint">
                  After clicking the link above, send <code>/start</code> to your bot
                </p>
              </div>

              <div v-if="connectionStatus === 'connected'" class="bot-connection__connected">
                <Icon name="check-circle" class="bot-connection__success-icon" />
                <p>Bot connected successfully!</p>
                <button class="btn btn--primary" @click="completeOnboarding">
                  Go to Dashboard
                </button>
              </div>

              <div class="bot-connection__skip">
                <button class="btn btn--ghost" @click="completeOnboarding">
                  Skip and connect later
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Success Step -->
        <div v-if="currentStep === 5" class="wizard-step wizard-step--success">
          <div class="success-animation">
            <Icon name="check-circle" class="success-animation__icon" />
          </div>
          <h2 class="wizard-step__title">🎉 Welcome to {{ registrationResult?.tenant.name }}!</h2>
          <p class="wizard-step__description">
            Your restaurant is now set up and ready to receive orders. Here's what you can do next:
          </p>
          
          <div class="success-features">
            <div class="success-feature">
              <Icon name="check" class="success-feature__icon" />
              <span>Add your menu items and set prices</span>
            </div>
            <div class="success-feature">
              <Icon name="check" class="success-feature__icon" />
              <span>Customize your restaurant settings</span>
            </div>
            <div class="success-feature">
              <Icon name="check" class="success-feature__icon" />
              <span>Start receiving and managing orders</span>
            </div>
            <div v-if="registrationResult?.deepLink" class="success-feature">
              <Icon name="check" class="success-feature__icon" />
              <span>Get order notifications via Telegram</span>
            </div>
          </div>
          
          <div class="wizard-actions">
            <button class="btn btn--primary btn--large" @click="goToDashboard">
              <Icon name="arrow-right" />
              Go to Dashboard
            </button>
            
            <div class="success-info">
              <p class="success-info__text">
                Your restaurant URL: <strong>{{ getRestaurantUrl() }}</strong>
              </p>
              <p class="success-info__hint">
                Share this link with customers to start receiving orders!
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Loading overlay -->
      <div v-if="loading" class="onboarding-wizard__loading">
        <div class="loading-spinner loading-spinner--large"></div>
        <p>Setting up your account...</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: false,
  middleware: []
})

// Types
interface FormData {
  email: string
  password: string
  storeName: string
  telegramBotToken: string
}

interface RegistrationResult {
  user: {
    id: string
    email: string
    firstName: string
    lastName: string
    role: string
    tenantId: string
  }
  tenant: {
    id: string
    name: string
    slug: string
  }
  deepLink?: string
}

// Reactive data
const currentStep = ref(1)
const loading = ref(false)
const isPolling = ref(false)
const connectionStatus = ref<'pending' | 'connected' | 'failed'>('pending')
const registrationResult = ref<RegistrationResult | null>(null)

const formData = ref<FormData>({
  email: '',
  password: '',
  storeName: '',
  telegramBotToken: ''
})

const errors = ref<Partial<FormData>>({})

const steps = [
  { id: 1, label: 'Account' },
  { id: 2, label: 'Store' },
  { id: 3, label: 'Bot Setup' },
  { id: 4, label: 'Connect' }
]

// Composables
const api = useApi()
const router = useRouter()

// Methods
const validateStep = (step: number): boolean => {
  errors.value = {}
  
  switch (step) {
    case 1:
      if (!formData.value.email) {
        errors.value.email = 'Email is required'
        return false
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.value.email)) {
        errors.value.email = 'Please provide a valid email address'
        return false
      }
      if (!formData.value.password) {
        errors.value.password = 'Password is required'
        return false
      }
      if (formData.value.password.length < 6) {
        errors.value.password = 'Password must be at least 6 characters long'
        return false
      }
      if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.value.password)) {
        errors.value.password = 'Password must contain uppercase, lowercase, and number'
        return false
      }
      break
      
    case 2:
      if (!formData.value.storeName) {
        errors.value.storeName = 'Store name is required'
        return false
      }
      if (formData.value.storeName.length < 2) {
        errors.value.storeName = 'Store name must be at least 2 characters long'
        return false
      }
      break
      
    case 3:
      // Bot token is optional, but if provided, validate format
      if (formData.value.telegramBotToken && 
          !/^\d+:[A-Za-z0-9_-]+$/.test(formData.value.telegramBotToken)) {
        errors.value.telegramBotToken = 'Invalid bot token format'
        return false
      }
      break
  }
  
  return true
}

const nextStep = async () => {
  if (!validateStep(currentStep.value)) {
    return
  }
  
  if (currentStep.value === 3) {
    // Register the user after step 3
    await registerUser()
  } else {
    currentStep.value++
  }
}

const previousStep = () => {
  if (currentStep.value > 1) {
    currentStep.value--
  }
}

const skipBotSetup = () => {
  formData.value.telegramBotToken = ''
  registerUser()
}

const registerUser = async () => {
  loading.value = true
  
  try {
    const response = await api.post('/auth/register-light', {
      email: formData.value.email,
      password: formData.value.password,
      storeName: formData.value.storeName,
      telegramBotToken: formData.value.telegramBotToken || undefined
    })
    
    registrationResult.value = response.data
    
    // Auto-login the user after successful registration
    try {
      await loginAfterRegistration()
    } catch (loginError) {
      console.error('Auto-login failed:', loginError)
      // Continue to step 4 even if auto-login fails
    }
    
    currentStep.value = 4
  } catch (error: any) {
    console.error('Registration error:', error)
    
    // Handle specific errors
    if (error.response?.status === 409) {
      errors.value.email = 'Email already exists'
      currentStep.value = 1
    } else if (error.response?.status === 400) {
      const message = error.response?.data?.message
      if (Array.isArray(message)) {
        errors.value.email = message.join(', ')
      } else {
        errors.value.email = message || 'Invalid registration data'
      }
      currentStep.value = 1
    } else {
      errors.value.email = 'Registration failed. Please try again.'
      currentStep.value = 1
    }
  } finally {
    loading.value = false
  }
}

const loginAfterRegistration = async () => {
  if (!registrationResult.value?.tenant.slug) {
    throw new Error('No tenant slug available')
  }
  
  try {
    // Login using the tenant slug
    const loginResponse = await api.post(`/${registrationResult.value.tenant.slug}/auth/login`, {
      email: formData.value.email,
      password: formData.value.password
    })
    
    // Store the token
    if (loginResponse.data.accessToken) {
      api.setToken(loginResponse.data.accessToken)
    }
  } catch (error) {
    console.error('Login after registration failed:', error)
    throw error
  }
}

const startPolling = () => {
  isPolling.value = true
  pollForConnection()
}

const pollForConnection = async () => {
  if (!registrationResult.value?.tenant.id) {
    connectionStatus.value = 'failed'
    isPolling.value = false
    return
  }

  let attempts = 0
  const maxAttempts = 60 // Poll for 5 minutes (60 * 5 seconds)
  
  const poll = async () => {
    try {
      // Check if tenant has a telegram chat ID set
      const response = await api.get(`/tenant-registration/check-telegram-connection/${registrationResult.value!.tenant.id}`)
      
      if (response.data.connected) {
        connectionStatus.value = 'connected'
        isPolling.value = false
        return
      }
      
      attempts++
      if (attempts >= maxAttempts) {
        isPolling.value = false
        return
      }
      
      // Continue polling every 5 seconds
      setTimeout(poll, 5000)
    } catch (error) {
      console.error('Error checking connection:', error)
      attempts++
      if (attempts >= maxAttempts) {
        isPolling.value = false
        return
      }
      
      // Continue polling even on error
      setTimeout(poll, 5000)
    }
  }
  
  // Start polling after a short delay
  setTimeout(poll, 2000)
}

const completeOnboarding = () => {
  currentStep.value = 5
}

const generateBotUsername = () => {
  if (!formData.value.storeName) return 'yourrestaurantbot'
  
  return formData.value.storeName
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .substring(0, 20) + 'bot'
}

const getRestaurantUrl = () => {
  if (!registrationResult.value?.tenant.slug) return ''
  
  const baseUrl = window.location.origin.replace(':3001', ':3000') // Assuming frontend runs on 3000
  return `${baseUrl}/${registrationResult.value.tenant.slug}`
}

const goToDashboard = () => {
  if (registrationResult.value?.tenant.slug) {
    // Add a small delay to show the success message
    setTimeout(() => {
      router.push(`/${registrationResult.value!.tenant.slug}`)
    }, 1000)
  } else {
    router.push('/')
  }
}
</script>

<style scoped lang="scss">
@use '@/assets/scss/variables' as *;
@use 'sass:color';

.onboarding-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: $spacing-lg;
  background: linear-gradient(135deg, $bg-secondary 0%, $bg-tertiary 100%);
}

.onboarding-wizard {
  position: relative;
  width: 100%;
  max-width: 600px;
  background: $bg-primary;
  border-radius: $radius-xl;
  box-shadow: $shadow-xl;
  overflow: hidden;
}

.onboarding-wizard__header {
  padding: $spacing-2xl $spacing-xl $spacing-xl;
  text-align: center;
  background: linear-gradient(135deg, $primary-color 0%, $primary-dark 100%);
  color: $text-white;
}

.onboarding-wizard__title {
  margin: 0 0 $spacing-sm 0;
  font-size: $font-size-3xl;
  font-weight: $font-weight-bold;
}

.onboarding-wizard__subtitle {
  margin: 0 0 $spacing-xl 0;
  font-size: $font-size-lg;
  opacity: 0.9;
}

.progress-indicator {
  display: flex;
  justify-content: center;
  gap: $spacing-lg;
}

.progress-indicator__step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: $spacing-xs;
}

.progress-indicator__circle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: $radius-full;
  background: rgba(255, 255, 255, 0.2);
  color: $text-white;
  font-weight: $font-weight-semibold;
  transition: all $transition-base;
}

.progress-indicator__step--active .progress-indicator__circle {
  background: $text-white;
  color: $primary-color;
  transform: scale(1.1);
}

.progress-indicator__step--completed .progress-indicator__circle {
  background: $success-color;
}

.progress-indicator__check {
  width: 20px;
  height: 20px;
}

.progress-indicator__number {
  font-size: $font-size-sm;
}

.progress-indicator__label {
  font-size: $font-size-xs;
  font-weight: $font-weight-medium;
  opacity: 0.8;
}

.progress-indicator__step--active .progress-indicator__label {
  opacity: 1;
  font-weight: $font-weight-semibold;
}

.onboarding-wizard__content {
  padding: $spacing-2xl;
}

.wizard-step {
  text-align: center;
}

.wizard-step__title {
  margin: 0 0 $spacing-sm 0;
  font-size: $font-size-2xl;
  font-weight: $font-weight-semibold;
  color: $text-primary;
}

.wizard-step__description {
  margin: 0 0 $spacing-xl 0;
  font-size: $font-size-lg;
  color: $text-secondary;
}

.wizard-form {
  text-align: left;
}

.form-group {
  margin-bottom: $spacing-lg;
}

.form-group__label {
  display: block;
  margin-bottom: $spacing-xs;
  font-size: $font-size-sm;
  font-weight: $font-weight-medium;
  color: $text-primary;
}

.form-group__input {
  width: 100%;
  padding: $spacing-md;
  font-size: $font-size-base;
  color: $text-primary;
  background: $bg-primary;
  border: 2px solid $border-color;
  border-radius: $radius-lg;
  transition: border-color $transition-base;
  
  &:focus {
    outline: none;
    border-color: $primary-color;
  }
  
  &::placeholder {
    color: $text-light;
  }
}

.form-group__input--error {
  border-color: $error-color;
}

.form-group__error {
  display: block;
  margin-top: $spacing-xs;
  font-size: $font-size-sm;
  color: $error-color;
}

.form-group__hint {
  margin-top: $spacing-xs;
  font-size: $font-size-sm;
  color: $text-secondary;
}

.wizard-actions {
  display: flex;
  gap: $spacing-md;
  margin-top: $spacing-xl;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: $spacing-xs;
  padding: $spacing-md $spacing-lg;
  font-size: $font-size-base;
  font-weight: $font-weight-medium;
  text-decoration: none;
  border: 2px solid transparent;
  border-radius: $radius-lg;
  cursor: pointer;
  transition: all $transition-base;
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
}

.btn--primary {
  color: $text-white;
  background: $primary-color;
  
  &:hover:not(:disabled) {
    background: $primary-dark;
    transform: translateY(-1px);
  }
}

.btn--secondary {
  color: $text-primary;
  background: $bg-secondary;
  border-color: $border-color;
  
  &:hover:not(:disabled) {
    background: $bg-tertiary;
  }
}

.btn--outline {
  color: $primary-color;
  background: transparent;
  border-color: $primary-color;
  
  &:hover:not(:disabled) {
    background: $primary-color;
    color: $text-white;
  }
}

.btn--ghost {
  color: $text-secondary;
  background: transparent;
  
  &:hover:not(:disabled) {
    color: $text-primary;
    background: $bg-secondary;
  }
}

.btn--full {
  width: 100%;
}

.btn--large {
  padding: $spacing-lg $spacing-xl;
  font-size: $font-size-lg;
}

.btn--small {
  padding: $spacing-sm $spacing-md;
  font-size: $font-size-sm;
}

.bot-setup {
  text-align: left;
}

.bot-setup__instructions {
  margin-bottom: $spacing-xl;
  padding: $spacing-lg;
  background: $bg-secondary;
  border-radius: $radius-lg;
}

.bot-setup__header {
  display: flex;
  align-items: flex-start;
  gap: $spacing-md;
  margin-bottom: $spacing-lg;
}

.bot-setup__telegram-icon {
  width: 48px;
  height: 48px;
  color: $primary-color;
  flex-shrink: 0;
}

.bot-setup__subtitle {
  margin: 0 0 $spacing-xs 0;
  font-size: $font-size-lg;
  font-weight: $font-weight-semibold;
  color: $text-primary;
}

.bot-setup__intro {
  margin: 0;
  font-size: $font-size-sm;
  color: $text-secondary;
}

.bot-setup__guide {
  margin-bottom: $spacing-lg;
}

.bot-setup__guide-title {
  margin: 0 0 $spacing-md 0;
  font-size: $font-size-base;
  font-weight: $font-weight-semibold;
  color: $text-primary;
}

.bot-setup__steps {
  margin: 0 0 $spacing-lg 0;
  padding-left: $spacing-lg;
  
  li {
    margin-bottom: $spacing-md;
    
    strong {
      display: block;
      margin-bottom: $spacing-xs;
      color: $text-primary;
      font-weight: $font-weight-semibold;
    }
    
    p {
      margin: 0;
      font-size: $font-size-sm;
      color: $text-secondary;
      line-height: $line-height-relaxed;
    }
    
    code {
      padding: 2px 6px;
      background: $bg-tertiary;
      border-radius: $radius-sm;
      font-family: $font-family-mono;
      font-size: $font-size-sm;
      color: $text-primary;
    }
  }
}

.bot-setup__actions {
  display: flex;
  flex-direction: column;
  gap: $spacing-md;
}

.bot-setup__help {
  margin-top: $spacing-md;
}

.bot-setup__faq {
  border: 1px solid $border-color;
  border-radius: $radius-md;
  overflow: hidden;
  
  summary {
    padding: $spacing-md;
    background: $bg-tertiary;
    cursor: pointer;
    font-weight: $font-weight-medium;
    color: $text-primary;
    
    &:hover {
      background: color.adjust($bg-tertiary, $lightness: -3%);
    }
  }
}

.bot-setup__faq-content {
  padding: $spacing-md;
  background: $bg-primary;
}

.faq-item {
  margin-bottom: $spacing-md;
  
  &:last-child {
    margin-bottom: 0;
  }
  
  strong {
    display: block;
    margin-bottom: $spacing-xs;
    color: $text-primary;
    font-size: $font-size-sm;
  }
  
  p {
    margin: 0;
    font-size: $font-size-sm;
    color: $text-secondary;
    line-height: $line-height-normal;
  }
}

.bot-connection {
  text-align: center;
}

.bot-connection__error {
  padding: $spacing-xl;
  background: rgba($error-color, 0.1);
  border-radius: $radius-lg;
  border: 1px solid rgba($error-color, 0.2);
}

.bot-connection__error-icon {
  width: 48px;
  height: 48px;
  margin-bottom: $spacing-md;
  color: $error-color;
}

.bot-connection__success {
  // Styles for success state
}

.bot-connection__instructions {
  margin-bottom: $spacing-xl;
  
  h3 {
    margin: $spacing-md 0;
    font-size: $font-size-xl;
    font-weight: $font-weight-semibold;
    color: $text-primary;
  }
  
  p {
    margin: 0;
    color: $text-secondary;
  }
}

.bot-connection__icon {
  width: 64px;
  height: 64px;
  margin-bottom: $spacing-md;
  color: $primary-color;
}

.bot-connection__actions {
  margin-bottom: $spacing-xl;
}

.bot-connection__status {
  padding: $spacing-lg;
  background: $bg-secondary;
  border-radius: $radius-lg;
  margin-bottom: $spacing-lg;
  
  p {
    margin: $spacing-sm 0;
    color: $text-secondary;
  }
}

.bot-connection__status-hint {
  font-size: $font-size-sm;
  
  code {
    padding: 2px 6px;
    background: $bg-tertiary;
    border-radius: $radius-sm;
    font-family: $font-family-mono;
  }
}

.bot-connection__connected {
  padding: $spacing-lg;
  background: rgba($success-color, 0.1);
  border-radius: $radius-lg;
  border: 1px solid rgba($success-color, 0.2);
  margin-bottom: $spacing-lg;
}

.bot-connection__success-icon {
  width: 48px;
  height: 48px;
  margin-bottom: $spacing-md;
  color: $success-color;
}

.bot-connection__skip {
  margin-top: $spacing-lg;
}

.wizard-step--success {
  padding: $spacing-xl 0;
}

.success-animation {
  margin-bottom: $spacing-xl;
}

.success-animation__icon {
  width: 80px;
  height: 80px;
  color: $success-color;
  animation: successPulse 2s ease-in-out infinite;
}

@keyframes successPulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

.success-features {
  display: flex;
  flex-direction: column;
  gap: $spacing-md;
  margin: $spacing-xl 0;
  padding: $spacing-lg;
  background: rgba($success-color, 0.05);
  border-radius: $radius-lg;
  border: 1px solid rgba($success-color, 0.2);
}

.success-feature {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
  font-size: $font-size-base;
  color: $text-primary;
}

.success-feature__icon {
  width: 20px;
  height: 20px;
  color: $success-color;
  flex-shrink: 0;
}

.success-info {
  margin-top: $spacing-xl;
  padding: $spacing-lg;
  background: $bg-secondary;
  border-radius: $radius-lg;
  text-align: center;
}

.success-info__text {
  margin: 0 0 $spacing-sm 0;
  font-size: $font-size-sm;
  color: $text-secondary;
  
  strong {
    color: $primary-color;
    font-weight: $font-weight-semibold;
  }
}

.success-info__hint {
  margin: 0;
  font-size: $font-size-xs;
  color: $text-light;
}

.onboarding-wizard__loading {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba($bg-primary, 0.95);
  backdrop-filter: blur(4px);
  
  p {
    margin-top: $spacing-md;
    color: $text-secondary;
  }
}

.loading-spinner {
  width: 24px;
  height: 24px;
  border: 2px solid $border-color;
  border-top: 2px solid $primary-color;
  border-radius: $radius-full;
  animation: spin 1s linear infinite;
}

.loading-spinner--large {
  width: 48px;
  height: 48px;
  border-width: 4px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

// Responsive design
@media (max-width: $breakpoint-md) {
  .onboarding-page {
    padding: $spacing-md;
  }
  
  .onboarding-wizard__header {
    padding: $spacing-xl $spacing-lg;
  }
  
  .onboarding-wizard__content {
    padding: $spacing-xl $spacing-lg;
  }
  
  .progress-indicator {
    gap: $spacing-md;
  }
  
  .progress-indicator__circle {
    width: 32px;
    height: 32px;
  }
  
  .wizard-actions {
    flex-direction: column;
    
    .btn {
      width: 100%;
    }
  }
}
</style>