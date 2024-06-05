<template>
    <transition name="height-margin-delay-300">
        <div class="relative mx-10">
            <div
                class="h-16 bg-[#092740] mt-4 rounded-xl flex items-center px-3 font-medium w-full overflow-hidden"
            >
                <transition name="translate">
                    <DevicesChoice
                        class="w-full"
                        v-if="activeMenuItem === 'devices'"
                        @enter="handleMouseEnter"
                        @leave="handleMouseLeave"
                    />
                    <InterfacesChoice
                        class="w-full"
                        v-else
                    />
                </transition>
            </div>
            <div
                v-if="shownStatus && showStatusInfo"
                class="absolute z-[3] top-[42px] pt-2"
                :style="{ left: statusFormLeft + 'px' }"
                @mouseenter="handleEnter"
                @mouseleave="handleLeave"
            >
                <div
                    class="bg-[#1B4569] rounded-[10px] py-4 px-6 text-sm text-[#A0D5FF] leading-[100%] flex flex-col gap-1"
                >
                    <div>ID: {{ shownStatus.serial }}</div>
                    <div class="relative">
                        <div
                            class="absolute w-[5px] h-[5px] rounded-[50%] left-[-11px] top-[5px]"
                            :class="[
                                { 'bg-[#84AFBD]': shownStatus.state === 'init' },
                                { 'bg-[#3E688E]': shownStatus.state === 'no-conn' },
                                { 'bg-[#FF5A88]': shownStatus.state === 'error' },
                            ]"
                        ></div>
                        {{ t('status') }}
                        {{
                            shownStatus.state === 'init'
                                ? t('init')
                                : shownStatus.state === 'error'
                                ? t('error')
                                : shownStatus.state === 'on'
                                ? t('on')
                                : shownStatus.state === 'off'
                                ? t('off')
                                : t('noConnection')
                        }}
                    </div>
                    <div>{{ t('addr') }} {{ shownStatus.addr }}</div>
                    <div>{{ t('firmWare') }} {{ shownStatus.version }}</div>
                </div>
            </div>
        </div>
    </transition>
</template>

<script lang="ts" setup>
import DevicesChoice from './DevicesChoice.vue';
import InterfacesChoice from './InterfacesChoice.vue';
import type { Device } from '@/stores';

defineProps<{
    activeMenuItem: string;
}>();

let showStatusTimer: ReturnType<typeof setTimeout> | undefined;

const shownStatus = ref<{ serial: string; state: string; addr: number; version: string } | null>(
    null,
);

const statusFormLeft = ref(28);

const isMouseOnStatusForm = ref(false);

const isMouseOnDevice = ref(false);

const showStatusInfo = ref(false);

function handleMouseLeave(device: Device) {
    if (!device.addr) return;
    isMouseOnDevice.value = false;
    return new Promise((resolve) =>
        setTimeout(() => {
            if (!isMouseOnStatusForm.value) {
                shownStatus.value = null;
                clearTimeout(showStatusTimer);
                showStatusTimer = undefined;
            }
        }, 0),
    );
}

function handleMouseEnter(device: Device, e: MouseEvent) {
    const target = e.target as HTMLElement;
    const parent = target.parentElement?.parentElement as HTMLElement;
    if (target && parent) {
        statusFormLeft.value = target.offsetLeft - parent.offsetLeft - parent.scrollLeft + 28;
    }
    isMouseOnDevice.value = true;
    if (!device.addr) return;
    if (!shownStatus.value) {
        shownStatus.value = {
            serial: device.serial,
            state: device.state,
            addr: device.addr,
            version: device.version,
        };
        showStatusInfo.value = false;
        showStatusTimer = setTimeout(() => {
            showStatus();
        }, 2000);
    }
}

function showStatus() {
    clearTimeout(showStatusTimer);
    showStatusTimer = undefined;
    showStatusInfo.value = true;
}

function handleEnter() {
    isMouseOnStatusForm.value = true;
}

function handleLeave() {
    isMouseOnStatusForm.value = false;
    return new Promise((resolve) =>
        setTimeout(() => {
            if (!isMouseOnDevice.value) {
                shownStatus.value = null;
                clearTimeout(showStatusTimer);
                showStatusTimer = undefined;
            }
        }, 5),
    );
}

onBeforeUnmount(() => {
    clearTimeout(showStatusTimer);
    showStatusTimer = undefined;
});

const { t } = useI18n({
    messages: {
        ru: {
            status: 'Статус: ',
            noConnection: 'нет соединения',
            init: 'инициализация',
            error: 'ошибка',
            on: 'включено',
            off: 'выключено',
            addr: 'Адрес: ',
            firmWare: 'Прошивка: ',
        },
        en: {
            status: 'Status: ',
            noConnection: 'no connection',
            init: 'initialization',
            error: 'error',
            on: 'on',
            off: 'off',
            addr: 'Address: ',
            firmWare: 'Firmware: ',
        },
    },
});
</script>
