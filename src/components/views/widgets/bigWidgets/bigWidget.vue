<template>
    <div class="flex flex-col z-[2]">
        <WidgetHeader :w="props.w.w" />
        <div class="flex flex-1">
            <transition name="appear">
                <component
                    :is="widget.component"
                    :w="{ w: widget, state: props.w.state }"
                    :state="props"
                    :isBig="true"
                />
            </transition>
            <div class="relative w-full border-l border-[#1D4162]">
                <transition name="label">
                    <div
                        v-if="activeLabel && isLabelChange"
                        class="absolute bg-[#092E4B] w-[120%] z-[2] rounded-r-[16px] p-4 pr-6 flex items-center select-none origin-top-left flex flex-col"
                        :class="isInvalidData ? 'h-[78px]' : 'h-[68px]'"
                        :style="{ top: activeLabelTop + 'px' }"
                        @click.stop
                    >
                        <div class="flex w-full h-9">
                            <span
                                class="w-10 h-full flex items-center justify-center rounded-l-[8px] bg-[#194265] px-[6px] transition-colors duration-300"
                                :class="{ 'bg-[#5C2345] text-[#F83068]': isInvalidData }"
                                >{{ activeLabel.i + 1 }}</span
                            >
                            <input
                                type="text"
                                :placeholder="placeholder"
                                ref="labelInput"
                                class="flex-1 bg-[#123553] h-full text-[#8DC5F6] px-3 placeholder:text-[#8DC5F6]"
                            />
                            <span
                                class="w-[72px] h-full flex items-center justify-center rounded-r-[8px] bg-[#185385] text-[#8DC5F6] px-1 transition-colors duration-300"
                                :class="{ 'bg-[#5C2345] text-[#F83068]': isInvalidData }"
                            >
                                <div class="w-8">
                                    <input
                                        type="text"
                                        :value="activeLabel.state"
                                        :maxlength="5"
                                        ref="dataInput"
                                        class="w-full flex-1 bg-transparent h-full text-[#8DC5F6] text-[#8DC5F6] text-end transition-colors duration-300"
                                        :class="{ 'text-[#F83068]': isInvalidData }"
                                        @input="checkValue"
                                    />
                                </div>
                                %</span
                            >
                        </div>
                        <div
                            v-if="isInvalidData"
                            class="w-full"
                        ></div>
                    </div>
                </transition>
                <div class="flex overflow-y-hidden ml-2 pl-2 pr-1 rounded-l-lg w-full">
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
                                class="label group w-full flex text-[#6CB5D3] items-center transition-colors duration-500 rounded select-none hover:bg-[#0C2F4D]"
                                :class="activeLabel?.i === index ? 'min-h-[68px]' : 'min-h-[30px]'"
                                v-for="(s, index) in props.w.state"
                                :key="index"
                                @dblclick="handleDblClick(s, index)"
                            >
                                <span class="w-[22px] pl-[10px]">{{ index + 1 }}</span>
                                <span
                                    class="flex-1 group-hover:underline group-hover:text-[#ADEBFF]"
                                >
                                    <!-- label -->
                                </span>
                                <span class="w-[53px] text-[#ADEBFF] text-end pr-[10px]"
                                    >{{ s / 10 }}%</span
                                >
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <WidgetFooter
            :isInfoVisible="false"
            :isBig="true"
            :w="props.w.w"
            @enter="$emit('enter')"
        />
    </div>
</template>

<script lang="ts" setup>
import { useI18n } from 'vue-i18n';
import WidgetHeader from '@/components/views/widgets/WidgetHeader.vue';
import WidgetFooter from '@/components/views/widgets/WidgetFooter.vue';
import ShimStates from '@/components/views/widgets/states/ShimStates.vue';
import type { Widget } from '@/stores';

const { api } = useApi();

const props = defineProps<{
    w: { w: Widget; state: number[] };
}>();

const activeLabel = ref<{ i: number; state: number } | null>(null);

const isLabelChange = ref(false);

const scrollEl = ref<HTMLElement | undefined>();

const scrollWrapper = ref<HTMLElement | undefined>();

const labelInput = ref<HTMLInputElement | undefined>();

const dataInput = ref<HTMLInputElement | undefined>();

const isScrolling = ref(false);

const scrollTop = ref<number>(0);

const activeLabelTop = ref(10);

const isInvalidData = ref(false);

const isDataChanging = ref(false);

const widget = computed<Widget>(() => {
    const widget: Widget = {
        d: props.w.w.d,
        i: props.w.w.i,
        deviceName: props.w.w.deviceName,
        component: '',
    };
    if (props.w.w.i === 'pwm-out') {
        widget.component = ShimStates;
    } else {
        widget.component = '';
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
    if (!data) return;
    if (!(+data.value >= 0 && +data.value <= 100)) {
        isInvalidData.value = true;
    } else {
        isInvalidData.value = false;
    }
}

function handleDblClick(s: number, index: number) {
    activeLabel.value = { i: index, state: s / 10 };
    isLabelChange.value = true;
    setActiveLabelTop();
    window.addEventListener('click', saveData);
    window.addEventListener('keypress', saveData);
}

async function setData(index: number, l?: string, d?: number) {
    const label = labelInput.value;
    const data = dataInput.value;
    if (!label || !data) return;
    try {
        const body = {
            type: props.w.w.i,
            device: props.w.w.d,
            index: index,
            value: +data.value * 10,
        };
        if (l !== undefined && d !== undefined) {
            body.value = d;
        }
        if (props.w.state[index] !== body.value) {
            await api.post('set_ent_value', body);
        }
    } catch (error) {
        setData(index, label.value);
    }
}

function saveData(e: KeyboardEvent | MouseEvent) {
    if (!activeLabel.value) return;
    if (e.type === 'keypress') {
        const event: KeyboardEvent = e as KeyboardEvent;
        if (event.key === 'Enter') {
            if (!isInvalidData.value) setData(activeLabel.value.i);
            activeLabel.value = null;
            isLabelChange.value = false;
            isInvalidData.value = false;
        }
    } else if (e.type === 'click') {
        if (!isInvalidData.value) setData(activeLabel.value?.i);
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
        },
        en: {
            placeholder: 'Entering a title',
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
