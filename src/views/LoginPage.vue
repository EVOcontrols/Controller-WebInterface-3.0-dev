<template>
  <div
    class="flex h-full w-full flex-col bg-[linear-gradient(108.08deg,#143554_-1.91%,#0a1b2b_98.91%)]"
  >
    <div
      class="group flex flex-1 flex-col items-center justify-center"
      :class="{ error: isError }"
    >
      <div class="flex flex-row">
        <span
          v-html="logo"
          class="mr-4"
        ></span>
        <span v-html="brand"></span>
      </div>
      <div class="mt-6 text-base leading-[1.188] text-[#77b2d2]">
        {{ t('title') }}
      </div>
    </div>
    <div class="flex h-[2.75rem] w-full flex-row">
      <div class="w-[6.25rem] text-end">
        <button
          v-for="(l, label) in { eng: 'en' as 'en', rus: 'ru' as 'ru' }"
          :key="l"
          class="ml-2 text-xs uppercase leading-[1.167] tracking-[0.083em] text-[#295c88] hover:text-[#2f8ee1] on:font-semibold on:text-[#45d2ff]"
          :class="{ on: locale === l }"
          @click="indexStore.setLang(l)"
        >
          {{ label }}
        </button>
      </div>
      <div class="flex-1 text-center text-xs leading-[1.167] tracking-[0.167em] text-[#295c88]">
        DESIGNED BY EVO CONTROLS
      </div>
      <div class="w-[6.25rem]"></div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import brand from '@/assets/img/brand.svg?raw';
import logo from '@/assets/img/logo.svg?raw';

const indexStore = useIndexStore();

const isError = ref(false);

const { locale } = useI18n();
const { t } = useI18n({
  messages: {
    en: {
      title: 'Your login and password',
    },
    ru: {
      title: 'Ваш логин и пароль',
    },
  },
});
</script>
