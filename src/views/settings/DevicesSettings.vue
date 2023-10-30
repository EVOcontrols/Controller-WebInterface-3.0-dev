<template>
  <div class="h-full flex flex-col">
    <div class="flex flex-col flex-1 overflow-y-auto overflow-x-hidden scrollbar-4 relative">
      <template
        v-if="ngcSettings && ngcSettingsInit && (ngcModbusMode !== 'ext-devs' || extDevsList)"
      >
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
                  @selectItem="
                    (e) => {
                      if (!extDevsList) return;
                      activeDeviceAddr = e === 0 ? 0 : extDevsList[e - 1]?.addr;
                    }
                  "
                >
                  <button
                    v-for="(extDev, i) in [
                      { addr: 0, state: 'on', serial: '' },
                      ...(ngcModbusMode === 'ext-devs' ? extDevsList || [] : []),
                    ]"
                    :key="i"
                    type="button"
                    class="h-[1.563rem] w-[3.188rem] bg-[#1b4569] hover:bg-[#214e76] on:bg-[#148ef8] font-roboto rounded flex items-center justify-center"
                    :class="{
                      on: extDev.addr === activeDeviceAddr,
                    }"
                    @click="onClick(i)"
                  >
                    {{ extDev.addr > 0 ? `IO ${i}` : 'NGC' }}
                  </button>
                </ScrollBooster>
              </div>
              <button
                v-html="edit"
                class="group ml-3"
              ></button>
            </div>
          </div>
          <Transition
            name="fade-150"
            mode="out-in"
          >
            <EditNGCSettings
              v-if="activeDeviceAddr === 0"
              :init-settings="ngcSettings"
              :is-reboot-required="isNgcRebootRequired"
              :reboot-ngc-trigger="rebootNgcTrigger"
              @change="ngcSettings = $event"
              @set-is-all-fields-valid="isAllNgcSettingsFieldsValid = $event"
              @ngc-rebooted-manually="isNgcRebootRequired = false"
            />
            <EditExtDeviceSettings
              v-else-if="activeExtDevice"
              :device-addr="activeDeviceAddr"
              :device-state="activeExtDevice.state"
            />
          </Transition>
          <!-- <ExtDevicesSettings
            :active-device-index="activeDeviceAddr"
            :device-count="5"
            :reboot-required="isNgcRebootRequired"
            :modbus-settings-init="settingsInit.modbus"
            :numbering-system="settings.numberingSystem"
            :fields-invalid-statuses="fieldsInvalidStatuses"
            :advanced-settings-have-error="advancedSettingsHaveError.modbus"
            @select-device="activeDeviceAddr = $event"
            @set-modbus-settings="settings['modbus'] = $event"
            @set-numbering-system="settings.numberingSystem = $event"
          /> -->
        </div>
      </template>
    </div>
    <div
      class="h-[3.625rem] flex flex-row justify-end items-center border-t-2 border-[#0b3d68] pr-8"
    >
      <SaveButton
        :isSaving="isSaving"
        :is-disabled="isSaveButtonDisabled"
        class="w-[7.563rem]"
        @click="save"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { type ControllerSettings, type NGCSettings, type ExtDevsListRaw } from '@/typings/settings';
import SaveButton from '@/components/Ui/SaveButton.vue';
import { cloneDeep, isEqual, isEqualWith, omit, pick } from 'lodash';
// import ExtDevicesSettings from '@/components/views/devicesSettings/ExtDevicesSettings.vue';
import ScrollBooster from '@/components/ScrollBooster.vue';
import edit from '@/assets/img/edit.svg?raw';
import EditNGCSettings from '@/components/views/devicesSettings/NgcSettings.vue';
import EditExtDeviceSettings from '@/components/views/devicesSettings/ExtDeviceSettings.vue';
import type { DeviceAddr } from '@/typings/common';
import type { PartialDeep } from 'type-fest';

const indexStore = useIndexStore();

const { api } = useApiStore();

const { toast } = useToast();

const { storeCommonSettingsFile } = useStoreCommonSettingsFile();

const { extDevsList, ngcModbusMode, rebootingDeviceAddr } = storeToRefs(indexStore);

const ngcSettings = ref<NGCSettings>();

const ngcSettingsInit = ref<NGCSettings>();

const isNgcRebootRequired = ref(false);

const isSaving = ref(false);

const rebootNgcTrigger = ref(0);

const activeDeviceAddr = useStorage<DeviceAddr>('devicesSettings.activeDeviceAddr', 0, undefined, {
  mergeDefaults: (val: any) => {
    const parsed = parseInt(val, 10);
    if (!Number.isNaN(parsed) && parsed >= 0 && parsed <= 247) return parsed as DeviceAddr;
    return 0;
  },
});

const isAllNgcSettingsFieldsValid = ref(true);

const ignoreUndefined = (value: any) => {
  if (value === undefined) return true;
};

const isThereChanges = computed(() => {
  if (!ngcSettings.value || !ngcSettingsInit.value) return false;
  switch (ngcSettings.value.modbus.mode) {
    case 'off':
      return !isEqualWith(
        omit(ngcSettings.value, `modbus.advanced`),
        omit(ngcSettingsInit.value, `modbus.advanced`),
        ignoreUndefined,
      );
    case 'variables':
      return !isEqualWith(
        omit(ngcSettings.value, `modbus.advanced.ext-devs`),
        omit(ngcSettingsInit.value, `modbus.advanced.ext-devs`),
        ignoreUndefined,
      );
    case 'ext-devs':
      return !isEqualWith(
        omit(ngcSettings.value, `modbus.advanced.variables`),
        omit(ngcSettingsInit.value, `modbus.advanced.variables`),
        ignoreUndefined,
      );
  }
});

const isSaveButtonDisabled = computed(
  () => isSaving.value || !isThereChanges.value || !isAllNgcSettingsFieldsValid.value,
);

const activeExtDevice = computed(() => {
  if (activeDeviceAddr.value === 0 || !extDevsList.value) return undefined;
  return extDevsList.value.find((d) => d.addr === activeDeviceAddr.value);
});

watch(
  extDevsList,
  () => {
    if (!extDevsList.value || activeDeviceAddr.value === 0) return;
    if (!extDevsList.value.find((d) => d.addr === activeDeviceAddr.value)) {
      console.log('goToNgc');
      activeDeviceAddr.value = 0;
    }
  },
  { immediate: true },
);

function save() {
  if (activeDeviceAddr.value === 0) {
    saveNgcSettings();
  } else {
    // saveExtDeviceSettings();
  }
}

async function saveNgcSettings() {
  isSaving.value = true;
  const current = ngcSettings.value;
  const init = ngcSettingsInit.value;
  if (!current || !init) return;
  const settingsToSave: PartialDeep<ControllerSettings, { recurseIntoArrays: true }> = {};
  (['1-wire', 'pwm-out', 'bin-out', 'adc-in'] as const).forEach((k) => {
    if (isKeyOfBoth(current, init, k) && !isEqual(current[k], init[k])) {
      if (k === '1-wire') {
        settingsToSave['1-wire'] = current['1-wire'].map(
          (v, i): Partial<ControllerSettings['1-wire'][number]> =>
            isEqual(v, init['1-wire'][i]) ? { mode: v.mode } : v,
        );
      } else {
        settingsToSave[k] = current[k] as any;
      }
    }
  });
  if (!isEqual(current.modbus, init.modbus)) {
    settingsToSave.modbus = [];
    settingsToSave.modbus[0] = {
      ...pick(current.modbus, ['rate', 'parity', 'stop', 'mode']),
      ...(current.modbus.mode === 'off' ? {} : current.modbus.advanced[current.modbus.mode]),
    };
  }
  try {
    const r = await api.post('set_config', settingsToSave, { timeout: 60000 });
    isNgcRebootRequired.value = r.data['reboot-req'];
    if (current.numberingSystem !== init.numberingSystem) {
      const r = await storeCommonSettingsFile(
        undefined,
        undefined,
        undefined,
        current.numberingSystem,
      );
      if (r === 'error') throw '';
    }
    if (settingsToSave.modbus?.[0]?.mode) {
      if (current.modbus.mode === 'ext-devs' && init.modbus.mode !== 'ext-devs') {
        rebootNgcTrigger.value += 1;
        await until(rebootingDeviceAddr).toBe(0);
        await until(rebootingDeviceAddr).toBe(undefined);
        const r = await api.get<{ list: ExtDevsListRaw }>('get_ext_devs');
        indexStore.setExtDevsList(r.data.list);
      }
      indexStore.setNGCModbusMode(settingsToSave.modbus[0].mode || 'off');
      const r = await api.get<ControllerSettings>('get_config');
      setNgcSettings(r.data);
    }
    ngcSettingsInit.value = cloneDeep(ngcSettings.value);
  } catch (error) {
    toast.error(t('toast.error.header'), t('toast.error.text'));
  }
  isSaving.value = false;
}

const { t } = useI18n({
  messages: {
    en: {
      selectDevice: 'Select device',
    },
    ru: {
      selectDevice: 'Выбор устройства',
    },
  },
});

function setNgcSettings(data: ControllerSettings) {
  ngcSettings.value = {
    ...pick(data, ['1-wire', 'adc-in', 'bin-out', 'pwm-out']),
    modbus: {
      ...pick(data.modbus[0], ['rate', 'parity', 'stop', 'mode']),
      advanced: {
        variables: {
          'cycle-pause':
            data.modbus[0].mode === 'variables' ? data.modbus[0]['cycle-pause'] : undefined,
          'rd-pause': data.modbus[0].mode === 'variables' ? data.modbus[0]['rd-pause'] : undefined,
          'rd-tmo': data.modbus[0].mode === 'variables' ? data.modbus[0]['rd-tmo'] : undefined,
          'wr-pause': data.modbus[0].mode === 'variables' ? data.modbus[0]['wr-pause'] : undefined,
          'wr-tmo': data.modbus[0].mode === 'variables' ? data.modbus[0]['wr-tmo'] : undefined,
        },
        'ext-devs': {
          'cycle-pause':
            data.modbus[0].mode === 'ext-devs' ? data.modbus[0]['cycle-pause'] : undefined,
          'get-tmo': data.modbus[0].mode === 'ext-devs' ? data.modbus[0]['get-tmo'] : undefined,
          'ow-scan-tmo':
            data.modbus[0].mode === 'ext-devs' ? data.modbus[0]['ow-scan-tmo'] : undefined,
          'set-cfg-tmo':
            data.modbus[0].mode === 'ext-devs' ? data.modbus[0]['set-cfg-tmo'] : undefined,
          'set-tmo': data.modbus[0].mode === 'ext-devs' ? data.modbus[0]['set-tmo'] : undefined,
        },
      },
    },
    numberingSystem: indexStore.numberingSystem,
  };
  ngcSettingsInit.value = cloneDeep(ngcSettings.value);
}

onMounted(async () => {
  // await new Promise((resolve) => setTimeout(resolve, 150));
  try {
    const r = await api.get<ControllerSettings>('get_config');
    indexStore.setNGCModbusMode(r.data.modbus[0]?.mode || 'off');
    if (r.data.modbus[0]?.mode === 'ext-devs') {
      const r2 = await api.get<{ list: ExtDevsListRaw }>('get_ext_devs');
      indexStore.setExtDevsList(r2.data.list);
    }
    setNgcSettings(r.data);
    isNgcRebootRequired.value = r.data['reboot-req'];
  } catch (error) {
    console.error(error);
  }
});
</script>
