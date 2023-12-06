<template>
    <div class="flex whitespace-nowrap w-full flex-none">
        <div class="flex flex-1 overflow-hidden w-full flex-none">
            <ArrowIcon
                v-if="!isStartScrollEl"
                class="absolute top-[50%] translate-y-[-50%] rotate-180 left-[6px] cursor-pointer"
                :class="{ disabled: notConnected }"
                @click="handleArrowClick('toStart')"
            />
            <div class="flex overflow-x-hidden relative ml-2 bg-113 pl-2 pr-1 rounded-l-lg w-full">
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
                            v-for="device in devices"
                            :key="device.addr"
                            class="device h-6 min-w-[4rem] px-3 flex items-center mr-[6px] rounded text-0.81 font-roboto text-[#ADEBFF] cursor-pointer transition-all duration-300 justify-center select-none"
                            :class="{
                                active: chosenDevices.includes(device.addr),
                            }"
                            @mousedown="mousedown"
                            @mouseup="mouseup(device.addr, $event)"
                        >
                            {{ device.type + ' ' + device.addr }}
                        </div>
                    </div>
                </div>
            </div>

            <div class="relative flex items-center pr-5 pl-[1.875rem] ml-[1px]">
                <ArrowIcon
                    v-if="!isEndScrollEl"
                    class="absolute top-[50%] translate-y-[-50%] left-1 cursor-pointer"
                    :class="{ disabled: notConnected }"
                    @click="handleArrowClick('toEnd')"
                />
                <div class="h-[39px] w-[1px] bg-[#0C3051] mr-3"></div>
                <!-- eslint-disable-next-line vuejs-accessibility/label-has-for -->
                <label class="flex items-center cursor-pointer nc:cursor-default group">
                    <check-box
                        :isDisabled="notConnected"
                        @change="toggleChooseAllDevices()"
                        :isAllChosen="isAllDevicesChosen"
                    />
                    <span
                        class="ml-2 text-sm font-medium leading-none select-none nc:!text-[#426F95] text-[#8DC5F6]'"
                    >
                        {{ t('select') }}
                    </span>
                </label>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { useI18n } from 'vue-i18n';
import CheckBox from './CheckBox.vue';
import ArrowIcon from '@/assets/ArrowIcon.vue';

const isAllDevicesChosen = ref(false);

const indexStore = useIndexStore();

const mouseupX = ref<number>(0);

const scrollWrapper = ref<HTMLElement | undefined>();

const scrollEl = ref<HTMLElement | undefined>();

const isStartScrollEl = ref(true);

const isEndScrollEl = ref(false);

const { chosenDevices, devices, notConnected } = storeToRefs(indexStore);

function toggleChooseAllDevices() {
    isAllDevicesChosen.value = !isAllDevicesChosen.value;
    indexStore.toggleChooseAllDevices(isAllDevicesChosen);
}

function handleArrowClick(direction: 'toStart' | 'toEnd') {
    const el = scrollEl.value;
    const wrapper = scrollWrapper.value;
    if (!el || !wrapper) return;
    if (direction === 'toStart') {
        wrapper.scrollTo({ left: 0, behavior: 'smooth' });
        isStartScrollEl.value = true;
        isEndScrollEl.value = false;
    } else {
        wrapper.scrollTo({ left: wrapper.offsetWidth, behavior: 'smooth' });
        isStartScrollEl.value = false;
        isEndScrollEl.value = true;
    }
}

function handleScrollMove() {
    const wrapper = scrollWrapper.value;
    const el = scrollEl.value;
    if (!el || !wrapper || wrapper.offsetWidth === el.offsetWidth) return;
    isStartScrollEl.value = wrapper.scrollLeft < 20 ? true : false;
    isEndScrollEl.value =
        Math.round(wrapper.scrollLeft) > el.offsetWidth - wrapper.offsetWidth - 20 ? true : false;
}

function mousedown(e: MouseEvent) {
    mouseupX.value = e.screenX;
}

function mouseup(device: number, e: MouseEvent) {
    if (mouseupX.value) {
        if (Math.abs(e.screenX - mouseupX.value) < 20) {
            indexStore.toggleDevice(device);
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
    () => chosenDevices.value,
    () => {
        isAllDevicesChosen.value = chosenDevices.value.length === devices.value.length;
    },
);

const { t } = useI18n({
    messages: {
        ru: {
            select: 'Выбрать все',
            allDevices: 'Все устройства',
        },
        en: {
            select: 'Select all',
            allDevices: 'All devices',
        },
    },
});
</script>

<style lang="postcss" scoped>
.device {
    background: #143959;
    &:hover {
        background: #214e76;
    }

    &.active {
        background: #148ef8;
    }
}
</style>
