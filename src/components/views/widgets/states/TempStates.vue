<template>
    <div class="flex-1 relative w-full overflow-hidden px-[14px]">
        <div
            class="flex h-full items-center overflow-x-auto no-scrollbar"
            ref="scrollWrapper"
        >
            <div class="flex flex-wrap">
                <div
                    v-for="(s, index) in state"
                    :key="index"
                    class="w-[24px] h-[38px] rounded flex flex-col items-center justify-center gap-[6px] transition-all duration-300 bg-transparent hover:bg-[#113655]"
                    @mouseenter="handleMouseEnter(index, s)"
                    @mouseleave="handleMouseLeave"
                >
                    <div
                        class="w-[11px] h-[11px] rounded-[50%]"
                        :class="s >= 0 ? 'bg-[#EB8246]' : 'bg-[#35A1FF]'"
                    ></div>
                    <div class="text-0.81 font-medium text-center leading-none select-none">
                        {{ index + 1 }}
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import type { Widget } from '@/stores';
import ArrowIcon from '@/assets/ArrowIcon.vue';

const { api } = useApi();

const indexStore = useIndexStore();

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
        const newState = devicesState.value
            .find((obj) => obj.device === props.w.w.d)
            ?.interfVal.find((obj) => obj.type === props.w.w.i)?.value;
        // state.value = newState ? newState : [...props.w.state];
    },
);

const { t } = useI18n({
    messages: {
        ru: {
            true: 'ИСТИНА',
            false: 'ЛОЖЬ',
        },
        en: {
            true: 'TRUE',
            false: 'FALSE',
        },
    },
});
</script>
