<template>
    <div>
        <ManageDevice
            :is-reboot-required="false"
            :device-addr="deviceIndex as DeviceAddr"
            :device-state="curDevState"
            :curDeviceState="deviceState"
            @change-device-state="
                (event: 'on' | 'off') => {
                    curDevState = event;
                    emit('setNeedToSave', event !== deviceState);
                }
            "
        />
        <div
            v-if="devSettings && deviceState === 'on'"
            class="mt-8 border-b border-[#0b3d68] pb-10 w-full"
        >
            <h2 class="font-semibold text-xl leading-[1.2] whitespace-pre mb-[1.5rem]">
                {{ t('rsSettings1Port') }}
            </h2>
            <div class="flex flex-row items-center">
                <div class="text-[#6d9cc5] text-sm leading-[1.143] mr-[0.625rem]">
                    {{ t('slaveAddr') }}
                </div>
                <UiInput
                    :init-value="devSettings.slave.addr"
                    :name="'slave_addr'"
                    initType="number"
                    class="table-cell w-16 text-center !px-2"
                    :min-max="[0, 247]"
                    :status="fieldsInvalidStatuses.has('mb-slave') ? 'invalid' : 'valid'"
                    :input-type="['int']"
                    :nullable="false"
                    :required="true"
                    @status-changed="
                        $event === 'invalid' || $event === 'empty'
                            ? fieldsInvalidStatuses.add('mb-slave')
                            : fieldsInvalidStatuses.delete('mb-slave')
                    "
                    @value-changed="$event === undefined ? '' : (devSettings.slave.addr = $event)"
                />
            </div>
            <CollapseTransition :duration="300">
                <div v-if="devSettings && deviceState === 'on'">
                    <div class="flex flex-row mt-[2.8rem]">
                        <div class="text-[#6d9cc5] text-sm leading-[1.143] mr-[0.875rem]">
                            {{ t('speed') }}
                        </div>
                        <InputRange
                            :value="devSettings.slave.rate"
                            @change="devSettings.slave.rate = $event"
                        />
                    </div>
                    <div class="flex flex-row items-center mt-[2.5rem]">
                        <div class="text-[#6d9cc5] text-sm leading-[1.143] mr-[0.875rem]">
                            {{ t('parity') }}
                        </div>
                        <ButtonGroup
                            :buttons="modbusParities.map((v) => ({ text: t(`parities.${v}`), value: v }))"
                            :value="devSettings.slave.parity"
                            additional-classes="px-4"
                            @change="devSettings.slave.parity = $event"
                        />
                    </div>
                    <div class="flex flex-row items-center mt-[2.75rem]">
                        <div class="text-[#6d9cc5] text-sm leading-[1.143] mr-[0.875rem]">
                            {{ t('stop') }}
                        </div>
                        <ButtonGroup
                            :buttons="([1, 2] as const).map((v) => ({ text: v.toString(), value: v }))"
                            :value="devSettings.slave.stop"
                            additional-classes="px-4"
                            @change="devSettings.slave.stop = $event"
                        />
                    </div>
                </div>
            </CollapseTransition>
        </div>
        <div
            v-if="devSettings && deviceState === 'on'"
            class="mt-8 border-b border-[#0b3d68] pb-10 w-full"
        >
            <h2 class="font-semibold text-xl leading-[1.2] whitespace-pre mb-[1.5rem]">
                {{ t('rsSettings2Port') }}
            </h2>
            <CollapseTransition :duration="300">
                <div v-if="devSettings && deviceState === 'on'">
                    <div class="flex flex-row items-center">
                        <div class="text-[#6d9cc5] text-sm leading-[1.143] mr-[0.875rem]">
                            {{ t('portMode') }}
                        </div>
                        <ButtonGroup
                            :buttons="
                                modbusModes
                                    .filter((el) => el !== 'ext-devs')
                                    .map((v) => ({ text: t(`portModes.${v}`), value: v }))
                            "
                            :value="devSettings['rs-485'][0].mode"
                            additional-classes="px-4"
                            @change="
                                ($event) => {
                                    if ($event !== 'ext-devs' && devSettings) {
                                        devSettings['rs-485'][0].mode = $event;
                                        if (devSettings['rs-485'][0].mode === 'off') {
                                            if (!isAdvancedSettingsExpanded) {
                                                rsAdvancedParams.forEach((el) => {
                                                    fieldsInvalidStatuses.delete(`modbus-${el.param}`);
                                                });
                                            }
                                        }
                                    }
                                }
                            "
                        />
                    </div>
                    <div
                        v-if="devSettings['rs-485'][0].mode === 'variables'"
                        class="flex flex-row mt-[2.8rem]"
                    >
                        <div class="text-[#6d9cc5] text-sm leading-[1.143] mr-[0.875rem]">
                            {{ t('speed') }}
                        </div>
                        <InputRange
                            :value="devSettings['rs-485'][0].rate"
                            @change="devSettings['rs-485'][0].rate = $event"
                        />
                    </div>
                    <div
                        v-if="devSettings['rs-485'][0].mode === 'variables'"
                        class="flex flex-row items-center mt-[2.5rem]"
                    >
                        <div class="text-[#6d9cc5] text-sm leading-[1.143] mr-[0.875rem]">
                            {{ t('parity') }}
                        </div>
                        <ButtonGroup
                            :buttons="modbusParities.map((v) => ({ text: t(`parities.${v}`), value: v }))"
                            :value="devSettings['rs-485'][0].parity"
                            additional-classes="px-4"
                            @change="devSettings['rs-485'][0].parity = $event"
                        />
                    </div>
                    <div
                        v-if="devSettings['rs-485'][0].mode === 'variables'"
                        class="flex flex-row items-center mt-[2.75rem]"
                    >
                        <div class="text-[#6d9cc5] text-sm leading-[1.143] mr-[0.875rem]">
                            {{ t('stop') }}
                        </div>
                        <ButtonGroup
                            :buttons="([1, 2] as const).map((v) => ({ text: v.toString(), value: v }))"
                            :value="devSettings['rs-485'][0].stop"
                            additional-classes="px-4"
                            @change="devSettings['rs-485'][0].stop = $event"
                        />
                    </div>
                    <div
                        v-if="devSettings['rs-485'][0].mode === 'variables'"
                        class="flex flex-row items-center mt-[2.75rem]"
                    >
                        <div class="text-[#6d9cc5] text-sm leading-[1.143] mr-5 whitespace-pre">
                            {{ t('numberingSystem') }}
                        </div>
                        <ButtonGroup
                            :buttons="numberingSystems.map((v) => ({ text: v.toUpperCase(), value: v }))"
                            :value="curNumberingSystem"
                            additional-classes="px-4"
                            @change="curNumberingSystem = $event"
                        />
                    </div>
                    <AdvancedSettingsButton
                        v-if="devSettings && deviceState === 'on' && devSettings['rs-485'][0].mode === 'variables'"
                        :is-expanded="!!isAdvancedSettingsExpanded"
                        :is-error="!!new Set([...fieldsInvalidStatuses].filter((s) => s.startsWith('modbus'))).size"
                        @click="isAdvancedSettingsExpanded = !isAdvancedSettingsExpanded"
                    />
                    <CollapseTransition :duration="300">
                        <div
                            v-show="isAdvancedSettingsExpanded"
                            v-if="devSettings['rs-485'][0].mode === 'variables'"
                        >
                            <div class="table w-max mt-5">
                                <!--                                <pre>-->
                                <!--                                    {{ rsAdvancedParams }}-->
                                <!--                                </pre>-->
                                <!--                                <pre>-->
                                <!--                                    {{ devSettings['rs-485'][0] }}-->
                                <!--                                </pre>-->
                                <div
                                    v-for="p in rsAdvancedParams"
                                    :key="p.param"
                                    class="table-row h-[3.43rem] align-top last:h-10"
                                >
                                    <div class="text-[#6d9cc5] text-sm leading-[1.143] table-cell pr-4">
                                        {{ `${p.param}:` }}
                                    </div>
                                    <UiInput
                                        :init-value="
                                            isKeyOf(devSettings['rs-485'][0], p.param)
                                                ? devSettings['rs-485'][0][p.param]
                                                : undefined
                                        "
                                        :name="p.param"
                                        initType="number"
                                        class="table-cell w-16 text-center !px-2"
                                        :min-max="[p.min, p.max]"
                                        :status="fieldsInvalidStatuses.has(`modbus-${p.param}`) ? 'invalid' : 'valid'"
                                        :input-type="['int']"
                                        @status-changed="
                                            (event: InputFieldStatus) => {
                                                if (devSettings?.['rs-485'][0].mode === 'variables') {
                                                    if (event !== 'valid') {
                                                        fieldsInvalidStatuses.add(`modbus-${p.param}`);
                                                    } else {
                                                        fieldsInvalidStatuses.delete(`modbus-${p.param}`);
                                                    }
                                                }
                                            }
                                        "
                                        @value-changed="
                                            (e?: number) => {
                                                if (!devSettings || devSettings['rs-485'][0].mode !== 'variables')
                                                    return;
                                                devSettings['rs-485'][0][p.param] = e || 0;
                                            }
                                        "
                                    />
                                </div>
                            </div>
                        </div>
                    </CollapseTransition>
                </div>
            </CollapseTransition>
        </div>
        <div
            v-if="devSettings && deviceState === 'on'"
            class="mt-8 border-b border-[#0b3d68] pb-10 w-full"
        >
            <h2 class="font-semibold text-xl leading-[1.2] whitespace-pre mb-[1.5rem]">
                {{ t('1-wire') }}
            </h2>
            <div>
                <h3 class="text-sm leading-[1.143] mt-[1.125rem] mb-5">
                    {{ t('work-mode') }}
                </h3>
                <div class="table w-max">
                    <div
                        v-for="(w, i) in devSettings['1-wire']"
                        :key="i"
                        class="table-row h-11 align-top last:h-[1.875rem]"
                    >
                        <div class="text-[#6d9cc5] text-sm leading-[1.143] table-cell pr-4">
                            {{ `${t('bus')} ${i + 1}` }}
                        </div>
                        <ButtonGroup
                            :buttons="oneWireBuses"
                            :value="w.mode"
                            class="table-cell"
                            @change="w.mode = $event"
                        />
                    </div>
                </div>
                <AdvancedSettingsButton
                    v-if="
                        devSettings &&
                        deviceState === 'on' &&
                        devSettings['1-wire'].filter((el) => el.mode !== 'off').length &&
                        devSettings['1-wire']
                            .filter((el) => el.mode !== 'off')
                            .filter((elem) => Object.entries(elem).length > 1).length
                    "
                    :is-expanded="isAdvancedSettingsExpanded1Wire"
                    :is-error="!!new Set([...fieldsInvalidStatuses].filter((s) => s.startsWith('1-wire'))).size"
                    @click="isAdvancedSettingsExpanded1Wire = !isAdvancedSettingsExpanded1Wire"
                />
                <CollapseTransition :duration="300">
                    <div
                        v-show="
                            isAdvancedSettingsExpanded1Wire &&
                            devSettings['1-wire'].filter((el) => el.mode !== 'off').length &&
                            devSettings['1-wire']
                                .filter((el) => el.mode !== 'off')
                                .filter((elem) => Object.entries(elem).length > 1).length
                        "
                    >
                        <div class="table w-max mt-5 border-collapse">
                            <div
                                v-for="(w, i) in devSettings['1-wire']"
                                :key="i"
                            >
                                <div
                                    v-if="w.mode !== 'off' && Object.entries(w).length > 1"
                                    class="table-row [&:last-child]:!h-10"
                                >
                                    <div class="text-[#6d9cc5] text-sm leading-[1.143] table-cell pr-9">
                                        {{ `${t('bus')} ${i + 1}` }}
                                    </div>
                                    <div
                                        v-for="(p, y) in Object.entries(w).filter((el) => el[0] !== 'mode')"
                                        :key="y"
                                        class="table-row h-[3.43rem] align-top"
                                    >
                                        <div class="text-[#6d9cc5] text-sm leading-[1.143] table-cell pr-2.5 !w-[7rem]">
                                            {{ p[0] }}
                                        </div>
                                        <UiInput
                                            :init-value="p[1] as number | null | undefined"
                                            :name="p[0]"
                                            initType="number"
                                            class="table-cell w-16 text-center !px-2"
                                            :min-max="[0, 65535]"
                                            :status="
                                                fieldsInvalidStatuses.has(`1-wire-${i}-${p[0]}`) ? 'invalid' : 'valid'
                                            "
                                            :input-type="['int']"
                                            @status-changed="
                                                ($event: InputFieldStatus) => {
                                                    if (devSettings?.['1-wire'][i].mode === 'off') return;
                                                    $event !== 'valid' && w.mode !== 'off'
                                                        ? fieldsInvalidStatuses.add(`1-wire-${i}-${p[0]}`)
                                                        : fieldsInvalidStatuses.delete(`1-wire-${i}-${p[0]}`);
                                                }
                                            "
                                            @value-changed="$event === undefined ? '' : (w[p[0]] = $event)"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </CollapseTransition>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import type { DeviceWorkState } from '@/typings/settings';
import ManageDevice from './elements/ManageDevice.vue';
import type { DeviceAddr } from '@/typings/common';
import type { ExtDeviceSettings } from '@/typings/settings';
import { _ } from '@/plugins/lodash';
import UiInput from '@/components/Ui/UiInput.vue';
import type { PartialDeep } from 'type-fest/source/partial-deep';
import InputRange from '@/components/views/devicesSettings/elements/InputRange.vue';
import CollapseTransition from '@/components/CollapseTransition.vue';
import ButtonGroup from '@/components/Ui/ButtonGroup.vue';
import AdvancedSettingsButton from '@/components/views/devicesSettings/elements/AdvancedSettingsButton.vue';
import type { InputFieldStatus } from '@/typings/common';

const props = defineProps<{
    deviceIndex: number;
    deviceAddr: Exclude<DeviceAddr, 0>;
    deviceState: DeviceWorkState;
    saveTrigger: number;
}>();

const devSettings = ref<ExtDeviceSettings>();

const devSettingsInit = ref<ExtDeviceSettings>();

const emit = defineEmits<{
    (e: 'changeState', value: DeviceWorkState): void;
    (e: 'setNeedToSave', needToSave: boolean): void;
    (e: 'setIsSaving', isSaving: boolean): void;
}>();

const indexStore = useIndexStore();

const { toast } = useToast();

const { storeCommonSettingsFile } = useStoreCommonSettingsFile();

const { api } = useApiStore();

const isAborted = indexStore.getApi().isAborted;

const curDevState = ref<DeviceWorkState>(props.deviceState);

const { numberingSystem, devices, isRebootRequired } = storeToRefs(indexStore);

const isMainSaving = ref(false);

const isOptionsSaving = ref(false);

const isInit = ref(false);

const fieldsInvalidStatuses = ref<Set<string>>(new Set());

const initNumberingSystem = ref<'dec' | 'hex'>(numberingSystem.value);

const curNumberingSystem = ref<'dec' | 'hex'>(numberingSystem.value);

const isAdvancedSettingsExpanded = ref(false);

const isAdvancedSettingsExpanded1Wire = ref(false);

const cloneDeep = await _.cloneDeep();
const isEmpty = await _.isEmpty();
const isEqual = await _.isEqual();

const rsAdvancedParams = [
    { param: 'read-tmo', min: 0, max: 65535 },
    { param: 'write-tmo', min: 0, max: 65535 },
    { param: 'read-delay', min: 0, max: 65535 },
    { param: 'write-delay', min: 0, max: 65535 },
    { param: 'cycle-delay', min: 0, max: 65535 },
] as const;

const oneWiresParams = computed<
    {
        param: 'cycle-delay' | 'debounce-time' | 'convert-time';
        label: string;
        min: number;
        max: number;
    }[][]
>(() =>
    devSettings.value === undefined
        ? []
        : devSettings.value['1-wire'].map((w) => [
              {
                  param: 'cycle-delay',
                  label: 'cycle-delay',
                  min: 0,
                  max: 65535,
              },
              {
                  param: 'debounce-time',
                  label: 'debounce-time',
                  min: 0,
                  max: 65535,
              },
              {
                  param: 'convert-time',
                  label: 'convert-time',
                  min: 0,
                  max: 65535,
              },
          ]),
);

const areThereChanges = computed(() => {
    if (!devSettings.value || !devSettingsInit.value) return false;
    return (
        JSON.stringify(devSettings.value) !== JSON.stringify(devSettingsInit.value) ||
        curNumberingSystem.value !== initNumberingSystem.value
    );
});

const needToSave = computed(() => {
    return areThereChanges.value && !fieldsInvalidStatuses.value.size;
});

async function getCongig() {
    if (props.deviceState === 'on') {
        try {
            const r = await api.post('get_ext_cfg', {
                device: props.deviceIndex,
            });
            devSettings.value = r.data as ExtDeviceSettings;
            devSettingsInit.value = cloneDeep(devSettings.value);
        } catch (error) {
            if (isAborted.value) {
                return;
            }
            setTimeout(() => {
                getCongig();
            }, 5);
        }
    }
}

async function setDevState() {
    isMainSaving.value = true;
    if (curDevState.value === 'on' && props.deviceState !== 'on') {
        isInit.value = true;
    }
    if (isRebootRequired.value) return;
    try {
        const list = (await (await api.get('get_ext_devs')).data).list;
        list[props.deviceIndex - 1] = {
            addr: devSettings.value?.slave.addr || props.deviceAddr,
            type: 'NG3-EDIO',
            state: curDevState.value,
        };
        const r = await api.post('set_ext_devs', {
            list: list,
        });
        if (r.status === 200) {
            isMainSaving.value = false;
            emit('changeState', curDevState.value);
            // const curDevices = devices.value;
            indexStore.setDevicesToInitState();
            indexStore.setDevicesStateToInitState();
            indexStore.setOWIdsToInitState();
            indexStore.setCalibrValsToInitState();
            indexStore.setMbDevsToInitState();
            // curDevices.forEach((d) => {
            //     indexStore.setDevices(d);
            // });
            indexStore.setNeedToReqData(true);
            indexStore.toggleDevice(0);
        }
    } catch (error) {
        if (isAborted.value) {
            toast.error(t('toast.error.header'), t('toast.error.text'));
            isMainSaving.value = false;
            return;
        }
        setTimeout(() => {
            setDevState();
        }, 10);
    }
}

async function save(count: number = 0) {
    emit('setIsSaving', true);
    const current = devSettings.value;
    const init = devSettingsInit.value;
    const settingsToSave: PartialDeep<ExtDeviceSettings, { recurseIntoArrays: true }> = {};
    if (current && init) {
        (['slave'] as const).forEach((k) => {
            if (isKeyOfBoth(current, init, k) && !isEqual(current[k], init[k])) {
                settingsToSave[k] = current[k] as any;
            }
        });
        (['rs-485'] as const).forEach((k) => {
            if (isKeyOfBoth(current, init, k) && !isEqual(current[k], init[k])) {
                settingsToSave[k] = [current[k][0]] as any;
            }
        });
        (['1-wire'] as const).forEach((k) => {
            if (isKeyOfBoth(current, init, k) && !isEqual(current[k], init[k])) {
                settingsToSave[k] = current[k] as any;
            }
        });
        if (props.deviceState === 'on') {
            try {
                if (!isEmpty(settingsToSave)) {
                    const newObj: any = { ...settingsToSave };
                    newObj.device = props.deviceIndex;
                    isOptionsSaving.value = true;
                    const r = await api.post('set_ext_cfg', newObj, { timeout: 60000 });
                    if (r.status === 200) {
                        isOptionsSaving.value = false;
                    }
                    // isRebootRequired.value = r.data['reboot-req'];
                }
                if (curNumberingSystem.value !== initNumberingSystem.value) {
                    isOptionsSaving.value = true;
                    const r = await storeCommonSettingsFile(undefined, undefined, undefined, curNumberingSystem.value);
                    if (r === 'error') throw '';
                    indexStore.setNumberingSystem(curNumberingSystem.value);
                    if (isEmpty(settingsToSave)) isOptionsSaving.value = false;
                }
                if (settingsToSave['1-wire']) {
                    for (let i = 0; i < settingsToSave['1-wire'].length; i++) {
                        if (JSON.stringify(current['1-wire'][i]) !== JSON.stringify(init['1-wire'][i])) {
                            indexStore.setOWIds(props.deviceIndex, i, []);
                            indexStore.removeOWInterf(props.deviceIndex, i);
                        }
                    }
                }
                if (settingsToSave['1-wire']) {
                    for (let i = 0; i < settingsToSave['1-wire'].length; i++) {
                        if (JSON.stringify(current['1-wire'][i]) !== JSON.stringify(init['1-wire'][i])) {
                            indexStore.setOWIds(props.deviceIndex, i, []);
                            indexStore.removeOWInterf(props.deviceIndex, i);
                        }
                    }
                }
                if (settingsToSave['rs-485']) {
                    for (let i = 0; i < settingsToSave['rs-485'].length; i++) {
                        if (JSON.stringify(current['rs-485'][i]) !== JSON.stringify(init['rs-485'][i])) {
                            indexStore.removeMbInterf(props.deviceIndex);
                            if (current['rs-485'][i].mode === 'variables') {
                                // const curDevices = devices.value;
                                indexStore.setDevicesToInitState();
                                indexStore.setDevicesStateToInitState();
                                indexStore.setOWIdsToInitState();
                                indexStore.setCalibrValsToInitState();
                                indexStore.setMbDevsToInitState();
                                // curDevices.forEach((d) => {
                                //     indexStore.setDevices(d);
                                // });
                                indexStore.setNeedToReqData(true);
                                indexStore.toggleDevice(0);
                            }
                        }
                    }
                }
            } catch (error) {
                if (count > 5) {
                    toast.error(t('toast.error.header'), t('toast.error.text'));
                    isOptionsSaving.value = false;
                } else {
                    save(count + 1);
                }
            }
        }
    }
    if (
        curDevState.value !== props.deviceState ||
        (init && settingsToSave.slave?.addr !== undefined && settingsToSave.slave.addr !== init.slave.addr)
    ) {
        await setDevState();
    }
}

function waitForInitStatus() {
    if (props.deviceState === 'init' || props.deviceState === 'no-conn' || props.deviceState === 'on') {
        isInit.value = false;
        waitForOnStatus();
    } else {
        setTimeout(() => {
            waitForInitStatus();
        }, 200);
    }
}

function waitForOnStatus() {
    if (props.deviceState === 'on' || props.deviceState === 'no-conn') {
        curDevState.value = props.deviceState;
        setTimeout(() => {
            emit('setIsSaving', false);
            emit('setNeedToSave', false);
        }, 500);
    } else {
        setTimeout(() => {
            waitForOnStatus();
        }, 200);
    }
}

onMounted(async () => {
    getCongig();
});

watch(
    () => [props.deviceState, props.deviceIndex],
    () =>
        setTimeout(() => {
            if (props.deviceState === 'on') {
                getCongig();
            }
        }, 1000),
);

watch(() => props.saveTrigger, save);

watch([isMainSaving, isOptionsSaving], () => {
    if (!isMainSaving.value && !isOptionsSaving.value) {
        if (isInit.value) {
            waitForInitStatus();
        } else {
            setTimeout(() => {
                emit('setIsSaving', false);
                emit('setNeedToSave', false);
            }, 500);
        }
    }
});

watch(needToSave, () => {
    emit('setNeedToSave', needToSave.value);
});

onBeforeUnmount(() => emit('setNeedToSave', false));

const { t } = useI18n({
    messages: {
        en: {
            '1-wire': '1-wire settings',
            'work-mode': 'Mode',
            bus: 'Bus',
            buses: {
                off: 'OFF',
                rom: 'ID',
                sens: 'SENS',
            },
            rsSettings1Port: 'Connection settings with NGC (first RS485 port)',
            rsSettings2Port: 'Settings for the second RS485 port',
            portMode: 'Port mode',
            slaveAddr: 'Slave address:',
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
            '1-wire': 'Настройки шин 1-wire',
            'work-mode': 'Режим работы',
            bus: 'Шина',
            buses: {
                off: 'OFF',
                rom: 'ID',
                sens: 'SENS',
            },
            rsSettings1Port: 'Настройки соединения с NGC (первый порт RS485)',
            rsSettings2Port: 'Настройки второго порта RS485',
            portMode: 'Режим работы порта',
            slaveAddr: 'Slave адрес:',
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

const oneWireBuses = oneWiresModes.map((m) => ({
    text: t(`buses.${m}`),
    value: m,
}));
</script>
