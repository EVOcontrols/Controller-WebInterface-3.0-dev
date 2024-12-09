<template>
    <div class="">
        <template
            v-for="btn in buttons"
            :key="btn?.value"
        >
            <button
                v-if="btn"
                class="h-[1.875rem] min-w-[5rem] bg-[#0f304b] first:rounded-l-lg last:rounded-r-lg hover:bg-[#123653] on:bg-[#023e71] font-roboto text-sm text-[#5f93c2] hover:text-[#2a9bff] on:text-[#2b9bff]"
                :class="[
                    { on: value === btn.value },
                    additionalClasses,
                    btn.isDisabled ? 'cursor-auto pointer-events-none' : '',
                ]"
                @click="emit('change', btn.value)"
                type="button"
            >
                {{ btn.text }}
            </button>
        </template>
    </div>
</template>

<script lang="ts" setup generic="T, U extends T">
defineProps<{
    buttons: Readonly<
        ({
            text: string;
            value: T;
            isDisabled?: boolean;
        } | null)[]
    >;
    value: U | undefined;
    additionalClasses?: string;
}>();

const emit = defineEmits<{
    (e: 'change', value: T): void;
}>();
</script>
