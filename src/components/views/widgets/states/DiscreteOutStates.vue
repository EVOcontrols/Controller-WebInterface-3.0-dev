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
                    class="rounded group inline-flex flex-col transition-spacing duration-300 relative h-[41px]"
                    :class="{ 'cursor-pointer': !props.isBig }"
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

const indexStore = useIndexStore();

const api = indexStore.getApi().api;

const isAborted = indexStore.getApi().isAborted;

const { notConnected, devicesState } = storeToRefs(indexStore);

const props = defineProps<{
    w: { w: Widget; state: number[] };
    activeIO?: { index: number; val: number } | null;
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

async function handleClick(index: number, s: number) {
    try {
        const r = await api.post('set_ent_value', {
            type: props.w.w.i,
            device: props.w.w.d,
            index: index,
            value: s ? 0 : 1,
        });
        if (r.data.status === 'ok') {
            const devStates = [...devicesState.value][props.w.w.d];
            const prevStateIndex = devStates.findIndex((el) => el.type === props.w.w.i);
            if (prevStateIndex !== -1 && devStates[prevStateIndex].value[index] !== undefined)
                devStates[prevStateIndex].value[index] = s ? 0 : 1;
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
</script>
