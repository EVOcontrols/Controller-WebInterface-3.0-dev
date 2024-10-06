<template>
    <div
        class="relative border-l border-[#1D4162]"
        :style="{ width: 'calc(100% - 422px)' }"
    >
        <transition name="label">
            <div
                v-if="activeLabel && isLabelChange"
                class="absolute bg-[#092E4B] z-[2] rounded-r-[16px] p-4 pr-6 flex items-center select-none origin-top-left flex flex-col gap-[6px]"
                :class="[
                    isInvalidData ? 'h-[88px]' : 'h-[68px]',
                    !['bin-var', 'tim-var'].includes(props.w.w.i)
                        ? 'w-[115%]'
                        : props.w.w.i === 'bin-var'
                        ? 'w-[154%]'
                        : 'w-[168%]',
                ]"
                :style="{ top: activeLabelTop + 'px' }"
                @click.stop
            >
                <div class="flex w-full h-9 items-center">
                    <span
                        class="w-10 h-full flex items-center justify-center rounded-l-[8px] bg-[#194265] px-[6px] transition-colors duration-300"
                        :class="[
                            { 'bg-[#5C2345] text-[#F83068]': isInvalidData },
                            {
                                '!bg-[#055457] text-[#00D6AF]':
                                    props.w.w.i === 'bin-out' && activeLabel.state,
                            },
                        ]"
                        >{{ activeLabel.i + 1 }}</span
                    >
                    <input
                        type="text"
                        :placeholder="placeholder"
                        :value="activeLabel.label"
                        :maxlength="32"
                        class="flex-1 bg-[#123553] h-full text-[#8DC5F6] px-3 placeholder:text-[#8DC5F6]"
                        :class="{
                            'rounded-r-[8px]': ['bin-in', 'bin-out', 'bin-var'].includes(
                                props.w.w.i,
                            ),
                        }"
                        @input="(e) => handleLabelInput(e as InputEvent)"
                    />
                    <span
                        v-if="['pwm-out', 'int-var', 'tim-var'].includes(props.w.w.i)"
                        class="w-[72px] h-full flex items-center justify-center rounded-r-[8px] bg-[#185385] text-[#8DC5F6] px-1 transition-colors duration-300"
                        :class="{ 'bg-[#5C2345] text-[#F83068]': isInvalidData }"
                    >
                        <div :class="props.w.w.i === 'int-var' ? 'w-14' : 'w-8'">
                            <input
                                type="text"
                                :maxlength="props.w.w.i === 'pwm-out' ? 5 : 6"
                                :disabled="props.w.w.i === 'tim-var' && !activeLabel.units"
                                ref="dataInput"
                                class="w-full flex-1 bg-transparent h-full text-[#8DC5F6] text-[#8DC5F6] text-end transition-colors duration-300"
                                :class="{ 'text-[#F83068]': isInvalidData }"
                                @input="checkValue"
                            />
                        </div>
                        {{ props.w.w.i === 'pwm-out' ? '%' : '' }}</span
                    >
                    <span
                        v-else-if="['adc-in'].includes(props.w.w.i)"
                        class="w-[72px] h-full flex items-center justify-center rounded-r-[8px] bg-[#185385] text-[#8DC5F6] px-1 transition-colors duration-300"
                        >{{ activeLabel.state }}%</span
                    >
                    <div
                        v-else-if="props.w.w.i === 'bin-var'"
                        class="flex h-8 ml-2"
                    >
                        <span
                            class="text-[#97FFE7] text-sm w-[73px] h-full rounded-l-[6px] font-roboto flex items-center justify-center"
                            :class="activeLabel.state === 1 ? 'bg-[#176F6F]' : 'bg-[#0D424D]'"
                            @click="handleBinVarClick(true)"
                            >{{ t('true') }}</span
                        >
                        <span
                            class="text-[#97FFE7] text-sm w-[73px] h-full rounded-r-[6px] font-roboto flex items-center justify-center"
                            :class="activeLabel.state === 0 ? 'bg-[#176F6F]' : 'bg-[#0D424D]'"
                            @click="handleBinVarClick(false)"
                            >{{ t('false') }}</span
                        >
                    </div>
                    <div
                        v-if="props.w.w.i === 'tim-var'"
                        class="flex h-8 ml-2"
                    >
                        <span
                            class="text-sm w-[73px] h-full rounded-l-[6px] font-roboto flex items-center justify-center"
                            :class="
                                activeLabel.units === 'ms'
                                    ? 'bg-[#004A89] text-[#2A9BFF]'
                                    : 'bg-[#123A5B] text-[#5F93C2] cursor-pointer'
                            "
                            @click="
                                () => {
                                    if (activeLabel) activeLabel.units = 'ms';
                                    checkValue();
                                }
                            "
                            >{{ t('10ms') }}</span
                        >
                        <span
                            class="text-sm w-[73px] h-full font-roboto flex items-center justify-center"
                            :class="
                                activeLabel.units === 's'
                                    ? 'bg-[#004A89] text-[#2A9BFF]'
                                    : 'bg-[#123A5B] text-[#5F93C2] cursor-pointer'
                            "
                            @click="
                                () => {
                                    if (activeLabel) activeLabel.units = 's';
                                    checkValue();
                                }
                            "
                            >{{ t('1s') }}</span
                        >
                        <span
                            class="text-sm w-[73px] h-full rounded-r-[6px] font-roboto flex items-center justify-center"
                            :class="
                                activeLabel.units === 'min'
                                    ? 'bg-[#004A89] text-[#2A9BFF]'
                                    : 'bg-[#123A5B] text-[#5F93C2] cursor-pointer'
                            "
                            @click="
                                () => {
                                    if (activeLabel) activeLabel.units = 'min';
                                    checkValue();
                                }
                            "
                            >{{ t('1min') }}</span
                        >
                    </div>
                </div>
                <div
                    v-if="isInvalidData"
                    class="w-full text-sm h-[14px] text-[#F83068]"
                >
                    {{ t('error.text') + min + t('error.separator') + max }}
                </div>
            </div>
        </transition>
        <div class="flex overflow-y-hidden pl-2 rounded-l-lg w-full">
            <div
                v-dragscroll.y
                class="flex overflow-y-auto w-full scrollbar-4 flex-1"
                :style="{ height: 'calc(100vh - 410px)' }"
                @scroll="handleScroll"
                ref="scrollWrapper"
            >
                <div
                    v-if="!['1w-sens', '1w-rom'].includes(props.w.w.i)"
                    class="flex flex-col items-center flex-none pt-[10px] px-2 w-full"
                    :class="activeLabel ? 'pb-0' : 'pb-[10px]'"
                    ref="scrollEl"
                >
                    <div
                        class="label group w-full flex text-[#6CB5D3] items-center transition-colors duration-500 rounded select-none hover:bg-[#0C2F4D] gap-2"
                        :class="activeLabel?.i === index ? 'min-h-[68px]' : 'min-h-[30px]'"
                        v-for="(s, index) in state"
                        :key="index"
                        @dblclick="handleDblClick(s, index)"
                    >
                        <span class="w-[22px] text-end group-hover:underline">{{ index + 1 }}</span>
                        <span class="flex-1 group-hover:underline group-hover:text-[#ADEBFF]">
                            {{ curLabels && curLabels[index] ? curLabels[index] : '\u2013' }}
                        </span>
                        <span
                            v-if="
                                ![
                                    'bin-in',
                                    'bin-out',
                                    'int-var',
                                    'bin-var',
                                    'tim-var',
                                    '1w-rom',
                                ].includes(props.w.w.i)
                            "
                            class="w-[63px] text-[#ADEBFF] text-end pr-[10px] group-hover:underline"
                            >{{ s / 100 }}%</span
                        >
                        <span
                            v-else-if="['int-var', 'bin-var'].includes(props.w.w.i)"
                            class="w-[53px] text-end pr-[10px] group-hover:underline"
                            :class="
                                props.w.w.i !== 'bin-var'
                                    ? 'text-[#ADEBFF]'
                                    : s === 0
                                    ? 'text-[#176F6F]'
                                    : 'text-[#35FED0]'
                            "
                            >{{
                                s === null
                                    ? '\u2013'
                                    : props.w.w.i !== 'bin-var'
                                    ? s
                                    : s
                                    ? t('true')
                                    : t('false')
                            }}</span
                        >
                        <span
                            v-else-if="props.w.w.i === 'tim-var'"
                            class="w-[53px] text-end pr-[10px] group-hover:underline text-[#ADEBFF]"
                            >{{
                                s === null
                                    ? '\u2013'
                                    : s <= 150000
                                    ? `${s} ${t('ms')}`
                                    : s > 150000 && s % 60000 === 0
                                    ? `${s / 60000} ${t('min')}`
                                    : `${s / 1000} ${t('s')}`
                            }}</span
                        >
                    </div>
                </div>
                <div
                    v-else-if="props.w.w.i === '1w-sens'"
                    class="flex flex-col items-center flex-none pt-[10px] px-2 w-full"
                    :class="activeLabel ? 'pb-0' : 'pb-[10px]'"
                    ref="scrollEl"
                >
                    <div
                        class="label group w-full flex text-[#6CB5D3] items-center transition-colors duration-500 rounded select-none gap-2"
                        :class="[
                            activeLabel?.i === index ? 'min-h-[68px]' : 'min-h-[30px]',
                            { ' hover:bg-[#0C2F4D]': s !== null },
                        ]"
                        v-for="(s, index) in tempState"
                        :key="index"
                        @dblclick="handleDblClick(s, index)"
                    >
                        <span
                            class="w-[22px] text-end"
                            :class="s === null ? 'text-[#194F76]' : 'text-[#6CB5D3]'"
                            >{{ index + 1 }}</span
                        >
                        <span class="flex-1 group-hover:underline group-hover:text-[#ADEBFF]">
                            {{
                                s !== null
                                    ? curLabels && curLabels.length
                                        ? curLabels[index]
                                        : ''
                                    : ''
                            }}
                        </span>
                        <span
                            v-if="s !== null"
                            class="w-[63px] text-end pr-[10px]"
                            :class="s > 0 ? 'text-[#EB8246]' : 'text-[#35A1FF]'"
                            >{{
                                tempUnit === '°C'
                                    ? `${Math.round(s / 10) / 10}°C`
                                    : `${(Math.round(s / 10) / 10) * 1.8 + 32}°F`
                            }}</span
                        >
                    </div>
                </div>
                <div
                    v-else-if="props.w.w.i === '1w-rom'"
                    class="flex flex-col items-center flex-none pt-[10px] px-2 w-full"
                    :class="activeLabel ? 'pb-0' : 'pb-[10px]'"
                    ref="scrollEl"
                >
                    <div
                        class="label group w-full flex text-[#6CB5D3] items-center transition-colors duration-500 rounded select-none gap-2"
                        :class="[
                            activeLabel?.i === index ? 'min-h-[68px]' : 'min-h-[30px]',
                            { ' hover:bg-[#0C2F4D]': s !== null },
                        ]"
                        v-for="(s, index) in state"
                        :key="index"
                        @dblclick="handleDblClick(s, index)"
                    >
                        <span
                            class="w-[22px] text-end"
                            :class="s === null ? 'text-[#194F76]' : 'text-[#6CB5D3]'"
                            >{{ index + 1 }}</span
                        >
                        <span class="flex-1 group-hover:underline group-hover:text-[#ADEBFF]">
                            {{
                                s !== null
                                    ? curLabels && curLabels.length
                                        ? curLabels[index]
                                        : ''
                                    : ''
                            }}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { useI18n } from 'vue-i18n';
import type { Widget } from '@/stores';

const { saveToFile } = useReadWriteFiles();

const props = defineProps<{
    w: { w: Widget; state: number[] | [number | null][] };
}>();

const placeholder = computed<string>(() => {
    return t('placeholder');
});

const curLabels = computed<[string | undefined]>(() => {
    if (labels.value[props.w.w.d]) {
        const val = labels.value[props.w.w.d]?.find((el) => el.interf === props.w.w.i);
        if (val) {
            const bus = props.w.w.bus || 0;
            return val.val[bus] as [string | undefined];
        }
    }
    const arr: [string | undefined] = [''];
    return arr;
});

const activeLabel = ref<{
    i: number;
    state: number | string | null;
    label: string | undefined;
    units?: 'ms' | 's' | 'min';
} | null>(null);

const isLabelChange = ref(false);

const isInvalidData = ref(false);

const activeLabelTop = ref(10);

const min = ref(0);

const max = ref(0);

const dataInput = ref<HTMLInputElement | undefined>();

const indexStore = useIndexStore();

const { tempUnit, valuesRange, devicesState, labels } = storeToRefs(indexStore);

const api = indexStore.getApi().api;

const isAborted = indexStore.getApi().isAborted;

const scrollWrapper = ref<HTMLElement | undefined>();

const scrollTop = ref<number>(0);

const scrollEl = ref<HTMLElement | undefined>();

const isScrolling = ref(false);

const isNotMainScrolling = ref(false);

const state = computed<number[]>(() => {
    return props.w.state as number[];
});

const tempState = computed<[number | null]>(() => {
    if (props.w.w.i !== '1w-sens') return [null] as [number | null];
    let res: any[] = [];
    const curState = [...props.w.state] as [number | null][];
    curState.forEach((el) => {
        res.push(el[0] === null ? null : el[0]);
    });
    return res as [number | null];
});

function checkValue() {
    const data = dataInput.value;
    const values =
        props.w.w.i === 'tim-var' && activeLabel.value
            ? valuesRange.value.find((obj) => obj.interf === props.w.w.i + activeLabel.value?.units)
                  ?.values
            : valuesRange.value.find((obj) => obj.interf === props.w.w.i)?.values;
    if (!data || !values) return;
    min.value = values.min;
    max.value = values.max;
    let val = data.value;
    if (val.includes(',')) val = val.replace(',', '.');
    if (!(+val >= min.value && +val <= max.value)) {
        isInvalidData.value = true;
    } else {
        isInvalidData.value = false;
    }
    if (
        props.w.w.i !== 'pwm-out' &&
        val.includes('.') &&
        activeLabel.value &&
        activeLabel.value.units !== 's'
    ) {
        val = val.slice(0, val.indexOf('.'));
    }
    data.value = val;
}

function handleBinVarClick(res: boolean) {
    if (!activeLabel.value) return;
    activeLabel.value.state = res ? 1 : 0;
}

function handleScroll() {
    const el = scrollWrapper.value;
    if (!el) return;
    isNotMainScrolling.value = false;
    scrollTop.value = el.scrollTop;
}

function handleDblClick(s: number | null, index: number) {
    if (props.w.w.i === 'pwm-out') {
        if (s === null) return;
        activeLabel.value = { i: index, state: s / 100, label: curLabels.value[index] };
    } else if (props.w.w.i === 'tim-var') {
        let newS = s;
        let units: 'ms' | 's' | 'min' | undefined = undefined;
        if (s) {
            if (s <= 150000) {
                units = 'ms';
                newS = s / 10;
            } else if (s > 150000 && s % 60000 === 0) {
                units = 'min';
                newS = s / 60000;
            } else {
                units = 's';
                newS = s / 1000;
            }
        }
        activeLabel.value = { i: index, state: newS, label: curLabels.value[index], units: units };
    } else {
        activeLabel.value = { i: index, state: s, label: curLabels.value[index] };
    }
    isNotMainScrolling.value = true;
    isLabelChange.value = true;
    setTimeout(() => {
        const data = dataInput.value;
        if (!data) return;
        if (props.w.w.i === 'pwm-out') {
            if (s === null) return;
            data.value = String(s / 100);
        } else {
            data.value = s === null ? '' : String(activeLabel.value?.state);
        }
    }, 20);
    setActiveLabelTop();
    window.addEventListener('click', saveData);
    window.addEventListener('keypress', saveData);
}

function setActiveLabelTop() {
    const wrapper = scrollWrapper.value;
    const el = scrollEl.value;
    if (!activeLabel.value || !wrapper || !el) return;
    const top = activeLabel.value.i * 30 - scrollTop.value + 10;
    if (top < 0) {
        activeLabelTop.value = 0;
    } else if (Math.round(top) > wrapper.offsetHeight - 68) {
        if (isNotMainScrolling.value) {
            setTimeout(() => {
                if (!activeLabel.value) return;
                isScrolling.value = true;
                wrapper.scrollTo({
                    top: activeLabel.value.i * 30 + 78 - wrapper.offsetHeight,
                    behavior: 'smooth',
                });
            }, 0);
            setTimeout(() => {
                isScrolling.value = false;
                isNotMainScrolling.value = false;
            }, 300);
        }
        activeLabelTop.value = wrapper.offsetHeight - 68;
    } else {
        activeLabelTop.value = top;
    }
}

function handleLabelInput(e: InputEvent) {
    const target = e.target as HTMLInputElement;
    if (!target || !activeLabel.value) return;
    activeLabel.value.label = target.value;
}

function saveData(e: KeyboardEvent | MouseEvent) {
    if (!activeLabel.value) return;
    if (e.type === 'keypress') {
        const event: KeyboardEvent = e as KeyboardEvent;
        if (event.key === 'Enter') {
            if (!isInvalidData.value) setData(activeLabel.value.i, activeLabel.value.state);
            setLabel(activeLabel.value.i, activeLabel.value.label);
            activeLabel.value = null;
            isLabelChange.value = false;
            isInvalidData.value = false;
        }
    } else if (e.type === 'click') {
        if (!isInvalidData.value) setData(activeLabel.value.i, activeLabel.value.state);
        setLabel(activeLabel.value.i, activeLabel.value.label);
        activeLabel.value = null;
        isLabelChange.value = false;
        isInvalidData.value = false;
    }
}

async function setLabel(index: number, label: string | undefined) {
    if (!label) return;
    const newLabels = [...curLabels.value];
    newLabels[index] = label;
    saveLabel(newLabels as string[]);
    // for (let i = 0; i < Math.ceil(newLabels.length / labelsFileLength); i += 1) {
    //     if (
    //         JSON.stringify(
    //             curLabels.value.slice(i * labelsFileLength, (i + 1) * labelsFileLength),
    //         ) !== JSON.stringify(newLabels.slice(i * labelsFileLength, (i + 1) * labelsFileLength))
    //     ) {
    //         saveLabel(
    //             newLabels.slice(i * labelsFileLength, (i + 1) * labelsFileLength) as string[],
    //             i,
    //         );
    //     }
    // }
}

async function saveLabel(labels: string[]) {
    const isSavingError = await saveToFile(
        {
            type: 'labels',
            device: props.w.w.d,
            bus: props.w.w.bus,
            interf: props.w.w.i as
                | '1w-rom'
                | '1w-sens'
                | 'adc-in'
                | 'bin-in'
                | 'bin-out'
                | 'bin-var'
                | 'int-var'
                | 'mb-var'
                | 'pwm-out'
                | 'tim-var',
        },
        { labels: labels },
    );
    if (isSavingError) {
        if (isAborted.value) {
            return;
        }
        setTimeout(() => {
            saveLabel(labels);
        }, 5);
    } else {
        indexStore.changeLabel(
            props.w.w.d,
            props.w.w.i as
                | '1w-rom'
                | '1w-sens'
                | 'adc-in'
                | 'bin-in'
                | 'bin-out'
                | 'bin-var'
                | 'int-var'
                | 'mb-var'
                | 'pwm-out'
                | 'tim-var',
            labels,
            props.w.w.bus,
        );
    }
}

async function setData(index: number, state: string | number | null, d?: number | null) {
    const data = dataInput.value;
    let val: number | null = null;
    if (props.w.w.i === 'bin-var') {
        val = state as number | null;
    } else {
        if (!data) return;
        if (props.w.w.i === 'pwm-out') {
            val = Math.round(+data.value * 100);
        } else if (props.w.w.i === 'int-var') {
            val = +data.value;
        } else if (props.w.w.i === 'tim-var') {
            val = +data.value;
            if (activeLabel.value?.units === 'ms') {
                val *= 10;
            } else if (activeLabel.value?.units === 's') {
                val *= 1000;
            } else if (activeLabel.value?.units === 'min') {
                val *= 60000;
            }
        }
    }
    const body = {
        type: props.w.w.i,
        device: props.w.w.d,
        index: index,
        value: val,
    };
    if (d !== undefined) {
        body.value = d;
    }
    if (props.w.state[index] !== body.value) {
        setVal(body);
    }
}

async function setVal(body: { type: string; device: number; index: number; value: number | null }) {
    try {
        const r = await api.post('set_ent_value', body);
        if (r.data.status === 'ok' && body.value !== null) {
            const devStates = [...devicesState.value][props.w.w.d];
            const prevStateIndex = devStates.findIndex((el) => el.type === props.w.w.i);
            if (prevStateIndex !== -1 && devStates[prevStateIndex].state[body.index] !== undefined)
                devStates[prevStateIndex].state[body.index] = body.value;
            indexStore.setDevicesState(props.w.w.d, [...devStates]);
        }
    } catch (error) {
        if (isAborted.value) {
            return;
        }
        setTimeout(() => {
            setVal(body);
        }, 20);
    }
}

onBeforeUnmount(() => {
    window.removeEventListener('click', saveData);
    window.removeEventListener('keypress', saveData);
});

watch(
    () => scrollTop.value,
    () => {
        if (!isScrolling.value) setActiveLabelTop();
    },
);

const { t } = useI18n({
    messages: {
        ru: {
            placeholder: 'Ввод названия',
            error: {
                text: 'Введите значение от ',
                separator: ' до ',
            },
            true: 'ИСТИНА',
            false: 'ЛОЖЬ',
            '10ms': 'х10 МС',
            '1s': 'х1 СЕК',
            '1min': 'х1 МИН',
            ms: 'мс',
            s: 'с',
            min: 'мин',
        },
        en: {
            placeholder: 'Entering a title',
            error: {
                text: 'Enter a value between ',
                separator: ' and ',
            },
            true: 'TRUE',
            false: 'FALSE',
            '10ms': 'х10 MS',
            '1s': 'х1 SEC',
            '1min': 'х1 MIN',
            ms: 'ms',
            s: 's',
            min: 'min',
        },
    },
});
</script>
