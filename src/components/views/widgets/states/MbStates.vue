<template>
    <div
        class="flex-1 relative w-full overflow-hidden px-3 pt-[0.5625rem]"
        :class="props.isBig ? 'pl-[18px] pr-[8px] min-w-[54%]' : 'px-3  w-full'"
    >
        <div
            v-if="!isStartScrollEl && !props.isBig"
            class="absolute h-full w-[34px] left-0 top-0"
            :style="{ 'z-index': leftArrowZ }"
        ></div>
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
            class="items-center overflow-x-auto no-scrollbar"
            ref="scrollWrapper"
        >
            <div
                class="grid gap-1 grid-rows-2 grid-flow-col"
                ref="scrollEl"
            >
                <div
                    v-for="(s, index) in curState"
                    class="relative rounded group inline-flex flex-col items-end w-[90px] h-10 justify-center gap-[6px] transition-all duration-300 border border-transparent px-[6px]"
                    :class="[
                        { 'hover:border-[#35FED0]': s.type === 'di' || s.type === 'coil' },
                        { 'bg-[#176F6F]': (s.type === 'di' || s.type === 'coil') && s.val },
                        { 'bg-[#0D424D]': (s.type === 'di' || s.type === 'coil') && !s.val },
                        { 'bg-[#006B83]': s.type === 'hr' || s.type === 'ir' },
                        { 'hover:border-[#01F0FF]': s.type === 'hr' || s.type === 'ir' },
                    ]"
                    :key="index"
                    @mouseenter="handleMouseEnter(index, s)"
                    @mouseleave="handleMouseLeave"
                >
                    <div
                        class="absolute w-full h-full rounded left-0 top-0 z-[-1] group-hover:z-[4]"
                    ></div>
                    <div
                        v-if="s.type === 'di'"
                        class="w-full flex items-center justify-between text-[#35FED0] text-xs"
                    >
                        <span>RO</span>
                        <span>{{
                            numberingSystem === 'dec' ? s.reg_addr : s.reg_addr.toString(16)
                        }}</span>
                    </div>
                    <div
                        v-else-if="s.type === 'coil'"
                        class="w-full flex items-center justify-between text-[#35FED0] text-xs"
                        @click="handleClick(index, s.val)"
                    >
                        <div class="flex flex-col justify-end gap-[6px]">
                            <div class="h-[12px]"></div>
                            <div class="h-[12px]">RW</div>
                        </div>
                        <div class="flex flex-col items-end justify-end gap-[6px]">
                            <div class="h-[12px] text-[#97FFE7]">
                                {{ s.val ? t('on') : t('off') }}
                            </div>
                            <div class="h-[12px]">
                                {{
                                    numberingSystem === 'dec' ? s.reg_addr : s.reg_addr.toString(16)
                                }}
                            </div>
                        </div>
                    </div>
                    <div
                        v-else-if="s.type === 'ir' || s.type === 'hr'"
                        class="w-full flex items-center justify-between text-[#35FED0] text-xs"
                    >
                        <div class="flex flex-col justify-end gap-[6px]">
                            <div class="h-[12px]"></div>
                            <div class="h-[12px] text-[#01F0FF]">
                                {{ s.type === 'hr' ? 'RW' : 'RO' }}
                            </div>
                        </div>
                        <div class="flex flex-col items-end justify-end gap-[6px]">
                            <div class="h-[12px] text-[#9BE7FF]">
                                {{ numberingSystem === 'dec' ? s.val : s.val.toString(16) }}
                            </div>
                            <div class="h-[12px] text-[#01F0FF]">
                                {{
                                    numberingSystem === 'dec' ? s.reg_addr : s.reg_addr.toString(16)
                                }}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div
            v-if="!curState.length"
            class="flex-1 absolute w-full h-full flex items-center justify-center text-[#9ADBF6] left-0 top-0"
        >
            {{ t('noObj') }}
        </div>
        <div
            class="arrow absolute top-[50%] translate-y-[-50%] right-0 cursor-pointer bg-[#092740] h-full w-[34px] z-[2] flex justify-center items-center"
            v-if="!isEndScrollEl && !props.isBig && curState.length"
            @click="handleArrowClick('toEnd')"
        >
            <ArrowIcon :class="{ disabled: notConnected }" />
        </div>
    </div>
</template>

<script lang="ts" setup>
import type { Widget } from '@/stores';
import ArrowIcon from '@/assets/ArrowIcon.vue';

const indexStore = useIndexStore();

const api = indexStore.getApi().api;

const isAborted = indexStore.getApi().isAborted;

const { notConnected, devicesState, numberingSystem } = storeToRefs(indexStore);

const isStartScrollEl = ref(true);

const isEndScrollEl = ref(false);

const scrollWrapper = ref<HTMLElement | undefined>();

const scrollEl = ref<HTMLElement | undefined>();

const activeIndex = ref<number | null>();

const activeValue = ref(0);

let getMbInfoTimer: ReturnType<typeof setTimeout> | undefined;

const leftArrowZ = ref(-1);

const props = defineProps<{
    w: { w: Widget; state: number[] };
    isBig?: boolean;
    activeIO?: {
        index: number;
        val: {
            type?: 'hr' | 'ir' | 'coil' | 'di';
            reg_addr: number;
            dev_addr: number;
            val: number;
        } | null;
    } | null;
    lastActiveIO?: {
        index: number;
        val: {
            type?: 'hr' | 'ir' | 'coil' | 'di';
            reg_addr: number;
            dev_addr: number;
            val: number;
        } | null;
    } | null;
    mouseenterTimer?: number;
    mouseleaveTimer?: number;
}>();

const state = ref<number[]>([...props.w.state]);

const fullState = ref<
    { type?: 'hr' | 'ir' | 'coil' | 'di'; reg_addr: number; dev_addr: number; val: number }[]
>([]);

const curState = computed<
    { type?: 'hr' | 'ir' | 'coil' | 'di'; reg_addr: number; dev_addr: number; val: number }[] | []
>(() => {
    return fullState.value.filter((el) => el.val !== null);
});

const emit = defineEmits<{
    (
        e: 'hover',
        index: number,
        s: { type?: 'hr' | 'ir' | 'coil' | 'di'; reg_addr: number; dev_addr: number; val: number },
    ): void;
    (e: 'leave'): void;
}>();

function handleMouseEnter(
    index: number,
    s: { type?: 'hr' | 'ir' | 'coil' | 'di'; reg_addr: number; dev_addr: number; val: number },
) {
    if (props.isBig) {
        // activeIndex.value = index;
        // activeValue.value = s;
    } else {
        emit('hover', index, s);
        leftArrowZ.value = 5;
    }
}

function handleMouseLeave() {
    if (props.isBig) {
        activeIndex.value = null;
        activeValue.value = 0;
    } else {
        emit('leave');
        leftArrowZ.value = -1;
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
        isEndScrollEl.value = wrapper.scrollWidth - wrapper.scrollLeft <= wrapper.offsetWidth * 2;
    }
}

function handleScrollMove() {
    const el = scrollEl.value;
    const wrapper = scrollWrapper.value;
    if (!el || !wrapper) return;
    isStartScrollEl.value = wrapper.scrollLeft < 10;
    isEndScrollEl.value = wrapper.scrollWidth - wrapper.scrollLeft - 10 <= wrapper.offsetWidth;
}

async function handleClick(index: number, s: number | null) {
    // if (s === null) return;
    // try {
    //     const r = await api.post('set_ent_value', {
    //         type: props.w.w.i,
    //         device: props.w.w.d,
    //         index: index,
    //         value: s ? 0 : 1,
    //     });
    //     if (r.data.status === 'ok') {
    //         const devStates = [...devicesState.value][props.w.w.d];
    //         const prevStateIndex = devStates.findIndex((el) => el.type === props.w.w.i);
    //         if (prevStateIndex !== -1 && devStates[prevStateIndex].value[index] !== undefined)
    //             devStates[prevStateIndex].value[index] = s ? 0 : 1;
    //         indexStore.setDevicesState(props.w.w.d, [...devStates]);
    //     }
    // } catch (error) {
    //     if (isAborted.value) {
    //         return;
    //     }
    //     setTimeout(() => {
    //         handleClick(index, s);
    //     }, 5);
    // }
}

watch(
    () => devicesState.value,
    () => {
        const newState = devicesState.value[props.w.w.d].find((obj) => obj.type === props.w.w.i)
            ?.value as number[];
        state.value = newState ? newState : [...props.w.state];
    },
);

async function getMbInfo() {
    try {
        const r = await api.post('get_mb_info', {
            device: props.w.w.d,
            bus: 0,
        });
        const data = (await r.data) as {
            type: ['hr' | 'di' | 'coil' | 'ir'];
            dev_addr: number[];
            reg_addr: number[];
        };
        const arr = [];
        for (let i = 0; i < state.value.length; i += 1) {
            arr.push({
                type: data.type[i],
                reg_addr: data.reg_addr[i] as number,
                dev_addr: data.dev_addr[i] as number,
                val: state.value[i],
            });
        }
        fullState.value = [...arr];
        setEndArrowState();
    } catch (error) {
        if (isAborted.value) {
            return;
        }
        return new Promise((resolve) =>
            setTimeout(() => {
                getMbInfo();
            }, 5),
        );
    }
    getMbInfoTimer = setTimeout(getMbInfo, 1000);
}

function setEndArrowState() {
    const wrapper = scrollWrapper.value;
    if (!wrapper) return;
    const elems = curState.value.length / 2;
    const scrollWidth = elems ? elems * 90 - (elems - 1) * 4 : elems * 90;
    isEndScrollEl.value = wrapper.offsetWidth >= scrollWidth;
}

onMounted(() => {
    getMbInfo();
});

onBeforeUnmount(() => {
    clearTimeout(getMbInfoTimer);
    getMbInfoTimer = undefined;
});

const { t } = useI18n({
    messages: {
        ru: {
            noObj: 'Объекты отсутствуют',
            on: 'ВКЛ',
            off: 'ВЫКЛ',
        },
        en: {
            noObj: 'Objects disabled',
            on: 'ON',
            off: 'OFF',
        },
    },
});
</script>
