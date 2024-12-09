<template>
    <button
        class="rounded-lg h-[1.813rem] font-semibold text-sm leading-[100%] px-[10px] relative"
        :class="[
            notConnected
                ? 'bg-[#1B4569] text-[#3E688E]'
                : props.isDisabled
                ? 'bg-[#123D61] text-[#3E688E] cursor-auto pointer-events-none'
                : 'bg-[#148ef8] text-[#ADEBFF] hover:bg-[#3e7df9] active:bg-[#306add]',
        ]"
    >
        <slot></slot>
    </button>
</template>
<script lang="ts" setup>
const indexStore = useIndexStore();

const { notConnected } = storeToRefs(indexStore);

const props = defineProps<{
    isDisabled?: boolean;
}>();
</script>
