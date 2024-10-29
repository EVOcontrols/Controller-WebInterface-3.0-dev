<template>
    <div class="relative mt-[1.625rem] mx-10 flex flex-col">
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
        <div class="flex mt-6 gap-3 flex-1">
            <FunctionsBlock
                :items="createAlgoritm1 ? algoritms1Copy : algoritms1"
                :selectedAlgoritms="selectedAlgoritmsLeft"
                :isAllChecked="isAllCheckedLeft"
                :curAction="curActionLeft"
                :device="curDev"
                :need-to-add-algoritm="createAlgoritm1"
                @deleteAlgoritm="
                    (indexes: Algoritm[], index: number) => {
                        setAlgoritmsForDelete(indexes, 1, curActionLeft.val, index);
                    }
                "
                @selectAlgoritm="
                    (value: boolean, index: Algoritm) => {
                        selectAlgoritm(value, index, 'l');
                    }
                "
                @selectAllAlgoritms="
                    (res: boolean) => {
                        selectAllAlgoritms(res, 'l');
                    }
                "
                @setCurAction="
                    (res: Action) => {
                        setCurAction(res, 'l');
                    }
                "
                @addAlgoritm="
                    (index: number, label: string | undefined) => {
                        algoritms1[index] = { val: 0, label: label ?? '', isCreating: true };
                        algoritms1Copy = algoritms1;
                        createAlgoritm1 = true;
                    }
                "
                @creatingFinish="
                    (index: number) => {
                        algoritms1[index].isCreating = undefined;
                        algoritms1Copy = [];
                        createAlgoritm1 = false;
                    }
                "
            />
            <FunctionsBlock
                :items="createAlgoritm2 ? algoritms2Copy : algoritms2"
                :selectedAlgoritms="selectedAlgoritmsRight"
                :isAllChecked="isAllCheckedRight"
                :curAction="curActionRight"
                :device="curDev"
                :need-to-add-algoritm="createAlgoritm2"
                @deleteAlgoritm="
                    (indexes: Algoritm[], index: number) => {
                        setAlgoritmsForDelete(indexes, 1, curActionRight.val, index);
                    }
                "
                @selectAlgoritm="
                    (value: boolean, index: Algoritm) => {
                        selectAlgoritm(value, index, 'r');
                    }
                "
                @selectAllAlgoritms="
                    (res: boolean) => {
                        selectAllAlgoritms(res, 'r');
                    }
                "
                @setCurAction="
                    (res: Action) => {
                        setCurAction(res, 'r');
                    }
                "
                @addAlgoritm="
                    (index: number, label: string | undefined) => {
                        algoritms2[index] = { val: 0, label: label ?? '', isCreating: true };
                        algoritms2Copy = algoritms2;
                        createAlgoritm2 = true;
                    }
                "
                @creatingFinish="
                    (index: number) => {
                        algoritms2[index].isCreating = undefined;
                        algoritms2Copy = [];
                        createAlgoritm2 = false;
                    }
                "
            />
        </div>
        <DeleteAlgoritmPopUp
            v-if="algoritmsForDeletion.length"
            :algoritms="algoritmsForDeletion.map((el) => el.algoritm)"
            :isLoading="isAlgoritmsDeleting"
            :type="algoritmsForDeletionType"
            @close="algoritmsForDeletion = []"
            @delete="
                () => {
                    deleteAlgoritms();
                    saveLabels();
                }
            "
        />
        <ControlBlock
            v-if="selectedAlgoritmsLeft.length || selectedAlgoritmsRight.length"
            :countLeft="selectedAlgoritmsLeft.length"
            :countRight="selectedAlgoritmsRight.length"
            @close="setSelectedAlgoritmsCount"
            @deleteAlgoritms="
                () => {
                    // setAlgoritmsForDelete(
                    //     [...selectedAlgoritmsLeft, ...selectedAlgoritmsRight],
                    //     2,
                    //     'udf-act',
                    // );
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
import type { LabelsType } from '@/typings/files';
import axios from 'axios';
import { UDF } from '@/components/views/customAlgoritms/PresetAlgoritmBlocksWrapper/types';

const { readFile, saveToFile } = useReadWriteFiles();

const indexStore = useIndexStore();
const funcStore = useFuncsStore();

const { api } = useApiStore();
const isAborted = indexStore.getApi().isAborted;

const { devices, devCapabs } = storeToRefs(indexStore);
const { funcLabels } = storeToRefs(funcStore);

type Action =
    | { label: 'triggers'; val: 'udf-trig' }
    | { label: 'conditions'; val: 'udf-cond' }
    | { label: 'actions'; val: 'udf-act' }
    | { label: 'transformations'; val: 'udf-trans' };

type Val = 0 | 1 | null;
type Algoritm = { val: Val; label: string; isCreating?: boolean };

const isDev = import.meta.env.DEV;
const timeoutDev = 10000;

const curDev = ref<Device>(devices.value[0]);
let showStatusTimer: ReturnType<typeof setTimeout> | undefined;
let getDataTimer: ReturnType<typeof setTimeout> | undefined;
const shownStatus = ref<{ serial: string; state: string; addr: number; version: string } | null>(null);
const statusFormLeft = ref(0);
const isMouseOnStatusForm = ref(false);
const isMouseOnDevice = ref(false);
const showStatusInfo = ref(false);
const algoritms1 = ref<Algoritm[]>([]);
const algoritms2 = ref<Algoritm[]>([]);
const algoritms1Copy = ref<Algoritm[]>([]);
const algoritms2Copy = ref<Algoritm[]>([]);
const createAlgoritm1 = ref(false);
const createAlgoritm2 = ref(false);
const algoritmsForDeletion = ref<
    { algoritm: Algoritm; type: 'udf-act' | 'udf-cond' | 'udf-trig' | 'udf-trans'; index: number }[]
>([]);
const algoritmsForDeletionType = ref<1 | 2>();
const isAlgoritmsDeleting = ref(false);
const selectedAlgoritmsLeft = ref<Algoritm[]>([]);
const selectedAlgoritmsRight = ref<Algoritm[]>([]);
const isAllCheckedLeft = ref(false);
const isAllCheckedRight = ref(false);
const curActionLeft = ref<Action>({ label: 'triggers', val: 'udf-trig' });
const curActionRight = ref<Action>({ label: 'actions', val: 'udf-act' });
const maxAct = ref(0);
const maxCond = ref(0);
const maxTrans = ref(0);
const maxTrig = ref(0);

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

function setAlgoritmsForDelete(
    indexes: Algoritm[],
    type: 1 | 2,
    act: 'udf-act' | 'udf-cond' | 'udf-trig' | 'udf-trans',
    index: number,
) {
    let prevArr = [...algoritmsForDeletion.value];
    prevArr.push(
        ...indexes.map((el) => {
            return { algoritm: el, type: act, index: index };
        }),
    );
    algoritmsForDeletion.value = [...prevArr];
    algoritmsForDeletionType.value = type;
}

async function deleteAlgoritms() {
    isAlgoritmsDeleting.value = true;
    const index = algoritmsForDeletion.value[0]?.index;
    if (!index) return;

    const body = {
        type: algoritmsForDeletion.value[0].type,
        device: curDev.value.addr,
        index,
        ...(algoritmsForDeletion.value[0].type === 'udf-act' && { action: { type: 'none' } }),
        ...(algoritmsForDeletion.value[0].type === 'udf-cond' && { condition: { type: 'none' } }),
        ...(algoritmsForDeletion.value[0].type === 'udf-trig' && { trigger: { type: 'none' } }),
        ...(algoritmsForDeletion.value[0].type === 'udf-trans' && { transform: { type: 'none' } }),
    };

    try {
        await api.post('set_udf_cfg', body);
        if (algoritmsForDeletion.value[0].type == curActionLeft.value.val) {
            const prev = [...algoritms1.value];
            prev[algoritmsForDeletion.value[0].index] = { val: null, label: '' };
            algoritms1.value = [...prev];
            if (algoritms1Copy.value[index]?.isCreating === true) {
                algoritms1.value[index].isCreating = undefined;
                algoritms1Copy.value = [];
                createAlgoritm1.value = false;
            }
        } else {
            const prev = [...algoritms2.value];
            prev[algoritmsForDeletion.value[0].index] = { val: null, label: '' };
            algoritms2.value = [...prev];
            if (algoritms2Copy.value[index]?.isCreating === true) {
                algoritms2.value[index].isCreating = undefined;
                algoritms2Copy.value = [];
                createAlgoritm2.value = false;
            }
        }
        algoritmsForDeletion.value = [];
        isAlgoritmsDeleting.value = false;
    } catch (error) {
        if (isAborted.value) {
            return;
        }
        setTimeout(() => {
            deleteAlgoritms();
        }, 5);
    }
}

function selectAlgoritm(value: boolean, index: Algoritm, direction: 'l' | 'r') {
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
    isAllCheckedLeft.value = false;
    isAllCheckedRight.value = false;
}

function setCurAction(res: Action, direction: 'l' | 'r') {
    if (direction === 'l') {
        curActionLeft.value = res;
    } else {
        curActionRight.value = res;
    }
}

async function getLabels(type: 'udf-act' | 'udf-cond' | 'udf-trans' | 'udf-trig', dir: 'l' | 'r') {
    const addr = curDev.value ? curDev.value.addr : 0;
    const reqLabels = await readFile({
        type: 'labels',
        interf: type,
        device: addr,
    });
    if (reqLabels === 'error') {
        return new Promise((resolve) =>
            setTimeout(() => {
                getLabels(type, dir);
            }, 5),
        );
    } else if (reqLabels === 'notFound') {
        funcStore.setLabels(addr, type, []);
        clearTimeout(getDataTimer);
        getDataTimer = undefined;
        await getData(dir);
    } else {
        const { labels } = reqLabels as LabelsType;
        funcStore.setLabels(addr, type, labels);
        clearTimeout(getDataTimer);
        getDataTimer = undefined;
        await getData(dir);
    }
}

async function saveLabels() {
    const addr = curDev.value || devices.value[0] ? (curDev.value || devices.value[0]).addr : 0;
    let curLabelsLeft = funcLabels.value[addr].find((el) => el.name === curActionLeft.value.val)?.val as string[];
    let curLabelsRight = funcLabels.value[addr].find((el) => el.name === curActionRight.value.val)?.val as string[];

    const index = algoritmsForDeletion.value[0]?.index;
    if (!index) return;

    if (algoritmsForDeletion.value[0].type === curActionLeft.value.val) {
        const cleanedLabelsLeft = [...curLabelsLeft];
        cleanedLabelsLeft[index] = '';
        await saveLabel(curActionLeft.value.val, addr, cleanedLabelsLeft);
    } else {
        const cleanedLabelsRight = [...curLabelsRight];
        cleanedLabelsRight[index] = '';
        await saveLabel(curActionRight.value.val, addr, cleanedLabelsRight);
    }
}

async function saveLabel(interf: UDF, addr: number, labels: string[]) {
    const isSavingError = await saveToFile(
        {
            type: 'labels',
            interf,
            device: addr,
        },
        { labels },
    );

    if (isSavingError) {
        if (isAborted.value) {
            return;
        }
        setTimeout(() => {
            saveLabel(interf, addr, labels);
        }, 5);
    } else {
        funcStore.setLabels(addr, interf, labels);
    }
}

async function getData(dir: 'l' | 'r') {
    const addr = curDev.value || devices.value[0] ? (curDev.value || devices.value[0]).addr : 0;
    const curAct = dir === 'l' ? curActionLeft.value.val : curActionRight.value.val;
    let curLabelsLeft = funcLabels.value[addr]?.find((el) => el.name === curAct)?.val as string[];
    let curLabelsRight = funcLabels.value[addr]?.find((el) => el.name === curAct)?.val as string[];

    const quant =
        curAct === 'udf-act'
            ? maxAct.value
            : curAct === 'udf-cond'
            ? maxCond.value
            : curAct === 'udf-trans'
            ? maxTrans.value
            : maxTrig.value;
    if (quant) {
        try {
            const { data } = await api.post('get_ent_state', {
                entities: [
                    {
                        type: curAct,
                        device: curDev.value ? curDev.value.addr : 0,
                        index: 0,
                        quantity: quant,
                    },
                ],
            });
            const { state } = data.entities[0];
            const resultAlgoritms: Algoritm[] = state.map((val: Val, idx: number) => {
                const label = dir === 'l' ? curLabelsLeft[idx] || '' : curLabelsRight[idx] || '';
                return { val, label };
            });
            if (dir === 'l') {
                algoritms1.value = [...resultAlgoritms];
            } else {
                algoritms2.value = [...resultAlgoritms];
            }
            const timeout = isDev ? timeoutDev : 5000;
            getDataTimer = setTimeout(() => {
                getData(dir);
            }, timeout);
        } catch (error) {
            if (isAborted.value) {
                return;
            }
            const timeout = isDev ? timeoutDev / 2 : 20;
            getDataTimer = setTimeout(() => {
                getData(dir);
            }, timeout);
        }
    } else {
        getDataTimer = setTimeout(() => {
            getData(dir);
        }, 20);
    }
}

async function getMaxs() {
    const capabs = devCapabs.value[curDev.value ? curDev.value.addr : 0];
    if (capabs) {
        maxAct.value = capabs['udf-act'];
        maxCond.value = capabs['udf-cond'];
        maxTrans.value = capabs['udf-trans'];
        maxTrig.value = capabs['udf-trig'];
    } else {
        setTimeout(getMaxs, isDev ? timeoutDev / 100 : 5);
    }
}

onBeforeMount(async () => {
    await getMaxs();
    const addr = curDev.value || devices.value[0] ? (curDev.value || devices.value[0]).addr : 0;
    let curLabelsLeft = funcLabels.value[addr]?.find((el) => el.name === curActionLeft.value.val);
    let curLabelsRight = funcLabels.value[addr]?.find((el) => el.name === curActionRight.value.val);
    if (!curLabelsLeft) {
        await getLabels(curActionLeft.value.val, 'l');
    } else {
        await getData('l');
    }
    if (!curLabelsRight) {
        await getLabels(curActionRight.value.val, 'r');
    } else {
        await getData('r');
    }
});

onBeforeUnmount(() => {
    clearTimeout(showStatusTimer);
    showStatusTimer = undefined;
    clearTimeout(getDataTimer);
    getDataTimer = undefined;
});

watch(devices, () => {
    if (!curDev.value) curDev.value = devices.value[0];
});

watch(funcLabels, () => {
    clearTimeout(getDataTimer);
    getDataTimer = undefined;
    getData('l');
    getData('r');
});

watch(curDev, async () => {
    maxAct.value = 0;
    maxCond.value = 0;
    maxTrans.value = 0;
    maxTrig.value = 0;
    algoritms1.value = [];
    algoritms2.value = [];
    algoritms1Copy.value = [];
    algoritms2Copy.value = [];
    createAlgoritm1.value = false;
    createAlgoritm2.value = false;
    await getMaxs();
    const addr = curDev.value || devices.value[0] ? (curDev.value || devices.value[0]).addr : 0;
    let curLabelsLeft = funcLabels.value[addr]?.find((el) => el.name === curActionLeft.value.val);
    let curLabelsRight = funcLabels.value[addr]?.find((el) => el.name === curActionRight.value.val);
    if (!curLabelsLeft) {
        await getLabels(curActionLeft.value.val, 'l');
    } else {
        await getData('l');
    }
    if (!curLabelsRight) {
        await getLabels(curActionRight.value.val, 'r');
    } else {
        await getData('r');
    }
});

watch(curActionLeft, () => {
    algoritms1.value = [];
    algoritms1Copy.value = [];
    createAlgoritm1.value = false;
    const addr = curDev.value || devices.value[0] ? (curDev.value || devices.value[0]).addr : 0;
    let curLabelsLeft = funcLabels.value[addr]?.find((el) => el.name === curActionLeft.value.val);
    if (!curLabelsLeft) {
        getLabels(curActionLeft.value.val, 'l');
    } else {
        getData('l');
    }
});

watch(curActionRight, () => {
    algoritms2.value = [];
    algoritms2Copy.value = [];
    createAlgoritm2.value = false;
    const addr = curDev.value || devices.value[0] ? (curDev.value || devices.value[0]).addr : 0;
    let curLabelsRight = funcLabels.value[addr]?.find((el) => el.name === curActionRight.value.val);
    if (!curLabelsRight) {
        getLabels(curActionRight.value.val, 'r');
    } else {
        getData('r');
    }
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
