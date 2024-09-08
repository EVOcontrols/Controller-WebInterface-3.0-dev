<template>
    <div
        class="absolute px-8 bg-[#0C314F] shadow-[0_0_7px_0_#07243D] rounded-t-[6px] flex items-center gap-[18px] w-fit h-[3.125rem] min-h-[3.125rem] left-0 right-0 bottom-0 mx-auto"
        :style="{ height: 'fit-content' }"
    >
        <div class="flex items-center gap-2 text-[#8DC5F6]">
            <div class="text-sm flex gap-2 items-center select-none">
                {{ t('selected') }}
                <div
                    class="bg-[#004787] h-6 w-[3rem] flex items-center justify-center rounded-[11px] text-[#35A1FF]"
                >
                    {{ props.countLeft }}
                </div>
                <div
                    class="bg-[#004787] h-6 w-[3rem] flex items-center justify-center rounded-[11px] text-[#35A1FF]"
                >
                    {{ props.countRight }}
                </div>
            </div>
            <div class="bg-[#17446C] w-[1px] h-[2.125rem] mx-1"></div>
            <div class="text-sm select-none flex items-center gap-2 cursor-pointer">
                <div
                    class="rounded-[50%] w-[1.75rem] h-[1.75rem] flex items-center justify-center bg-[#0E5853]"
                >
                    <IButtonIcon class="[&>path]:fill-[#00D6AF] [&>rect]:fill-[#00D6AF]" />
                </div>
                {{ t('turnOn') }}
            </div>
            <div class="bg-[#17446C] w-[1px] h-[2.125rem] mx-1"></div>
            <div class="text-sm select-none flex items-center gap-2 cursor-pointer">
                <div
                    class="group rounded-[50%] w-[1.75rem] h-[1.75rem] flex items-center justify-center bg-[#1E4F7A]"
                >
                    <IButtonIcon
                        class="[&>path]:fill-[#4A81B0] [&>rect]:fill-[#4A81B0] group-hover:[&>path]:fill-[#58b1ff] group-hover:[&>rect]:fill-[#58b1ff]"
                    />
                </div>
                {{ t('switchOff') }}
            </div>
            <div class="bg-[#17446C] w-[1px] h-[2.125rem] mx-1"></div>
            <div
                class="text-sm select-none flex items-center gap-2 cursor-pointer"
                @click="emit('deleteAlgoritms')"
            >
                <div
                    class="rounded-[50%] w-[1.75rem] h-[1.75rem] flex items-center justify-center bg-[#1E4F7A]"
                >
                    <CloseIcon class="[&>rect]:fill-[#4A81B0]" />
                </div>
                {{ t('delete') }}
            </div>
            <div class="bg-[#17446C] w-[1px] h-[3.125rem] mx-3"></div>
            <CloseIcon
                class="cursor-pointer"
                @click="$emit('close')"
            />
        </div>
    </div>
</template>

<script lang="ts" setup>
import CloseIcon from '@/assets/CloseIcon.vue';
import IButtonIcon from '@/assets/IButtonIcon.vue';

const props = defineProps<{
    countLeft: number;
    countRight: number;
}>();

const emit = defineEmits<{
    (e: 'close'): void;
    (e: 'deleteAlgoritms'): void;
}>();

const { t } = useI18n({
    messages: {
        en: {
            selected: 'Selected',
            chooseAll: 'Choose all',
            turnOn: 'Turn on',
            switchOff: 'Switch off',
            delete: 'Delete',
        },
        ru: {
            selected: 'Выбрано',
            chooseAll: 'Выбрать все',
            turnOn: 'Включить',
            switchOff: 'Выключить',
            delete: 'Удалить',
        },
    },
});
</script>
