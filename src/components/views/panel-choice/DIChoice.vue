<template>
    <transition name="height-margin-delay-300">
        <div class="mx-10">
            <div
                class="h-16 bg-[#092740] mt-4 rounded-xl flex items-center px-3 font-medium w-full relative overflow-hidden"
            >
                <transition name="translate">
                    <DevicesChoice
                        class="w-full"
                        v-if="activeMenuItem === 'devices'"
                    />
                    <InterfacesChoice
                        class="w-full"
                        v-else
                    />
                </transition>
            </div>
        </div>
    </transition>
</template>

<script lang="ts" setup>
defineProps<{
    activeMenuItem: string;
}>();
import DevicesChoice from './DevicesChoice.vue';
import InterfacesChoice from './InterfacesChoice.vue';
</script>
