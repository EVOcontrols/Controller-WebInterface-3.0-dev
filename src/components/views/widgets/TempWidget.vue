<template>
    <div>
        <WidgetHeader :w="props.w.w" />
        <TempStates
            :w="props.w"
            :activeIO="activeIO"
            :lastActiveIO="lastActiveIO"
            :mouseenterTimer="mouseenterTimer"
            :mouseleaveTimer="mouseleaveTimer"
            @hover="setActiveIO"
            @leave="resetActiveIO"
        />
        <WidgetFooter
            :isInfoVisible="false"
            :w="props.w.w"
            :activeIO="activeIO"
            @enter="$emit('enter', props.w.w.d, props.w.w.i)"
        />
    </div>
</template>

<script lang="ts" setup>
import type { Widget } from '@/stores';
import WidgetHeader from '@/components/views/widgets/WidgetHeader.vue';
import WidgetFooter from '@/components/views/widgets/WidgetFooter.vue';
import TempStates from '@/components/views/widgets/states/TempStates.vue';

const activeIO = ref<{ index: number; val: number | null } | null>(null);

const lastActiveIO = ref<{ index: number; val: number | null } | null>(null);

const mouseenterTimer = ref(0);

const mouseleaveTimer = ref(0);

const props = defineProps<{
    w: { w: Widget; state: number[] };
}>();

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
