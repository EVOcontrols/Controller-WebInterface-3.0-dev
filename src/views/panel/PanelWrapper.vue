<template>
    <div class="mb-8 mx-10 flex flex-col">
        <div class="flex flex-row mt-5">
            <div
                v-for="item in menuItems"
                :key="item"
                class="flex flex-row items-center"
            >
                <button
                    class="font-semibold text-[#4a779e] text-base leading-[1.188] hover:text-[#6c9dc9] on:text-[#8dc5f6] mr-2"
                    :class="{ on: activeMenuItem === item }"
                    @click="activeMenuItem = item"
                >
                    {{ t(`menuItems.${item}`) }}
                </button>
                <button
                    class="rounded-md h-[1.375rem] w-[3.375rem] bg-[#1b4569] on:bg-[#148ef8] hover:bg-[#148ef8] active:bg-[#306add] on:active:bg-[#306add] flex items-center justify-center mr-6"
                    :class="{ on: activeMenuItem === item }"
                ></button>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
const menuItems = ['devices', 'interfaces'] as const;

const activeMenuItem = ref<(typeof menuItems)[number]>('devices');

const { t } = useI18n({
    messages: {
        en: {
            menuItems: {
                devices: 'Devices',
                interfaces: 'Interfaces',
            },
        },
        ru: {
            menuItems: {
                devices: 'Устройства',
                interfaces: 'Интерфейсы',
            },
        },
    },
});
</script>
