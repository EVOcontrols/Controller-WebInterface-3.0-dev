<template>
    <div class="flex flex-col z-[2]">
        <WidgetHeader :w="props.w.w" />
        <InitWidget
            v-if="props.isInitialization"
            :w="props.w"
            @init="$emit('init')"
        />
        <div
            v-else
            class="flex flex-1"
        >
            <transition name="appear">
                <component
                    :is="widget.component"
                    :w="{ w: widget, state: props.w.state }"
                    :isBig="true"
                    :isCalibration="props.isCalibration"
                />
            </transition>
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
                                        'bg-[#055457] text-[#00D6AF]':
                                            props.w.w.i === 'bin-out' && activeLabel.state,
                                    },
                                ]"
                                >{{ activeLabel.i + 1 }}</span
                            >
                            <input
                                type="text"
                                :placeholder="placeholder"
                                ref="labelInput"
                                class="flex-1 bg-[#123553] h-full text-[#8DC5F6] px-3 placeholder:text-[#8DC5F6]"
                                :class="{
                                    'rounded-r-[8px]': ['bin-in', 'bin-out', 'bin-var'].includes(
                                        props.w.w.i,
                                    ),
                                }"
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
                                    :class="
                                        activeLabel.state === 1 ? 'bg-[#176F6F]' : 'bg-[#0D424D]'
                                    "
                                    @click="handleBinVarClick(true)"
                                    >{{ t('true') }}</span
                                >
                                <span
                                    class="text-[#97FFE7] text-sm w-[73px] h-full rounded-r-[6px] font-roboto flex items-center justify-center"
                                    :class="
                                        activeLabel.state === 0 ? 'bg-[#176F6F]' : 'bg-[#0D424D]'
                                    "
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
                                        activeLabel.state === 1
                                            ? 'bg-[#004A89] text-[#2A9BFF]'
                                            : 'bg-[#123A5B] text-[#5F93C2]'
                                    "
                                    @click="handleBinVarClick(true)"
                                    >{{ t('ms') }}</span
                                >
                                <span
                                    class="text-[#97FFE7] text-sm w-[73px] h-full font-roboto flex items-center justify-center"
                                    :class="
                                        activeLabel.state === 0
                                            ? 'bg-[#004A89] text-[#2A9BFF]'
                                            : 'bg-[#123A5B] text-[#5F93C2]'
                                    "
                                    @click="handleBinVarClick(false)"
                                    >{{ t('s') }}</span
                                >
                                <span
                                    class="text-[#97FFE7] text-sm w-[73px] h-full rounded-r-[6px] font-roboto flex items-center justify-center"
                                    :class="
                                        activeLabel.state === 0
                                            ? 'bg-[#004A89] text-[#2A9BFF]'
                                            : 'bg-[#123A5B] text-[#5F93C2]'
                                    "
                                    @click="handleBinVarClick(false)"
                                    >{{ t('min') }}</span
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
                            class="flex flex-col items-center flex-none pt-[10px] px-2 w-full"
                            :class="activeLabel ? 'pb-0' : 'pb-[10px]'"
                            ref="scrollEl"
                        >
                            <div
                                class="label group w-full flex text-[#6CB5D3] items-center transition-colors duration-500 rounded select-none hover:bg-[#0C2F4D] gap-2"
                                :class="activeLabel?.i === index ? 'min-h-[68px]' : 'min-h-[30px]'"
                                v-for="(s, index) in props.w.state"
                                :key="index"
                                @dblclick="handleDblClick(s, index)"
                            >
                                <span class="w-[22px] text-end group-hover:underline">{{
                                    index + 1
                                }}</span>
                                <span
                                    class="flex-1 group-hover:underline group-hover:text-[#ADEBFF]"
                                >
                                    label
                                </span>
                                <span
                                    v-if="
                                        ![
                                            'bin-in',
                                            'bin-out',
                                            'int-var',
                                            'bin-var',
                                            'tim-var',
                                        ].includes(props.w.w.i)
                                    "
                                    class="w-[63px] text-[#ADEBFF] text-end pr-[10px] group-hover:underline"
                                    >{{ s / 100 }}%</span
                                >
                                <span
                                    v-else-if="
                                        ['int-var', 'bin-var', 'tim-var'].includes(props.w.w.i)
                                    "
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
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <WidgetFooter
            v-if="!$props.isInitialization"
            :isInfoVisible="['bin-in'].includes(props.w.w.i)"
            :isBig="true"
            :w="props.w.w"
            :isCalibration="props.isCalibration"
            @enter="$emit('enter')"
            @init="$emit('init', props.w.w)"
            @calibr="$emit('calibr')"
            @back="$emit('back')"
        />
    </div>
</template>

<script lang="ts" setup>
import { useI18n } from 'vue-i18n';
import WidgetHeader from '@/components/views/widgets/WidgetHeader.vue';
import WidgetFooter from '@/components/views/widgets/WidgetFooter.vue';
import ShimStates from '@/components/views/widgets/states/ShimStates.vue';
import DiscreteStates from '@/components/views/widgets/states/DiscreteStates.vue';
import DiscreteOutStates from '@/components/views/widgets/states/DiscreteOutStates.vue';
import VarBigStates from '@/components/views/widgets/states/VarBigStates.vue';
import InitWidget from '@/components/views/widgets/bigWidgets/InitWidget.vue';
import type { Widget } from '@/stores';

const { api } = useApi();

const props = defineProps<{
    w: { w: Widget; state: number[] };
    isInitialization: boolean;
    isCalibration: boolean;
}>();

const indexStore = useIndexStore();

const { valuesRange } = storeToRefs(indexStore);

const activeLabel = ref<{ i: number; state: number | null } | null>(null);

const isLabelChange = ref(false);

const scrollEl = ref<HTMLElement | undefined>();

const scrollWrapper = ref<HTMLElement | undefined>();

const labelInput = ref<HTMLInputElement | undefined>();

const dataInput = ref<HTMLInputElement | undefined>();

const isScrolling = ref(false);

const scrollTop = ref<number>(0);

const activeLabelTop = ref(10);

const isInvalidData = ref(false);

const min = ref(0);

const max = ref(0);

const widget = computed<Widget>(() => {
    const widget: Widget = {
        d: props.w.w.d,
        i: props.w.w.i,
        deviceName: props.w.w.deviceName,
        component: '',
    };
    if (['pwm-out', 'adc-in'].includes(props.w.w.i)) {
        widget.component = ShimStates;
    } else if (['bin-in'].includes(props.w.w.i)) {
        widget.component = DiscreteStates;
    } else if (props.w.w.i === 'bin-out') {
        widget.component = DiscreteOutStates;
    } else if (['int-var', 'bin-var', 'tim-var'].includes(props.w.w.i)) {
        widget.component = VarBigStates;
    }
    return widget;
});

const placeholder = computed<string>(() => {
    return t('placeholder');
});

function setActiveLabelTop() {
    const wrapper = scrollWrapper.value;
    const el = scrollEl.value;
    if (!activeLabel.value || !wrapper || !el) return;
    const top = activeLabel.value.i * 30 - scrollTop.value + 10;
    if (top < 0) {
        activeLabelTop.value = 0;
    } else if (Math.round(top) > wrapper.offsetHeight - 68) {
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
        }, 300);
        activeLabelTop.value = wrapper.offsetHeight - 68;
    } else {
        activeLabelTop.value = top;
    }
}

function checkValue() {
    const data = dataInput.value;
    const values = valuesRange.value.find((obj) => obj.interf === props.w.w.i)?.values;
    if (!data || !values) return;
    min.value = values.min;
    max.value = values.max;
    if (!(+data.value >= min.value && +data.value <= max.value)) {
        isInvalidData.value = true;
    } else {
        isInvalidData.value = false;
    }
}

function handleDblClick(s: number, index: number) {
    if (props.w.w.i === 'pwm-out') {
        activeLabel.value = { i: index, state: s / 100 };
    } else {
        activeLabel.value = { i: index, state: s };
    }
    isLabelChange.value = true;
    setTimeout(() => {
        const data = dataInput.value;
        if (!data) return;
        if (props.w.w.i === 'pwm-out') {
            data.value = String(s / 100);
        } else {
            data.value = s === null ? '\u2013' : String(s);
        }
    }, 20);
    setActiveLabelTop();
    window.addEventListener('click', saveData);
    window.addEventListener('keypress', saveData);
}

function handleBinVarClick(res: boolean) {
    if (!activeLabel.value) return;
    activeLabel.value.state = res ? 1 : 0;
}

async function setData(index: number, state: number | null, l?: string, d?: number | null) {
    const label = labelInput.value;
    const data = props.w.w.i !== 'bin-var' ? dataInput.value : label;
    if (!label || !data) return;
    let val: number | null = 0;
    try {
        if (props.w.w.i === 'pwm-out') {
            val = +data.value * 100;
        } else if (props.w.w.i === 'int-var') {
            val = +data.value;
        } else if (props.w.w.i === 'bin-var') {
            val = state;
        }
        const body = {
            type: props.w.w.i,
            device: props.w.w.d,
            index: index,
            value: val,
        };
        if (l !== undefined && d !== undefined) {
            body.value = d;
        }
        if (props.w.state[index] !== body.value) {
            await api.post('set_ent_value', body);
        }
    } catch (error) {
        setData(index, val, label.value, val);
    }
}

function saveData(e: KeyboardEvent | MouseEvent) {
    if (!activeLabel.value) return;
    if (e.type === 'keypress') {
        const event: KeyboardEvent = e as KeyboardEvent;
        if (event.key === 'Enter') {
            if (!isInvalidData.value) setData(activeLabel.value.i, activeLabel.value.state);
            activeLabel.value = null;
            isLabelChange.value = false;
            isInvalidData.value = false;
        }
    } else if (e.type === 'click') {
        if (!isInvalidData.value) setData(activeLabel.value.i, activeLabel.value.state);
        activeLabel.value = null;
        isLabelChange.value = false;
        isInvalidData.value = false;
    }
}

function handleScroll() {
    const el = scrollWrapper.value;
    if (!el) return;
    scrollTop.value = el.scrollTop;
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
            ms: 'х10 МС',
            s: 'х1 СЕК',
            min: 'х1 МИН',
        },
        en: {
            placeholder: 'Entering a title',
            error: {
                text: 'Enter a value between ',
                separator: ' and ',
            },
            true: 'TRUE',
            false: 'FALSE',
            ms: 'х10 MS',
            s: 'х1 SEC',
            min: 'х1 MIN',
        },
    },
});
</script>
<style lang="postcss" scoped>
.widgets::-webkit-scrollbar {
    width: 6px;
    background: transparent;
    grid-auto-rows: minmax(min-content, max-content);
}
</style>
