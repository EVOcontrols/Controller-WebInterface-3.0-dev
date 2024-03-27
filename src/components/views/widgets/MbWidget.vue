<template>
    <div>
        <WidgetHeader :w="props.w.w" />
        <MbStates
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
            @enter="$emit('mb', props.w.w)"
        />
    </div>
</template>

<script lang="ts" setup>
import type { Widget } from '@/stores';
import WidgetHeader from '@/components/views/widgets/WidgetHeader.vue';
import WidgetFooter from '@/components/views/widgets/WidgetFooter.vue';
import MbStates from '@/components/views/widgets/states/MbStates.vue';

const activeIO = ref<{
    index: number;
    val: {
        type:
            | 'hr'
            | 'wm-hr'
            | 'w-hr'
            | 'm-hr'
            | 'ir'
            | 'coil'
            | 'wm-coil'
            | 'w-coil'
            | 'm-coil'
            | 'di';
        reg_addr: number;
        dev_addr: number;
        val: number | null | 'err';
    } | null;
} | null>(null);

const lastActiveIO = ref<{
    index: number;
    newIndex: number;
    val: {
        type:
            | 'hr'
            | 'wm-hr'
            | 'w-hr'
            | 'm-hr'
            | 'ir'
            | 'coil'
            | 'wm-coil'
            | 'w-coil'
            | 'm-coil'
            | 'di';
        reg_addr: number;
        dev_addr: number;
        val: number | null | 'err';
    } | null;
} | null>(null);

const mouseenterTimer = ref(0);

const mouseleaveTimer = ref(0);

const props = defineProps<{
    w: { w: Widget; state: number[] };
}>();

function setActiveIO(
    index: number,
    newIndex: number,
    s: {
        type:
            | 'hr'
            | 'wm-hr'
            | 'w-hr'
            | 'm-hr'
            | 'ir'
            | 'coil'
            | 'wm-coil'
            | 'w-coil'
            | 'm-coil'
            | 'di';
        reg_addr: number;
        dev_addr: number;
        val: number | null | 'err';
    } | null,
) {
    clearTimeout(mouseenterTimer.value);
    clearTimeout(mouseleaveTimer.value);
    lastActiveIO.value = { index: index, newIndex: newIndex, val: s };
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
