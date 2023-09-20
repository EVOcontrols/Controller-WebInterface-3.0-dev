<template>
  <div class="mt-6 mb-8 rounded-xl bg-[#08253d] mx-10 flex flex-col">
    <div class="h-[3.313rem] pl-8 border-b-2 border-[#0b3d68] flex">
      <div class="h-full flex flex-row gap-x-6 relative">
        <RouterLink
          v-for="item in menuItems"
          :key="item"
          :to="{ name: item }"
          class="font-semibold text-[#4a779e] text-base leading-[1.188] hover:text-[#5ab1cd] on:text-[#adebff] flex items-center"
          :class="{ on: route.name === item }"
        >
          {{ t(`menuItems.${item}`) }}
        </RouterLink>
        <SelectedItemLine
          :activeItemIndex="menuItems.indexOf(route.name as (typeof menuItems)[number])"
        />
      </div>
    </div>
    <div class="flex-1 overflow-auto">
      <RouterView />
    </div>
  </div>
</template>

<script lang="ts" setup>
import SelectedItemLine from '@/components/SelectedItemLine.vue';

const route = useRoute();

const menuItems = ['common-settings', 'devices-settings'] as const;

const { t } = useI18n({
  messages: {
    en: {
      menuItems: {
        'common-settings': 'Common settings',
        'devices-settings': 'Devices settings',
      },
    },
    ru: {
      menuItems: {
        'common-settings': 'Общие настройки',
        'devices-settings': 'Настройки устройств',
      },
    },
  },
});
</script>
