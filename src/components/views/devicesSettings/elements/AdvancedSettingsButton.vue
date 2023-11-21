<template>
    <button
        class="text-sm leading-[1.143] group flex items-center mt-11 before:content-[''] before:h-[0.313rem] before:w-[0.313rem] before:bg-[#f83068] before:absolute before:right-full before:top-0 before:bottom-0 before:my-auto before:opacity-0 error:before:opacity-100 before:transition-opacity before:mr-2 relative before:rounded-xl"
        :class="{
            on: isExpanded,
            error: isError,
        }"
        type="button"
    >
        {{ t('advancedSettings') }}
        <span
            v-html="scrollArrow"
            class="ml-2.5 [&>svg>path]:!fill-[#adebff]"
        ></span>
    </button>
</template>

<script lang="ts" setup>
import scrollArrow from '@/assets/img/scroll-arrow.svg?raw';

defineProps<{
    isError: boolean;
    isExpanded: boolean;
}>();

const { t } = useI18n({
    messages: {
        en: {
            advancedSettings: 'Advanced settings',
        },
        ru: {
            advancedSettings: 'Расширенные настройки',
        },
    },
});
</script>
