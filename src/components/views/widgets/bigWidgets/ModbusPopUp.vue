<template>
    <div
        class="fixed top-0 bottom-0 left-0 right-0 z-[4] bg-[#001d34b2] flex items-center justify-center"
    >
        <div
            class="relative p-6 bg-[#0A2A45] min-w-[480px] rounded-[12px] flex flex-col gap-[18px]"
            :class="
                props.command === 'delete'
                    ? 'w-[480px]'
                    : props.command === 'createReg'
                    ? 'w-[516px]'
                    : 'w-[606px]'
            "
            :style="{ height: 'fit-content' }"
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
            <div class="flex items-center gap-2">
                <span
                    v-if="props.command === 'delete'"
                    v-html="approve"
                ></span>
                <span
                    v-else-if="props.command === 'create' || props.command === 'createReg'"
                    v-html="create"
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
                                    props.el.type === 'di' ||
                                    props.el.type === 'coil' ||
                                    props.el.type === 'wm-coil' ||
                                    props.el.type === 'w-coil' ||
                                    props.el.type === 'm-coil',
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
            <div
                v-if="props.command === 'create'"
                class="flex flex-col gap-5 text-[#8DC5F6] text-sm font-normal"
            >
                <div class="flex flex-col">
                    {{ t('create.devName') }}
                    <input
                        class="mt-[14px] w-[356px] h-10 rounded-[6px] px-4 placeholder:text-[#5183B1] placeholder:text-sm text-sm"
                        :class="
                            invalidDevName && activeLabelInputVal
                                ? 'bg-[#4F2046] text-[#F83068]'
                                : 'bg-[#123A5B] text-[#5183B1]'
                        "
                        type="text"
                        :placeholder="placeholder"
                        :value="activeLabelInputVal"
                        :maxlength="32"
                        @input="(e) => handleLabelInput(e as InputEvent)"
                    />
                    <div
                        v-if="invalidDevName && activeLabelInputVal"
                        class="text-[#F83068] mt-3"
                    >
                        {{ t('create.error.deviceNameExists') }}
                    </div>
                </div>
                <div class="flex flex-col">
                    {{ t('create.devAddr') }}
                    <input
                        class="mt-[14px] w-[60px] h-10 rounded-[6px] px-4 placeholder:text-[#5183B1] placeholder:text-sm text-sm"
                        :class="
                            invalidDevAddr
                                ? 'bg-[#4F2046] text-[#F83068]'
                                : 'bg-[#123A5B] text-[#5183B1]'
                        "
                        type="text"
                        :placeholder="'000'"
                        :value="devAddrInputVal"
                        :maxlength="3"
                        @input="(e) => handleDevAddrInput(e as InputEvent)"
                    />
                    <div
                        v-if="invalidDevAddr"
                        class="text-[#F83068] mt-3"
                    >
                        {{ t(`create.error.${invalidDevAddrType}`) }}
                    </div>
                </div>
            </div>
            <div
                v-if="props.command === 'createReg'"
                class="flex flex-col gap-5 text-[#8DC5F6] text-sm font-normal"
            >
                <div class="flex flex-col gap-[14px]">
                    {{ t('createReg.fields.type') }}
                    <div class="flex h-8 font-medium select-none">
                        <div
                            class="w-[68px] flex items-center justify-center rounded-l-[6px] transition-all duration-300"
                            :class="
                                choosenType === 'di'
                                    ? 'bg-[#004C8C] text-[#2B9BFF]'
                                    : ' bg-[#123A5B] text-[#5F93C2] hover:bg-[#0C2F4D] cursor-pointer'
                            "
                            @click="choosenType = 'di'"
                        >
                            DI
                        </div>
                        <div
                            class="w-[68px] flex items-center justify-center transition-all duration-300"
                            :class="
                                choosenType === 'coil'
                                    ? 'bg-[#004C8C] text-[#2B9BFF]'
                                    : ' bg-[#123A5B] text-[#5F93C2] hover:bg-[#0C2F4D] cursor-pointer'
                            "
                            @click="choosenType = 'coil'"
                        >
                            COIL
                        </div>
                        <div
                            class="w-[68px] flex items-center justify-center transition-all duration-300"
                            :class="
                                choosenType === 'ir'
                                    ? 'bg-[#004C8C] text-[#2B9BFF]'
                                    : ' bg-[#123A5B] text-[#5F93C2] hover:bg-[#0C2F4D] cursor-pointer'
                            "
                            @click="choosenType = 'ir'"
                        >
                            IR
                        </div>
                        <div
                            class="w-[68px] flex items-center justify-center rounded-r-[6px] transition-all duration-300"
                            :class="
                                choosenType === 'hr'
                                    ? 'bg-[#004C8C] text-[#2B9BFF]'
                                    : 'bg-[#123A5B] text-[#5F93C2] hover:bg-[#0C2F4D] cursor-pointer'
                            "
                            @click="choosenType = 'hr'"
                        >
                            HR
                        </div>
                    </div>
                </div>
                <div class="flex flex-col gap-[14px]">
                    {{ t('createReg.fields.device') }}
                    <DropDown class="table-cell text-[0.813rem]">
                        <template #trigger-element="{ onClick }">
                            <button
                                class="rounded-lg h-10 w-[326px] bg-[#0f304b] flex flex-row items-center gap-2 p-2"
                                @click="onClick"
                            >
                                <div
                                    class="font-roboto text-[#8dc5f6] w-[50px] h-full rounded bg-[#1B4569] flex items-center justify-center"
                                >
                                    {{ curDevices.find((el) => el.val === choosenDevice)?.val }}
                                </div>
                                <div class="font-roboto text-[#8dc5f6] text-sm">
                                    {{ curDevices.find((el) => el.val === choosenDevice)?.label }}
                                </div>
                            </button>
                        </template>
                        <template #body="{ isOpen, onSelect }">
                            <div
                                class="w-full rounded-lg bg-[#0f304b] flex flex-col py-[0.31rem]"
                                v-if="isOpen"
                            >
                                <div class="max-h-[11.563rem] overflow-auto scrollbar-3 px-1.5">
                                    <div
                                        v-for="d in curDevices"
                                        :key="d.val"
                                        class="flex flex-row h-[2.188rem] hover:bg-[#134d7d] shrink-0 items-center pl-2 pr-3 rounded hover:pl-3 transition-[background-color,padding] select-none cursor-pointer on:bg-[#134d7d] items-center gap-2"
                                        :class="{ on: d.val === choosenDevice }"
                                        @click="
                                            () => {
                                                choosenDevice = d.val;
                                                onSelect();
                                            }
                                        "
                                    >
                                        <div
                                            class="font-roboto text-[#8dc5f6] w-[50px] h-6 rounded bg-[#1B4569] flex items-center justify-center"
                                        >
                                            {{ d.val }}
                                        </div>
                                        <div class="font-roboto text-[#8dc5f6] text-sm">
                                            {{ d.label }}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </template>
                    </DropDown>
                </div>
                <div class="flex flex-col gap-[14px]">
                    {{ t('createReg.fields.regName') }}
                    <input
                        class="w-[356px] h-10 rounded-[6px] px-4 placeholder:text-[#5183B1] placeholder:text-sm text-sm bg-[#123A5B] text-[#5183B1]"
                        type="text"
                        :placeholder="placeholder"
                        :value="activeLabelInputVal"
                        :maxlength="32"
                        @input="(e) => handleLabelInput(e as InputEvent)"
                    />
                </div>
                <div class="flex flex-col">
                    {{ t('createReg.fields.regAddr') }}
                    <div class="flex gap-3 items-center mt-[14px]">
                        <div class="flex">
                            <span
                                class="select-none h-8 w-16 text-sm font-Roboto flex items-center rounded-l-[8px] flex items-center justify-center"
                                :class="
                                    currentNumberingSystem === 'dec'
                                        ? 'bg-[#023E71] text-[#2B9BFF] select-none'
                                        : 'bg-[#0F304B] text-[#5F93C2] cursor-pointer'
                                "
                                @click="currentNumberingSystem = 'dec'"
                                >DEC</span
                            >
                            <span
                                class="select-none h-8 w-16 text-sm font-Roboto flex items-center rounded-r-[8px] flex items-center justify-center"
                                :class="
                                    currentNumberingSystem === 'hex'
                                        ? 'bg-[#023E71] text-[#2B9BFF] select-none'
                                        : 'bg-[#0F304B] text-[#5F93C2] cursor-pointer'
                                "
                                @click="currentNumberingSystem = 'hex'"
                                >HEX</span
                            >
                        </div>
                        <input
                            class="w-[78px] h-10 rounded-[6px] px-4 placeholder:text-[#5183B1] placeholder:text-sm text-sm bg-[#123A5B] text-[#5183B1] uppercase"
                            type="text"
                            :placeholder="'00000'"
                            :value="newRegInputVal"
                            :maxlength="5"
                            @input="(e) => handlenewRegInput(e as InputEvent)"
                        />
                    </div>
                </div>
                <div v-if="choosenType === 'coil' || choosenType === 'hr'">
                    <label
                        class="flex items-center cursor-pointer nc:cursor-default group mr-[26px]"
                    >
                        <check-box
                            @change="() => (newRegWOption = !newRegWOption)"
                            :isAllChosen="newRegWOption"
                            :isDisabled="false"
                        />
                        <span
                            class="ml-2 text-sm font-medium leading-none select-none nc:!text-[#426F95] text-[#8DC5F6]'"
                        >
                            {{ t('createReg.fields.w') }}
                        </span>
                    </label>
                    <label
                        class="flex items-center cursor-pointer nc:cursor-default group mr-[26px]"
                    >
                        <check-box
                            @change="() => (newRegMOption = !newRegMOption)"
                            :isAllChosen="newRegMOption"
                            :isDisabled="false"
                        />
                        <span
                            class="ml-2 text-sm font-medium leading-none select-none nc:!text-[#426F95] text-[#8DC5F6]'"
                        >
                            {{ t('createReg.fields.m') }}
                        </span>
                    </label>
                </div>
            </div>
            <div class="flex justify-end items-center gap-2">
                <OutlinedButton @click="$emit('close')">{{ t('btnText') }}</OutlinedButton>
                <PrimaryButton
                    v-if="props.command === 'delete'"
                    class="w-[110px]"
                    @click="handleBtnClick"
                    ><span
                        v-if="isLoading"
                        v-html="spinnerInsideButton"
                        class="[&>svg]:w-4 [&>svg>path]:fill-[#ADEBFF] flex items-center justify-center"
                    ></span>
                    <span v-else>{{ t('deleteBtn') }}</span></PrimaryButton
                >
                <PrimaryButton
                    v-if="props.command === 'create' || props.command === 'createReg'"
                    :isDisabled="
                        ((invalidDevName || invalidDevAddr || !devAddrInputVal) &&
                            props.command === 'create') ||
                        (props.command === 'createReg' &&
                            (newRegInputVal === null || newRegInputVal === ''))
                    "
                    class="w-[110px]"
                    @click="handleBtnClick"
                    ><span
                        v-if="isLoading"
                        v-html="spinnerInsideButton"
                        class="[&>svg]:w-4 [&>svg>path]:fill-[#ADEBFF] flex items-center justify-center"
                    ></span>
                    <span v-else>{{ t('create.btnText') }}</span></PrimaryButton
                >
            </div>
        </div>
        <div
            v-if="deletedDev !== null"
            class="fixed top-0 bottom-0 left-0 right-0 z-[2] bg-[#001d34b2] flex items-center justify-center"
        >
            <div
                class="relative p-6 bg-[#0A2A45] w-[444px] rounded-[12px] flex flex-col gap-[18px]"
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
                    <PrimaryButton
                        @click="handleDeleteDevBtnClick"
                        class="w-[104px]"
                    >
                        <span
                            v-if="isLoading"
                            v-html="spinnerInsideButton"
                            class="[&>svg]:w-4 [&>svg>path]:fill-[#ADEBFF] flex items-center justify-center"
                        ></span>
                        <span v-else>{{ t('deleteBtn') }}</span></PrimaryButton
                    >
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
import spinnerInsideButton from '@/assets/img/spinner-inside-button.svg?raw';
import create from '@/assets/img/create.svg?raw';
import PrimaryButton from '@/components/Ui/PrimaryButton.vue';
import OutlinedButton from '@/components/Ui/OutlinedButton.vue';
import UpdateIcon from '@/assets/UpdateIcon.vue';
import CloseIcon from '@/assets/CloseIcon.vue';
import type { Widget } from '@/stores';
import DropDown from '@/components/Ui/DropDown.vue';
import type { NumberingSystem } from '@/typings/common';
import CheckBox from '@/components/views/panel-choice/CheckBox.vue';

const indexStore = useIndexStore();

const { saveToFile } = useReadWriteFiles();

const { devicesState, mbDevsLabels, curNumberingSystem, mbDevs } = storeToRefs(indexStore);

const api = indexStore.getApi().api;

const isAborted = indexStore.getApi().isAborted;

const updateFilterText = ref('');

const deletedDev = ref<{
    val: number;
    label: string;
} | null>(null);

const currentNumberingSystem = ref<NumberingSystem>(curNumberingSystem.value);

const activeLabel = ref<{ val: number; index: number } | null>(null);

const activeLabelInputVal = ref('');

const devAddrInputVal = ref<number | null>(null);

const newRegInputVal = ref<string | null>(null);

const activeLabelTop = ref(138);

const scrollEl = ref<HTMLElement | undefined>();

const scrollWrapper = ref<HTMLElement | undefined>();

const scrollTop = ref<number>(0);

const isScrolling = ref(false);

const invalidDevName = ref(false);

const invalidDevAddr = ref(false);

const invalidDevAddrType = ref<'deviceAddrRange' | 'deviceAddrExists' | null>(null);

const newRegWOption = ref(false);

const newRegMOption = ref(false);

const isLoading = ref(false);

const props = defineProps<{
    w: { w: Widget; state: number[] };
    el: {
        type?:
            | 'hr'
            | 'wm-hr'
            | 'w-hr'
            | 'm-hr'
            | 'ir'
            | 'coil'
            | 'wm-coil'
            | 'w-coil'
            | 'm-coil'
            | 'di';
        reg_addr: number;
        dev_addr: number;
        val: number | null | 'err';
    } | null;
    newReg?: {
        dev: number;
        type: 'hr' | 'ir' | 'coil' | 'di';
    } | null;
    command?: 'delete' | 'create' | 'update' | 'createReg';
    state: {
        type:
            | 'hr'
            | 'wm-hr'
            | 'w-hr'
            | 'm-hr'
            | 'ir'
            | 'coil'
            | 'wm-coil'
            | 'w-coil'
            | 'm-coil'
            | 'di'
            | 'none';
        reg_addr: number;
        dev_addr: number;
        val: number | null | 'err';
        label?: string;
    }[];
}>();

const choosenDevice = ref<number | null>(props.newReg?.dev || null);

const choosenType = ref<'hr' | 'ir' | 'coil' | 'di' | null>(
    props.newReg?.type === 'coil' ? 'coil' : props.newReg?.type || null,
);

const curMbDevLabels = computed<string[]>(() => {
    return mbDevsLabels.value[props.w.w.d][props.w.w.bus || 0];
});

const emit = defineEmits<{
    (e: 'close'): void;
}>();

const placeholder = computed<string>(() => {
    if (props.command === 'update') {
        return t('placeholder.update');
    } else if (props.command === 'create') {
        return t('placeholder.create');
    } else if (props.command === 'createReg') {
        return t('placeholder.createReg');
    } else {
        return '';
    }
});

const curDevices = computed<{ val: number; label: string }[] | []>(() => {
    const curVals = mbDevs.value[props.w.w.d][props.w.w.bus || 0];
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
    } else if (props.command === 'create') {
        createDev();
    } else if (props.command === 'createReg') {
        createReg();
    }
}

async function deleteItem() {
    isLoading.value = true;
    try {
        let newIndex;
        for (let i = 0; i < props.state.length; i += 1) {
            if (
                JSON.stringify({
                    type: props.state[i].type,
                    reg_addr: props.state[i].reg_addr,
                    dev_addr: props.state[i].dev_addr,
                    val: props.state[i].val,
                }) === JSON.stringify(props.el)
            ) {
                newIndex = i;
            }
        }
        if (newIndex === undefined || !props.el) {
            setTimeout(() => {
                isLoading.value = false;
                emit('close');
            }, 750);
            return;
        }
        const r = await api.post('set_mb_info', {
            device: props.w.w.d,
            bus: props.w.w.bus || 0,
            index: newIndex,
            type: ['none'],
            dev_addr: [props.el.dev_addr],
            reg_addr: [props.el.reg_addr],
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
    setTimeout(() => {
        isLoading.value = false;
        emit('close');
    }, 750);
}

async function createReg() {
    isLoading.value = true;
    if (
        newRegInputVal.value === null ||
        newRegInputVal.value === '' ||
        choosenDevice.value === null
    ) {
        setTimeout(() => {
            isLoading.value = false;
            emit('close');
        }, 750);
        return;
    }
    let newType = choosenType.value;
    if (choosenType.value === 'coil' || choosenType.value === 'hr') {
        if (newRegWOption.value && newRegMOption.value) {
            newType = 'wm-' + newType;
        } else if (newRegWOption.value) {
            newType = 'w-' + newType;
        } else if (newRegMOption.value) {
            newType = 'm-' + newType;
        }
    }
    const index = props.state.findIndex((el) => el.type === 'none');
    if (index !== -1) {
        await setData(
            choosenDevice.value,
            currentNumberingSystem.value === 'dec'
                ? +newRegInputVal.value
                : parseInt(newRegInputVal.value, 16),
            newType as
                | 'hr'
                | 'wm-hr'
                | 'w-hr'
                | 'm-hr'
                | 'ir'
                | 'coil'
                | 'wm-coil'
                | 'w-coil'
                | 'm-coil'
                | 'di'
                | 'none',
            index,
        );
        const newLabels = props.state.map((el) => el.label || '');
        newLabels[index] = activeLabelInputVal.value;
        for (let i = 0; i < Math.ceil(newLabels.length / labelsFileLength); i += 1) {
            if (
                JSON.stringify(
                    props.state
                        .map((el) => el.label || '')
                        .slice(i * labelsFileLength, (i + 1) * labelsFileLength),
                ) !==
                JSON.stringify(newLabels.slice(i * labelsFileLength, (i + 1) * labelsFileLength))
            ) {
                saveRegLabel(
                    newLabels.slice(i * labelsFileLength, (i + 1) * labelsFileLength) as string[],
                    i,
                );
            }
        }
    }
    setTimeout(() => {
        isLoading.value = false;
        emit('close');
    }, 750);
}

async function saveRegLabel(labels: string[], part: number) {
    const isSavingError = await saveToFile(
        {
            type: 'labels',
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
            saveRegLabel(labels, part);
        }, 5);
    } else {
        indexStore.changeLabel(props.w.w.d, 'mb-var', labels, part, props.w.w.bus);
    }
}

async function createDev() {
    if (invalidDevName.value || invalidDevAddr.value || !devAddrInputVal.value) return;
    isLoading.value = true;
    const devs = [...mbDevs.value[props.w.w.d][props.w.w.bus || 0], devAddrInputVal.value].sort(
        (a, b) => a - b,
    );
    await setDevs(devs);
    await setLabel(devAddrInputVal.value, activeLabelInputVal.value);
    setTimeout(() => {
        isLoading.value = false;
        emit('close');
    }, 750);
}

async function setDevs(devs: number[]) {
    const isSavingError = await saveToFile(
        {
            type: 'mb',
            subType: 'devs',
            device: props.w.w.d,
            bus: props.w.w.bus || 0,
        },
        { devs: devs },
    );
    if (isSavingError) {
        if (isAborted.value) {
            return;
        }
        setTimeout(() => {
            setDevs(devs);
        }, 5);
    } else {
        indexStore.setMbDevs(props.w.w.d, props.w.w.bus || 0, devs);
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
    if (
        !target ||
        (!activeLabel.value && !(props.command === 'create' || props.command === 'createReg'))
    )
        return;
    activeLabelInputVal.value = target.value;
    if (props.command === 'create') {
        invalidDevName.value = curMbDevLabels.value.includes(activeLabelInputVal.value.trim());
    }
}

function handleDevAddrInput(e: InputEvent) {
    const target = e.target as HTMLInputElement;
    if (!target || isNaN(+target.value)) return;
    devAddrInputVal.value = +target.value;
    invalidDevAddr.value = devAddrInputVal.value < 1 || devAddrInputVal.value > 255;
    if (invalidDevAddr.value) {
        invalidDevAddrType.value = 'deviceAddrRange';
    } else {
        invalidDevAddr.value = curDevices.value.map((el) => el.val).includes(devAddrInputVal.value);
        if (invalidDevAddr.value) {
            invalidDevAddrType.value = 'deviceAddrExists';
        } else {
            invalidDevAddrType.value = null;
        }
    }
}

function handlenewRegInput(e: InputEvent) {
    const target = e.target as HTMLInputElement;
    if (!target) return;
    if (currentNumberingSystem.value === 'dec') {
        if (isNaN(+target.value)) return;
        if (+target.value < 0) {
            newRegInputVal.value = String(0);
        } else if (+target.value > 65535) {
            newRegInputVal.value = String(65535);
        } else {
            newRegInputVal.value = target.value;
        }
    } else {
        const val = parseInt(target.value, 16);
        if (isNaN(val)) return;
        if (val < 0) {
            newRegInputVal.value = String(0);
        } else if (val > 65535) {
            newRegInputVal.value = 'FFFF';
        } else {
            newRegInputVal.value = target.value;
        }
    }
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
    if (label === undefined) {
        return;
    }
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
        indexStore.setMbDevsLabels(props.w.w.d, props.w.w.bus || 0, part, labels);
    }
}

function handleDeviceDelete(el: { val: number; label: string }) {
    deletedDev.value = el;
}

async function handleDeleteDevBtnClick() {
    if (!deletedDev.value) return;
    isLoading.value = true;
    const devs = [...mbDevs.value[props.w.w.d][props.w.w.bus || 0]].filter(
        (el) => el !== deletedDev.value?.val,
    );
    for await (const el of props.state) {
        if (el.dev_addr === deletedDev.value?.val) {
            await setData(el.dev_addr, el.reg_addr, 'none');
        }
    }
    await setDevs(devs);
    await setLabel(deletedDev.value.val, '');
    setTimeout(() => {
        isLoading.value = false;
        deletedDev.value = null;
    }, 750);
}

async function setData(
    dev: number,
    reg: number,
    type:
        | 'none'
        | 'di'
        | 'ir'
        | 'coil'
        | 'wm-coil'
        | 'w-coil'
        | 'm-coil'
        | 'hr'
        | 'wm-hr'
        | 'w-hr'
        | 'm-hr',
    propIndex?: number,
) {
    try {
        const index =
            propIndex !== undefined
                ? propIndex
                : props.state.findIndex(
                      (el) => el.dev_addr === dev && el.reg_addr === reg && el.type !== 'none',
                  );
        if (index !== -1) {
            const r = await api.post('set_mb_info', {
                device: props.w.w.d,
                bus: props.w.w.bus || 0,
                index: index,
                type: [type],
                dev_addr: [dev],
                reg_addr: [reg],
            });
            return r.data;
        }
        return;
    } catch (error) {
        if (isAborted.value) {
            return;
        }
        setTimeout(() => {
            setData(dev, reg, type, propIndex);
        }, 5);
    }
}

watch(currentNumberingSystem, () => {
    if (newRegInputVal.value !== null)
        newRegInputVal.value =
            currentNumberingSystem.value === 'dec'
                ? String(parseInt(newRegInputVal.value, 16))
                : (+newRegInputVal.value).toString(16);
});

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
            },
            update: {
                title: 'Редактирование устройств',
                popUpText: 'Вы действительно хотите удалить устройство?',
                attentionText:
                    'Внимание! Все переменные MODBUS, связанные с этим устройством будут удалены.',
            },
            create: {
                title: 'Добавить устройство',
                devName: 'Название устройства ',
                devAddr: 'Адрес устройства',
                error: {
                    deviceNameExists: 'Устройство с таким названием уже существует',
                    deviceAddrExists: 'Устройство с таким адресом уже существует',
                    deviceAddrRange: 'Введите значение от 1 до 255',
                },
                btnText: 'Добавить',
            },
            createReg: {
                title: 'Добавить регистр',
                fields: {
                    type: 'Тип',
                    device: 'Устройство',
                    regName: 'Название регистра',
                    regAddr: 'Адрес регистра',
                    w: 'Режим работы “только запись”',
                    m: 'Использовать команду записи нескольких регистров',
                },
            },
            deleteBtn: 'Удалить',
            btnText: 'Отмена',
            placeholder: {
                update: 'Введите название или адрес устройства',
                create: 'Введите название устройства',
                createReg: 'Введите название регистра',
            },
        },
        en: {
            delete: {
                title: 'Confirmation',
                text: 'Are you sure you want to delete the register?',
            },
            update: {
                title: 'Editing devices',
                popUpText: 'Are you sure you want to delete the device?',
                attentionText:
                    'Attention! All MODBUS variables associated with this device will be deleted.',
            },
            create: {
                title: 'Add device',
                devName: 'Device name',
                devAddr: 'Device address',
                error: {
                    deviceNameExists: 'A device with the same name already exists',
                    deviceAddrExists: 'A device with the same address already exists',
                    deviceAddrRange: 'Enter a value between 1 and 255',
                },
                btnText: 'Add',
            },
            createReg: {
                title: 'Add register',
                fields: {
                    type: 'Type',
                    device: 'Device',
                    regName: 'Register name',
                    regAddr: 'Register address',
                    w: '“Record only” operating mode',
                    m: 'Use multiple register write command',
                },
            },
            deleteBtn: 'Delete',
            btnText: 'Cancel',
            placeholder: {
                update: 'Enter the device name or address',
                create: 'Enter the device name',
                createReg: 'Enter the register name',
            },
        },
    },
});
</script>
