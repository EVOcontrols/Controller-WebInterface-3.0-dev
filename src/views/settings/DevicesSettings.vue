<template>
    <div class="h-full flex flex-col">
        <div
            class="flex flex-col flex-1 overflow-y-auto overflow-x-hidden scrollbar-4 relative"
            :id="'devicesSettings'"
        >
            <template v-if="controllerSettings">
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
                                        v-for="(device, i) in [...new Set(fullDevs)]"
                                        :key="i"
                                        type="button"
                                        class="h-[1.563rem] w-[3.188rem] bg-[#1b4569] hover:bg-[#214e76] on:bg-[#148ef8] font-roboto rounded flex items-center justify-center relative"
                                        :class="{
                                            on: device.addr === activeIndex,
                                        }"
                                        @click="onClick(i)"
                                    >
                                        <div
                                            v-if="
                                                device.addr !== 0 &&
                                                device.state !== 'on' &&
                                                device.state !== 'off'
                                            "
                                            class="w-[5px] h-[5px] rounded-[50%] mr-[6px]"
                                            :class="[
                                                { 'bg-[#84AFBD]': device.state === 'init' },
                                                { 'bg-[#3E688E]': device.state === 'no-conn' },
                                                { 'bg-[#FF5A88]': device.state === 'error' },
                                            ]"
                                        ></div>
                                        {{
                                            device.addr > 0
                                                ? fullDevs.findIndex(
                                                      (el) => el.serial === device.serial,
                                                  ) !== -1
                                                    ? `IO ${
                                                          fullDevs.find(
                                                              (el) => el.serial === device.serial,
                                                          )?.index ||
                                                          fullDevs.find(
                                                              (el) => el.serial === device.serial,
                                                          )?.addr ||
                                                          ''
                                                      }`
                                                    : 'IO'
                                                : 'NGC'
                                        }}
                                    </button>
                                </ScrollBooster>
                            </div>
                            <span
                                v-html="edit"
                                class="group ml-3"
                                :class="
                                    ngcModbusMode === 'ext-devs' ? 'cursor-pointer' : 'cursor-auto'
                                "
                                @mouseenter="
                                    () => {
                                        if (ngcModbusMode !== 'ext-devs')
                                            indexStore.toggleIsEditPopUpShown(true);
                                    }
                                "
                            ></span>
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
                            :deviceIndex="activeExtDevice.index"
                            :device-addr="activeDeviceAddr"
                            :device-state="activeExtDevice.state"
                            :save-trigger="saveTrigger"
                            @change-state="activeExtDevice.state = $event"
                            @set-need-to-save="needToSave = $event"
                            @set-is-saving="isSaving = $event"
                        />
                    </Transition>
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
import type { ControllerSettings } from '@/typings/settings';
import SaveButton from '@/components/Ui/SaveButton.vue';
import ScrollBooster from '@/components/ScrollBooster.vue';
import edit from '@/assets/img/edit.svg?raw';
import EditNGCSettings from '@/components/views/devicesSettings/NgcSettings.vue';
import EditExtDeviceSettings from '@/components/views/devicesSettings/ExtDeviceSettings.vue';
import axios from 'axios';
import type { DeviceAddr } from '@/typings/common';

const indexStore = useIndexStore();

const api = indexStore.getApi().api as axios.AxiosInstance;

const isAborted = indexStore.getApi().isAborted;

const { extDevsList, ngcModbusMode, devices } = storeToRefs(indexStore);

const fullDevs = computed<
    {
        addr: number;
        type: string;
        interf: [
            | { interf: '1w-gpio'; bus: number }
            | { interf: '1w-rom'; bus: number }
            | { interf: '1w-sens'; bus: number }
            | '1w-gpio'
            | '1w-rom'
            | '1w-sens'
            | 'adc-in'
            | 'bin-in'
            | 'bin-out'
            | 'bin-var'
            | 'int-var'
            | 'mb-var'
            | { interf: 'mb-var'; bus: number }
            | 'pwm-out'
            | 'tim-var',
        ];
        state: 'on' | 'off' | 'init' | 'no-conn' | 'error';
        serial: string;
        version: string;
        index?: number;
    }[]
>(() => {
    if (extDevsList.value) {
        const arr: {
            addr: number;
            type: string;
            interf: [
                | { interf: '1w-gpio'; bus: number }
                | { interf: '1w-rom'; bus: number }
                | { interf: '1w-sens'; bus: number }
                | '1w-gpio'
                | '1w-rom'
                | '1w-sens'
                | 'adc-in'
                | 'bin-in'
                | 'bin-out'
                | 'bin-var'
                | 'int-var'
                | 'mb-var'
                | { interf: 'mb-var'; bus: number }
                | 'pwm-out'
                | 'tim-var',
            ];
            state: 'on' | 'off' | 'init' | 'no-conn' | 'error';
            serial: string;
            version: string;
            index?: number;
        }[] = [];
        devices.value.forEach((d) => {
            if (!arr.find((el) => el.serial === d.serial)) arr.push(d);
        });
        extDevsList.value.forEach((d) => {
            if (!arr.find((el) => el.serial === d.serial))
                arr.push(
                    d as {
                        addr: number;
                        type: string;
                        interf: [
                            | { interf: '1w-gpio'; bus: number }
                            | { interf: '1w-rom'; bus: number }
                            | { interf: '1w-sens'; bus: number }
                            | '1w-gpio'
                            | '1w-rom'
                            | '1w-sens'
                            | 'adc-in'
                            | 'bin-in'
                            | 'bin-out'
                            | 'bin-var'
                            | 'int-var'
                            | 'mb-var'
                            | { interf: 'mb-var'; bus: number }
                            | 'pwm-out'
                            | 'tim-var',
                        ];
                        state: 'on' | 'off' | 'init' | 'no-conn' | 'error';
                        serial: string;
                        version: string;
                        index?: number;
                    },
                );
        });
        console.log(devices.value);
        return [...arr];
    } else {
        return [...devices.value] as {
            addr: number;
            type: string;
            interf: [
                | { interf: '1w-gpio'; bus: number }
                | { interf: '1w-rom'; bus: number }
                | { interf: '1w-sens'; bus: number }
                | '1w-gpio'
                | '1w-rom'
                | '1w-sens'
                | 'adc-in'
                | 'bin-in'
                | 'bin-out'
                | 'bin-var'
                | 'int-var'
                | 'mb-var'
                | { interf: 'mb-var'; bus: number }
                | 'pwm-out'
                | 'tim-var',
            ];
            state: 'on' | 'off' | 'init' | 'no-conn' | 'error';
            serial: string;
            version: string;
            index?: number;
        }[];
    }
});

const controllerSettings = ref<ControllerSettings>();

const isSaving = ref(false);

const saveTrigger = ref(0);

const activeDeviceAddr = useStorage<DeviceAddr>('devicesSettings.activeDeviceAddr', 0, undefined, {
    mergeDefaults: (val: any) => {
        const parsed = parseInt(val, 10);
        if (!Number.isNaN(parsed) && parsed >= 0 && parsed <= 247) {
            return parsed as DeviceAddr;
        }
        return 0;
    },
});

const activeIndex = computed(() => {
    const index = extDevsList.value?.find((el) => el.addr === activeDeviceAddr.value)?.index;
    return index || 0;
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

async function getConfig() {
    try {
        const r = await api.get<ControllerSettings>('get_config');
        controllerSettings.value = r.data;
        indexStore.setNGCModbusMode(r.data.modbus[0]?.mode || 'off');
    } catch (error) {
        if (isAborted.value) {
            return;
        }
        setTimeout(() => {
            getConfig();
        }, 20);
    }
}

onMounted(async () => {
    try {
        await getConfig();
    } catch (error) {
        console.error(error);
    }
});
</script>
