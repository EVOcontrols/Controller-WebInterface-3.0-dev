<template>
    <div
        class="fixed top-0 bottom-0 left-0 right-0 z-[1] bg-[#001d34b2] flex items-center justify-center"
    >
        <div
            class="relative p-6 bg-[#0A2A45] min-w-[480px] rounded-[12px] flex flex-col gap-[18px]"
            :class="props.command === 'delete' ? 'w-[480px]' : 'w-[606px]'"
            :style="{ height: 'fit-content' }"
            @click.stop
        >
            <div
                v-if="activeLabel"
                class="absolute w-full h-[68px] bg-[#163E61] pl-4 pr-[18px] flex items-center justify-center rounded-r-[16px]"
                :style="{ top: activeLabelTop + 'px' }"
                @click.stop
            >
                <span
                    class="w-10 flex items-center justify-center rounded-l-[8px] bg-[#1d5377] px-[6px] transition-colors duration-300 h-9 rounded-l-[6px]"
                    >{{ activeLabel.val }}</span
                >
                <input
                    class="w-full h-9 bg-[#1F4669] rounded-r-[6px] px-[14px]"
                    type="text"
                    :value="activeLabelInputVal"
                    :maxlength="32"
                    @input="(e) => handleLabelInput(e as InputEvent)"
                />
            </div>
            <div class="flex items-center gap-[6px]">
                <span
                    v-if="props.command === 'delete'"
                    v-html="approve"
                ></span>
                <UpdateIcon
                    v-else-if="props.command === 'update'"
                    class="w-[21px] h-[21px]"
                />
                <div class="flex-1 text-lg text-[#9ADBF6] font-semibold">
                    {{ t(`${$props.command}.title`) }}
                </div>
                <CloseIcon
                    class="cursor-pointer"
                    @click="$emit('close')"
                />
            </div>
            <div class="w-full h-[1px] bg-[#2C5982]"></div>
            <div
                v-if="props.command === 'delete'"
                class="text-sm text-[#6CB5D3]"
            >
                {{ t(`${$props.command}.text`) }}
            </div>
            <div
                v-if="props.command === 'delete' && props.el"
                class="w-full p-4 rounded-[6px] bg-[#092740] flex flex-col gap-3 jystify-center"
            >
                <div class="flex gap-[10px] items-center jystify-center">
                    <div
                        class="min-w-[50px] h-[25px] px-2 flex items-center justify-center bg-[#1B4569] rounded text-[#8DC5F6]"
                    >
                        {{ props.el.dev_addr }}
                    </div>
                    Название устройства до 32 символов
                </div>
                <div class="flex gap-[10px] items-center jystify-center">
                    <div
                        class="min-w-[50px] h-[25px] px-2 flex items-center justify-center gap-1 rounded"
                        :class="[
                            {
                                ' bg-[#176F6F] text-[#35FED0]':
                                    props.el.type === 'di' || props.el.type === 'coil',
                            },
                            {
                                ' bg-[#006B83] text-[#01F0FF]':
                                    props.el.type === 'hr' || props.el.type === 'ir',
                            },
                        ]"
                    >
                        <div class="uppercase">{{ props.el.type }}</div>
                        <div>{{ props.el.reg_addr }}</div>
                    </div>
                    Польз. название регистра до 32 символов
                </div>
            </div>
            <div
                v-else-if="props.command === 'update'"
                class="flex flex-col gap-3"
            >
                <div
                    class="w-full h-[38px] bg-[#113351] flex gap-[6px] items-center px-3 rounded-[6px]"
                >
                    <span v-html="search"></span>
                    <input
                        class="w-full bg-transparent placeholder:text-[#5183B1] placeholder:select-none"
                        type="text"
                        :placeholder="placeholder"
                        :value="updateFilterText"
                        @input="(e) => handleUpdateInput(e as InputEvent)"
                    />
                </div>
                <div
                    v-if="filteredCurDevices.length"
                    class="overflow-y-hidden rounded-l-lg w-full"
                >
                    <div
                        v-dragscroll.y
                        class="flex overflow-y-auto w-full scrollbar-4 flex-1 flex-col bg-[#113351] rounded-[6px] p-3 pt-[0]"
                        :style="{ 'max-height': '46vh' }"
                        @scroll="handleScroll"
                        ref="scrollWrapper"
                    >
                        <div
                            v-for="(s, index) in filteredCurDevices"
                            :key="index"
                            class="group w-full rounded-[6px] flex gap-3 items-center hover:bg-[#163E61] p-[6px] transition-color duration-300"
                            :class="[
                                activeLabel?.index === index
                                    ? 'min-h-[68px] h-[68px]'
                                    : 'min-h-[37px] h-[37px]',
                                { 'mt-3': !index },
                            ]"
                            ref="scrollEl"
                            @dblclick="handleDblClick(s, index)"
                        >
                            <div
                                class="h-full w-[50px] bg-[#1B4569] flex items-center justify-center group-hover:bg-[#3670A4] text-[#8DC5F6] font-roboto transition-color duration-300 rounded select-none"
                            >
                                {{ s.val }}
                            </div>
                            <div
                                class="text-[#8DC5F6] text-sm flex-1 group-hover:underline transition duration-300 select-none"
                            >
                                {{ s.label || '\u2013' }}
                            </div>
                            <CloseIcon
                                class="cursor-pointer"
                                @click="handleDeviceDelete(s)"
                            />
                        </div>
                    </div>
                </div>
            </div>
            <div class="flex justify-end items-center gap-2">
                <OutlinedButton @click="$emit('close')">{{ t('btnText') }}</OutlinedButton>
                <PrimaryButton
                    v-if="props.command === 'delete'"
                    @click="handleBtnClick"
                    >{{ t(`${$props.command}.btn`) }}</PrimaryButton
                >
            </div>
        </div>
        <div
            v-if="deletedDev !== null"
            class="fixed top-0 bottom-0 left-0 right-0 z-[2] bg-[#001d34b2] flex items-center justify-center"
        >
            <div
                class="relative p-6 bg-[#0A2A45] w-[444px] rounded-[12px] flex flex-col gap-[18px]"
                @click.stop
            >
                <div class="flex items-center gap-[6px]">
                    <span v-html="done"></span>
                    <div class="flex-1 text-lg text-[#9ADBF6] font-semibold">
                        {{ t(`delete.title`) }}
                    </div>
                    <CloseIcon
                        class="cursor-pointer"
                        @click="deletedDev = null"
                    />
                </div>
                <div class="w-full h-[1px] bg-[#2C5982]"></div>
                <div class="text-sm text-[#6CB5D3]">
                    {{ t(`update.popUpText`) }}
                </div>
                <div class="w-full bg-[#092740] p-2 rounded-[6px] flex items-center gap-2">
                    <div
                        class="w-[50px] h-[26px] bg-[#1B4569] flex items-center justify-center text-[#8DC5F6] font-roboto rounded select-none"
                    >
                        {{ deletedDev.val }}
                    </div>
                    <div class="text-[#8DC5F6] text-sm flex-1 select-none">
                        {{ deletedDev.label || '\u2013' }}
                    </div>
                </div>
                <div
                    class="w-full bg-[#7D183C85] rounded-[6px] text-[#F83068] text-sm p-3 pr-10 flex items-center gap-2"
                >
                    <span v-html="warning"></span>
                    {{ t('update.attentionText') }}
                </div>
                <div class="flex justify-end items-center gap-2">
                    <OutlinedButton @click="deletedDev = null">{{ t('btnText') }}</OutlinedButton>
                    <PrimaryButton @click="handleDeleteDevBtnClick">{{
                        t('update.popUpBtn')
                    }}</PrimaryButton>
                </div>
            </div>
        </div>
    </div>
</template>
<script lang="ts" setup>
import approve from '@/assets/img/approve.svg?raw';
import done from '@/assets/img/done.svg?raw';
import warning from '@/assets/img/warning.svg?raw';
import search from '@/assets/img/search.svg?raw';
import PrimaryButton from '@/components/Ui/PrimaryButton.vue';
import OutlinedButton from '@/components/Ui/OutlinedButton.vue';
import UpdateIcon from '@/assets/UpdateIcon.vue';
import CloseIcon from '@/assets/CloseIcon.vue';
import type { Widget } from '@/stores';

const indexStore = useIndexStore();

const { saveToFile } = useReadWriteFiles();

const { devicesState, mbDevsLabels } = storeToRefs(indexStore);

const api = indexStore.getApi().api;

const isAborted = indexStore.getApi().isAborted;

const updateFilterText = ref('');

const deletedDev = ref<{
    val: number;
    label: string;
} | null>(null);

const activeLabel = ref<{ val: number; index: number } | null>(null);

const activeLabelInputVal = ref('');

const activeLabelTop = ref(138);

const scrollEl = ref<HTMLElement | undefined>();

const scrollWrapper = ref<HTMLElement | undefined>();

const scrollTop = ref<number>(0);

const isScrolling = ref(false);

const props = defineProps<{
    w: { w: Widget; state: number[] };
    el: {
        type?: 'hr' | 'ir' | 'coil' | 'di';
        reg_addr: number;
        dev_addr: number;
        val: number;
    } | null;
    command?: 'delete' | 'create' | 'update';
    state: {
        type?: 'hr' | 'ir' | 'coil' | 'di';
        reg_addr: number;
        dev_addr: number;
        val: number;
    }[];
}>();

const curMbDevLabels = computed<string[]>(() => {
    return mbDevsLabels.value[props.w.w.d][props.w.w.bus || 0];
});

const emit = defineEmits<{
    (e: 'close'): void;
}>();

const placeholder = computed<string>(() => {
    if (props.command === 'update') {
        return t('placeholder.update');
    } else {
        return '';
    }
});

const curDevices = computed<{ val: number; label: string }[] | []>(() => {
    const curVals = [...new Set(props.state.map((el) => el.dev_addr))].sort((a, b) => +a - +b);
    const res = [];
    for (let i = 0; i < curVals.length; i += 1) {
        res.push({ val: curVals[i], label: curMbDevLabels.value[curVals[i] - 1] || '' });
    }
    return res;
});

const filteredCurDevices = computed<{ val: number; label: string }[] | []>(() => {
    if (updateFilterText.value.length) {
        return curDevices.value.filter(
            (el) =>
                el.val.toString().includes(updateFilterText.value) ||
                el.label.includes(updateFilterText.value),
        );
    } else return curDevices.value;
});

function handleBtnClick() {
    if (props.command === 'delete') {
        deleteItem();
    }
}

async function deleteItem() {
    try {
        let newIndex;
        for (let i = 0; i < props.state.length; i += 1) {
            if (JSON.stringify(props.state[i]) === JSON.stringify(props.el)) {
                newIndex = i;
            }
        }
        if (newIndex === undefined) return;
        const r = await api.post('set_mb_info', {
            device: 1,
            bus: 0,
            index: newIndex,
            type: ['none'],
            dev_addr: [1],
            reg_addr: [0],
        });
        if (r.data.status === 'ok') {
            const devStates = [...devicesState.value][props.w.w.d];
            const prevStateIndex = devStates.findIndex((el) => el.type === props.w.w.i);
            if (prevStateIndex !== -1 && devStates[prevStateIndex].value[newIndex] !== undefined)
                devStates[prevStateIndex].value[newIndex] = null;
            indexStore.setDevicesState(props.w.w.d, [...devStates]);
            emit('close');
        }
    } catch (error) {
        if (isAborted.value) {
            return;
        }
        setTimeout(() => {
            deleteItem();
        }, 5);
    }
}

function handleUpdateInput(e: InputEvent) {
    const target = e.target as HTMLInputElement;
    if (!target) return;
    updateFilterText.value = target.value;
}

function handleScroll() {
    const el = scrollWrapper.value;
    if (!el) return;
    scrollTop.value = el.scrollTop;
}

function handleDblClick(s: { val: number; label: string }, index: number) {
    activeLabel.value = { val: s.val, index: index };
    activeLabelInputVal.value = s.label;
    setActiveLabelTop();
    window.addEventListener('click', saveData);
    window.addEventListener('keypress', saveData);
}

function setActiveLabelTop() {
    const wrapper = scrollWrapper.value;
    const el = scrollEl.value;
    if (!activeLabel.value || !wrapper || !el) return;
    const top = activeLabel.value.index * 37 - scrollTop.value + 150;
    if (top < 138) {
        activeLabelTop.value = 138;
    } else if (Math.round(top) > wrapper.offsetHeight - 68 + 150) {
        activeLabelTop.value = wrapper.offsetHeight - 68 + 150;
    } else {
        activeLabelTop.value = top;
    }
}

function handleLabelInput(e: InputEvent) {
    const target = e.target as HTMLInputElement;
    if (!target || !activeLabel.value) return;
    activeLabelInputVal.value = target.value;
}

function saveData(e: KeyboardEvent | MouseEvent) {
    if (!activeLabel.value) return;
    if (e.type === 'keypress') {
        const event: KeyboardEvent = e as KeyboardEvent;
        if (event.key === 'Enter') {
            setLabel(activeLabel.value.val, activeLabelInputVal.value);
            activeLabel.value = null;
            activeLabelInputVal.value = '';
        }
    } else if (e.type === 'click') {
        setLabel(activeLabel.value.val, activeLabelInputVal.value);
        activeLabel.value = null;
        activeLabelInputVal.value = '';
    }
}

async function setLabel(index: number, label: string | undefined) {
    if (!label) return;
    const newLabels = [...curMbDevLabels.value];
    newLabels[index - 1] = label;
    for (let i = 0; i < Math.ceil(newLabels.length / labelsFileLength); i += 1) {
        if (
            JSON.stringify(
                curMbDevLabels.value.slice(i * labelsFileLength, (i + 1) * labelsFileLength),
            ) !== JSON.stringify(newLabels.slice(i * labelsFileLength, (i + 1) * labelsFileLength))
        ) {
            saveLabel(
                newLabels.slice(i * labelsFileLength, (i + 1) * labelsFileLength) as string[],
                i,
            );
        }
    }
}

async function saveLabel(labels: string[], part: number) {
    const isSavingError = await saveToFile(
        {
            type: 'labels',
            subType: 'mbDevices',
            device: props.w.w.d,
            bus: props.w.w.bus || 0,
            interf: 'mb-var',
        },
        { labels: labels },
        part,
    );
    if (isSavingError) {
        if (isAborted.value) {
            return;
        }
        setTimeout(() => {
            saveLabel(labels, part);
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
            labels,
            part,
            props.w.w.bus,
        );
    }
}

function handleDeviceDelete(el: { val: number; label: string }) {
    deletedDev.value = el;
}

function handleDeleteDevBtnClick() {
    //TODO after create mb device
}

watch(
    () => scrollTop.value,
    () => {
        if (!isScrolling.value) setActiveLabelTop();
    },
);

const { t } = useI18n({
    messages: {
        ru: {
            delete: {
                title: 'Подтверждение',
                text: 'Вы действительно хотите удалить регистр?',
                btn: 'Удалить',
            },
            update: {
                title: 'Редактирование устройств',
                popUpText: 'Вы действительно хотите удалить устройство?',
                attentionText:
                    'Внимание! Все переменные MODBUS, связанные с этим устройством будут удалены.',
                popUpBtn: 'Удалить',
            },
            btnText: 'Отмена',
            placeholder: {
                update: 'Введите название или адрес устройства',
                create: '',
            },
        },
        en: {
            delete: {
                title: 'Confirmation',
                text: 'Are you sure you want to delete the register?',
                btn: 'Delete',
            },
            update: {
                title: 'Editing devices',
                popUpText: 'Are you sure you want to delete the device?',
                attentionText:
                    'Attention! All MODBUS variables associated with this device will be deleted.',
                popUpBtn: 'Delete',
            },
            btnText: 'Cancel',
            placeholder: {
                update: 'Enter the device name or address',
                create: '',
            },
        },
    },
});
</script>
