<template>
    <div ref="el">
        <Transition
            :enter-active-class="activeClass"
            :leave-active-class="activeClass"
            enter-from-class="!my-0"
            leave-to-class="!my-0"
            @before-enter="beforeEnter"
            @enter="enter"
            @before-leave="beforeLeave"
            @leave="leave"
            @after-enter="afterEnter"
            :appear="appear"
            :mode="mode"
        >
            <slot></slot>
        </Transition>
    </div>
</template>

<script lang="ts" setup>
const props = withDefaults(
    defineProps<{
        appear?: boolean;
        mode?: 'in-out' | 'out-in' | 'default';
        duration: 150 | 300 | 500 | 1000;
    }>(),
    {
        appear: false,
        mode: 'default',
    },
);

const el = ref<HTMLElement | undefined>();

const activeClass = computed(() => {
    const baseClass = 'overflow-hidden transition-all';
    switch (props.duration) {
        case 150:
            return `${baseClass} duration-150`;
        case 300:
            return `${baseClass} duration-300`;
        case 500:
            return `${baseClass} duration-500`;
        case 1000:
            return `${baseClass} duration-1000`;
        default:
            return baseClass;
    }
});

function beforeEnter(element: Element) {
    (element as HTMLElement).style.height = '0';
}

function enter(element: Element) {
    (element as HTMLElement).style.height = `${(element as HTMLElement).scrollHeight}px`;
}

function beforeLeave(element: Element) {
    (element as HTMLElement).style.height = `${(element as HTMLElement).scrollHeight}px`;
}

function leave(element: Element) {
    (element as HTMLElement).style.height = '0';
}

function afterEnter(element: Element) {
    (element as HTMLElement).style.height = '';
}
</script>
