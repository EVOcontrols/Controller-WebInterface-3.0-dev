<template>
    <div class="flex flex-col z-[2] relative">
        <WidgetHeader :w="props.w.w" />
        <InitWidget
            v-if="props.isInitialization && !props.isMb"
            :w="props.w"
            @init="$emit('init')"
        />
        <CalibrWidget
            v-else-if="props.isCalibration"
            :w="props.w"
        />
        <ScanWidget
            v-else-if="props.isPriorWOpen"
            :idsArr="idsArr"
            :vals="props.w.state"
            :OWIds="OWIds"
            :w="props.w"
            :tempUnit="tempUnit"
            :isLoading="isLoading"
            :labels="curLabels"
            @toggleScan="handleToggle"
            @saveLabel="saveLabel"
        />
        <ModbusPage
            v-else-if="props.isMb"
            :w="props.w"
            :isInit="props.isInitialization"
            @mb="$emit('mb')"
            @init="$emit('init')"
        />
        <div
            v-else
            class="flex flex-1"
        >
            <transition name="appear">
                <component
                    :is="widget.component"
                    :w="{ w: widget, state: props.w.state }"
                    :isBig="true"
                    :isCalibration="props.isCalibration"
                />
            </transition>
            <BigWLabels
                :w="props.w"
                :isCalibration="props.isCalibration"
            />
        </div>
        <WidgetFooter
            v-if="!$props.isInitialization"
            :isInfoVisible="['bin-in'].includes(props.w.w.i)"
            :isBig="true"
            :w="props.w.w"
            :isCalibration="props.isCalibration"
            :isPriorWOpen="props.isPriorWOpen"
            :isMb="props.isMb"
            @enter="$emit('enter')"
            @init="$emit('init', props.w.w)"
            @mb="$emit('mb', props.w.w)"
            @calibr="$emit('calibr')"
            @scan="$emit('scan')"
            @back="$emit('back')"
        />
        <div
            v-if="devStatus === 'init'"
            class="absolute w-full h-full"
            :style="{ background: 'rgba(9, 39, 64, 0.85)' }"
        ></div>
    </div>
</template>

<script lang="ts" setup>
import WidgetHeader from '@/components/views/widgets/WidgetHeader.vue';
import WidgetFooter from '@/components/views/widgets/WidgetFooter.vue';
import ShimStates from '@/components/views/widgets/states/ShimStates.vue';
import DiscreteStates from '@/components/views/widgets/states/DiscreteStates.vue';
import DiscreteOutStates from '@/components/views/widgets/states/DiscreteOutStates.vue';
import VarBigStates from '@/components/views/widgets/states/VarBigStates.vue';
import InitWidget from '@/components/views/widgets/bigWidgets/InitWidget.vue';
import ScanWidget from '@/components/views/widgets/bigWidgets/ScanWidget.vue';
import TempStates from '@/components/views/widgets/states/TempStates.vue';
import OwStates from '@/components/views/widgets/states/OwStates.vue';
import BigWLabels from '@/components/views/widgets/bigWidgets/BigWLabels.vue';
import CalibrWidget from '@/components/views/widgets/bigWidgets/CalibrWidget.vue';
import ModbusPage from '@/components/views/widgets/bigWidgets/ModbusPage.vue';
import type { Widget } from '@/stores';
import axios from 'axios';

const indexStore = useIndexStore();

const { OWIds, tempUnit, devices, labels } = storeToRefs(indexStore);

const { saveToFile } = useReadWriteFiles();

const api = indexStore.getApi().api as axios.AxiosInstance;

const isAborted = indexStore.getApi().isAborted;

const idsArr = ref<string[]>([]);

const isLoading = ref(false);

const props = defineProps<{
    w: { w: Widget; state: number[] };
    isInitialization: boolean;
    isCalibration: boolean;
    isPriorWOpen: boolean;
    isMb: boolean;
}>();

const curLabels = computed<[string | undefined]>(() => {
    if (labels.value[props.w.w.d]) {
        const val = labels.value[props.w.w.d]?.find(
            (el: { interf: string; val: [string[] | []] }) => el.interf === props.w.w.i,
        );
        if (val) {
            const bus = props.w.w.bus || 0;
            return val.val[bus] as [string | undefined];
        }
    }
    const arr: [string | undefined] = [''];
    return arr;
});

const devStatus = computed<'on' | 'off' | 'no-conn' | 'init' | 'error' | undefined>(() => {
    return devices.value.find((el) => el.addr === props.w.w.d)?.state;
});

let scanTimer: ReturnType<typeof setTimeout> | undefined;

const widget = computed<Widget>(() => {
    const widget: Widget = {
        d: props.w.w.d,
        i: props.w.w.i,
        deviceName: props.w.w.deviceName,
        component: '',
    };
    if (['pwm-out', 'adc-in'].includes(props.w.w.i)) {
        widget.component = ShimStates;
    } else if (['bin-in'].includes(props.w.w.i)) {
        widget.component = DiscreteStates;
    } else if (props.w.w.i === 'bin-out') {
        widget.component = DiscreteOutStates;
    } else if (['int-var', 'bin-var', 'tim-var'].includes(props.w.w.i)) {
        widget.component = VarBigStates;
    } else if (props.w.w.i === '1w-sens') {
        widget.component = TempStates;
    } else if (props.w.w.i === '1w-rom') {
        widget.component = OwStates;
    }
    return widget;
});

async function getIndexes(labelsArr?: string[]) {
    try {
        if (props.w.w.bus !== undefined) {
            const r = await api.post('scan_ow_ids', {
                device: props.w.w.d,
                bus: props.w.w.bus,
                type: props.w.w.i,
            });
            const curIds = OWIds.value[props.w.w.d][props.w.w.bus || 0];
            const ids = (await r.data.ids) as string[];
            const newIds: string[] = [];
            for (const id of ids) {
                if (!newIds.includes(id) && !curIds.includes(id)) {
                    newIds.push(id);
                }
            }
            if (JSON.stringify(idsArr.value.sort()) !== JSON.stringify(newIds.sort())) {
                idsArr.value = [...newIds];
            }
            if (isLoading.value) {
                await getEntState(props.w.w.d, [
                    {
                        type: props.w.w.i,
                        device: props.w.w.d,
                        index: 0,
                        bus: props.w.w.bus,
                        quantity: OWIds.value[props.w.w.d][props.w.w.bus].length,
                    },
                ]);
                if (labelsArr) saveLabel(labelsArr);
            }
            isLoading.value = false;
        }
    } catch (error) {
        if (isAborted.value) {
            return;
        }
    }
    scanTimer = setTimeout(getIndexes, 500);
}

async function getOWIds(labelsArr: string[]) {
    try {
        const r = await api.post('get_ow_ids', {
            device: props.w.w.d,
            bus: props.w.w.bus,
            type: props.w.w.i,
        });
        const ids = await r.data.ids;
        if (props.w.w.bus !== undefined) {
            indexStore.setOWIds(props.w.w.d, props.w.w.bus, ids);
        }
        getIndexes(labelsArr);
    } catch (error) {
        if (isAborted.value) {
            return;
        }
        setTimeout(() => {
            getOWIds(labelsArr);
        }, 20);
    }
}

async function setOW(arr: string[], labelsArr: string[]) {
    const newArr: string[] = [];
    for (const id of arr) {
        newArr.push(id || '0000000000000000');
    }
    try {
        const r = await api.post('set_ow_ids', {
            device: props.w.w.d,
            bus: props.w.w.bus,
            index: 0,
            ids: newArr,
            type: props.w.w.i,
        });
        if (r.status === 200) getOWIds(labelsArr);
    } catch (error) {
        if (isAborted.value) {
            return;
        }
        setTimeout(() => {
            setOW(arr, labelsArr);
        }, 20);
    }
}

async function getEntState(
    device: number,
    filteredReqArr: {
        type: string;
        device: number;
        index: number;
        quantity: number;
        bus: number;
    }[],
) {
    try {
        const r = await api.post('get_ent_state', {
            entities: filteredReqArr,
        });
        const state = await r.data.entities;
        const newState = state.filter((el: any) => Array.isArray(el.state));
        indexStore.setDevicesState(device, newState);
        return;
    } catch (error) {
        if (isAborted.value) {
            return;
        }
        setTimeout(() => {
            getEntState(device, filteredReqArr);
        }, 20);
    }
}

async function saveLabel(labels: (string | undefined)[]) {
    const newLabels = [...labels];
    for (let i = newLabels.length; i < labelsFileLength; i++) {
        newLabels.push('');
    }
    const isSavingError = await saveToFile(
        {
            type: 'labels',
            device: props.w.w.d,
            bus: props.w.w.bus,
            interf: props.w.w.i as
                | '1w-rom'
                | '1w-sens'
                | 'adc-in'
                | 'bin-in'
                | 'bin-out'
                | 'bin-var'
                | 'int-var'
                | 'mb-var'
                | 'pwm-out'
                | 'tim-var',
        },
        { labels: newLabels as string[] },
    );
    if (isSavingError) {
        if (isAborted.value) {
            return;
        }
        setTimeout(() => {
            saveLabel(labels);
        }, 5);
    } else {
        indexStore.changeLabel(
            props.w.w.d,
            props.w.w.i as
                | '1w-rom'
                | '1w-sens'
                | 'adc-in'
                | 'bin-in'
                | 'bin-out'
                | 'bin-var'
                | 'int-var'
                | 'mb-var'
                | 'pwm-out'
                | 'tim-var',
            newLabels as string[],
            props.w.w.bus,
        );
    }
}

function handleToggle(arr: string[], labelsArr: string[]) {
    isLoading.value = true;
    setOW(arr, labelsArr);
    clearTimeout(scanTimer);
    scanTimer = undefined;
}

watch(
    () => props.isPriorWOpen,
    () => {
        if (props.isPriorWOpen) {
            getIndexes();
        } else {
            clearTimeout(scanTimer);
            scanTimer = undefined;
        }
    },
);

watch(
    () => props.w.w.d,
    () => {
        idsArr.value = [];
    },
);

onMounted(() => {
    if (props.isPriorWOpen) {
        getIndexes();
    }
});

onBeforeUnmount(() => {
    clearTimeout(scanTimer);
    scanTimer = undefined;
});
</script>
<style lang="postcss" scoped>
.widgets::-webkit-scrollbar {
    width: 6px;
    background: transparent;
    grid-auto-rows: minmax(min-content, max-content);
}
</style>
