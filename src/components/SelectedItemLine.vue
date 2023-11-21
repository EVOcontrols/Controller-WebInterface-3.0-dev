<template>
    <div
        ref="bgEl"
        class="absolute bottom-0 w-full rounded-t"
        :class="{ 'bg-[#0b3d68] h-0.5': props.withBg }"
    >
        <div
            class="h-0.5 rounded-t bg-[#158ef8] absolute bottom-0"
            :class="{ 'transition-[left,width]': hasTransition, hidden: !hasTransition }"
            ref="lineEl"
            :style="{
                left: left + 'px',
                width: width + 'px',
            }"
        ></div>
    </div>
</template>

<script setup lang="ts">
const props = defineProps<{
    activeItemIndex: number;
    withBg?: boolean;
}>();

const lineEl = ref<HTMLElement | null>(null);

const bgEl = ref<HTMLElement | null>(null);

const parentEl = computed(() => bgEl.value?.parentElement);

const { width: parentWidth } = useElementSize(parentEl);

const left = ref<number | undefined>();

const width = ref<number | undefined>();

const hasTransition = ref(false);

watchEffect(() => {
    if (left.value !== undefined && width.value !== undefined) {
        setTimeout(() => {
            hasTransition.value = true;
        }, 0);
    } else {
        hasTransition.value = false;
    }
});

async function setSizes() {
    await new Promise((resolve) => setTimeout(resolve, 0));
    if (!parentEl.value) return;
    const children = [...parentEl.value.children].filter(
        (child) => !child.isSameNode(bgEl.value),
    ) as HTMLElement[];
    const child = children[props.activeItemIndex];
    left.value = child.offsetLeft;
    width.value = child.clientWidth;
}

watch([() => props.activeItemIndex], setSizes);
watch(parentWidth, () => {
    left.value = undefined;
    width.value = undefined;
    setTimeout(setSizes, 0);
});

onMounted(setSizes);
</script>
