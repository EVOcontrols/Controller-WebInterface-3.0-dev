<template>
    <div
        class="relative h-[3.625rem] w-full flex pl-6 pr-5 items-center transition-color duration-300"
        :class="props.isActive ? 'bg-[#0A2B47]' : 'bg-[#092740] hover:bg-[#0A2B47]'"
    >
        <div
            v-if="props.isActive"
            class="h-8 w-[2px] bg-[#158EF8] rounded-r-[2px] absolute top-[13px] left-0"
        ></div>
        <div
            class="flex flex-row h-[2.188rem] shrink-0 items-center rounded transition-[background-color,padding] select-none cursor-pointer on:bg-[#134d7d] items-center mr-8"
            @click.stop=""
        >
            <input
                type="checkbox"
                :checked="props.checked"
                class="cursor-pointer"
                @change="
                    () => {
                        emit('selectAlgoritm', !props.checked);
                    }
                "
            />
        </div>
        <div
            class="rounded-[50%] cursor-pointer w-[1.75rem] h-[1.75rem] flex items-center justify-center mr-5"
            :class="true ? 'bg-[#0E5853]' : 'bg-[#1B4A74]'"
            @click.stop=""
        >
            <IButtonIcon
                :class="
                    true
                        ? '[&>path]:fill-[#00D6AF] [&>rect]:fill-[#00D6AF]'
                        : '[&>path]:fill-[#5891C2] [&>rect]:fill-[#5891C2]'
                "
            />
        </div>
        <div class="flex-1 flex flex-col">
            <div class="text-sm font-semibold leading-[120%] text-[#ADEBFF] select-none">
                Название
            </div>
            <div class="text-sm font-semibold leading-[120%] text-[#6CB5D3] select-none">
                Группа / Шаблон
            </div>
        </div>
        <div
            class="cursor-pointer w-4 h-4 group"
            @click.stop="emit('deleteAlgoritm')"
        >
            <span
                class="[&>svg]:w-3 [&>svg]:h-3 [&>svg]:rotate-45 [&>svg>path]:transition-colors [&>svg>path]:duration-500 [&>svg>path]:fill-[#194F76] group-hover:[&>svg>path]:fill-[#58B1FF]"
                v-html="add"
            ></span>
        </div>
        <div
            v-if="props.isActive"
            class="h-8 w-[2px] bg-[#158EF8] rounded-l-[2px] absolute top-[13px] right-0"
        ></div>
    </div>
</template>

<script lang="ts" setup>
import IButtonIcon from '@/assets/IButtonIcon.vue';
import add from '@/assets/img/add.svg?raw';

const props = defineProps<{
    isActive: boolean;
    checked: boolean;
}>();

const emit = defineEmits<{
    (e: 'selectAlgoritm', value: boolean): void;
    (e: 'deleteAlgoritm'): void;
}>();
</script>
