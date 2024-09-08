<template>
    <div class="relative mt-[1.625rem] mx-10">
        <div class="flex items-center flex-none">
            <div
                v-for="device in [...new Set(devices)] as Device[]"
                :key="device.addr"
                class="device h-6 min-w-[3.25rem] pr-2 flex items-center mr-[6px] rounded text-0.81 font-roboto text-[#ADEBFF] cursor-pointer transition-all duration-300 justify-center select-none"
                :class="[
                    {
                        active: curDev && curDev.addr === device.addr,
                    },
                    ['init', 'no-conn', 'error'].includes(device.state) ? 'pl-[6px]' : 'pl-2',
                ]"
                @click="curDev = device"
                @mouseenter="(e) => handleMouseEnter(device, e as MouseEvent)"
                @mouseleave="handleMouseLeave(device)"
            >
                <div
                    v-if="device.addr !== 0 && device.state !== 'off'"
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
        <div
            v-if="shownStatus && showStatusInfo"
            class="absolute z-[3] top-6 pt-2"
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
        <div class="flex mt-6 gap-3">
            <FunctionsBlock
                :items="algoritms1"
                :selectedAlgoritms="selectedAlgoritmsLeft"
                :isAllChecked="isAllCheckedLeft"
                @deleteAlgoritm="
                    (indexes: number[]) => {
                        setAlgoritmsForDelete(indexes, 1);
                    }
                "
                @selectAlgoritm="
                    (value: boolean, index: number) => {
                        selectAlgoritm(value, index, 'l');
                    }
                "
                @selectAllAlgoritms="
                    (res: boolean) => {
                        selectAllAlgoritms(res, 'l');
                    }
                "
            />
            <FunctionsBlock
                :items="algoritms2"
                :selectedAlgoritms="selectedAlgoritmsRight"
                :isAllChecked="isAllCheckedRight"
                @deleteAlgoritm="
                    (indexes: number[]) => {
                        setAlgoritmsForDelete(indexes, 1);
                    }
                "
                @selectAlgoritm="
                    (value: boolean, index: number) => {
                        selectAlgoritm(value, index, 'r');
                    }
                "
                @selectAllAlgoritms="
                    (res: boolean) => {
                        selectAllAlgoritms(res, 'r');
                    }
                "
            />
        </div>
        <DeleteAlgoritmPopUp
            v-if="algoritmsForDeletion.length"
            :algoritms="algoritmsForDeletion"
            :isLoading="isAlgoritmsDeleting"
            :type="algoritmsForDeletionType"
            @close="algoritmsForDeletion = []"
            @delete="deleteAlgoritms"
        />
        <ControlBlock
            v-if="selectedAlgoritmsLeft.length || selectedAlgoritmsRight.length"
            :countLeft="selectedAlgoritmsLeft.length"
            :countRight="selectedAlgoritmsRight.length"
            @close="setSelectedAlgoritmsCount"
            @deleteAlgoritms="
                () => {
                    setAlgoritmsForDelete([...selectedAlgoritmsLeft, ...selectedAlgoritmsRight], 2);
                }
            "
        />
    </div>
</template>

<script lang="ts" setup>
import type { Device } from '@/stores';
import FunctionsBlock from '@/components/views/customAlgoritms/FunctionsBlock.vue';
import DeleteAlgoritmPopUp from '@/components/views/customAlgoritms/DeleteAlgoritmPopUp.vue';
import ControlBlock from '@/components/views/customAlgoritms/ControlBlock.vue';

const indexStore = useIndexStore();

const { devices } = storeToRefs(indexStore);

const curDev = ref<Device>(devices.value[0]);
let showStatusTimer: ReturnType<typeof setTimeout> | undefined;
const shownStatus = ref<{ serial: string; state: string; addr: number; version: string } | null>(
    null,
);
const statusFormLeft = ref(0);
const isMouseOnStatusForm = ref(false);
const isMouseOnDevice = ref(false);
const showStatusInfo = ref(false);
const algoritms1 = ref<number[]>([
    0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25,
    26, 27, 28, 29, 30, 31,
]);
const algoritms2 = ref<number[]>([
    0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25,
    26, 27, 28, 29, 30, 31,
]);
const algoritmsForDeletion = ref<number[]>([]);
const algoritmsForDeletionType = ref<1 | 2>();
const isAlgoritmsDeleting = ref(false);
const selectedAlgoritmsLeft = ref<number[]>([]);
const selectedAlgoritmsRight = ref<number[]>([]);
const isAllCheckedLeft = ref(false);
const isAllCheckedRight = ref(false);

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
        statusFormLeft.value = target.offsetLeft;
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

function setAlgoritmsForDelete(indexes: number[], type: 1 | 2) {
    let prevArr = [...algoritmsForDeletion.value];
    prevArr.push(...indexes);
    algoritmsForDeletion.value = [...prevArr];
    algoritmsForDeletionType.value = type;
}

function deleteAlgoritms() {
    //TODO
    isAlgoritmsDeleting.value = true;
    setTimeout(() => {
        algoritmsForDeletion.value = [];
        // selectedAlgoritms.value = [];
        isAlgoritmsDeleting.value = false;
    }, 5000);
}

function selectAlgoritm(value: boolean, index: number, direction: 'l' | 'r') {
    let prevArr = direction === 'l' ? selectedAlgoritmsLeft.value : selectedAlgoritmsRight.value;
    if (value) {
        prevArr.push(index);
    } else {
        prevArr = prevArr.filter((el) => el !== index);
    }
    if (direction === 'l') {
        selectedAlgoritmsLeft.value = [...prevArr];
        isAllCheckedLeft.value = selectedAlgoritmsLeft.value.length === algoritms1.value.length;
    } else {
        selectedAlgoritmsRight.value = [...prevArr];
        isAllCheckedRight.value = selectedAlgoritmsRight.value.length === algoritms2.value.length;
    }
}

function selectAllAlgoritms(res: boolean, direction: 'l' | 'r') {
    if (direction === 'l') {
        selectedAlgoritmsLeft.value = res ? [...algoritms1.value] : [];
        isAllCheckedLeft.value = selectedAlgoritmsLeft.value.length === algoritms1.value.length;
    } else {
        selectedAlgoritmsRight.value = res ? [...algoritms2.value] : [];
        isAllCheckedRight.value = selectedAlgoritmsRight.value.length === algoritms2.value.length;
    }
}

function setSelectedAlgoritmsCount() {
    selectedAlgoritmsLeft.value = [];
    selectedAlgoritmsRight.value = [];
}

onBeforeUnmount(() => {
    clearTimeout(showStatusTimer);
    showStatusTimer = undefined;
});

watch(devices, () => {
    if (!curDev.value) curDev.value = devices.value[0];
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
<style lang="postcss" scoped>
.device {
    background: #1b4569;
    &:hover {
        background: #214e76;
    }

    &.active {
        background: #148ef8;
    }
}

.text_wrap {
    text-wrap: wrap;
}
</style>
