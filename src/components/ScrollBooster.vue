<template>
  <div class="w-full">
    <div
      class="overflow-x-auto no-scrollbar flex items-center h-full"
      ref="viewport"
    >
      <div
        ref="content"
        class="select-none"
        :class="renderParamsClasses"
        @mousedown="
          (e) => {
            preventSelectItem = false;
            startMovePosition = e.pageX;
          }
        "
        @mousemove="
          (e) => {
            if (preventSelectItem) return;
            if (Math.abs(startMovePosition - e.pageX) > 5) {
              preventSelectItem = true;
            }
          }
        "
      >
        <slot
          :onClick="
            (index: number) => {
              if (preventSelectItem) return;
              emit('selectItem', index);
            }
          "
        />
      </div>
    </div>
    <transition name="fade-150">
      <div
        class="absolute left-0 top-0 rounded-l-lg h-full flex justify-center items-center group cursor-pointer arrow z-1"
        :class="arrowCssClasses"
        v-if="isLeftArrowVisible"
        @mousedown="scrollDevices('right')"
      >
        <span v-html="scrollArrow" />
      </div>
    </transition>
    <transition name="fade-150">
      <div
        class="absolute right-0 top-0 h-full flex justify-center items-center group cursor-pointer arrow z-1"
        :class="arrowCssClasses"
        v-if="isRightArrowVisible"
        @mousedown="scrollDevices('left')"
      >
        <span
          v-html="scrollArrow"
          class="transform -rotate-90"
        />
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { useElementSize, useScroll } from '@vueuse/core';
import ScrollBooster from '@/assets/js/scrollbooster';
import scrollArrow from '@/assets/img/scroll-arrow.svg?raw';

const props = defineProps<{
  activeIndex?: { index: number; random: number };
  arrowCss: {
    bg: string;
    height?: string;
    width: string;
  };
  renderParams:
    | {
        type: 'grid';
        gridRowsClass: `grid-rows-${number}`;
        gapClass: [`gap-x-${number}`, `gap-y-${number}`] | [`gap-${number}`];
      }
    | {
        type: 'row';
        marginRightClass: `mr-${0.5 | 1 | 1.5}`;
      };
}>();

const emit = defineEmits<{
  (e: 'updateScrollX', x: number): void;
  (e: 'updateScrollableWidth', width: number): void;
  (e: 'selectItem', index: number): void;
}>();

const viewport = ref<HTMLElement | undefined>();

const content = ref<HTMLElement | undefined>();

const { width: contentElWidth } = useElementSize(content);

const { width: viewportElWidth } = useElementSize(viewport);

const { x: scrollX } = useScroll(viewport);

let scrollBooster: ScrollBooster | undefined;

let startMovePosition = 0;

let preventSelectItem = false;

const renderParamsClasses = computed(() => {
  if (props.renderParams.type === 'grid') {
    return ['grid grid-flow-col', props.renderParams.gridRowsClass, ...props.renderParams.gapClass];
  }
  let margin = '';
  switch (props.renderParams.marginRightClass) {
    case 'mr-0.5':
      margin = '[&>*]:mr-0.5';
      break;
    case 'mr-1':
      margin = '[&>*]:mr-1';
      break;
    case 'mr-1.5':
      margin = '[&>*]:mr-1.5';
      break;
    default:
      break;
  }
  return ['whitespace-nowrap', '[&>*]:!inline-flex', margin, '[&>*:last-child]:!mr-0'];
});

const arrowCssClasses = computed(() => Object.values(props.arrowCss));

const isDevicesBlockScrollable = computed(() => contentElWidth.value > viewportElWidth.value);

const isLeftArrowVisible = computed(() => {
  if (!isDevicesBlockScrollable.value) return false;
  return scrollX.value > 0;
});

const isRightArrowVisible = computed(() => {
  if (!viewport.value || !content.value) return false;
  if (!isDevicesBlockScrollable.value) return false;
  const pos = contentElWidth.value - (scrollX.value + viewportElWidth.value);
  return Math.abs(pos) > 1;
});

function scrollElIntoView() {
  if (!scrollBooster || !content.value || props.activeIndex === undefined) return;
  const { children } = content.value;
  const active = children[props.activeIndex.index] as HTMLElement | undefined;
  if (!active) return;
  const center = viewportElWidth.value / 2;
  let addLastWidth = 0;
  if (children.length - 1 === props.activeIndex.index && children.length > 1) {
    const prev = children[props.activeIndex.index - 1] as HTMLElement;
    addLastWidth = prev.offsetWidth;
  }
  const x = active.offsetLeft + addLastWidth;
  const maxScroll = content.value.scrollWidth - viewportElWidth.value + addLastWidth;
  let scroll = x - center;
  if (scroll > maxScroll) {
    scroll = maxScroll;
  } else if (scroll < 0) {
    scroll = 0;
  }
  scrollBooster.scrollTo({ x: scroll });
}

watch(
  () => props.activeIndex,
  () => {
    if (props.activeIndex === undefined) return;
    setTimeout(scrollElIntoView, 0);
  },
);

function startScrollBooster() {
  setTimeout(() => {
    if (!viewport.value || !content.value) return;
    scrollBooster = new ScrollBooster({
      viewport: viewport.value,
      content: content.value,
      scrollMode: 'native',
      direction: 'horizontal',
      bounce: true,
      onUpdate(e: { position: { x: number } }) {
        if (!scrollBooster?.edgeX) return;
        let { x } = e.position;
        if (x < 0) {
          x = 0;
        } else if (x > -scrollBooster.edgeX.from) {
          x = -scrollBooster.edgeX.from;
        }
        emit('updateScrollX', x);
      },
    });
    if (props.activeIndex !== undefined) scrollElIntoView();
  }, 0);
}

function scrollDevices(direction: 'right' | 'left') {
  if (!viewport.value || !content.value) return;
  let x;
  if (direction === 'left') {
    x = scrollX.value + viewportElWidth.value / 1.2;
    const max = contentElWidth.value - viewportElWidth.value + 1;
    if (x > max) x = max;
  } else {
    x = scrollX.value - viewportElWidth.value / 1.2;
    if (x < 0) x = 0;
  }
  scrollBooster?.scrollTo({ x });
}

watch(
  contentElWidth,
  () => {
    if (!contentElWidth.value || !viewport.value || !content.value) {
      return;
    }
    emit('updateScrollableWidth', contentElWidth.value);
    if (!scrollBooster) {
      startScrollBooster();
    } else {
      scrollBooster.updateMetrics();
    }
  },
  { immediate: true },
);

onBeforeUnmount(() => {
  scrollBooster?.destroy();
});
</script>
