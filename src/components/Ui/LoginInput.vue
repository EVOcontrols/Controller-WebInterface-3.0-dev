<template>
  <div class="relative">
    <input
      :type="inputType === 'login' || isInputFocus ? 'text' : 'password'"
      autocorrect="off"
      autocapitalize="off"
      aria-invalid="false"
      class="absolute left-0 top-0 z-[2] h-full w-full pl-4 text-sm opacity-0"
      :class="{
        'top-10 opacity-100': inputType === 'password1',
        '!pl-5': isInputFocus && hasFocusOffset,
      }"
      v-model="value"
      :name="name"
      :autocomplete="autocomplete"
      :disabled="isDisabled"
      @focus="gotFocus"
      @blur="onBlur"
      @click="isFirefox ? gotFocus() : ''"
      @keydown="isFirefox ? gotFocus() : ''"
      @keyup="isFirefox ? gotFocus() : ''"
      @keypress.enter="$emit('enter')"
      ref="inputEl"
      required
    />
    <div
      class="input-field vuesax-ph transition-colors"
      :class="[
        bgColor,
        color,
        {
          focus: isInputFocus,
          [errorPadding]: isError,
          '!pl-5': isInputFocus && hasFocusOffset,
          '!pr-10': inputType === 'password',
        },
      ]"
    >
      <div
        v-html="visibleValue"
        class="w-full overflow-hidden whitespace-nowrap"
      ></div>
    </div>
    <div
      class="z-1 absolute left-0 top-0 h-full w-full pl-4 text-sm font-medium leading-10 transition-all duration-300"
      :class="[
        phColor,
        {
          '!opacity-0': isInputFocus,
          '!pl-5': isInputFocus && hasFocusOffset,
          [errorPadding]: isError,
        },
      ]"
      v-if="!value.length"
    >
      {{ placeholder }}
    </div>
  </div>
</template>

<script lang="ts" setup>
const props = withDefaults(
  defineProps<{
    inputType: 'login' | 'password' | 'password1';
    isPasswordVisible: boolean;
    isDisabled: boolean;
    isError: boolean;
    placeholder: string;
    autocomplete?: string;
    initValue?: string;
    focusBg?: string;
    errorBg?: string;
    disabledBg?: string;
    disabledColor?: string;
    placeholderColor?: string;
    errorPadding?: string;
    isSuccess?: boolean;
    setFocusTrigger?: number;
    name?: string;
    hasFocusOffset?: boolean;
  }>(),
  {
    initValue: '',
    autocomplete: 'username',
    focusBg: 'bg-[#0d4c8582]',
    errorBg: 'error-bg',
    disabledBg: 'disabled-bg',
    disabledColor: 'text-[#27425C]',
    placeholderColor: 'text-[#4B7CA8]',
    errorPadding: '',
    isSuccess: false,
    name: 'type',
    hasFocusOffset: true,
  },
);

const emit = defineEmits<{
  (e: 'change', value: string): void;
  (e: 'focus'): void;
  (e: 'blur'): void;
  (e: 'enter'): void;
}>();

const value = ref('');

const inputEl = ref<HTMLInputElement | null>(null);

const isInputFocus = ref(false);

const caretPosition = ref<number | null>(null);

const caretEnd = ref<number | null>(null);

const isFirefox = navigator.userAgent.search(/Firefox/i) >= 0;

const dottedValue = computed(() => {
  return '&#0149;'.repeat(value.value.length);
});

const doShowDots = computed(() => {
  return props.inputType === 'password' && !props.isPasswordVisible;
});

const visibleValue = computed(() => {
  if (!isInputFocus.value) return doShowDots.value ? dottedValue.value : value.value;
  if (!value.value.length) return '<span class="blinking-cursor text-[#0d4c8582]">.</span>';
  if (caretPosition.value === null) {
    return doShowDots.value ? dottedValue.value : value.value;
  }
  const v = doShowDots.value
    ? new Array(value.value.length).fill('&#0149;')
    : value.value.split('');
  v.splice(caretPosition.value, 0, '<span class="blinking-cursor"></span>');
  if (caretEnd.value !== null) {
    const cEnd = caretEnd.value <= value.value.length ? caretEnd.value : value.value.length;
    v[caretPosition.value] = `${
      v[caretPosition.value] || ''
    }<span class="text-[#0F304B] bg-[#84B5E3]">`;
    v[cEnd] += '</span>';
  }
  return v.join('');
});

const bgColor = computed(() => {
  if (props.isDisabled) return props.disabledBg;
  if (props.isError) return props.errorBg;
  if (props.isSuccess) return 'bg-[#0C3F44]';
  if (isInputFocus.value) return props.focusBg;
  return 'bg-[#0F304B]';
});

const color = computed(() => {
  if (props.isDisabled) return props.disabledColor;
  if (props.isError) return 'text-[#F83068]';
  if (props.isSuccess) return 'text-[#37C4A2]';
  return 'text-[#84B5E3]';
});

const phColor = computed(() => {
  if (props.isDisabled) return 'opacity-0';
  if (props.isError) return 'text-[#F83068] opacity-30';
  return props.placeholderColor;
});

watch(isInputFocus, () => {
  if (isInputFocus.value) {
    emit('focus');
  } else {
    emit('blur');
  }
});

watch(value, () => {
  // console.log(value.value, props.initValue);
  if (value.value === props.initValue) return;
  emit('change', value.value);
});

watch(
  () => props.initValue,
  () => {
    if (props.initValue !== value.value) {
      value.value = props.initValue;
    }
  },
  { immediate: true },
);

watch(
  () => props.setFocusTrigger,
  () => {
    setTimeout(() => {
      inputEl.value?.focus();
    }, 10);
  },
);

onMounted(() => {
  if (isFirefox) {
    if (inputEl.value) {
      inputEl.value.addEventListener('select', selectEvent);
    }
  } else {
    document.addEventListener('selectionchange', selectEvent);
  }
  // if (props.inputType === 'password') {
  //   const unwatch = watch(value, () => {
  //     unwatch();
  //     forceUpdate();
  //   });
  // }
});

function selectEvent() {
  if (!inputEl.value) return;
  const { selectionStart, selectionEnd } = inputEl.value;
  caretPosition.value = selectionStart;
  caretEnd.value =
    typeof selectionStart === 'number' &&
    typeof selectionEnd === 'number' &&
    selectionStart >= selectionEnd
      ? null
      : selectionEnd;
}

function gotFocus() {
  if (!inputEl.value) return;
  if (inputEl.value.selectionStart === inputEl.value.selectionEnd) {
    caretEnd.value = null;
  }
  setTimeout(() => {
    isInputFocus.value = true;
  }, 0);
  const { selectionStart } = inputEl.value;
  caretPosition.value = selectionStart;
}

function onBlur() {
  setTimeout(() => {
    isInputFocus.value = false;
  }, 0);
}
</script>

<style lang="postcss" scoped>
.input-field {
  @apply relative block
      h-10 w-full overflow-hidden rounded-lg px-4 text-sm
      font-medium leading-10 outline-none transition-all;
  /* &.focus {
    @apply pl-5;
  } */
}
.disabled-bg {
  background: rgba(8, 13, 27, 0.42);
}
.error-bg {
  background: rgba(125, 24, 60, 0.52);
}
</style>
