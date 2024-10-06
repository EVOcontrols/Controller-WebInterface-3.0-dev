<template>
    <div class="flex-1 flex relative">
        <transition name="label">
            <div
                v-if="activeLabel"
                class="absolute -right-[7.6%] bg-[#092E4B] z-[2] h-[68px] w-[57.5%] rounded-r-[16px] p-4 pr-6 flex items-center select-none origin-top-left flex flex-col gap-[6px]"
                :style="{ top: activeLabelTop + 'px' }"
                @click.stop
            >
                <div class="flex w-full h-9 items-center">
                    <span
                        class="w-10 h-full flex items-center justify-center rounded-l-[8px] bg-[#194265] px-[6px] transition-colors duration-300"
                        >{{ activeLabel.i + 1 }}</span
                    >
                    <input
                        type="text"
                        :placeholder="placeholder"
                        :value="activeLabel.label"
                        :maxlength="32"
                        ref="labelInput"
                        class="flex-1 bg-[#123553] h-full text-[#8DC5F6] px-3 placeholder:text-[#8DC5F6]"
                        @input="(e) => handleLabelInput(e as InputEvent)"
                    />
                </div>
            </div>
        </transition>
        <div
            class="w-[50%] flex overflow-y-auto scrollbar-4 flex-1"
            :style="{ height: 'calc(100vh - 410px)' }"
        >
            <draggable
                class="list-group py-[18px] w-full"
                data-list="idsList"
                :list="idsList"
                group="bionicles"
                itemKey="element.id+'-'+index"
                :move="handleMoveItem"
                @end="handleDragEndItem"
                :options="{ animation: 500 }"
            >
                <template #item="{ element, index }">
                    <div
                        v-if="element.id !== '0000000000000000'"
                        class="list-group-item label group w-full flex text-[#6CB5D3] items-center transition-colors duration-500 rounded select-none hover:bg-[#0C2F4D] gap-2 min-h-[30px] px-[18px]"
                    >
                        <span>{{ index + 1 }}</span>
                        <span class="flex-1">{{ element.id }}</span>
                        <CloseIcon
                            class="label-close cursor-pointer rotate-45"
                            @click="addId(element.id, index)"
                        />
                    </div>
                </template>
            </draggable>
        </div>
        <div
            class="w-[50%] border-l border-[#1D4162] flex overflow-y-auto scrollbar-4 flex-1"
            :style="{ height: 'calc(100vh - 410px)' }"
            ref="scrollWrapper"
            @scroll="handleScroll"
        >
            <draggable
                class="list-group py-[18px] w-full"
                data-list="valsList"
                :list="valsList"
                group="bionicles"
                itemKey="element.id+'-'+index"
                :move="handleMoveItem"
                @end="handleDragEndItem"
                :options="{ animation: 500 }"
                ref="scrollEl"
            >
                <template #item="{ element, index }">
                    <div
                        v-if="props.w.w.i === '1w-sens'"
                        class="list-group-item group w-full flex items-center transition-colors duration-500 rounded select-none gap-2 min-h-[30px] px-[18px]"
                        :class="[
                            { label: element.val[0] !== null },
                            {
                                'hover:bg-[#0C2F4D]': element.val[0] !== null,
                            },
                        ]"
                        @dblclick="handleDblClick(element.val[0], index)"
                    >
                        <span
                            :class="element.val[0] === null ? 'text-[#194F76]' : 'text-[#6CB5D3]'"
                            >{{ index + 1 }}</span
                        >
                        <span class="flex-1 text-[#6CB5D3]">{{
                            element.val[0] !== null ? element.label : ''
                        }}</span>
                        <span
                            v-if="element.val[0] !== null"
                            :class="element.val[0] > 0 ? 'text-[#EB8246]' : 'text-[#35A1FF]'"
                            >{{
                                props.tempUnit === '°C'
                                    ? `${Math.round(element.val[0] / 10) / 10}°C`
                                    : `${(Math.round(element.val[0] / 10) / 10) * 1.8 + 32}°F`
                            }}</span
                        >
                        <CloseIcon
                            v-if="element.val[0] !== null"
                            class="label-close cursor-pointer"
                            @click="removeId(index)"
                        />
                    </div>
                    <div
                        v-else
                        class="list-group-item group w-full flex items-center transition-colors duration-500 rounded select-none gap-2 min-h-[30px] px-[18px]"
                        :class="[
                            { label: element.val !== null },
                            {
                                'hover:bg-[#0C2F4D]': element.val !== null,
                            },
                        ]"
                        @dblclick="handleDblClick(element.val, index)"
                    >
                        <span :class="element.val === null ? 'text-[#194F76]' : 'text-[#6CB5D3]'">{{
                            index + 1
                        }}</span>
                        <span class="flex-1 text-[#6CB5D3]">{{
                            element.val !== null ? element.label : ''
                        }}</span>
                        <CloseIcon
                            v-if="element.val !== null"
                            class="label-close cursor-pointer"
                            @click="removeId(index)"
                        />
                    </div>
                </template>
            </draggable>
        </div>
        <div
            class="absolute w-full h-full flex items-center justify-center transition-all duration-500"
            :class="props.isLoading ? 'opacity-100' : 'opacity-0'"
            :style="[
                { background: 'rgba(9, 39, 64, 0.75)' },
                { 'z-index': props.isLoading ? '2' : -1 },
            ]"
        >
            <span class="loader"></span>
        </div>
    </div>
</template>
<script setup lang="ts">
import draggable from 'vuedraggable';
import CloseIcon from '@/components/toast/CloseIcon.vue';
import { useI18n } from 'vue-i18n';
import type { Widget } from '@/stores';
import type { TempUnit } from '@/typings/common';

interface DraggedContext {
    index: number;
    futIndex: number;
}

interface DragEvent {
    draggedContext: DraggedContext;
    from: Element;
    to: Element;
    relatedContext: { index: number };
}

const props = defineProps<{
    idsArr: string[];
    vals: number[];
    OWIds: string[][][];
    w: { w: Widget; state: number[] };
    tempUnit: TempUnit;
    isLoading: boolean;
    labels: [string | undefined];
}>();

const emit = defineEmits<{
    (e: 'saveLabel', labels: (string | undefined)[]): void;
    (e: 'toggleScan', arr: string[], labelsArr: string[]): void;
}>();

const idsList = ref<
    { id: string; val: number | null | (number | null)[]; label: string | undefined }[]
>([]);
const valsList = ref<
    { id: string; val: number | null | (number | null)[]; label: string | undefined }[]
>([]);
let idsTimer: ReturnType<typeof setTimeout> | undefined;
let valsTimer: ReturnType<typeof setTimeout> | undefined;
const activeLabel = ref<{ i: number; state: number; label: string | undefined } | null>(null);
const activeLabelTop = ref(10);
const scrollTop = ref(0);
const isScrolling = ref(false);
const labelInput = ref<HTMLElement | null>(null);
const originalList = ref('');
const futureList = ref('');
const originalIndex = ref(0);
const futureIndex = ref(0);
const movingItem = ref<{
    id: string;
    val: number | null | (number | null)[];
    label: string | undefined;
} | null>(null);
const futureItem = ref<{
    id: string;
    val: number | null | (number | null)[];
    label: string | undefined;
} | null>(null);

const scrollEl = ref<HTMLElement | undefined>();

const scrollWrapper = ref<HTMLElement | undefined>();

const isNotMainScrolling = ref(false);

const placeholder = computed(() => t('placecholder'));

function handleDragEndItem() {
    if (originalList.value === futureList.value) {
        movingItem.value = valsList.value[originalIndex.value];
        futureItem.value = valsList.value[futureIndex.value];

        if (movingItem.value && futureItem.value) {
            let _list = [...valsList.value];
            _list[futureIndex.value] = movingItem.value;
            _list[originalIndex.value] = futureItem.value;
            valsList.value = _list;
        }
    } else {
        movingItem.value = idsList.value[originalIndex.value];
        futureItem.value = valsList.value[futureIndex.value];

        if (movingItem.value && futureItem.value) {
            let _listFrom = [...idsList.value];
            let _listTo = [...valsList.value];
            _listTo[futureIndex.value] = movingItem.value;
            _listFrom[originalIndex.value] = futureItem.value;
            idsList.value = _listFrom;
            valsList.value = _listTo;
        }
    }
    document
        .querySelectorAll('.list-group-item')
        .forEach((el) => el.classList.remove('bg-[#0C2F4D]'));
    if (!(originalList.value === futureList.value && originalList.value === 'idsList')) {
        clearTimeout(idsTimer);
        clearTimeout(valsTimer);
        idsTimer = undefined;
        valsTimer = undefined;
        emit(
            'toggleScan',
            valsList.value.map((el) => el.id),
            valsList.value.map((el) => el.label) as string[],
        );
    }
}
function handleMoveItem(event: DragEvent) {
    document
        .querySelectorAll('.list-group-item')
        .forEach((el) => el.classList.remove('bg-[#0C2F4D]'));
    const { index } = event.draggedContext;
    const futIndex = event.relatedContext.index;
    originalIndex.value = index;
    futureIndex.value = futIndex;
    originalList.value = event.from.getAttribute('data-list') || '';
    futureList.value = event.to.getAttribute('data-list') || '';
    if (valsList.value[futureIndex.value]) {
        event.to.children[futureIndex.value].classList.add('bg-[#0C2F4D]');
    }
    return false;
}
function setIds() {
    const curIds = props.OWIds[props.w.w.d][props.w.w.bus || 0] || [];
    const arr: string[] = [];
    props.idsArr.forEach((id) => {
        if (!curIds.includes(id)) {
            arr.push(id);
        }
    });
    const newArr = arr.map((el: string) => Object.assign({ id: el, val: [null, null], label: '' }));
    idsList.value = [...newArr];
    idsTimer = setTimeout(setIds, 1000);
}
function setVals() {
    const curIds = props.OWIds[props.w.w.d][props.w.w.bus || 0] || [];
    const newArr = [];
    for (let i = 0; i < props.vals.length; i += 1) {
        newArr.push({ id: curIds[i], val: props.vals[i], label: props.labels[i] });
    }
    valsList.value = [...newArr];
    valsTimer = setTimeout(setVals, 1000);
}
function addId(id: string, index: number) {
    const place =
        props.w.w.i === '1w-sens'
            ? valsList.value.findIndex(
                  (el) =>
                      el.val &&
                      typeof el.val !== 'number' &&
                      el.val[0] === null &&
                      el.id === '0000000000000000',
              )
            : valsList.value.findIndex((el) => el.val === null);
    const values = [...valsList.value];
    values[place].id = id;
    valsList.value = [...values];
    let ids = [...idsList.value];
    ids.splice(index, 1);
    idsList.value = [...ids];
    clearTimeout(idsTimer);
    clearTimeout(valsTimer);
    idsTimer = undefined;
    valsTimer = undefined;
    emit(
        'toggleScan',
        valsList.value.map((el) => el.id),
        valsList.value.map((el) => el.label) as string[],
    );
}
function removeId(index: number) {
    const values = [...valsList.value];
    values[index].id = '0000000000000000';
    values[index].val = props.w.w.i === '1w-sens' ? [null, null] : null;
    valsList.value = [...values];
    clearTimeout(idsTimer);
    clearTimeout(valsTimer);
    idsTimer = undefined;
    valsTimer = undefined;
    emit(
        'toggleScan',
        valsList.value.map((el) => el.id),
        valsList.value.map((el) => el.label) as string[],
    );
}
function handleScroll() {
    const el = scrollWrapper.value;
    if (!el) return;
    isNotMainScrolling.value = false;
    scrollTop.value = el.scrollTop;
}
function handleDblClick(s: number | null, index: number) {
    if (s === null) return;
    isNotMainScrolling.value = true;
    activeLabel.value = { i: index, state: s, label: props.labels[index] };
    setActiveLabelTop();
    window.addEventListener('click', saveData);
    window.addEventListener('keypress', saveData);
}
function setActiveLabelTop() {
    const wrapper = scrollWrapper.value;
    const el = scrollEl.value;
    if (!activeLabel.value || !wrapper || !el) return;
    const top = activeLabel.value.i * 30 - scrollTop.value + 10;
    if (top < 0) {
        activeLabelTop.value = 0;
    } else if (Math.round(top) > wrapper.offsetHeight - 68) {
        if (isNotMainScrolling.value) {
            setTimeout(() => {
                if (!activeLabel.value) return;
                isScrolling.value = true;
                wrapper.scrollTo({
                    top: activeLabel.value.i * 30 + 78 - wrapper.offsetHeight,
                    behavior: 'smooth',
                });
            }, 0);
            setTimeout(() => {
                isScrolling.value = false;
                isNotMainScrolling.value = false;
            }, 300);
        }
        activeLabelTop.value = wrapper.offsetHeight - 68;
    } else {
        activeLabelTop.value = top;
    }
}
function saveData(e: KeyboardEvent | MouseEvent) {
    if (!activeLabel.value) return;
    if (e.type === 'keypress') {
        const event: KeyboardEvent = e as KeyboardEvent;
        if (event.key === 'Enter') {
            const newLabels = [...props.labels];
            newLabels[activeLabel.value.i] = activeLabel.value.label;
            emit('saveLabel', newLabels);
            activeLabel.value = null;
        }
    } else if (e.type === 'click') {
        const newLabels = [...props.labels];
        newLabels[activeLabel.value.i] = activeLabel.value.label;
        emit('saveLabel', newLabels);
        activeLabel.value = null;
    }
}
function handleLabelInput(e: InputEvent) {
    const target = e.target as HTMLInputElement;
    if (!target || !activeLabel.value) return;
    activeLabel.value.label = target.value;
}

watch(scrollTop, () => {
    if (!isScrolling.value) setActiveLabelTop();
});

onMounted(() => {
    setIds();
    setVals();
});

onBeforeUnmount(() => {
    clearTimeout(idsTimer);
    clearTimeout(valsTimer);
    idsTimer = undefined;
    valsTimer = undefined;
    window.removeEventListener('click', saveData);
    window.removeEventListener('keypress', saveData);
});

watch(props.OWIds, () => {
    setIds();
    setVals();
});

const { t } = useI18n({
    messages: {
        ru: {
            placeholder: 'Ввод названия',
        },
        en: {
            placeholder: 'Entering a title',
        },
    },
});
</script>

<style scoped>
.label {
    cursor: move;
}
.loader {
    width: 48px;
    height: 48px;
    border: 5px solid #148ef8;
    border-bottom-color: transparent;
    border-radius: 50%;
    display: inline-block;
    box-sizing: border-box;
    animation: rotation 1s linear infinite;
}

@keyframes rotation {
    0% {
        transform: rotate(0deg);
    }
    100% {
        transform: rotate(360deg);
    }
}
</style>
