<template>
    <div
        class="flex w-full h-[3.125rem] border-b border-[#1D4162] items-center px-4 justify-between select-none"
        :class="notConnected ? 'text-[#3E688E]' : 'text-[#9ADBF6]'"
    >
        {{ title }}
        <div class="flex items-center gap-2">
            <SettingsIcon :class="{ nc: notConnected }" />
            <div
                v-if="props.w.deviceName"
                class="px-[11px] py-[6px] rounded font-roboto"
                :class="
                    notConnected ? 'bg-[#1B4569] text-[#3E688E]' : 'bg-[#12405b] text-[#42CBF6]'
                "
            >
                {{
                    props.w.d === 0
                        ? props.w.deviceName.slice(0, props.w.deviceName.indexOf('-'))
                        : props.w.deviceName.slice(props.w.deviceName.indexOf('-') + 3)
                }}
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { useI18n } from 'vue-i18n';
import SettingsIcon from '@/assets/SettingsIcon.vue';
import type { Widget } from '@/stores';

const props = defineProps<{
    w: Widget;
}>();

const indexStore = useIndexStore();

const { interfaces, notConnected } = storeToRefs(indexStore);

const { locale } = useI18n();

const title = computed<string>(() => {
    const interf = interfaces.value.find((i) => i.value === props.w.i);
    return locale.value === 'en' ? (interf?.label.en as string) : (interf?.label.ru as string);
});
</script>
