<template>
    <div class="relative pb-8">
        <div class="flex font-semibold mt-6 mx-10">
            <div
                class="flex mr-5 group items-center h-[1.375rem]"
                :class="{ active: showChoice === di }"
                v-for="di in ['devices', 'interfaces']"
                :key="di"
            >
                <span
                    class="mr-3 text-sm text-[#4A779E] hover:text-[#6C9DC9] active:text-[#8DC5F6] cursor-pointer transition-all duration-300"
                    :class="{ '!text-[#8DC5F6]': showChoice === di }"
                    @click="changeShowChoice(di)"
                >
                    {{ di === 'devices' ? t('devices') : t('interfaces') }}
                </span>
                <span
                    class="flex chosen-count bg-[#1B4569] px-3 py-[3px] rounded-[5px] flex items-center cursor-pointer transition-all duration-300 text-xs font-roboto text-[#8DC5F6] hover:bg-[#148EF8] hover:text-[#ADEBFF] active:bg-[#306add]"
                    :class="{ active: showChoice === di }"
                    v-if="diCount[di]"
                    @click="reset(di)"
                >
                    {{ diCount[di] }}
                    <CloseIconVue class="w-4 h-4" />
                </span>
            </div>
        </div>
        <DIChoice :activeMenuItem="showChoice" />
        <WidgetsPage />
        <div
            class="absolute left-0 top-0 h-full w-full"
            v-if="notConnected"
        />
    </div>
</template>

<script lang="ts" setup>
import { useI18n } from 'vue-i18n';
import CloseIconVue from '@/components/toast/CloseIcon.vue';
import DIChoice from '@/components/views/panel-choice/DIChoice.vue';
import WidgetsPage from '@/views/panel/WidgetsPage.vue';

const indexStore = useIndexStore();

const showChoice = ref<string>('devices');

const { notConnected, chosenDevices, chosenInterfaces } = storeToRefs(indexStore);

const chosenDevicesCount = ref<number>(chosenDevices.value.length);

const chosenInterfacesCount = ref<number>(chosenInterfaces.value.length);

const diCount = ref<{ devices: number; interfaces: number }>({
    devices: chosenDevicesCount.value,
    interfaces: chosenInterfacesCount.value,
});

function changeShowChoice(di: string) {
    localStorage.setItem('showChoice', di);
    showChoice.value = di;
}

function reset(di: string) {
    di === 'devices' ? indexStore.toggleChooseAllDevices() : indexStore.toggleChooseAllInterfaces();
}

onBeforeMount(async () => {
    showChoice.value = localStorage.getItem('showChoice') || showChoice.value;
    if (!localStorage.getItem('chosenDevices'))
        localStorage.setItem('chosenDevices', JSON.stringify(chosenDevices.value));
    if (!localStorage.getItem('chosenInterfaces'))
        localStorage.setItem('chosenInterfaces', JSON.stringify(chosenInterfaces.value));
});

watch(
    () => chosenDevices.value,
    () => {
        chosenDevicesCount.value = chosenDevices.value.length;
        diCount.value.devices = chosenDevicesCount.value;
    },
);

watch(
    () => chosenInterfaces.value,
    () => {
        chosenInterfacesCount.value = chosenInterfaces.value.length;
        diCount.value.interfaces = chosenInterfacesCount.value;
    },
);

const { t } = useI18n({
    messages: {
        ru: {
            devices: 'Устройства',
            interfaces: 'Интерфейсы',
        },
        en: {
            devices: 'Devices',
            interfaces: 'Interfaces',
        },
    },
});
</script>
