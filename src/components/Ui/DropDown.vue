<template>
    <div>
        <div class="relative flex">
            <div
                class="relative group"
                ref="wrapperEl"
                :class="{ on: isOpen }"
            >
                <div
                    ref="triggerEl"
                    class="flex"
                >
                    <slot
                        name="trigger-element"
                        :onClick="onClick"
                    ></slot>
                </div>
                <span
                    v-html="scrollArrow"
                    class="[&>svg]:h-[0.56rem] [&>svg]:w-[0.31rem] [&>svg>path]:!fill-[#8dc5f6] absolute right-4 top-0 bottom-0 my-auto flex items-center cursor-pointer"
                    @click="onClick"
                ></span>
                <Transition name="fade-150">
                    <div
                        class="absolute left-0 min-w-full shadow-[0_0_0.25rem_0_#08253d]"
                        :class="topPositionClass"
                        v-if="isOpen"
                        ref="bodyEl"
                    >
                        <slot
                            name="body"
                            :isOpen="isOpen"
                            :onSelect="
                                () => {
                                    isOpen = false;
                                }
                            "
                        ></slot>
                    </div>
                </Transition>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import scrollArrow from '@/assets/img/scroll-arrow.svg?raw';

const isOpen = ref(false);

const wrapperEl = ref<HTMLElement | null>(null);

const triggerEl = ref<HTMLElement | null>(null);

const bodyEl = ref<HTMLElement | null>(null);

const isTriggerElVisible = useElementVisibility(triggerEl);

const scrollableParent = ref<HTMLElement | null>(null);

onClickOutside(wrapperEl, () => {
    isOpen.value = false;
});

const { escape } = useMagicKeys();

watch([escape, isTriggerElVisible], () => {
    if (escape.value || !isTriggerElVisible.value) {
        isOpen.value = false;
    }
});

const topPositionClass = ref('top-full mt-2.5');

function onClick() {
    if (!isOpen.value && scrollableParent.value && triggerEl.value) {
        const parentBoundingRect = scrollableParent.value.getBoundingClientRect();
        const triggerBoundingRect = triggerEl.value.getBoundingClientRect();
        topPositionClass.value =
            triggerBoundingRect.top - parentBoundingRect.top + triggerBoundingRect.height / 2 >
            parentBoundingRect.height / 2
                ? 'bottom-full mb-2.5'
                : 'top-full mt-2.5';
    }
    isOpen.value = !isOpen.value;
    nextTick(() => {
        setTimeout(() => {
            if (isOpen.value && bodyEl.value) {
                const onEl = bodyEl.value.querySelector('.on') as HTMLElement;
                const onElScrollParent = getScrollParent(onEl);
                if (!onElScrollParent || !onEl) return;
                onElScrollParent.scrollTo({
                    top:
                        onEl.offsetTop -
                        onElScrollParent.offsetTop -
                        onElScrollParent.clientHeight / 2 +
                        onEl.clientHeight / 2,
                });
            }
        }, 0);
    });
}

function getScrollParent(node: HTMLElement | null) {
    if (node == null) {
        return null;
    }

    if (node.scrollHeight > node.clientHeight) {
        return node;
    } else {
        return getScrollParent(node.parentElement);
    }
}

onMounted(() => {
    if (wrapperEl.value) {
        scrollableParent.value = getScrollParent(wrapperEl.value);
    }
});
</script>
