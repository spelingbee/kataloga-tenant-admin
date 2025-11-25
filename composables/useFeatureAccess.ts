import { computed, ref } from 'vue'
import { useSubscriptionStore } from '~/stores/subscription'
import { useRouter } from 'vue-router'
import { FeatureKey } from '~/types'

/**
 * Composable for checking feature access based on user's plan
 */
export const useFeatureAccess = () => {
  const subscriptionStore = useSubscriptionStore()
  const router = useRouter()
  const showUpgradeModal = ref(false)
  const requestedFeature = ref<FeatureKey | null>(null)

  /**
   * Check if user has access to a specific feature
   */
  const hasFeature = (featureKey: FeatureKey): boolean => {
    const subscription = subscriptionStore.subscription
    
    if (!subscription || !subscription.plan) {
      return false
    }

    // Check if feature is enabled in plan
    const feature = subscription.plan.features?.find(
      (f) => f.featureKey === featureKey && f.isEnabled
    )

    return !!feature
  }

  /**
   * Check if user has access to a feature and show upgrade modal if not
   */
  const requireFeature = (featureKey: FeatureKey): boolean => {
    const hasAccess = hasFeature(featureKey)
    
    if (!hasAccess) {
      requestedFeature.value = featureKey
      showUpgradeModal.value = true
    }
    
    return hasAccess
  }

  /**
   * Redirect to upgrade page
   */
  const redirectToUpgrade = (featureKey?: FeatureKey) => {
    const query = featureKey ? { feature: featureKey } : {}
    router.push({
      path: '/subscription',
      query
    })
  }

  /**
   * Close upgrade modal
   */
  const closeUpgradeModal = () => {
    showUpgradeModal.value = false
    requestedFeature.value = null
  }

  /**
   * Get required plan for a feature
   */
  const getRequiredPlan = (featureKey: FeatureKey): string => {
    const featurePlanMap: Record<FeatureKey, string> = {
      [FeatureKey.SALES_ANALYTICS]: 'PRO',
      [FeatureKey.ADVANCED_REPORTING]: 'BUSINESS',
      [FeatureKey.API_ACCESS]: 'BUSINESS',
      [FeatureKey.CUSTOM_BRANDING]: 'BUSINESS',
      [FeatureKey.MULTI_LOCATION]: 'PRO',
      [FeatureKey.AUDIT_TRAIL]: 'PRO',
      [FeatureKey.DATA_EXPORT]: 'BUSINESS',
      [FeatureKey.MULTI_USER]: 'PRO',
      [FeatureKey.PRIORITY_SUPPORT]: 'BUSINESS',
    }
    
    return featurePlanMap[featureKey] || 'PRO'
  }

  /**
   * Get feature display name
   */
  const getFeatureName = (featureKey: FeatureKey): string => {
    const featureNames: Record<FeatureKey, string> = {
      [FeatureKey.SALES_ANALYTICS]: 'Sales Analytics',
      [FeatureKey.ADVANCED_REPORTING]: 'Advanced Reporting',
      [FeatureKey.API_ACCESS]: 'API Access',
      [FeatureKey.CUSTOM_BRANDING]: 'Custom Branding',
      [FeatureKey.MULTI_LOCATION]: 'Multi-Location Support',
      [FeatureKey.AUDIT_TRAIL]: 'Audit Trail',
      [FeatureKey.DATA_EXPORT]: 'Data Export',
      [FeatureKey.MULTI_USER]: 'Multi-User Access',
      [FeatureKey.PRIORITY_SUPPORT]: 'Priority Support',
    }
    
    return featureNames[featureKey] || featureKey
  }

  // Computed properties for common features
  const hasMultiLocation = computed(() => hasFeature(FeatureKey.MULTI_LOCATION))
  const hasSalesAnalytics = computed(() => hasFeature(FeatureKey.SALES_ANALYTICS))
  const hasDataExport = computed(() => hasFeature(FeatureKey.DATA_EXPORT))
  const hasMultiUser = computed(() => hasFeature(FeatureKey.MULTI_USER))
  const hasAuditTrail = computed(() => hasFeature(FeatureKey.AUDIT_TRAIL))
  const hasAdvancedReporting = computed(() => hasFeature(FeatureKey.ADVANCED_REPORTING))
  const hasApiAccess = computed(() => hasFeature(FeatureKey.API_ACCESS))
  const hasCustomBranding = computed(() => hasFeature(FeatureKey.CUSTOM_BRANDING))

  // Current plan info
  const currentPlan = computed(() => subscriptionStore.currentPlan)
  const planName = computed(() => subscriptionStore.planName)
  const isFreePlan = computed(() => subscriptionStore.isFreePlan)
  const isProPlan = computed(() => subscriptionStore.isProPlan)
  const isBusinessPlan = computed(() => subscriptionStore.isBusinessPlan)

  return {
    // Methods
    hasFeature,
    requireFeature,
    redirectToUpgrade,
    closeUpgradeModal,
    getRequiredPlan,
    getFeatureName,
    
    // State
    showUpgradeModal,
    requestedFeature,
    
    // Feature checks
    hasMultiLocation,
    hasSalesAnalytics,
    hasDataExport,
    hasMultiUser,
    hasAuditTrail,
    hasAdvancedReporting,
    hasApiAccess,
    hasCustomBranding,
    
    // Plan info
    currentPlan,
    planName,
    isFreePlan,
    isProPlan,
    isBusinessPlan,
  }
}
