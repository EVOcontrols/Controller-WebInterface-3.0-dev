<template>
    <div class="relative">
        <WidgetHeader :w="props.w.w" />
        <OwStates
            :w="props.w"
            :activeIO="activeIO"
            :lastActiveIO="lastActiveIO"
            :mouseenterTimer="mouseenterTimer"
            :mouseleaveTimer="mouseleaveTimer"
            @hover="setActiveIO"
            @leave="resetActiveIO"
            @scan="$emit('scan', true, props.w.w.d, props.w.w.i, props.w.w.bus)"
        />
        <WidgetFooter
            :isInfoVisible="false"
            :w="props.w.w"
            :activeIO="activeIO"
            @enter="$emit('enter', props.w.w.d, props.w.w.i, props.w.w.bus)"
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
import OwStates from '@/components/views/widgets/states/OwStates.vue';

const activeIO = ref<{ index: number; val: number | null } | null>(null);

const lastActiveIO = ref<{ index: number; val: number | null } | null>(null);

const mouseenterTimer = ref(0);

const mouseleaveTimer = ref(0);

const indexStore = useIndexStore();

const { devices } = storeToRefs(indexStore);

const props = defineProps<{
    w: { w: Widget; state: [number | null] };
}>();

const devStatus = computed<'on' | 'off' | 'no-conn' | 'init' | 'error' | undefined>(() => {
    return devices.value.find((el) => el.addr === props.w.w.d)?.state;
});

function setActiveIO(index: number, s: number | null) {
    clearTimeout(mouseenterTimer.value);
    clearTimeout(mouseleaveTimer.value);
    lastActiveIO.value = { index: index, val: s };
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
