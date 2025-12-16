import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'
import OnboardingPage from '~/pages/onboarding.vue'

// Mock the composables
vi.mock('~/composables/useApi', () => ({
  useApi: () => ({
    post: vi.fn(),
    get: vi.fn(),
    setToken: vi.fn()
  })
}))

vi.mock('vue-router', async () => {
  const actual = await vi.importActual('vue-router')
  return {
    ...actual,
    useRouter: () => ({
      push: vi.fn()
    })
  }
})

describe('Onboarding Page', () => {
  let wrapper: any
  
  beforeEach(() => {
    const router = createRouter({
      history: createWebHistory(),
      routes: [
        { path: '/onboarding', component: OnboardingPage }
      ]
    })
    
    wrapper = mount(OnboardingPage, {
      global: {
        plugins: [router],
        stubs: {
          Icon: true,
          NuxtLink: true
        }
      }
    })
  })

  it('should render the onboarding wizard', () => {
    expect(wrapper.find('.onboarding-wizard').exists()).toBe(true)
    expect(wrapper.find('.onboarding-wizard__title').text()).toBe('Quick Setup')
    expect(wrapper.find('.onboarding-wizard__subtitle').text()).toBe('Get your restaurant online in 5 minutes')
  })

  it('should show step 1 by default', () => {
    expect(wrapper.find('.wizard-step').exists()).toBe(true)
    expect(wrapper.find('h2').text()).toBe('Create Your Account')
  })

  it('should have progress indicators', () => {
    const steps = wrapper.findAll('.progress-indicator__step')
    expect(steps).toHaveLength(4)
    
    const labels = steps.map((step: any) => step.find('.progress-indicator__label').text())
    expect(labels).toEqual(['Account', 'Store', 'Bot Setup', 'Connect'])
  })

  it('should validate email format', async () => {
    const emailInput = wrapper.find('#email')
    const form = wrapper.find('.wizard-form')
    
    await emailInput.setValue('invalid-email')
    await form.trigger('submit')
    
    expect(wrapper.vm.errors.email).toBe('Please provide a valid email address')
  })

  it('should validate password requirements', async () => {
    const passwordInput = wrapper.find('#password')
    const form = wrapper.find('.wizard-form')
    
    await passwordInput.setValue('weak')
    await form.trigger('submit')
    
    expect(wrapper.vm.errors.password).toBe('Password must be at least 6 characters long')
  })

  it('should generate bot username from store name', async () => {
    wrapper.vm.formData.storeName = "Mario's Pizza"
    expect(wrapper.vm.generateBotUsername()).toBe('mariospizzabot')
  })
})