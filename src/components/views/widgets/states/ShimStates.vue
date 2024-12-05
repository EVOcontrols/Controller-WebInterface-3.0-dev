<template>
    <div
        class="flex-1 relative"
        :class="props.isBig ? 'pl-[18px] pr-[8px] w-[424px]' : 'px-3  w-full'"
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
                    class="h-full"
                    @mouseenter="handleMouseEnter(index, s)"
                    @mouseleave="handleMouseLeave"
                >
                    <ShimItem
                        :w="props.w.w"
                        :is-big="props.isBig"
                        :index="index"
                        :active-index="activeIndex"
                        :active-value="activeValue"
                        :s="s"
                        :is-calibration="props.isCalibration"
                        :checked-arr="props.checkedArr"
                        :calibrated-arr="props.calibratedArr"
                        @changeActiveIndex="
                            (i: number) => {
                                activeIndex = i;
                            }
                        "
                        @changeMouseOffset="
                            (val: number) => {
                                mouseOffset = val;
                            }
                        "
                        @changeRange="
                            (yBottom: number, yTop: number, height: number) => {
                                range = { yBottom: yBottom, yTop: yTop, height: height };
                            }
                        "
                        @changeValue="(ev: MouseEvent) => changeValue(ev)"
                        @stopChange="stopChange"
                        @setValue="
                            (val: number, i: number) => {
                                setValue(val, i);
                            }
                        "
                        @setActiveValue="
                            (val: number) => {
                                activeValue = val;
                            }
                        "
                        @calibrate="
                            (index: number, dir: 'min' | 'max') => {
                                emit('calibrate', index, dir);
                            }
                        "
                    />
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
import type { Widget, InterfVal } from '@/typings/main';
import ArrowIcon from '@/assets/ArrowIcon.vue';
import ShimItem from '@/components/views/widgets/states/ShimItem.vue';

const indexStore = useIndexStore();

const api = indexStore.getApi().api;

const isAborted = indexStore.getApi().isAborted;

const { notConnected, devicesState } = storeToRefs(indexStore);

const isStartScrollEl = ref(true);

const isEndScrollEl = ref(false);

const scrollWrapper = ref<HTMLElement | undefined>();

const scrollEl = ref<HTMLElement | undefined>();

const activeIndex = ref<number | null>(null);

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
    calibrIn?: { index: number; dir: 'min' | 'max' };
    calibratedArr?: { index: number; dir: 'min' | 'max' }[];
    checkedArr?: { index: number; dir: 'min' | 'max' }[];
}>();

const state = ref<number[]>([...props.w.state]);

const emit = defineEmits<{
    (e: 'hover', index: number, s: number): void;
    (e: 'leave'): void;
    (e: 'calibrate', index: number, dir: 'min' | 'max'): void;
}>();

function handleMouseEnter(index: number, s: number | null) {
    if (s === null) return;
    if (!props.isBig) {
        emit('hover', index, s);
    }
}

function handleMouseLeave() {
    if (!props.isBig) {
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

async function setValue(val: number, index: number) {
    const { d, i } = props.w.w;
    try {
        const r = await api.post('set_ent_value', {
            type: i,
            device: d,
            index: index,
            value: val,
        });
        if (r.data.status === 'ok') {
            const devStates = [...devicesState.value][props.w.w.d];
            const prevStateIndex = devStates.findIndex((el) => el.type === props.w.w.i);
            if (prevStateIndex !== -1 && devStates[prevStateIndex].state[index] !== undefined)
                devStates[prevStateIndex].state[index] = val;
            indexStore.setDevicesState(props.w.w.d, [...devStates]);
        }
    } catch (error) {
        if (isAborted.value) {
            return;
        }
        setTimeout(() => {
            setValue(val, index);
        }, 5);
    }
}

async function changeValue(e: MouseEvent) {
    try {
        // if (isRequesting.value) return;
        if (activeIndex.value === null || activeIndex.value === undefined) return;
        let y = e.clientY - mouseOffset.value;
        if (!range.value) return;
        if (y > range.value.yBottom) y = range.value.yBottom;
        if (y < range.value.yTop) y = range.value.yTop;
        const height = range.value.yBottom - y;
        const value = height / range.value.height;
        activeValue.value = value * 10000;
        isRequesting.value = true;
        const r = await api.post('set_ent_value', {
            type: props.w.w.i,
            device: props.w.w.d,
            index: activeIndex.value,
            value: Math.round(activeValue.value),
        });
        if (r.data.status === 'ok') {
            const devStates = [...devicesState.value][props.w.w.d];
            const prevStateIndex = devStates.findIndex((el) => el.type === props.w.w.i);
            if (prevStateIndex !== -1 && devStates[prevStateIndex].state[activeIndex.value] !== undefined)
                devStates[prevStateIndex].state[activeIndex.value] = Math.round(activeValue.value);
            indexStore.setDevicesState(props.w.w.d, [...devStates]);
        }
        state.value[activeIndex.value] = Math.round(activeValue.value);
        setTimeout(() => {
            isRequesting.value = false;
        }, 0);
    } catch (error) {
        if (isAborted.value) {
            return;
        }
    }
}

function stopChange() {
    if (activeIndex.value === null) return;
    setValue(Math.round(activeValue.value), activeIndex.value);
    if (activeIndex.value !== null && activeIndex.value !== null)
        state.value[activeIndex.value] = Math.round(activeValue.value);
    activeIndex.value = null;
    activeValue.value = 0;
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
        const newState = devicesState.value[props.w.w.d].find((obj: InterfVal) => obj.type === props.w.w.i)
            ?.state as number[];
        if (activeIndex.value !== null && activeIndex.value !== undefined && newState) {
            newState[activeIndex.value] = Math.round(activeValue.value);
        }
        state.value = newState ? newState : [...props.w.state];
    },
);
</script>
<style scoped>
.loader {
    width: 14px;
    height: 14px;
    border: 2px solid #00b3cb;
    border-bottom-color: transparent;
    border-radius: 50%;
    display: inline-block;
    box-sizing: border-box;
    animation: rotation 1s linear infinite;
}

@keyframes rotation {
    0% {
        transform: rotate(0deg);
    }
    100% {
        transform: rotate(360deg);
    }
}
</style>
