<template>
  <div class="landing-page">
    <div class="bg-blobs">
      <div class="blob blob-1"></div>
      <div class="blob blob-2"></div>
      <div class="blob blob-3"></div>
    </div>

    <main class="content">
      <div class="logo-container">
        <Icon name="layout-dashboard" class="logo-icon" />
        <span class="logo-text">Kataloga Admin</span>
      </div>

      <Transition name="fade-slide" mode="out-in">
        <div v-if="!showLoginInput" key="hero" class="hero-section">
          <h1 class="title">{{ t('landing.title') }}</h1>
          <p class="subtitle">{{ t('landing.subtitle') }}</p>
          
          <div class="actions">
            <div class="action-card action-card--primary" @click="navigateToRegister">
              <div class="action-icon">🚀</div>
              <h3>{{ t('landing.getStarted') }}</h3>
              <p>{{ t('landing.registerDescription') }}</p>
              <span class="action-link">{{ t('landing.getStarted') }} →</span>
            </div>

            <div class="action-card" @click="showLoginFields">
              <div class="action-icon">🔑</div>
              <h3>{{ t('landing.findDashboard') }}</h3>
              <p>{{ t('landing.loginDescription') }}</p>
              <span class="action-link">{{ t('landing.findDashboard') }} →</span>
            </div>
          </div>
        </div>

        <div v-else key="login" class="login-section">
          <button class="back-btn" @click="showLoginInput = false">
            <Icon name="arrow-left" size="18" />
            {{ t('landing.back') }}
          </button>
          
          <div class="login-card">
            <h2>{{ t('landing.findDashboard') }}</h2>
            <p>{{ t('landing.enterSlug') }}</p>

            <form @submit.prevent="handleRedirect" class="form">
              <div class="input-wrapper">
                <span class="prefix">admin.kataloga.kg/t/</span>
                <input 
                  v-model="slug" 
                  type="text" 
                  :placeholder="t('landing.slugPlaceholder')"
                  required
                  autofocus
                  :class="{ 'has-error': error }"
                  @input="error = ''"
                />
              </div>
              <p v-if="error" class="error-msg">{{ error }}</p>
              
              <button type="submit" class="submit-btn" :disabled="!slug.trim()">
                {{ t('landing.go') }}
                <Icon name="arrow-right" size="18" />
              </button>
            </form>
          </div>
        </div>
      </Transition>
    </main>

    <footer class="footer">
      <LanguageSwitcher class="lang-switcher" />
      <p>&copy; 2024 Kataloga. {{ t('common.allRightsReserved') || 'All rights reserved.' }}</p>
    </footer>
  </div>
</template>

<script setup lang="ts">
import Icon from "../components/ui/Icon.vue";
import LanguageSwitcher from "../components/ui/LanguageSwitcher.vue";

definePageMeta({
  layout: false
})

const { t } = useI18n()
const router = useRouter()
const showLoginInput = ref(false)
const slug = ref('')
const error = ref('')

const showLoginFields = () => {
  showLoginInput.value = true
  error.value = ''
}

const navigateToRegister = () => {
  router.push('/register')
}

const handleRedirect = () => {
  const cleanSlug = slug.value.trim().toLowerCase().replace(/[^a-z0-9-]/g, '')
  
  if (!cleanSlug) {
    error.value = t('landing.slugRequired')
    return
  }
  
  if (cleanSlug.length < 2) {
    error.value = t('landing.invalidSlug')
    return
  }

  router.push(`/t/${cleanSlug}/login`)
}
</script>

<style scoped lang="scss">
@use '@/assets/scss/variables' as *;

.landing-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #0f172a;
  color: #fff;
  position: relative;
  overflow: hidden;
  font-family: 'Inter', sans-serif;
}

.bg-blobs {
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  
  .blob {
    position: absolute;
    border-radius: 50%;
    filter: blur(100px);
    opacity: 0.12;
    animation: pulse 15s infinite alternate;
  }
  
  .blob-1 {
    width: 50vw;
    height: 50vw;
    background: #3b82f6;
    top: -20%;
    right: -10%;
  }
  
  .blob-2 {
    width: 40vw;
    height: 40vw;
    background: #10b981;
    bottom: -10%;
    left: -10%;
    animation-delay: -5s;
  }

  .blob-3 {
    width: 30vw;
    height: 30vw;
    background: #f59e0b;
    top: 30%;
    left: 40%;
    animation-delay: -10s;
  }
}

@keyframes pulse {
  from { transform: scale(1) translate(0, 0); }
  to { transform: scale(1.1) translate(5%, 5%); }
}

.content {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 24px;
  position: relative;
  z-index: 1;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

.logo-container {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 64px;
  
  .logo-icon {
    width: 40px;
    height: 40px;
    color: #3b82f6;
  }
  
  .logo-text {
    font-size: 1.5rem;
    font-weight: 800;
    letter-spacing: -0.025em;
    background: linear-gradient(to right, #fff, #94a3b8);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
}

.hero-section {
  text-align: center;
  width: 100%;
}

.title {
  font-size: 3.5rem;
  font-weight: 800;
  margin-bottom: 24px;
  line-height: 1.1;
  background: linear-gradient(to bottom, #fff, #94a3b8);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.subtitle {
  font-size: 1.25rem;
  color: #94a3b8;
  max-width: 600px;
  margin: 0 auto 64px;
  line-height: 1.6;
}

.actions {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 24px;
  max-width: 800px;
  margin: 0 auto;
}

.action-card {
  background: rgba(30, 41, 59, 0.4);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 24px;
  padding: 40px;
  text-align: left;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
  
  &:hover {
    transform: translateY(-8px);
    background: rgba(30, 41, 59, 0.6);
    border-color: rgba(255, 255, 255, 0.2);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
  }
  
  &--primary {
    border-color: rgba(59, 130, 246, 0.3);
    background: rgba(59, 130, 246, 0.05);
    
    &:hover {
      border-color: #3b82f6;
      background: rgba(59, 130, 246, 0.1);
    }

    .action-link {
      color: #3b82f6;
    }
  }

  .action-icon {
    font-size: 2.5rem;
    margin-bottom: 24px;
  }

  h3 {
    font-size: 1.5rem;
    font-weight: 700;
    margin-bottom: 12px;
  }

  p {
    color: #94a3b8;
    line-height: 1.6;
    margin-bottom: 24px;
    flex: 1;
  }

  .action-link {
    font-weight: 600;
    font-size: 0.875rem;
    color: #fff;
  }
}

.login-section {
  width: 100%;
  max-width: 480px;
  
  .back-btn {
    background: none;
    border: none;
    color: #94a3b8;
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    margin-bottom: 24px;
    font-weight: 500;
    transition: color 0.2s;
    
    &:hover {
      color: #fff;
    }
  }
}

.login-card {
  background: rgba(30, 41, 59, 0.7);
  backdrop-filter: blur(24px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 24px;
  padding: 48px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  
  h2 {
    font-size: 1.875rem;
    font-weight: 700;
    margin-bottom: 12px;
  }
  
  p {
    color: #94a3b8;
    margin-bottom: 32px;
  }
}

.input-wrapper {
  display: flex;
  align-items: center;
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 0 16px;
  transition: all 0.2s ease;
  margin-bottom: 8px;
  
  &:focus-within {
    border-color: #3b82f6;
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
  }
  
  .prefix {
    color: #64748b;
    font-size: 0.875rem;
    user-select: none;
    margin-right: 2px;
  }
  
  input {
    flex: 1;
    background: transparent;
    border: none;
    color: #fff;
    font-size: 1rem;
    padding: 12px 0;
    outline: none;
    
    &::placeholder {
      color: #475569;
    }
  }
}

.error-msg {
  color: #ef4444;
  font-size: 0.875rem;
  margin-bottom: 16px;
}

.submit-btn {
  width: 100%;
  background: #3b82f6;
  color: #fff;
  border: none;
  border-radius: 12px;
  padding: 14px;
  font-weight: 600;
  font-size: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-top: 16px;
  
  &:hover:not(:disabled) {
    background: #2563eb;
    transform: translateY(-1px);
    box-shadow: 0 10px 15px -3px rgba(59, 130, 246, 0.3);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

.footer {
  padding: 40px 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  color: #475569;
  font-size: 0.875rem;
  z-index: 1;
}

.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

@media (max-width: 768px) {
  .title {
    font-size: 2.5rem;
  }
  
  .actions {
    grid-template-columns: 1fr;
  }
  
  .logo-container {
    margin-bottom: 40px;
  }
}

@media (max-width: 480px) {
  .login-card {
    padding: 32px 24px;
  }
  
  .input-wrapper {
    flex-wrap: wrap;
    padding: 8px 16px;
    
    .prefix {
      width: 100%;
      margin-bottom: 2px;
    }
  }
}
</style>
