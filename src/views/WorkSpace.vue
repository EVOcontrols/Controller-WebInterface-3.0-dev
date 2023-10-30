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
    <ModalWrapper
      v-if="extDeviceInInitIndex !== undefined"
      :is-saving="true"
      :trigger-close="extDeviceInInitState !== undefined"
      @close="extDeviceInInitIndex = undefined"
    >
      <template #custom>
        <div class="shadow-[0_0_1.375rem_0_#082135] p-6 flex flex-col rounded-xl">
          <span
            v-html="gears"
            class="self-center mb-4 [&>svg]:w-12"
          ></span>
          <div class="text-[#9adbf6] text-sm leading-[1.167] tracking-[0.03em] whitespace-pre">
            <div>
              {{ t('initializing', { index: extDeviceInInitIndex }) }}
            </div>
          </div>
        </div>
      </template>
    </ModalWrapper>
  </div>
</template>

<script setup lang="ts">
import logo from '@/assets/img/logo.svg?raw';
import logoutIcon from '@/assets/img/logout.svg?raw';
import DateTimeInfo from '@/components/DateTimeInfo.vue';
import SelectedItemLine from '@/components/SelectedItemLine.vue';
import LangNcSwitcher from '@/components/dev/LangNcSwitcher.vue';
import type { CommonSettingsFileType } from '@/typings/files';
import type { FuncsNumberPerPage } from '@/typings/funcs';
import ModalWrapper from '@/components/ModalWrapper.vue';
import gears from '@/assets/img/gears-animated.svg?raw';
import type { ControllerSettings } from '@/typings/settings';

const indexStore = useIndexStore();

const { isAuth, userRole, extDeviceInInitState, extDevsList, rebootingDeviceAddr } =
  storeToRefs(indexStore);

const funcsStore = useFuncsStore();

const { readFile } = useReadWriteFiles();

const route = useRoute();

const router = useRouter();

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

const extDeviceInInitIndex = ref<number>();

watch(extDeviceInInitState, () => {
  if (extDeviceInInitState.value !== undefined && rebootingDeviceAddr.value === undefined) {
    const extDevice = extDevsList.value?.find((d) => d.addr === extDeviceInInitState.value);
    extDeviceInInitIndex.value = extDevice?.index;
  }
});

async function logout() {
  isDisabled.value = true;
  try {
    await api.post('logout');
    indexStore.setIsAuth(undefined);
    router.push({ name: 'login' });
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
    const { lang, tempUnit, funcsNumberPerPage, numberingSystem } =
      commonFileSettings !== 'notFound' ? commonFileSettings : ({} as CommonSettingsFileType);
    if (lang === 'en' || lang === 'ru') {
      indexStore.setLang(lang);
    }
    if (tempUnit === '°C' || tempUnit === '°F') {
      indexStore.setTempUnit(tempUnit);
    }
    if (typeof funcsNumberPerPage === 'number' && funcsNumberPerPage > 0) {
      funcsStore.setFuncsNumberPerPage(funcsNumberPerPage as FuncsNumberPerPage);
    }
    if (numberingSystem === 'hex' || numberingSystem === 'dec') {
      indexStore.setNumberingSystem(numberingSystem);
    }
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
      initializing: 'Extension device #{index} initializing, please wait...',
    },
    ru: {
      logout: 'Выйти',
      menuItems: {
        panel: 'Панель управления',
        functions: 'Функции',
        settings: 'Настройки',
      },
      initializing: 'Идет инициализация устройства расширения #{index}, пожалуйста подождите...',
    },
  },
});

onMounted(async () => {
  if (route.name === 'devices-settings') return;
  try {
    const r = await api.get<ControllerSettings>('get_config');
    indexStore.setNGCModbusMode(r.data.modbus[0]?.mode || 'off');
  } catch (error) {
    //
  }
});
</script>
