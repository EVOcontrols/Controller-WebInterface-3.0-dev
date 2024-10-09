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
                :items="algoritms1"
                :selectedAlgoritms="selectedAlgoritmsLeft"
                :isAllChecked="isAllCheckedLeft"
                :curAction="curActionLeft"
                :device="curDev"
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
            />
            <FunctionsBlock
                :items="algoritms2"
                :selectedAlgoritms="selectedAlgoritmsRight"
                :isAllChecked="isAllCheckedRight"
                :curAction="curActionRight"
                :device="curDev"
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
            />
        </div>
        <DeleteAlgoritmPopUp
            v-if="algoritmsForDeletion.length"
            :algoritms="algoritmsForDeletion.map((el) => el.algoritm)"
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

const { readFile } = useReadWriteFiles();

const indexStore = useIndexStore();
const funcStore = useFuncsStore();

const api = indexStore.getApi().api as axios.AxiosInstance;
const isAborted = indexStore.getApi().isAborted;

const { devices } = storeToRefs(indexStore);
const { funcLabels } = storeToRefs(funcStore);

type Action =
    | { label: 'triggers'; val: 'udf-trig' }
    | { label: 'conditions'; val: 'udf-cond' }
    | { label: 'actions'; val: 'udf-act' }
    | { label: 'transformations'; val: 'udf-trans' };

type Algoritm = { val: 0 | 1 | null; label: string };

const curDev = ref<Device>(devices.value[0]);
let showStatusTimer: ReturnType<typeof setTimeout> | undefined;
const shownStatus = ref<{ serial: string; state: string; addr: number; version: string } | null>(
    null,
);
const statusFormLeft = ref(0);
const isMouseOnStatusForm = ref(false);
const isMouseOnDevice = ref(false);
const showStatusInfo = ref(false);
const algoritms1 = ref<Algoritm[]>([]);
const algoritms2 = ref<Algoritm[]>([]);
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
const curActionRight = ref<Action>({ label: 'triggers', val: 'udf-trig' });
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
    let body = {};
    if (algoritmsForDeletion.value[0].type === 'udf-act') {
        body = {
            type: 'udf-act',
            device: curDev.value.addr,
            index: algoritmsForDeletion.value[0].index,
            action: {
                type: 'none',
            },
        };
    } else if (algoritmsForDeletion.value[0].type === 'udf-cond') {
        body = {
            type: 'udf-cond',
            device: curDev.value.addr,
            index: algoritmsForDeletion.value[0].index,
            condition: {
                type: 'none',
            },
        };
    } else if (algoritmsForDeletion.value[0].type === 'udf-trig') {
        body = {
            type: 'udf-trig',
            device: curDev.value.addr,
            index: algoritmsForDeletion.value[0].index,
            trigger: {
                type: 'none',
            },
        };
    } else if (algoritmsForDeletion.value[0].type === 'udf-trans') {
        body = {
            type: 'udf-trans',
            device: curDev.value.addr,
            index: algoritmsForDeletion.value[0].index,
            transform: {
                type: 'none',
            },
        };
    }
    try {
        const r = await api.post('set_udf_cfg', body);
        if (algoritmsForDeletion.value[0].type == curActionLeft.value.val) {
            const prev = [...algoritms1.value];
            prev[algoritmsForDeletion.value[0].index] = { val: null, label: '' };
            algoritms1.value = [...prev];
        } else {
            const prev = [...algoritms2.value];
            prev[algoritmsForDeletion.value[0].index] = { val: null, label: '' };
            algoritms2.value = [...prev];
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
        getData([], dir);
    } else {
        const { labels } = reqLabels as LabelsType;
        funcStore.setLabels(addr, type, labels);
        getData(labels, dir);
    }
}

async function getData(labels: string[], dir: 'l' | 'r') {
    const curAct = dir === 'l' ? curActionLeft.value.val : curActionRight.value.val;
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
            const r = await api.post('get_ent_state', {
                entities: [
                    {
                        type: curAct,
                        device: curDev.value ? curDev.value.addr : 0,
                        index: 0,
                        quantity: quant,
                    },
                ],
            });
            const state = r.data.entities[0].state;
            const res: Algoritm[] = [];
            for (let i = 0; i < state.length; i++) {
                res.push({ val: state[i], label: labels[i] || '' });
            }
            if (dir === 'l') {
                algoritms1.value = [...res];
            } else {
                algoritms2.value = [...res];
            }
            setTimeout(() => {
                getData(labels, dir);
            }, 5000);
        } catch (error) {
            if (isAborted.value) {
                return;
            }
            setTimeout(() => {
                getData(labels, dir);
            }, 20);
        }
    } else {
        setTimeout(() => {
            getData(labels, dir);
        }, 20);
    }
}

async function getMaxs() {
    try {
        const r = await api.post<{
            'udf-act': number;
            'udf-cond': number;
            'udf-trans': number;
            'udf-trig': number;
        }>('get_dev_capab', {
            device: curDev.value ? curDev.value.addr : 0,
        });
        const res = r.data;
        maxAct.value = res['udf-act'];
        maxCond.value = res['udf-cond'];
        maxTrans.value = res['udf-trans'];
        maxTrig.value = res['udf-trig'];
    } catch (error) {
        if (isAborted.value) {
            return [0, 0, 0, 0];
        }
        setTimeout(() => {
            getMaxs();
        }, 5);
    }
}

onBeforeMount(async () => {
    await getMaxs();
    const addr = curDev.value || devices.value[0] ? (curDev.value || devices.value[0]).addr : 0;
    let curLabelsLeft = funcLabels.value[addr]?.find((el) => el.name === curActionLeft.value.val);
    let curLabelsRight = funcLabels.value[addr]?.find((el) => el.name === curActionRight.value.val);
    if (!curLabelsLeft) {
        getLabels(curActionLeft.value.val, 'l');
    } else {
        getData(curLabelsLeft.val, 'l');
    }
    if (!curLabelsRight) {
        getLabels(curActionRight.value.val, 'r');
    } else {
        getData(curLabelsRight.val, 'r');
    }
});

onBeforeUnmount(() => {
    clearTimeout(showStatusTimer);
    showStatusTimer = undefined;
});

watch(devices, () => {
    if (!curDev.value) curDev.value = devices.value[0];
});

watch(curDev, async () => {
    maxAct.value = 0;
    maxCond.value = 0;
    maxTrans.value = 0;
    maxTrig.value = 0;
    algoritms1.value = [];
    algoritms2.value = [];
    await getMaxs();
    const addr = curDev.value || devices.value[0] ? (curDev.value || devices.value[0]).addr : 0;
    let curLabelsLeft = funcLabels.value[addr]?.find((el) => el.name === curActionLeft.value.val);
    let curLabelsRight = funcLabels.value[addr]?.find((el) => el.name === curActionRight.value.val);
    if (!curLabelsLeft) {
        getLabels(curActionLeft.value.val, 'l');
    } else {
        getData(curLabelsLeft.val, 'l');
    }
    if (!curLabelsRight) {
        getLabels(curActionRight.value.val, 'r');
    } else {
        getData(curLabelsRight.val, 'r');
    }
});

watch(curActionLeft, () => {
    algoritms1.value = [];
    const addr = curDev.value || devices.value[0] ? (curDev.value || devices.value[0]).addr : 0;
    let curLabelsLeft = funcLabels.value[addr]?.find((el) => el.name === curActionLeft.value.val);
    if (!curLabelsLeft) {
        getLabels(curActionLeft.value.val, 'l');
    } else {
        getData(curLabelsLeft.val, 'l');
    }
});

watch(curActionRight, () => {
    algoritms2.value = [];
    const addr = curDev.value || devices.value[0] ? (curDev.value || devices.value[0]).addr : 0;
    let curLabelsRight = funcLabels.value[addr]?.find((el) => el.name === curActionRight.value.val);
    if (!curLabelsRight) {
        getLabels(curActionRight.value.val, 'r');
    } else {
        getData(curLabelsRight.val, 'r');
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
