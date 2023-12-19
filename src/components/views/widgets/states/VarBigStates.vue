<template>
    <div class="relative flex overflow-y-hidden rounded-l-lg w-[422px]">
        <div
            class="absolute w-full h-[18px] rotate-180"
            :style="{
                background: 'linear-gradient(180deg, rgba(9, 39, 64, 0.00) 0%, #092740 100%)',
            }"
        ></div>
        <div
            v-dragscroll.y
            class="flex overflow-y-auto w-full scrollbar-4 flex-1 p-[18px]"
            :style="{ height: 'calc(100vh - 410px)' }"
        >
            <div
                class="grid gap-1 w-full"
                :style="{ 'grid-template-columns': 'repeat(auto-fill, 60px)' }"
            >
                <div
                    v-for="(s, index) in state"
                    :key="index"
                    class="rounded group inline-flex flex-col items-end w-[61px] h-10 justify-center gap-[6px] pt-1"
                    :class="
                        props.w.w.i !== 'bin-var'
                            ? 'bg-[#143959] px-[6px]'
                            : s
                            ? 'bg-[#176F6F] px-1'
                            : 'bg-[#0D424D] px-1'
                    "
                    @mouseenter="handleMouseEnter(index, s)"
                    @mouseleave="handleMouseLeave"
                >
                    <div
                        class="text-0.81 font-medium text-center leading-none select-none"
                        :class="props.w.w.i !== 'bin-var' ? 'text-[#8DC5F6]' : 'text-[#97FFE7]'"
                    >
                        {{
                            s === null
                                ? '\u2013'
                                : props.w.w.i !== 'bin-var'
                                ? s
                                : s
                                ? t('true')
                                : t('false')
                        }}
                    </div>
                    <div
                        class="text-0.81 font-medium text-center leading-none select-none"
                        :class="props.w.w.i !== 'bin-var' ? 'text-[#4C84B6]' : 'text-[#35FED0]'"
                    >
                        {{ index + 1 }}
                    </div>
                </div>
            </div>
        </div>
        <div
            class="absolute w-full h-[18px] bottom-0"
            :style="{
                background: 'linear-gradient(180deg, rgba(9, 39, 64, 0.00) 0%, #092740 100%)',
            }"
        ></div>
    </div>
</template>

<script lang="ts" setup>
import type { Widget } from '@/stores';

const indexStore = useIndexStore();

const { notConnected, devicesState } = storeToRefs(indexStore);

const activeIndex = ref<number | null>();

const activeValue = ref(0);

const props = defineProps<{
    w: { w: Widget; state: number[] };
    isBig?: boolean;
    activeIO?: { index: number; val: number } | null;
    lastActiveIO?: { index: number; val: number } | null;
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

watch(
    () => devicesState.value,
    () => {
        const newState = devicesState.value
            .find((obj) => obj.device === props.w.w.d)
            ?.interfVal.find((obj) => obj.type === props.w.w.i)?.value;
        state.value = newState ? newState : [...props.w.state];
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
