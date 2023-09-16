<template>
  <RouterView />
  <ToastsContainer />
</template>

<script setup lang="ts">
import '@/assets/main.postcss';
import { useI18n } from 'vue-i18n';
import { useIndexStore } from './stores';
import ToastsContainer from './components/toast/ToastsContainer.vue';

const indexStore = useIndexStore();

const { lang } = storeToRefs(indexStore);

const { locale } = useI18n();

watch(
  lang,
  () => {
    const currentLang = lang.value === 'ru' ? 'ru' : 'en';
    locale.value = currentLang;
  },
  { immediate: true },
);
</script>
