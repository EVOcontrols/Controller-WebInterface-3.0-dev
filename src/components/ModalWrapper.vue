<template>
    <Transition
        name="fade-150"
        appear
    >
        <div
            class="fixed top-0 bottom-0 left-0 right-0 z-[39] bg-[#001d34b2] flex items-center justify-center"
            v-if="isShown"
        >
            <slot name="custom">
                <div
                    class="bg-[#0c314f] shadow-[0_0_1.375rem_0_#082135] p-6 flex flex-col"
                    :class="[widthClass, roundedClass]"
                >
                    <div
                        class="flex flex-row justify-between items-center border-b border-[#2c5982] pb-3.5"
                    >
                        <div class="flex items-center gap-x-2">
                            <slot name="title-icon"></slot>
                            <h2
                                class="font-semibold text-[#9adbf6] text-lg leading-[1.167] tracking-[0.03em]"
                            >
                                <slot name="title"></slot>
                            </h2>
                        </div>
                        <CloseIcon
                            v-if="!hideClose"
                            class="cursor-pointer h-5 w-5 flex justify-center items-center group"
                            @click="close()"
                        />
                    </div>
                    <div class="flex flex-col mt-3">
                        <slot name="content"></slot>
                    </div>
                    <div class="mt-7">
                        <slot name="footer">
                            <div class="flex justify-end gap-x-2">
                                <OutlinedButton
                                    v-if="!hideCancel"
                                    @click="
                                        () => {
                                            if (props.hasBack) {
                                                emit('back');
                                            } else {
                                                close();
                                            }
                                        }
                                    "
                                    class=""
                                >
                                    {{ cancelText || t('cancel') }}
                                </OutlinedButton>
                                <SaveButton
                                    v-if="!hideClose"
                                    @click="emit('confirm')"
                                    class="!h-[1.688rem] min-w-[6.5rem] !rounded-md px-[0.6875rem] disabled:!bg-[#123d61]"
                                    :is-disabled="isConfirmDisabled"
                                    :is-saving="isSaving"
                                >
                                    {{ confirmText || t('save') }}
                                </SaveButton>
                            </div>
                        </slot>
                    </div>
                </div>
            </slot>
        </div>
    </Transition>
</template>

<script setup lang="ts">
import OutlinedButton from './Ui/OutlinedButton.vue';
import SaveButton from './Ui/SaveButton.vue';
import CloseIcon from '@/assets/CloseIcon.vue';

const props = withDefaults(
    defineProps<{
        widthClass?: string;
        roundedClass?: string;
        cancelText?: string;
        confirmText?: string;
        isConfirmDisabled?: boolean;
        hideCancel?: boolean;
        hideClose?: boolean;
        isSaving?: boolean;
        hasBack?: boolean;
        triggerClose?: any;
    }>(),
    {
        widthClass: 'w-[25.188rem]',
        roundedClass: 'rounded-xl',
        isConfirmDisabled: false,
        isSaving: false,
    },
);

const emit = defineEmits<{
    (e: 'close'): void;
    (e: 'confirm'): void;
    (e: 'back'): void;
}>();

const isShown = ref(true);

function close(force = false) {
    if (!force && props.isSaving) return;
    isShown.value = false;
    setTimeout(() => {
        emit('close');
    }, 150);
}

useEventListener(
    document,
    'keydown',
    (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
            e.stopImmediatePropagation();
            close();
        }
    },
    { capture: true },
);

watch(
    () => props.triggerClose,
    () => {
        close(true);
    },
);

const { t } = useI18n({
    messages: {
        en: {
            cancel: 'Cancel',
            save: 'Save',
        },
        ru: {
            cancel: 'Отмена',
            save: 'Сохранить',
        },
    },
});
</script>
