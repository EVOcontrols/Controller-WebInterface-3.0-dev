<template>
    <div
        class="group w-full rounded-[6px] flex flex-col p-3 items-start transition-color duration-300 bg-[#1C4B73]"
        :class="{ 'hover:bg-[#255C8A]': props.count !== props.maxCount }"
        @click.stop="
            () => {
                if (props.count !== props.maxCount) emit('createAlgoritm');
            }
        "
    >
        <div class="flex w-full">
            <div class="text-sm font-semibold leading-[120%] text-[#ADEBFF] select-none flex-1">
                {{ props.name }}
            </div>
            <div
                class="ml-5 mr-3 w-[4.125rem] h-5 text-xs rounded-[4px] flex justify-center items-center leading-[100%] select-none"
                :class="
                    props.count === props.maxCount
                        ? 'bg-[#F830684D] text-[#F83068]'
                        : props.count >= props.maxCount * 0.9
                        ? 'bg-[#EB82464D] text-[#EB8246]'
                        : 'bg-[#42CBF626] text-[#42CBF6] group-hover:bg-[#42CBF626] group-hover:text-[#42CBF6]'
                "
            >
                {{ props.count }}/{{ props.maxCount }}
            </div>
            <div
                class="w-5 h-5 flex items-center justify-center cursor-pointer"
                @click.stop="console.log('!')"
            >
                <SettingsIcon class="group-hover:[&>path]:fill-[#307CB2]" />
            </div>
        </div>
        <div class="text-sm font-semibold leading-[120%] text-[#6CB5D3] select-none">
            {{ props.descr }}
        </div>
    </div>
</template>

<script lang="ts" setup>
import SettingsIcon from '@/assets/SettingsIcon.vue';

const props = defineProps<{
    name: string;
    descr: string;
    count: number;
    maxCount: number;
}>();

const emit = defineEmits<{
    (e: 'createAlgoritm'): void;
}>();
</script>
