<template>
    <transition
        name="fade-300"
        mode="out-in"
    >
        <div
            class="gap-4 mt-4"
            :class="gridClasses.all"
            :style="{ height: 'calc(100vh - 310px)' }"
            v-if="widgets.small.length || widgets.big"
        >
            <BigWidget
                v-if="widgets.big"
                class="w-full h-full rounded-xl bg-[#092740]"
                :class="gridClasses.big"
                :w="widgets.big"
                :isInitialization="isInitialization"
                :isCalibration="isCalibration"
                @enter="setBigWidget"
                @init="setInitStatus"
                @calibr="handleCalibrClick(true)"
                @back="handleCalibrClick(false)"
            ></BigWidget>
            <div
                v-if="!isInitialization"
                class="gap-4 relative max-h-full widgets overflow-y-scroll scrollbar-4 px-10 grid-rows-[min-content]"
                :class="gridClasses.small"
                :style="{ 'padding-right': 'calc(2.5rem - 6px)' }"
                @scroll="handleScroll"
                ref="scrollEl"
            >
                <transition-group name="appear">
                    <component
                        :is="w.w.component"
                        v-for="w in widgets.small"
                        :key="`${w.w.d}.${w.w.i}`"
                        :w="w"
                        class="rounded-xl bg-[#092740] w-full flex overflow-hidden flex-col h-[12.625rem]"
                        @enter="setBigWidget"
                    />
                </transition-group>
            </div>
        </div>
        <div
            class="text-[#4A779E] text-base flex flex-1 items-center justify-center font-medium mt-32"
            v-else
        >
            {{ t('nowidgets') }}
        </div>
    </transition>
</template>

<script lang="ts" setup>
import { useI18n } from 'vue-i18n';
import type { Widget } from '@/stores';
import BigWidget from '@/components/views/widgets/bigWidgets/BigWidget.vue';
import ShimWidget from '@/components/views/widgets/ShimWidget.vue';
import DiscreteWidget from '@/components/views/widgets/DiscreteWidget.vue';
import VarWidget from '@/components/views/widgets/VarWidget.vue';
import TempWidget from '@/components/views/widgets/TempWidget.vue';
import MbWidget from '@/components/views/widgets/MbWidget.vue';

const indexStore = useIndexStore();

const {
    devices,
    chosenInterfaces,
    chosenDevices,
    devicesState,
    sortedChosenDevices,
    sortedChosenInterfaces,
} = storeToRefs(indexStore);

const bigWidget = ref<{ d: number; i: string } | null>(null);

const scrollEl = ref<HTMLElement | undefined>();

const visibleWidgets = ref<Widget[]>([]);

const prevChosenInterfaces = [...chosenInterfaces.value];

const isInitialization = ref(false);

const isCalibration = ref(false);

const widgets = computed<{
    big: { w: Widget; state: number[] } | null;
    small: { w: Widget; state: number[] }[];
}>(() => {
    const small: { w: Widget; state: number[] }[] = [];
    let big: { w: Widget; state: number[] } | null = null;
    sortedChosenDevices.value.forEach((d) => {
        sortedChosenInterfaces.value.forEach((i) => {
            const index = devicesState.value[d]?.interfVal.findIndex((interf) => interf.type === i);
            if (index !== -1) {
                const obj = devicesState.value[d]?.interfVal[index];
                const state: number[] = (obj?.value as number[]) || [];
                //without 1-wire & modbus
                const widget: Widget = {
                    d: d,
                    i: i,
                    deviceName: devices.value[d]?.type,
                    component: '',
                };
                if (['pwm-out', 'adc-in'].includes(i)) {
                    widget.component = ShimWidget;
                } else if (['bin-in', 'bin-out'].includes(i)) {
                    widget.component = DiscreteWidget;
                    // } else if (['int-var'].includes(i)) {
                    //     widget.component = TempWidget;
                    // }
                    // } else if (['int-var'].includes(i)) {
                    //     widget.component = MbWidget;
                    // }
                } else if (['int-var', 'bin-var', 'tim-var'].includes(i)) {
                    widget.component = VarWidget;
                }
                if (bigWidget.value && bigWidget.value.d === d && bigWidget.value.i === i) {
                    big = { w: widget, state: state };
                } else {
                    small.push({ w: widget, state: state });
                }
            }
        });
    });
    return { big, small };
});

const gridClasses = computed<{ all: string; big: string; small: string }>(() => {
    if (window.innerWidth > 1680) {
        return {
            all: bigWidget.value ? (isInitialization.value ? 'mx-[40px]' : 'grid grid-cols-2') : '',
            small: bigWidget.value ? 'grid grid-cols-2 pr-10' : 'grid grid-cols-4 px-10',
            big: isInitialization.value ? '' : 'ml-10',
        };
    }
    return {
        all: bigWidget.value ? (isInitialization.value ? 'mx-[40px]' : 'grid grid-cols-3') : '',
        small: bigWidget.value ? 'grid grid-cols-1 pr-10' : 'grid grid-cols-3 px-10',
        big: bigWidget.value ? (isInitialization.value ? '' : 'col-span-2 ml-10') : '',
    };
});

function setBigWidget(d: number, i: string) {
    if (!d && !i) {
        bigWidget.value = null;
    } else {
        if (d === undefined || i === undefined) return;
        bigWidget.value = { d: d, i: i };
        isCalibration.value = false;
    }
}

function setInitStatus(w?: Widget) {
    if (!w) {
        isInitialization.value = false;
    } else {
        bigWidget.value = { d: w.d, i: w.i };
        isInitialization.value = true;
    }
}

function handleScroll() {
    const visibleWidgets = changeVisibleWidgets() || [];
    indexStore.setVisibleWidgets(
        widgets.value.big ? [...visibleWidgets, widgets.value.big] : visibleWidgets,
    );
}

function changeVisibleWidgets() {
    const el = scrollEl.value;
    if (!el || !el.parentElement || (el.scrollTop <= 202 && visibleWidgets.value.length)) return;
    const horQuant = bigWidget.value ? 1 : 3;
    const vertQuant = Math.ceil(el.parentElement?.clientHeight / 218) + 1;
    const maxVisibleWidgets = horQuant * vertQuant;
    const startIndex = el.scrollTop === 0 ? 0 : Math.ceil(el.scrollTop / 218) - 1;
    return widgets.value.small.length - startIndex * horQuant >= maxVisibleWidgets
        ? widgets.value.small.slice(startIndex * horQuant, maxVisibleWidgets)
        : widgets.value.small.slice(startIndex * horQuant);
}

function handleCalibrClick(res: boolean) {
    isCalibration.value = res;
}

onMounted(() => {
    handleScroll();
});

watch(
    () => [widgets.value.small, widgets.value.big],
    () => {
        const visibleWidgets = changeVisibleWidgets() || [];
        indexStore.setVisibleWidgets(
            widgets.value.big ? [...visibleWidgets, widgets.value.big] : visibleWidgets,
        );
    },
);

watch(
    () => chosenDevices.value,
    () => {
        const visibleWidgets = changeVisibleWidgets() || [];
        const newItems: any[] = [];
        newItems.push(
            ...visibleWidgets.filter((widget) => {
                return chosenDevices.value.includes(widget.w.d);
            }),
        );
        if (newItems.length === visibleWidgets.length) {
            let prevDevise: number | undefined;
            chosenDevices.value.forEach((d) => {
                const index = newItems.findIndex((widget) => {
                    return widget.w.d === d;
                });
                if (index === -1) prevDevise = d;
            });
            if (prevDevise !== undefined) {
                chosenInterfaces.value.forEach((i) => {
                    newItems.push({
                        w: { d: prevDevise, i: i },
                    });
                });
            }
        }
        indexStore.setVisibleWidgets(
            widgets.value.big ? [...newItems, widgets.value.big] : newItems,
        );
    },
);

watch(
    () => chosenInterfaces.value,
    () => {
        const visibleWidgets = changeVisibleWidgets() || [];
        const newItems: any[] = [];
        newItems.push(
            ...visibleWidgets.filter((widget) => {
                return chosenInterfaces.value.includes(widget.w.i);
            }),
        );
        if (chosenInterfaces.value.length > prevChosenInterfaces.length) {
            let prevInterf = chosenInterfaces.value.filter(
                (x) => !prevChosenInterfaces.includes(x),
            )[0];
            chosenDevices.value.forEach((d) => {
                const index = newItems.findIndex(
                    (item) => item.w.d === d && item.w.i === prevInterf,
                );
                if (index === -1) {
                    newItems.push({
                        w: { d: d, i: prevInterf },
                    });
                }
            });
        }
        indexStore.setVisibleWidgets(
            widgets.value.big ? [...newItems, widgets.value.big] : newItems,
        );
    },
);

const { t } = useI18n({
    messages: {
        ru: {
            nowidgets: 'Устройства и интерфейсы не выбраны',
        },
        en: {
            nowidgets: 'There are no selected devices and interfaces',
        },
    },
});
</script>

<style lang="postcss" scoped>
.widgets::-webkit-scrollbar {
    width: 6px;
    background: transparent;
    grid-auto-rows: minmax(min-content, max-content);
}
</style>
