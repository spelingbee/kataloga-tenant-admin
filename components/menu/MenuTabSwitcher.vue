<template>
  <div class="menu-tab-switcher" ref="containerRef">
    <div class="menu-tab-switcher__tabs" ref="tabsRef">
      <button
        v-for="menu in visibleMenus"
        :key="menu.id"
        class="menu-tab-switcher__tab"
        :class="{ 'menu-tab-switcher__tab--active': currentMenuId === menu.id }"
        @click="selectMenu(menu.id)"
      >
        {{ menu.name }}
      </button>

      <!-- More Dropdown -->
      <div v-if="hiddenMenus.length > 0" class="menu-tab-switcher__more" v-click-outside="closeDropdown">
        <button
          class="menu-tab-switcher__tab menu-tab-switcher__more-btn"
          :class="{ 'menu-tab-switcher__tab--active': isMoreActive }"
          @click="toggleDropdown"
        >
          <span>{{ t('common.more') || 'Еще' }}</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            class="transition-transform"
            :class="{ 'rotate-180': dropdownOpen }"
          >
            <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
          </svg>
        </button>

        <div v-if="dropdownOpen" class="menu-tab-switcher__dropdown">
          <button
            v-for="menu in hiddenMenus"
            :key="menu.id"
            class="menu-tab-switcher__dropdown-item"
            :class="{ 'menu-tab-switcher__dropdown-item--active': currentMenuId === menu.id }"
            @click="selectMenu(menu.id)"
          >
            {{ menu.name }}
          </button>
        </div>
      </div>
    </div>

    <button class="menu-tab-switcher__add-btn" @click="emit('create')">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
      </svg>
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import type { Menu } from '~/types/business'

interface Props {
  menus: Menu[]
  currentMenuId: string | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  select: [id: string]
  create: []
}>()

const { t } = useI18n()
const containerRef = ref<HTMLElement | null>(null)
const tabsRef = ref<HTMLElement | null>(null)
const dropdownOpen = ref(false)
const maxVisible = ref(4) // Initial fallback

// Simple dynamic calculation logic
const updateMaxVisible = () => {
  if (!containerRef.value) return
  const containerWidth = containerRef.value.offsetWidth
  // Heuristic: each tab is roughly 120px, add button is 40px, more button is 80px
  const availableWidth = containerWidth - 100 
  const calculated = Math.floor(availableWidth / 140)
  maxVisible.value = Math.max(1, calculated)
}

const visibleMenus = computed(() => {
  return props.menus.slice(0, maxVisible.value)
})

const hiddenMenus = computed(() => {
  return props.menus.slice(maxVisible.value)
})

const isMoreActive = computed(() => {
  return hiddenMenus.value.some(m => m.id === props.currentMenuId)
})

const toggleDropdown = () => {
  dropdownOpen.value = !dropdownOpen.value
}

const closeDropdown = () => {
  dropdownOpen.value = false
}

const selectMenu = (id: string) => {
  emit('select', id)
  dropdownOpen.value = false
}

// Lifecycle
let resizeObserver: ResizeObserver | null = null

onMounted(() => {
  updateMaxVisible()
  if (containerRef.value) {
    resizeObserver = new ResizeObserver(updateMaxVisible)
    resizeObserver.observe(containerRef.value)
  }
})

onUnmounted(() => {
  if (resizeObserver) {
    resizeObserver.disconnect()
  }
})
</script>

<style scoped lang="scss">
@use '@/assets/scss/variables' as *;

.menu-tab-switcher {
  display: flex;
  align-items: center;
  gap: $spacing-md;
  width: 100%;
  border-bottom: 2px solid $border-light;
  margin-bottom: $spacing-xl;
  padding-bottom: 0;

  &__tabs {
    display: flex;
    align-items: flex-end;
    gap: $spacing-xs;
    flex: 1;
    overflow: hidden;
  }

  &__tab {
    padding: $spacing-sm $spacing-lg;
    font-size: $font-size-base;
    font-weight: $font-weight-medium;
    color: $text-secondary;
    background: transparent;
    border: none;
    border-bottom: 3px solid transparent;
    cursor: pointer;
    transition: all $transition-base;
    white-space: nowrap;
    border-radius: $radius-md $radius-md 0 0;

    &:hover {
      background: rgba($primary-color, 0.05);
      color: $primary-color;
    }

    &--active {
      color: $primary-color;
      border-bottom-color: $primary-color;
      background: rgba($primary-color, 0.05);
      font-weight: $font-weight-bold;
    }
  }

  &__more {
    position: relative;
  }

  &__more-btn {
    display: flex;
    align-items: center;
    gap: $spacing-xs;

    svg {
      width: 16px;
      height: 16px;
    }
  }

  &__dropdown {
    position: absolute;
    top: 100%;
    right: 0;
    margin-top: $spacing-xs;
    background: $bg-primary;
    border: 1px solid $border-color;
    border-radius: $radius-md;
    box-shadow: $shadow-lg;
    z-index: 100;
    min-width: 180px;
    display: flex;
    flex-direction: column;
    padding: $spacing-xs 0;
  }

  &__dropdown-item {
    padding: $spacing-sm $spacing-lg;
    font-size: $font-size-sm;
    color: $text-primary;
    background: transparent;
    border: none;
    text-align: left;
    cursor: pointer;
    transition: background $transition-base;

    &:hover {
      background: $bg-secondary;
      color: $primary-color;
    }

    &--active {
      background: rgba($primary-color, 0.05);
      color: $primary-color;
      font-weight: $font-weight-bold;
    }
  }

  &__add-btn {
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: $bg-secondary;
    border: 1px solid $border-color;
    border-radius: $radius-md;
    color: $text-secondary;
    cursor: pointer;
    transition: all $transition-base;
    margin-bottom: $spacing-xs;

    &:hover {
      background: $primary-color;
      color: white;
      border-color: $primary-color;
    }

    svg {
      width: 20px;
      height: 20px;
    }
  }
}

.rotate-180 {
  transform: rotate(180deg);
}

.transition-transform {
  transition: transform 0.2s ease;
}
</style>
