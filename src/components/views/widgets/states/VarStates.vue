<template>
    <div
        class="flex-1 relative w-full overflow-hidden px-3 pt-[0.5625rem]"
        :class="props.isBig ? 'pl-[18px] pr-[8px] min-w-[54%]' : 'px-3  w-full'"
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
            class="items-center overflow-x-auto no-scrollbar"
            ref="scrollWrapper"
        >
            <div
                class="grid gap-1 grid-rows-2 grid-flow-col"
                ref="scrollEl"
            >
                <div
                    v-for="(s, index) in state"
                    :key="index"
                    class="rounded group inline-flex flex-col items-end w-[61px] h-10 justify-center gap-[6px] transition-all duration-300 border border-transparent"
                    :class="[
                        props.w.w.i !== 'bin-var'
                            ? 'bg-[#143959] hover:bg-[#285C88] px-2'
                            : s
                            ? 'bg-[#176F6F] hover:border-[#35FED0] px-1'
                            : 'bg-[#0D424D] hover:border-[#35FED0] px-1',
                        { 'cursor-pointer': props.w.w.i === 'bin-var' },
                    ]"
                    @mouseenter="handleMouseEnter(index, s)"
                    @mouseleave="handleMouseLeave"
                    @click="handleClick(index, s)"
                >
                    <div
                        class="text-0.81 font-medium text-center leading-none select-none"
                        :class="
                            notConnected
                                ? 'text-[#3E688E]'
                                : props.w.w.i !== 'bin-var'
                                ? 'text-[#8DC5F6]'
                                : 'text-[#97FFE7]'
                        "
                    >
                        {{
                            s === null
                                ? '\u2013'
                                : props.w.w.i !== 'bin-var'
                                ? props.w.w.i === 'tim-var'
                                    ? s <= 15000
                                        ? `${s} ${t('ms')}`
                                        : s > 150000 && s % 60000 === 0
                                        ? `${s / 60000} ${t('min')}`
                                        : `${s / 1000} ${t('s')}`
                                    : s
                                : s
                                ? t('true')
                                : t('false')
                        }}
                    </div>
                    <div
                        class="text-0.81 font-medium text-center leading-none select-none"
                        :class="
                            notConnected
                                ? 'text-[#3E688E]'
                                : props.w.w.i !== 'bin-var'
                                ? 'text-[#4C84B6]'
                                : 'text-[#35FED0]'
                        "
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
import type { Widget, InterfVal } from '@/stores';
import ArrowIcon from '@/assets/ArrowIcon.vue';

const indexStore = useIndexStore();

const api = indexStore.getApi().api;

const isAborted = indexStore.getApi().isAborted;

const { notConnected, devicesState } = storeToRefs(indexStore);

const isStartScrollEl = ref(true);

const isEndScrollEl = ref(false);

const scrollWrapper = ref<HTMLElement | undefined>();

const scrollEl = ref<HTMLElement | undefined>();

const activeIndex = ref<number | null>();

const activeValue = ref(0);

const props = defineProps<{
    w: { w: Widget; state: number[] };
    isBig?: boolean;
    activeIO?: { index: number; val: number | null } | null;
    lastActiveIO?: { index: number; val: number | null } | null;
    mouseenterTimer?: number;
    mouseleaveTimer?: number;
}>();

const state = ref<number[]>([...props.w.state]);

const emit = defineEmits<{
    (e: 'hover', index: number, s: number): void;
    (e: 'leave'): void;
}>();

function handleMouseEnter(index: number, s: number) {
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

async function handleClick(index: number, s: number | null) {
    if (props.w.w.i !== 'bin-var' || s === null) return;
    try {
        const r = await api.post('set_ent_value', {
            type: props.w.w.i,
            device: props.w.w.d,
            index: index,
            value: s ? 0 : 1,
        });
        if (r.data.status === 'ok') {
            const devStates = [...devicesState.value][props.w.w.d];
            const prevStateIndex = devStates.findIndex(
                (el: {
                    type: string;
                    device: number;
                    index: number;
                    state: number[] | [number | null][] | null[];
                    bus?: number | undefined;
                }) => el.type === props.w.w.i,
            );
            if (prevStateIndex !== -1 && devStates[prevStateIndex].state[index] !== undefined)
                devStates[prevStateIndex].state[index] = s ? 0 : 1;
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

watch(
    () => devicesState.value,
    () => {
        const newState = devicesState.value[props.w.w.d].find(
            (obj: InterfVal) => obj.type === props.w.w.i,
        )?.state as number[];
        state.value = newState ? newState : [...props.w.state];
    },
);

const { t } = useI18n({
    messages: {
        ru: {
            true: 'ИСТИНА',
            false: 'ЛОЖЬ',
            ms: 'мс',
            s: 'с',
            min: 'мин',
        },
        en: {
            true: 'TRUE',
            false: 'FALSE',
            ms: 'ms',
            s: 's',
            min: 'min',
        },
    },
});
</script>
