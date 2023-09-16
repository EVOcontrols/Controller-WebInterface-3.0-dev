<template>
  <div
    class="toast"
    :class="`${type}-toast`"
    :style="{ width: `${widthInRem}rem`, marginLeft: `-${widthInRem + 1}rem` }"
  >
    <component
      class="w-12"
      :color="colors.icon"
      :is="type === 'success' ? SuccessIcon : ErrorWarningIcon"
    />
    <div class="flex-1 pl-3.5">
      <p
        class="font-semibold"
        :class="colors.header"
      >
        {{ header }}
      </p>
      <p
        class="font-medium"
        :class="colors.text"
      >
        {{ text }}
      </p>
    </div>
    <close-icon
      v-if="timeout"
      class="w-5 cursor-pointer"
      @click="close"
    />
    <div class="absolute bottom-0 left-9 right-9 h-[3px]">
      <div
        class="absolute left-0 top-0 h-full transition-all duration-150 ease-linear rounded-[3px]"
        ref="time"
        :style="{
          background: colors.time,
          transitionProperty: 'width',
          transitionDuration: `${timeout / 1000}s`,
          width: timeWidth,
        }"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import SuccessIcon from './SuccessIcon.vue';
import ErrorWarningIcon from './ErrorWarningIcon.vue';
import CloseIcon from './CloseIcon.vue';
import type { Toast } from '@/typings/common';

const props = withDefaults(
  defineProps<{
    id: number;
    type: Toast['type'];
    timeout?: number;
    header: string;
    text?: string;
    widthInRem?: number;
  }>(),
  {
    timeout: 7000,
    text: undefined,
    widthInRem: 24,
  },
);

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const indexStore = useIndexStore();

const { toastIdForDeleting } = storeToRefs(indexStore);

let timer: ReturnType<typeof setTimeout> | number = 0;

const timeWidth = ref<number | string>(0);

const colors = computed(() => {
  switch (props.type) {
    case 'success':
      return {
        header: 'text-[#B9FFDD]',
        text: 'text-[#74FFDE]',
        // bg: 'rgba(28, 138, 99, 0.35)',
        icon: [''],
        time: 'linear-gradient(270deg, #93DEBF 0.56%, rgba(40, 119, 137, 0) 58.47%)',
      };
    case 'error':
      return {
        header: 'text-[#FEC2D3]',
        text: 'text-[#FF7A9F]',
        // bg: 'rgba(137, 29, 68, 0.48)',
        icon: ['text-[#F83068]', 'text-[#FEC2D3]'],
        time: 'linear-gradient(270deg, #FFD3E2 0.56%, rgba(116, 46, 86, 0) 58.47%)',
      };
    case 'warning':
      return {
        header: 'text-[#A0D5FF]',
        text: 'text-[#77C3FF]',
        // bg: 'rgba(35, 85, 132, 0.3)',
        icon: ['text-[#487DAE]', 'text-[#A0D5FF]'],
        time: 'linear-gradient(269.99deg, #6EBDD7 0.56%, rgba(30, 72, 106, 0) 57.04%)',
      };
    default:
      return {
        header: '',
        text: '',
        bg: '',
        icon: [''],
      };
  }
});

watch(toastIdForDeleting, (toastIdForDeleting) => {
  if (toastIdForDeleting === props.id) close();
});

function close() {
  emit('close');
}

onMounted(() => {
  if (props.timeout) {
    timer = setTimeout(() => {
      close();
    }, props.timeout);
    setTimeout(() => {
      timeWidth.value = '100%';
    }, 10);
  }
});

onBeforeUnmount(() => {
  clearTimeout(timer);
});
</script>

<style lang="postcss" scoped>
.toast {
  @apply h-[4.5rem] rounded-full flex items-center pl-3 pr-4 justify-between text-sm
    relative mb-3 backdrop-filter backdrop-blur-md;
  transition: top 0.5s ease;
  &.success-toast {
    background-color: rgba(28, 138, 99, 0.35);
  }
  &.error-toast {
    background-color: rgba(137, 29, 68, 0.48);
  }
  &.warning-toast {
    background-color: rgba(35, 85, 132, 0.3);
  }
}
</style>
