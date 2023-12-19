<template>
    <button
        class="rounded-lg h-[1.813rem] font-semibold text-sm leading-[100%] px-6 relative hover:bg-[#3e7df9] active:bg-[#306add]"
        :class="notConnected ? 'bg-[#1B4569] text-[#3E688E]' : 'bg-[#148ef8] text-[#ADEBFF]'"
    >
        <slot></slot>
    </button>
</template>
<script lang="ts" setup>
const indexStore = useIndexStore();

const { notConnected } = storeToRefs(indexStore);
</script>
