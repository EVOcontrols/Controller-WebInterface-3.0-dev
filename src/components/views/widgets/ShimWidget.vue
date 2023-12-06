<template>
    <div>
        <WidgetHeader :w="props.w" />
        <div class="flex-1 px-3 relative">
            <div
                class="absolute top-[50%] translate-y-[-50%] rotate-180 left-[6px] cursor-pointer bg-[#092740] h-full w-[34px] z-[2] flex justify-center items-center"
                v-if="!isStartScrollEl"
                @click="handleArrowClick('toStart')"
            >
                <ArrowIcon :class="{ disabled: notConnected }" />
            </div>
            <div
                v-dragscroll.x
                v-on:dragscrollmove="handleScrollMove"
                class="flex h-full items-center overflow-x-auto no-scrollbar w-full flex-none"
                ref="scrollWrapper"
            >
                <div
                    class="flex h-full py-[10px] items-center flex-none gap-[1px] flex-none"
                    ref="scrollEl"
                >
                    <div
                        v-for="(s, index) in state"
                        :key="index"
                        class="rounded group inline-flex flex-col h-full py-1 hover:bg-[#113655] transition-spacing duration-300 relative"
                        @mouseenter="setActiveIO(index, s)"
                        @mouseleave="resetActiveIO"
                    >
                        <div
                            class="flex items-end flex-1 w-1.5 mx-2 overflow-hidden relative bg-[#07435d] rounded-2xl cursor-pointer parent z-[1] peer"
                            @mousedown.left="quickChange(index, $event, s)"
                        >
                            <div
                                class="w-full bg-[#00b3cb] transition-all duration-500"
                                :style="{
                                    height: s + '%',
                                    'border-radius': s === 100 ? '18px' : '0 0 18px 18px',
                                }"
                            ></div>
                        </div>
                        <div
                            class="mt-2 text-[#6CB5D3] text-0.81 font-medium text-center leading-none"
                        >
                            {{ index + 1 }}
                        </div>
                    </div>
                </div>
            </div>

            <div
                class="absolute top-[50%] translate-y-[-50%] right-[6px] cursor-pointer bg-[#092740] h-full w-[34px] z-[2] flex justify-center items-center"
                v-if="!isEndScrollEl"
                @click="handleArrowClick('toEnd')"
            >
                <ArrowIcon :class="{ disabled: notConnected }" />
            </div>
        </div>
        <WidgetFooter
            :isInfoVisible="false"
            :activeIO="activeIO"
            @enter="$emit('enter', props.w.d, props.w.i)"
        />
    </div>
</template>

<script lang="ts" setup>
import type { Widget } from '@/stores';
import WidgetHeader from '@/components/views/widgets/WidgetHeader.vue';
import WidgetFooter from '@/components/views/widgets/WidgetFooter.vue';
import ArrowIcon from '@/assets/ArrowIcon.vue';
const { api } = useApi();

const indexStore = useIndexStore();

const { devicesState, notConnected } = storeToRefs(indexStore);

const activeIO = ref<{ index: number; val: number } | null>(null);

const lastActiveIO = ref<{ index: number; val: number } | null>(null);

const mouseenterTimer = ref(0);

const mouseleaveTimer = ref(0);

const isStartScrollEl = ref(true);

const isEndScrollEl = ref(false);

const scrollWrapper = ref<HTMLElement | undefined>();

const scrollEl = ref<HTMLElement | undefined>();

const props = defineProps<{
    w: Widget;
}>();

const state = computed<number[]>(() => {
    const obj = devicesState.value[props.w.d]?.interfVal.find((i) => i.type === props.w.i);
    const res: number[] = (obj?.value as number[]) || [];
    return res;
});

function setActiveIO(index: number, s: number | null) {
    clearTimeout(mouseenterTimer.value);
    clearTimeout(mouseleaveTimer.value);
    lastActiveIO.value = { index: index, val: s || 0 };
    mouseenterTimer.value = setTimeout(() => {
        if (lastActiveIO.value !== null) activeIO.value = lastActiveIO.value;
    }, 50);
}

function resetActiveIO() {
    clearTimeout(mouseenterTimer.value);
    clearTimeout(mouseleaveTimer.value);
    mouseleaveTimer.value = setTimeout(() => {
        activeIO.value = null;
        lastActiveIO.value = null;
    }, 50);
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
    }
}

function handleScrollMove() {
    const el = scrollEl.value;
    const wrapper = scrollWrapper.value;
    if (!el || !wrapper || wrapper.offsetWidth === el.offsetWidth) return;
    isStartScrollEl.value = wrapper.scrollLeft < 10 ? true : false;
}
async function quickChange(index: number, e: Event, currentState: number | null) {
    const { d, i } = props.w;
    try {
        await api.post('set_ent_value', {
            type: i,
            device: d,
            index: index,
            value: currentState === 0 ? 10000 : 0,
        });
    } catch (error) {
        //
    }
}

watch(
    () => props.w,
    () => {
        const el = scrollEl.value;
        const wrapper = scrollWrapper.value;
        if (!wrapper || !el) return;
        isEndScrollEl.value = wrapper.scrollLeft + wrapper.offsetWidth >= el.offsetWidth - 10;
    },
);
</script>
