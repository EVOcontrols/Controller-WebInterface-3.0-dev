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
                    v-for="(s, i) in props.w.state"
                    :key="i"
                    class="rounded group inline-flex flex-col transition-spacing duration-300 relative cursor-pointer h-[41px]"
                    @mouseenter="handleMouseEnter(i, s)"
                    @mouseleave="handleMouseLeave"
                    @click="handleClick(i, s)"
                >
                    <IButtonOutIcon
                        :isHovered="props.activeIO?.index === i"
                        :isActive="!!s"
                    />
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
import IButtonOutIcon from '@/assets/IButtonOutIcon.vue';

const { api } = useApi();

const indexStore = useIndexStore();

const { notConnected } = storeToRefs(indexStore);

const props = defineProps<{
    w: { w: Widget; state: number[] };
    activeIO?: { index: number; val: number } | null;
    isBig?: boolean;
}>();

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

async function handleClick(index: number, s: number) {
    try {
        await api.post('set_ent_value', {
            type: props.w.w.i,
            device: props.w.w.d,
            index: index,
            value: s ? 0 : 1,
        });
    } catch (error) {
        //
    }
}
</script>
