<template>
    <div class="h-full flex flex-col">
        <div class="flex flex-col flex-1 overflow-y-auto overflow-x-hidden scrollbar-4 relative">
            <template v-if="controllerSettings && (ngcModbusMode !== 'ext-devs' || extDevsList)">
                <div class="flex flex-col px-8">
                    <div class="mt-8 flex flex-col border-b border-[#0b3d68] pb-9 w-full">
                        <h2
                            class="font-semibold text-xl leading-[1.2] whitespace-pre mb-[1.125rem]"
                        >
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
                                            activeDeviceAddr =
                                                e === 0 ? 0 : extDevsList[e - 1]?.addr;
                                        }
                                    "
                                >
                                    <button
                                        v-for="(extDev, i) in [
                                            { addr: 0, state: 'on', serial: '' },
                                            ...(ngcModbusMode === 'ext-devs'
                                                ? extDevsList || []
                                                : []),
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
                            :controller-settings="controllerSettings"
                            :save-trigger="saveTrigger"
                            @set-need-to-save="needToSave = $event"
                            @set-is-saving="isSaving = $event"
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
import { type ControllerSettings, type ExtDevsListRaw } from '@/typings/settings';
import SaveButton from '@/components/Ui/SaveButton.vue';
import ScrollBooster from '@/components/ScrollBooster.vue';
import edit from '@/assets/img/edit.svg?raw';
import EditNGCSettings from '@/components/views/devicesSettings/NgcSettings.vue';
import EditExtDeviceSettings from '@/components/views/devicesSettings/ExtDeviceSettings.vue';
import type { DeviceAddr } from '@/typings/common';

const indexStore = useIndexStore();

const { api } = useApiStore();

const { extDevsList, ngcModbusMode } = storeToRefs(indexStore);

const controllerSettings = ref<ControllerSettings>();

const isSaving = ref(false);

const saveTrigger = ref(0);

const activeDeviceAddr = useStorage<DeviceAddr>('devicesSettings.activeDeviceAddr', 0, undefined, {
    mergeDefaults: (val: any) => {
        const parsed = parseInt(val, 10);
        if (!Number.isNaN(parsed) && parsed >= 0 && parsed <= 247) return parsed as DeviceAddr;
        return 0;
    },
});

const needToSave = ref(false);

const isSaveButtonDisabled = computed(() => isSaving.value || !needToSave.value);

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
    saveTrigger.value += 1;
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
    try {
        const r = await api.get<ControllerSettings>('get_config');
        controllerSettings.value = r.data;
        indexStore.setNGCModbusMode(r.data.modbus[0]?.mode || 'off');
        if (r.data.modbus[0]?.mode === 'ext-devs') {
            const r2 = await api.get<{ list: ExtDevsListRaw }>('get_ext_devs');
            indexStore.setExtDevsList(r2.data.list);
        }
    } catch (error) {
        console.error(error);
    }
});
</script>
