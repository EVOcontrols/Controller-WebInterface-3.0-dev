<template>
    <div
        class="flex-1 relative overflow-hidden"
        :class="props.isBig ? 'pl-[18px] pr-[8px]  w-[422px]' : 'px-3  w-full'"
    >
        <div class="flex items-center overflow-x-auto no-scrollbar flex-none pt-2">
            <div
                class="flex w-full grid min-w-full gap-2"
                :style="{ 'grid-template-columns': 'repeat(auto-fill, 24px)' }"
            >
                <div
                    v-for="(s, i) in state"
                    :key="i"
                    class="rounded group inline-flex flex-col transition-spacing duration-300 relative"
                    :class="{ 'hover:bg-[#113655]': !props.isBig }"
                    :style="{ height: 'fit-content' }"
                    @mouseenter="handleMouseEnter(i, s)"
                    @mouseleave="handleMouseLeave"
                >
                    <IButtonIcon :class="{ active: s }" />
                    <div
                        class="mt-1 text-0.81 font-medium text-center leading-none"
                        :class="notConnected ? 'text-[#3E688E]' : 'text-[#6CB5D3]'"
                    >
                        {{ i + 1 }}
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import type { Widget } from '@/stores';
import IButtonIcon from '@/assets/IButtonIcon.vue';

const indexStore = useIndexStore();

const { notConnected, devicesState } = storeToRefs(indexStore);

const props = defineProps<{
    w: { w: Widget; state: number[] };
    isBig?: boolean;
}>();

const state = ref<number[]>([...props.w.state]);

const emit = defineEmits<{
    (e: 'hover', index: number, s: number): void;
    (e: 'leave'): void;
}>();

function handleMouseEnter(i: number, s: number | null) {
    if (s === null) return;
    if (!props.isBig) {
        emit('hover', i, s);
    }
}

function handleMouseLeave() {
    if (!props.isBig) {
        emit('leave');
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
</script>
