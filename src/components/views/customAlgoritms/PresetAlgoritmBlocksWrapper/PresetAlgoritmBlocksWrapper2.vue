<template>
    <div
        class="bg-[#0A2B47] rounded-[8px] flex-1"
        v-if="!isLoading"
    >
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
                        :isLast="!!(config && i === config.length - 1)"
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
                            (
                                checkboxItemIndex: number,
                                val: string,
                                status: boolean,
                                part: 1 | 2,
                            ) => {
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
                        @setInputError="
                            (inputItemIndex: number, res: boolean) => {
                                setInputError(i, inputItemIndex, res);
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
                class="w-[7.563rem]"
                @click="save"
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
                    handleDropChange(
                        shownDropDown ? shownDropDown.configItemIndex : 0,
                        0,
                        shownDropDown?.vals || [],
                    );
                    shownDropDown = undefined;
                }
            "
        >
            <template #title-icon>
                <span
                    v-if="shownDropDown.type === 'obj'"
                    v-html="object"
                ></span>
                <IButtonIcon
                    v-else-if="shownDropDown.type === 'bin'"
                    :class="
                        true
                            ? '[&>path]:fill-[#00D6AF] [&>rect]:fill-[#00D6AF]'
                            : '[&>path]:fill-[#5891C2] [&>rect]:fill-[#5891C2]'
                    "
                />
                <span
                    v-else-if="shownDropDown.type === '1w-sens'"
                    v-html="ow"
                ></span>
                <div
                    v-else
                    class="select-none w-[1.375rem] h-[1.375rem] rounded-[3px] border border-[#4C84B6] flex items-center justify-center text-[#4C84B6]"
                >
                    {{
                        shownDropDown.type === 'var'
                            ? 'П'
                            : shownDropDown.type === 'cond'
                            ? 'У'
                            : 'Д'
                    }}
                </div>
            </template>
            <template #title
                >{{ t('popUp.select') }}
                {{
                    shownDropDown.type === 'act'
                        ? t('popUp.actions')
                        : shownDropDown.type === 'cond'
                        ? 'popUp.conditions'
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
                            $event === undefined || $event === ''
                                ? (headerInput = '')
                                : (headerInput = $event)
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
                                v-for="(item, i) in shownDropDown.items.filter((el) =>
                                    el.name.includes(headerInput),
                                )"
                                :key="i"
                            >
                                <div
                                    class="w-full h-full px-[10px] flex items-center transition-colors duration-300 hover:bg-[#163E61]"
                                    :class="shownDropDown.vals.includes(i) ? 'bg-[#163E61]' : ''"
                                    @click="
                                        () => {
                                            if (
                                                (shownDropDown && shownDropDown.type === 'act') ||
                                                (shownDropDown && shownDropDown.type === 'cond')
                                            ) {
                                                const canSelect =
                                                    shownDropDown &&
                                                    (shownDropDown.vals.length === 0 ||
                                                        shownDropDown.vals.includes(item.i - 1) ||
                                                        shownDropDown.vals.includes(item.i + 1));

                                                if (canSelect) {
                                                    if (shownDropDown.vals.includes(item.i)) {
                                                        shownDropDown.vals = shownDropDown.vals
                                                            .filter((num) => num !== item.i)
                                                            .sort();
                                                    } else {
                                                        shownDropDown.vals = [
                                                            ...shownDropDown.vals,
                                                            item.i,
                                                        ].sort();
                                                    }
                                                } else {
                                                    shownDropDown.vals = [item.i];
                                                }
                                            } else if (shownDropDown) {
                                                shownDropDown.vals = [item.i];
                                            }
                                        }
                                    "
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
                                        {{ item.name || '&#8212' }}
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
                                                    ? `${
                                                          Math.round((item.val[0] as number) / 10) /
                                                          10
                                                      }°C`
                                                    : `${
                                                          (Math.round(
                                                              (item.val[0] as number) / 10,
                                                          ) /
                                                              10) *
                                                              1.8 +
                                                          32
                                                      }°F`
                                                : shownDropDown.realType === 'pwm-out' &&
                                                  typeof item.val === 'number'
                                                ? `${item.val / 100}%`
                                                : shownDropDown.realType === 'adc-in' &&
                                                  typeof item.val === 'number'
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
import type { Device } from '@/stores';
import spinner from '@/assets/img/spinner-inside-button.svg?raw';
import type { Body, Ent, Time } from '@/typings/funcs';
import { translate } from '@/locales/PresetAlgoritmBlocksWrapper';
import {
    Capab,
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
} from './types';
import {
    $apiGetDevCapab,
    $apiGetConfig,
    $apiGetEntState,
    $apiGetMbInfo,
    $apiGetUdfConfig,
    $apiReadFile,
    $apiSaveUdfConfig,
} from './api';
import { getInitCurBody } from './curBody';
import { createConfig } from './createConfig';
import { createParsedConfig } from './createParsedConfig';
import { createBodyState } from './createBodyState';
import { createObjByType } from './createUdfObj';

const funcStore = useFuncsStore();

const props = defineProps<{
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

const isSaveBtnDisabled = ref(true);

const initConfig = ref<string>();

const inputErrors = new Set();

const headerInput = ref('');

const shownDropDown = ref<DropDown>();

const curDevCapab = ref<Capab>();

const order = ORDER;

const cur1WConfig = ref<Mode1W[]>([]);
const curMbConfig = ref<ModeMb[]>([]);

const interfaces1 = ref<Interface[]>([]);
const interfaces2 = ref<Interface[]>([]);
const interfaces3 = ref<Interface[]>([]);

const config = ref<Config[]>([]);

let initBody = null;

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

function modifyTime(obj: any, timeConfig: any) {
    if (obj.time && obj.time.type === 'tim-const' && timeConfig) {
        const multiplier =
            timeConfig.btns[1].val === 'ms' ? 10 : timeConfig.btns[1].val === 's' ? 1000 : 60000;

        return {
            ...obj.time,
            value: obj.time.value * multiplier,
        };
    }
    return obj.time;
}

async function save() {
    isSaving.value = true;

    let body = {
        type: props.type.val,
        device: props.device ? props.device.addr : 0,
        index: props.index,
    };

    const obj = createObjByType(props.type.val, config.value, props.device);
    const timeConfig = config.value.find((el) => el.curKey === CurKeyMap.Time);
    const modifiedTime = {
        ...obj,
        time: modifyTime(obj, timeConfig),
    };

    if (props.type.val === 'udf-act') {
        body = Object.assign(body, { action: modifiedTime });
    } else if (props.type.val === 'udf-cond') {
        body = Object.assign(body, { condition: modifiedTime });
    } else if (props.type.val === 'udf-trans') {
        body = Object.assign(body, { transform: modifiedTime });
    } else {
        body = Object.assign(body, { trigger: modifiedTime });
    }

    await $apiSaveUdfConfig(body);
    isSaving.value = false;
    initConfig.value = JSON.stringify(config.value);
    isUpdating.value = false;
    emit('creatingFinish');
}

async function reRenderLayout(p: number) {
    if (isLoading.value) return;
    isUpdating.value = true;

    const obj = createObjByType(props.type.val, config.value, props.device);
    curBody.value = obj as Body;
    await setConfig();
}

function checkConfigToSave() {
    if (inputErrors.size) {
        isSaveBtnDisabled.value = true;
    } else {
        isSaveBtnDisabled.value = props.isCreating
            ? false
            : isUpdating.value
            ? false
            : initConfig.value === JSON.stringify(config.value);
    }
}

async function handleBtnClick(
    configItemIndex: number,
    btnsItemIndex: number,
    val: string | number,
) {
    if (!config.value) return;
    const prevConfig = [...config.value];
    if (prevConfig[configItemIndex] && prevConfig[configItemIndex].btns[btnsItemIndex]) {
        if (
            prevConfig[configItemIndex].curKey === CurKeyMap.Time &&
            (val === 'tim-var' || val === 'tim-const')
        ) {
            const time = await parseTime({ type: val }, t('titles.during'));
            if (time && time.length) {
                prevConfig[configItemIndex] = time[0];
            }
        }

        prevConfig[configItemIndex].btns[btnsItemIndex].val = val;
        config.value = prevConfig;
    }
    checkConfigToSave();
    reRenderLayout(1);
}

function handleTabClick(configItemIndex: number, tabsItemIndex: number, val: string | number) {
    if (!config.value) return;
    const prevConfig = [...config.value];
    if (prevConfig[configItemIndex] && prevConfig[configItemIndex].tabs[tabsItemIndex]) {
        prevConfig[configItemIndex].tabs[tabsItemIndex].val = val;
        const depInd = prevConfig[configItemIndex].tabs[tabsItemIndex].dependentDropDownIndex;
        if (depInd !== undefined) {
            const object = prevConfig.find(({ curKey }) => curKey === CurKeyMap.Object);
            if (object) {
                object.dropDowns[0].type =
                    val === 'bin-out' ? 'bin' : val === '1w-sens' ? '1w-sens' : 'obj';
            }
        }
        config.value = prevConfig;
    }
    checkConfigToSave();
    reRenderLayout(2);
}

function handleRadioBtnClick(configItemIndex: number, radioBtnsItemIndex: number, val: string) {
    if (!config.value) return;
    const prevConfig = [...config.value];
    if (prevConfig[configItemIndex] && prevConfig[configItemIndex].radioBtns[radioBtnsItemIndex]) {
        prevConfig[configItemIndex].radioBtns[radioBtnsItemIndex].val = val;
        config.value = prevConfig;
    }
    checkConfigToSave();
    reRenderLayout(3);
}

function handleDropChange(configItemIndex: number, dropItemIndex: number, vals: number[]) {
    if (!config.value) return;
    const prevConfig = [...config.value];
    if (prevConfig[configItemIndex] && prevConfig[configItemIndex].dropDowns[dropItemIndex]) {
        prevConfig[configItemIndex].dropDowns[dropItemIndex].vals = vals;
        config.value = prevConfig;
    }
    checkConfigToSave();
    reRenderLayout(4);
}

function handleCheckboxClick(
    configItemIndex: number,
    checkboxItemIndex: number,
    val: string,
    status: boolean,
    part: 1 | 2,
) {
    if (!config.value) return;
    const prevConfig = [...config.value];
    if (prevConfig[configItemIndex] && prevConfig[configItemIndex].checkBoxes[checkboxItemIndex]) {
        if (status) {
            prevConfig[configItemIndex].checkBoxes[checkboxItemIndex][part].valsArr = [
                ...prevConfig[configItemIndex].checkBoxes[checkboxItemIndex][part].valsArr,
                val,
            ].sort();
        } else {
            prevConfig[configItemIndex].checkBoxes[checkboxItemIndex][part].valsArr = [
                ...prevConfig[configItemIndex].checkBoxes[checkboxItemIndex][part].valsArr.filter(
                    (el) => el !== val,
                ),
            ];
        }
        config.value = prevConfig;
    }
    checkConfigToSave();
    reRenderLayout(5);
}

function handleInput(configItemIndex: number, inputItemIndex: number, val: number) {
    if (!config.value) return;
    const prevConfig = [...config.value];
    if (prevConfig[configItemIndex] && prevConfig[configItemIndex].inputs[inputItemIndex]) {
        prevConfig[configItemIndex].inputs[inputItemIndex].val = val;

        // todo write validate
        // if (prevConfig[configItemIndex].curKey === CurKeyMap.Time) {
        //     const [firstBtn, secondBtn] = prevConfig[configItemIndex].btns;
        //     const values =
        //         firstBtn.val === 'tim-const'
        //             ? valuesConstRange.value.find(
        //                   (obj) =>
        //                       obj.interf === (((firstBtn.val as string) + secondBtn.val) as string),
        //               )?.values
        //             : valuesConstRange.value.find((obj) => obj.interf === firstBtn.val)?.values;
        //
        //     if (prevConfig[configItemIndex].inputs[inputItemIndex]) {
        //         prevConfig[configItemIndex].inputs[inputItemIndex].min = values ? values.min : 0;
        //         prevConfig[configItemIndex].inputs[inputItemIndex].max = values
        //             ? values.max
        //             : 15000;
        //     }
        // }

        config.value = prevConfig;
    }
    checkConfigToSave();
    reRenderLayout(6);
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

function setInputError(configItemIndex: number, inputItemIndex: number, res: boolean) {
    if (res) {
        inputErrors.add(configItemIndex + '-' + inputItemIndex);
    } else {
        inputErrors.delete(configItemIndex + '-' + inputItemIndex);
    }
    if (!config.value) return;
    const prevConfig = [...config.value];
    if (prevConfig[configItemIndex] && prevConfig[configItemIndex].inputs[inputItemIndex]) {
        prevConfig[configItemIndex].inputs[inputItemIndex].isError = res;
        config.value = prevConfig;
    }
    checkConfigToSave();
    reRenderLayout(7);
}

async function get1W(ent: EntNum, device: number) {
    await getEntConfig(ent, device);
    const interfaces =
        ent === 1 ? interfaces1.value : ent === 2 ? interfaces2.value : interfaces3.value;
    const entConfig =
        ent === 1 ? ent1WConfig1.value : ent === 2 ? ent1WConfig2.value : ent1WConfig3.value;
    const configToUse = device ? cur1WConfig.value : entConfig;

    configToUse.forEach((item) => {
        if (item.mode !== 'off' && !interfaces.includes(`1w-${item.mode}`)) {
            interfaces.push(`1w-${item.mode}`);
        }
    });
}

async function getMb(ent: EntNum, device: number) {
    const data = await $apiGetMbInfo(device);
    const interfaces =
        ent === 1 ? interfaces1.value : ent === 2 ? interfaces2.value : interfaces3.value;

    const mbTypes = ['co', 'ir', 'hr', 'di']; // todo coil or co?
    mbTypes.forEach((mbType) => {
        if (data.type.includes(mbType)) {
            interfaces.push(`mb-${mbType}` as Interface);
        }
    });
}

async function getDevConfig() {
    const data = await $apiGetConfig(props.device?.addr);
    cur1WConfig.value = data['1-wire'] as Mode1W[];
    curMbConfig.value = data['rs-485'] as ModeMb[];
}

async function getEntConfig(ent: EntNum, device: number) {
    const data = await $apiGetConfig(device);
    const val = data['1-wire'] as { mode: 'off' | 'sens' | 'rom' | 'gpio' }[];

    if (ent === 1) {
        ent1WConfig1.value = val;
    } else if (ent === 2) {
        ent1WConfig2.value = val;
    } else {
        ent1WConfig3.value = val;
    }
}

async function getInterfaces(ent: EntNum, device: number) {
    const deviceId = device !== props.device?.addr ? device : 0;
    const capab = await $apiGetDevCapab(deviceId);
    curDevCapab.value = capab;

    const interfaces =
        ent === 1 ? interfaces1.value : ent === 2 ? interfaces2.value : interfaces3.value;

    for (let [typeCabap, quantityCapab] of Object.entries(capab)) {
        const isValidType = quantityCapab && order.includes(typeCabap);

        if (isValidType && !typeCabap.includes('1w') && typeCabap !== 'mb-var') {
            interfaces.push(typeCabap as Interface);
        } else if (typeCabap.includes('1w')) {
            await get1W(ent, device);
        } else if (typeCabap === 'mb-var') {
            await getMb(ent, device);
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
        const addr = props.device ? (props.device.addr === 0 ? device || 0 : 0) : 0;
        const labelsVar = labels.value[addr]?.find((el) => el.interf === type)?.val[bus || 0]; //0-bus
        curLabels = (Array.isArray(labelsVar) ? labelsVar : []) as string[];
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

    const ent1WConfigs = [ent1WConfig1.value, ent1WConfig2.value, ent1WConfig3.value];
    const interfaces = [interfaces1.value, interfaces2.value, interfaces3.value];

    const invalidTypes = ['none', 'error', 'int-const'];
    if (!invalidTypes.includes(ent.type) && curDevCapab.value) {
        // const ent1WConfigLength = ent1WConfigs[entNum - 1].length;

        // if (!ent1WConfigLength && ent.device !== undefined) {
        //    getEntConfig(entNum, ent.device);
        // }

        const mbTypes = ['mb-co', 'mb-ir', 'mb-hr', 'mb-di'];
        const keyCapab = mbTypes.includes(ent.type) ? 'mb-var' : (ent.type as EntType);
        let quant = curDevCapab.value[keyCapab];

        const hasPropsDevice = props.device && props.device.addr;
        const isValidUdfType = props.type.val === 'udf-act' || props.type.val === 'udf-cond';
        if (ent.device !== undefined && (hasPropsDevice || (!hasPropsDevice && isValidUdfType))) {
            const capabs = devCapabs.value[ent.device];
            if (capabs) {
                const isMb = mbTypes.includes(ent.type);
                const indexDevCapab = isMb ? 'mb-var' : (ent.type as EntType);
                quant = capabs[indexDevCapab] || quant;
            }
        }

        if (ent.type !== 'prev-val') {
            await getData(entNum, ent.type as DropDownRealType, quant, ent.device, ent.bus);
        }
    }

    const udfTypes: UDF[] = ['udf-act', 'udf-cond', 'udf-trans', 'udf-trig'];
    const isUdf = udfTypes.some((t) => t === ent.type);
    const deviceAddr = props.device ? props.device.addr : 0;
    if (isUdf && !funcLabels.value[deviceAddr].find(({ name }) => name === ent.type)) {
        await getLabels(entNum, ent.type as UDF);
    }

    const OWConfig =
        !props.device || props.device.addr === 0 ? ent1WConfigs[entNum - 1] : cur1WConfig.value;

    const entItems = entNum === 1 ? ent1.value : entNum === 2 ? [...ent2.value] : [...ent3.value];

    return createParsedConfig(
        ent.type,
        props.type.val,
        interfaces[entNum - 1],
        OWConfig,
        entItems,
        t,
        props.device,
        ent.bus,
        ent.device,
        ent.index,
    );
}

function getConstBtns() {
    const time = config.value.find((el) => el.curKey === CurKeyMap.Time);
    return [
        {
            vals: [
                { label: t('btns.const'), val: 'tim-const' },
                { label: t('btns.timVar'), val: 'tim-var' },
            ],
            val: time?.btns[0].val || 'tim-const',
        },
        {
            vals: [
                { label: t('btns.ms'), val: 'ms', class: 'w-[66px] !px-2 !h-8' },
                { label: t('btns.s'), val: 's', class: 'w-[66px] !px-2 !h-8' },
                { label: t('btns.min'), val: 'min', class: 'w-[66px] !px-2 !h-8' },
            ],
            val: time?.btns[1].val || 'ms',
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

async function parseTime(time: Time, title: string): Promise<Config[] | undefined> {
    const timeNum = time1.value.length ? (time2.value.length ? 3 : 2) : 1;
    if (!props.device || !curDevCapab.value) return;

    if (time.type === 'tim-var') {
        await getData(
            timeNum,
            'tim-var',
            curDevCapab.value['tim-var'],
            props.device.addr,
            undefined,
            true,
        );
    }

    const isConst = time.type === 'tim-const';
    return [
        {
            curKey: CurKeyMap.Time,
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
            btns: isConst ? getConstBtns() : getVarBtns(),
            tabs: [],
            radioBtns: [],
            checkBoxes: [],
            inputs: isConst ? [{ val: time.value || 0, min: 0, isError: false, inline: true }] : [],
            dropDowns: isConst
                ? []
                : [
                      {
                          type: 'var',
                          realType: 'tim-var',
                          items:
                              timeNum === 1
                                  ? time1.value
                                  : timeNum === 2
                                  ? [...time2.value]
                                  : [...time3.value],
                          vals: [],
                      },
                  ],
        },
    ];
}

async function parseMultiSelect(
    type: 'udf-act' | 'udf-cond',
    idx: number,
    quant: number,
    logic?: 'and' | 'or',
): Promise<Config[] | undefined> {
    if (!props.device || !curDevCapab.value) return;

    const addr = props.device ? props.device.addr : 0;
    if (!funcLabels.value[addr].find((el) => el.name === type)) {
        await getLabels(1, type);
    }

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
            titles: [t('titles.selectActions')],
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
            dropDowns: isAction
                ? [
                      {
                          type: 'act',
                          realType: 'tim-var',
                          items: [...multiSelect.value].sort((el) => el.i),
                          vals: quant
                              ? [...multiSelect.value]
                                    .sort((el) => el.i)
                                    .map((el) => el.i)
                                    .slice(idx, idx + quant)
                              : [],
                      },
                  ]
                : [
                      {
                          type: 'cond',
                          realType: 'tim-var',
                          items: [...multiSelect.value],
                          vals: [],
                      },
                  ],
        },
    ];
}

async function setConfig() {
    if (!curBody.value) return;

    const resultConfig = await createConfig(
        curBody.value,
        props.type.val,
        t,
        parseEntity,
        parseTime,
        parseMultiSelect,
        props.isCreating,
        props.device,
    );

    const sortedConfig = resultConfig.sort();
    config.value = sortedConfig;
}

function configCreating() {
    curBody.value = getInitCurBody(props.type.val);
    initBody = curBody.value;
}

async function configEditing() {
    const data = await $apiGetUdfConfig(
        props.type.val,
        props.device ? props.device.addr : 0,
        props.index,
    );

    if (!curBody.value) {
        curBody.value = data.trigger || data.condition || data.action || data.transform;
    }
    initBody = curBody.value;
    initConfig.value = JSON.stringify(config.value);
}

async function getConfig() {
    if (!config.value.length) isLoading.value = true;

    if (props.isCreating) {
        configCreating();
    } else {
        await configEditing();
    }

    await setConfig();
    checkConfigToSave();
    setTimeout(() => {
        isLoading.value = false;
    }, 4000);
}

onMounted(() => {
    getDevConfig();
    getConfig();
});

const { t } = useI18n(translate);
</script>
