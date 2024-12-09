<template>
    <div class="fixed top-0 bottom-0 left-0 right-0 z-[4] bg-[#001D34B2] flex items-center justify-center">
        <div
            class="relative p-6 bg-[#0C314F] shadow-[0_0_22px_0_#082135] min-w-[26.25rem] rounded-[12px] flex flex-col gap-[18px] w-[26.25rem]"
            :style="{ height: 'fit-content' }"
        >
            <div class="flex items-center gap-2">
                <span v-html="approve"></span>
                <div class="flex-1 text-lg text-[#9ADBF6] font-semibold">
                    {{ t('title') }}
                </div>
                <CloseIcon
                    class="cursor-pointer"
                    @click="$emit('close')"
                />
            </div>
            <div class="w-full h-[1px] bg-[#2C5982]"></div>
            <div class="text-[#6CB5D3] text-sm">
                {{ t(`text.${props.type === 1 ? 1 : 2}`) }}
            </div>
            <div
                v-if="props.type === 1"
                class="w-full h-[4rem] rounded-[6px] bg-[#092740] px-6 flex items-center gap-4"
            >
                <div
                    class="rounded-[50%] cursor-pointer w-[1.75rem] h-[1.75rem] flex items-center justify-center"
                    :class="props.algoritms[0].val ? 'bg-[#0E5853]' : 'bg-[#1B4A74]'"
                >
                    <IButtonIcon
                        :class="
                            props.algoritms[0].val
                                ? '[&>path]:fill-[#00D6AF] [&>rect]:fill-[#00D6AF]'
                                : '[&>path]:fill-[#5891C2] [&>rect]:fill-[#5891C2]'
                        "
                    />
                </div>
                <div class="text-sm font-semibold leading-[120%] text-[#ADEBFF] select-none">
                    {{ props.algoritms[0].label || '&#8212;' }}
                </div>
            </div>
            <div class="flex justify-end items-center gap-2">
                <OutlinedButton
                    class="w-[104px]"
                    :class="{ '!cursor-auto': props.isLoading }"
                    @click="
                        () => {
                            if (!props.isLoading) $emit('close');
                        }
                    "
                    >{{ t('cancel') }}</OutlinedButton
                >
                <PrimaryButton
                    class="w-[104px]"
                    @click="emit('delete')"
                >
                    <span
                        v-if="props.isLoading"
                        v-html="spinnerInsideButton"
                        class="[&>svg]:w-4 [&>svg>path]:fill-[#ADEBFF] flex items-center justify-center"
                    ></span>
                    <span v-else>{{ t('delete') }}</span>
                </PrimaryButton>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import approve from '@/assets/img/approve.svg?raw';
import PrimaryButton from '@/components/Ui/PrimaryButton.vue';
import OutlinedButton from '@/components/Ui/OutlinedButton.vue';
import CloseIcon from '@/assets/CloseIcon.vue';
import spinnerInsideButton from '@/assets/img/spinner-inside-button.svg?raw';
import IButtonIcon from '@/assets/IButtonIcon.vue';

const props = defineProps<{
    isLoading: boolean;
    algoritms: { val: 0 | 1 | null; label: string }[];
    type?: 1 | 2;
}>();

const emit = defineEmits<{
    (e: 'close'): void;
    (e: 'delete'): void;
}>();

const { t } = useI18n({
    messages: {
        en: {
            title: 'Confirmation',
            cancel: 'Cancel',
            delete: 'Delete',
            text: {
                1: 'Are you sure you want to remove the feature?',
                2: 'Do you really want the selected features?',
            },
        },
        ru: {
            title: 'Подтверждение',
            cancel: 'Отмена',
            delete: 'Удалить',
            text: {
                1: 'Вы действительно хотите удалить алгоритм?',
                2: 'Вы действительно хотите удалить выбранные алгоритмы?',
            },
        },
    },
});
</script>
