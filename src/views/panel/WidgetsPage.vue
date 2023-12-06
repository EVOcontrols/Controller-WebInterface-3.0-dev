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
                class="ml-10 w-full h-full rounded-xl bg-[#092740]"
                :class="gridClasses.big"
            ></BigWidget>
            <div
                class="gap-4 relative max-h-full widgets overflow-y-scroll scrollbar-4 px-10"
                :class="gridClasses.small"
                :style="{ 'padding-right': 'calc(2.5rem - 6px)' }"
                @scroll="handleScroll"
                ref="scrollEl"
            >
                <transition-group name="appear">
                    <component
                        :is="w.component"
                        v-for="w in widgets.small"
                        :key="`${w.d}.${w.i}`"
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
// import BooleanWidget from './smallWidgets/BooleanWidget.vue';
// import TempWidget from './smallWidgets/TempWidget.vue';
// import VarWidget from './smallWidgets/VarWidget.vue';
// import NgdWidget from './smallWidgets/NgdWidget.vue';
// import BigWidget from './bigWidget/BigWidget.vue';
// import ModbusWidget from './smallWidgets/ModbusWidget.vue';

const indexStore = useIndexStore();

const { devices, interfaces, chosenInterfaces } = storeToRefs(indexStore);

const bigWidget = ref<{ d: number; i: string } | null>(null);

const scrollEl = ref<HTMLElement | undefined>();

const widgets = computed<{ big: Widget | null; small: Widget[] }>(() => {
    const small: Widget[] = [];
    let big: Widget | null = null;
    const sortedChosenDevices = indexStore.getSortedChosenDevices();
    const sortedChosenInterfaces = [...chosenInterfaces.value].sort((i1, i2) => {
        const index1 = interfaces.value.findIndex((i) => i.value === i1);
        const index2 = interfaces.value.findIndex((i) => i.value === i2);
        return index1 - index2;
    });
    sortedChosenDevices.forEach((d) => {
        sortedChosenInterfaces.forEach((i) => {
            //without 1-wire & modbus
            const widget: Widget = {
                d: d,
                i: i,
                deviceName: devices.value[d]?.type,
                component: '',
            };
            if (i === 'pwm-out') {
                widget.component = ShimWidget;
            } else if (['adc-in', 'bin-out', 'pwm-out'].includes(i)) {
                widget.component = ShimWidget;
            } else if (i === 'bin-var') {
                widget.component = ShimWidget;
            } else if (i === 'int-var') {
                widget.component = ShimWidget;
            } else {
                widget.component = ShimWidget;
            }
            if (bigWidget.value && bigWidget.value.d === d && bigWidget.value.i === i) {
                big = widget;
            } else {
                small.push(widget);
            }
        });
    });
    return { big, small };
});

const gridClasses = computed<{ all: string; big: string; small: string }>(() => {
    if (window.innerWidth > 1680) {
        return {
            all: bigWidget.value ? 'grid grid-cols-2' : '',
            small: bigWidget.value ? 'grid grid-cols-2 pr-10' : 'grid grid-cols-4 px-10',
            big: '',
        };
    }
    return {
        all: bigWidget.value ? 'grid grid-cols-3' : '',
        small: bigWidget.value ? 'grid grid-cols-1 pr-10' : 'grid grid-cols-3 px-10',
        big: bigWidget.value ? 'col-span-2' : '',
    };
});

const visibleWidgets = ref<Widget[]>([]);

function setBigWidget(d: number, i: string) {
    bigWidget.value = { d: d, i: i };
}

function handleScroll() {
    const el = scrollEl.value;
    if (!el || !el.parentElement || (el.scrollTop <= 202 && visibleWidgets.value.length)) return;
    const horQuant = bigWidget.value ? 1 : 3;
    const vertQuant = Math.ceil(el.parentElement?.clientHeight / 218) + 1;
    const maxVisibleWidgets = horQuant * vertQuant;
    const startIndex = el.scrollTop === 0 ? 0 : Math.ceil(el.scrollTop / 218) - 1;
    widgets.value.small.length - startIndex * horQuant >= maxVisibleWidgets
        ? indexStore.setVisibleWidgets(
              widgets.value.small.slice(startIndex * horQuant, maxVisibleWidgets),
          )
        : indexStore.setVisibleWidgets(widgets.value.small.slice(startIndex * horQuant));
}

onMounted(() => {
    handleScroll();
});

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
