<template>
    <div
        v-if="props.activeIO"
        class="h-[3.125rem] border-t border-[#1D4162] px-4 flex items-center justify-between"
    >
        <div class="text-[#8DC5F6] flex items-center gap-2">
            <span
                class="block text-center rounded-[6px] py-[6px] bg-[#07435c] text-[#00b3cb] min-w-[26px]"
                >{{ props.activeIO.index + 1 }}</span
            >
            <!-- {{ label }} -->
        </div>
        <span class="rounded p-[6px] bg-[#07435c] text-[#00b3cb]"
            >{{ props.activeIO.val > 100 ? 100 : props.activeIO.val }}%</span
        >
    </div>
    <div
        v-else
        class="h-[3.125rem] border-t border-[#1D4162] px-4 flex items-center"
        :class="props.isInfoVisible ? 'justify-between' : 'justify-end'"
    >
        <div
            class="relative group"
            v-if="props.isInfoVisible"
        >
            <span v-html="info"></span>
            <div
                class="absolute left-0 -top-[50%] ml-[22px] invisible opacity-100 group-hover:visible group-hover:opacity-100 transition-[visibility,opacity] z-[1]"
            >
                <div class="rounded-xl bg-[#1b4569] px-4 py-[10px] whitespace-nowrap">
                    <div>info</div>
                </div>
            </div>
        </div>
        <OutlinedButton
            v-if="isBig"
            class="mr-2"
            >{{ btnText }}</OutlinedButton
        >
        <PrimaryButton @click="$emit('enter')">{{
            isBig ? t('btn.close') : t('btn.open')
        }}</PrimaryButton>
    </div>
</template>

<script lang="ts" setup>
import { useI18n } from 'vue-i18n';
import PrimaryButton from '@/components/Ui/PrimaryButton.vue';
import OutlinedButton from '@/components/Ui/OutlinedButton.vue';
import info from '@/assets/img/info.svg?raw';
import type { Widget } from '@/stores';

const props = defineProps<{
    isInfoVisible: boolean;
    activeIO?: { index: number; val: number } | null;
    isBig?: boolean;
    w?: Widget;
}>();

const btnText = computed<string>(() => {
    if (props.w?.i === 'pwm-out') {
        return t('bigWBtn.init');
    } else {
        return '';
    }
});

const { t } = useI18n({
    messages: {
        ru: {
            btn: {
                open: 'Открыть',
                close: 'Закрыть',
            },
            bigWBtn: {
                init: 'Инициализация',
            },
        },
        en: {
            btn: {
                open: 'Open',
                close: 'Close',
            },
            bigWBtn: {
                init: 'Initialization',
            },
        },
    },
});
</script>
