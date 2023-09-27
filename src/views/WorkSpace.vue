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
          <SelectedItemLine
            :activeItemIndex="menuItems.indexOf(activeMenuItem)"
            :withBg="true"
          />
        </div>
      </div>
      <div class="w-40 z-[70]">
        <LangNcSwitcher v-if="isDev" />
      </div>
      <button
        class="group text-[#638bae] hover:text-[#adebff] flex flex-row items-center mr-10 font-semibold text-[0.938rem] leading-[1.2] tracking-[0.03em]"
        :disabled="isDisabled"
        @click="logout"
      >
        <span
          v-html="logoutIcon"
          class="mr-2"
        ></span>
        {{ t('logout') }}
      </button>
    </div>
    <Transition
      name="fade-150"
      mode="out-in"
    >
      <h1
        class="font-semibold text-[#8dc5f6] text-[1.625rem] leading-[1.192] tracking-[0.02em] mt-6 mx-10"
        :key="activeMenuItem"
      >
        {{ t('menuItems.' + activeMenuItem) }}
      </h1>
    </Transition>
    <router-view v-slot="{ Component }">
      <transition
        name="fade-150"
        mode="out-in"
      >
        <component
          :is="Component"
          class="flex-1"
        />
      </transition>
    </router-view>
  </div>
</template>

<script setup lang="ts">
import logo from '@/assets/img/logo.svg?raw';
import logoutIcon from '@/assets/img/logout.svg?raw';
import DateTimeInfo from '@/components/DateTimeInfo.vue';
import SelectedItemLine from '@/components/SelectedItemLine.vue';
import LangNcSwitcher from '@/components/dev/LangNcSwitcher.vue';
import type { FuncsNumberPerPage } from '@/typings/funcs';

const indexStore = useIndexStore();

const { isAuth, userRole } = storeToRefs(indexStore);

const funcsStore = useFuncsStore();

const { readFile } = useReadWriteFiles();

const route = useRoute();

const { api } = useApi();

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

const isDisabled = ref(false);

async function logout() {
  isDisabled.value = true;
  try {
    await api.post('logout');
  } catch (error) {
    isDisabled.value = false;
  }
}

async function getCommonSettings() {
  const commonFileSettings = await readFile({
    type: 'settings',
    subType: 'common',
    user: userRole.value,
  });
  if (commonFileSettings !== 'error') {
    indexStore.setLang(commonFileSettings.lang);
    indexStore.setTempUnit(commonFileSettings.tempUnit);
    funcsStore.setFuncsNumberPerPage(commonFileSettings.funcsNumberPerPage as FuncsNumberPerPage);
  } else {
    await new Promise((res) => setTimeout(res, 1000));
    await getCommonSettings();
  }
}

if (isAuth.value) {
  await getCommonSettings();
  indexStore.setIsInterfaceStarted(true);
}

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
