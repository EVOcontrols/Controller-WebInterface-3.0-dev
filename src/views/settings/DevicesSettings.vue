<template>
    <div class="h-full flex flex-col">
        <div
            class="flex flex-col flex-1 overflow-y-auto overflow-x-hidden scrollbar-4 relative"
            :id="'devicesSettings'"
        >
            <template v-if="controllerSettings">
                <div class="flex flex-col px-8">
                    <div class="mt-8 flex flex-col border-b border-[#0b3d68] pb-9 w-full">
                        <h2
                            class="font-semibold text-xl leading-[1.2] whitespace-pre mb-[1.125rem]"
                        >
                            {{ t('selectDevice') }}
                        </h2>
                        <div class="flex flex-row items-center overflow-hidden">
                            <div class="flex overflow-x-hidden ml-2 bg-113 pl-2 pr-1 rounded-l-lg">
                                <div
                                    v-dragscroll.x
                                    class="flex items-center overflow-x-auto no-scrollbar w-full flex-none"
                                    ref="scrollWrapper"
                                >
                                    <div
                                        class="flex items-center flex-none h-8 gap-1"
                                        ref="scrollEl"
                                    >
                                        <button
                                            v-for="(device, i) in fullDevs"
                                            :key="i"
                                            class="h-[1.563rem] w-[3.188rem] bg-[#1b4569] hover:bg-[#214e76] on:bg-[#148ef8] font-roboto rounded flex items-center justify-center relative"
                                            :class="{
                                                on:
                                                    device.addr === activeIndex ||
                                                    device.index === activeIndex,
                                            }"
                                            @click="
                                                () => {
                                                    if (!extDevsList) return;
                                                    activeDeviceAddr =
                                                        i === 0 ? 0 : extDevsList[i - 1]?.addr;
                                                }
                                            "
                                        >
                                            <div
                                                v-if="
                                                    device.addr !== 0 &&
                                                    device.state !== 'on' &&
                                                    device.state !== 'off'
                                                "
                                                class="w-[5px] h-[5px] rounded-[50%] mr-[6px]"
                                                :class="[
                                                    { 'bg-[#84AFBD]': device.state === 'init' },
                                                    { 'bg-[#3E688E]': device.state === 'no-conn' },
                                                    { 'bg-[#FF5A88]': device.state === 'error' },
                                                ]"
                                            ></div>
                                            {{
                                                device.addr > 0
                                                    ? fullDevs.findIndex(
                                                          (el) => el.serial === device.serial,
                                                      ) !== -1
                                                        ? `IO ${
                                                              fullDevs.find(
                                                                  (el) =>
                                                                      el.serial === device.serial,
                                                              )?.index ||
                                                              fullDevs.find(
                                                                  (el) =>
                                                                      el.serial === device.serial,
                                                              )?.addr ||
                                                              ''
                                                          }`
                                                        : 'IO'
                                                    : 'NGC'
                                            }}
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <span
                                v-html="edit"
                                class="group ml-3"
                                :class="
                                    ngcModbusMode === 'ext-devs' ? 'cursor-pointer' : 'cursor-auto'
                                "
                                @mouseenter="
                                    () => {
                                        if (ngcModbusMode !== 'ext-devs')
                                            indexStore.toggleIsEditPopUpShown(true);
                                    }
                                "
                                @click="isModalOpen = true"
                            ></span>
                        </div>
                    </div>
                    <Transition
                        name="fade-150"
                        mode="out-in"
                    >
                        <EditNGCSettings
                            v-if="activeDeviceAddr === 0"
                            :controller-settings="controllerSettings"
                            :save-trigger="saveTrigger"
                            @set-need-to-save="needToSave = $event"
                            @set-is-saving="isSaving = $event"
                        />
                        <EditExtDeviceSettings
                            v-else-if="activeExtDevice"
                            :deviceIndex="activeExtDevice.index"
                            :device-addr="activeDeviceAddr"
                            :device-state="activeExtDevice.state"
                            :save-trigger="saveTrigger"
                            @change-state="activeExtDevice.state = $event"
                            @set-need-to-save="needToSave = $event"
                            @set-is-saving="isSaving = $event"
                        />
                    </Transition>
                </div>
            </template>
        </div>
        <div
            class="h-[3.625rem] flex flex-row justify-end items-center border-t-2 border-[#0b3d68] pr-8"
        >
            <SaveButton
                :isSaving="isSaving"
                :is-disabled="isSaveButtonDisabled"
                class="w-[7.563rem]"
                @click="save"
            />
        </div>
        <ModalWrapper
            v-if="isModalOpen"
            :cancel-text="t('cancel')"
            :confirm-text="t('close')"
            :hideCancel="!scanDevs"
            :width-class="'w-[65rem]'"
            :hasBack="true"
            @confirm="
                () => {
                    isModalOpen = false;
                    scanDevs = undefined;
                    startAddr = '';
                    endAddr = '';
                    isScanning = false;
                }
            "
            @close="
                () => {
                    isModalOpen = false;
                    scanDevs = undefined;
                    startAddr = '';
                    endAddr = '';
                    isScanning = false;
                }
            "
            @back="
                () => {
                    scanDevs = undefined;
                    startAddr = '';
                    endAddr = '';
                }
            "
        >
            <template #title-icon>
                <span v-html="add"></span>
            </template>
            <template #title>{{ t('modalTitle') }}</template>
            <template #content>
                <div class="flex gap-3">
                    <div
                        v-if="isScanning"
                        class="px-6 py-4 h-[370px] bg-[#113351] rounded-[6px] flex gap-2 items-center text-[#148EF8] justify-center"
                        :style="{ width: 'calc(50% - 6px)' }"
                    >
                        {{ t('scanning') }}
                        <div class="spinner-box">
                            <div class="flex items-center justify-center gap-1">
                                <div
                                    class="pulse-bubble-1 w-[5px] h-[5px] rounded-[50%] bg-[#4799E2]"
                                ></div>
                                <div
                                    class="pulse-bubble-2 w-[5px] h-[5px] rounded-[50%] bg-[#4799E2]"
                                ></div>
                                <div
                                    class="pulse-bubble-3 w-[5px] h-[5px] rounded-[50%] bg-[#4799E2]"
                                ></div>
                            </div>
                        </div>
                    </div>
                    <div
                        v-else-if="scanDevs && scanDevs.length"
                        class="px-2 pt-4 h-[370px] bg-[#113351] rounded-[6px] flex gap-2 items-center text-[#148EF8] justify-center"
                        :style="{ width: 'calc(50% - 6px)' }"
                    >
                        <div class="flex overflow-y-hidden h-full rounded-l-lg w-full">
                            <div
                                class="flex overflow-y-auto w-full scrollbar-4 flex-1 flex-col relative"
                            >
                                <div class="flex flex-col items-center flex-none w-full">
                                    <div
                                        class="w-full h-[36px] text-sm text-[#9ADBF6] pt-[10px] z-[1] sticky top-0 bg-[#113351] flex gap-5"
                                    >
                                        <div class="w-[76px] text-end">
                                            {{ t('columnsNames.type') }}
                                        </div>
                                        <div class="w-[194px]">
                                            {{ t('columnsNames.id') }}
                                        </div>
                                        <div class="w-[52px] text-end">
                                            {{ t('columnsNames.addr') }}
                                        </div>
                                    </div>
                                    <draggable
                                        class="list-group w-full"
                                        data-list="scanDevs"
                                        :list="scanDevs"
                                        group="bionicles"
                                        itemKey="element.id+'-'+index"
                                        @start="handleDregStartItem"
                                        :move="handleMoveItem"
                                        @end="handleDragEndItem"
                                        :options="{ animation: 500 }"
                                        draggable=".item:not(.exclude-this-item)"
                                    >
                                        <template #item="{ element, index }">
                                            <div
                                                class="item select-none list-group-item group hover:bg-[#163E61] flex items-center w-full text-sm h-[38px] transition-colors duration-500 rounded text-[#8DC5F6]"
                                                :class="{
                                                    'exclude-this-item':
                                                        extDevsList &&
                                                        extDevsList.find(
                                                            (el: ExtDev) =>
                                                                el.serial === element.serial,
                                                        ),
                                                }"
                                            >
                                                <div class="w-7 text-end mr-3">
                                                    {{ index + 1 }}
                                                </div>
                                                <div
                                                    class="w-[38px] h-6 rounded bg-[#184a6a] text-[13px] text-[#42CBF6] flex items-center justify-center mr-3"
                                                >
                                                    IO
                                                </div>
                                                <div class="w-[194px] mr-6">
                                                    {{ element.serial }}
                                                </div>
                                                <div class="w-[52px] mr-6 text-end">
                                                    {{ element.addr }}
                                                </div>
                                                <div
                                                    v-if="
                                                        extDevsList &&
                                                        extDevsList.find(
                                                            (el: ExtDev) =>
                                                                el.serial === element.serial,
                                                        )
                                                    "
                                                    class="flex-1 pr-2 text-end select-none"
                                                >
                                                    {{ t('added') }}
                                                </div>
                                                <div
                                                    v-else
                                                    class="flex-1 pr-2 flex justify-end"
                                                >
                                                    <span
                                                        class="[&>svg]:w-4 [&>svg]:h-4 [&>svg>path]:transition-colors [&>svg>path]:duration-500"
                                                        :class="
                                                            !extDevs.filter((el) => el.type === '')
                                                                .length
                                                                ? '[&>svg>path]:fill-[#3E688E] group-hover:[&>svg>path]:fill-[#3E688E] cursor-auto'
                                                                : 'cursor-pointer [&>svg>path]:fill-[#194F76] group-hover:[&>svg>path]:fill-[#58B1FF]'
                                                        "
                                                        v-html="add"
                                                        @click="
                                                            () => {
                                                                if (
                                                                    extDevs.filter(
                                                                        (el) => el.type === '',
                                                                    ).length
                                                                ) {
                                                                    curAddingDev = {
                                                                        addr: element.addr,
                                                                        initAddr: element.addr,
                                                                        type: element.type,
                                                                        state: element.state,
                                                                        index: extDevs.findIndex(
                                                                            (el) => el.type === '',
                                                                        ),
                                                                    };
                                                                }
                                                            }
                                                        "
                                                    ></span>
                                                </div>
                                            </div>
                                        </template>
                                    </draggable>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div
                        v-else-if="scanDevs"
                        class="px-6 pt-4 h-[370px] bg-[#113351] rounded-[6px] flex gap-2 items-center mr-8 text-[#148EF8] justify-center"
                        :style="{ width: 'calc(50% - 6px)' }"
                    >
                        {{ t('noDevs') }}
                    </div>
                    <div
                        v-else
                        class="px-6 py-4 h-[370px] bg-[#113351] rounded-[6px] flex flex-col justify-between"
                        :style="{ width: 'calc(50% - 6px)' }"
                    >
                        <div>
                            <div class="flex items-start gap-5 mb-[14px]">
                                <div class="flex w-[200px] justify-between items-center">
                                    <div
                                        class="text-[#6d9cc5] text-sm leading-[1.143] table-cell pr-2.5"
                                    >
                                        {{ t('startAddr') }}
                                    </div>
                                    <UiInput
                                        :placeholder="'000'"
                                        :init-value="startAddr"
                                        :name="t('startAddr')"
                                        :init-type="'string'"
                                        class="table-cell w-16 text-center !px-2"
                                        :status="
                                            (startAddr && +startAddr >= 1 && +startAddr <= 247) ||
                                            startAddr === ''
                                                ? 'valid'
                                                : 'invalid'
                                        "
                                        :input-type="['string']"
                                        @value-changed="
                                            ($event: string | undefined) => {
                                                $event === undefined
                                                    ? (startAddr = '')
                                                    : (startAddr = $event);
                                            }
                                        "
                                    />
                                </div>
                                <div
                                    v-if="
                                        (startAddr && +startAddr < 1) ||
                                        (startAddr && +startAddr > 247) ||
                                        isNaN(+startAddr)
                                    "
                                    class="text-[#ED4272] text-sm leading-[1.143] w-[222px] m-auto"
                                >
                                    {{ t('errors.length') }}
                                </div>
                            </div>
                            <div class="flex items-start gap-5">
                                <div class="flex w-[200px] justify-between items-center">
                                    <div
                                        class="text-[#6d9cc5] text-sm leading-[1.143] table-cell pr-2.5"
                                    >
                                        {{ t('endAddr') }}
                                    </div>
                                    <UiInput
                                        :placeholder="'000'"
                                        :init-value="endAddr"
                                        :name="t('endAddr')"
                                        :init-type="'string'"
                                        class="table-cell w-16 text-center !px-2"
                                        :status="
                                            (endAddr &&
                                                +endAddr >= 1 &&
                                                +endAddr <= 247 &&
                                                (startAddr ? +startAddr <= +endAddr : true)) ||
                                            endAddr === ''
                                                ? 'valid'
                                                : 'invalid'
                                        "
                                        :input-type="['string']"
                                        @value-changed="
                                            $event === undefined
                                                ? (endAddr = '')
                                                : (endAddr = $event)
                                        "
                                    />
                                </div>
                                <div
                                    v-if="
                                        (endAddr && +endAddr < 1) ||
                                        (endAddr && +endAddr > 247) ||
                                        isNaN(+endAddr) ||
                                        (startAddr && endAddr && +startAddr > +endAddr)
                                    "
                                    class="text-[#ED4272] text-sm leading-[1.143] w-[222px] m-auto"
                                >
                                    {{
                                        startAddr && endAddr && +startAddr > +endAddr
                                            ? t('errors.val')
                                            : t('errors.length')
                                    }}
                                </div>
                            </div>
                        </div>
                        <SaveButton
                            :isSaving="isScanning"
                            :is-disabled="
                                !startAddr ||
                                +startAddr < 1 ||
                                +startAddr > 247 ||
                                isNaN(+startAddr) ||
                                !endAddr ||
                                +endAddr < 1 ||
                                +endAddr > 247 ||
                                isNaN(+endAddr) ||
                                +startAddr > +endAddr
                            "
                            class="w-[7.563rem] self-end disabled:border disabled:border-[#3e688e]"
                            @click="scan"
                        >
                            {{ t('start') }}</SaveButton
                        >
                    </div>
                    <div
                        class="h-[370px] bg-[#113351] rounded-[6px] flex overflow-y-auto scrollbar-4 px-2"
                        :style="{ width: 'calc(50% - 6px)' }"
                    >
                        <div class="flex overflow-y-hidden rounded-l-lg w-full">
                            <div
                                class="flex overflow-y-auto w-full scrollbar-4 flex-1 flex-col relative"
                            >
                                <div class="flex flex-col items-center flex-none w-full">
                                    <div
                                        class="w-full h-[36px] text-sm text-[#9ADBF6] pt-[10px] z-[1] sticky top-0 bg-[#113351] flex gap-3"
                                    >
                                        <div class="w-[76px] text-end">
                                            {{ t('columnsNames.type') }}
                                        </div>
                                        <div class="w-[194px]">
                                            {{ t('columnsNames.id') }}
                                        </div>
                                        <div class="w-[52px] text-end">
                                            {{ t('columnsNames.addr') }}
                                        </div>
                                        <div class="w-[48px] text-end">
                                            {{ t('columnsNames.status') }}
                                        </div>
                                    </div>
                                    <draggable
                                        class="list-group w-full"
                                        data-list="extDevs"
                                        :list="extDevs"
                                        group="bionicles"
                                        itemKey="element.id+'-'+index"
                                        :move="handleMoveItem"
                                        @end="handleDragEndItem"
                                        :options="{ animation: 500 }"
                                        draggable=".item:not(.exclude-this-item)"
                                    >
                                        <template #item="{ element, index }">
                                            <div
                                                v-if="element.type"
                                                class="select-none item exclude-this-item list-group-item group hover:bg-[#163E61] flex items-center w-full text-sm h-[38px] transition-colors duration-500 rounded text-[#8DC5F6]"
                                            >
                                                <div class="w-[28px] min-w-[28px] text-end mr-3">
                                                    {{ index + 1 }}
                                                </div>
                                                <div
                                                    class="w-[38px] min-w-[38px] h-6 rounded bg-[#184a6a] text-[13px] text-[#42CBF6] flex items-center justify-center mr-3"
                                                >
                                                    IO
                                                </div>
                                                <div class="w-[194px] min-w-[194px] mr-6">
                                                    {{ element.serial }}
                                                </div>
                                                <div class="w-[52px] mr-6 text-end">
                                                    {{ element.addr }}
                                                </div>
                                                <div class="w-[52px] mr-6 text-end">
                                                    <IButtonOutIcon
                                                        :isHovered="hoveredItem === index"
                                                        :isActive="element.state === 'on'"
                                                        @mouseenter="handleMouseEnter(index)"
                                                        @mouseleave="handleMouseLeave"
                                                        class="cursor-pointer"
                                                        @click="
                                                            changeDevStatus(
                                                                element.addr,
                                                                element.state,
                                                            )
                                                        "
                                                    />
                                                </div>
                                                <div
                                                    v-if="element.type"
                                                    class="flex-1 pr-2 flex justify-end"
                                                >
                                                    <span
                                                        class="cursor-pointer [&>svg]:w-4 [&>svg]:h-4 [&>svg]:rotate-45 [&>svg>path]:transition-colors [&>svg>path]:duration-500 [&>svg>path]:fill-[#194F76] group-hover:[&>svg>path]:fill-[#58B1FF]"
                                                        v-html="add"
                                                        @click="deletingDev = element"
                                                    ></span>
                                                </div>
                                            </div>
                                            <div
                                                v-else
                                                class="select-none item exclude-this-item list-group-item group hover:bg-[#163E61] flex items-center w-full text-sm h-[38px] transition-colors duration-500 rounded text-[#8DC5F6]"
                                            >
                                                <div class="w-[28px] min-w-[28px] text-end mr-3">
                                                    {{ index + 1 }}
                                                </div>
                                                <OutlinedButton
                                                    class="w-[38px] min-w-[38px] mr-3"
                                                    :class="
                                                        scanDevs &&
                                                        scanDevs.length &&
                                                        scanDevs.find((el) => {
                                                            if (!extDevsList) return false;
                                                            return !extDevsList.find(
                                                                (elem: ExtDev) =>
                                                                    elem.serial === el.serial,
                                                            );
                                                        })
                                                            ? 'cursor-pointer hover:border-[#3e7df9] hover:text-[#3e7df9] active:border-[#3e7df9] active:bg-[#3e7df9] active:text-[#adebff]'
                                                            : 'cursor-auto hover:!border-[#148ef8] hover:!text-[#148ef8] active:!border-[#148ef8] active:!bg-[transparent] active:!text-[#148ef8]'
                                                    "
                                                    @click="
                                                        () => {
                                                            const el = scanDevs?.find((el) => {
                                                                if (!extDevsList) return false;
                                                                return !extDevsList.find(
                                                                    (elem: ExtDev) =>
                                                                        elem.serial === el.serial,
                                                                );
                                                            });
                                                            if (el) {
                                                                addingDev = {
                                                                    addr: el.addr,
                                                                    type: el.type,
                                                                    initAddr: el.addr,
                                                                    index: index,
                                                                    state: el.state || 'on',
                                                                };
                                                            }
                                                        }
                                                    "
                                                    ><span
                                                        class="[&>svg]:w-3 [&>svg]:h-3"
                                                        v-html="add"
                                                    ></span>
                                                </OutlinedButton>
                                                <div class="flex-1">
                                                    {{ t('manualAdd') }}
                                                </div>
                                            </div>
                                        </template>
                                    </draggable>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </template>
        </ModalWrapper>
        <ModalWrapper
            v-if="deletingDev"
            :confirm-text="t('delete')"
            :width-class="'w-[27.75rem]'"
            :is-saving="isDeleting"
            @confirm="getExtList"
            @close="deletingDev = undefined"
        >
            <template #title-icon>
                <span v-html="approve"></span>
            </template>
            <template #title>{{ t('confirm.title') }}</template>
            <template #content>
                <div>
                    <div class="text-sm text-[#6CB5D3] mb-4">{{ t('confirm.text') }}</div>
                    <div class="mb-3 rounded-[6px] bg-[#092740] flex gap-2 justify-center p-2">
                        <div
                            class="relative rounded bg-[#1B4569] h-6 px-[10px] flex items-center text-[#8DC5F6]"
                            :class="{ 'pl-[20px]': !['on', 'off'].includes(deletingDev.state) }"
                        >
                            <div
                                class="absolute w-[5px] h-[5px] rounded-[50%] left-[10px] top-[9px]"
                                :class="[
                                    { 'bg-[#84AFBD]': deletingDev.state === 'init' },
                                    { 'bg-[#3E688E]': deletingDev.state === 'no-conn' },
                                    { 'bg-[#FF5A88]': deletingDev.state === 'error' },
                                ]"
                            ></div>
                            {{ 'IO ' + deletingDev.index }}
                        </div>
                        <div
                            class="bg-[#1B4569] rounded-[10px] py-4 px-6 text-sm text-[#8DC5F6] leading-[100%] flex flex-col gap-1"
                        >
                            <div>ID: {{ deletingDev.serial }}</div>
                            <div class="relative">
                                <div
                                    class="absolute w-[5px] h-[5px] rounded-[50%] left-[-11px] top-[5px]"
                                    :class="[
                                        { 'bg-[#84AFBD]': deletingDev.state === 'init' },
                                        { 'bg-[#3E688E]': deletingDev.state === 'no-conn' },
                                        { 'bg-[#FF5A88]': deletingDev.state === 'error' },
                                    ]"
                                ></div>
                                {{ t('confirm.status') }}
                                {{
                                    deletingDev.state === 'init'
                                        ? t('confirm.init')
                                        : deletingDev.state === 'error'
                                        ? t('confirm.error')
                                        : deletingDev.state === 'on'
                                        ? t('confirm.on')
                                        : deletingDev.state === 'off'
                                        ? t('confirm.off')
                                        : t('confirm.noConnection')
                                }}
                            </div>
                            <div>{{ t('confirm.addr') }} {{ deletingDev.addr }}</div>
                            <div>{{ t('confirm.firmWare') }} {{ deletingDev.version }}</div>
                        </div>
                    </div>
                    <div
                        class="rounded-[6px] px-[14px] py-2 bg-[#7D183C85] flex gap-2 items-center"
                    >
                        <span
                            v-html="info"
                            class="[&>svg>path]:fill-[#F83068] [&>svg>rect]:fill-[#F83068]"
                        ></span>
                        <div class="w-[20rem] text-sm text-[#F83068]">
                            {{ t('confirm.attention') }}
                        </div>
                    </div>
                </div>
            </template>
        </ModalWrapper>
        <ModalWrapper
            v-if="addingDev"
            :confirm-text="t('add')"
            :width-class="'w-[32.25rem]'"
            :is-confirm-disabled="
                !!extDevs.find((el) => {
                    if (addingDev) {
                        return el.addr === addingDev.addr;
                    } else {
                        return false;
                    }
                }) ||
                !addingDev.addr ||
                addingDev.addr < 1 ||
                addingDev.addr > 247 ||
                !scanDevs ||
                !scanDevs.find((el) => {
                    return addingDev && el.addr === addingDev.addr;
                })
            "
            @confirm="addNewExtDev"
            @close="addingDev = undefined"
        >
            <template #title-icon>
                <span v-html="add"></span>
            </template>
            <template #title>{{ t('addDevice') }}{{ addingDev.index + 1 }}</template>
            <template #content>
                <div class="text-sm text-[#8DC5F6] mb-[14px]">{{ t('adding.fields.addr') }}</div>
                <div class="mb-3 rounded-[6px] flex gap-2 items-center">
                    <UiInput
                        :init-value="addingDev.addr.toString()"
                        :name="'newAddr'"
                        :init-type="'string'"
                        class="table-cell !rounded min-w-[60px] w-[60px] text-center !px-[10px] !h-[42px] bg-[#1B4569]"
                        :status="
                            addingDev.addr &&
                            !extDevs.find((el) => {
                                if (addingDev) {
                                    return el.addr === addingDev.addr;
                                } else {
                                    return false;
                                }
                            }) &&
                            addingDev.addr >= 1 &&
                            addingDev.addr <= 247 &&
                            scanDevs &&
                            scanDevs.find((el) => {
                                return addingDev && el.addr === addingDev.addr;
                            }) &&
                            !extDevs.find((elem) => {
                                return addingDev && elem.addr === addingDev.addr;
                            })
                                ? 'valid'
                                : 'invalid'
                        "
                        :input-type="['string']"
                        @value-changed="
                            $event === undefined ? (addingDev.addr = 0) : (addingDev.addr = +$event)
                        "
                    />
                    <div
                        v-if="
                            (extDevs.find((el) => {
                                if (addingDev) {
                                    return el.addr === addingDev.addr;
                                } else {
                                    return false;
                                }
                            }) &&
                                addingDev.addr) ||
                            (scanDevs &&
                                !scanDevs.find((el) => {
                                    return addingDev && el.addr === addingDev.addr;
                                }))
                        "
                        class="rounded-[6px] px-[14px] py-2 bg-[#7D183C85]"
                    >
                        <div class="w-[20rem] text-sm text-[#F83068]">
                            {{
                                scanDevs &&
                                !scanDevs.find((el) => {
                                    return addingDev && el.addr === addingDev.addr;
                                })
                                    ? t('adding.notAvailable')
                                    : t('adding.error')
                            }}
                        </div>
                    </div>
                </div>
                <div class="text-sm text-[#8DC5F6] mb-[14px]">{{ t('adding.fields.type') }}</div>
                <div
                    class="mb-3 rounded-[6px] bg-[#092740] flex items-center justify-center w-[38px] h-6 rounded bg-[#184a6a]"
                >
                    IO
                </div>
                <div class="text-sm text-[#8DC5F6] mb-[14px]">{{ t('adding.fields.state') }}</div>
                <div class="flex gap-2">
                    <div
                        :class="
                            addingDev.state === 'on'
                                ? 'text-[#35FED0] select-none'
                                : 'cursor-pointer text-[#176F6F] select-none'
                        "
                        @click="addingDev.state = 'on'"
                    >
                        {{ t('adding.on') }}
                    </div>
                    <div
                        :class="
                            addingDev.state === 'off'
                                ? 'text-[#35FED0] select-none'
                                : 'cursor-pointer text-[#176F6F] select-none'
                        "
                        @click="addingDev.state = 'off'"
                    >
                        {{ t('adding.off') }}
                    </div>
                </div>
            </template>
        </ModalWrapper>
        <ModalWrapper
            v-if="curAddingDev"
            :confirm-text="t('accept')"
            :width-class="'w-[27.75rem]'"
            :is-confirm-disabled="
                !!extDevs.find((el) => {
                    if (curAddingDev) {
                        return el.addr === curAddingDev.addr;
                    } else {
                        return false;
                    }
                }) ||
                !curAddingDev.addr ||
                curAddingDev.addr < 1 ||
                curAddingDev.addr > 247
            "
            @confirm="addNewExtDev"
            @close="curAddingDev = undefined"
        >
            <template #title-icon>
                <span v-html="approve"></span>
            </template>
            <template #title>{{ t('confirm.title') }}</template>
            <template #content>
                <div class="mb-3 rounded-[6px] bg-[#092740] flex gap-2 p-2 items-center">
                    <UiInput
                        :init-value="curAddingDev.addr.toString()"
                        :name="'newAddr'"
                        :init-type="'string'"
                        class="table-cell !rounded min-w-[50px] w-[50px] text-center !px-[10px] !h-6"
                        :status="
                            curAddingDev.addr &&
                            !extDevs.find((el) => {
                                if (curAddingDev) {
                                    return el.addr === curAddingDev.addr;
                                } else {
                                    return false;
                                }
                            }) &&
                            curAddingDev.addr >= 1 &&
                            curAddingDev.addr <= 247
                                ? 'valid'
                                : 'invalid'
                        "
                        :input-type="['string']"
                        @value-changed="
                            $event === undefined
                                ? (curAddingDev.addr = 0)
                                : (curAddingDev.addr = +$event)
                        "
                    />
                    <div class="text-sm">{{ t('newDevAddr') }}</div>
                </div>
                <div
                    v-if="
                        extDevs.find((el) => {
                            if (curAddingDev) {
                                return el.addr === curAddingDev.addr;
                            } else {
                                return false;
                            }
                        }) && curAddingDev.addr
                    "
                    class="rounded-[6px] px-[14px] py-2 bg-[#7D183C85] flex gap-2 items-center"
                >
                    <span
                        v-html="info"
                        class="[&>svg>path]:fill-[#F83068] [&>svg>rect]:fill-[#F83068]"
                    ></span>
                    <div class="w-[20rem] text-sm text-[#F83068]">
                        {{ t('addCurDev.error') }}
                    </div>
                </div>
            </template>
        </ModalWrapper>
        <ModalWrapper
            v-if="isAddingDev"
            :width-class="'w-[42.875rem]'"
            :hideCancel="true"
            :hideClose="true"
            @close="() => {}"
        >
            <template #title-icon>
                <span v-html="spinner"></span>
            </template>
            <template #title>{{ t('adding.title') }}</template>
            <template #content>
                <div
                    v-if="addingStudy === 1"
                    class="text-sm text-[#6CB5D3]"
                >
                    {{ t('adding.text.1') }}
                </div>
                <div
                    v-else-if="addingStudy === 2"
                    class="text-sm text-[#6CB5D3]"
                >
                    {{ t('adding.text.2') }}
                </div>
                <div
                    v-else-if="addingStudy === 3"
                    class="text-sm text-[#6CB5D3]"
                >
                    {{ t('adding.text.3') }}
                </div>
                <div
                    v-else-if="addingStudy === 4"
                    class="text-sm text-[#6CB5D3]"
                >
                    {{ t('adding.text.4') }}
                </div>
                <div
                    v-else-if="addingStudy === 5"
                    class="text-sm text-[#6CB5D3]"
                >
                    {{ t('adding.text.5') }}
                </div>
                <div
                    v-else-if="addingStudy === 6"
                    class="text-sm text-[#6CB5D3]"
                >
                    {{ t('adding.text.6.1') }}{{ fullAddingDev ? fullAddingDev?.index + 1 : ''
                    }}{{ t('adding.text.6.2') }}{{ fullAddingDev?.addr }}{{ t('adding.text.6.3') }}
                </div>
                <div class="w-full h-1 rounded-[16px] bg-[#1C486C] mt-5">
                    <div
                        class="h-full rounded-[16px] bg-[#158EF8] transition-all duration-1000"
                        :class="[
                            { 'w-[16.7%]': addingStudy === 1 },
                            { 'w-[33.4%]': addingStudy === 2 },
                            { 'w-[50%]': addingStudy === 3 },
                            { 'w-[66.7%]': addingStudy === 4 },
                            { 'w-[83.4%]': addingStudy === 5 },
                            { 'w-full': addingStudy === 6 },
                        ]"
                    ></div>
                </div>
            </template>
        </ModalWrapper>
    </div>
</template>

<script lang="ts" setup>
import type { ControllerSettings } from '@/typings/settings';
import SaveButton from '@/components/Ui/SaveButton.vue';
import OutlinedButton from '@/components/Ui/OutlinedButton.vue';
import edit from '@/assets/img/edit.svg?raw';
import EditNGCSettings from '@/components/views/devicesSettings/NgcSettings.vue';
import EditExtDeviceSettings from '@/components/views/devicesSettings/ExtDeviceSettings.vue';
import axios from 'axios';
import type { DeviceAddr } from '@/typings/common';
import ModalWrapper from '@/components/ModalWrapper.vue';
import add from '@/assets/img/add.svg?raw';
import approve from '@/assets/img/approve.svg?raw';
import info from '@/assets/img/info.svg?raw';
import UiInput from '@/components/Ui/UiInput.vue';
import type { Device } from '@/stores';
import draggable from 'vuedraggable';
import IButtonOutIcon from '@/assets/IButtonOutIcon.vue';
import spinner from '@/assets/img/arrow-spinner.svg?raw';
import type { ExtDev } from '@/typings/settings';

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

const indexStore = useIndexStore();

const api = indexStore.getApi().api as axios.AxiosInstance;

const isAborted = indexStore.getApi().isAborted;

const { extDevsList, ngcModbusMode, devices, isAddingDev, extDeviceInInitState } =
    storeToRefs(indexStore);

const fullDevs = computed<
    {
        addr: number;
        type: string;
        interf: [
            | { interf: '1w-gpio'; bus: number }
            | { interf: '1w-rom'; bus: number }
            | { interf: '1w-sens'; bus: number }
            | '1w-gpio'
            | '1w-rom'
            | '1w-sens'
            | 'adc-in'
            | 'bin-in'
            | 'bin-out'
            | 'bin-var'
            | 'int-var'
            | 'mb-var'
            | { interf: 'mb-var'; bus: number }
            | 'pwm-out'
            | 'tim-var',
        ];
        state: 'on' | 'off' | 'init' | 'no-conn' | 'error';
        serial: string;
        version: string;
        index?: number;
    }[]
>(() => {
    if (extDevsList.value) {
        const arr: {
            addr: number;
            type: string;
            interf: [
                | { interf: '1w-gpio'; bus: number }
                | { interf: '1w-rom'; bus: number }
                | { interf: '1w-sens'; bus: number }
                | '1w-gpio'
                | '1w-rom'
                | '1w-sens'
                | 'adc-in'
                | 'bin-in'
                | 'bin-out'
                | 'bin-var'
                | 'int-var'
                | 'mb-var'
                | { interf: 'mb-var'; bus: number }
                | 'pwm-out'
                | 'tim-var',
            ];
            state: 'on' | 'off' | 'init' | 'no-conn' | 'error';
            serial: string;
            version: string;
            index?: number;
        }[] = [];
        devices.value.forEach((d: Device) => {
            if (!arr.find((el) => el.serial === d.serial)) arr.push(d);
        });
        extDevsList.value.forEach((d: ExtDev) => {
            if (!arr.find((el) => el.serial === d.serial))
                arr.push(
                    d as {
                        addr: number;
                        type: string;
                        interf: [
                            | { interf: '1w-gpio'; bus: number }
                            | { interf: '1w-rom'; bus: number }
                            | { interf: '1w-sens'; bus: number }
                            | '1w-gpio'
                            | '1w-rom'
                            | '1w-sens'
                            | 'adc-in'
                            | 'bin-in'
                            | 'bin-out'
                            | 'bin-var'
                            | 'int-var'
                            | 'mb-var'
                            | { interf: 'mb-var'; bus: number }
                            | 'pwm-out'
                            | 'tim-var',
                        ];
                        state: 'on' | 'off' | 'init' | 'no-conn' | 'error';
                        serial: string;
                        version: string;
                        index?: number;
                    },
                );
        });
        return [
            ...arr.filter((el) => {
                return el.state !== 'on' || (el.state === 'on' && el.interf);
            }),
        ];
    } else {
        return [...devices.value] as {
            addr: number;
            type: string;
            interf: [
                | { interf: '1w-gpio'; bus: number }
                | { interf: '1w-rom'; bus: number }
                | { interf: '1w-sens'; bus: number }
                | '1w-gpio'
                | '1w-rom'
                | '1w-sens'
                | 'adc-in'
                | 'bin-in'
                | 'bin-out'
                | 'bin-var'
                | 'int-var'
                | 'mb-var'
                | { interf: 'mb-var'; bus: number }
                | 'pwm-out'
                | 'tim-var',
            ];
            state: 'on' | 'off' | 'init' | 'no-conn' | 'error';
            serial: string;
            version: string;
            index?: number;
        }[];
    }
});

const controllerSettings = ref<ControllerSettings>();

const isSaving = ref(false);

const saveTrigger = ref(0);

const activeDeviceAddr = useStorage<DeviceAddr>('devicesSettings.activeDeviceAddr', 0, undefined, {
    mergeDefaults: (val: any) => {
        const parsed = parseInt(val, 10);
        if (!Number.isNaN(parsed) && parsed >= 0 && parsed <= 247) {
            return parsed as DeviceAddr;
        }
        return 0;
    },
});

const activeIndex = computed(() => {
    const index = extDevsList.value?.find((el: ExtDev) => el.addr === activeDeviceAddr.value)
        ?.index;
    return index || 0;
});

const needToSave = ref(false);

const isSaveButtonDisabled = computed(() => isSaving.value || !needToSave.value);

const activeExtDevice = computed(() => {
    if (activeDeviceAddr.value === 0 || !extDevsList.value) return undefined;
    return extDevsList.value.find((d: ExtDev) => d.addr === activeDeviceAddr.value);
});

const isModalOpen = ref(false);

const startAddr = ref('');

const endAddr = ref('');

const isScanning = ref(false);

const scanDevs = ref<Device[]>();

const devNum = ref(0);

let devsTimer: ReturnType<typeof setTimeout> | undefined;

const hoveredItem = ref(-1);

const deletingDev = ref<{
    addr: number;
    type: string;
    interf: [
        | { interf: '1w-gpio'; bus: number }
        | { interf: '1w-rom'; bus: number }
        | { interf: '1w-sens'; bus: number }
        | '1w-gpio'
        | '1w-rom'
        | '1w-sens'
        | 'adc-in'
        | 'bin-in'
        | 'bin-out'
        | 'bin-var'
        | 'int-var'
        | 'mb-var'
        | { interf: 'mb-var'; bus: number }
        | 'pwm-out'
        | 'tim-var',
    ];
    state: 'on' | 'off' | 'init' | 'no-conn' | 'error';
    serial: string;
    version: string;
    index: number;
}>();

const isDeleting = ref(false);

const addingDev = ref<{
    addr: number;
    type: string;
    state: 'on' | 'off' | 'init' | 'no-conn' | 'error';
    index: number;
    initAddr: number;
}>();

const curAddingDev = ref<{
    addr: number;
    type: string;
    state: 'on' | 'off' | 'init' | 'no-conn' | 'error';
    index: number;
    initAddr: number;
}>();

const fullAddingDev = ref<{
    addr: number;
    type: string;
    state: 'on' | 'off' | 'init' | 'no-conn' | 'error';
    index: number;
    initAddr: number;
}>();

const addingStudy = ref(0);

const isInit = ref(false);

const extDevs = ref<
    {
        addr: number;
        type: string;
        interf: [
            | { interf: '1w-gpio'; bus: number }
            | { interf: '1w-rom'; bus: number }
            | { interf: '1w-sens'; bus: number }
            | '1w-gpio'
            | '1w-rom'
            | '1w-sens'
            | 'adc-in'
            | 'bin-in'
            | 'bin-out'
            | 'bin-var'
            | 'int-var'
            | 'mb-var'
            | { interf: 'mb-var'; bus: number }
            | 'pwm-out'
            | 'tim-var',
        ];
        state: 'on' | 'off' | 'init' | 'no-conn' | 'error';
        serial: string;
        version: string;
        index?: number;
    }[]
>([]);

watch(
    extDevsList,
    () => {
        if (!extDevsList.value || activeDeviceAddr.value === 0) return;
        if (!extDevsList.value.find((d: ExtDev) => d.addr === activeDeviceAddr.value)) {
            console.log('goToNgc');
            activeDeviceAddr.value = 0;
        }
    },
    { immediate: true },
);

function save() {
    saveTrigger.value += 1;
}

function handleMouseEnter(serial: number) {
    hoveredItem.value = serial;
}

function handleMouseLeave() {
    hoveredItem.value = -1;
}

const originalList = ref('');
const futureList = ref('');
const originalIndex = ref(0);
const futureIndex = ref(0);
const movingItem = ref<Device | null>(null);
const futureItem = ref<Device | null>(null);

function handleDragEndItem() {
    if (originalList.value !== futureList.value && scanDevs.value) {
        movingItem.value = scanDevs.value[originalIndex.value];
        futureItem.value = extDevs.value[futureIndex.value];
        if (movingItem.value && futureItem.value) {
            curAddingDev.value = {
                addr: movingItem.value.addr,
                initAddr: movingItem.value.addr,
                index: futureIndex.value,
                type: movingItem.value.type,
                state: movingItem.value.state || 'on',
            };
        }
    }
    document
        .querySelectorAll('.list-group-item')
        .forEach((el) => el.classList.remove('bg-[#0C2F4D]'));
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
    if (extDevs.value[futureIndex.value]) {
        event.to.children[futureIndex.value].classList.add('bg-[#0C2F4D]');
    }
    return false;
}

function handleDregStartItem() {
    document
        .querySelectorAll('.list-group-item')
        .forEach((el) => el.classList.remove('exclude-this-item'));
}

const { t } = useI18n({
    messages: {
        en: {
            selectDevice: 'Select device',
            modalTitle: 'Expansion device management',
            close: 'Close',
            start: 'Start',
            startAddr: 'Starting address:',
            endAddr: 'End address:',
            errors: {
                length: 'Enter a value from 1 to 247',
                val: 'The start address may be less than or equal to the end address',
            },
            scanning: 'Scanning',
            columnsNames: {
                type: 'Type',
                id: 'Expansion device ID',
                addr: 'Address',
                status: 'Status',
            },
            cancel: 'Back',
            delete: 'Delete',
            noDevs: 'No expansion devices detected',
            added: 'added',
            manualAdd: 'Add expansion device manually',
            confirm: {
                title: 'Confirmation',
                text: 'Are you sure you want to remove the expansion device?',
                attention:
                    'Attention! Created Modbus functions and variables associated with this device will remain in NGC memory.',
                status: 'Status: ',
                noConnection: 'no connection',
                init: 'initialization',
                error: 'error',
                on: 'on',
                off: 'off',
                addr: 'Address: ',
                firmWare: 'Firmware: ',
            },
            accept: 'Accept',
            newDevAddr: 'New device address',
            addCurDev: {
                error: 'Attention. An expansion device with this address is already written to memory.',
            },
            adding: {
                title: 'Device is being added',
                text: {
                    1: 'Adding a device with the current address',
                    2: 'First initialization',
                    3: 'Assigning a new address to a device',
                    4: 'Adding a device with a new address',
                    5: 'Final initialization',
                    6: {
                        1: 'Adding IO ',
                        2: ' with address ',
                        3: ' completed successfully',
                    },
                },
                fields: {
                    addr: 'Device address',
                    type: 'Device type',
                    state: 'State',
                },
                on: 'ON',
                off: 'OFF',
                error: 'A device with the same address already exists',
                notAvailable: 'Device not available for adding',
            },
            add: 'Add',
            addDevice: 'Add device ',
        },
        ru: {
            selectDevice: 'Выбор устройства',
            modalTitle: 'Управление устройствами расширения',
            close: 'Закрыть',
            start: 'Запуск',
            startAddr: 'Начальный адрес:',
            endAddr: 'Конечный адрес:',
            errors: {
                length: 'Введите значение от 1 до 247',
                val: 'Начальный адрес может быть меньше либо равен конечному адресу',
            },
            scanning: 'Сканирование',
            columnsNames: {
                type: 'Тип',
                id: 'ID устройства расширения',
                addr: 'Адрес',
                status: 'Статус',
            },
            cancel: 'Назад',
            delete: 'Удалить',
            noDevs: 'Устройства расширения не обнаружены',
            added: 'добавлено',
            manualAdd: 'Добавить устройство расширения вручную',
            confirm: {
                title: 'Подтверждение',
                text: 'Вы действительно хотите удалить устройство расширения?',
                attention:
                    'Внимание! Созданные функции и переменные Modbus, связанные с этим устройством, останутся в памяти NGC.',
                status: 'Статус: ',
                noConnection: 'нет соединения',
                init: 'инициализация',
                error: 'ошибка',
                on: 'включено',
                off: 'выключено',
                addr: 'Адрес: ',
                firmWare: 'Прошивка: ',
            },
            accept: 'Принять',
            newDevAddr: 'Новый адрес устройства',
            addCurDev: {
                error: 'Внимание. Устройство расширения с таким адресом уже записано в память.',
            },
            adding: {
                title: 'Идет добавление устройства',
                text: {
                    1: 'Добавление устройства с текущим адресом',
                    2: 'Первичная инициализация',
                    3: 'Назначение нового адреса устройству',
                    4: 'Добавление устройства с новым адресом',
                    5: 'Финальная инициализация',
                    6: {
                        1: 'Добавление IO ',
                        2: ' с адресом ',
                        3: ' успешно завершено',
                    },
                },
                fields: {
                    addr: 'Адрес устройства',
                    type: 'Тип устройства',
                    state: 'Состояние',
                },
                on: 'ВКЛ',
                off: 'ВЫКЛ',
                error: 'Устройство с таким адресом уже существует',
                notAvailable: 'Устройство недоступно для добавления',
            },
            add: 'Добавить',
            addDevice: 'Добавить устройство ',
        },
    },
});

async function getConfig() {
    try {
        const r = await api.get<ControllerSettings>('get_config');
        controllerSettings.value = r.data;
        indexStore.setNGCModbusMode(r.data['rs-485'][0]?.mode || 'off');
    } catch (error) {
        if (isAborted.value) {
            return;
        }
        setTimeout(() => {
            getConfig();
        }, 20);
    }
}

async function scan() {
    isScanning.value = true;
    try {
        clearTimeout(devsTimer);
        devsTimer = undefined;
        const r = await api.post('scan_ext_devs', {
            'start-addr': +startAddr.value,
            'stop-addr': +endAddr.value,
        });
        scanDevs.value = r.data.list;
        setExtDevs();
    } catch (error) {
        if (isAborted.value) {
            return;
        }
        setTimeout(() => {
            scan();
        }, 20);
    } finally {
        isScanning.value = false;
    }
}

async function getDevNum() {
    try {
        const r = await api.post('get_dev_capab', {
            device: 0,
        });
        devNum.value = r.data['ext-dev'];
    } catch (error) {
        if (isAborted.value) {
            return;
        }
        setTimeout(() => {
            getDevNum();
        }, 20);
    }
}

function setExtDevs() {
    const elem = {
        addr: 0,
        type: '',
        interf: [],
        state: 'off',
        serial: '',
        version: '',
    };
    const arr = Array(devNum.value);
    if (extDevsList.value) {
        extDevsList.value.forEach((el: ExtDev) => {
            arr[el.index - 1] = el;
        });
    }
    for (let i = 0; i < arr.length; i++) {
        if (!arr[i]) arr[i] = elem;
    }
    extDevs.value = [...arr];
    devsTimer = setTimeout(setExtDevs, 200);
}

async function changeDevStatus(addr: number, status: 'on' | 'off') {
    try {
        const list = (await (await api.get('get_ext_devs')).data).list as Device[];
        const index = list.findIndex((el) => el.addr === addr);
        if (index !== -1) {
            const el = list[index];
            el.state = status === 'on' ? 'off' : 'on';
        }
        await api.post('set_ext_devs', {
            list: list,
        });
        indexStore.setDevicesToInitState();
        indexStore.setDevicesStateToInitState();
        indexStore.setOWIdsToInitState();
        indexStore.setCalibrValsToInitState();
        indexStore.setMbDevsToInitState();
        indexStore.setNeedToReqData(true);
        indexStore.toggleDevice(0);
    } catch (error) {
        if (isAborted.value) {
            return;
        }
        setTimeout(() => {
            changeDevStatus(addr, status);
        }, 10);
    }
}

async function getExtList() {
    try {
        if (deletingDev.value) {
            isDeleting.value = true;
        }
        const list = (await (await api.get('get_ext_devs')).data).list as Device[];
        const newList: (Device | { type: 'none' })[] = [...list];
        if (deletingDev.value) {
            newList[deletingDev.value.index - 1] = { type: 'none' };
        } else if (addingStudy.value === 4 && fullAddingDev.value) {
            newList[fullAddingDev.value.index] = {
                addr: fullAddingDev.value.addr,
                type: fullAddingDev.value.type,
                state: fullAddingDev.value.state || 'on',
            } as Device;
        } else if (addingStudy.value === 1 && fullAddingDev.value) {
            newList[fullAddingDev.value.index] = {
                addr: fullAddingDev.value.initAddr,
                type: fullAddingDev.value.type,
                state: fullAddingDev.value.state || 'on',
            } as Device;
        }
        setExtList(newList);
    } catch (error) {
        if (isAborted.value) {
            return;
        }
        setTimeout(() => {
            getExtList();
        }, 10);
    }
}

async function setExtList(list: (Device | { type: 'none' })[]) {
    if (!deletingDev.value && !addingStudy.value) {
        isDeleting.value = false;
        return;
    }
    try {
        const r = await api.post('set_ext_devs', {
            list: list,
        });
        if (r.status === 200) {
            indexStore.setDevicesToInitState();
            indexStore.setDevicesStateToInitState();
            indexStore.setOWIdsToInitState();
            indexStore.setCalibrValsToInitState();
            indexStore.setMbDevsToInitState();
            indexStore.setNeedToReqData(true);
            indexStore.toggleDevice(0);
        }
        if (deletingDev.value) {
            isDeleting.value = false;
            deletingDev.value = undefined;
        } else if (addingStudy.value === 4) {
            addingStudy.value = 5;
        } else if (addingStudy.value === 1) {
            addingStudy.value = 2;
        }
    } catch (error) {
        if (isAborted.value) {
            isDeleting.value = false;
            return;
        }
        setTimeout(() => {
            setExtList(list);
        }, 10);
    }
}

function addNewExtDev() {
    indexStore.setIsAddingDev(true);
    if (!curAddingDev.value && !addingDev.value) return;
    fullAddingDev.value = {
        addr: curAddingDev.value ? curAddingDev.value.addr : (addingDev.value?.addr as number),
        type: curAddingDev.value ? curAddingDev.value.type : (addingDev.value?.type as string),
        state: curAddingDev.value
            ? curAddingDev.value.state
            : (addingDev.value?.state as 'on' | 'off' | 'init' | 'no-conn' | 'error'),
        index: curAddingDev.value ? curAddingDev.value.index : (addingDev.value?.index as number),
        initAddr: curAddingDev.value
            ? curAddingDev.value.initAddr
            : (addingDev.value?.initAddr as number),
    };
    if (!fullAddingDev.value) return;
    if (fullAddingDev.value.addr === fullAddingDev.value.initAddr) {
        addingStudy.value = 4;
        curAddingDev.value = undefined;
        addingDev.value = undefined;
        getExtList();
    } else {
        addingStudy.value = 1;
        curAddingDev.value = undefined;
        addingDev.value = undefined;
        getExtList();
    }
}

async function getExtConfig() {
    if (!fullAddingDev.value) return;
    try {
        const r = await api.post(
            'get_ext_cfg',
            {
                device: fullAddingDev.value.index + 1,
            },
            { timeout: 60000 },
        );
        setExtConfig(r.data['mb-slave']);
    } catch (error) {
        if (isAborted.value) {
            isDeleting.value = false;
            return;
        }
        setTimeout(() => {
            getExtConfig();
        }, 10);
    }
}

async function setExtConfig(obj: {
    addr: number;
    rate: number;
    parity: 'none' | 'even' | 'odd';
    stop: 1 | 2;
}) {
    if (!fullAddingDev.value) return;
    try {
        const r = await api.post(
            'set_ext_cfg',
            {
                device: fullAddingDev.value.index + 1,
                'mb-slave': {
                    addr: fullAddingDev.value.addr,
                    rate: obj.rate,
                    parity: obj.parity,
                    stop: obj.stop,
                },
            },
            { timeout: 60000 },
        );
        if (r.status === 200) {
            addingStudy.value = 4;
            getExtList();
        }
    } catch (error) {
        if (isAborted.value) {
            isDeleting.value = false;
            return;
        }
        setTimeout(() => {
            setExtConfig(obj);
        }, 10);
    }
}

watch(extDeviceInInitState, () => {
    if (
        (addingStudy.value === 2 || addingStudy.value === 5) &&
        fullAddingDev.value &&
        extDeviceInInitState.value === fullAddingDev.value.addr
    ) {
        isInit.value = true;
    } else if (
        (addingStudy.value === 2 || addingStudy.value === 5) &&
        fullAddingDev.value &&
        extDeviceInInitState.value !== fullAddingDev.value.addr
    ) {
        isInit.value = false;
        if (addingStudy.value === 5) {
            addingStudy.value = 6;
            setTimeout(() => {
                addingStudy.value = 0;
                indexStore.setIsAddingDev(false);
                scanDevs.value = undefined;
                startAddr.value = '';
                endAddr.value = '';
            }, 3000);
        } else {
            addingStudy.value = 3;
            getExtConfig();
        }
    }
});

onBeforeMount(() => {
    getDevNum();
});

onMounted(async () => {
    try {
        await getConfig();
    } catch (error) {
        console.error(error);
    }
    setExtDevs();
});

onBeforeUnmount(() => {
    clearTimeout(devsTimer);
    devsTimer = undefined;
});
</script>
