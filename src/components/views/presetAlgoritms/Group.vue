<template>
    <div
        class="w-full rounded-[6px] p-4 transition-color duration-300 flex flex-col gap-5"
        :class="[
            props.isActive ? 'bg-[#164469]' : 'bg-[#103D61] hover:bg-[#164469]',
            { on: props.isActive },
            { group: !props.isActive },
        ]"
        @click="emit('toggleIsActive')"
    >
        <div class="relative flex items-center">
            <div
                class="w-[1.75rem] h-[1.75rem] rounded-[4px] flex items-center justify-center text-sm text-[#8AC2F3] transition-color duration-300 mr-3"
                :class="props.isActive ? 'bg-[#184D78]' : 'bg-[#15446B] group-hover:bg-[#184D78]'"
            >
                {{ props.index + 1 }}
            </div>
            <div class="flex-1 flex flex-col">
                <div class="text-sm font-semibold leading-[120%] text-[#ADEBFF] select-none">
                    Название группы
                </div>
                <div class="text-sm font-semibold leading-[120%] text-[#6CB5D3] select-none">
                    Описание группы
                </div>
            </div>
            <span
                v-html="scrollArrow"
                class="[&>svg]:h-[11px] [&>svg]:w-[5px] [&>svg>path]:!fill-[#8dc5f6] absolute right-[7px] top-0 bottom-0 my-auto flex items-center"
            ></span>
        </div>
        <CollapseTransition :duration="300">
            <div
                v-if="props.isActive"
                class="flex flex-col gap-1"
            >
                <Template
                    v-for="(item, i) in props.templates"
                    :key="i"
                    :name="item.name"
                    :descr="item.descr"
                    :count="item.count"
                    :maxCount="item.maxCount"
                    @createAlgoritm="emit('createAlgoritm')"
                /></div
        ></CollapseTransition>
    </div>
</template>

<script lang="ts" setup>
import scrollArrow from '@/assets/img/scroll-arrow.svg?raw';
import Template from '@/components/views/presetAlgoritms/Template.vue';
import CollapseTransition from '@/components/CollapseTransition.vue';

const props = defineProps<{
    isActive: boolean;
    index: number;
    templates: { name: string; descr: string; count: number; maxCount: number }[];
}>();

const emit = defineEmits<{
    (e: 'toggleIsActive'): void;
    (e: 'createAlgoritm'): void;
}>();
</script>
