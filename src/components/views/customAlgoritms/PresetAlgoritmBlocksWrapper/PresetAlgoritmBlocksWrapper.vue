<template>
    <div
        class="bg-[#0A2B47] rounded-[8px] flex-1"
        :class="[{ 'pointer-events-none': microLoading }]"
        v-if="!isLoading"
    >
        <div
            v-if="microLoading"
            class="p-2 flex items-center justify-center fixed top-[22rem]"
            :class="{ 'left-1/2 -translate-x-1/2 -ml-[4rem]': props.side === 'l', 'right-[3rem]': props.side === 'r' }"
        >
            <span
                v-html="spinner"
                class="self-center mb-4 [&>svg]:w-[5rem] [&>svg>path]:fill-[#148ef8]"
            ></span>
        </div>
        <div class="flex flex-col pb-1">
            <div class="flex-1 flex">
                <div class="pl-[1.875rem] pr-6 pt-7">
                    <div class="w-[1px] h-full bg-[#158EF8]"></div>
                </div>
                <div :style="{ width: 'calc(100% - 55px)' }">
                    <PresetAlgoritmBlock
                        v-for="(item, i) in config"
                        :key="i"
                        :numb="i"
                        :queue="item.queue"
                        :isFirst="!i"
                        :isLast="config && i === config.length - 1"
                        :titles="item.titles"
                        :btns="item.btns"
                        :tabs="item.tabs"
                        :radioBtns="item.radioBtns"
                        :checkBoxes="item.checkBoxes"
                        :inputs="item.inputs"
                        :dropDowns="item.dropDowns"
                        @handleBtnClick="
                            (btnsItemIndex: number, val: string | number) => {
                                handleBtnClick(i, btnsItemIndex, val);
                            }
                        "
                        @handleTabClick="
                            (tabsItemIndex: number, val: string | number) => {
                                handleTabClick(i, tabsItemIndex, val);
                            }
                        "
                        @handleRadioBtnClick="
                            (radioBtnsItemIndex: number, val: string) => {
                                handleRadioBtnClick(i, radioBtnsItemIndex, val);
                            }
                        "
                        @handleCheckboxClick="
                            (checkboxItemIndex: number, val: string, status: boolean, part: 1 | 2) => {
                                handleCheckboxClick(i, checkboxItemIndex, val, status, part);
                            }
                        "
                        @handleInput="
                            (inputItemIndex: number, val: number) => {
                                handleInput(i, inputItemIndex, val);
                            }
                        "
                        @handleDropDownClick="
                            (itemIndex: number) => {
                                handleDropDownClick(i, itemIndex);
                            }
                        "
                    />
                </div>
            </div>
        </div>
        <div class="w-full h-[1px] bg-[#2C5982]"></div>
        <div class="h-[3.5rem] px-6 flex items-center justify-end">
            <SaveButton
                :isSaving="isSaving"
                :is-disabled="isSaveBtnDisabled"
                class="w-[7.563rem]"
                @click="saveData"
            />
        </div>
        <ModalWrapper
            v-if="shownDropDown"
            :is-saving="false"
            :cancel-text="t('popUp.btns.cancel')"
            :confirm-text="t('popUp.btns.confirm')"
            :width-class="'w-[32.125rem]'"
            @close="shownDropDown = undefined"
            @confirm="
                () => {
                    handleDropChange(shownDropDown ? shownDropDown.configItemIndex : 0, 0, shownDropDown?.vals || []);
                    shownDropDown = undefined;
                }
            "
        >
            <template #title-icon>
                <span
                    v-if="shownDropDown?.type === 'obj'"
                    v-html="object"
                ></span>
                <IButtonIcon
                    v-else-if="shownDropDown?.type === 'bin'"
                    :class="
                        shownDropDown?.items[shownDropDown?.vals[0]]?.val
                            ? '[&>path]:fill-[#00D6AF] [&>rect]:fill-[#00D6AF]'
                            : '[&>path]:fill-[#5891C2] [&>rect]:fill-[#5891C2]'
                    "
                />
                <span
                    v-else-if="shownDropDown?.type === '1w-sens'"
                    v-html="ow"
                ></span>
                <div
                    v-else
                    class="select-none w-[1.375rem] h-[1.375rem] rounded-[3px] border border-[#4C84B6] flex items-center justify-center text-[#4C84B6]"
                >
                    {{ shownDropDown.type === 'var' ? 'П' : shownDropDown.type === 'cond' ? 'У' : 'Д' }}
                </div>
            </template>
            <template #title
                >{{ t('popUp.select') }}
                {{
                    shownDropDown.type === 'act'
                        ? t('popUp.actions')
                        : shownDropDown.type === 'cond'
                        ? t('popUp.conditions')
                        : t('popUp.obj')
                }}</template
            >
            <template #content>
                <div class="relative text-[#6cb5d3] text-sm leading-[1.272] whitespace-pre mt-2">
                    <UiInput
                        :init-value="headerInput"
                        :placeholder="t('popUp.placeholder')"
                        name="'name, group, template'"
                        initType="string"
                        class="table-cell !w-full !pl-[40px] !pr-6 !h-[40px] flex-1 bg-[#113351]"
                        :status="'valid'"
                        :input-type="['string']"
                        @value-changed="
                            $event === undefined || $event === '' ? (headerInput = '') : (headerInput = $event)
                        "
                    />
                    <span
                        v-html="search"
                        class="[&>svg]:h-[20px] [&>svg]:w-[20px] absolute top-[10px] left-[12px]"
                    ></span>
                    <div class="bg-[#113351] p-2 mt-[10px] rounded-[6px] overflow-y-hidden">
                        <div
                            v-dragscroll.y
                            class="overflow-y-auto w-full scrollbar-4 relative h-[23.5rem]"
                        >
                            <div
                                class="h-9 w-full"
                                v-for="(item, i) in shownDropDown.items.filter((el) => el.name.includes(headerInput))"
                                :key="i"
                            >
                                <div
                                    class="w-full h-full px-[10px] flex items-center transition-colors duration-300 hover:bg-[#163E61]"
                                    :class="shownDropDown.vals.includes(i) ? 'bg-[#163E61]' : ''"
                                    @click="handleClickMultiSelect(item)"
                                >
                                    <div class="w-5 mr-4">
                                        {{ i + 1 }}
                                    </div>
                                    <IButtonIcon
                                        v-if="shownDropDown.type === 'bin'"
                                        class="mr-4"
                                        :class="
                                            item.val
                                                ? '[&>path]:fill-[#00D6AF] [&>rect]:fill-[#00D6AF]'
                                                : '[&>path]:fill-[#5891C2] [&>rect]:fill-[#5891C2]'
                                        "
                                    />
                                    <div class="flex-1 text-sm text-[#8DC5F6]">
                                        {{ item.name || '&#8212;' }}
                                    </div>
                                    <div
                                        v-if="shownDropDown.type !== 'bin'"
                                        class="text-sm"
                                        :class="
                                            shownDropDown.realType === '1w-sens'
                                                ? Array.isArray(item.val) &&
                                                  item.val[0] !== null &&
                                                  (item.val[0] as number) > 0
                                                    ? 'text-[#EB8246]'
                                                    : 'text-[#35A1FF]'
                                                : 'text-[#8DC5F6]'
                                        "
                                    >
                                        {{
                                            shownDropDown.realType === '1w-sens' &&
                                            Array.isArray(item.val) &&
                                            item.val[0] !== null
                                                ? tempUnit === '°C'
                                                    ? `${Math.round((item.val[0] as number) / 10) / 10}°C`
                                                    : `${(Math.round((item.val[0] as number) / 10) / 10) * 1.8 + 32}°F`
                                                : shownDropDown.realType === 'pwm-out' && typeof item.val === 'number'
                                                ? `${item.val / 100}%`
                                                : shownDropDown.realType === 'adc-in' && typeof item.val === 'number'
                                                ? `${item.val}%`
                                                : Array.isArray(item.val)
                                                ? ''
                                                : item.val
                                        }}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div
                        class="flex items-center gap-2 text-sm text-[#8DC5F6] mt-4"
                        v-if="shownDropDown.type === 'act' || shownDropDown.type === 'cond'"
                    >
                        <span v-html="info"></span>
                        {{ t('popUp.info') }}
                    </div>
                </div>
            </template>
        </ModalWrapper>
    </div>
    <div
        v-else
        class="p-2 flex items-center justify-center"
    >
        <span
            v-html="spinner"
            class="self-center mb-4 [&>svg]:w-[5rem] [&>svg>path]:fill-[#148ef8]"
        ></span>
    </div>
</template>

<script lang="ts" setup>
import PresetAlgoritmBlock from '@/components/views/customAlgoritms/PresetAlgoritmBlock.vue';
import SaveButton from '@/components/Ui/SaveButton.vue';
import ModalWrapper from '@/components/ModalWrapper.vue';
import object from '@/assets/img/object.svg?raw';
import ow from '@/assets/img/ow.svg?raw';
import IButtonIcon from '@/assets/IButtonIcon.vue';
import search from '@/assets/img/search.svg?raw';
import UiInput from '@/components/Ui/UiInput.vue';
import info from '@/assets/img/info.svg?raw';
import spinner from '@/assets/img/spinner-inside-button.svg?raw';
import type { Body, Ent, Time } from '@/typings/funcs';
import { translate } from '@/locales/PresetAlgoritmBlocksWrapper';
import {
    DropDown,
    Interface,
    Mode1W,
    ModeMb,
    ORDER,
    PropsTypes,
    Config,
    EntBind,
    UDF,
    EntType,
    EntNum,
    DropDownRealType,
    DropDownItem,
    CurKeyMap,
    BodySave,
    MBTypes,
    analogyInterfaces,
    Input,
    Btn,
} from './types';
import {
    $apiGetConfig,
    $apiGetEntState,
    $apiGetMbInfo,
    $apiGetUdfConfig,
    $apiReadFile,
    $apiSaveUdfConfig,
} from './api';
import { getInitCurBody } from './curBody';
import { createConfig } from './createConfig';
import { createEntityConfig } from './createEntityConfig';
import { createBodyState } from './createBodyState';
import { createObjByType } from './createUdfObj';
import type { ControllerSettings } from '@/typings/settings';
import type { Capab, Device } from '@/typings/main';

const isDev = import.meta.env.DEV;
const timeoutDev = 10000;

const funcStore = useFuncsStore();

const props = defineProps<{
    side: 'l' | 'r';
    type: PropsTypes;
    device?: Device;
    index: number;
    isCreating: boolean;
}>();

const emit = defineEmits<{
    (e: 'creatingFinish'): void;
}>();

const indexStore = useIndexStore();

const { devices, labels, tempUnit, devCapabs, valuesConstRange } = storeToRefs(indexStore);
const { funcLabels } = storeToRefs(funcStore);

const isSaving = ref(false);
const isLoading = ref(false);
const microLoading = ref(false);
const inputError = ref(false);
const isSaveBtnDisabled = ref(true);

const initConfig = ref<string>();

const headerInput = ref('');

const shownDropDown = ref<DropDown>();

const curDevCapab = ref<Capab>();

const order = ORDER;

const mbVarTypes = ref<MBTypes[]>([]);
const cur1WConfig = ref<Mode1W[]>([]);
const curMbConfig = ref<ModeMb>([]);

const interfaces1 = ref<Interface[]>([]);
const interfaces2 = ref<Interface[]>([]);
const interfaces3 = ref<Interface[]>([]);

const config = ref<Config[]>([]);

const curConfigByAddr = ref<ControllerSettings>();
const configByAddr = ref<Record<string, ControllerSettings>>({});

const curBody = ref<Body>();

const ent1 = ref<EntBind[]>([]);
const ent2 = ref<EntBind[]>([]);
const ent3 = ref<EntBind[]>([]);
const time1 = ref<EntBind[]>([]);
const time2 = ref<EntBind[]>([]);
const time3 = ref<EntBind[]>([]);
const multiSelect = ref<EntBind[]>([]);
const entLabels1 = ref<string[]>([]);
const entLabels2 = ref<string[]>([]);
const entLabels3 = ref<string[]>([]);
const ent1WConfig1 = ref<Mode1W[]>([]);
const ent1WConfig2 = ref<Mode1W[]>([]);
const ent1WConfig3 = ref<Mode1W[]>([]);

const isUpdating = ref(false);

function modifyTime<T extends Record<string, any>>(
    obj: T,
    timeConfig: Config | undefined,
    prop: string,
): T | undefined {
    if (!obj[prop] || obj[prop].type !== 'tim-const' || !timeConfig) return undefined;

    const multiplier = timeConfig.btns[1].val === 'ms' ? 1 : timeConfig.btns[1].val === 's' ? 1000 : 60000;
    return {
        ...obj[prop],
        value: obj[prop].value * multiplier,
    };
}

function modifyAnalogyValue<T extends Record<string, any>>(obj: T, prop: string): T | undefined {
    if (!obj[prop] || obj[prop].type !== 'int-const' || !obj.entity || !analogyInterfaces.includes(obj.entity.type))
        return undefined;

    return {
        ...obj[prop],
        value: obj[prop].value * 100,
    };
}

function modifyValueWithErrorOperation<T extends Record<string, any>>(obj: T, prop: string): T | undefined {
    if (!obj[prop] || (obj.operation !== 'error' && obj.operation !== 'non-error')) return undefined;

    return {
        ...obj[prop],
        value: 0,
    };
}

async function saveData() {
    isSaving.value = true;

    let body: BodySave = {
        type: props.type.val,
        device: props.device ? props.device.addr : 0,
        index: props.index,
    };

    const obj = createObjByType(props.type.val, config.value, props.device);
    const timeConfig = config.value.find((el) => el.curKey === CurKeyMap.Time);
    const minTimeConfig = config.value.find((el) => el.curKey === CurKeyMap.MinTime);
    const maxTimeConfig = config.value.find((el) => el.curKey === CurKeyMap.MaxTime);
    const delayConfig = config.value.find((el) => el.curKey === CurKeyMap.Delay);
    const pauseConfig = config.value.find((el) => el.curKey === CurKeyMap.Pause);
    const modified = {
        ...obj,
        ...(modifyTime(obj, timeConfig, 'time') && { time: modifyTime(obj, timeConfig, 'time') }),
        ...(modifyTime(obj, minTimeConfig, 'min-time') && {
            'min-time': modifyTime(obj, minTimeConfig, 'min-time'),
        }),
        ...(modifyTime(obj, maxTimeConfig, 'max-time') && {
            'max-time': modifyTime(obj, maxTimeConfig, 'max-time'),
        }),
        ...(modifyTime(obj, delayConfig, 'delay') && {
            delay: modifyTime(obj, delayConfig, 'delay'),
        }),
        ...(modifyTime(obj, pauseConfig, 'pause') && {
            pause: modifyTime(obj, pauseConfig, 'pause'),
        }),
        ...(modifyAnalogyValue(obj, 'value') && {
            value: modifyAnalogyValue(obj, 'value'),
        }),
        ...(modifyAnalogyValue(obj, 'stop-val') && {
            'stop-val': modifyAnalogyValue(obj, 'stop-val'),
        }),
        ...(modifyValueWithErrorOperation(obj, 'value') && {
            value: modifyValueWithErrorOperation(obj, 'value'),
        }),
    };

    if (props.type.val === 'udf-act') {
        body = { ...body, action: modified };
    } else if (props.type.val === 'udf-cond') {
        body = { ...body, condition: modified };
    } else if (props.type.val === 'udf-trans') {
        body = { ...body, transform: modified };
    } else {
        body = { ...body, trigger: modified };
    }

    console.warn('save body', body);
    await $apiSaveUdfConfig(body);
    isSaving.value = false;
    initConfig.value = JSON.stringify(config.value);
    isUpdating.value = false;
    emit('creatingFinish');
}

async function reRenderLayout() {
    if (isLoading.value) return;
    isUpdating.value = true;

    const obj = createObjByType(props.type.val, config.value, props.device);
    curBody.value = obj as Body;
    await setConfig();

    ent1.value = [];
    ent2.value = [];
    ent3.value = [];
    time1.value = [];
    time2.value = [];
    time3.value = [];
    entLabels1.value = [];
    entLabels2.value = [];
    entLabels3.value = [];
    ent1WConfig1.value = [];
    ent1WConfig2.value = [];
    ent1WConfig3.value = [];
    interfaces1.value = [];
    interfaces2.value = [];
    interfaces3.value = [];
}

function checkConfigToSave() {
    if (inputError.value) {
        isSaveBtnDisabled.value = true;
    } else {
        isSaveBtnDisabled.value = props.isCreating
            ? false
            : isUpdating.value
            ? false
            : initConfig.value === JSON.stringify(config.value);
    }
}

async function handleBtnClick(configItemIndex: number, btnsItemIndex: number, val: string | number) {
    if (!config.value) return;
    microLoading.value = true;
    const prevConfig = [...config.value];
    if (prevConfig[configItemIndex] && prevConfig[configItemIndex].btns[btnsItemIndex]) {
        if (
            [CurKeyMap.Time, CurKeyMap.MinTime, CurKeyMap.MaxTime, CurKeyMap.Delay, CurKeyMap.Pause].includes(
                prevConfig[configItemIndex].curKey,
            ) &&
            (val === 'tim-var' || val === 'tim-const')
        ) {
            const time = await parseTime({ type: val }, prevConfig[configItemIndex].titles[0]);
            if (time && time.length) {
                prevConfig[configItemIndex] = time[0];
            }
        }

        prevConfig[configItemIndex].btns[btnsItemIndex].val = val;
        config.value = prevConfig;
    }
    checkConfigToSave();
    reRenderLayout();
}

function handleTabClick(configItemIndex: number, tabsItemIndex: number, val: string | number) {
    if (!config.value) return;
    microLoading.value = true;
    const prevConfig = [...config.value];
    if (prevConfig[configItemIndex] && prevConfig[configItemIndex].tabs[tabsItemIndex]) {
        prevConfig[configItemIndex].tabs[tabsItemIndex].val = val;
        const depInd = prevConfig[configItemIndex].tabs[tabsItemIndex].dependentDropDownIndex;
        if (depInd !== undefined) {
            const object = prevConfig.find(({ curKey }) => curKey === CurKeyMap.Object);
            if (object) {
                object.dropDowns[0].type = val === 'bin-out' ? 'bin' : val === '1w-sens' ? '1w-sens' : 'obj';
            }
        }
        config.value = prevConfig;
    }
    checkConfigToSave();
    reRenderLayout();
}

function handleRadioBtnClick(configItemIndex: number, radioBtnsItemIndex: number, val: string) {
    if (!config.value) return;
    microLoading.value = true;
    const prevConfig = [...config.value];
    if (prevConfig[configItemIndex] && prevConfig[configItemIndex].radioBtns[radioBtnsItemIndex]) {
        prevConfig[configItemIndex].radioBtns[radioBtnsItemIndex].val = val;
        config.value = prevConfig;
    }
    checkConfigToSave();
    reRenderLayout();
}

function handleDropChange(configItemIndex: number, dropItemIndex: number, vals: number[]) {
    if (!config.value) return;
    microLoading.value = true;
    const prevConfig = [...config.value];
    if (prevConfig[configItemIndex] && prevConfig[configItemIndex].dropDowns[dropItemIndex]) {
        prevConfig[configItemIndex].dropDowns[dropItemIndex].vals = vals;
        config.value = prevConfig;
    }
    checkConfigToSave();
    reRenderLayout();
}

function handleCheckboxClick(
    configItemIndex: number,
    checkboxItemIndex: number,
    val: string,
    status: boolean,
    part: 1 | 2,
) {
    if (!config.value) return;
    microLoading.value = true;
    const prevConfig = [...config.value];
    if (prevConfig[configItemIndex] && prevConfig[configItemIndex].checkBoxes[checkboxItemIndex]) {
        if (status) {
            prevConfig[configItemIndex].checkBoxes[checkboxItemIndex][part].valsArr = [
                ...prevConfig[configItemIndex].checkBoxes[checkboxItemIndex][part].valsArr,
                val,
            ].sort();
        } else {
            prevConfig[configItemIndex].checkBoxes[checkboxItemIndex][part].valsArr = [
                ...prevConfig[configItemIndex].checkBoxes[checkboxItemIndex][part].valsArr.filter((el) => el !== val),
            ];
        }
        config.value = prevConfig;
    }
    checkConfigToSave();
    reRenderLayout();
}

function handleInput(configItemIndex: number, inputItemIndex: number, val: number) {
    if (!config.value) return;
    microLoading.value = true;
    const prevConfig = [...config.value];
    if (prevConfig[configItemIndex] && prevConfig[configItemIndex].inputs[inputItemIndex]) {
        prevConfig[configItemIndex].inputs[inputItemIndex].val = val;
        config.value = prevConfig;
    }
    checkConfigToSave();
    reRenderLayout();
}

function handleDropDownClick(configItemIndex: number, itemIndex: number) {
    if (!config.value) return;
    const item = config.value[configItemIndex].dropDowns[itemIndex];
    if (!item) return;
    shownDropDown.value = {
        type: item.type,
        realType: item.realType,
        items: item.items,
        vals: item.vals,
        configItemIndex: configItemIndex,
        itemIndex: itemIndex,
    };
}

function handleClickMultiSelect(item: DropDownItem) {
    if (!shownDropDown.value) return;

    const { type, vals } = shownDropDown.value;

    const isSelected = vals.includes(item.i);
    const isMiddleElement = isSelected && vals.includes(item.i - 1) && vals.includes(item.i + 1);
    const canSelect =
        (type === 'act' || type === 'cond') &&
        (vals.length === 0 ||
            vals.includes(item.i - 1) ||
            vals.includes(item.i + 1) ||
            (isSelected && vals.length === 1));

    if (canSelect) {
        if (isSelected && !isMiddleElement) {
            shownDropDown.value.vals = vals.filter((num) => num !== item.i).sort();
        } else if (!isSelected) {
            shownDropDown.value.vals = [...vals, item.i].sort();
        }
    } else {
        shownDropDown.value.vals = [item.i];
    }
}

async function get1W(ent: EntNum, device: number) {
    const OWConfig = configByAddr.value[device]['1-wire'];
    await getEntConfig(ent);
    const interfaces = ent === 1 ? interfaces1.value : ent === 2 ? interfaces2.value : interfaces3.value;

    OWConfig.forEach((item) => {
        if (item.mode !== 'off' && !interfaces.includes(`1w-${item.mode}`)) {
            interfaces.push(`1w-${item.mode}`);
        }
    });
}

async function getMb(ent: EntNum, device: number) {
    const data = await $apiGetMbInfo(device);
    const interfaces = ent === 1 ? interfaces1.value : ent === 2 ? interfaces2.value : interfaces3.value;

    const mbTypes = ['coil', 'ir', 'hr', 'di'];
    mbTypes.forEach((mbType) => {
        if (data.type.includes(mbType)) {
            interfaces.push('mb-var');
        }
    });

    if (interfaces.includes('mb-var')) {
        mbVarTypes.value = data.type;
    }
}

async function getDevConfig() {
    if (!config.value.length) isLoading.value = true;

    for (const device of devices.value) {
        if (['error', 'no-conn', 'off'].includes(device.state)) continue;
        const data = await $apiGetConfig(device.addr);
        configByAddr.value = {
            ...configByAddr.value,
            [device.addr]: data,
        };
    }

    const data = await $apiGetConfig(props.device?.addr);
    curConfigByAddr.value = data;
    cur1WConfig.value = data['1-wire'] as Mode1W[];
    curMbConfig.value = data['rs-485'] as ModeMb;
}

async function getEntConfig(ent: EntNum) {
    const data = curConfigByAddr.value;
    if (data) {
        const val = data['1-wire'] as Mode1W[];

        if (ent === 1) {
            ent1WConfig1.value = val;
        } else if (ent === 2) {
            ent1WConfig2.value = val;
        } else {
            ent1WConfig3.value = val;
        }
    } else {
        await new Promise((resolve) => setTimeout(resolve, isDev ? timeoutDev / 100 : 5));
        await getEntConfig(ent);
    }
}

async function getInterfaces(ent: EntNum, device: number) {
    const mainDevice = props.device?.addr || 0;
    const isNGC = mainDevice === 0;
    const deviceId = isNGC ? (device !== mainDevice ? device : mainDevice) : mainDevice;
    const capab = devCapabs.value[deviceId];
    if (!capab) return;
    curDevCapab.value = capab;

    const interfaces = ent === 1 ? interfaces1.value : ent === 2 ? interfaces2.value : interfaces3.value;

    for (let [typeCabap, quantityCapab] of Object.entries(capab) as [Interface, number][]) {
        const isValidType = quantityCapab && order.includes(typeCabap);

        if (isValidType && !typeCabap.includes('1w') && typeCabap !== 'mb-var') {
            interfaces.push(typeCabap);
        } else if (typeCabap.includes('1w')) {
            await get1W(ent, deviceId);
        } else if (typeCabap === 'mb-var' && curMbConfig.value?.[0]?.mode !== 'ext-devs') {
            await getMb(ent, deviceId);
        }
    }
}

async function getData(
    num: EntNum,
    type: DropDownRealType,
    quant: number,
    device?: number,
    bus?: number,
    isTime?: boolean,
    isMult?: boolean,
) {
    if (!curDevCapab.value) return;

    const body = createBodyState(type, quant, bus, device, props.device);
    const data = await $apiGetEntState(body);
    const arr: DropDownItem[] = [];

    let curLabels: string[] = [];
    const entLabels = [entLabels1.value, entLabels2.value, entLabels3.value];
    const udfTypes: UDF[] = ['udf-act', 'udf-cond', 'udf-trans', 'udf-trig'];
    const isUdf = udfTypes.some((t) => t === type);
    if (isUdf) {
        curLabels = entLabels[num - 1];
    } else {
        const addr = props.device ? (props.device.addr === 0 ? device || 0 : props.device.addr) : 0;
        const labelsVar = labels.value[addr]?.find((el) => el.interf === type)?.val[bus || 0]; //0-bus
        curLabels = (Array.isArray(labelsVar) ? labelsVar : []) as string[];
        if (type === 'mb-var') {
            const labelsWithMbType = labelsVar?.map((label, index) => {
                const t = mbVarTypes.value[index];
                const mbType = t === 'none' ? t : t === 'coil' ? t[0].toUpperCase() + t.slice(1) : t.toUpperCase();
                return `${mbType}: ${label}`;
            });
            curLabels = (Array.isArray(labelsWithMbType) ? labelsWithMbType : []) as string[];
        }
    }

    data.entities[0].state !== 'err' &&
        data.entities[0].state.forEach((el: number | null | (number | null)[], index: number) => {
            arr.push({ val: el, name: curLabels[index] || '', i: index });
        });

    const timeConfigMap = { 1: time1, 2: time2, 3: time3 };
    const entConfigMap = { 1: ent1, 2: ent2, 3: ent3 };

    if (isTime) {
        timeConfigMap[num].value = [...arr] as DropDownItem[];
    } else if (isMult) {
        multiSelect.value = [...arr] as DropDownItem[];
    } else {
        entConfigMap[num].value = [...arr];
    }
}

async function getLabels(num: EntNum, type: UDF) {
    const addr = props.device ? props.device.addr : 0;
    const reqLabels = await $apiReadFile(addr, type);
    if (!reqLabels) return;
    const labels = reqLabels === 'notFound' ? [] : reqLabels.labels;
    funcStore.setLabels(addr, type, labels);

    if (num === 1) {
        entLabels1.value = labels;
    } else if (num === 2) {
        entLabels2.value = labels;
    } else {
        entLabels3.value = labels;
    }
}

async function parseEntity(ent: Ent) {
    const entNum = ent1.value.length ? (ent2.value.length ? 3 : 2) : 1;

    const interfacesL = [interfaces1.value, interfaces2.value, interfaces3.value];
    const interfacesLength = interfacesL[entNum - 1].length;

    if (!interfacesLength && ent.device !== undefined) {
        await getInterfaces(entNum, ent.device);
    }

    const interfaces = [interfaces1.value, interfaces2.value, interfaces3.value];

    const invalidTypes = ['none', 'error', 'int-const'];
    if (!invalidTypes.includes(ent.type) && curDevCapab.value) {
        let quant = curDevCapab.value[ent.type as EntType];
        const addr = props.device && props.device.addr;
        const isValidUdfType = props.type.val === 'udf-act' || props.type.val === 'udf-cond';
        if (ent.device !== undefined && (addr || (!addr && isValidUdfType))) {
            const deviceId = addr === 0 ? ent.device : addr || ent.device;
            const capabs = devCapabs.value[deviceId];
            if (capabs) {
                quant = capabs[ent.type as EntType] || quant;
            }
        }

        if (ent.type !== 'prev-value') {
            await getData(entNum, ent.type as DropDownRealType, quant, ent.device, ent.bus);
        }
    }

    const udfTypes: UDF[] = ['udf-act', 'udf-cond', 'udf-trans', 'udf-trig'];
    const isUdf = udfTypes.some((t) => t === ent.type);
    const deviceAddr = props.device ? props.device.addr : 0;
    if (isUdf && !funcLabels.value[deviceAddr].find(({ name }) => name === ent.type)) {
        await getLabels(entNum, ent.type as UDF);
    }

    const device = ent.device || 0;
    const mainDevice = props.device?.addr || 0;
    const isNGC = mainDevice === 0;
    const deviceId = isNGC ? (device !== mainDevice ? device : mainDevice) : mainDevice;
    const owConfig = configByAddr.value[deviceId]['1-wire'];
    const mbConfig = configByAddr.value[deviceId]['rs-485'];

    const entItems = entNum === 1 ? ent1.value : entNum === 2 ? [...ent2.value] : [...ent3.value];

    return createEntityConfig(
        ent,
        props.type.val,
        interfaces[entNum - 1],
        owConfig,
        mbConfig,
        entItems,
        t,
        props.device,
    );
}

function getConstBtns(configTime?: Config, units = 'ms') {
    const val = configTime?.btns[0].val;
    return [
        {
            vals: [
                { label: t('btns.const'), val: 'tim-const' },
                { label: t('btns.timVar'), val: 'tim-var' },
            ],
            val: val || 'tim-const',
        },
        {
            vals: [
                { label: t('btns.ms'), val: 'ms', class: 'w-[66px] !px-2 !h-8' },
                { label: t('btns.s'), val: 's', class: 'w-[66px] !px-2 !h-8' },
                { label: t('btns.min'), val: 'min', class: 'w-[66px] !px-2 !h-8' },
            ],
            val: (val === 'tim-const' && configTime?.btns[1].val) || units,
            inline: true,
        },
    ];
}

function getVarBtns() {
    return [
        {
            vals: [
                { label: t('btns.const'), val: 'tim-const' },
                { label: t('btns.timVar'), val: 'tim-var' },
            ],
            val: 'tim-var',
        },
    ];
}

async function parseTime(time: Time, title: string, isEdit = false): Promise<Config[] | undefined> {
    const timeNum = time1.value.length ? (time2.value.length ? 3 : 2) : 1;
    if (!props.device || !curDevCapab.value) return;
    const isConst = time.type === 'tim-const';

    if (!isConst) {
        await getData(timeNum, 'tim-var', curDevCapab.value['tim-var'], props.device.addr, undefined, true);
    }

    let inputs: Input[] = [];
    let btns: Btn[] = getVarBtns();
    const configTime = getConfigTimeByTitle(title);

    if (isConst) {
        let s = time.value || 0;
        let newS = s;
        let units: 'ms' | 's' | 'min' = 'ms';

        if (isEdit) {
            if (s < 1000) {
                units = 'ms';
                newS = s;
            } else if (s >= 1000 && s % 60000 === 0) {
                units = 'min';
                newS = s / 60000;
            } else {
                units = 's';
                newS = s / 1000;
            }
        }

        btns = getConstBtns(configTime, units);
        inputs = [{ val: newS, isError: hasErrorTime(time, btns, newS), inline: true }];
    }

    const items = timeNum === 1 ? time1.value : timeNum === 2 ? [...time2.value] : [...time3.value];
    return [
        {
            curKey: configTime?.curKey || CurKeyMap.Time,
            queue: isConst
                ? [
                      { name: 'title', index: 0 },
                      { name: 'btns', index: 0 },
                      { name: 'input', index: 0 },
                      { name: 'btns', index: 1 },
                  ]
                : [
                      { name: 'title', index: 0 },
                      { name: 'btns', index: 0 },
                      { name: 'title', index: 1 },
                      { name: 'dropDown', index: 0 },
                  ],
            titles: isConst ? [title] : [title, t('titles.object')],
            btns,
            tabs: [],
            radioBtns: [],
            checkBoxes: [],
            inputs,
            dropDowns: isConst
                ? []
                : [
                      {
                          type: 'var',
                          realType: 'tim-var',
                          items,
                          vals: time.index !== undefined ? [time.index] : [],
                      },
                  ],
        },
    ];
}

function hasErrorTime(time: Time, btns: Btn[], newS: number): boolean {
    const postfix = btns[1]?.val || 'ms';
    const constRange = valuesConstRange.value.find((range) => range.interf === time.type + postfix);
    if (!constRange) return false;
    const { min, max } = constRange.values;
    return newS < min || newS > max;
}

function getConfigTimeByTitle(title: string): Config | undefined {
    switch (title) {
        case t('titles.during'): {
            return config.value.find((el) => el.curKey === CurKeyMap.Time);
        }
        case t('titles.delay'): {
            return config.value.find((el) => el.curKey === CurKeyMap.Delay);
        }
        case t('titles.pause'): {
            return config.value.find((el) => el.curKey === CurKeyMap.Pause);
        }
        case t('titles.minTime'): {
            return config.value.find((el) => el.curKey === CurKeyMap.MinTime);
        }
        case t('titles.maxTime'): {
            return config.value.find((el) => el.curKey === CurKeyMap.MaxTime);
        }
    }
}

async function parseMultiSelect(
    type: 'udf-act' | 'udf-cond',
    idx: number,
    quant: number,
    logic?: 'and' | 'or',
): Promise<Config[] | undefined> {
    if (!props.device || !curDevCapab.value) return;

    const addr = props.device ? props.device.addr : 0;
    await getLabels(1, type);
    await getData(1, type, curDevCapab.value[type], addr, undefined, false, true);

    const isAction = type === 'udf-act';
    return [
        {
            curKey: CurKeyMap.MultiSelect,
            queue: isAction
                ? [
                      { name: 'title', index: 0 },
                      { name: 'dropDown', index: 0 },
                  ]
                : [
                      { name: 'title', index: 0 },
                      { name: 'btns', index: 0 },
                      { name: 'dropDown', index: 0 },
                  ],
            titles: isAction ? [t('titles.selectActions')] : [t('titles.selectConditions')],
            btns: isAction
                ? []
                : [
                      {
                          vals: [
                              { label: t('btns.anyCond'), val: 'or' },
                              { label: t('btns.allCond'), val: 'and' },
                          ],
                          val: logic === 'or' ? 'or' : 'and',
                      },
                  ],
            tabs: [],
            radioBtns: [],
            checkBoxes: [],
            inputs: [],
            dropDowns: [
                {
                    type: isAction ? 'act' : 'cond',
                    realType: 'tim-var',
                    items: [...multiSelect.value].sort((el) => el.i),
                    vals: quant
                        ? [...multiSelect.value]
                              .sort((el) => el.i)
                              .map((el) => el.i)
                              .slice(idx, idx + quant)
                        : [],
                },
            ],
        },
    ];
}

async function setConfig(isEdit = false) {
    if (!curBody.value) return;

    const resultConfig = await createConfig(
        curBody.value,
        props.type.val,
        mbVarTypes.value,
        t,
        parseEntity,
        parseTime,
        parseMultiSelect,
        props.device,
        isEdit,
    );

    config.value = resultConfig.sort();
    maybeSetErrorInput();
    microLoading.value = false;
}

function maybeSetErrorInput() {
    inputError.value = false;
    config.value.forEach((config) => {
        config.inputs.forEach((input) => {
            if (input.isError) inputError.value = true;
        });
    });
    checkConfigToSave();
}

function configCreating() {
    const device = props.device?.addr || 0;
    curBody.value = getInitCurBody(props.type.val, device);
}

async function configEditing() {
    const data = await $apiGetUdfConfig(props.type.val, props.device ? props.device.addr : 0, props.index);

    if (!curBody.value) {
        curBody.value = data.trigger || data.condition || data.action || data.transform;
    }

    if (
        curBody.value?.value &&
        curBody.value.value.type === 'int-const' &&
        curBody.value?.entity &&
        analogyInterfaces.includes(curBody.value.entity.type) &&
        curBody.value.value.value
    ) {
        curBody.value = {
            ...curBody.value,
            value: {
                ...curBody.value.value,
                value: curBody.value.value.value / 100,
            },
        };
    }
    if (
        curBody.value?.['stop-val'] &&
        curBody.value['stop-val'].type === 'int-const' &&
        curBody.value?.entity &&
        analogyInterfaces.includes(curBody.value.entity.type) &&
        curBody.value['stop-val'].value
    ) {
        curBody.value = {
            ...curBody.value,
            'stop-val': {
                ...curBody.value['stop-val'],
                value: curBody.value['stop-val'].value / 100,
            },
        };
    }

    initConfig.value = JSON.stringify(config.value);
}

async function getConfig() {
    if (!config.value.length) isLoading.value = true;

    if (props.isCreating) {
        configCreating();
    } else {
        await configEditing();
    }

    await setConfig(true);
    checkConfigToSave();
    setTimeout(
        () => {
            isLoading.value = false;
        },
        isDev ? timeoutDev / 2.5 : 2000,
    );
}

onMounted(async () => {
    await getDevConfig();
    await getConfig();
});

const { t } = useI18n(translate);
</script>
