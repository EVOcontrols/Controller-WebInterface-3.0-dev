<template>
    <div class="flex-1 relative w-full overflow-hidden px-[12px]">
        <div
            class="flex h-full overflow-x-auto no-scrollbar py-[18px]"
            ref="scrollWrapper"
        >
            <div
                v-if="!notScan"
                class="flex flex-wrap gap-y-[10px]"
            >
                <div
                    v-for="(s, index) in state"
                    :key="index"
                    @mouseenter="handleMouseEnter(index, s)"
                    @mouseleave="handleMouseLeave"
                >
                    <div
                        v-if="s !== null"
                        class="mr-[6px] w-[17px] rounded flex flex-col items-center justify-center gap-[6px] transition-all duration-300 bg-transparent hover:bg-[#113655]"
                        :style="{ height: 'fit-content' }"
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
        </div>
    </div>
</template>

<script lang="ts" setup>
import type { Widget } from '@/stores';

const indexStore = useIndexStore();

const { devicesState } = storeToRefs(indexStore);

const scrollWrapper = ref<HTMLElement | undefined>();

const activeIndex = ref<number | null>();

const activeValue = ref(0);

const notScan = ref(false);

const props = defineProps<{
    w: { w: Widget; state: [number | null][] };
    isBig?: boolean;
    activeIO?: { index: number; val: number | null } | null;
    lastActiveIO?: { index: number; val: number | null } | null;
    mouseenterTimer?: number;
    mouseleaveTimer?: number;
}>();

const emit = defineEmits<{
    (e: 'hover', index: number, s: number): void;
    (e: 'scan'): void;
    (e: 'leave'): void;
}>();

const curState = ref<[number | null][]>([...props.w.state]);

const state = computed<[number | null]>(() => {
    let res: any[] = [];
    curState.value.forEach((el) => {
        res.push(el[0] === null ? null : el[0]);
    });
    if (res.filter((el) => el !== null).length === 0) {
        notScan.value = true;
    }
    return res as [number | null];
});

function handleMouseEnter(index: number, s: number | null) {
    if (s === null) return;
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
        const newState = devicesState.value[props.w.w.d].find((obj) => obj.type === props.w.w.i)
            ?.value as [number | null][];
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
