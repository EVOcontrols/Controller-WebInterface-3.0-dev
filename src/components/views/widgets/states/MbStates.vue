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
                    class="relative select-none rounded group inline-flex flex-col items-end w-[90px] h-10 justify-center gap-[6px] transition-all duration-300 border border-transparent px-[6px]"
                    :class="[
                        {
                            'bg-[#193550]': s.val === 'err',
                        },
                        {
                            'bg-[#183C5E]': s.val === null,
                        },
                        {
                            'hover:border-[#35FED0]':
                                s.val !== null &&
                                s.val !== 'err' &&
                                (s.type === 'di' ||
                                    s.type === 'coil' ||
                                    s.type === 'wm-coil' ||
                                    s.type === 'w-coil' ||
                                    s.type === 'm-coil'),
                        },
                        {
                            'bg-[#176F6F]':
                                (s.type === 'di' ||
                                    s.type === 'coil' ||
                                    s.type === 'wm-coil' ||
                                    s.type === 'w-coil' ||
                                    s.type === 'm-coil') &&
                                s.val &&
                                s.val !== 'err',
                        },
                        {
                            'bg-[#0D424D]':
                                (s.type === 'di' ||
                                    s.type === 'coil' ||
                                    s.type === 'wm-coil' ||
                                    s.type === 'w-coil' ||
                                    s.type === 'm-coil') &&
                                !s.val &&
                                s.val !== null,
                        },
                        {
                            'bg-[#006B83]':
                                (s.type === 'hr' ||
                                    s.type === 'wm-hr' ||
                                    s.type === 'w-hr' ||
                                    s.type === 'm-hr' ||
                                    s.type === 'ir') &&
                                s.val !== null &&
                                s.val !== 'err',
                        },
                        {
                            'hover:border-[#01F0FF]':
                                (s.type === 'hr' ||
                                    s.type === 'wm-hr' ||
                                    s.type === 'w-hr' ||
                                    s.type === 'm-hr' ||
                                    s.type === 'ir') &&
                                s.val !== null &&
                                s.val !== 'err',
                        },
                    ]"
                    :key="index"
                    @mouseenter="handleMouseEnter(index, s)"
                    @mouseleave="handleMouseLeave"
                >
                    <div
                        class="absolute w-full h-full rounded left-0 top-0 z-[-1] group-hover:z-[4]"
                        :class="{
                            'cursor-pointer':
                                (s.type === 'coil' ||
                                    s.type === 'wm-coil' ||
                                    s.type === 'w-coil' ||
                                    s.type === 'm-coil') &&
                                s.val !== 'err' &&
                                s.val !== null,
                        }"
                        @click="handleClick(index, s)"
                    ></div>
                    <div
                        v-if="s.type === 'di'"
                        class="w-full flex flex-col items-center justify-between"
                        :class="
                            s.val === null
                                ? 'text-[#3E688E]'
                                : s.val === 'err'
                                ? 'text-[#F83068]'
                                : 'text-[#35FED0]'
                        "
                    >
                        <div
                            v-if="s.val === 'err'"
                            class="w-full flex justify-end"
                        >
                            {{ t('error') }}
                        </div>
                        <div class="w-full flex items-center justify-between">
                            <span>RO</span>
                            <span class="uppercase">{{
                                numberingSystem === 'dec' ? s.reg_addr : s.reg_addr.toString(16)
                            }}</span>
                        </div>
                    </div>
                    <div
                        v-else-if="
                            s.type === 'coil' ||
                            s.type === 'wm-coil' ||
                            s.type === 'w-coil' ||
                            s.type === 'm-coil'
                        "
                        class="w-full flex items-center justify-between"
                        :class="
                            s.val === null
                                ? 'text-[#3E688E]'
                                : s.val === 'err'
                                ? 'text-[#F83068]'
                                : 'text-[#35FED0]'
                        "
                    >
                        <div
                            v-if="s.val !== 'err'"
                            class="flex flex-col justify-end gap-[6px]"
                        >
                            <div class="h-[12px]">
                                {{ s.type === 'wm-coil' || s.type === 'm-coil' ? 'M' : '' }}
                            </div>
                            <div class="h-[12px]">
                                {{ s.type === 'wm-coil' || s.type === 'w-coil' ? 'WO' : 'RW' }}
                            </div>
                        </div>
                        <div
                            v-if="s.val !== 'err'"
                            class="flex flex-col items-end justify-end gap-[6px]"
                        >
                            <div
                                class="h-[12px]"
                                :class="{ 'text-[#97FFE7]': s.val !== null }"
                            >
                                {{ s.val ? t('on') : t('off') }}
                            </div>
                            <div class="h-[12px] uppercase">
                                {{
                                    numberingSystem === 'dec' ? s.reg_addr : s.reg_addr.toString(16)
                                }}
                            </div>
                        </div>
                        <div
                            v-if="s.val === 'err'"
                            class="flex flex-col justify-end gap-[6px]"
                        >
                            <div class="h-[12px]">
                                {{
                                    s.type === 'wm-coil'
                                        ? 'WM'
                                        : s.type === 'w-coil'
                                        ? 'W'
                                        : s.type === 'm-coil'
                                        ? 'M'
                                        : ''
                                }}
                            </div>
                            <div class="h-[12px]">RW</div>
                        </div>
                        <div
                            v-if="s.val === 'err'"
                            class="flex flex-col items-end justify-end gap-[6px]"
                        >
                            <div class="h-[12px]">
                                {{ t('error') }}
                            </div>
                            <div class="h-[12px] uppercase">
                                {{
                                    numberingSystem === 'dec' ? s.reg_addr : s.reg_addr.toString(16)
                                }}
                            </div>
                        </div>
                    </div>
                    <div
                        v-else-if="
                            s.type === 'ir' || s.type === 'hr' || 'wm-hr' || ' w-hr' || 'm-hr'
                        "
                        class="w-full flex items-center justify-between"
                        :class="
                            s.val === null
                                ? 'text-[#3E688E]'
                                : s.val === 'err'
                                ? 'text-[#F83068]'
                                : 'text-[#01F0FF]'
                        "
                    >
                        <div class="flex flex-col justify-end gap-[6px]">
                            <div class="h-[12px]">
                                {{ s.type === 'm-hr' || s.type === 'wm-hr' ? 'M' : '' }}
                            </div>
                            <div class="h-[12px]">
                                {{
                                    s.type === 'ir'
                                        ? 'RO'
                                        : s.type === 'w-hr' || s.type === 'wm-hr'
                                        ? 'WO'
                                        : 'RW'
                                }}
                            </div>
                        </div>
                        <div class="flex flex-col items-end justify-end gap-[6px]">
                            <div
                                v-if="s.val !== null && s.val !== 'err'"
                                class="h-[12px] text-[#9BE7FF] uppercase"
                            >
                                {{ numberingSystem === 'dec' ? s.val : s.val.toString(16) }}
                            </div>
                            <div
                                v-else-if="s.val === 'err'"
                                class="h-[12px] text-[#F83068]"
                            >
                                {{ t('error') }}
                            </div>
                            <div
                                v-else
                                class="h-[12px] text-[#3E688E]"
                            >
                                -
                            </div>
                            <div class="h-[12px] uppercase">
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

const { notConnected, devicesState, numberingSystem, mbDevs } = storeToRefs(indexStore);

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
            type:
                | 'hr'
                | 'wm-hr'
                | 'w-hr'
                | 'm-hr'
                | 'ir'
                | 'coil'
                | 'wm-coil'
                | 'w-coil'
                | 'm-coil'
                | 'di';
            reg_addr: number;
            dev_addr: number;
            val: number | null | 'err';
        } | null;
    } | null;
    lastActiveIO?: {
        index: number;
        val: {
            type:
                | 'hr'
                | 'wm-hr'
                | 'w-hr'
                | 'm-hr'
                | 'ir'
                | 'coil'
                | 'wm-coil'
                | 'w-coil'
                | 'm-coil'
                | 'di';
            reg_addr: number;
            dev_addr: number;
            val: number | null | 'err';
        } | null;
    } | null;
    mouseenterTimer?: number;
    mouseleaveTimer?: number;
}>();

const state = ref<(number | null | 'err')[]>([...props.w.state]);

const fullState = ref<
    {
        type:
            | 'hr'
            | 'wm-hr'
            | 'w-hr'
            | 'm-hr'
            | 'ir'
            | 'coil'
            | 'wm-coil'
            | 'w-coil'
            | 'm-coil'
            | 'di'
            | 'none';
        reg_addr: number;
        dev_addr: number;
        val: number | null | 'err';
    }[]
>([]);

const curState = computed<
    | {
          type:
              | 'hr'
              | 'wm-hr'
              | 'w-hr'
              | 'm-hr'
              | 'ir'
              | 'coil'
              | 'wm-coil'
              | 'w-coil'
              | 'm-coil'
              | 'di';
          reg_addr: number;
          dev_addr: number;
          val: number | null | 'err';
      }[]
    | []
>(() => {
    return fullState.value.filter((el) => el.type !== 'none') as {
        type:
            | 'hr'
            | 'wm-hr'
            | 'w-hr'
            | 'm-hr'
            | 'ir'
            | 'coil'
            | 'wm-coil'
            | 'w-coil'
            | 'm-coil'
            | 'di';
        reg_addr: number;
        dev_addr: number;
        val: number | null | 'err';
    }[];
});

const emit = defineEmits<{
    (
        e: 'hover',
        index: number,
        newIndex: number,
        s: {
            type:
                | 'hr'
                | 'wm-hr'
                | 'w-hr'
                | 'm-hr'
                | 'ir'
                | 'coil'
                | 'wm-coil'
                | 'w-coil'
                | 'm-coil'
                | 'di';
            reg_addr: number;
            dev_addr: number;
            val: number | null | 'err';
        },
    ): void;
    (e: 'leave'): void;
}>();

function handleMouseEnter(
    index: number,
    s: {
        type:
            | 'hr'
            | 'wm-hr'
            | 'w-hr'
            | 'm-hr'
            | 'ir'
            | 'coil'
            | 'wm-coil'
            | 'w-coil'
            | 'm-coil'
            | 'di';
        reg_addr: number;
        dev_addr: number;
        val: number | null | 'err';
    },
) {
    if (!props.isBig) {
        let newIndex = index;
        for (let i = 0; i <= newIndex; i += 1) {
            if (fullState.value[i].type !== 'none') newIndex += 1;
        }
        emit('hover', index, newIndex, s);
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

async function handleClick(
    index: number,
    s: {
        type:
            | 'hr'
            | 'wm-hr'
            | 'w-hr'
            | 'm-hr'
            | 'ir'
            | 'coil'
            | 'wm-coil'
            | 'w-coil'
            | 'm-coil'
            | 'di';
        reg_addr: number;
        dev_addr: number;
        val: number | null | 'err';
    },
) {
    if (
        (s.type !== 'coil' && s.type !== 'wm-coil' && s.type !== 'w-coil' && s.type !== 'm-coil') ||
        s.val === null ||
        s.val === 'err'
    )
        return;
    try {
        let newIndex = index;
        for (let i = 0; i <= newIndex; i += 1) {
            if (fullState.value[i].type === 'none') newIndex += 1;
        }
        const r = await api.post('set_ent_value', {
            type: props.w.w.i,
            device: props.w.w.d,
            index: newIndex,
            bus: 0,
            value: s.val ? 0 : 1,
        });
        if (r.data.status === 'ok') {
            const devStates = [...devicesState.value][props.w.w.d];
            const prevStateIndex = devStates.findIndex((el) => el.type === props.w.w.i);
            if (prevStateIndex !== -1 && devStates[prevStateIndex].value[newIndex] !== undefined)
                devStates[prevStateIndex].value[newIndex] = s ? 0 : 1;
            indexStore.setDevicesState(props.w.w.d, [...devStates]);
        }
    } catch (error) {
        if (isAborted.value) {
            return;
        }
        setTimeout(() => {
            handleClick(index, s);
        }, 5);
    }
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
            type: [
                | 'hr'
                | 'wm-hr'
                | 'w-hr'
                | 'm-hr'
                | 'di'
                | 'coil'
                | 'wm-coil'
                | 'w-coil'
                | 'm-coil'
                | 'ir'
                | 'none',
            ];
            dev_addr: number[];
            reg_addr: number[];
        };
        const arr = [];
        for (let i = 0; i < state.value.length; i += 1) {
            if (mbDevs.value[props.w.w.d][props.w.w.bus || 0].includes(data.dev_addr[i])) {
                arr.push({
                    type: data.type[i],
                    reg_addr: data.reg_addr[i] as number,
                    dev_addr: data.dev_addr[i] as number,
                    val: state.value[i],
                });
            }
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
    if (!wrapper || wrapper.scrollLeft) return;
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
            error: 'ОШИБКА',
        },
        en: {
            noObj: 'Objects disabled',
            on: 'ON',
            off: 'OFF',
            error: 'ERROR',
        },
    },
});
</script>
