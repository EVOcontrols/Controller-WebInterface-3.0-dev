<template>
  <div
    class="flex flex-col"
    data-cy="modbus-input-range"
  >
    <div
      class="relative h-3 range"
      :style="{ width: `${blockWidthInRem}rem` }"
      ref="block"
    >
      <div class="absolute left-0 top-0 bottom-0 my-auto h-1 w-full rounded-full bg-[#0B3D68]">
        <div
          class="absolute left-0 top-0 h-full rounded-l-full bg-[#148EF8] transition-colors"
          :style="{ width: lineWidth }"
        />
      </div>
      <input
        type="range"
        class="thumb:h-3 thumb:appearance-none thumb:rounded-full thumb:duration-300 thumb:border-0 thumb:cursor-pointer thumb:bg-[#148EF8] thumb:transition-colors"
        min="0"
        :max="values.length - 1"
        step="1"
        :style="inputStyles"
        :value="rangeValue"
        @input="change"
      />
    </div>
    <div
      class="grid mt-[1.25rem]"
      :style="[`grid-template-columns: repeat(${values.length}, minmax(0, 1fr));`, labelsStyles]"
    >
      <div
        v-for="v in values"
        :key="v"
        class="text-center relative text-sm font-medium transition-colors"
        :class="value >= v ? 'text-[#8dc5f6]' : 'text-[#5183b1]'"
      >
        {{ v }}
        <div
          class="absolute bottom-[120%] left-1/2 h-2 w-[1px] transition-colors"
          :class="value >= v ? 'bg-[#8dc5f6]' : 'bg-[#5183b1]'"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { CSSProperties } from 'vue';

const props = defineProps<{
  value: number;
}>();

const emit = defineEmits<{
  (e: 'change', value: number): void;
}>();

const values = [2400, 4800, 9600, 19200, 38400, 57600, 115200, 256000];

const pxInRem = parseInt(getComputedStyle(document.documentElement).fontSize, 10);

const thumbWidthInRem = 1.5;

const blockWidthInRem = 34.25;

const labelsStyles = ref<CSSProperties>({});

const inputStyles = ref<CSSProperties>({});

const lineStart = ref(0);

const inputUnitWidth = ref(0);

const blockWidth = computed(() => blockWidthInRem * pxInRem);

const thumbWidth = computed(() => thumbWidthInRem * pxInRem);

const thumbWidthStyle = computed(() => `${thumbWidthInRem}rem`);

const rangeValue = computed(() => values.findIndex((v) => v === props.value));

const lineWidth = computed(() => {
  const width = lineStart.value + inputUnitWidth.value * rangeValue.value;
  return `${width}px`;
});

function change(e: Event) {
  e.preventDefault();
  const index = parseInt((e.target as HTMLInputElement).value, 10);
  emit('change', values[index]);
  (e.target as HTMLInputElement).value = rangeValue.value.toString();
  return false;
}

onBeforeMount(() => {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  if (!context) return;
  context.scale(1, 1);
  context.font = '500 14px Gilroy';
  const metrics1 = context.measureText(values[0].toString());
  const metrics2 = context.measureText(values[values.length - 1].toString());
  const unitWidth1 = blockWidth.value / values.length;
  const left1 = unitWidth1 / 2 - metrics1.width / 2;
  const right1 = unitWidth1 / 2 - metrics2.width / 2;
  const unitWidth2 = (blockWidth.value + right1) / values.length;
  const unitWidth3 = (blockWidth.value + left1) / values.length;
  const left2 = unitWidth2 / 2 - metrics1.width / 2;
  const right2 = unitWidth3 / 2 - metrics2.width / 2;
  labelsStyles.value = {
    marginLeft: `-${left2}px`,
    marginRight: `-${right2}px`,
  };
  const unitWidth4 = (blockWidth.value + left2 + right2) / values.length;
  const halfThumb = thumbWidth.value / 2;
  const left3 = unitWidth4 / 2 - left2 - halfThumb;
  const right3 = unitWidth4 / 2 - right2 - halfThumb;
  const inputWidth = blockWidth.value - left3 - right3;
  inputStyles.value = {
    left: `${left3}px`,
    right: `${right3}px`,
    width: `${inputWidth}px`,
  };
  inputUnitWidth.value = (inputWidth - thumbWidth.value) / (values.length - 1);
  lineStart.value = unitWidth4 / 2 - left2;
});
</script>

<style lang="postcss" scoped>
.range {
  input {
    @apply h-1 appearance-none bg-transparent absolute top-0 bottom-0 my-auto;
    &::-webkit-slider-thumb {
      width: v-bind('thumbWidthStyle');
    }
    &::-moz-range-thumb {
      width: v-bind('thumbWidthStyle');
    }
  }
  &:active {
    & > div > div:not(.kludge) {
      @apply bg-[#3E7DF9];
    }
    input::-webkit-slider-thumb {
      @apply bg-[#3E7DF9];
    }
    input::-moz-range-thumb {
      @apply bg-[#3E7DF9];
    }
  }
}
</style>
