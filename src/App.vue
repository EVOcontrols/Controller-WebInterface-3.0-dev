<template>
  <RouterView />
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { useIndexStore } from './stores';

const indexStore = useIndexStore();

const { lang } = storeToRefs(indexStore);

const { locale } = useI18n();

watch(
  lang,
  () => {
    locale.value = lang.value === 'ru' ? 'ru' : 'en';
  },
  { immediate: true },
);
</script>
