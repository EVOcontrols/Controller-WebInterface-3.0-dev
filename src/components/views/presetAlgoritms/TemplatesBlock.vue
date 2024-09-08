<template>
    <div
        class="relative shadow-[0_0_16px_0_#02121e3d] p-5 pr-[0.875rem] pb-0 overflow-y-hidden h-fit"
        :style="{ width: 'calc(50% - 10px)' }"
    >
        <div class="font-semibold text-[18px] text-[#9ADBF6] mb-[2.375rem]">
            {{ t('title') }}
        </div>
        <div class="absolute bg-[#2C5982] h-[1px] w-full left-0 top-[61px]"></div>
        <div
            v-dragscroll.y
            class="overflow-y-auto w-full flex-1 scrollbar-4"
            :style="{ 'max-height': 'calc(100vh - 186px)' }"
        >
            <div class="bg-[#0C3659] rounded-[6px] overflow-hidden flex flex-col gap-2">
                <Group
                    v-for="(item, i) in props.items"
                    :key="i"
                    :isActive="activeGroups.includes(i)"
                    :index="i"
                    :templates="item.templates"
                    @toggleIsActive="
                        activeGroups.includes(i)
                            ? (activeGroups = activeGroups.filter((el) => el !== i))
                            : activeGroups.push(i)
                    "
                    @createAlgoritm="emit('createAlgoritm')"
                />
            </div>
            <div class="w-full !h-8 bg-[#10375A]"></div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import Group from '@/components/views/presetAlgoritms/Group.vue';

const props = defineProps<{
    items: { templates: { name: string; descr: string; count: number; maxCount: number }[] }[];
}>();

const emit = defineEmits<{
    (e: 'createAlgoritm'): void;
}>();

const activeGroups = ref<number[]>([]);

const { t } = useI18n({
    messages: {
        en: {
            title: 'Select a template',
        },
        ru: {
            title: 'Выберите шаблон',
        },
    },
});
</script>
