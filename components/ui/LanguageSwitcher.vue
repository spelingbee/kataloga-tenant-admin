<template>
  <div class="language-switcher">
    <select 
      v-model="currentLocale" 
      @change="changeLocale"
      class="language-switcher__select"
    >
      <option 
        v-for="locale in availableLocales" 
        :key="locale.code" 
        :value="locale.code"
      >
        {{ locale.name }}
      </option>
    </select>
  </div>
</template>

<script setup lang="ts">
const { locale, locales, setLocale } = useI18n()

const currentLocale = ref(locale.value)

const availableLocales = computed(() => {
  return locales as Array<{ code: string; name: string }>
})

const changeLocale = async () => {
  await setLocale(currentLocale.value)
}
</script>

<style scoped lang="scss">
.language-switcher {
  display: inline-block;

  &__select {
    padding: 0.5rem 1rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    background-color: white;
    font-size: 0.875rem;
    cursor: pointer;
    transition: border-color 0.2s;

    &:hover {
      border-color: #999;
    }

    &:focus {
      outline: none;
      border-color: #007bff;
      box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
    }
  }
}
</style>
