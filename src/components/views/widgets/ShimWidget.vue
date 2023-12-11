<template>
    <div>
        <WidgetHeader :w="props.w.w" />
        <ShimStates
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
            :activeIO="activeIO"
            @enter="$emit('enter', props.w.w.d, props.w.w.i)"
        />
    </div>
</template>

<script lang="ts" setup>
import type { Widget } from '@/stores';
import WidgetHeader from '@/components/views/widgets/WidgetHeader.vue';
import WidgetFooter from '@/components/views/widgets/WidgetFooter.vue';
import ShimStates from '@/components/views/widgets/states/ShimStates.vue';

const activeIO = ref<{ index: number; val: number } | null>(null);

const lastActiveIO = ref<{ index: number; val: number } | null>(null);

const mouseenterTimer = ref(0);

const mouseleaveTimer = ref(0);

const props = defineProps<{
    w: { w: Widget; state: number[] };
}>();

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
