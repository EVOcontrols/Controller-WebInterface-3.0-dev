<template>
    <div class="flex flex-col z-[2] relative">
        <WidgetHeader :w="props.w.w" />
        <InitWidget
            v-if="props.isInitialization"
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
            @toggleScan="handleToggle"
        />
        <ModbusPage
            v-else-if="props.isMb"
            :w="props.w"
            @mb="$emit('mb')"
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

const { OWIds, tempUnit, devices } = storeToRefs(indexStore);

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

async function getIndexes() {
    try {
        if (props.w.w.bus !== undefined) {
            const r = await api.post('scan_ow_ids', {
                device: props.w.w.d,
                bus: props.w.w.bus,
            });
            const ids = (await r.data.ids) as string[];
            for (const id of ids) {
                if (!idsArr.value.includes(id)) {
                    idsArr.value = [...idsArr.value, id];
                }
            }
            if (isLoading.value) {
                getEntState(props.w.w.d, [
                    {
                        type: props.w.w.i,
                        device: props.w.w.d,
                        index: 0,
                        bus: props.w.w.bus,
                        quant: OWIds.value[props.w.w.d][props.w.w.bus].length,
                    },
                ]);
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

async function getOWIds() {
    try {
        const r = await api.post('get_ow_ids', {
            device: props.w.w.d,
            bus: props.w.w.bus,
        });
        const ids = await r.data.ids;
        if (props.w.w.bus !== undefined) {
            indexStore.setOWIds(props.w.w.d, props.w.w.bus, ids);
        }
        getIndexes();
    } catch (error) {
        if (isAborted.value) {
            return;
        }
        setTimeout(() => {
            getOWIds();
        }, 20);
    }
}

async function setOW(arr: string[]) {
    try {
        const r = await api.post('set_ow_ids', {
            device: props.w.w.d,
            bus: props.w.w.bus,
            index: 0,
            ids: arr,
        });
        if (r.status === 200) getOWIds();
    } catch (error) {
        if (isAborted.value) {
            return;
        }
        setTimeout(() => {
            setOW(arr);
        }, 20);
    }
}

async function getEntState(
    device: number,
    filteredReqArr: {
        type: string;
        device: number;
        index: number;
        quant: number;
        bus: number;
    }[],
) {
    try {
        const r = await api.post('get_ent_state', {
            list: filteredReqArr,
        });
        const state = await r.data.state;
        const newState = state.filter((el: any) => Array.isArray(el.value));
        indexStore.setDevicesState(device, newState);
    } catch (error) {
        if (isAborted.value) {
            return;
        }
        setTimeout(() => {
            getEntState(device, filteredReqArr);
        }, 20);
    }
}

function handleToggle(arr: string[]) {
    isLoading.value = true;
    setOW(arr);
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
