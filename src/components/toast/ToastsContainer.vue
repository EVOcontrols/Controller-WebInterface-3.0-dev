<template>
    <div class="fixed top-5 right-0 w-0 h-0 z-50">
        <transition-group name="list">
            <toast-el
                v-for="(t, i) in toasts"
                :key="t.id"
                :id="t.id"
                :type="t.type"
                :header="t.header"
                :text="t.text"
                :timeout="t.timeout"
                :widthInRem="t.widthInRem"
                @close="closeToast(i)"
                :style="i === 1 ? 'margin-top: 0;' : ''"
            />
        </transition-group>
    </div>
</template>

<script lang="ts" setup>
import type { Toast } from '@/typings/common';
import ToastEl from './ToastEl.vue';

const indexStore = useIndexStore();

const { newToast, rebootingDeviceAddr } = storeToRefs(indexStore);

const route = useRoute();

const toasts = ref<Toast[]>([]);

watch(newToast, () => {
    if (!newToast.value) return;
    toasts.value.push(newToast.value);
    if (toasts.value.length > 2) {
        nextTick(() => {
            setTimeout(() => {
                toasts.value.shift();
            }, 0);
        });
    }
});

function closeToast(index: number) {
    toasts.value.splice(index, 1);
}

watch(
    () => route.name,
    () => {
        const prevToasts = toasts.value;
        toasts.value = [...prevToasts.filter((el) => el.type === 'info')];
    },
);

watch(rebootingDeviceAddr, () => {
    if (rebootingDeviceAddr.value === 0) {
        toasts.value = [];
    }
});
</script>
