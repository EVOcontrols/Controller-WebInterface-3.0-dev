<template>
  <div class="w-full h-full flex flex-col overflow-hidden">
    <div class="h-[5.063rem] bg-[#092740] flex flex-row w-full items-center">
      <RouterLink
        :to="{ name: 'widgets' }"
        class="ml-10"
        ><span
          v-html="logo"
          class="[&>svg]:h-[1.688rem] [&>svg]:w-[1.688rem]"
        ></span
      ></RouterLink>
      <DateTimeInfo />
      <div class="flex-1 flex flex-row justify-center h-full">
        <div class="flex flex-row h-full gap-x-8 relative">
          <RouterLink
            v-for="item in menuItems"
            :key="item"
            :to="{ name: item }"
            class="font-semibold text-[#638bae] text-[0.938rem] leading-[1.2] hover:text-[#67c4e2e0] on:!text-[#adebff] h-full flex items-center"
            :class="{ on: activeMenuItem === item }"
          >
            {{ t(`menuItems.${item}`) }}
          </RouterLink>
          <SelectedItemLine :activeItemIndex="menuItems.indexOf(activeMenuItem)" />
        </div>
      </div>
      <div class="w-40">
        <LangNcSwitcher v-if="isDev" />
      </div>
      <button
        class="group text-[#638bae] hover:text-[#adebff] flex flex-row items-center mr-10 font-semibold text-[0.938rem] leading-[1.2] tracking-[0.03em]"
      >
        <span
          v-html="logout"
          class="mr-2"
        ></span>
        {{ t('logout') }}
      </button>
    </div>
    <RouterView class="flex-1" />
  </div>
</template>

<script setup lang="ts">
import logo from '@/assets/img/logo.svg?raw';
import logout from '@/assets/img/logout.svg?raw';
import DateTimeInfo from '@/components/DateTimeInfo.vue';
import SelectedItemLine from '@/components/SelectedItemLine.vue';
import LangNcSwitcher from '@/components/dev/LangNcSwitcher.vue';

const route = useRoute();

const menuItems = ['panel', 'functions', 'settings'] as const;

const activeMenuItem = computed<(typeof menuItems)[number]>(() => {
  let activeItem: (typeof menuItems)[number] = 'panel';
  route.matched.some((r) => {
    if (menuItems.includes(r.name as any)) {
      activeItem = r.name as any;
      return true;
    }
    return false;
  });
  return activeItem;
});

const isDev = import.meta.env.DEV;

const { t } = useI18n({
  messages: {
    en: {
      logout: 'Log out',
      menuItems: {
        panel: 'Control panel',
        functions: 'Functions',
        settings: 'Settings',
      },
    },
    ru: {
      logout: 'Выйти',
      menuItems: {
        panel: 'Панель управления',
        functions: 'Функции',
        settings: 'Настройки',
      },
    },
  },
});
</script>