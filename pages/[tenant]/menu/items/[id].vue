<template>
  <div class="menu-item-edit-page">
    <div class="menu-item-edit-page__header">
      <button
        class="menu-item-edit-page__back-btn"
        @click="handleCancel"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        {{ t('menu.backToMenu') }}
      </button>

      <h1 class="menu-item-edit-page__title">{{ t('menu.editMenuItem') }}</h1>
      <p class="menu-item-edit-page__subtitle">
        {{ t('menu.editItemSubtitle') }}
      </p>
    </div>

    <LoadingSpinner v-if="loadingItem" />

    <MenuItemForm
      v-else-if="menuItem"
      :initial-data="menuItem"
      :submit-label="t('common.save')"
      :loading="isSubmitting"
      @submit="handleUpdate"
      @cancel="handleCancel"
    />

    <div v-else-if="!isFetching" class="menu-item-edit-page__not-found">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <h2>{{ t('menu.noItemsFound') }}</h2>
      <p>{{ t('menu.itemNotFoundDescription') || 'The menu item you\'re looking for doesn\'t exist.' }}</p>
      <button @click="handleCancel">
        {{ t('menu.backToMenu') }}
      </button>
    </div>

    <div v-if="error" class="menu-item-edit-page__error">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      {{ error }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useEnhancedMenuStore } from '~/stores/enhanced-menu'
import MenuItemForm from '~/components/menu/MenuItemForm.vue'
import LoadingSpinner from '~/components/ui/LoadingSpinner.vue'

const { t } = useI18n()
const route = useRoute()
const menuStore = useEnhancedMenuStore()
const { isFetching, isSubmitting, currentMenu, menuItems } = storeToRefs(menuStore)

const itemId = computed(() => {
  const id = route.params.id
  if (!id || typeof id !== 'string') {
    console.error('Invalid item ID in route params:', id)
    return ''
  }
  return id
})
const menuItem = ref<any>(null)
const error = ref<string>('')

onMounted(async () => {
  await loadMenuItem()
})

const loadMenuItem = async () => {
  error.value = ''

  try {
    if (!itemId.value) {
      error.value = t('errors.invalidItemId') || 'Invalid item ID.'
      return
    }

    if (!currentMenu.value) {
      await menuStore.fetchMenus()
    }

    if (!currentMenu.value) {
      error.value = t('errors.noMenuFound') || 'No menu found.'
      return
    }

    // Try to find item in central items first
    let item = menuItems.value.find((i: any) => i.id === itemId.value)

    if (!item) {
      // If not in current list, fetch items for this menu
      await menuStore.fetchMenuItems(currentMenu.value.id)
      item = menuItems.value.find((i: any) => i.id === itemId.value)
    }

    if (item) {
      menuItem.value = item
    } else {
      menuItem.value = null
    }
  } catch (err: any) {
    console.error('Failed to load menu item:', err)
    error.value = err.message || t('errors.loadFailed')
  }
}

const handleUpdate = async (data: any) => {
  error.value = ''

  try {
    if (!currentMenu.value || !itemId.value) return

    await menuStore.updateMenuItem(currentMenu.value.id, itemId.value, data)
    await handleCancel()
  } catch (err: any) {
    console.error('Failed to update menu item:', err)
    error.value = err.message || t('errors.saveFailed')
  }
}

const { navigateToTenant } = useNavigation()

const handleCancel = () => {
  navigateToTenant('/menu')
}
</script>

<style scoped lang="scss">
@use '@/assets/scss/variables' as *;

.menu-item-edit-page {
  padding: $spacing-xl;
  min-height: 100vh;
  background: $bg-secondary;
}

.menu-item-edit-page__header {
  max-width: 800px;
  margin-bottom: $spacing-xl;
}

.menu-item-edit-page__back-btn {
  display: inline-flex;
  align-items: center;
  gap: $spacing-sm;
  padding: $spacing-sm $spacing-md;
  margin-bottom: $spacing-lg;
  font-size: $font-size-sm;
  font-weight: $font-weight-medium;
  color: $text-secondary;
  background: transparent;
  border: none;
  border-radius: $radius-md;
  cursor: pointer;
  transition: all $transition-base;
  
  svg {
    width: 18px;
    height: 18px;
  }
  
  &:hover {
    color: $primary-color;
    background: $bg-primary;
  }
}

.menu-item-edit-page__title {
  margin: 0 0 $spacing-xs 0;
  font-size: $font-size-3xl;
  font-weight: $font-weight-bold;
  color: $text-primary;
}

.menu-item-edit-page__subtitle {
  margin: 0;
  font-size: $font-size-lg;
  color: $text-secondary;
}

.menu-item-edit-page__not-found {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  max-width: 500px;
  margin: $spacing-3xl auto;
  padding: $spacing-3xl;
  text-align: center;
  background: $bg-primary;
  border: 1px solid $border-color;
  border-radius: $radius-lg;
  
  svg {
    width: 64px;
    height: 64px;
    margin-bottom: $spacing-lg;
    color: $text-light;
  }
  
  h2 {
    margin: 0 0 $spacing-md 0;
    font-size: $font-size-2xl;
    font-weight: $font-weight-semibold;
    color: $text-primary;
  }
  
  p {
    margin: 0 0 $spacing-xl 0;
    font-size: $font-size-base;
    color: $text-secondary;
  }
  
  button {
    padding: $spacing-sm $spacing-xl;
    font-size: $font-size-base;
    font-weight: $font-weight-medium;
    color: $text-white;
    background: $primary-color;
    border: none;
    border-radius: $radius-md;
    cursor: pointer;
    transition: background $transition-base;
    
    &:hover {
      background: $primary-dark;
    }
  }
}

.menu-item-edit-page__error {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
  max-width: 800px;
  padding: $spacing-md;
  margin-top: $spacing-lg;
  font-size: $font-size-sm;
  color: $error-color;
  background: rgba($error-color, 0.1);
  border: 1px solid $error-color;
  border-radius: $radius-md;
  
  svg {
    flex-shrink: 0;
    width: 20px;
    height: 20px;
  }
}
</style>
