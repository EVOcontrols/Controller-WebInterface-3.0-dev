<template>
  <input
    ref="inputEl"
    :type="inputType || 'text'"
    class="rounded-lg h-[2.563rem] bg-[#0f304b] px-4 text-[#84b5e3] text-sm leading-[1.143] focus:bg-[#113b5e] placeholder:text-[#5183b1] error:bg-[#451f3e] error:text-[#f83068]"
    :class="[
      {
        error:
          status === 'invalid' ||
          localStatus === 'invalid' ||
          status === 'not-allowed' ||
          localStatus === 'not-allowed',
      },
    ]"
    spellcheck="false"
    v-model.trim="valueInit"
    :required="required"
    :maxlength="maxLength"
    :autofocus="autofocus"
    :title="status === 'not-allowed' || localStatus === 'not-allowed' ? notAllowedTitle : ''"
    :placeholder="placeholder"
    :disabled="disabled"
    autocomplete="off"
    @focus="onFocus"
    @blur="blurHandler"
    @keydown="keydownHandler"
  />
</template>

<script setup lang="ts" generic="T extends InputFieldParams">
import type { InputFieldParams, InputFieldStatus } from '@/typings/common';
import { useFocus } from '@vueuse/core';
import { onBeforeUnmount, ref, watch } from 'vue';

const props = withDefaults(
  defineProps<{
    init: T;
    status?: InputFieldStatus;
    minMax?: [number | undefined, number | undefined];
    required?: boolean;
    maxLength?: number;
    autofocus?: boolean;
    autoSelect?: boolean;
    changeOnBlurOnly?: boolean;
    notAllowedValues?: (number | string)[];
    notAllowedTitle?: string;
    inputType?: 'password';
    placeholder?: string;
    disabled?: boolean;
  }>(),
  {
    autoSelect: false,
  },
);

const emit = defineEmits<{
  (e: 'valueChanged', value: T): void;
  (e: 'statusChanged', status: InputFieldStatus): void;
}>();

// eslint-disable-next-line vue/no-setup-props-destructure
let lastInitValue: any = props.init;

const valueInit = ref<string>(props.init.value?.toString() || '');

const localStatus = ref<InputFieldStatus>(props.status || 'empty');

const inputEl = ref<HTMLInputElement | undefined>();

const { focused } = useFocus(inputEl);

function setStatus(status: InputFieldStatus) {
  if (props.changeOnBlurOnly) {
    localStatus.value = status;
  } else {
    emit('statusChanged', status);
  }
}

function valueChangedHandler() {
  // console.log('valueChangedHandler');
  const v = valueInit.value;
  if (props.init.valueType === 'string') {
    if (props.notAllowedValues?.includes(v)) {
      setStatus('not-allowed');
      return;
    }
    if (!props.changeOnBlurOnly) {
      lastInitValue = v;
      emit('valueChanged', { ...props.init, value: v } as T);
    }
  } else if (v) {
    const parsed = parseFloat(v.replace(/,/, '.'));
    if (isNaN(parsed)) {
      setStatus('invalid');
      return;
    }
    if (props.minMax?.[0] !== undefined && parsed < props.minMax[0]) {
      setStatus('invalid');
      return;
    }
    if (props.minMax?.[1] !== undefined && parsed > props.minMax[1]) {
      setStatus('invalid');
      return;
    }
    if (props.notAllowedValues?.includes(parsed)) {
      setStatus('not-allowed');
      return;
    }
    if (!props.changeOnBlurOnly) {
      lastInitValue = parsed;
      emit('valueChanged', { ...props.init, value: parsed } as T);
    }
  }
  setStatus(v ? 'valid' : 'empty');
}

watch(
  valueInit,
  () => {
    valueChangedHandler();
  },
  { immediate: true },
);

watch(
  () => props.notAllowedValues,
  () => {
    valueChangedHandler();
  },
);

watch(
  () => props.init,
  () => {
    if (props.init.value === lastInitValue) return;
    lastInitValue = props.init.value;
    valueInit.value = props.init.value?.toString() || '';
  },
);

function blurHandler() {
  if (props.changeOnBlurOnly) {
    if (localStatus.value === 'valid' || (localStatus.value === 'empty' && !props.required)) {
      const value =
        props.init.valueType === 'string'
          ? valueInit.value
          : parseFloat(valueInit.value.replace(/,/, '.'));
      lastInitValue = value;
      emit('valueChanged', {
        ...props.init,
        value,
      } as T);
    } else {
      valueInit.value = props.init.value?.toString() || '';
    }
  }
}

function onFocus(e: FocusEvent) {
  if (props.autoSelect === false) return;
  (e.target as HTMLInputElement)?.select();
}

function keydownHandler(e: Event) {
  if (!(e instanceof KeyboardEvent)) return;
  if (e.code === 'Enter' || e.code === 'NumpadEnter') {
    if (props.changeOnBlurOnly) {
      (e.target as HTMLInputElement).blur();
    }
  } else if (e.ctrlKey && (e.code === 'KeyZ' || e.code === 'KeyY')) {
    e.preventDefault();
    e.stopPropagation();
  }
}

onBeforeUnmount(() => {
  if (focused.value) {
    blurHandler();
  }
});
</script>
