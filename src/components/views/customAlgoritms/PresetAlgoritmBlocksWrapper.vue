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
                :is-disabled="isSaveBtnDisabled"
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
                                    @click="() => {
                                        if (shownDropDown.type === 'act' || shownDropDown.type === 'cond') {
                                            const canSelect = shownDropDown.vals.length === 0 ||
                                                shownDropDown.vals.includes(item.i - 1) ||
                                                shownDropDown.vals.includes(item.i + 1);

                                            if (canSelect) {
                                                if (shownDropDown.vals.includes(item.i)) {
                                                    shownDropDown.vals = shownDropDown.vals.filter(num => num !== item.i);
                                                } else {
                                                    shownDropDown.vals = [...shownDropDown.vals, item.i];
                                                }
                                            } else {
                                                shownDropDown.vals = [item.i];
                                            }
                                        } else {
                                            shownDropDown.vals = [item.i]
                                        }
                                    }"
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
import axios from 'axios';
import spinner from '@/assets/img/spinner-inside-button.svg?raw';
import type { Body, Ent, Time } from '@/typings/funcs';
import type { ControllerSettings } from '@/typings/settings';
const { readFile } = useReadWriteFiles();
import type { LabelsType } from '@/typings/files';

let configTimer: ReturnType<typeof setTimeout> | undefined;

const funcStore = useFuncsStore();

const props = defineProps<{
    type:
        | { label: 'triggers'; val: 'udf-trig' }
        | { label: 'conditions'; val: 'udf-cond' }
        | { label: 'actions'; val: 'udf-act' }
        | { label: 'transformations'; val: 'udf-trans' };
    device?: Device;
    index: number;
}>();

const indexStore = useIndexStore();

const { devices, labels, tempUnit, devCapabs } = storeToRefs(indexStore);
const { funcLabels } = storeToRefs(funcStore);

const api = indexStore.getApi().api as axios.AxiosInstance;
const isAborted = indexStore.getApi().isAborted;

const isSaving = ref(false);

const isLoading = ref(false);

const isSaveBtnDisabled = ref(true);

const initConfig = ref<string>();

const inputErrors = new Set();

const headerInput = ref('');

const shownDropDown = ref<{
    type: 'bin' | 'obj' | '1w-sens' | 'var' | 'act' | 'cond';
    realType:
        | '1w-rom'
        | '1w-sens'
        | '1w-gpio'
        | 'bin-in'
        | 'adc-in'
        | 'bin-out'
        | 'pwm-out'
        | 'mb-co'
        | 'mb-ir'
        | 'mb-hr'
        | 'mb-di'
        | 'bin-var'
        | 'int-var'
        | 'tim-var'
        | 'udf-act'
        | 'udf-cond'
        | 'udf-trans'
        | 'udf-trig';
    items: {
        val: number | null | (number | null)[];
        name: string;
        i: number;
    }[];
    vals: number[];
    configItemIndex: number;
    itemIndex: number;
}>();

const curDevCapab = ref<{
    '1w-gpio': number;
    '1w-rom': number;
    '1w-sens': number;
    'adc-in': number;
    'bin-in': number;
    'bin-out': number;
    'bin-var': number;
    'int-var': number;
    'mb-var': number;
    'pwm-out': number;
    'tim-var': number;
    'udf-act': number;
    'udf-cond': number;
    'udf-trans': number;
    'udf-trig': number;
}>();

const order = [
    '1w-rom',
    '1w-sens',
    'bin-in',
    'adc-in',
    'bin-out',
    'pwm-out',
    'mb-co',
    'mb-ir',
    'mb-hr',
    'mb-di',
    'bin-var',
    'int-var',
    'tim-var',
];

const curOWConfig = ref<{ mode: 'off' | 'sens' | 'rom' | 'gpio' }[]>([]);
const curMbConfig = ref<{ mode: 'off' | 'variables' }[]>([]);

const interfaces1 = ref<
    (
        | '1w-rom'
        | '1w-sens'
        | '1w-gpio'
        | 'bin-in'
        | 'adc-in'
        | 'bin-out'
        | 'pwm-out'
        | 'mb-co'
        | 'mb-ir'
        | 'mb-hr'
        | 'mb-di'
        | 'bin-var'
        | 'int-var'
        | 'tim-var'
    )[]
>([]);
const interfaces2 = ref<
    (
        | '1w-rom'
        | '1w-sens'
        | '1w-gpio'
        | 'bin-in'
        | 'adc-in'
        | 'bin-out'
        | 'pwm-out'
        | 'mb-co'
        | 'mb-ir'
        | 'mb-hr'
        | 'mb-di'
        | 'bin-var'
        | 'int-var'
        | 'tim-var'
    )[]
>([]);
const interfaces3 = ref<
    (
        | '1w-rom'
        | '1w-sens'
        | '1w-gpio'
        | 'bin-in'
        | 'adc-in'
        | 'bin-out'
        | 'pwm-out'
        | 'mb-co'
        | 'mb-ir'
        | 'mb-hr'
        | 'mb-di'
        | 'bin-var'
        | 'int-var'
        | 'tim-var'
    )[]
>([]);

type Config = {
    curKey: number;
    queue: {
        name: 'title' | 'btns' | 'tabs' | 'dropDown' | 'radioBtns' | 'input' | 'checkBox';
        index: number;
    }[];
    titles: string[];
    btns: {
        subtitle?: string;
        isGreen?: boolean;
        vals: { label: string | number; val: string | number; class?: string }[];
        val: string | number;
        inline?: boolean;
        disabled?: boolean;
    }[];
    tabs: {
        vals: { label: string; val: string | number }[];
        val: string | number;
        dependentDropDownIndex?: number;
    }[];
    radioBtns: {
        vals: { label: string; val: string }[];
        val: string;
        groupName: string;
        wrap?: boolean;
    }[];
    checkBoxes: {
        1: {
            title: string;
            vals: { label: string; val: string }[];
            valsArr: string[];
        };
        2: {
            title: string;
            vals: { label: string; val: string }[];
            valsArr: string[];
        };
    }[];
    inputs: {
        val: number;
        min: number;
        max?: number;
        subtitle?: string;
        isError: boolean;
        inline?: boolean;
    }[];
    dropDowns: {
        type: 'bin' | 'obj' | '1w-sens' | 'var' | 'act' | 'cond';
        realType:
            | '1w-rom'
            | '1w-sens'
            | '1w-gpio'
            | 'bin-in'
            | 'adc-in'
            | 'bin-out'
            | 'pwm-out'
            | 'mb-co'
            | 'mb-ir'
            | 'mb-hr'
            | 'mb-di'
            | 'bin-var'
            | 'int-var'
            | 'tim-var'
            | 'udf-act'
            | 'udf-cond'
            | 'udf-trans'
            | 'udf-trig';
        items: { val: number | null | (number | null)[]; name: string; i: number }[];
        vals: number[];
    }[];
};

const config = ref<Config[]>([]);

let initBody = null;

const curBody = ref<Body>();

const ent1 = ref<{ val: number | null | (number | null)[]; name: string; i: number }[]>([]);
const ent2 = ref<{ val: number | null | (number | null)[]; name: string; i: number }[]>([]);
const ent3 = ref<{ val: number | null | (number | null)[]; name: string; i: number }[]>([]);
const time1 = ref<{ val: number | null | (number | null)[]; name: string; i: number }[]>([]);
const time2 = ref<{ val: number | null | (number | null)[]; name: string; i: number }[]>([]);
const time3 = ref<{ val: number | null | (number | null)[]; name: string; i: number }[]>([]);
const multiSelect = ref<{ val: number | null | (number | null)[]; name: string; i: number }[]>([]);
const ent1Labels = ref<string[]>([]);
const ent2Labels = ref<string[]>([]);
const ent3Labels = ref<string[]>([]);
const ent1OWConfig = ref<{ mode: 'off' | 'sens' | 'rom' | 'gpio' }[]>([]);
const ent2OWConfig = ref<{ mode: 'off' | 'sens' | 'rom' | 'gpio' }[]>([]);
const ent3OWConfig = ref<{ mode: 'off' | 'sens' | 'rom' | 'gpio' }[]>([]);

async function save() {
    isSaving.value = true;
    let body = {
        type: props.type.val,
        device: props.device ? props.device.addr : 0,
        index: props.index,
    };
    if (props.type.val === 'udf-act') {
        let ent = {
            type: config.value.find((el) => el.curKey === 2)?.tabs[0].val,
            device: config.value.find((el) => el.curKey === 3)?.tabs[0].val,
            index: config.value.find((el) => el.curKey === 4)?.dropDowns[0].vals[0],
        };
        if (
            config.value.find((el) => el.curKey === 2)?.tabs[0].val === 'mb-var' ||
            config.value.find((el) => el.curKey === 2)?.tabs[0].val === '1w-rom' ||
            config.value.find((el) => el.curKey === 2)?.tabs[0].val === '1w-sens' ||
            config.value.find((el) => el.curKey === 2)?.tabs[0].val === '1w-gpio'
        ) {
            ent = Object.assign(
                ent,
                config.value.find((el) => el.curKey === 2)?.tabs[0].val === '1w-sens'
                    ? { bus: config.value.find((el) => el.curKey === 5)?.tabs[0].val, io: 0 }
                    : {
                          bus: config.value.find((el) => el.curKey === 5)?.tabs[0].val,
                      },
            );
        }
        let obj = {
            type: config.value.find((el) => el.curKey === 6)?.radioBtns[0].val,
            entity: ent,
            delay:
                config.value.find((el) => el.curKey === 29)?.btns[0].val === 'tim-var'
                    ? {
                          type: 'tim-var',
                          index: config.value.find((el) => el.curKey === 29)?.dropDowns[0].vals[0],
                      }
                    : {
                          type: 'tim-const',
                          value: config.value.find((el) => el.curKey === 29)?.inputs[0].val,
                      },
            'cond-idx': config.value.find((el) => el.curKey === 30)?.dropDowns[0].vals[0],
            'cond-qty': config.value.find((el) => el.curKey === 30)?.dropDowns[0].vals.length,
            'start-on-cond': config.value
                .find((el) => el.curKey === 31)
                ?.checkBoxes[0][1].valsArr.includes('conditionsOccur'),
            'cond-logic': config.value.find((el) => el.curKey === 30)?.btns[0].val,
            'init-state': config.value.find((el) => el.curKey === 1)?.btns[0].val === 'on' ? 1 : 0,
        };
        if (
            config.value.find((el) => el.curKey === 6)?.radioBtns[0].val === 'set' ||
            config.value.find((el) => el.curKey === 6)?.radioBtns[0].val === 'invert'
        ) {
            let ent = {};
            if (config.value.find((el) => el.curKey === 8)?.btns[0].val === 'obj') {
                ent = {
                    type: config.value.find((el) => el.curKey === 11)?.tabs[0].val,
                    device: config.value.find((el) => el.curKey === 12)?.tabs[0].val,
                    index: config.value.find((el) => el.curKey === 13)?.dropDowns[0].vals[0],
                };
                if (
                    config.value.find((el) => el.curKey === 11)?.tabs[0].val === 'mb-var' ||
                    config.value.find((el) => el.curKey === 11)?.tabs[0].val === '1w-rom' ||
                    config.value.find((el) => el.curKey === 11)?.tabs[0].val === '1w-sens' ||
                    config.value.find((el) => el.curKey === 11)?.tabs[0].val === '1w-gpio'
                ) {
                    ent = Object.assign(
                        ent,
                        config.value.find((el) => el.curKey === 11)?.tabs[0].val === '1w-sens'
                            ? {
                                  bus: config.value.find((el) => el.curKey === 14)?.tabs[0].val,
                                  io: 0,
                              }
                            : {
                                  bus: config.value.find((el) => el.curKey === 14)?.tabs[0].val,
                              },
                    );
                }
            } else {
                ent = {
                    type: 'int-const',
                    value: config.value.find((el) => el.curKey === 10)?.inputs[0].val,
                };
            }
            let stopVal = {};
            if (config.value.find((el) => el.curKey === 15)?.btns[0].val === 'obj') {
                stopVal = {
                    type: config.value.find((el) => el.curKey === 17)?.tabs[0].val,
                    device: config.value.find((el) => el.curKey === 18)?.tabs[0].val,
                    index: config.value.find((el) => el.curKey === 19)?.dropDowns[0].vals[0],
                };
                if (
                    config.value.find((el) => el.curKey === 17)?.tabs[0].val === 'mb-var' ||
                    config.value.find((el) => el.curKey === 17)?.tabs[0].val === '1w-rom' ||
                    config.value.find((el) => el.curKey === 17)?.tabs[0].val === '1w-sens' ||
                    config.value.find((el) => el.curKey === 17)?.tabs[0].val === '1w-gpio'
                ) {
                    stopVal = Object.assign(
                        stopVal,
                        config.value.find((el) => el.curKey === 17)?.tabs[0].val === '1w-sens'
                            ? {
                                  bus: config.value.find((el) => el.curKey === 20)?.tabs[0].val,
                                  io: 0,
                              }
                            : {
                                  bus: config.value.find((el) => el.curKey === 20)?.tabs[0].val,
                              },
                    );
                }
            } else if (config.value.find((el) => el.curKey === 15)?.btns[0].val === 'const') {
                stopVal = {
                    type: 'int-const',
                    value: config.value.find((el) => el.curKey === 16)?.inputs[0].val,
                };
            } else {
                stopVal = {
                    type: 'prev-val',
                };
            }
            const curObj = {
                value: ent,
                time:
                    config.value.find((el) => el.curKey === 28)?.btns[0].val === 'tim-var'
                        ? {
                              type: 'tim-var',
                              index: config.value.find((el) => el.curKey === 28)?.dropDowns[0]
                                  .vals[0],
                          }
                        : {
                              type: 'tim-const',
                              value: config.value.find((el) => el.curKey === 28)?.inputs[0].val,
                          },
                'stop-val': stopVal,
                'stop-on-trig': config.value
                    .find((el) => el.curKey === 31)
                    ?.checkBoxes[0][2].valsArr.includes('triggerNoMatches'),
                'stop-on-cond': config.value
                    .find((el) => el.curKey === 31)
                    ?.checkBoxes[0][2].valsArr.includes('conditionNoMatches'),
            };
            obj = Object.assign(obj, curObj);
        } else if (config.value.find((el) => el.curKey === 6)?.radioBtns[0].val === 'modify') {
            let ent = {};
            if (config.value.find((el) => el.curKey === 8)?.btns[0].val === 'obj') {
                ent = {
                    type: config.value.find((el) => el.curKey === 11)?.tabs[0].val,
                    device: config.value.find((el) => el.curKey === 12)?.tabs[0].val,
                    index: config.value.find((el) => el.curKey === 13)?.dropDowns[0].vals[0],
                };
                if (
                    config.value.find((el) => el.curKey === 11)?.tabs[0].val === 'mb-var' ||
                    config.value.find((el) => el.curKey === 11)?.tabs[0].val === '1w-rom' ||
                    config.value.find((el) => el.curKey === 11)?.tabs[0].val === '1w-sens' ||
                    config.value.find((el) => el.curKey === 11)?.tabs[0].val === '1w-gpio'
                ) {
                    ent = Object.assign(
                        ent,
                        config.value.find((el) => el.curKey === 11)?.tabs[0].val === '1w-sens'
                            ? {
                                  bus: config.value.find((el) => el.curKey === 14)?.tabs[0].val,
                                  io: 0,
                              }
                            : {
                                  bus: config.value.find((el) => el.curKey === 14)?.tabs[0].val,
                              },
                    );
                }
            } else {
                ent = {
                    type: 'int-const',
                    value:
                        config.value.find((el) => el.curKey === 7)?.radioBtns[0].val ===
                            'bin-equal' ||
                        config.value.find((el) => el.curKey === 7)?.radioBtns[0].val ===
                            'bin-not-equal'
                            ? config.value.find((el) => el.curKey === 9)?.btns[0].val
                            : config.value.find((el) => el.curKey === 10)?.inputs[0].val,
                };
            }
            let stopVal = {};
            if (config.value.find((el) => el.curKey === 15)?.btns[0].val === 'obj') {
                stopVal = {
                    type: config.value.find((el) => el.curKey === 17)?.tabs[0].val,
                    device: config.value.find((el) => el.curKey === 18)?.tabs[0].val,
                    index: config.value.find((el) => el.curKey === 19)?.dropDowns[0].vals[0],
                };
                if (
                    config.value.find((el) => el.curKey === 17)?.tabs[0].val === 'mb-var' ||
                    config.value.find((el) => el.curKey === 17)?.tabs[0].val === '1w-rom' ||
                    config.value.find((el) => el.curKey === 17)?.tabs[0].val === '1w-sens' ||
                    config.value.find((el) => el.curKey === 17)?.tabs[0].val === '1w-gpio'
                ) {
                    stopVal = Object.assign(
                        stopVal,
                        config.value.find((el) => el.curKey === 17)?.tabs[0].val === '1w-sens'
                            ? {
                                  bus: config.value.find((el) => el.curKey === 20)?.tabs[0].val,
                                  io: 0,
                              }
                            : {
                                  bus: config.value.find((el) => el.curKey === 20)?.tabs[0].val,
                              },
                    );
                }
            } else if (config.value.find((el) => el.curKey === 15)?.btns[0].val === 'const') {
                stopVal = {
                    type: 'int-const',
                    value: config.value.find((el) => el.curKey === 16)?.inputs[0].val,
                };
            } else {
                stopVal = {
                    type: 'prev-val',
                };
            }
            const curObj = {
                value: ent,
                time:
                    config.value.find((el) => el.curKey === 28)?.btns[0].val === 'tim-var'
                        ? {
                              type: 'tim-var',
                              index: config.value.find((el) => el.curKey === 28)?.dropDowns[0]
                                  .vals[0],
                          }
                        : {
                              type: 'tim-const',
                              value: config.value.find((el) => el.curKey === 28)?.inputs[0].val,
                          },
                'stop-val': stopVal,
                operation: config.value.find((el) => el.curKey === 7)?.radioBtns[0].val,
                unsigned: false,
                'stop-on-trig': config.value
                    .find((el) => el.curKey === 31)
                    ?.checkBoxes[0][2].valsArr.includes('triggerNoMatches'),
                'stop-on-cond': config.value.find((el) => el.curKey === 31),
            };
            obj = Object.assign(obj, curObj);
        } else if (config.value.find((el) => el.curKey === 6)?.radioBtns[0].val === 'change') {
            let ent = {};
            if (config.value.find((el) => el.curKey === 8)?.btns[0].val === 'obj') {
                ent = {
                    type: config.value.find((el) => el.curKey === 11)?.tabs[0].val,
                    device: config.value.find((el) => el.curKey === 12)?.tabs[0].val,
                    index: config.value.find((el) => el.curKey === 13)?.dropDowns[0].vals[0],
                };
                if (
                    config.value.find((el) => el.curKey === 11)?.tabs[0].val === 'mb-var' ||
                    config.value.find((el) => el.curKey === 11)?.tabs[0].val === '1w-rom' ||
                    config.value.find((el) => el.curKey === 11)?.tabs[0].val === '1w-sens' ||
                    config.value.find((el) => el.curKey === 11)?.tabs[0].val === '1w-gpio'
                ) {
                    ent = Object.assign(
                        ent,
                        config.value.find((el) => el.curKey === 11)?.tabs[0].val === '1w-sens'
                            ? {
                                  bus: config.value.find((el) => el.curKey === 14)?.tabs[0].val,
                                  io: 0,
                              }
                            : {
                                  bus: config.value.find((el) => el.curKey === 14)?.tabs[0].val,
                              },
                    );
                }
            } else {
                ent = {
                    type: 'int-const',
                    value:
                        config.value.find((el) => el.curKey === 7)?.radioBtns[0].val ===
                            'bin-equal' ||
                        config.value.find((el) => el.curKey === 7)?.radioBtns[0].val ===
                            'bin-not-equal'
                            ? config.value.find((el) => el.curKey === 9)?.btns[0].val
                            : config.value.find((el) => el.curKey === 10)?.inputs[0].val,
                };
            }
            const curObj = {
                value: ent,
                time:
                    config.value.find((el) => el.curKey === 28)?.btns[0].val === 'tim-var'
                        ? {
                              type: 'tim-var',
                              index: config.value.find((el) => el.curKey === 28)?.dropDowns[0]
                                  .vals[0],
                          }
                        : {
                              type: 'tim-const',
                              value: config.value.find((el) => el.curKey === 28)?.inputs[0].val,
                          },
                'stop-on-trig': config.value
                    .find((el) => el.curKey === 31)
                    ?.checkBoxes[0][2].valsArr.includes('triggerNoMatches'),
                'stop-on-cond': config.value.find((el) => el.curKey === 31),
            };
            obj = Object.assign(obj, curObj);
        } else if (config.value.find((el) => el.curKey === 6)?.radioBtns[0].val === 'cycle') {
            const curObj = {
                time:
                    config.value.find((el) => el.curKey === 28)?.btns[0].val === 'tim-var'
                        ? {
                              type: 'tim-var',
                              index: config.value.find((el) => el.curKey === 28)?.dropDowns[0]
                                  .vals[0],
                          }
                        : {
                              type: 'tim-const',
                              value: config.value.find((el) => el.curKey === 28)?.inputs[0].val,
                          },
                pause:
                    config.value.find((el) => el.curKey === 28)?.btns[0].val === 'tim-var'
                        ? {
                              type: 'tim-var',
                              index: config.value.find((el) => el.curKey === 28)?.dropDowns[0]
                                  .vals[0],
                          }
                        : {
                              type: 'tim-const',
                              value: config.value.find((el) => el.curKey === 28)?.inputs[0].val,
                          },
                direction: config.value.find((el) => el.curKey === 32)?.btns[1].val,
                infinite: config.value.find((el) => el.curKey === 32)?.btns[0].val === 'yes',
                'stop-on-trig': config.value
                    .find((el) => el.curKey === 31)
                    ?.checkBoxes[0][2].valsArr.includes('triggerNoMatches'),
                'stop-on-cond': config.value.find((el) => el.curKey === 31),
            };
            obj = Object.assign(obj, curObj);
        }
        body = Object.assign(body, { action: obj });
    } else if (props.type.val === 'udf-cond') {
        let ent = {
            type: config.value.find((el) => el.curKey === 2)?.tabs[0].val,
            device: config.value.find((el) => el.curKey === 3)?.tabs[0].val,
            index: config.value.find((el) => el.curKey === 4)?.dropDowns[0].vals[0],
        };
        if (
            config.value.find((el) => el.curKey === 2)?.tabs[0].val === 'mb-var' ||
            config.value.find((el) => el.curKey === 2)?.tabs[0].val === '1w-rom' ||
            config.value.find((el) => el.curKey === 2)?.tabs[0].val === '1w-sens' ||
            config.value.find((el) => el.curKey === 2)?.tabs[0].val === '1w-gpio'
        ) {
            ent = Object.assign(
                ent,
                config.value.find((el) => el.curKey === 2)?.tabs[0].val === '1w-sens'
                    ? { bus: config.value.find((el) => el.curKey === 5)?.tabs[0].val, io: 0 }
                    : {
                          bus: config.value.find((el) => el.curKey === 5)?.tabs[0].val,
                      },
            );
        }
        let val = {};
        if (config.value.find((el) => el.curKey === 8)?.btns[0].val === 'obj') {
            val = {
                type: config.value.find((el) => el.curKey === 11)?.tabs[0].val,
                device: config.value.find((el) => el.curKey === 12)?.tabs[0].val,
                index: config.value.find((el) => el.curKey === 13)?.dropDowns[0].vals[0],
            };
            if (
                config.value.find((el) => el.curKey === 11)?.tabs[0].val === 'mb-var' ||
                config.value.find((el) => el.curKey === 11)?.tabs[0].val === '1w-rom' ||
                config.value.find((el) => el.curKey === 11)?.tabs[0].val === '1w-sens' ||
                config.value.find((el) => el.curKey === 11)?.tabs[0].val === '1w-gpio'
            ) {
                val = Object.assign(
                    val,
                    config.value.find((el) => el.curKey === 11)?.tabs[0].val === '1w-sens'
                        ? {
                              bus: config.value.find((el) => el.curKey === 14)?.tabs[0].val,
                              io: 0,
                          }
                        : {
                              bus: config.value.find((el) => el.curKey === 14)?.tabs[0].val,
                          },
                );
            }
        } else {
            val = {
                type: 'int-const',
                value:
                    config.value.find((el) => el.curKey === 7)?.radioBtns[0].val === 'bin-equal' ||
                    config.value.find((el) => el.curKey === 7)?.radioBtns[0].val === 'bin-not-equal'
                        ? config.value.find((el) => el.curKey === 9)?.btns[0].val
                        : config.value.find((el) => el.curKey === 10)?.inputs[0].val,
            };
        }
        let obj = {
            operation: config.value.find((el) => el.curKey === 7)?.radioBtns[0].val,
            'init-state': config.value.find((el) => el.curKey === 1)?.btns[0].val === 'on' ? 1 : 0,
            entity: ent,
            value: val,
            time:
                config.value.find((el) => el.curKey === 28)?.btns[0].val === 'tim-var'
                    ? {
                          type: 'tim-var',
                          index: config.value.find((el) => el.curKey === 28)?.dropDowns[0].vals[0],
                      }
                    : {
                          type: 'tim-const',
                          value: config.value.find((el) => el.curKey === 28)?.inputs[0].val,
                      },
        };
        const operation = config.value.find((el) => el.curKey === 7)?.radioBtns[0].val;
        if (
            operation === 'less' ||
            operation === 'less-eq' ||
            operation === 'more' ||
            operation === 'more-eq' ||
            operation === 'equal' ||
            operation === 'not-equal'
        ) {
            obj = Object.assign(obj, {
                unsigned: false,
            });
        }
        body = Object.assign(body, { condition: obj });
    } else if (props.type.val === 'udf-trans') {
        let left = {
            type: config.value.find((el) => el.curKey === 2)?.tabs[0].val,
            device: config.value.find((el) => el.curKey === 3)?.tabs[0].val,
            index: config.value.find((el) => el.curKey === 4)?.dropDowns[0].vals[0],
        };
        if (
            config.value.find((el) => el.curKey === 2)?.tabs[0].val === 'mb-var' ||
            config.value.find((el) => el.curKey === 2)?.tabs[0].val === '1w-rom' ||
            config.value.find((el) => el.curKey === 2)?.tabs[0].val === '1w-sens' ||
            config.value.find((el) => el.curKey === 2)?.tabs[0].val === '1w-gpio'
        ) {
            left = Object.assign(
                left,
                config.value.find((el) => el.curKey === 2)?.tabs[0].val === '1w-sens'
                    ? { bus: config.value.find((el) => el.curKey === 5)?.tabs[0].val, io: 0 }
                    : {
                          bus: config.value.find((el) => el.curKey === 5)?.tabs[0].val,
                      },
            );
        }
        let right = {
            type: config.value.find((el) => el.curKey === 6)?.tabs[0].val,
            device: config.value.find((el) => el.curKey === 7)?.tabs[0].val,
            index: config.value.find((el) => el.curKey === 8)?.dropDowns[0].vals[0],
        };
        if (
            config.value.find((el) => el.curKey === 6)?.tabs[0].val === 'mb-var' ||
            config.value.find((el) => el.curKey === 6)?.tabs[0].val === '1w-rom' ||
            config.value.find((el) => el.curKey === 6)?.tabs[0].val === '1w-sens' ||
            config.value.find((el) => el.curKey === 6)?.tabs[0].val === '1w-gpio'
        ) {
            right = Object.assign(
                right,
                config.value.find((el) => el.curKey === 6)?.tabs[0].val === '1w-sens'
                    ? { bus: config.value.find((el) => el.curKey === 9)?.tabs[0].val, io: 0 }
                    : {
                          bus: config.value.find((el) => el.curKey === 9)?.tabs[0].val,
                      },
            );
        }
        let result = {
            type: config.value.find((el) => el.curKey === 10)?.tabs[0].val,
            device: config.value.find((el) => el.curKey === 11)?.tabs[0].val,
            index: config.value.find((el) => el.curKey === 12)?.dropDowns[0].vals[0],
        };
        if (
            config.value.find((el) => el.curKey === 10)?.tabs[0].val === 'mb-var' ||
            config.value.find((el) => el.curKey === 10)?.tabs[0].val === '1w-rom' ||
            config.value.find((el) => el.curKey === 10)?.tabs[0].val === '1w-sens' ||
            config.value.find((el) => el.curKey === 10)?.tabs[0].val === '1w-gpio'
        ) {
            result = Object.assign(
                result,
                config.value.find((el) => el.curKey === 10)?.tabs[0].val === '1w-sens'
                    ? { bus: config.value.find((el) => el.curKey === 13)?.tabs[0].val, io: 0 }
                    : {
                          bus: config.value.find((el) => el.curKey === 13)?.tabs[0].val,
                      },
            );
        }
        let obj = {
            'init-state': config.value.find((el) => el.curKey === 1)?.btns[0].val === 'on' ? 1 : 0,
            operation: config.value.find((el) => el.curKey === 7)?.radioBtns[0].val,
            left: left,
            right: right,
            result: result,
            unsigned: false,
        };
        body = Object.assign(body, { transform: obj });
    } else {
        let ent = {
            type: config.value.find((el) => el.curKey === 2)?.tabs[0].val,
            device: config.value.find((el) => el.curKey === 3)?.tabs[0].val,
            index: config.value.find((el) => el.curKey === 4)?.dropDowns[0].vals[0],
        };
        if (
            config.value.find((el) => el.curKey === 2)?.tabs[0].val === 'mb-var' ||
            config.value.find((el) => el.curKey === 2)?.tabs[0].val === '1w-rom' ||
            config.value.find((el) => el.curKey === 2)?.tabs[0].val === '1w-sens' ||
            config.value.find((el) => el.curKey === 2)?.tabs[0].val === '1w-gpio'
        ) {
            ent = Object.assign(
                ent,
                config.value.find((el) => el.curKey === 2)?.tabs[0].val === '1w-sens'
                    ? { bus: config.value.find((el) => el.curKey === 5)?.tabs[0].val, io: 0 }
                    : {
                          bus: config.value.find((el) => el.curKey === 5)?.tabs[0].val,
                      },
            );
        }
        let obj = {
            type: config.value.find((el) => el.curKey === 6)?.radioBtns[0].val,
            entity: ent,
            'act-idx': config.value.find((el) => el.curKey === 30)?.dropDowns[0].vals[0],
            'act-qty': config.value.find((el) => el.curKey === 30)?.dropDowns[0].vals.length,
            'init-state': config.value.find((el) => el.curKey === 1)?.btns[0].val === 'on' ? 1 : 0,
        };
        if (config.value.find((el) => el.curKey === 6)?.radioBtns[0].val === 'hold') {
            let ent = {};
            if (config.value.find((el) => el.curKey === 8)?.btns[0].val === 'obj') {
                ent = {
                    type: config.value.find((el) => el.curKey === 11)?.tabs[0].val,
                    device: config.value.find((el) => el.curKey === 12)?.tabs[0].val,
                    index: config.value.find((el) => el.curKey === 13)?.dropDowns[0].vals[0],
                };
                if (
                    config.value.find((el) => el.curKey === 11)?.tabs[0].val === 'mb-var' ||
                    config.value.find((el) => el.curKey === 11)?.tabs[0].val === '1w-rom' ||
                    config.value.find((el) => el.curKey === 11)?.tabs[0].val === '1w-sens' ||
                    config.value.find((el) => el.curKey === 11)?.tabs[0].val === '1w-gpio'
                ) {
                    ent = Object.assign(
                        ent,
                        config.value.find((el) => el.curKey === 11)?.tabs[0].val === '1w-sens'
                            ? {
                                  bus: config.value.find((el) => el.curKey === 14)?.tabs[0].val,
                                  io: 0,
                              }
                            : {
                                  bus: config.value.find((el) => el.curKey === 14)?.tabs[0].val,
                              },
                    );
                }
            } else {
                ent = {
                    type: 'int-const',
                    value: config.value.find((el) => el.curKey === 10)?.inputs[0].val,
                };
            }
            const curObj = {
                value: ent,
                unsigned: false,
                'min-time':
                    config.value.find((el) => el.curKey === 33)?.btns[0].val === 'tim-var'
                        ? {
                              type: 'tim-var',
                              index: config.value.find((el) => el.curKey === 33)?.dropDowns[0]
                                  .vals[0],
                          }
                        : {
                              type: 'tim-const',
                              value: config.value.find((el) => el.curKey === 33)?.inputs[0].val,
                          },
                'max-time':
                    config.value.find((el) => el.curKey === 34)?.btns[0].val === 'tim-var'
                        ? {
                              type: 'tim-var',
                              index: config.value.find((el) => el.curKey === 34)?.dropDowns[0]
                                  .vals[0],
                          }
                        : {
                              type: 'tim-const',
                              value: config.value.find((el) => el.curKey === 34)?.inputs[0].val,
                          },
            };
            obj = Object.assign(obj, curObj);
        } else if (config.value.find((el) => el.curKey === 6)?.radioBtns[0].val === 'compare') {
            let ent = {};
            if (config.value.find((el) => el.curKey === 8)?.btns[0].val === 'obj') {
                ent = {
                    type: config.value.find((el) => el.curKey === 11)?.tabs[0].val,
                    device: config.value.find((el) => el.curKey === 12)?.tabs[0].val,
                    index: config.value.find((el) => el.curKey === 13)?.dropDowns[0].vals[0],
                };
                if (
                    config.value.find((el) => el.curKey === 11)?.tabs[0].val === 'mb-var' ||
                    config.value.find((el) => el.curKey === 11)?.tabs[0].val === '1w-rom' ||
                    config.value.find((el) => el.curKey === 11)?.tabs[0].val === '1w-sens' ||
                    config.value.find((el) => el.curKey === 11)?.tabs[0].val === '1w-gpio'
                ) {
                    ent = Object.assign(
                        ent,
                        config.value.find((el) => el.curKey === 11)?.tabs[0].val === '1w-sens'
                            ? {
                                  bus: config.value.find((el) => el.curKey === 14)?.tabs[0].val,
                                  io: 0,
                              }
                            : {
                                  bus: config.value.find((el) => el.curKey === 14)?.tabs[0].val,
                              },
                    );
                }
            } else {
                ent = {
                    type: 'int-const',
                    value:
                        config.value.find((el) => el.curKey === 7)?.radioBtns[0].val ===
                            'bin-equal' ||
                        config.value.find((el) => el.curKey === 7)?.radioBtns[0].val ===
                            'bin-not-equal'
                            ? config.value.find((el) => el.curKey === 9)?.btns[0].val
                            : config.value.find((el) => el.curKey === 10)?.inputs[0].val,
                };
            }
            const curObj = {
                unsigned: false,
                operation: config.value.find((el) => el.curKey === 7)?.radioBtns[0].val,
                histeresis: 0,
                time:
                    config.value.find((el) => el.curKey === 28)?.btns[0].val === 'tim-var'
                        ? {
                              type: 'tim-var',
                              index: config.value.find((el) => el.curKey === 28)?.dropDowns[0]
                                  .vals[0],
                          }
                        : {
                              type: 'tim-const',
                              value: config.value.find((el) => el.curKey === 28)?.inputs[0].val,
                          },
            };
            obj = Object.assign(obj, curObj);
        } else {
            obj = Object.assign(obj, {
                time:
                    config.value.find((el) => el.curKey === 28)?.btns[0].val === 'tim-var'
                        ? {
                              type: 'tim-var',
                              index: config.value.find((el) => el.curKey === 28)?.dropDowns[0]
                                  .vals[0],
                          }
                        : {
                              type: 'tim-const',
                              value: config.value.find((el) => el.curKey === 28)?.inputs[0].val,
                          },
            });
        }
        body = Object.assign(body, { trigger: obj });
    }
    try {
        const r = await api.post('set_udf_cfg', body);
        isSaving.value = false;
        initConfig.value = JSON.stringify(config.value);
    } catch (error) {
        if (isAborted.value) {
            return;
        }
        setTimeout(() => {
            save();
        }, 5);
    }
}

function set() {
    if (props.type.val === 'udf-act') {
        let ent = {
            type: config.value.find((el) => el.curKey === 2)?.tabs[0].val,
            device: config.value.find((el) => el.curKey === 3)?.tabs[0].val,
            index: config.value.find((el) => el.curKey === 4)?.dropDowns[0].vals[0],
        };
        if (
            config.value.find((el) => el.curKey === 2)?.tabs[0].val === 'mb-var' ||
            config.value.find((el) => el.curKey === 2)?.tabs[0].val === '1w-rom' ||
            config.value.find((el) => el.curKey === 2)?.tabs[0].val === '1w-sens' ||
            config.value.find((el) => el.curKey === 2)?.tabs[0].val === '1w-gpio'
        ) {
            ent = Object.assign(
                ent,
                config.value.find((el) => el.curKey === 2)?.tabs[0].val === '1w-sens'
                    ? { bus: config.value.find((el) => el.curKey === 5)?.tabs[0].val, io: 0 }
                    : {
                          bus: config.value.find((el) => el.curKey === 5)?.tabs[0].val,
                      },
            );
        }
        let obj = {
            type: config.value.find((el) => el.curKey === 6)?.radioBtns[0].val,
            entity: ent,
            delay:
                config.value.find((el) => el.curKey === 29)?.btns[0].val === 'tim-var'
                    ? {
                          type: 'tim-var',
                          index: config.value.find((el) => el.curKey === 29)?.dropDowns[0].vals[0],
                      }
                    : {
                          type: 'tim-const',
                          value: config.value.find((el) => el.curKey === 29)?.inputs[0].val,
                      },
            'cond-idx': config.value.find((el) => el.curKey === 30)?.dropDowns[0].vals[0],
            'cond-qty': config.value.find((el) => el.curKey === 30)?.dropDowns[0].vals.length,
            'start-on-cond': config.value
                .find((el) => el.curKey === 31)
                ?.checkBoxes[0][1].valsArr.includes('conditionsOccur'),
            'cond-logic': config.value.find((el) => el.curKey === 30)?.btns[0].val,
            'init-state': config.value.find((el) => el.curKey === 1)?.btns[0].val === 'on' ? 1 : 0,
        };
        if (
            config.value.find((el) => el.curKey === 6)?.radioBtns[0].val === 'set' ||
            config.value.find((el) => el.curKey === 6)?.radioBtns[0].val === 'invert'
        ) {
            let ent = {};
            if (config.value.find((el) => el.curKey === 8)?.btns[0].val === 'obj') {
                ent = {
                    type: config.value.find((el) => el.curKey === 11)?.tabs[0].val,
                    device: config.value.find((el) => el.curKey === 12)?.tabs[0].val,
                    index: config.value.find((el) => el.curKey === 13)?.dropDowns[0].vals[0],
                };
                if (
                    config.value.find((el) => el.curKey === 11)?.tabs[0].val === 'mb-var' ||
                    config.value.find((el) => el.curKey === 11)?.tabs[0].val === '1w-rom' ||
                    config.value.find((el) => el.curKey === 11)?.tabs[0].val === '1w-sens' ||
                    config.value.find((el) => el.curKey === 11)?.tabs[0].val === '1w-gpio'
                ) {
                    ent = Object.assign(
                        ent,
                        config.value.find((el) => el.curKey === 11)?.tabs[0].val === '1w-sens'
                            ? {
                                  bus: config.value.find((el) => el.curKey === 14)?.tabs[0].val,
                                  io: 0,
                              }
                            : {
                                  bus: config.value.find((el) => el.curKey === 14)?.tabs[0].val,
                              },
                    );
                }
            } else {
                ent = {
                    type: 'int-const',
                    value: config.value.find((el) => el.curKey === 10)?.inputs[0].val,
                };
            }
            let stopVal = {};
            if (config.value.find((el) => el.curKey === 15)?.btns[0].val === 'obj') {
                stopVal = {
                    type: config.value.find((el) => el.curKey === 17)?.tabs[0].val,
                    device: config.value.find((el) => el.curKey === 18)?.tabs[0].val,
                    index: config.value.find((el) => el.curKey === 19)?.dropDowns[0].vals[0],
                };
                if (
                    config.value.find((el) => el.curKey === 17)?.tabs[0].val === 'mb-var' ||
                    config.value.find((el) => el.curKey === 17)?.tabs[0].val === '1w-rom' ||
                    config.value.find((el) => el.curKey === 17)?.tabs[0].val === '1w-sens' ||
                    config.value.find((el) => el.curKey === 17)?.tabs[0].val === '1w-gpio'
                ) {
                    stopVal = Object.assign(
                        stopVal,
                        config.value.find((el) => el.curKey === 17)?.tabs[0].val === '1w-sens'
                            ? {
                                  bus: config.value.find((el) => el.curKey === 20)?.tabs[0].val,
                                  io: 0,
                              }
                            : {
                                  bus: config.value.find((el) => el.curKey === 20)?.tabs[0].val,
                              },
                    );
                }
            } else if (config.value.find((el) => el.curKey === 15)?.btns[0].val === 'const') {
                stopVal = {
                    type: 'int-const',
                    value: config.value.find((el) => el.curKey === 16)?.inputs[0].val,
                };
            } else {
                stopVal = {
                    type: 'prev-val',
                };
            }
            const curObj = {
                value: ent,
                time:
                    config.value.find((el) => el.curKey === 28)?.btns[0].val === 'tim-var'
                        ? {
                              type: 'tim-var',
                              index: config.value.find((el) => el.curKey === 28)?.dropDowns[0]
                                  .vals[0],
                          }
                        : {
                              type: 'tim-const',
                              value: config.value.find((el) => el.curKey === 28)?.inputs[0].val,
                          },
                'stop-val': stopVal,
                'stop-on-trig': config.value
                    .find((el) => el.curKey === 31)
                    ?.checkBoxes[0][2].valsArr.includes('triggerNoMatches'),
                'stop-on-cond': config.value
                    .find((el) => el.curKey === 31)
                    ?.checkBoxes[0][2].valsArr.includes('conditionNoMatches'),
            };
            obj = Object.assign(obj, curObj);
        } else if (config.value.find((el) => el.curKey === 6)?.radioBtns[0].val === 'modify') {
            let ent = {};
            if (config.value.find((el) => el.curKey === 8)?.btns[0].val === 'obj') {
                ent = {
                    type: config.value.find((el) => el.curKey === 11)?.tabs[0].val,
                    device: config.value.find((el) => el.curKey === 12)?.tabs[0].val,
                    index: config.value.find((el) => el.curKey === 13)?.dropDowns[0].vals[0],
                };
                if (
                    config.value.find((el) => el.curKey === 11)?.tabs[0].val === 'mb-var' ||
                    config.value.find((el) => el.curKey === 11)?.tabs[0].val === '1w-rom' ||
                    config.value.find((el) => el.curKey === 11)?.tabs[0].val === '1w-sens' ||
                    config.value.find((el) => el.curKey === 11)?.tabs[0].val === '1w-gpio'
                ) {
                    ent = Object.assign(
                        ent,
                        config.value.find((el) => el.curKey === 11)?.tabs[0].val === '1w-sens'
                            ? {
                                  bus: config.value.find((el) => el.curKey === 14)?.tabs[0].val,
                                  io: 0,
                              }
                            : {
                                  bus: config.value.find((el) => el.curKey === 14)?.tabs[0].val,
                              },
                    );
                }
            } else {
                ent = {
                    type: 'int-const',
                    value:
                        config.value.find((el) => el.curKey === 7)?.radioBtns[0].val ===
                            'bin-equal' ||
                        config.value.find((el) => el.curKey === 7)?.radioBtns[0].val ===
                            'bin-not-equal'
                            ? config.value.find((el) => el.curKey === 9)?.btns[0].val
                            : config.value.find((el) => el.curKey === 10)?.inputs[0].val,
                };
            }
            let stopVal = {};
            if (config.value.find((el) => el.curKey === 15)?.btns[0].val === 'obj') {
                stopVal = {
                    type: config.value.find((el) => el.curKey === 17)?.tabs[0].val,
                    device: config.value.find((el) => el.curKey === 18)?.tabs[0].val,
                    index: config.value.find((el) => el.curKey === 19)?.dropDowns[0].vals[0],
                };
                if (
                    config.value.find((el) => el.curKey === 17)?.tabs[0].val === 'mb-var' ||
                    config.value.find((el) => el.curKey === 17)?.tabs[0].val === '1w-rom' ||
                    config.value.find((el) => el.curKey === 17)?.tabs[0].val === '1w-sens' ||
                    config.value.find((el) => el.curKey === 17)?.tabs[0].val === '1w-gpio'
                ) {
                    stopVal = Object.assign(
                        stopVal,
                        config.value.find((el) => el.curKey === 17)?.tabs[0].val === '1w-sens'
                            ? {
                                  bus: config.value.find((el) => el.curKey === 20)?.tabs[0].val,
                                  io: 0,
                              }
                            : {
                                  bus: config.value.find((el) => el.curKey === 20)?.tabs[0].val,
                              },
                    );
                }
            } else if (config.value.find((el) => el.curKey === 15)?.btns[0].val === 'const') {
                stopVal = {
                    type: 'int-const',
                    value: config.value.find((el) => el.curKey === 16)?.inputs[0].val,
                };
            } else {
                stopVal = {
                    type: 'prev-val',
                };
            }
            const curObj = {
                value: ent,
                time:
                    config.value.find((el) => el.curKey === 28)?.btns[0].val === 'tim-var'
                        ? {
                              type: 'tim-var',
                              index: config.value.find((el) => el.curKey === 28)?.dropDowns[0]
                                  .vals[0],
                          }
                        : {
                              type: 'tim-const',
                              value: config.value.find((el) => el.curKey === 28)?.inputs[0].val,
                          },
                'stop-val': stopVal,
                operation: config.value.find((el) => el.curKey === 7)?.radioBtns[0].val,
                unsigned: false,
                'stop-on-trig': config.value
                    .find((el) => el.curKey === 31)
                    ?.checkBoxes[0][2].valsArr.includes('triggerNoMatches'),
                'stop-on-cond': config.value.find((el) => el.curKey === 31),
            };
            obj = Object.assign(obj, curObj);
        } else if (config.value.find((el) => el.curKey === 6)?.radioBtns[0].val === 'change') {
            let ent = {};
            if (config.value.find((el) => el.curKey === 8)?.btns[0].val === 'obj') {
                ent = {
                    type: config.value.find((el) => el.curKey === 11)?.tabs[0].val,
                    device: config.value.find((el) => el.curKey === 12)?.tabs[0].val,
                    index: config.value.find((el) => el.curKey === 13)?.dropDowns[0].vals[0],
                };
                if (
                    config.value.find((el) => el.curKey === 11)?.tabs[0].val === 'mb-var' ||
                    config.value.find((el) => el.curKey === 11)?.tabs[0].val === '1w-rom' ||
                    config.value.find((el) => el.curKey === 11)?.tabs[0].val === '1w-sens' ||
                    config.value.find((el) => el.curKey === 11)?.tabs[0].val === '1w-gpio'
                ) {
                    ent = Object.assign(
                        ent,
                        config.value.find((el) => el.curKey === 11)?.tabs[0].val === '1w-sens'
                            ? {
                                  bus: config.value.find((el) => el.curKey === 14)?.tabs[0].val,
                                  io: 0,
                              }
                            : {
                                  bus: config.value.find((el) => el.curKey === 14)?.tabs[0].val,
                              },
                    );
                }
            } else {
                ent = {
                    type: 'int-const',
                    value:
                        config.value.find((el) => el.curKey === 7)?.radioBtns[0].val ===
                            'bin-equal' ||
                        config.value.find((el) => el.curKey === 7)?.radioBtns[0].val ===
                            'bin-not-equal'
                            ? config.value.find((el) => el.curKey === 9)?.btns[0].val
                            : config.value.find((el) => el.curKey === 10)?.inputs[0].val,
                };
            }
            const curObj = {
                value: ent,
                time:
                    config.value.find((el) => el.curKey === 28)?.btns[0].val === 'tim-var'
                        ? {
                              type: 'tim-var',
                              index: config.value.find((el) => el.curKey === 28)?.dropDowns[0]
                                  .vals[0],
                          }
                        : {
                              type: 'tim-const',
                              value: config.value.find((el) => el.curKey === 28)?.inputs[0].val,
                          },
                'stop-on-trig': config.value
                    .find((el) => el.curKey === 31)
                    ?.checkBoxes[0][2].valsArr.includes('triggerNoMatches'),
                'stop-on-cond': config.value.find((el) => el.curKey === 31),
            };
            obj = Object.assign(obj, curObj);
        } else if (config.value.find((el) => el.curKey === 6)?.radioBtns[0].val === 'cycle') {
            const curObj = {
                time:
                    config.value.find((el) => el.curKey === 28)?.btns[0].val === 'tim-var'
                        ? {
                              type: 'tim-var',
                              index: config.value.find((el) => el.curKey === 28)?.dropDowns[0]
                                  .vals[0],
                          }
                        : {
                              type: 'tim-const',
                              value: config.value.find((el) => el.curKey === 28)?.inputs[0].val,
                          },
                pause:
                    config.value.find((el) => el.curKey === 28)?.btns[0].val === 'tim-var'
                        ? {
                              type: 'tim-var',
                              index: config.value.find((el) => el.curKey === 28)?.dropDowns[0]
                                  .vals[0],
                          }
                        : {
                              type: 'tim-const',
                              value: config.value.find((el) => el.curKey === 28)?.inputs[0].val,
                          },
                direction: config.value.find((el) => el.curKey === 32)?.btns[1].val,
                infinite: config.value.find((el) => el.curKey === 32)?.btns[0].val === 'yes',
                'stop-on-trig': config.value
                    .find((el) => el.curKey === 31)
                    ?.checkBoxes[0][2].valsArr.includes('triggerNoMatches'),
                'stop-on-cond': config.value.find((el) => el.curKey === 31),
            };
            obj = Object.assign(obj, curObj);
        }
        curBody.value = obj as Body;
    } else if (props.type.val === 'udf-cond') {
        let ent = {
            type: config.value.find((el) => el.curKey === 2)?.tabs[0].val,
            device: config.value.find((el) => el.curKey === 3)?.tabs[0].val,
            index: config.value.find((el) => el.curKey === 4)?.dropDowns[0].vals[0],
        };
        if (
            config.value.find((el) => el.curKey === 2)?.tabs[0].val === 'mb-var' ||
            config.value.find((el) => el.curKey === 2)?.tabs[0].val === '1w-rom' ||
            config.value.find((el) => el.curKey === 2)?.tabs[0].val === '1w-sens' ||
            config.value.find((el) => el.curKey === 2)?.tabs[0].val === '1w-gpio'
        ) {
            ent = Object.assign(
                ent,
                config.value.find((el) => el.curKey === 2)?.tabs[0].val === '1w-sens'
                    ? { bus: config.value.find((el) => el.curKey === 5)?.tabs[0].val, io: 0 }
                    : {
                          bus: config.value.find((el) => el.curKey === 5)?.tabs[0].val,
                      },
            );
        }
        let val = {};
        if (config.value.find((el) => el.curKey === 8)?.btns[0].val === 'obj') {
            val = {
                type: config.value.find((el) => el.curKey === 11)?.tabs[0].val,
                device: config.value.find((el) => el.curKey === 12)?.tabs[0].val,
                index: config.value.find((el) => el.curKey === 13)?.dropDowns[0].vals[0],
            };
            if (
                config.value.find((el) => el.curKey === 11)?.tabs[0].val === 'mb-var' ||
                config.value.find((el) => el.curKey === 11)?.tabs[0].val === '1w-rom' ||
                config.value.find((el) => el.curKey === 11)?.tabs[0].val === '1w-sens' ||
                config.value.find((el) => el.curKey === 11)?.tabs[0].val === '1w-gpio'
            ) {
                val = Object.assign(
                    val,
                    config.value.find((el) => el.curKey === 11)?.tabs[0].val === '1w-sens'
                        ? {
                              bus: config.value.find((el) => el.curKey === 14)?.tabs[0].val,
                              io: 0,
                          }
                        : {
                              bus: config.value.find((el) => el.curKey === 14)?.tabs[0].val,
                          },
                );
            }
        } else {
            val = {
                type: 'int-const',
                value:
                    config.value.find((el) => el.curKey === 7)?.radioBtns[0].val === 'bin-equal' ||
                    config.value.find((el) => el.curKey === 7)?.radioBtns[0].val === 'bin-not-equal'
                        ? config.value.find((el) => el.curKey === 9)?.btns[0].val
                        : config.value.find((el) => el.curKey === 10)?.inputs[0].val,
            };
        }
        let obj = {
            operation: config.value.find((el) => el.curKey === 7)?.radioBtns[0].val,
            'init-state': config.value.find((el) => el.curKey === 1)?.btns[0].val === 'on' ? 1 : 0,
            entity: ent,
            value: val,
            time:
                config.value.find((el) => el.curKey === 28)?.btns[0].val === 'tim-var'
                    ? {
                          type: 'tim-var',
                          index: config.value.find((el) => el.curKey === 28)?.dropDowns[0].vals[0],
                      }
                    : {
                          type: 'tim-const',
                          value: config.value.find((el) => el.curKey === 28)?.inputs[0].val,
                      },
        };
        const operation = config.value.find((el) => el.curKey === 7)?.radioBtns[0].val;
        if (
            operation === 'less' ||
            operation === 'less-eq' ||
            operation === 'more' ||
            operation === 'more-eq' ||
            operation === 'equal' ||
            operation === 'not-equal'
        ) {
            obj = Object.assign(obj, {
                unsigned: false,
            });
        }
        curBody.value = obj as Body;
    } else if (props.type.val === 'udf-trans') {
        let left = {
            type: config.value.find((el) => el.curKey === 2)?.tabs[0].val,
            device: config.value.find((el) => el.curKey === 3)?.tabs[0].val,
            index: config.value.find((el) => el.curKey === 4)?.dropDowns[0].vals[0],
        };
        if (
            config.value.find((el) => el.curKey === 2)?.tabs[0].val === 'mb-var' ||
            config.value.find((el) => el.curKey === 2)?.tabs[0].val === '1w-rom' ||
            config.value.find((el) => el.curKey === 2)?.tabs[0].val === '1w-sens' ||
            config.value.find((el) => el.curKey === 2)?.tabs[0].val === '1w-gpio'
        ) {
            left = Object.assign(
                left,
                config.value.find((el) => el.curKey === 2)?.tabs[0].val === '1w-sens'
                    ? { bus: config.value.find((el) => el.curKey === 5)?.tabs[0].val, io: 0 }
                    : {
                          bus: config.value.find((el) => el.curKey === 5)?.tabs[0].val,
                      },
            );
        }
        let right = {
            type: config.value.find((el) => el.curKey === 6)?.tabs[0].val,
            device: config.value.find((el) => el.curKey === 7)?.tabs[0].val,
            index: config.value.find((el) => el.curKey === 8)?.dropDowns[0].vals[0],
        };
        if (
            config.value.find((el) => el.curKey === 6)?.tabs[0].val === 'mb-var' ||
            config.value.find((el) => el.curKey === 6)?.tabs[0].val === '1w-rom' ||
            config.value.find((el) => el.curKey === 6)?.tabs[0].val === '1w-sens' ||
            config.value.find((el) => el.curKey === 6)?.tabs[0].val === '1w-gpio'
        ) {
            right = Object.assign(
                right,
                config.value.find((el) => el.curKey === 6)?.tabs[0].val === '1w-sens'
                    ? { bus: config.value.find((el) => el.curKey === 9)?.tabs[0].val, io: 0 }
                    : {
                          bus: config.value.find((el) => el.curKey === 9)?.tabs[0].val,
                      },
            );
        }
        let result = {
            type: config.value.find((el) => el.curKey === 10)?.tabs[0].val,
            device: config.value.find((el) => el.curKey === 11)?.tabs[0].val,
            index: config.value.find((el) => el.curKey === 12)?.dropDowns[0].vals[0],
        };
        if (
            config.value.find((el) => el.curKey === 10)?.tabs[0].val === 'mb-var' ||
            config.value.find((el) => el.curKey === 10)?.tabs[0].val === '1w-rom' ||
            config.value.find((el) => el.curKey === 10)?.tabs[0].val === '1w-sens' ||
            config.value.find((el) => el.curKey === 10)?.tabs[0].val === '1w-gpio'
        ) {
            result = Object.assign(
                result,
                config.value.find((el) => el.curKey === 10)?.tabs[0].val === '1w-sens'
                    ? { bus: config.value.find((el) => el.curKey === 13)?.tabs[0].val, io: 0 }
                    : {
                          bus: config.value.find((el) => el.curKey === 13)?.tabs[0].val,
                      },
            );
        }
        let obj = {
            'init-state': config.value.find((el) => el.curKey === 1)?.btns[0].val === 'on' ? 1 : 0,
            operation: config.value.find((el) => el.curKey === 7)?.radioBtns[0].val,
            left: left,
            right: right,
            result: result,
            unsigned: false,
        };
        curBody.value = obj as Body;
    } else {
        let ent = {
            type: config.value.find((el) => el.curKey === 2)?.tabs[0].val,
            device: config.value.find((el) => el.curKey === 3)?.tabs[0].val,
            index: config.value.find((el) => el.curKey === 4)?.dropDowns[0].vals[0],
        };
        if (
            config.value.find((el) => el.curKey === 2)?.tabs[0].val === 'mb-var' ||
            config.value.find((el) => el.curKey === 2)?.tabs[0].val === '1w-rom' ||
            config.value.find((el) => el.curKey === 2)?.tabs[0].val === '1w-sens' ||
            config.value.find((el) => el.curKey === 2)?.tabs[0].val === '1w-gpio'
        ) {
            ent = Object.assign(
                ent,
                config.value.find((el) => el.curKey === 2)?.tabs[0].val === '1w-sens'
                    ? { bus: config.value.find((el) => el.curKey === 5)?.tabs[0].val, io: 0 }
                    : {
                          bus: config.value.find((el) => el.curKey === 5)?.tabs[0].val,
                      },
            );
        }
        let obj = {
            type: config.value.find((el) => el.curKey === 6)?.radioBtns[0].val,
            entity: ent,
            'act-idx': config.value.find((el) => el.curKey === 30)?.dropDowns[0].vals[0],
            'act-qty': config.value.find((el) => el.curKey === 30)?.dropDowns[0].vals.length,
            'init-state': config.value.find((el) => el.curKey === 1)?.btns[0].val === 'on' ? 1 : 0,
        };
        if (config.value.find((el) => el.curKey === 6)?.radioBtns[0].val === 'hold') {
            let ent = {};
            if (config.value.find((el) => el.curKey === 8)?.btns[0].val === 'obj') {
                ent = {
                    type: config.value.find((el) => el.curKey === 11)?.tabs[0].val,
                    device: config.value.find((el) => el.curKey === 12)?.tabs[0].val,
                    index: config.value.find((el) => el.curKey === 13)?.dropDowns[0].vals[0],
                };
                if (
                    config.value.find((el) => el.curKey === 11)?.tabs[0].val === 'mb-var' ||
                    config.value.find((el) => el.curKey === 11)?.tabs[0].val === '1w-rom' ||
                    config.value.find((el) => el.curKey === 11)?.tabs[0].val === '1w-sens' ||
                    config.value.find((el) => el.curKey === 11)?.tabs[0].val === '1w-gpio'
                ) {
                    ent = Object.assign(
                        ent,
                        config.value.find((el) => el.curKey === 11)?.tabs[0].val === '1w-sens'
                            ? {
                                  bus: config.value.find((el) => el.curKey === 14)?.tabs[0].val,
                                  io: 0,
                              }
                            : {
                                  bus: config.value.find((el) => el.curKey === 14)?.tabs[0].val,
                              },
                    );
                }
            } else {
                ent = {
                    type: 'int-const',
                    value: config.value.find((el) => el.curKey === 10)?.inputs[0].val,
                };
            }
            const curObj = {
                value: ent,
                unsigned: false,
                'min-time':
                    config.value.find((el) => el.curKey === 33)?.btns[0].val === 'tim-var'
                        ? {
                              type: 'tim-var',
                              index: config.value.find((el) => el.curKey === 33)?.dropDowns[0]
                                  .vals[0],
                          }
                        : {
                              type: 'tim-const',
                              value: config.value.find((el) => el.curKey === 33)?.inputs[0].val,
                          },
                'max-time':
                    config.value.find((el) => el.curKey === 34)?.btns[0].val === 'tim-var'
                        ? {
                              type: 'tim-var',
                              index: config.value.find((el) => el.curKey === 34)?.dropDowns[0]
                                  .vals[0],
                          }
                        : {
                              type: 'tim-const',
                              value: config.value.find((el) => el.curKey === 34)?.inputs[0].val,
                          },
            };
            obj = Object.assign(obj, curObj);
        } else if (config.value.find((el) => el.curKey === 6)?.radioBtns[0].val === 'compare') {
            let ent = {};
            if (config.value.find((el) => el.curKey === 8)?.btns[0].val === 'obj') {
                ent = {
                    type: config.value.find((el) => el.curKey === 11)?.tabs[0].val,
                    device: config.value.find((el) => el.curKey === 12)?.tabs[0].val,
                    index: config.value.find((el) => el.curKey === 13)?.dropDowns[0].vals[0],
                };
                if (
                    config.value.find((el) => el.curKey === 11)?.tabs[0].val === 'mb-var' ||
                    config.value.find((el) => el.curKey === 11)?.tabs[0].val === '1w-rom' ||
                    config.value.find((el) => el.curKey === 11)?.tabs[0].val === '1w-sens' ||
                    config.value.find((el) => el.curKey === 11)?.tabs[0].val === '1w-gpio'
                ) {
                    ent = Object.assign(
                        ent,
                        config.value.find((el) => el.curKey === 11)?.tabs[0].val === '1w-sens'
                            ? {
                                  bus: config.value.find((el) => el.curKey === 14)?.tabs[0].val,
                                  io: 0,
                              }
                            : {
                                  bus: config.value.find((el) => el.curKey === 14)?.tabs[0].val,
                              },
                    );
                }
            } else {
                ent = {
                    type: 'int-const',
                    value:
                        config.value.find((el) => el.curKey === 7)?.radioBtns[0].val ===
                            'bin-equal' ||
                        config.value.find((el) => el.curKey === 7)?.radioBtns[0].val ===
                            'bin-not-equal'
                            ? config.value.find((el) => el.curKey === 9)?.btns[0].val
                            : config.value.find((el) => el.curKey === 10)?.inputs[0].val,
                };
            }
            const curObj = {
                unsigned: false,
                operation: config.value.find((el) => el.curKey === 7)?.radioBtns[0].val,
                histeresis: 0,
                time:
                    config.value.find((el) => el.curKey === 28)?.btns[0].val === 'tim-var'
                        ? {
                              type: 'tim-var',
                              index: config.value.find((el) => el.curKey === 28)?.dropDowns[0]
                                  .vals[0],
                          }
                        : {
                              type: 'tim-const',
                              value: config.value.find((el) => el.curKey === 28)?.inputs[0].val,
                          },
            };
            obj = Object.assign(obj, curObj);
        } else {
            obj = Object.assign(obj, {
                time:
                    config.value.find((el) => el.curKey === 28)?.btns[0].val === 'tim-var'
                        ? {
                              type: 'tim-var',
                              index: config.value.find((el) => el.curKey === 28)?.dropDowns[0]
                                  .vals[0],
                          }
                        : {
                              type: 'tim-const',
                              value: config.value.find((el) => el.curKey === 28)?.inputs[0].val,
                          },
            });
        }
        curBody.value = obj as Body;
    }
}

function checkConfigToSave() {
    if (inputErrors.size) {
        isSaveBtnDisabled.value = true;
    } else {
        isSaveBtnDisabled.value = initConfig.value === JSON.stringify(config.value);
    }
}

function handleBtnClick(configItemIndex: number, btnsItemIndex: number, val: string | number) {
    if (!config.value) return;
    const prevConfig = [...config.value];
    if (prevConfig[configItemIndex] && prevConfig[configItemIndex].btns[btnsItemIndex]) {
        prevConfig[configItemIndex].btns[btnsItemIndex].val = val;
        config.value = prevConfig;
    }
    checkConfigToSave();
    set();
}

function handleTabClick(configItemIndex: number, tabsItemIndex: number, val: string | number) {
    if (!config.value) return;
    const prevConfig = [...config.value];
    if (prevConfig[configItemIndex] && prevConfig[configItemIndex].tabs[tabsItemIndex]) {
        prevConfig[configItemIndex].tabs[tabsItemIndex].val = val;
        const depInd = prevConfig[configItemIndex].tabs[tabsItemIndex].dependentDropDownIndex;
        if (depInd !== undefined) {
            prevConfig[depInd].dropDowns[0].type =
                val === 'bin-out' ? 'bin' : val === '1w-sens' ? '1w-sens' : 'obj';
        }
        config.value = prevConfig;
    }
    checkConfigToSave();
    set();
}

function handleRadioBtnClick(configItemIndex: number, radioBtnsItemIndex: number, val: string) {
    if (!config.value) return;
    const prevConfig = [...config.value];
    if (prevConfig[configItemIndex] && prevConfig[configItemIndex].radioBtns[radioBtnsItemIndex]) {
        prevConfig[configItemIndex].radioBtns[radioBtnsItemIndex].val = val;
        config.value = prevConfig;
    }
    checkConfigToSave();
    set();
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
    set();
}

function handleInput(configItemIndex: number, inputItemIndex: number, val: number) {
    if (!config.value) return;
    const prevConfig = [...config.value];
    if (prevConfig[configItemIndex] && prevConfig[configItemIndex].inputs[inputItemIndex]) {
        prevConfig[configItemIndex].inputs[inputItemIndex].val = val;
        config.value = prevConfig;
    }
    checkConfigToSave();
    set();
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
    set();
}

async function getOW(ent: 1 | 2 | 3, device: number) {
    if (device) {
        curOWConfig.value.forEach((item, index) => {
            if (
                item.mode !== 'off' &&
                !(
                    ent === 1
                        ? interfaces1.value
                        : ent === 2
                        ? interfaces2.value
                        : interfaces3.value
                ).includes(`1w-${item.mode}`)
            ) {
                (ent === 1
                    ? interfaces1.value
                    : ent === 2
                    ? interfaces2.value
                    : interfaces3.value
                ).push(`1w-${item.mode}`);
            }
        });
    } else {
        (ent === 1
            ? ent1OWConfig.value
            : ent === 2
            ? ent2OWConfig.value
            : ent3OWConfig.value
        ).forEach((item, index) => {
            if (
                item.mode !== 'off' &&
                !(
                    ent === 1
                        ? interfaces1.value
                        : ent === 2
                        ? interfaces2.value
                        : interfaces3.value
                ).includes(`1w-${item.mode}`)
            ) {
                (ent === 1
                    ? interfaces1.value
                    : ent === 2
                    ? interfaces2.value
                    : interfaces3.value
                ).push(`1w-${item.mode}`);
            }
        });
    }
}

async function getMb(ent: 1 | 2 | 3, device: number) {
    try {
        const r = await api.post('get_mb_info', {
            device: device,
            bus: 0,
        });
        if (r.data.type.includes('coil')) {
            (ent === 1
                ? interfaces1.value
                : ent === 2
                ? interfaces2.value
                : interfaces3.value
            ).push('mb-co');
        }
        if (r.data.type.includes('ir')) {
            (ent === 1
                ? interfaces1.value
                : ent === 2
                ? interfaces2.value
                : interfaces3.value
            ).push('mb-ir');
        }
        if (r.data.type.includes('hr')) {
            (ent === 1
                ? interfaces1.value
                : ent === 2
                ? interfaces2.value
                : interfaces3.value
            ).push('mb-hr');
        }
        if (r.data.type.includes('ir')) {
            (ent === 1
                ? interfaces1.value
                : ent === 2
                ? interfaces2.value
                : interfaces3.value
            ).push('mb-ir');
        }
    } catch (error) {
        if (isAborted.value) {
            return;
        }
        setTimeout(() => {
            getMb(ent, device);
        }, 5);
    }
}

async function getDevConfig() {
    try {
        if (props.device && props.device.addr) {
            const r = await api.post('get_ext_cfg', {
                device: props.device.addr,
            });
            curOWConfig.value = r.data['1-wire'] as { mode: 'off' | 'sens' | 'rom' | 'gpio' }[];
            curMbConfig.value = r.data['rs-485'] as { mode: 'off' | 'variables' }[];
        } else {
            const r = await api.get<ControllerSettings>('get_config');
            curOWConfig.value = r.data['1-wire'] as { mode: 'off' | 'sens' | 'rom' | 'gpio' }[];
            curMbConfig.value = r.data['rs-485'] as { mode: 'off' | 'variables' }[];
        }
    } catch (error) {
        if (isAborted.value) {
            return;
        }
        setTimeout(() => {
            getDevConfig();
        }, 5);
    }
}

async function getEntConfig(ent: 1 | 2 | 3, device: number) {
    if (!device) return;
    try {
        const r = await api.post('get_ext_cfg', {
            device: device,
        });
        const val = r.data['1-wire'] as { mode: 'off' | 'sens' | 'rom' | 'gpio' }[];
        if (ent === 1) {
            ent1OWConfig.value = val;
        } else if (ent === 2) {
            ent2OWConfig.value = val;
        } else {
            ent3OWConfig.value = val;
        }
    } catch (error) {
        if (isAborted.value) {
            return;
        }
        setTimeout(() => {
            getEntConfig(ent, device);
        }, 5);
    }
}

async function getInterfaces(ent: 1 | 2 | 3, device: number) {
    try {
        const r0: {
            data: {
                '1w-gpio': number;
                '1w-rom': number;
                '1w-sens': number;
                'adc-in': number;
                'bin-in': number;
                'bin-out': number;
                'bin-var': number;
                'int-var': number;
                'mb-var': number;
                'pwm-out': number;
                'tim-var': number;
                'udf-act': number;
                'udf-cond': number;
                'udf-trans': number;
                'udf-trig': number;
            };
        } = await api.post('get_dev_capab', {
            device: device,
        });
        if (!curDevCapab.value && device !== props.device?.addr) {
            const r1: {
                data: {
                    '1w-gpio': number;
                    '1w-rom': number;
                    '1w-sens': number;
                    'adc-in': number;
                    'bin-in': number;
                    'bin-out': number;
                    'bin-var': number;
                    'int-var': number;
                    'mb-var': number;
                    'pwm-out': number;
                    'tim-var': number;
                    'udf-act': number;
                    'udf-cond': number;
                    'udf-trans': number;
                    'udf-trig': number;
                };
            } = await api.post('get_dev_capab', {
                device: 0,
            });
            curDevCapab.value = r1.data;
        } else {
            curDevCapab.value = r0.data;
        }
        for (let obj of Object.entries(r0.data)) {
            if (obj[1] && order.includes(obj[0]) && !obj[0].includes('1w') && obj[0] !== 'mb-var') {
                (ent === 1
                    ? interfaces1.value
                    : ent === 2
                    ? interfaces2.value
                    : interfaces3.value
                ).push(
                    obj[0] as
                        | '1w-rom'
                        | '1w-sens'
                        | '1w-gpio'
                        | 'bin-in'
                        | 'adc-in'
                        | 'bin-out'
                        | 'pwm-out'
                        | 'mb-co'
                        | 'mb-ir'
                        | 'mb-hr'
                        | 'mb-di'
                        | 'bin-var'
                        | 'int-var'
                        | 'tim-var',
                );
            } else if (obj[0].includes('1w')) {
                getOW(ent, device);
            } else if (obj[0] === 'mb-var') {
                getMb(ent, device);
            }
        }
    } catch (error) {
        if (isAborted.value) {
            return;
        }
        setTimeout(() => {
            getInterfaces(ent, device);
        }, 5);
    }
}

async function getData(
    num: 1 | 2 | 3,
    type:
        | '1w-rom'
        | '1w-sens'
        | '1w-gpio'
        | 'bin-in'
        | 'adc-in'
        | 'bin-out'
        | 'pwm-out'
        | 'mb-co'
        | 'mb-ir'
        | 'mb-hr'
        | 'mb-di'
        | 'bin-var'
        | 'int-var'
        | 'tim-var'
        | 'udf-act'
        | 'udf-cond'
        | 'udf-trans'
        | 'udf-trig',
    quant: number,
    device?: number,
    bus?: number,
    isTime?: boolean,
    isMult?: boolean,
) {
    try {
        if (curDevCapab.value) {
            const body =
                bus === undefined
                    ? {
                          entities: [
                              {
                                  type: ['mb-co', 'mb-ir', 'mb-hr', 'mb-di'].includes(type)
                                      ? 'mb-var'
                                      : type,
                                  device: props.device
                                      ? props.device.addr === 0
                                          ? device || 0
                                          : 0
                                      : 0,
                                  index: 0,
                                  quantity: quant,
                              },
                          ],
                      }
                    : {
                          entities: [
                              {
                                  type: ['mb-co', 'mb-ir', 'mb-hr', 'mb-di'].includes(type)
                                      ? 'mb-var'
                                      : type,
                                  device: props.device
                                      ? props.device.addr === 0
                                          ? device || 0
                                          : props.device.addr
                                      : 0,
                                  index: 0,
                                  bus: bus || 0,
                                  quantity: quant,
                              },
                          ],
                      };

            const r = await api.post('get_ent_state', body);
            const arr: { val: number | null | (number | null)[]; name: string; i: number }[] = [];
            let curLabels: string[] = [];
            if (
                type === 'udf-act' ||
                type === 'udf-cond' ||
                type === 'udf-trans' ||
                type === 'udf-trig'
            ) {
                curLabels =
                    num === 1 ? ent1Labels.value : num === 2 ? ent2Labels.value : ent3Labels.value;
            } else {
                const labelsVar = labels.value[
                    props.device ? (props.device.addr === 0 ? device || 0 : 0) : 0
                ]?.find((el) => el.interf === type)?.val[bus || 0]; //0-bus
                curLabels = (Array.isArray(labelsVar) ? labelsVar : []) as string[];
            }
            r.data.entities[0].state.forEach(
                (el: number | null | (number | null)[], index: number) => {
                    arr.push({ val: el, name: curLabels[index] || '', i: index });
                },
            );
            if (isTime) {
                if (num === 1) {
                    time1.value = [...arr] as {
                        val: number | null | (number | null)[];
                        name: string;
                        i: number;
                    }[];
                } else if (num === 2) {
                    time2.value = [...arr] as {
                        val: number | null | (number | null)[];
                        name: string;
                        i: number;
                    }[];
                } else {
                    time3.value = [...arr] as {
                        val: number | null | (number | null)[];
                        name: string;
                        i: number;
                    }[];
                }
            } else if (isMult) {
                multiSelect.value = [...arr] as {
                    val: number | null | (number | null)[];
                    name: string;
                    i: number;
                }[];
            } else {
                if (num === 1) {
                    ent1.value = [...arr];
                } else if (num === 2) {
                    ent2.value = [...arr];
                } else {
                    ent3.value = [...arr];
                }
            }
        }
    } catch (error) {
        if (isAborted.value) {
            return;
        }
        setTimeout(() => {
            getData(num, type, quant, device, bus, isTime, isMult);
        }, 20);
    }
}

async function getLabels(num: 1 | 2 | 3, type: 'udf-act' | 'udf-cond' | 'udf-trans' | 'udf-trig') {
    const addr = props.device ? props.device.addr : 0;
    const reqLabels = await readFile({
        type: 'labels',
        interf: type,
        device: addr,
    });
    if (reqLabels === 'error') {
        return new Promise((resolve) =>
            setTimeout(() => {
                getLabels(num, type);
            }, 5),
        );
    } else if (reqLabels === 'notFound') {
        funcStore.setLabels(addr, type, []);
        if (num === 1) {
            ent1Labels.value = [];
        } else if (num === 2) {
            ent2Labels.value = [];
        } else {
            ent3Labels.value = [];
        }
    } else {
        const { labels } = reqLabels as LabelsType;
        funcStore.setLabels(addr, type, labels);
        if (num === 1) {
            ent1Labels.value = labels;
        } else if (num === 2) {
            ent2Labels.value = labels;
        } else {
            ent3Labels.value = labels;
        }
    }
}

function parseEntity(ent: Ent) {
    const entNum = ent1.value.length ? (ent2.value.length ? 3 : 2) : 1;
    if (!props.device || !curDevCapab.value) {
        setTimeout(() => {
            parseEntity(ent);
        }, 200);
    }
    if (
        !(entNum === 1
            ? interfaces1.value.length
            : entNum === 2
            ? interfaces2.value.length
            : interfaces3.value.length) &&
        ent.device !== undefined
    ) {
        getInterfaces(entNum, ent.device);
    }
    if (
        ent.type !== 'none' &&
        ent.type !== 'error' &&
        ent.type !== 'int-const' &&
        curDevCapab.value
    ) {
        if (
            !(entNum === 1
                ? ent1OWConfig.value.length
                : entNum === 2
                ? ent2OWConfig.value.length
                : ent3OWConfig.value.length) &&
            ent.device !== undefined
        ) {
            getEntConfig(entNum, ent.device);
        }
        let quant =
            curDevCapab.value[
                ['mb-co', 'mb-ir', 'mb-hr', 'mb-di'].includes(ent.type)
                    ? 'mb-var'
                    : (ent.type as
                          | '1w-gpio'
                          | '1w-rom'
                          | '1w-sens'
                          | 'adc-in'
                          | 'bin-in'
                          | 'bin-out'
                          | 'bin-var'
                          | 'int-var'
                          | 'mb-var'
                          | 'pwm-out'
                          | 'tim-var'
                          | 'udf-act'
                          | 'udf-cond'
                          | 'udf-trans'
                          | 'udf-trig')
            ];
        if (
            ent.device !== undefined &&
            ((props.device && props.device.addr) ||
                ((!props.device || !props.device.addr) &&
                    (props.type.val === 'udf-act' || props.type.val === 'udf-cond')))
        ) {
            const capabs = devCapabs.value[ent.device];
            let cur = quant;
            if (capabs) {
                cur =
                    capabs[
                        ent.type === 'mb-co' ||
                        ent.type === 'mb-ir' ||
                        ent.type === 'mb-hr' ||
                        ent.type === 'mb-di'
                            ? 'mb-var'
                            : (ent.type as
                                  | '1w-gpio'
                                  | '1w-rom'
                                  | '1w-sens'
                                  | 'adc-in'
                                  | 'bin-in'
                                  | 'bin-out'
                                  | 'bin-var'
                                  | 'int-var'
                                  | 'mb-var'
                                  | 'pwm-out'
                                  | 'tim-var'
                                  | 'udf-act'
                                  | 'udf-cond'
                                  | 'udf-trans'
                                  | 'udf-trig')
                    ];
            }
            quant = cur;
        }
        if (ent.type !== 'prev-val') {
            getData(entNum, ent.type, quant, ent.device, ent.bus);
        }
    }
    if (
        (ent.type === 'udf-act' ||
            ent.type === 'udf-cond' ||
            ent.type === 'udf-trans' ||
            ent.type === 'udf-trig') &&
        !funcLabels.value[props.device ? props.device.addr : 0].find((el) => el.name === ent.type)
    ) {
        getLabels(entNum, ent.type);
    }
    const res: Config[] = [];
    if (
        !['none', 'error', 'udf-trig', 'udf-cond', 'udf-act', 'udf-trans', 'int-const'].includes(
            ent.type,
        )
    ) {
        res.push({
            curKey: 2,
            queue: [
                { name: 'title', index: 0 },
                { name: 'tabs', index: 0 },
            ],
            titles: [
                props.type.val === 'udf-act'
                    ? t('titles.actInterf')
                    : props.type.val === 'udf-cond'
                    ? t('titles.condInterf')
                    : props.type.val === 'udf-trans'
                    ? t('titles.transInterf')
                    : t('titles.trigInterf'),
            ],
            btns: [],
            tabs: [
                {
                    vals: Array.from(
                        new Set(
                            entNum === 1
                                ? interfaces1.value
                                : entNum === 2
                                ? interfaces2.value
                                : interfaces3.value,
                        ),
                    )
                        .map((el) => {
                            return { val: el, label: t(`tabs.${el}`) };
                        })
                        .sort(function (a, b) {
                            return order.indexOf(a.val as string) - order.indexOf(b.val as string);
                        }),
                    val: ent.type as string,
                    dependentDropDownIndex: 3,
                },
            ],
            radioBtns: [],
            checkBoxes: [],
            inputs: [],
            dropDowns: [],
        });
    }
    if (ent.device !== undefined) {
        const devVals =
            (props.device && props.device.addr) ||
            ((!props.device || !props.device.addr) &&
                (props.type.val === 'udf-act' || props.type.val === 'udf-trans'))
                ? [
                      {
                          val: 0,
                          label: 'NGC',
                      },
                  ]
                : devices.value.map((el) => {
                      return { val: el.addr, label: el.addr ? `IO ${el.addr}` : 'NGC' };
                  });
        res.push({
            curKey: 3,
            queue: [
                { name: 'title', index: 0 },
                { name: 'tabs', index: 0 },
            ],
            titles: [
                props.type.val === 'udf-act'
                    ? t('titles.actDev')
                    : props.type.val === 'udf-cond'
                    ? t('titles.condDev')
                    : props.type.val === 'udf-trans'
                    ? t('titles.transDev')
                    : t('titles.trigDev'),
            ],
            btns: [],
            tabs: [
                {
                    vals: devVals,
                    val:
                        (props.device && props.device.addr) ||
                        ((!props.device || !props.device.addr) &&
                            (props.type.val === 'udf-act' || props.type.val === 'udf-trans'))
                            ? 0
                            : ent.device,
                },
            ],
            radioBtns: [],
            checkBoxes: [],
            inputs: [],
            dropDowns: [],
        });
    }
    if (ent.bus !== undefined && ent.device !== undefined) {
        const buses: {
            val: string;
            label: string;
        }[] = [];
        (!props.device || props.device.addr === 0
            ? entNum === 1
                ? ent1OWConfig.value
                : entNum === 2
                ? ent2OWConfig.value
                : ent3OWConfig.value
            : curOWConfig.value
        ).forEach((el, index) => {
            buses.push({ val: `${el.mode}${index}`, label: `${t('tabs.bus')}${index + 1}` });
        });
        res.push({
            curKey: 5,
            queue: [
                { name: 'title', index: 0 },
                { name: 'tabs', index: 0 },
            ],
            titles: [
                props.type.val === 'udf-act'
                    ? t('titles.actBus')
                    : props.type.val === 'udf-cond'
                    ? t('titles.condBus')
                    : props.type.val === 'udf-trans'
                    ? t('titles.transBus')
                    : t('titles.trigBus'),
            ],
            btns: [],
            tabs: [
                {
                    vals: buses
                        .filter((el) => el.val.slice(0, el.val.length - 1) === ent.type.slice(3))
                        .map((el) => {
                            return { val: el.val.slice(el.val.length - 1), label: el.label };
                        }),
                    val: ent.bus,
                },
            ],
            radioBtns: [],
            checkBoxes: [],
            inputs: [],
            dropDowns: [],
        });
    }

    if (
        ent.type !== 'none' &&
        ent.type !== 'error' &&
        ent.type !== 'int-const' &&
        ent.type !== 'prev-val'
    )
        res.push({
            curKey: 4,
            queue: [
                { name: 'title', index: 0 },
                { name: 'dropDown', index: 0 },
            ],
            titles: [
                props.type.val === 'udf-act'
                    ? t('titles.actObj')
                    : props.type.val === 'udf-cond'
                    ? t('titles.condObj')
                    : props.type.val === 'udf-trans'
                    ? t('titles.transObj')
                    : t('titles.trigObj'),
            ],
            btns: [],
            tabs: [],
            radioBtns: [],
            checkBoxes: [],
            inputs: [],
            dropDowns: [
                {
                    type:
                        ent.type === 'bin-out' || ent.type === 'bin-in'
                            ? 'bin'
                            : ent.type === '1w-sens'
                            ? '1w-sens'
                            : ent.type === 'adc-in' || ent.type === 'pwm-out'
                            ? 'obj'
                            : ent.type === 'udf-act'
                            ? 'act'
                            : ent.type === 'udf-cond'
                            ? 'cond'
                            : 'var',
                    realType: ent.type as
                        | 'mb-co'
                        | 'mb-ir'
                        | 'mb-hr'
                        | 'mb-di'
                        | 'bin-in'
                        | 'bin-out'
                        | 'adc-in'
                        | 'pwm-out'
                        | 'int-var'
                        | 'bin-var'
                        | 'tim-var'
                        | 'udf-trig'
                        | 'udf-cond'
                        | 'udf-act'
                        | 'udf-trans'
                        | '1w-rom'
                        | '1w-sens'
                        | '1w-gpio',
                    items:
                        entNum === 1
                            ? ent1.value
                            : entNum === 2
                            ? [...ent2.value]
                            : [...ent3.value],
                    vals: ent.index !== undefined ? [ent.index] : [],
                },
            ],
        });
    return res;
}

function parseTime(time: Time, title: string) {
    const timeNum = time1.value.length ? (time2.value.length ? 3 : 2) : 1;
    if (!props.device || !curDevCapab.value) return;
    if (time.type === 'tim-var')
        getData(
            timeNum,
            'tim-var',
            curDevCapab.value['tim-var'],
            props.device.addr,
            undefined,
            true,
        );
    const res: Config[] = [];
    if (time.type === 'tim-const') {
        res.push({
            curKey: 28,
            queue: [
                { name: 'title', index: 0 },
                { name: 'btns', index: 0 },
                { name: 'input', index: 0 },
                { name: 'btns', index: 1 },
            ],
            titles: [title],
            btns: [
                {
                    vals: [
                        { label: t('btns.const'), val: 'const' },
                        { label: t('btns.timVar'), val: 'tim-var' },
                    ],
                    val: 'const',
                },
                {
                    vals: [
                        { label: t('btns.ms'), val: 'ms', class: 'w-[66px] !px-2 !h-8' },
                        { label: t('btns.s'), val: 's', class: 'w-[66px] !px-2 !h-8' },
                        { label: t('btns.min'), val: 'min', class: 'w-[66px] !px-2 !h-8' },
                    ],
                    val: 'ms',
                    inline: true,
                },
            ],
            tabs: [],
            radioBtns: [],
            checkBoxes: [],
            inputs: [{ val: time.value || 0, min: 0, isError: false, inline: true }],
            dropDowns: [],
        });
    } else {
        res.push({
            curKey: 28,
            queue: [
                { name: 'title', index: 0 },
                { name: 'btns', index: 0 },
                { name: 'title', index: 1 },
                { name: 'dropDown', index: 0 },
            ],
            titles: [title, t('titles.object')],
            btns: [
                {
                    vals: [
                        { label: t('btns.const'), val: 'const' },
                        { label: t('btns.timVar'), val: 'tim-var' },
                    ],
                    val: 'tim-var',
                },
            ],
            tabs: [],
            radioBtns: [],
            checkBoxes: [],
            inputs: [],
            dropDowns: [
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
        });
    }
    return res;
}

function parseMultiSelect(
    type: 'udf-act' | 'udf-cond',
    idx: number,
    quant: number,
    logic?: 'and' | 'or',
) {
    if (!props.device || !curDevCapab.value) return;
    if (!funcLabels.value[props.device ? props.device.addr : 0].find((el) => el.name === type)) {
        getLabels(1, type);
    }
    getData(1, type, curDevCapab.value[type], props.device.addr, undefined, false, true);
    const res: Config[] = [];
    res.push(
        type === 'udf-act'
            ? {
                  curKey: 30,
                  queue: [
                      { name: 'title', index: 0 },
                      { name: 'dropDown', index: 0 },
                  ],
                  titles: [t('titles.selectActions')],
                  btns: [],
                  tabs: [],
                  radioBtns: [],
                  checkBoxes: [],
                  inputs: [],
                  dropDowns: [
                      {
                          type: 'act',
                          realType: 'tim-var',
                          items: [...multiSelect.value],
                          vals: quant
                              ? [...multiSelect.value]
                                    .map((el) => el.val as number)
                                    .slice(idx, idx + quant)
                              : [],
                      },
                  ],
              }
            : {
                  curKey: 30,
                  queue: [
                      { name: 'title', index: 0 },
                      { name: 'btns', index: 0 },
                      { name: 'dropDown', index: 0 },
                  ],
                  titles: [t('titles.selectActions')],
                  btns: [
                      {
                          vals: [
                              { label: t('btns.anyCond'), val: 'or' },
                              { label: t('btns.allCond'), val: 'all' },
                          ],
                          val: logic === 'or' ? 'or' : 'all',
                      },
                  ],
                  tabs: [],
                  radioBtns: [],
                  checkBoxes: [],
                  inputs: [],
                  dropDowns: [
                      {
                          type: 'cond',
                          realType: 'tim-var',
                          items: [...multiSelect.value],
                          vals: [],
                      },
                  ],
              },
    );
    return res;
}

function setConfig() {
    const res: Config[] = [];
    if (curBody.value) {
        if (curBody.value['init-state'] !== undefined) {
            res.push({
                curKey: 1,
                queue: [
                    { name: 'title', index: 0 },
                    { name: 'btns', index: 0 },
                ],
                titles: [t('titles.startStatus')],
                btns: [
                    {
                        isGreen: true,
                        vals: [
                            { label: t('btns.on'), val: 'on' },
                            { label: t('btns.off'), val: 'off' },
                        ],
                        val: curBody.value['init-state'] ? 'on' : 'off',
                    },
                ],
                tabs: [],
                radioBtns: [],
                checkBoxes: [],
                inputs: [],
                dropDowns: [],
            });
        }
        if (
            curBody.value['entity'] &&
            curBody.value.entity &&
            curBody.value.entity.type !== 'prev-val'
        ) {
            const val = parseEntity(curBody.value.entity);
            if (val) res.push(...val);
        }
        if (
            props.type.val === 'udf-trans' &&
            curBody.value['left'] &&
            curBody.value.left &&
            curBody.value.left.type !== 'prev-val'
        ) {
            const val = parseEntity(curBody.value.left);
            if (val) res.push(...val);
        }
        if (
            props.type.val === 'udf-trans' &&
            curBody.value['right'] &&
            curBody.value.right &&
            curBody.value.right.type !== 'prev-val'
        ) {
            const val = parseEntity(curBody.value.right)?.map((el) =>
                Object.assign(el, { curKey: el.curKey + 4 }),
            );
            if (val) res.push(...val);
        }
        if (
            props.type.val === 'udf-trans' &&
            curBody.value['result'] &&
            curBody.value.result &&
            curBody.value.result.type !== 'prev-val'
        ) {
            const val = parseEntity(curBody.value.result)?.map((el) =>
                Object.assign(el, { curKey: el.curKey + 8 }),
            );
            if (val) res.push(...val);
        }
        if (props.type.val === 'udf-trig' && curBody.value['type']) {
            res.push({
                curKey: 6,
                queue: [
                    { name: 'title', index: 0 },
                    { name: 'radioBtns', index: 0 },
                ],
                titles: [t('titles.triggerType')],
                btns: [],
                tabs: [],
                radioBtns: [
                    {
                        vals: [
                            { label: t('radioBtns.compare'), val: 'compare' },
                            { label: t('radioBtns.hold'), val: 'hold' },
                            { label: t('radioBtns.any'), val: 'any' },
                        ],
                        val: curBody.value['type'],
                        groupName: 'comparison',
                    },
                ],
                checkBoxes: [],
                inputs: [],
                dropDowns: [],
            });
        }
        if (
            (props.type.val === 'udf-trig' &&
                curBody.value['type'] === 'compare' &&
                curBody.value['operation']) ||
            (props.type.val === 'udf-cond' && curBody.value['operation'])
        ) {
            res.push({
                curKey: 7,
                queue: [
                    { name: 'title', index: 0 },
                    { name: 'radioBtns', index: 0 },
                ],
                titles: [t('titles.comparisonOperation')],
                btns: [],
                tabs: [],
                radioBtns: [
                    {
                        vals: [
                            { label: t('radioBtns.less'), val: 'less' },
                            { label: t('radioBtns.equal'), val: 'equal' },
                            { label: t('radioBtns.lessEqual'), val: 'less-eq' },
                            { label: t('radioBtns.notEqual'), val: 'not-equal' },
                            { label: t('radioBtns.more'), val: 'more' },
                            { label: t('radioBtns.binaryEqual'), val: 'bin-equal' },
                            { label: t('radioBtns.moreEqual'), val: 'more-eq' },
                            { label: t('radioBtns.error'), val: 'error' },
                            { label: t('radioBtns.binaryNotEqual'), val: 'bin-not-equal' },
                            { label: t('radioBtns.nonError'), val: 'non-error' },
                        ],
                        val: curBody.value['operation'],
                        groupName: 'less',
                        wrap: true,
                    },
                ],
                checkBoxes: [],
                inputs: [],
                dropDowns: [],
            });
        }
        if (props.type.val === 'udf-trans' && curBody.value['operation']) {
            res.push({
                curKey: 7,
                queue: [
                    { name: 'title', index: 0 },
                    { name: 'radioBtns', index: 0 },
                ],
                titles: [t('titles.comparisonOperation')],
                btns: [],
                tabs: [],
                radioBtns: [
                    {
                        vals: [
                            { label: '+', val: '+' },
                            { label: '/=', val: '/=' },
                            { label: '-', val: '-' },
                            { label: '&=', val: '&=' },
                            { label: '*', val: '*' },
                            { label: '|=', val: '|=' },
                            { label: '/', val: '/' },
                            { label: '~', val: '~' },
                            { label: '%', val: '%' },
                            { label: '!', val: '!' },
                            { label: '<<', val: '<<' },
                            { label: 'min', val: 'min' },
                            { label: '>>', val: '>>' },
                            { label: 'max', val: 'max' },
                            { label: '=', val: '=' },
                            { label: '%=', val: '%=' },
                            { label: '+=', val: '+=' },
                            { label: '&&', val: '&&' },
                            { label: '-=', val: '-=' },
                            { label: '<<=', val: '<<=' },
                            { label: '=-', val: '=-' },
                            { label: '||', val: '||' },
                            { label: '*=', val: '*=' },
                            { label: '>>=', val: '>>=' },
                        ],
                        val: curBody.value['operation'],
                        groupName: 'less',
                        wrap: true,
                    },
                ],
                checkBoxes: [],
                inputs: [],
                dropDowns: [],
            });
        }
        if (
            props.type.val === 'udf-act' &&
            curBody.value['type'] === 'modify' &&
            curBody.value['operation']
        ) {
            res.push({
                curKey: 7,
                queue: [
                    { name: 'title', index: 0 },
                    { name: 'radioBtns', index: 0 },
                ],
                titles: [t('titles.comparisonOperation')],
                btns: [],
                tabs: [],
                radioBtns: [
                    {
                        vals: [
                            { label: '=', val: '=' },
                            { label: '&=', val: '&=' },
                            { label: '+=', val: '+=' },
                            { label: '|=', val: '|=' },
                            { label: '-=', val: '-=' },
                            { label: '~', val: '~' },
                            { label: '=-', val: '=-' },
                            { label: '!', val: '!' },
                            { label: '*=', val: '*=' },
                            { label: 'min', val: 'min' },
                            { label: '/=', val: '/=' },
                            { label: 'max', val: 'max' },
                            { label: '%=', val: '%=' },
                            { label: '&&', val: '&&' },
                            { label: '<<=', val: '<<=' },
                            { label: '||', val: '||' },
                            { label: '>>=', val: '>>=' },
                        ],
                        val: curBody.value['operation'],
                        groupName: 'less',
                        wrap: true,
                    },
                ],
                checkBoxes: [],
                inputs: [],
                dropDowns: [],
            });
        }
        if (props.type.val === 'udf-act' && curBody.value['type'] !== undefined) {
            res.push({
                curKey: 6,
                queue: [
                    { name: 'title', index: 0 },
                    { name: 'radioBtns', index: 0 },
                ],
                titles: [t('titles.actionType')],
                btns: [],
                tabs: [],
                radioBtns: [
                    {
                        vals:
                            props.device && props.device.addr
                                ? [
                                      { label: t('radioBtns.set'), val: 'set' },
                                      { label: t('radioBtns.invert'), val: 'invert' },
                                      { label: 'modify', val: 'modify' },
                                      { label: 'change', val: 'change' },
                                      { label: t('radioBtns.cyclicChange'), val: 'cycle' },
                                      { label: t('radioBtns.stop'), val: 'stop' },
                                  ]
                                : [
                                      { label: t('radioBtns.set'), val: 'set' },
                                      { label: t('radioBtns.invert'), val: 'invert' },
                                      { label: 'modify', val: 'modify' },
                                      { label: 'change', val: 'change' },
                                      { label: t('radioBtns.cyclicChange'), val: 'cycle' },
                                      { label: t('radioBtns.stop'), val: 'stop' },
                                      { label: 'save', val: 'save' },
                                  ],
                        val: curBody.value['type'],
                        groupName: 'set',
                    },
                ],
                checkBoxes: [],
                inputs: [],
                dropDowns: [],
            });
        }
        if (curBody.value['value']) {
            res.push({
                curKey: 8,
                queue: [
                    { name: 'title', index: 0 },
                    { name: 'btns', index: 0 },
                ],
                titles: [t('titles.comparisonVal')],
                btns: [
                    {
                        vals: [
                            { label: t('btns.const'), val: 'const', class: 'w-[109px]' },
                            { label: t('btns.obj'), val: 'obj', class: 'w-[109px]' },
                        ],
                        val: curBody.value['value'].type === 'int-const' ? 'const' : 'obj',
                        disabled: true,
                    },
                ],
                tabs: [],
                radioBtns: [],
                checkBoxes: [],
                inputs: [],
                dropDowns: [],
            });
        }
        if (curBody.value['value'] && curBody.value['value']['type'] === 'int-const') {
            res.push(
                curBody.value['operation'] === 'bin-equal' ||
                    curBody.value['operation'] === 'bin-not-equal'
                    ? {
                          curKey: 9,
                          queue: [
                              { name: 'title', index: 0 },
                              { name: 'btns', index: 0 },
                          ],
                          titles: [t('titles.select')],
                          btns: [
                              {
                                  vals: [
                                      { label: 0, val: 0, class: 'w-[80px]' },
                                      { label: 1, val: 1, class: 'w-[80px]' },
                                  ],
                                  val: curBody.value['value'].value || 0,
                              },
                          ],
                          tabs: [],
                          radioBtns: [],
                          checkBoxes: [],
                          inputs: [],
                          dropDowns: [],
                      }
                    : {
                          curKey: 10,
                          queue: [
                              { name: 'title', index: 0 },
                              { name: 'input', index: 0 },
                          ],
                          titles: [t('titles.enter')],
                          btns: [],
                          tabs: [],
                          radioBtns: [],
                          checkBoxes: [],
                          inputs: [
                              {
                                  subtitle: t('titles.value'),
                                  val: curBody.value['value'].value || 0,
                                  min: -32768,
                                  max: 32767,
                                  isError: false,
                              },
                          ],
                          dropDowns: [],
                      },
            );
        }
        if (curBody.value['value'] && curBody.value['value']['type'] !== 'int-const') {
            if (curBody.value['value'] && curBody.value.entity) {
                const val = parseEntity(curBody.value.value)?.map((el) =>
                    Object.assign(el, { curKey: el.curKey + 9 }),
                );
                if (val) res.push(...val);
            }
        }
        if (props.type.val === 'udf-act' && curBody.value['stop-val']) {
            res.push({
                curKey: 15,
                queue: [
                    { name: 'title', index: 0 },
                    { name: 'btns', index: 0 },
                ],
                titles: [t('titles.stopValue')],
                btns: [
                    {
                        vals: [
                            { label: t('btns.prev'), val: 'prev', class: 'w-[109px]' },
                            { label: t('btns.const'), val: 'const', class: 'w-[109px]' },
                            { label: t('btns.obj'), val: 'obj' },
                        ],
                        val:
                            curBody.value['stop-val'].type === 'int-const'
                                ? 'const'
                                : curBody.value['stop-val'].type === 'prev-val'
                                ? 'prev'
                                : 'obj',
                    },
                ],
                tabs: [],
                radioBtns: [],
                checkBoxes: [],
                inputs: [],
                dropDowns: [],
            });
        }
        if (
            props.type.val === 'udf-act' &&
            curBody.value['stop-val'] &&
            curBody.value['stop-val']['type'] === 'int-const'
        ) {
            res.push({
                curKey: 16,
                queue: [
                    { name: 'title', index: 0 },
                    { name: 'input', index: 0 },
                ],
                titles: [t('titles.enter')],
                btns: [],
                tabs: [],
                radioBtns: [],
                checkBoxes: [],
                inputs: [
                    {
                        subtitle: t('titles.value'),
                        val: curBody.value['stop-val'].value || 0,
                        min: -32768,
                        max: 32767,
                        isError: false,
                    },
                ],
                dropDowns: [],
            });
        }
        if (
            props.type.val === 'udf-act' &&
            curBody.value['stop-val'] &&
            curBody.value['stop-val']['type'] !== 'int-const' &&
            curBody.value['stop-val']['type'] !== 'prev-val'
        ) {
            if (curBody.value['stop-val'] && curBody.value.entity) {
                const val = parseEntity(curBody.value['stop-val'])?.map((el) =>
                    Object.assign(el, { curKey: el.curKey + 15 }),
                );
                if (val) res.push(...val);
            }
        }
        if (props.type.val === 'udf-act' && curBody.value['value']) {
            res.push({
                curKey: 21,
                queue: [
                    { name: 'title', index: 0 },
                    { name: 'btns', index: 0 },
                ],
                titles: [t('titles.endValue')],
                btns: [
                    {
                        vals: [
                            { label: t('btns.prev'), val: 'prev', class: 'w-[109px]' },
                            { label: t('btns.const'), val: 'const', class: 'w-[109px]' },
                            { label: t('btns.obj'), val: 'obj' },
                        ],
                        val:
                            curBody.value['value'].type === 'int-const'
                                ? 'const'
                                : curBody.value['value'].type === 'prev-val'
                                ? 'prev'
                                : 'obj',
                    },
                ],
                tabs: [],
                radioBtns: [],
                checkBoxes: [],
                inputs: [],
                dropDowns: [],
            });
        }
        if (
            props.type.val === 'udf-act' &&
            curBody.value['value'] &&
            curBody.value['value']['type'] === 'int-const'
        ) {
            res.push(
                curBody.value['operation'] === 'bin-equal' ||
                    curBody.value['operation'] === 'bin-not-equal'
                    ? {
                          curKey: 22,
                          queue: [
                              { name: 'title', index: 0 },
                              { name: 'btns', index: 0 },
                          ],
                          titles: [t('titles.select')],
                          btns: [
                              {
                                  vals: [
                                      { label: 0, val: 0, class: 'w-[80px]' },
                                      { label: 1, val: 1, class: 'w-[80px]' },
                                  ],
                                  val: curBody.value['value'].value || 0,
                              },
                          ],
                          tabs: [],
                          radioBtns: [],
                          checkBoxes: [],
                          inputs: [],
                          dropDowns: [],
                      }
                    : {
                          curKey: 22,
                          queue: [
                              { name: 'title', index: 0 },
                              { name: 'input', index: 0 },
                          ],
                          titles: [t('titles.enter')],
                          btns: [],
                          tabs: [],
                          radioBtns: [],
                          checkBoxes: [],
                          inputs: [
                              {
                                  subtitle: t('titles.value'),
                                  val: curBody.value['value'].value || 0,
                                  min: -32768,
                                  max: 32767,
                                  isError: false,
                              },
                          ],
                          dropDowns: [],
                      },
            );
        }
        if (
            props.type.val === 'udf-act' &&
            curBody.value['value'] &&
            curBody.value['value']['type'] !== 'int-const' &&
            curBody.value['value']['type'] !== 'prev-val'
        ) {
            if (curBody.value['value'] && curBody.value.entity) {
                const val = parseEntity(curBody.value.value)?.map((el) =>
                    Object.assign(el, { curKey: el.curKey + 21 }),
                );
                if (val) res.push(...val);
            }
        }
        if (props.type.val === 'udf-trig' && curBody.value['hysteresis'] !== undefined) {
            res.push({
                curKey: 27,
                queue: [
                    { name: 'title', index: 0 },
                    { name: 'input', index: 0 },
                ],
                titles: [t('titles.hysteresis')],
                btns: [],
                tabs: [],
                radioBtns: [],
                checkBoxes: [],
                inputs: [
                    { val: curBody.value['hysteresis'], min: -32768, max: 32767, isError: false },
                ],
                dropDowns: [],
            });
        }
        if (curBody.value['time']) {
            const val = parseTime(curBody.value['time'], t('titles.during'));
            if (val) res.push(...val);
        }
        if (curBody.value['delay']) {
            const val = parseTime(curBody.value['delay'], t('titles.delay'))?.map((el) =>
                Object.assign(el, { curKey: 29 }),
            );
            if (val) res.push(...val);
        }
        if (curBody.value['time'] && curBody.value.type === 'cycle') {
            //TODO
            const val = parseTime(curBody.value['time'], t('titles.pause'))?.map((el) =>
                Object.assign(el, { curKey: 29 }),
            );
            if (val) res.push(...val);
        }
        if (
            props.type.val === 'udf-trig' &&
            curBody.value['act-idx'] !== undefined &&
            curBody.value['act-qty'] !== undefined
        ) {
            const val = parseMultiSelect(
                'udf-act',
                curBody.value['act-idx'],
                curBody.value['act-qty'],
            );
            if (val) res.push(...val);
        }
        if (
            props.type.val === 'udf-act' &&
            curBody.value['cond-idx'] !== undefined &&
            curBody.value['cond-qty'] !== undefined
        ) {
            const val = parseMultiSelect(
                'udf-cond',
                curBody.value['cond-idx'],
                curBody.value['cond-qty'],
                curBody.value['cond-logic'],
            );
            if (val) res.push(...val);
        }
        if (
            props.type.val === 'udf-act' &&
            curBody.value['start-on-cond'] !== undefined &&
            curBody.value['stop-on-trig'] !== undefined &&
            curBody.value['stop-on-cond'] !== undefined
        ) {
            const valArr1 = curBody.value['start-on-cond'] ? ['conditionsOccur'] : [];
            const valArr2 =
                curBody.value['stop-on-trig'] && curBody.value['stop-on-cond']
                    ? ['triggerNoMatches', 'conditionNoMatches']
                    : !curBody.value['stop-on-trig'] && !curBody.value['stop-on-cond']
                    ? []
                    : curBody.value['stop-on-trig']
                    ? ['triggerNoMatches']
                    : ['conditionNoMatches'];
            res.push({
                curKey: 31,
                queue: [{ name: 'checkBox', index: 0 }],
                titles: [],
                btns: [],
                tabs: [],
                radioBtns: [],
                checkBoxes: [
                    {
                        1: {
                            title: t('titles.startMode'),
                            vals: [
                                { label: t('checkBoxes.conditionsOccur'), val: 'conditionsOccur' },
                            ],
                            valsArr: valArr1,
                        },
                        2: {
                            title: t('titles.stop'),
                            vals: [
                                {
                                    label: t('checkBoxes.triggerNoMatches'),
                                    val: 'triggerNoMatches',
                                },
                                {
                                    label: t('checkBoxes.conditionNoMatches'),
                                    val: 'conditionNoMatches',
                                },
                            ],
                            valsArr: valArr2,
                        },
                    },
                ],
                inputs: [],
                dropDowns: [],
            });
        }
        if (
            props.type.val === 'udf-act' &&
            curBody.value.type === 'cycle' &&
            curBody.value['infinite'] !== undefined &&
            curBody.value['direction'] !== undefined
        ) {
            res.push({
                curKey: 32,
                queue: [
                    { name: 'title', index: 0 },
                    { name: 'btns', index: 0 },
                    { name: 'btns', index: 1 },
                ],
                titles: [t('titles.cyclicMode')],
                btns: [
                    {
                        subtitle: t('titles.infinite'),
                        vals: [
                            { label: t('btns.yes'), val: 'yes', class: 'w-[80px]' },
                            { label: t('btns.no'), val: 'no', class: 'w-[80px]' },
                        ],
                        val: curBody.value['infinite'] ? 'yes' : 'no',
                    },
                    {
                        subtitle: t('titles.initDir'),
                        vals: [
                            { label: t('btns.toMin'), val: 'to-min' },
                            { label: t('btns.toMax'), val: 'to-max' },
                        ],
                        val: curBody.value.direction as string,
                    },
                ],
                tabs: [],
                radioBtns: [],
                checkBoxes: [],
                inputs: [],
                dropDowns: [],
            });
        }
        if (curBody.value['min-time']) {
            const val = parseTime(curBody.value['min-time'], t('titles.minTime'))?.map((el) =>
                Object.assign(el, { curKey: el.curKey + 5 }),
            );
            if (val) res.push(...val);
        }
        if (curBody.value['max-time']) {
            const val = parseTime(curBody.value['max-time'], t('titles.maxTime'))?.map((el) =>
                Object.assign(el, { curKey: el.curKey + 6 }),
            );
            if (val) res.push(...val);
        }
    }
    config.value = res.sort();
    setTimeout(() => {
        setConfig();
    }, 2000);
}

async function getConfig(i: number = 0) {
    if (!config.value.length) isLoading.value = true;
    try {
        const r = await api.post('get_udf_cfg', {
            type: props.type.val,
            device: props.device ? props.device.addr : 0,
            index: props.index,
        });
        if (!curBody.value) {
            curBody.value = r.data.trigger || r.data.condition || r.data.action || r.data.transform;
        }
        initBody = curBody.value;
        if (i < 5) {
            setConfig();
        } else {
            if (!initConfig.value) {
                initConfig.value = JSON.stringify(config.value);
                checkConfigToSave();
            }
        }
        configTimer = setTimeout(() => {
            getConfig(i + 1);
            isLoading.value = false;
        }, 3000);
    } catch (error) {
        if (isAborted.value) {
            return;
        }
        setTimeout(() => {
            getConfig(i);
        }, 5);
    }
}

onMounted(() => {
    getDevConfig();
    getConfig();
});

onBeforeUnmount(() => {
    clearTimeout(configTimer);
    configTimer = undefined;
});

const { t } = useI18n({
    messages: {
        en: {
            titles: {
                startStatus: 'Status at system startup',
                trigInterf: 'Trigger Interface',
                actInterf: 'Action Interface',
                condInterf: 'Condition Interface',
                transInterf: 'Transform Interface',
                actDev: 'Action device',
                condDev: 'Condition device',
                transDev: 'Transform device',
                trigDev: 'Trigger device',
                actObj: 'Action object',
                condObj: 'Condition object',
                transObj: 'Transform object',
                trigObj: 'Trigger object',
                actBus: 'Action digital bus number',
                condBus: 'Condition digital bus number',
                transBus: 'Transform digital bus number',
                trigBus: 'Trigger digital bus number',
                triggerType: 'Trigger type',
                comparisonOperation: 'Comparison operation',
                comparisonVal: 'Comparison value',
                enter: 'Enter',
                select: 'Select',
                comparisonObjInterf: 'Comparison object interface',
                comparisonDevStatus: 'Device structure for comparison',
                comparisonObjBus: 'Digital bus number of the object for comparison',
                compareObj: 'Object to compare',
                hysteresis: 'Hysteresis',
                during: 'During',
                minTime: 'Min time',
                maxTime: 'Max time',
                device: 'Device',
                object: 'Object',
                selectActions: 'Select actions',
                actionType: 'Action type',
                value: 'Value',
                endValue: 'End value',
                stopValue: 'Stop value',
                selectConditions: 'Select conditions',
                startMode: 'Startup mode',
                stop: 'Stop',
                cyclicMode: 'Cyclic operation mode',
                operation: 'Operation',
                infinite: 'Infinite',
                initDir: 'Initial direction',
                delay: 'Delay',
                pause: 'Pause',
            },
            btns: {
                on: 'ON',
                off: 'OFF',
                const: 'CONSTANT',
                obj: 'OBJECT',
                timVar: 'TIME VARIABLE',
                ms: 'x10 MS',
                s: 'x1 SEC',
                min: 'x1 MIN',
                prev: 'PREVIOUS',
                anyCond: 'ANY OF THE CONDITIONS',
                allCond: 'ALL CONDITIONS',
                yes: 'YES',
                no: 'NO',
                toMin: 'TO A MINIMUM',
                toMax: 'TO THE MAXIMUM',
            },
            tabs: {
                '1w-rom': '1-wire ID',
                '1w-sens': '1-wire Thermometers',
                'bin-in': 'Discrete inputs',
                'adc-in': 'Analog inputs',
                'bin-out': 'Discrete outputs',
                'pwm-out': 'PWM outputs',
                'mb-co': 'MODBUS CO',
                'mb-ir': 'MODBUS IR',
                'mb-hr': 'MODBUS HR',
                'mb-di': 'MODBUS DI',
                'bin-var': 'Binary variables',
                'int-var': 'Integer variables',
                'tim-var': 'Time variables',
                bus: 'Bus ',
            },
            radioBtns: {
                compare: 'Comparison',
                hold: 'Holding',
                any: 'Any change',
                less: 'Less',
                lessEqual: 'Less or equal',
                more: 'More',
                moreEqual: 'More or equal',
                error: 'Error',
                equal: 'Equal',
                notEqual: 'Not equal',
                binaryEqual: 'Binary equals',
                binaryNotEqual: 'Binary is not equal',
                nonError: 'Not error',
                set: 'Set',
                invert: 'Invert',
                increase: 'Increase',
                smoothChange: 'Change smoothly',
                cyclicChange: 'Cyclic change',
                stop: 'Stop',
                add: 'Add',
                subtract: 'Subtract',
                multiply: 'Multiply',
                divide: 'Divide',
                divideRemainder: 'Remainder of the division',
                takeMax: 'Take the maximum',
                takeMin: 'Take the minimum',
                shiftLeft: 'Bitwise shift left',
                shiftRight: 'Bitwise shift right',
            },
            checkBoxes: {
                conditionsOccur: 'When conditions occur',
                triggerNoMatches: 'Trigger no longer matches',
                conditionNoMatches: 'Condition no longer matches',
            },
            popUp: {
                select: 'Select ',
                obj: 'object',
                actions: 'actions',
                conditions: 'conditions',
                btns: {
                    cancel: 'Cancel',
                    confirm: 'Select',
                },
                placeholder: 'Function name',
                info: 'Several consecutive actions can be selected.',
            },
        },
        ru: {
            titles: {
                startStatus: 'Статус при запуске системы',
                trigInterf: 'Интерфейс триггера',
                actInterf: 'Интерфейс действия',
                condInterf: 'Интерфейс условия',
                transInterf: 'Интерфейс преобразования',
                actDev: 'Устройство действия',
                condDev: 'Устройство условия',
                transDev: 'Устройство преобразования',
                trigDev: 'Устройство триггера',
                actObj: 'Объект действия',
                condObj: 'Объект условия',
                transObj: 'Объект преобразования',
                trigObj: 'Объект триггера',
                actBus: 'Номер цифровой шины действия',
                condBus: 'Номер цифровой шины условия',
                transBus: 'Номер цифровой шины преобразования',
                trigBus: 'Номер цифровой шины триггера',
                triggerType: 'Тип триггера',
                comparisonOperation: 'Операция сравнения',
                comparisonVal: 'Значение для сравнения',
                enter: 'Введите',
                select: 'Выберите',
                comparisonObjInterf: 'Интерфейс объекта для сравнения',
                comparisonDevStatus: 'Устройство объекта для сравнения',
                comparisonObjBus: 'Номер цифровой шины объекта для сравнения',
                compareObj: 'Объект для сравнения',
                hysteresis: 'Гистерезис',
                during: 'В течение',
                minTime: 'Минимальное время',
                maxTime: 'Максимальное время',
                device: 'Устройство',
                object: 'Объект',
                selectActions: 'Выберите действия',
                actionType: 'Тип действия',
                value: 'Значение',
                endValue: 'Значение по окончанию действия',
                stopValue: 'Значение для остановки',
                selectConditions: 'Выберите условия',
                startMode: 'Режим запуска',
                stop: 'Остановка',
                cyclicMode: 'Режим работы циклического изменения',
                operation: 'Операция',
                infinite: 'Бесконечный',
                initDir: 'Начальное направление',
                delay: 'Задержка',
                pause: 'Пауза',
            },
            btns: {
                on: 'ВКЛЮЧЕНО',
                off: 'ВЫКЛЮЧЕНО',
                const: 'КОНСТАНТА',
                obj: 'ОБЪЕКТ',
                timVar: 'ПЕРЕМЕННАЯ ВРЕМЕНИ',
                ms: 'х10 МС',
                s: 'х1 СЕК',
                min: 'х1 МИН',
                prev: 'ПРЕДЫДУЩЕЕ',
                anyCond: 'ЛЮБОЕ ИЗ УСЛОВИЙ',
                allCond: 'ВСЕ УСЛОВИЯ',
                yes: 'ДА',
                no: 'НЕТ',
                toMin: 'К МИНИМУМУ',
                toMax: 'К МАКСИМУМУ',
            },
            tabs: {
                '1w-rom': '1-wire ID',
                '1w-sens': '1-wire термометры',
                'bin-in': 'Дискретные входы',
                'adc-in': 'Аналоговые входы',
                'bin-out': 'Дискретные выходы',
                'pwm-out': 'ШИМ-выходы',
                'mb-co': 'MODBUS CO',
                'mb-ir': 'MODBUS IR',
                'mb-hr': 'MODBUS HR',
                'mb-di': 'MODBUS DI',
                'bin-var': 'Бинарные переменные',
                'int-var': 'Целочисленные переменные',
                'tim-var': 'Переменные времени',
                bus: 'Шина ',
            },
            radioBtns: {
                compare: 'Сравнение',
                hold: 'Удержание',
                any: 'Любое изменение',
                less: 'Меньше',
                lessEqual: 'Меньше или равно',
                more: 'Больше',
                moreEqual: 'Больше или равно',
                error: 'Ошибка',
                equal: 'Равно',
                notEqual: 'Не равно',
                binaryEqual: 'Бинарное равно',
                binaryNotEqual: 'Бинарное не равно',
                nonError: 'Не ошибка',
                set: 'Установить',
                invert: 'Инвертировать',
                increase: 'Увеличить',
                smoothChange: 'Плавно изменить',
                cyclicChange: 'Циклическое изменение',
                stop: 'Остановить',
                add: 'Сложить',
                subtract: 'Вычесть',
                multiply: 'Умножить',
                divide: 'Разделить',
                divideRemainder: 'Остаток от деления',
                takeMax: 'Взять максимальное',
                takeMin: 'Взять минимальное',
                shiftLeft: 'Побитовый сдвиг влево',
                shiftRight: 'Побитовый сдвиг вправо',
            },
            checkBoxes: {
                conditionsOccur: 'При наступлении условий',
                triggerNoMatches: 'Триггер больше не соответствует',
                conditionNoMatches: 'Условие больше не соответствует',
            },
            popUp: {
                select: 'Выберите ',
                obj: 'объект',
                actions: 'действия',
                conditions: 'условия',
                btns: {
                    cancel: 'Отменить',
                    confirm: 'Выбрать',
                },
                placeholder: 'Название функции',
                info: 'Может быть выбрано несколько действий идущих подряд.',
            },
        },
    },
});
</script>
