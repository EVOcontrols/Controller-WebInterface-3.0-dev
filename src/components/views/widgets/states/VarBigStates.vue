<template>
    <div class="relative flex overflow-y-hidden rounded-l-lg w-[424px]">
        <div
            class="absolute w-full h-[18px] rotate-180"
            :style="{
                background: 'linear-gradient(180deg, rgba(9, 39, 64, 0.00) 0%, #092740 100%)',
            }"
        ></div>
        <div
            v-dragscroll.y
            class="flex flex-col overflow-y-auto w-full scrollbar-4 flex-1 p-[14px]"
            :style="{ height: 'calc(100vh - 410px)' }"
        >
            <div
                class="grid gap-1 w-full"
                :style="{ 'grid-template-columns': 'repeat(auto-fill, 60px)' }"
            >
                <div
                    v-for="(s, index) in state"
                    :key="index"
                    class="rounded group inline-flex flex-col items-end w-[61px] h-10 justify-center gap-[6px] pt-1 border border-transparent transition-all duration-300"
                    :class="[
                        props.w.w.i !== 'bin-var'
                            ? 'bg-[#143959] px-[6px]'
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
                        :class="props.w.w.i !== 'bin-var' ? 'text-[#8DC5F6]' : 'text-[#97FFE7]'"
                    >
                        {{
                            s === null
                                ? '\u2013'
                                : props.w.w.i !== 'bin-var'
                                ? props.w.w.i === 'tim-var'
                                    ? s <= 1000
                                        ? `${s} ${t('ms')}`
                                        : s > 1000 && s % 60000 === 0
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
                        :class="props.w.w.i !== 'bin-var' ? 'text-[#4C84B6]' : 'text-[#35FED0]'"
                    >
                        {{ index + 1 }}
                    </div>
                </div>
                <div class="w-full h-[18px] bottom-0"></div>
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
import type { InterfVal, Widget } from '@/stores';

const indexStore = useIndexStore();

const { notConnected, devicesState } = storeToRefs(indexStore);

const api = indexStore.getApi().api;

const isAborted = indexStore.getApi().isAborted;

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

watch(
    () => devicesState.value,
    () => {
        const newState = devicesState.value[props.w.w.d].find((obj: InterfVal) => obj.type === props.w.w.i)
            ?.state as number[];
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
