<template>
    <div
        class="flex-1 w-full overflow-hidden px-4 relative pt-1"
        :class="props.isBig ? 'pl-[18px] pr-[8px] min-w-[54%]' : 'px-3  w-full'"
    >
        <div
            class="arrow absolute top-[50%] translate-y-[-50%] rotate-180 left-0 cursor-pointer bg-[#092740] h-full w-[34px] z-[2] flex justify-center items-center"
            v-if="!isStartScrollEl && !props.isBig && !notScan"
            @click="handleArrowClick('toStart')"
        >
            <ArrowIcon :class="{ disabled: notConnected }" />
        </div>
        <div
            v-if="!notScan"
            v-dragscroll.x
            v-on:dragscrollmove="handleScrollMove"
            class="overflow-x-auto no-scrollbar items-center"
            ref="scrollWrapper"
        >
            <div
                class="grid min-w-full gap-2"
                style="grid-template-columns: repeat(auto-fill, 24px)"
                :style="{
                    width: props.isBig
                        ? '100%'
                        : `${32 * Math.ceil(filteredState.length / 2) - 8}px`,
                }"
                ref="scrollEl"
            >
                <div
                    v-for="(s, index) in filteredState"
                    :key="index"
                    :style="{ width: 'fit-content' }"
                >
                    <div
                        class="rounded items-center pb-0.5 group flex flex-col"
                        @mouseenter="handleMouseEnter(s.i, s.val)"
                        @mouseleave="handleMouseLeave"
                    >
                        <IButtonIcon :class="{ active: s.val }" />
                        <div
                            class="mt-1 text-0.81 font-medium text-center leading-none text-[#6CB5D3]"
                        >
                            {{ s.i + 1 }}
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div
            v-else-if="!props.isBig"
            class="w-full h-full flex flex-col gap-[14px] items-center justify-center"
        >
            <div>{{ t('scanNotDone') }}</div>
            <button
                class="rounded-[32px] min-w-[104px] px-[10px] py-2 h-[1.688rem] border-[#148ef8] border flex items-center justify-center font-semibold text-[#148ef8] text-sm leading-[1.429] hover:border-[#3e7df9] hover:text-[#3e7df9] active:border-[#3e7df9] active:bg-[#3e7df9] active:text-[#adebff] transition-colors"
                @click="$emit('scan')"
            >
                {{ t('scan') }}
            </button>
        </div>
        <div
            v-else
            class="w-full h-full flex flex-col items-center justify-center text-[#6CB5D3]"
        >
            <div>{{ t('scanText') }}</div>
        </div>
        <div
            class="arrow absolute top-[50%] translate-y-[-50%] right-0 cursor-pointer bg-[#092740] h-full w-[34px] z-[2] flex justify-center items-center"
            v-if="!isEndScrollEl && !props.isBig && !notScan"
            @click="handleArrowClick('toEnd')"
        >
            <ArrowIcon :class="{ disabled: notConnected }" />
        </div>
    </div>
</template>

<script lang="ts" setup>
import type { Widget } from '@/stores';
import IButtonIcon from '@/assets/IButtonIcon.vue';
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

const notScan = ref(false);

const props = defineProps<{
    w: { w: Widget; state: [number | null] };
    isBig?: boolean;
    activeIO?: { index: number; val: number | null } | null;
    lastActiveIO?: { index: number; val: number | null } | null;
    mouseenterTimer?: number;
    mouseleaveTimer?: number;
}>();

const curState = ref<[number | null]>([...props.w.state]);

const state = computed<[number | null]>(() => {
    let res: any[] = [];
    curState.value.forEach((el) => {
        res.push(el === null ? null : el);
    });
    if (res.filter((el) => el !== null).length === 0) {
        notScan.value = true;
    }
    return res as [number | null];
});

const filteredState = computed<{ val: number; i: number }[]>(() => {
    const res = [];
    for (let index = 0; index < state.value.length; index += 1) {
        if (state.value[index] !== null) {
            res.push({ val: state.value[index], i: index });
        }
    }
    return res as { val: number; i: number }[];
});

const emit = defineEmits<{
    (e: 'hover', index: number, s: number): void;
    (e: 'scan'): void;
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

// async function handleClick(index: number, s: number | null) {
//     if (s === null) return;
//     try {
//         const r = await api.post('set_ent_value', {
//             type: props.w.w.i,
//             device: props.w.w.d,
//             index: index,
//             value: s ? 0 : 1,
//         });
//         if (r.data.status === 'ok') {
//             const devStates = [...devicesState.value][props.w.w.d];
//             const prevStateIndex = devStates.findIndex((el) => el.type === props.w.w.i);
//             if (prevStateIndex !== -1 && devStates[prevStateIndex].value[index] !== undefined)
//                 devStates[prevStateIndex].value[index] = s ? 0 : 1;
//             indexStore.setDevicesState(props.w.w.d, [...devStates]);
//         }
//     } catch (error) {
//         if (isAborted.value) {
//             return;
//         }
//         setTimeout(() => {
//             handleClick(index, s);
//         }, 5);
//     }
// }

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

onMounted(() => {
    const wrapper = scrollWrapper.value;
    const el = scrollEl.value;
    if (!wrapper || !el) return;
    if (el.offsetWidth <= wrapper.offsetWidth) isEndScrollEl.value = true;
});

watch(
    () => devicesState.value,
    () => {
        const newState = devicesState.value[props.w.w.d].find((obj) => obj.type === props.w.w.i)
            ?.state as [number | null];
        curState.value = newState ? newState : [...props.w.state];
    },
);

const { t } = useI18n({
    messages: {
        ru: {
            scanNotDone: 'Сканирование не выполнено',
            scan: 'Сканировать',
            scanText: 'Здесь появятся новые устройства ',
        },
        en: {
            scanNotDone: 'Scan not done',
            scan: 'Scan',
            scanText: 'New devices will appear here',
        },
    },
});
</script>
