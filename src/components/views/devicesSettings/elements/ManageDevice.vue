<template>
  <div
    class="mt-8 flex flex-col border-b border-[#0b3d68] pb-10 w-full"
    :class="[deviceAddr === 0 ? 'pb-10' : 'pb-[1.75rem]']"
  >
    <h2 class="font-semibold text-xl leading-[1.2] whitespace-pre mb-[1.125rem]">
      {{ t('manageDevice') }}
    </h2>
    <div
      v-if="deviceAddr !== 0"
      class="flex flex-row items-center mb-[2.875rem]"
    >
      <div class="text-[#6d9cc5] text-sm leading-[1.143] mr-6">
        {{ t('state') }}
      </div>
      <ButtonGroup
        :value="deviceState === 'on' ? 'on' : 'off'"
        :buttons="
          [
            { text: t('on'), value: 'on' },
            { text: t('off'), value: 'off' },
          ] as const
        "
        :additional-classes="'px-4 !bg-[#0d424d] !text-[#176f6f] on:!bg-[#176f6f] on:!text-[#97ffe7]'"
        @change="emit('changeDeviceState', $event)"
      />
    </div>
    <div class="flex flex-row items-center">
      <div class="text-[#6d9cc5] text-sm leading-[1.143] mr-6">
        {{ isRebootRequired ? t('rebootRequired') : t('rebootNoRequired') }}
      </div>
      <PrimaryButton
        class="!h-8"
        @click="isRebootModalOpen = true"
      >
        {{ t('reboot') }}
      </PrimaryButton>
    </div>
    <ModalWrapper
      v-if="isRebootModalOpen"
      @close="isRebootModalOpen = false"
      :confirm-text="t('reboot')"
      :is-saving="isRebootingStarted"
      :trigger-close="rebootingDeviceAddr !== undefined"
      @confirm="reboot"
    >
      <template #title-icon>
        <span v-html="successRound"></span>
      </template>
      <template #title>{{ t('confirmation') }}</template>
      <template #content>
        <div class="text-[#6cb5d3] text-sm leading-[1.272] whitespace-pre mt-2">
          {{ t('modalText') }}
        </div>
      </template>
    </ModalWrapper>
    <ModalWrapper
      v-if="isRebootingModalOpen"
      :is-saving="true"
      :trigger-close="rebootingDeviceAddr === undefined"
      @close="isRebootingModalOpen = false"
    >
      <template #custom>
        <div class="shadow-[0_0_1.375rem_0_#082135] p-6 flex flex-col rounded-xl">
          <span
            v-html="gears"
            class="self-center mb-4 [&>svg]:w-12"
          ></span>
          <div class="text-[#9adbf6] text-sm leading-[1.167] tracking-[0.03em] whitespace-pre">
            <div>
              {{ t('rebooting1') }}
            </div>
          </div>
        </div>
      </template>
    </ModalWrapper>
  </div>
</template>

<script lang="ts" setup generic="T extends DeviceAddr">
import PrimaryButton from '@/components/Ui/PrimaryButton.vue';
import ModalWrapper from '@/components/ModalWrapper.vue';
import gears from '@/assets/img/gears-animated.svg?raw';
import successRound from '@/assets/img/success-round.svg?raw';
import type { DeviceWorkState } from '@/typings/settings';
import type { DeviceAddr } from '@/typings/common';
import ButtonGroup from '@/components/Ui/ButtonGroup.vue';

const props = defineProps<{
  isRebootRequired: boolean;
  deviceAddr: T;
  deviceState: T extends 0 ? undefined : DeviceWorkState;
}>();

const emit = defineEmits<{
  (e: 'changeDeviceState', value: Extract<DeviceWorkState, 'on' | 'off'>): void;
}>();

const { api } = useApiStore();

const indexStore = useIndexStore();

const { rebootingDeviceAddr } = storeToRefs(indexStore);

const isRebootModalOpen = ref(false);

const isRebootingModalOpen = ref(false);

const isRebootingStarted = ref(false);

watch(rebootingDeviceAddr, checkIfExtDeviceRebooted);

async function reboot() {
  isRebootingStarted.value = true;
  try {
    await api.post('reboot', { device: props.deviceAddr, reboot: true });
    indexStore.setRebootingDeviceAddr(props.deviceAddr);
    // if (props.deviceAddr === 0) {
    //   indexStore.setIsControllerRebooting(true);
    // } else {
    //   isExtDeviceRebooting.value = true;
    // }
    isRebootingModalOpen.value = true;
    setTimeout(() => {
      isRebootingStarted.value = false;
    }, 150);
  } catch (error) {
    isRebootingStarted.value = false;
  }
}

async function checkIfExtDeviceRebooted() {
  if (rebootingDeviceAddr.value === undefined || rebootingDeviceAddr.value === 0) {
    return;
  }
  try {
    await api.post('get_ext_cfg', { device: props.deviceAddr });
    const r = await api.get('get_ext_devs');
    indexStore.setExtDevsList(r.data.list);
    indexStore.setRebootingDeviceAddr(undefined);
  } catch (error) {
    setTimeout(checkIfExtDeviceRebooted, 1000);
  }
}

const { t } = useI18n({
  messages: {
    en: {
      selectDevice: 'Select device',
      manageDevice: 'Manage device',
      rebootNoRequired: 'Reboot not required',
      rebootRequired: 'Reboot required',
      reboot: 'Reboot',
      state: 'State',
      on: 'ON',
      off: 'OFF',
      modalText: 'Are you sure you want to reboot the device?',
      rebooting1: 'The device is rebooting, please wait...',
      rebooting2: 'Page will be rebooted automatically \nafter reboot.',
      press: 'Press',
      here: 'here',
      forReboot: 'for reboot',
    },
    ru: {
      selectDevice: 'Выбор устройства',
      manageDevice: 'Управление устройством',
      rebootNoRequired: 'Перезагрузка не требуется',
      rebootRequired: 'Требуется перезагрузка',
      reboot: 'Перезагрузка',
      state: 'Состояние',
      on: 'ВКЛЮЧЕНО',
      off: 'ВЫКЛЮЧЕНО',
      modalText: 'Вы действительно хотите перезагрузить \nустройство?',
      rebooting1: 'Идет перезагрузка устройства, пожалуйста подождите...',
      rebooting2: 'По завершении перезагрузки страница будет перезагружена автоматически.',
      press: 'Нажмите',
      here: 'сюда',
      forReboot: 'для перезагрузки',
    },
  },
});
</script>
