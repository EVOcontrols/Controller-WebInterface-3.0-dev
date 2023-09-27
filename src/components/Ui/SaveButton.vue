<template>
  <button
    class="rounded-lg h-[1.813rem] bg-[#148ef8] font-semibold text-sm hover:bg-[#3e7df9] active:bg-[#306add] disabled:bg-[#0f3351] disabled:text-[#3e688e] flex items-center justify-center overflow-hidden"
    :disabled="isSaving || isDisabled"
  >
    <span
      v-if="isSaving && isSavingThrottled"
      v-html="spinner"
      class="[&>svg]:w-4 [&>svg>path]:fill-[#148ef8]"
    ></span>
    <slot v-else>
      {{ t('save') }}
    </slot>
  </button>
</template>

<script lang="ts" setup>
import spinner from '@/assets/img/spinner-inside-button.svg?raw';

const props = defineProps<{
  isSaving: boolean;
  isDisabled?: boolean;
}>();

const isSavingComputed = computed(() => props.isSaving);

const isSavingThrottled = refDebounced(isSavingComputed, 10);

const { t } = useI18n({
  messages: {
    en: {
      save: 'Save',
    },
    ru: {
      save: 'Сохранить',
    },
  },
});
</script>
