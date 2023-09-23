<template>
  <input
    type="text"
    class="rounded-lg h-[2.563rem] bg-[#0f304b] px-4 text-[#84b5e3] text-sm leading-[1.143] focus:bg-[#113b5e] placeholder:text-[#5183b1] error:bg-[#451f3e] error:text-[#f83068]"
    :class="[
      {
        error: status === 'invalid' || status === 'not-allowed',
      },
    ]"
    spellcheck="false"
    v-model.trim="valueInit"
    :required="required"
    :maxlength="maxLength"
    :autofocus="autofocus"
    :placeholder="placeholder"
    :disabled="disabled"
    autocomplete="off"
    @focus="onFocus"
  />
</template>

<script
  setup
  lang="ts"
  generic="T extends 'string' | 'number', V extends T extends 'string' ? string : number"
>
import type { InputFieldStatus } from '@/typings/common';

const props = withDefaults(
  defineProps<{
    initValue: V | undefined;
    initType: T;
    status?: InputFieldStatus;
    minMax?: [number | undefined, number | undefined];
    required?: boolean;
    maxLength?: number;
    autofocus?: boolean;
    autoSelect?: boolean;
    notAllowedValues?: (number | string)[];
    placeholder?: string;
    disabled?: boolean;
    inputType?: ('ip' | 'url')[] | ['int'];
  }>(),
  {
    autoSelect: false,
  },
);

const emit = defineEmits<{
  (e: 'valueChanged', value: V): void;
  (e: 'statusChanged', status: InputFieldStatus): void;
}>();

// eslint-disable-next-line vue/no-setup-props-destructure
let lastInitValue: any = props.initValue;

const valueInit = ref<string>(props.initValue?.toString() || '');

function setStatus(status: InputFieldStatus) {
  emit('statusChanged', status);
}

function isIp(v: string) {
  return /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(
    v,
  );
}

function isUrl(v: string) {
  return /^(https?:\/\/)?((([-a-z0-9]{1,63}\.)*?[a-z0-9]([-a-z0-9]{0,253}[a-z0-9])?\.[a-z]{2,63})|((\d{1,3}\.){3}\d{1,3}))(:\d{1,5})?((\/|\?)((%[0-9a-f]{2})|[-\w\\+\\.\\?\\/@~#&=])*)?$/.test(
    v,
  );
}

function isFitValidationType(v: string) {
  if (!props.inputType) return true;
  return props.inputType.some((t) => {
    return t === 'ip' ? isIp(v) : isUrl(v);
  });
}

function valueChangedHandler() {
  // console.log('valueChangedHandler');
  const v = valueInit.value;
  if (props.initType === 'string') {
    if (props.notAllowedValues?.includes(v)) {
      setStatus('not-allowed');
      return;
    }
    if (v && !isFitValidationType(v)) {
      setStatus('invalid');
      return;
    }
    if (props.required && !v) {
      setStatus('invalid');
      emit('valueChanged', '' as V);
      return;
    }
    lastInitValue = v;
    emit('valueChanged', v as V);
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
    if (props.inputType?.[0] === 'int' && parseInt(v).toString() !== v) {
      setStatus('invalid');
      return;
    }
    lastInitValue = parsed;
    emit('valueChanged', parsed as V);
  }
  setStatus(v ? 'valid' : 'empty');
}

watchDebounced(
  valueInit,
  () => {
    // console.log('valueInit', valueInit.value);
    valueChangedHandler();
  },
  { immediate: true, debounce: 10 },
);

watchDebounced(
  [() => props.notAllowedValues, () => props.required],
  () => {
    valueChangedHandler();
  },
  { debounce: 10 },
);

watch(
  () => props.initValue,
  () => {
    if (props.initValue === lastInitValue) return;
    lastInitValue = props.initValue;
    valueInit.value = props.initValue?.toString() || '';
  },
);

function onFocus(e: FocusEvent) {
  if (props.autoSelect === false) return;
  (e.target as HTMLInputElement)?.select();
}
</script>
