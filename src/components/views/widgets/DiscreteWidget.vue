<template>
    <div class="relative">
        <WidgetHeader :w="props.w.w" />
        <DiscreteOutStates
            v-if="props.w.w.i === 'bin-out'"
            :w="props.w"
            :activeIO="activeIO"
            :lastActiveIO="lastActiveIO"
            :mouseenterTimer="mouseenterTimer"
            :mouseleaveTimer="mouseleaveTimer"
            @hover="setActiveIO"
            @leave="resetActiveIO"
        />
        <DiscreteStates
            v-else
            :w="props.w"
            :activeIO="activeIO"
            :lastActiveIO="lastActiveIO"
            :mouseenterTimer="mouseenterTimer"
            :mouseleaveTimer="mouseleaveTimer"
            @hover="setActiveIO"
            @leave="resetActiveIO"
        />
        <WidgetFooter
            :isInfoVisible="['bin-in'].includes(props.w.w.i)"
            :w="props.w.w"
            :activeIO="activeIO"
            @enter="$emit('enter', props.w.w.d, props.w.w.i)"
        />
        <div
            v-if="devStatus === 'init'"
            class="absolute w-full h-full"
            :style="{ background: 'rgba(9, 39, 64, 0.85)' }"
        ></div>
    </div>
</template>

<script lang="ts" setup>
import type { Widget } from '@/stores';
import WidgetHeader from '@/components/views/widgets/WidgetHeader.vue';
import WidgetFooter from '@/components/views/widgets/WidgetFooter.vue';
import DiscreteStates from '@/components/views/widgets/states/DiscreteStates.vue';
import DiscreteOutStates from '@/components/views/widgets/states/DiscreteOutStates.vue';

const activeIO = ref<{ index: number; val: number } | null>(null);

const lastActiveIO = ref<{ index: number; val: number } | null>(null);

const mouseenterTimer = ref(0);

const mouseleaveTimer = ref(0);

const indexStore = useIndexStore();

const { devices } = storeToRefs(indexStore);

const props = defineProps<{
    w: { w: Widget; state: number[] };
}>();

const devStatus = computed<'on' | 'off' | 'no-conn' | 'init' | 'error' | undefined>(() => {
    return devices.value.find((el) => el.addr === props.w.w.d)?.state;
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
</script>
