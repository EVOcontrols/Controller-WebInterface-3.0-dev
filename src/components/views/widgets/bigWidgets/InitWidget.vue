<template>
    <div class="flex-1 flex flex-col">
        <div class="flex-1 flex overflow-y-hidden pl-2 rounded-l-lg w-full">
            <div
                v-dragscroll.y
                class="flex overflow-y-auto w-full scrollbar-4 flex-1"
                :style="{ height: 'calc(100vh - 410px)' }"
                ref="scrollWrapper"
            >
                <div
                    class="flex flex-col items-start flex-none pt-3 px-[18px] w-full gap-[10px]"
                    ref="scrollEl"
                >
                    <div
                        class="label flex text-[#6CB5D3] items-center transition-colors duration-500 rounded select-none hover:bg-[#0C2F4D] gap-2"
                        v-for="(s, index) in props.w.state"
                        :key="index"
                    >
                        <span class="w-[22px] text-end">{{ index + 1 }}</span>
                        <span class="block w-[300px] overflow-hidden"> label </span>
                        <div class="flex">
                            <span
                                class="h-9 px-4 text-sm font-Roboto flex items-center rounded-l-[8px]"
                                :class="activeItem === '1' ? '' : 'bg-[#0F304B] text-[#5F93C2]'"
                                >{{ t('items.not') }}</span
                            >
                            <span
                                class="h-9 px-4 text-sm font-Roboto flex items-center"
                                :class="activeItem === '2' ? '' : 'bg-[#0F304B] text-[#5F93C2]'"
                                >{{ t('items.download') }}</span
                            >
                            <span
                                class="h-9 px-4 text-sm font-Roboto flex items-center rounded-r-[8px]"
                                :class="activeItem === '3' ? '' : 'bg-[#0F304B] text-[#5F93C2]'"
                                >{{ t('items.const') }}</span
                            >
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="h-[3.125rem] border-t border-[#1D4162] px-4 flex items-center justify-end">
            <div class="flex">
                <OutlinedButton
                    class="mr-2"
                    @click="$emit('init')"
                    >{{ t('back') }}</OutlinedButton
                >
                <PrimaryButton @click="$emit('enter')">{{ t('save') }}</PrimaryButton>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { useI18n } from 'vue-i18n';
import PrimaryButton from '@/components/Ui/PrimaryButton.vue';
import OutlinedButton from '@/components/Ui/OutlinedButton.vue';
import type { Widget } from '@/stores';

const props = defineProps<{
    w: { w: Widget; state: number[] };
}>();

const activeItem = ref('');

const { t } = useI18n({
    messages: {
        ru: {
            back: 'Назад',
            save: 'Сохранить',
            items: {
                not: 'НЕТ',
                download: 'ЗАГРУЗИТЬ',
                const: 'КОНСТАНТА',
            },
        },
        en: {
            back: 'Back',
            save: 'Save',
            items: {
                not: 'NOT',
                download: 'DOWNLOAD',
                const: 'CONSTANT',
            },
        },
    },
});
</script>
