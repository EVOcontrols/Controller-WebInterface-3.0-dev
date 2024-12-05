<template>
    <div class="flex whitespace-nowrap w-full flex-none">
        <div class="flex overflow-hidden w-full flex-none">
            <ArrowIcon
                v-if="!isStartScrollEl"
                class="absolute top-[50%] translate-y-[-50%] rotate-180 left-[6px] cursor-pointer"
                :class="{ disabled: notConnected }"
                @click="handleArrowClick('toStart')"
            />
            <div class="flex overflow-x-hidden ml-2 bg-113 pl-2 pr-1 rounded-l-lg w-full">
                <div
                    v-dragscroll.x
                    v-on:dragscrollmove="handleScrollMove"
                    class="flex items-center overflow-x-auto no-scrollbar w-full flex-none"
                    ref="scrollWrapper"
                >
                    <div
                        class="flex items-center flex-none"
                        ref="scrollEl"
                    >
                        <div
                            v-for="device in [...new Set(devices)]"
                            :key="device.addr"
                            class="device h-6 min-w-[4rem] pr-2 flex items-center mr-[6px] rounded text-0.81 font-roboto text-[#ADEBFF] transition-all duration-300 justify-center select-none"
                            :class="[
                                chosenDevices.includes(device.addr) ? 'bg-[#148ef8]' : 'bg-[#143959]',
                                ['init', 'no-conn', 'error'].includes(device.state) ? 'pl-[6px]' : 'pl-2',
                                device.state === 'no-conn' ? 'cursor-default' : 'cursor-pointer hover:bg-[#214e76]',
                            ]"
                            @mousedown="mousedown"
                            @mouseup="mouseup(device, $event)"
                            @mouseenter="(e) => $emit('enter', device, e as MouseEvent)"
                            @mouseleave="$emit('leave', device)"
                        >
                            <div
                                v-if="device.addr !== 0 && device.state !== 'on' && device.state !== 'off'"
                                class="w-[5px] h-[5px] rounded-[50%] mr-[6px]"
                                :class="[
                                    { 'bg-[#84AFBD]': device.state === 'init' },
                                    { 'bg-[#3E688E]': device.state === 'no-conn' },
                                    { 'bg-[#FF5A88]': device.state === 'error' },
                                ]"
                            ></div>
                            {{ device.addr === 0 ? 'NGC' : device.type.slice(device.type.indexOf('-') + 3) }}
                        </div>
                    </div>
                </div>
            </div>
            <div class="flex items-center pr-5 pl-[1.875rem] ml-[1px]">
                <ArrowIcon
                    v-if="!isEndScrollEl"
                    class="h-full cursor-pointer mr-[6px]"
                    :class="{ disabled: notConnected }"
                    @click="handleArrowClick('toEnd')"
                />
                <div class="h-[39px] w-[1px] bg-[#0C3051] mr-3"></div>
                <!-- eslint-disable-next-line vuejs-accessibility/label-has-for -->
                <label class="flex items-center cursor-pointer nc:cursor-default group mr-[26px]">
                    <check-box
                        :isDisabled="notConnected"
                        @change="toggleChooseAllDevices()"
                        :isAllChosen="isAllDevicesChosen"
                    />
                    <span class="ml-2 text-sm font-medium leading-none select-none nc:!text-[#426F95] text-[#8DC5F6]'">
                        {{ t('select') }}
                    </span>
                </label>
                <div class="group">
                    <SettingsIcon
                        :class="{ nc: notConnected }"
                        :disabled="ngcModbusMode !== 'ext-devs'"
                    />
                    <div
                        v-if="ngcModbusMode !== 'ext-devs'"
                        class="absolute flex flex-col gap-3 py-4 px-5 w-[270px] h-[130px] bg-[#1B4569] right-5 -top-[116px] rounded-[10px] invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-[visibility,opacity] z-[1]"
                    >
                        <span class="w-full text-[#A0D5FF] font-semibold text_wrap">{{ t('infoBlock.title') }}</span>
                        <div class="w-full text-balance text-[#77C3FF] text_wrap">
                            {{ t('infoBlock.text.p1')
                            }}{{ ngcModbusMode === 'off' ? t('infoBlock.text.off') : t('infoBlock.text.mb')
                            }}{{ t('infoBlock.text.p2') }}
                            <RouterLink :to="{ path: 'settings/devices' }"
                                ><span class="underline text-[#ADEBFF] font-semibold">
                                    {{ t('infoBlock.text.link') }}</span
                                ></RouterLink
                            >{{ t('infoBlock.text.p3') }}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { useI18n } from 'vue-i18n';
import CheckBox from './CheckBox.vue';
import ArrowIcon from '@/assets/ArrowIcon.vue';
import SettingsIcon from '@/assets/SettingsIcon.vue';
import type { Device } from '@/typings/main';

const isAllDevicesChosen = ref(false);

const indexStore = useIndexStore();

const mouseupX = ref<number>(0);

const scrollWrapper = ref<HTMLElement | undefined>();

const scrollEl = ref<HTMLElement | undefined>();

const isStartScrollEl = ref(true);

const isEndScrollEl = ref(false);

const { chosenDevices, devices, notConnected, ngcModbusMode } = storeToRefs(indexStore);

function toggleChooseAllDevices() {
    isAllDevicesChosen.value = !isAllDevicesChosen.value;
    indexStore.toggleChooseAllDevices(isAllDevicesChosen);
}

function handleArrowClick(direction: 'toStart' | 'toEnd') {
    const el = scrollEl.value;
    const wrapper = scrollWrapper.value;
    if (!el || !wrapper) return;
    if (direction === 'toStart') {
        wrapper.scrollTo({ left: wrapper.scrollLeft - wrapper.offsetWidth, behavior: 'smooth' });
        isStartScrollEl.value = wrapper.scrollLeft - wrapper.offsetWidth < 20;
        isEndScrollEl.value = false;
    } else {
        wrapper.scrollTo({ left: wrapper.scrollLeft + wrapper.offsetWidth, behavior: 'smooth' });
        isStartScrollEl.value = false;
        isEndScrollEl.value =
            wrapper.scrollWidth - wrapper.offsetWidth - 20 <= wrapper.scrollLeft + wrapper.offsetWidth;
    }
}

function handleScrollMove() {
    const wrapper = scrollWrapper.value;
    const el = scrollEl.value;
    if (!el || !wrapper || wrapper.offsetWidth === el.offsetWidth) return;
    isStartScrollEl.value = wrapper.scrollLeft < 20;
    isEndScrollEl.value = Math.round(wrapper.scrollLeft) > el.offsetWidth - wrapper.offsetWidth - 20;
}

function mousedown(e: MouseEvent) {
    mouseupX.value = e.screenX;
}

function mouseup(device: Device, e: MouseEvent) {
    if (device.state === 'no-conn') return;

    if (mouseupX.value) {
        if (Math.abs(e.screenX - mouseupX.value) < 20) {
            indexStore.toggleDevice(device.addr);
        }
        mouseupX.value = 0;
    }
}

onBeforeMount(async () => {
    isAllDevicesChosen.value = chosenDevices.value.length === devices.value.length;
});

onMounted(() => {
    const wrapper = scrollWrapper.value;
    const el = scrollEl.value;
    if (!wrapper || !el) return;
    isEndScrollEl.value = !(wrapper.offsetWidth <= el.offsetWidth);
});

watch(
    () => [chosenDevices.value, devices.value],
    () => {
        console.log('DEVICES!!!!!', devices.value && JSON.parse(JSON.stringify(devices.value)));
        isAllDevicesChosen.value = chosenDevices.value.length === devices.value.length;
    },
);

const { t } = useI18n({
    messages: {
        ru: {
            select: 'Выбрать все',
            allDevices: 'Все устройства',
            infoBlock: {
                title: 'Редактирование списка устройств расширения невозможно.',
                text: {
                    p1: 'Шина RS485 NGC ',
                    off: 'отключена. ',
                    mb: 'находится в режиме “переменные Modbus". ',
                    p2: 'Нажмите ',
                    link: 'сюда ',
                    p3: 'для перехода к настройкам режима работы шины.',
                },
            },
        },
        en: {
            select: 'Select all',
            allDevices: 'All devices',
            infoBlock: {
                title: 'Editing the list of expansion devices is not possible.',
                text: {
                    p1: 'RS485 NGC bus ',
                    off: 'disabled. ',
                    mb: 'is in “Modbus variables” mode. ',
                    p2: 'Click ',
                    link: 'here ',
                    p3: 'to go to the bus operating mode settings.',
                },
            },
        },
    },
});
</script>

<style lang="postcss" scoped>
.text_wrap {
    text-wrap: wrap;
}
</style>
