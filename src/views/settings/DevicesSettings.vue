<template>
  <div class="h-full flex flex-col">
    <div class="flex flex-col flex-1 overflow-y-auto overflow-x-hidden scrollbar-4 relative">
      <template v-if="ngcSettings && ngcSettingsInit && extDevsList">
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
                  @selectItem="activeDeviceAddr = $event as DeviceAddr"
                >
                  <button
                    v-for="(extDev, i) in [{ addr: 0, state: 'on', serial: '' }, ...extDevsList]"
                    :key="i"
                    type="button"
                    class="h-[1.563rem] w-[3.188rem] bg-[#1b4569] hover:bg-[#214e76] on:bg-[#148ef8] font-roboto rounded flex items-center justify-center"
                    :class="{
                      on: i === activeDeviceAddr,
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
              @change="ngcSettings = $event"
              @set-is-all-fields-valid="isAllNgcSettingsFieldsValid = $event"
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
import { cloneDeep, get, isEmpty, pick, set } from 'lodash';
// import ExtDevicesSettings from '@/components/views/devicesSettings/ExtDevicesSettings.vue';
import ScrollBooster from '@/components/ScrollBooster.vue';
import edit from '@/assets/img/edit.svg?raw';
import EditNGCSettings from '@/components/views/devicesSettings/NgcSettings.vue';
import EditExtDeviceSettings from '@/components/views/devicesSettings/ExtDeviceSettings.vue';
import type { DeviceAddr } from '@/typings/common';

const indexStore = useIndexStore();

const { api } = useApiStore();

const { toast } = useToast();

const { storeCommonSettingsFile } = useStoreCommonSettingsFile();

const { extDevsList } = storeToRefs(indexStore);

const ngcSettings = ref<NGCSettings>();

const ngcSettingsInit = ref<NGCSettings>();

const isNgcRebootRequired = ref(false);

const isSaving = ref(false);

const activeDeviceAddr = useStorage<DeviceAddr>('devicesSettings.activeDeviceAddr', 0, undefined, {
  mergeDefaults: (val: any) => {
    const parsed = parseInt(val, 10);
    if (!Number.isNaN(parsed) && parsed >= 0 && parsed <= 247) return parsed as DeviceAddr;
    return 0;
  },
});

const isAllNgcSettingsFieldsValid = ref(true);

const isThereChanges = computed(() => {
  if (!ngcSettings.value || !ngcSettingsInit.value) return false;
  return JSON.stringify(ngcSettings.value) !== JSON.stringify(ngcSettingsInit.value);
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
    if (!extDevsList.value) return;
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
  const settingsToSave: any = {};
  Object.keys(current).forEach((k1) => {
    if (!isKeyOfBoth(current, init, k1)) return;
    if (k1 === 'numberingSystem') return;
    const v1 = current[k1];
    const v2 = init[k1];
    if (Array.isArray(v1) && Array.isArray(v2)) {
      settingsToSave[k1] = [...new Array(v1.length)].map(() => ({}));
      v1.forEach((v3, i) => {
        const v4 = v2[i];
        Object.keys(v3).forEach((k2) => {
          if (!isKeyOfBoth(v3, v4, k2)) return;
          const v5 = v3[k2];
          const v6 = v4[k2];
          if (typeof v5 === 'object' && typeof v6 === 'object') {
            if (Array.isArray(v5) && Array.isArray(v6)) {
              if (JSON.stringify(v5) !== JSON.stringify(v6)) {
                set(settingsToSave[k1][i], [k2], v5);
              }
            } else {
              Object.keys(v5).forEach((k3) => {
                if (!isKeyOfBoth(v5, v6, k3)) return;
                const v7 = v5[k3];
                const v8 = v6[k3];
                if (v7 !== v8) {
                  set(settingsToSave[k1][i], [k2, k3], v7);
                }
              });
            }
          } else if (v5 !== v6) {
            set(settingsToSave[k1][i], [k2], v5);
          }
        });
        if (
          !isEmpty(settingsToSave[k1][i]) &&
          k1 === 'modbus' &&
          !('mode' in settingsToSave[k1][i])
        ) {
          settingsToSave[k1][i].mode = v3.mode;
        }
      });
      if (!settingsToSave[k1].filter((v9: any) => Object.keys(v9).length).length) {
        delete settingsToSave[k1];
      } else {
        settingsToSave[k1].reverse();
        const indexToCut = settingsToSave[k1].findIndex((v10: any) => Object.keys(v10).length);
        if (indexToCut !== -1) {
          settingsToSave[k1].splice(0, indexToCut);
        }
        settingsToSave[k1].reverse();
        const keys = new Set<string>();
        settingsToSave[k1].forEach((v10: any) => {
          Object.keys(v10).forEach((k4) => {
            keys.add(k4);
          });
        });
        if (k1 === '1-wire') keys.add('mode');
        keys.forEach((k4) => {
          settingsToSave[k1].forEach((v10: any, i: number) => {
            if (!v10[k4]) v10[k4] = get(current, [k1, i, k4]);
          });
        });
      }
    } else {
      Object.keys(v1).forEach((k2) => {
        if (!isKeyOfBoth(v1, v2, k2)) return;
        const v3 = v1[k2];
        const v4 = v2[k2];
        if (typeof v3 === 'object' && typeof v4 === 'object') {
          if (Array.isArray(v3) && Array.isArray(v4)) {
            if (JSON.stringify(v3) !== JSON.stringify(v4)) {
              set(settingsToSave, [k1, k2], v3);
            }
          }
        } else if (v3 !== v4) {
          if (!settingsToSave[k1]) settingsToSave[k1] = {};
          set(settingsToSave, [k1, k2], v3);
        }
      });
    }
  });
  // console.log(cloneDeep(settingsToSave));
  try {
    if (!isEmpty(settingsToSave)) {
      const r = await api.post('set_config', settingsToSave);
      isNgcRebootRequired.value = r.data['reboot-req'];
    }
    if (current.numberingSystem !== init.numberingSystem) {
      const r = await storeCommonSettingsFile(
        undefined,
        undefined,
        undefined,
        current.numberingSystem,
      );
      if (r === 'error') throw '';
    }
    if (settingsToSave.modbus?.[0]?.mode && ngcSettings.value) {
      const r = await api.get<ControllerSettings>('get_config');
      ngcSettings.value.modbus[0] = r.data.modbus[0];
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

onMounted(async () => {
  // await new Promise((resolve) => setTimeout(resolve, 150));
  try {
    const r = await api.get<ControllerSettings>('get_config');
    if (r.data.modbus[0]?.mode === 'ext-devs') {
      const r2 = await api.post<{ list: ExtDevsListRaw }>('get_ext_devs');
      indexStore.setExtDevsList(r2.data.list);
    }
    ngcSettings.value = {
      ...pick(r.data, ['1-wire', 'adc-in', 'bin-out', 'pwm-out', 'modbus']),
      numberingSystem: indexStore.numberingSystem,
    };
    ngcSettingsInit.value = cloneDeep(ngcSettings.value);
    isNgcRebootRequired.value = r.data['reboot-req'];
  } catch (error) {
    console.error(error);
  }
});
</script>
