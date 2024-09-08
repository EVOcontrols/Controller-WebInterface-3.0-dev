<template>
    <div
        class="fixed top-0 bottom-0 left-0 right-0 z-[4] bg-[#001D34B2] flex items-center justify-center"
    >
        <div
            class="relative p-6 bg-[#0C314F] shadow-[0_0_22px_0_#082135] min-w-[480px] rounded-[12px] flex flex-col gap-[18px] w-[27.75rem]"
            :style="{ height: 'fit-content' }"
        >
            <div class="flex items-center gap-2">
                <UpdateIcon class="w-[21px] h-[21px]" />
                <div class="flex-1 text-lg text-[#9ADBF6] font-semibold">
                    {{ t('title') }}
                </div>
                <CloseIcon
                    class="cursor-pointer"
                    @click="$emit('close')"
                />
            </div>
            <div class="w-full h-[1px] bg-[#2C5982]"></div>
            <div class="flex flex-col text-[#84b5e3]">
                {{ t('name') }}
                <input
                    class="mt-[14px] w-full h-10 rounded-[6px] px-4 placeholder:text-[#5183B1] placeholder:text-sm text-sm bg-[#123A5B] text-[#84b5e3]"
                    type="text"
                    :placeholder="t('placeholder')"
                    :value="name"
                    :maxlength="32"
                    @input="(e) => handleInput(e as InputEvent)"
                />
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
                    class="w-[114px]"
                    :isDisabled="!name"
                    @click="
                        () => {
                            if (!props.isLoading && name) emit('create');
                        }
                    "
                >
                    <span
                        v-if="props.isLoading"
                        v-html="spinnerInsideButton"
                        class="[&>svg]:w-4 [&>svg>path]:fill-[#ADEBFF] flex items-center justify-center"
                    ></span>
                    <span v-else>{{ t('continue') }}</span></PrimaryButton
                >
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import UpdateIcon from '@/assets/UpdateIcon.vue';
import PrimaryButton from '@/components/Ui/PrimaryButton.vue';
import OutlinedButton from '@/components/Ui/OutlinedButton.vue';
import CloseIcon from '@/assets/CloseIcon.vue';
import spinnerInsideButton from '@/assets/img/spinner-inside-button.svg?raw';

const props = defineProps<{
    isLoading: boolean;
}>();

const emit = defineEmits<{
    (e: 'close'): void;
    (e: 'create'): void;
}>();

const name = ref('');

function handleInput(e: InputEvent) {
    const target = e.target as HTMLInputElement;
    name.value = target.value;
}

const { t } = useI18n({
    messages: {
        en: {
            title: 'Algorithm name',
            cancel: 'Cancel',
            continue: 'Continue',
            name: 'Name',
            placeholder: 'Enter the name of the algorithm',
        },
        ru: {
            title: 'Название алгоритма',
            cancel: 'Отмена',
            continue: 'Продолжить',
            name: 'Название',
            placeholder: 'Введите название алгоритма ',
        },
    },
});
</script>
