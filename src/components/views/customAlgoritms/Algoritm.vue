<template>
    <div class="flex flex-col">
        <div
            class="relative w-full flex pl-6 pr-5 items-center transition-color duration-300 bg-[#092740] hover:bg-[#0A2B47]"
            :class="props.isActive ? 'h-[4.25rem]' : 'h-[3.625rem]'"
        >
            <div
                class="flex flex-row h-[2.188rem] w-4 shrink-0 items-center rounded transition-[background-color,padding] select-none cursor-pointer on:bg-[#134d7d] items-center mr-8"
                @click.stop=""
            >
                <input
                    v-if="props.item.val !== null"
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
                class="select-none w-[2.125rem] h-[2.125rem] flex items-center justify-center text-sm font-normal text-[#ADEBFF] mr-2"
            >
                {{ props.index + 1 }}
            </div>
            <div
                v-if="props.item.val !== null"
                class="rounded-[50%] cursor-pointer w-[1.75rem] h-[1.75rem] flex items-center justify-center mr-2"
                :class="true ? 'bg-[#0E5853]' : 'bg-[#1B4A74]'"
                @click.stop=""
            >
                <IButtonIcon
                    :class="
                        props.item.val
                            ? '[&>path]:fill-[#00D6AF] [&>rect]:fill-[#00D6AF]'
                            : '[&>path]:fill-[#5891C2] [&>rect]:fill-[#5891C2]'
                    "
                />
            </div>
            <div
                v-if="props.item.val !== null"
                class="rounded-[50%] cursor-pointer w-[1.75rem] h-[1.75rem] flex items-center justify-center mr-5 bg-[#063054] hover:bg-[#00427A] transition-colors duration-300"
                @click.stop=""
            >
                <Copy />
            </div>
            <div
                v-if="props.item.val !== null"
                class="group flex-1 flex text-sm text-[#ADEBFF] h-full cursor-pointer items-center justify-between select-none pr-4"
                :class="[{ on: props.isOpen }]"
                @click="emit('oneClick')"
            >
                {{ props.item.label || '&#8212' }}
                <span
                    v-html="scrollArrow"
                    class="[&>svg]:h-[0.56rem] [&>svg]:w-[0.31rem] [&>svg>path]:!fill-[#8dc5f6] flex items-center cursor-pointer"
                ></span>
            </div>
            <div
                v-if="props.item.val !== null"
                class="cursor-pointer w-4 h-4 group"
                @click.stop="emit('deleteAlgoritm')"
            >
                <span
                    class="[&>svg]:w-3 [&>svg]:h-3 [&>svg]:rotate-45 [&>svg>path]:transition-colors [&>svg>path]:duration-500 [&>svg>path]:fill-[#194F76] group-hover:[&>svg>path]:fill-[#58B1FF]"
                    v-html="add"
                ></span>
            </div>
            <OutlinedButton
                v-else
                class="group w-[36px] !min-w-[36px]"
                @click="
                    () => {
                        // if (!props.isLoading) $emit('close');
                    }
                "
                ><span
                    class="[&>svg]:w-4 [&>svg]:h-4 [&>svg>path]:transition-colors [&>svg>path]:duration-500 [&>svg>path]:fill-[#148EF8] group-active:[&>svg>path]:fill-[#ADEBFF]"
                    v-html="add"
                ></span
            ></OutlinedButton>
        </div>
        <CollapseTransition :duration="300">
            <PresetAlgoritmBlocksWrapper
                v-if="props.isOpen"
                :type="props.curAction"
                :device="props.device"
                :index="index"
            />
        </CollapseTransition>
    </div>
</template>

<script lang="ts" setup>
import IButtonIcon from '@/assets/IButtonIcon.vue';
import Copy from '@/assets/Copy.vue';
import add from '@/assets/img/add.svg?raw';
import scrollArrow from '@/assets/img/scroll-arrow.svg?raw';
import CollapseTransition from '@/components/CollapseTransition.vue';
import OutlinedButton from '@/components/Ui/OutlinedButton.vue';
import PresetAlgoritmBlocksWrapper from '@/components/views/customAlgoritms/PresetAlgoritmBlocksWrapper.vue';
import type { Device } from '@/stores';

const props = defineProps<{
    checked: boolean;
    item: { val: 0 | 1 | null; label: string };
    index: number;
    isActive: boolean;
    isOpen: boolean;
    device?: Device;
    curAction:
        | { label: 'triggers'; val: 'udf-trig' }
        | { label: 'conditions'; val: 'udf-cond' }
        | { label: 'actions'; val: 'udf-act' }
        | { label: 'transformations'; val: 'udf-trans' };
}>();

const emit = defineEmits<{
    (e: 'selectAlgoritm', value: boolean): void;
    (e: 'deleteAlgoritm'): void;
    (e: 'oneClick'): void;
}>();
</script>
