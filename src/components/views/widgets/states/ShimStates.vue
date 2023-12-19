<template>
    <div
        class="flex-1 relative"
        :class="props.isBig ? 'pl-[18px] pr-[8px] w-[422px]' : 'px-3  w-full'"
    >
        <div
            class="arrow absolute top-[50%] translate-y-[-50%] rotate-180 left-0 cursor-pointer bg-[#092740] h-full w-[34px] z-[2] flex justify-center items-center"
            v-if="!isStartScrollEl && !props.isBig"
            @click="handleArrowClick('toStart')"
        >
            <ArrowIcon :class="{ disabled: notConnected }" />
        </div>
        <div
            v-dragscroll.x
            v-on:dragscrollmove="handleScrollMove"
            class="flex h-full items-center overflow-x-auto no-scrollbar w-full flex-none"
            ref="scrollWrapper"
        >
            <div
                class="flex h-full items-center flex-none gap-[1px] flex-none"
                :class="props.isBig ? 'py-[20px]' : 'py-[10px]'"
                ref="scrollEl"
            >
                <div
                    v-for="(s, index) in state"
                    :key="index"
                    class="rounded group inline-flex flex-col h-full transition-spacing duration-300 relative items-center"
                    :class="props.isBig ? 'px-[0.06rem]' : 'py-1 hover:bg-[#113655]'"
                    @mouseenter="handleMouseEnter(index, s)"
                    @mouseleave="handleMouseLeave"
                >
                    <div
                        v-if="props.isCalibration"
                        class="flex gap-1 flex-col items-center mb-2 calibrGroup"
                    >
                        <div
                            class="w-1 h-1 rounded-[50%]"
                            :class="false ? 'bg-[#00B3CB]' : 'bg-[#07435D]'"
                        ></div>
                        <span
                            v-if="false"
                            v-html="check"
                            class="block bg-[#074a56] rounded-[3px] p-[1px]"
                        ></span>
                        <CalibrArrow
                            v-else
                            class="block p-[1px] bg-[#0D2F4B] rounded-[3px] rotate-180 transition-color duration-300 hover:bg-[#06516a] cursor-pointer"
                        />
                    </div>
                    <div
                        class="flex items-end flex-1 w-1.5 mx-2 overflow-hidden relative rounded-2xl parent z-[1] peer mb-2"
                        :class="[
                            props.isBig && props.w.w.i === 'pwm-out'
                                ? 'bg-[#063a52] group-hover:overflow-visible'
                                : 'bg-[#07435d]',
                            { ' cursor-pointer': props.w.w.i === 'pwm-out' },
                        ]"
                        @mousedown.left="quickChange(index, $event, s)"
                    >
                        <div
                            v-if="!notConnected"
                            class="relative w-full bg-[#00b3cb] transition-all duration-500 rounded-[18px]"
                            :style="{
                                height: `${activeIndex === index ? activeValue / 100 : s / 100}%`,
                            }"
                        >
                            <div
                                v-if="props.isBig && props.w.w.i === 'pwm-out'"
                                class="bg-[#00B3CB] absolute top-[-0.22rem] -left-[6px] w-[18px] h-[0.44rem] inline-block rounded opacity-0 transition-none"
                                :class="{
                                    'opacity-100': activeIndex === index,
                                    'group-hover:opacity-100': activeIndex === null,
                                }"
                                @mousedown.stop="startChange(index, $event, s)"
                            ></div>
                        </div>
                    </div>
                    <div
                        v-if="props.isCalibration"
                        class="flex gap-1 flex-col items-center mb-[6px]"
                    >
                        <span
                            v-if="false"
                            v-html="check"
                            class="block bg-[#074a56] rounded-[3px] p-[1px]"
                        ></span>
                        <CalibrArrow
                            v-else
                            class="block p-[1px] bg-[#0D2F4B] rounded-[3px] transition-color duration-300 hover:bg-[#06516a] cursor-pointer"
                        />
                        <div
                            class="w-1 h-1 rounded-[50%]"
                            :class="false ? 'bg-[#00B3CB]' : 'bg-[#07435D]'"
                        ></div>
                    </div>
                    <div
                        class="text-0.81 font-medium text-center leading-none"
                        :class="notConnected ? 'text-[#3E688E]' : 'text-[#6CB5D3]'"
                    >
                        {{ index + 1 }}
                    </div>
                </div>
            </div>
        </div>
        <div
            class="arrow absolute top-[50%] translate-y-[-50%] right-0 cursor-pointer bg-[#092740] h-full w-[34px] z-[2] flex justify-center items-center"
            v-if="!isEndScrollEl && !props.isBig"
            @click="handleArrowClick('toEnd')"
        >
            <ArrowIcon :class="{ disabled: notConnected }" />
        </div>
    </div>
</template>

<script lang="ts" setup>
import type { Widget } from '@/stores';
import ArrowIcon from '@/assets/ArrowIcon.vue';
import CalibrArrow from '@/assets/CalibrArrow.vue';
import check from '@/assets/img/check.svg?raw';
const { api } = useApi();

const indexStore = useIndexStore();

const { notConnected, devicesState } = storeToRefs(indexStore);

const isStartScrollEl = ref(true);

const isEndScrollEl = ref(false);

const scrollWrapper = ref<HTMLElement | undefined>();

const scrollEl = ref<HTMLElement | undefined>();

const activeIndex = ref<number | null>();

const mouseOffset = ref(0);

const range = ref<{ yBottom: number; yTop: number; height: number } | null>(null);

const activeValue = ref(0);

const isRequesting = ref(false);

const props = defineProps<{
    w: { w: Widget; state: number[] };
    isBig?: boolean;
    activeIO?: { index: number; val: number } | null;
    lastActiveIO?: { index: number; val: number } | null;
    mouseenterTimer?: number;
    mouseleaveTimer?: number;
    isCalibration?: boolean;
}>();

const state = ref<number[]>([...props.w.state]);

const emit = defineEmits<{
    (e: 'hover', index: number, s: number): void;
    (e: 'leave'): void;
}>();

function handleMouseEnter(index: number, s: number | null) {
    if (s === null) return;
    if (props.isBig) {
        activeIndex.value = index;
        activeValue.value = s;
    } else {
        emit('hover', index, s);
    }
}

function handleMouseLeave() {
    if (props.isBig) {
        activeIndex.value = null;
        activeValue.value = 0;
    } else {
        emit('leave');
    }
}

function handleArrowClick(direction: 'toStart' | 'toEnd') {
    const el = scrollEl.value;
    const wrapper = scrollWrapper.value;
    if (!el || !wrapper) return;
    if (direction === 'toStart') {
        wrapper?.scrollTo({
            left: wrapper.scrollLeft - wrapper.offsetWidth,
            behavior: 'smooth',
        });
        isStartScrollEl.value = wrapper.scrollLeft - wrapper.offsetWidth <= 0;
        isEndScrollEl.value = false;
    } else {
        wrapper.scrollTo({
            left: wrapper.scrollLeft + wrapper.offsetWidth,
            behavior: 'smooth',
        });
        isStartScrollEl.value = false;
    }
}

function handleScrollMove() {
    const el = scrollEl.value;
    const wrapper = scrollWrapper.value;
    if (!el || !wrapper || wrapper.offsetWidth === el.offsetWidth) return;
    isStartScrollEl.value = wrapper.scrollLeft < 10 ? true : false;
}

async function quickChange(index: number, e: MouseEvent, currentState: number | null) {
    const { d, i } = props.w.w;
    try {
        if (props.isBig && props.w.w.i === 'pwm-out') {
            activeIndex.value = index;
            mouseOffset.value = 0;
            const target = e.target as Element;
            const parent = target.closest('.parent');
            if (!parent) return;
            const boundingRect = parent.getBoundingClientRect();
            range.value = {
                yBottom: boundingRect.y + boundingRect.height,
                yTop: boundingRect.y,
                height: boundingRect.height,
            };
            changeValue(e);
            document.addEventListener('mousemove', changeValue);
            document.addEventListener('mouseup', stopChange, { once: true });
        } else if (props.w.w.i === 'pwm-out') {
            await api.post('set_ent_value', {
                type: i,
                device: d,
                index: index,
                value: currentState === 0 ? 10000 : 0,
            });
        }
    } catch (error) {
        //
    }
}

function startChange(index: number, e: MouseEvent, s: number) {
    activeValue.value = s;
    if (!e.target) return;
    const target = e.target as HTMLElement;
    const { offsetY } = e;
    const { clientHeight } = target;
    mouseOffset.value = offsetY - clientHeight / 2;
    activeIndex.value = index;
    const parent = target.closest('.parent');
    if (!parent) return;
    const boundingRect = parent.getBoundingClientRect();
    range.value = {
        yBottom: boundingRect.y + boundingRect.height,
        yTop: boundingRect.y,
        height: boundingRect.height,
    };
    document.addEventListener('mousemove', changeValue);
    document.addEventListener('mouseup', stopChange, { once: true });
}

async function changeValue(e: MouseEvent) {
    if (isRequesting.value) return;
    if (activeIndex.value === null || activeIndex.value === undefined) return;
    let y = e.clientY - mouseOffset.value;
    if (!range.value) return;
    if (y > range.value.yBottom) y = range.value.yBottom;
    if (y < range.value.yTop) y = range.value.yTop;
    const height = range.value.yBottom - y;
    const value = height / range.value.height;
    activeValue.value = value * 10000;
    isRequesting.value = true;
    await api.post('set_ent_value', {
        type: props.w.w.i,
        device: props.w.w.d,
        index: activeIndex.value,
        value: Math.round(activeValue.value),
    });
    setTimeout(() => {
        isRequesting.value = false;
    }, 20);
}

async function stopChange() {
    try {
        document.removeEventListener('mousemove', changeValue);
        // const { d, i } = props.w.w;
        // await api.post('set_ent_value', {
        //     type: i,
        //     device: d,
        //     index: activeIndex.value,
        //     value: Math.round(activeValue.value),
        // });
        activeIndex.value = null;
        activeValue.value = 0;
    } catch (error) {
        stopChange();
    }
}

watch(
    () => props.w,
    () => {
        const el = scrollEl.value;
        const wrapper = scrollWrapper.value;
        if (!wrapper || !el) return;
        isEndScrollEl.value = wrapper.scrollLeft + wrapper.offsetWidth >= el.offsetWidth - 10;
    },
);

watch(
    () => devicesState.value,
    () => {
        const newState = devicesState.value
            .find((obj) => obj.device === props.w.w.d)
            ?.interfVal.find((obj) => obj.type === props.w.w.i)?.value;
        state.value = newState ? newState : [...props.w.state];
    },
);
</script>
