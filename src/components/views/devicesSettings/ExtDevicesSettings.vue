<template>
  <div class="flex flex-col px-8">
    <div class="mt-8 flex flex-col border-b border-[#0b3d68] pb-9 w-full">
      <h2 class="font-semibold text-xl leading-[1.2] whitespace-pre mb-[1.125rem]">
        {{ t('selectDevice') }}
      </h2>
      <div class="flex flex-row items-center overflow-hidden">
        <div class="relative overflow-x-hidden">
          <ScrollBooster
            :arrow-css="{ width: 'w-7', bg: 'bg-[#092740]' }"
            :render-params="{ type: 'row', marginRightClass: 'mr-1' }"
            v-slot="{ onClick }"
            class="h-8"
            @selectItem="emit('selectDevice', $event)"
          >
            <button
              v-for="i in deviceCount + 1"
              :key="i"
              type="button"
              class="h-[1.563rem] w-[3.188rem] bg-[#1b4569] hover:bg-[#214e76] on:bg-[#148ef8] font-roboto rounded flex items-center justify-center"
              :class="{
                on: i - 1 === activeDeviceIndex,
              }"
              @click="onClick(i - 1)"
            >
              {{ i > 1 ? `IO ${i - 1}` : 'NGC' }}
            </button>
          </ScrollBooster>
        </div>
        <button
          v-html="edit"
          class="group ml-3"
        ></button>
      </div>
    </div>
    <div
      v-if="activeDeviceIndex === 0"
      class="mt-8 flex flex-col border-b border-[#0b3d68] pb-10 w-full"
    >
      <h2 class="font-semibold text-xl leading-[1.2] whitespace-pre mb-[1.125rem]">
        {{ t('manageDevice') }}
      </h2>
      <div class="flex flex-row items-center">
        <div class="text-[#6d9cc5] text-sm leading-[1.143] mr-6">
          {{ reloadRequired ? t('reloadRequired') : t('reloadNoRequired') }}
        </div>
        <PrimaryButton
          class="!h-8"
          @click="isReloadModalOpen = true"
        >
          {{ t('reload') }}
        </PrimaryButton>
      </div>
    </div>
    <div
      v-if="modbusSettings.length"
      class="mt-8 border-b border-[#0b3d68] pb-10 w-full"
    >
      <h2 class="font-semibold text-xl leading-[1.2] whitespace-pre mb-[1.125rem]">
        {{ t('rsSettings') }}
      </h2>
      <div class="flex flex-row items-center">
        <div class="text-[#6d9cc5] text-sm leading-[1.143] mr-6">
          {{ t('portMode') }}
        </div>
        <ButtonGroup
          :buttons="modbusModes.map((v) => ({ text: t(`portModes.${v}`), value: v }))"
          :value="modbusSettings[0].mode"
          additional-classes="px-4"
          @change="modbusSettings[0].mode = $event"
        />
      </div>
      <div class="flex flex-row mt-[2.8rem]">
        <div class="text-[#6d9cc5] text-sm leading-[1.143] mr-10">
          {{ t('speed') }}
        </div>
        <InputRange
          :value="modbusSettings[0].rate"
          @change="modbusSettings[0].rate = $event"
        />
      </div>
      <div class="flex flex-row items-center mt-[2.5rem]">
        <div class="text-[#6d9cc5] text-sm leading-[1.143] mr-6">
          {{ t('parity') }}
        </div>
        <ButtonGroup
          :buttons="modbusParities.map((v) => ({ text: t(`parities.${v}`), value: v }))"
          :value="modbusSettings[0].parity"
          additional-classes="px-4"
          @change="modbusSettings[0].parity = $event"
        />
      </div>
      <div class="flex flex-row items-center mt-[2.75rem]">
        <div class="text-[#6d9cc5] text-sm leading-[1.143] mr-5">
          {{ t('stop') }}
        </div>
        <ButtonGroup
          :buttons="([1, 2] as const).map((v) => ({ text: v.toString(), value: v }))"
          :value="modbusSettings[0].stop"
          additional-classes="px-4"
          @change="modbusSettings[0].stop = $event"
        />
      </div>
      <div class="flex flex-row items-center mt-[2.75rem]">
        <div class="text-[#6d9cc5] text-sm leading-[1.143] mr-5 whitespace-pre">
          {{ t('numberingSystem') }}
        </div>
        <ButtonGroup
          :buttons="numberingSystems.map((v) => ({ text: v.toUpperCase(), value: v }))"
          :value="numberingSystem"
          additional-classes="px-4"
          @change="emit('setNumberingSystem', $event)"
        />
      </div>
      <template v-if="modbusSettings[0].mode !== 'off'">
        <AdvancedSettingsButton
          :is-expanded="!!isAdvancedSettingsExpanded"
          :is-error="!!advancedSettingsHaveError"
          @click="isAdvancedSettingsExpanded = !isAdvancedSettingsExpanded"
        />
        <CollapseTransition :duration="300">
          <div
            v-show="isAdvancedSettingsExpanded"
            class=""
          >
            <div class="table w-max mt-5">
              <div
                v-for="p in modbusAdvancedParams[modbusSettings[0].mode]"
                :key="p"
                class="table-row h-[3.43rem] align-top last:h-10"
              >
                <div class="text-[#6d9cc5] text-sm leading-[1.143] table-cell pr-4">
                  {{ `${p}:` }}
                </div>
                <UiInput
                  :init-value="isKeyOf(modbusSettings[0], p) ? modbusSettings[0][p] : 0"
                  :name="p"
                  initType="number"
                  class="table-cell w-16 text-center !px-2"
                  :min-max="[0, undefined]"
                  :status="fieldsInvalidStatuses.has(`modbus-0-${p}`) ? 'invalid' : 'valid'"
                  :input-type="['int']"
                  @status-changed="
                    $event === 'invalid' || $event === 'not-allowed'
                      ? fieldsInvalidStatuses.add(`modbus-0-${p}`)
                      : fieldsInvalidStatuses.delete(`modbus-0-${p}`)
                  "
                  @value-changed="
                    $event === undefined || !isKeyOf(modbusSettings[0], p)
                      ? ''
                      : (modbusSettings[0][p] = $event)
                  "
                />
                <div
                  class="text-[#ed4272] text-sm leading-[1.143] invisible opacity-0 transition-[opacity,visibility] error:visible error:opacity-100 pl-4 table-cell"
                  :class="{
                    error: fieldsInvalidStatuses.has(`modbus-0-${p}`),
                  }"
                >
                  {{ t('positiveInteger') }}
                </div>
              </div>
            </div>
          </div>
        </CollapseTransition>
      </template>
    </div>
    <ModalWrapper
      v-if="isReloadModalOpen"
      @close="isReloadModalOpen = false"
      :confirm-text="t('reload')"
      :is-saving="isReloadBtnDisabled"
      :trigger-close="isControllerRebooting"
      @confirm="reload"
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
      v-if="isControllerRebooting"
      :is-saving="true"
    >
      <template #custom>
        <div class="shadow-[0_0_1.375rem_0_#082135] p-6 flex flex-col rounded-xl">
          <span
            v-html="gears"
            class="self-center mb-4 [&>svg]:w-12"
          ></span>
          <div class="text-[#9adbf6] text-sm leading-[1.167] tracking-[0.03em] whitespace-pre">
            <div>
              {{ t('reloading1') }}
            </div>
          </div>
        </div>
      </template>
    </ModalWrapper>
  </div>
</template>

<script lang="ts" setup>
import ScrollBooster from '@/components/ScrollBooster.vue';
import edit from '@/assets/img/edit.svg?raw';
import PrimaryButton from '@/components/Ui/PrimaryButton.vue';
import ModalWrapper from '@/components/ModalWrapper.vue';
import successRound from '@/assets/img/success-round.svg?raw';
import gears from '@/assets/img/gears-animated.svg?raw';
import type { DevicesControllerSettings } from '@/typings/settings';
import ButtonGroup from '@/components/Ui/ButtonGroup.vue';
import { modbusModes } from '@/data/settings';
import { cloneDeep } from 'lodash';
import InputRange from './InputRange.vue';
import type { NumberingSystem } from '@/typings/common';
import AdvancedSettingsButton from '@/components/views/devicesSettings/AdvancedSettingsButton.vue';
import CollapseTransition from '@/components/CollapseTransition.vue';
import UiInput from '@/components/Ui/UiInput.vue';

const props = defineProps<{
  activeDeviceIndex: number;
  deviceCount: number;
  reloadRequired: boolean;
  modbusSettingsInit: DevicesControllerSettings['modbus'];
  numberingSystem: NumberingSystem;
  fieldsInvalidStatuses: Set<string>;
  advancedSettingsHaveError: boolean;
}>();

const emit = defineEmits<{
  (e: 'selectDevice', index: number): void;
  (e: 'setModbusSettings', settings: DevicesControllerSettings['modbus']): void;
  (e: 'setNumberingSystem', numberingSystem: NumberingSystem): void;
  (e: 'setFieldsInvalidStatus', param: string): void;
  (e: 'removeFieldsInvalidStatus', param: string): void;
}>();

const { api } = useApi();

const indexStore = useIndexStore();

const { isControllerRebooting, notConnected } = storeToRefs(indexStore);

const isReloadModalOpen = ref(false);

const isReloadBtnDisabled = ref(false);

const modbusSettings = ref(cloneDeep(props.modbusSettingsInit));

const isAdvancedSettingsExpanded = ref(false);

const modbusAdvancedParams = {
  variables: ['rd-tmo', 'wr-tmo', 'rd-pause', 'wr-pause', 'cycle-pause'],
  'ext-devs': ['get-tmo', 'set-tmo', 'ow-scan-tmo', 'set-cfg-tmo', 'cycle-pause'],
} as const;

watch(
  () => props.modbusSettingsInit,
  () => {
    modbusSettings.value = cloneDeep(props.modbusSettingsInit);
  },
);

watch(
  () => modbusSettings.value,
  () => {
    emit('setModbusSettings', modbusSettings.value);
  },
  { deep: true },
);

async function reload() {
  isReloadBtnDisabled.value = true;
  try {
    await api.post('reboot', { device: 0, reboot: true });
    indexStore.setIsControllerRebooting(true);
  } catch (error) {
    //
  }
  isReloadBtnDisabled.value = true;
}

watch(notConnected, () => {
  if (!notConnected.value && isControllerRebooting.value) {
    window.location.reload();
  }
});

const { t } = useI18n({
  messages: {
    en: {
      selectDevice: 'Select device',
      manageDevice: 'Manage device',
      reloadNoRequired: 'Reboot not required',
      reloadRequired: 'Reboot required',
      reload: 'Reboot',
      confirmation: 'Confirmation',
      modalText: 'Are you sure you want to reboot the device?',
      reloading1: 'The device is rebooting, please wait...',
      reloading2: 'Page will be reloaded automatically \nafter reboot.',
      rsSettings: 'RS485 bus settings',
      portMode: 'Port mode',
      portModes: {
        off: 'OFF',
        variables: 'MODBUS VARIABLES',
        'ext-devs': 'EXTENSION DEVICES',
      },
      speed: 'Speed',
      parity: 'Parity',
      parities: {
        none: 'NONE',
        even: 'EVEN',
        odd: 'ODD',
      },
      stop: 'Stop bit',
      numberingSystem: 'Default display \nof registers and values',
    },
    ru: {
      selectDevice: 'Выбор устройства',
      manageDevice: 'Управление устройством',
      reloadNoRequired: 'Перезагрузка не требуется',
      reloadRequired: 'Требуется перезагрузка',
      reload: 'Перезагрузка',
      confirmation: 'Подтверждение',
      modalText: 'Вы действительно хотите перезагрузить \nустройство?',
      reloading1: 'Идет перезагрузка устройства, пожалуйста подождите...',
      reloading2: 'По завершении перезагрузки страница будет перезагружена автоматически.',
      rsSettings: 'Настройки шины RS485',
      portMode: 'Режим работы порта',
      portModes: {
        off: 'ОТКЛЮЧЕН',
        variables: 'ПЕРЕМЕННЫЕ MODBUS',
        'ext-devs': 'УСТРОЙСТВА РАСШИРЕНИЯ',
      },
      speed: 'Скорость',
      parity: 'Четность',
      parities: {
        none: 'НЕТ',
        even: 'ЧЕТНЫЙ',
        odd: 'НЕЧЕТНЫЙ',
      },
      stop: 'Стоп-бит',
      numberingSystem: 'Отображение регистров \nи значений по умолчанию',
    },
  },
});
</script>
