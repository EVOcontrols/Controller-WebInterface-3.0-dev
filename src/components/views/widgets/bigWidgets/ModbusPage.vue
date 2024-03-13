<template>
    <div class="flex-1 relative w-full overflow-hidden">
        <div
            v-if="showDeviceLabel"
            class="absolute bg-[#1B4569] rounded-[6px] h-10 px-3 top-[41px] flex items-center z-[1]"
            :style="[{ width: 'fit-content' }, { left: deviceLabelLeft + 'px' }]"
        >
            {{ curMbDevLabels[showDeviceLabelNum - 1] || '\u2013' }}
        </div>
        <div
            class="relative h-[45px] flex items-center px-3 font-medium w-full overflow-hidden border-b-[2px] border-[#1D4162]"
        >
            <div class="flex whitespace-nowrap w-full flex-none">
                <div class="flex flex-1 overflow-hidden w-full flex-none">
                    <ArrowIcon
                        v-if="!isStartScrollEl"
                        class="absolute top-[50%] translate-y-[-50%] rotate-180 left-[6px] cursor-pointer"
                        :class="{ disabled: notConnected }"
                        @click="handleArrowClick('toStart')"
                    />
                    <div class="flex overflow-x-hidden ml-2 bg-113 pl-2 pr-1 rounded-l-lg w-full">
                        <div
                            v-dragscroll.x
                            v-on:dragscrollmove="handleScrollMove"
                            class="flex items-center overflow-x-auto no-scrollbar w-full flex-none"
                            ref="scrollWrapper"
                        >
                            <div
                                class="flex items-center flex-none"
                                ref="scrollEl"
                            >
                                <div
                                    v-for="device in curDevs"
                                    :key="device"
                                    class="device h-6 min-w-[4rem] flex items-center mr-[6px] rounded text-0.81 font-roboto text-[#ADEBFF] cursor-pointer transition-all duration-300 justify-center select-none"
                                    :class="
                                        curChoosenDevs.includes(device)
                                            ? 'bg-[#148ef8]'
                                            : 'bg-[#1B4569] hover:bg-[#143959]'
                                    "
                                    @mousedown="mousedown"
                                    @mouseup="mouseup(device, $event)"
                                    @mouseenter="(e) => handleDeviceEnter(device, e as MouseEvent)"
                                    @mouseleave="handleDeviceLeave"
                                >
                                    {{ device }}
                                </div>
                            </div>
                        </div>
                    </div>
                    <ArrowIcon
                        v-if="!isEndScrollEl"
                        class="h-full cursor-pointer mr-[6px]"
                        :class="{ disabled: notConnected }"
                        @click="handleArrowClick('toEnd')"
                    />
                    <div class="flex gap-[6px] mr-[18px] ml-[6px]">
                        <AddIcon
                            class="cursor-pointer w-[50px] h-6 rounded-[3px] border border-[#148EF8] py-1 active:bg-[#148EF8]"
                            :class="{ disabled: notConnected }"
                        />
                        <UpdateIcon
                            class="cursor-pointer w-[50px] h-6 rounded-[3px] border border-[#148EF8] py-1 active:bg-[#148EF8]"
                            :class="{ disabled: notConnected }"
                            @click="updateItem"
                        />
                    </div>
                </div>
            </div>
        </div>
        <div class="w-full h-full flex">
            <div class="w-[58%] h-full">
                <div class="flex overflow-y-hidden rounded-l-lg w-full">
                    <div
                        v-dragscroll.y
                        class="flex overflow-y-auto w-full scrollbar-4 flex-1 flex-col"
                        :style="{ height: 'calc(100vh - 460px)' }"
                    >
                        <div class="flex flex-col items-center flex-none w-full">
                            <div
                                class="w-full h-[50px] border-y border-[#1D4162] pl-5 pt-5 sticky top-0 bg-[#092740] text-base font-semibold"
                            >
                                Discrete inputs
                            </div>
                            <div
                                class="w-full flex text-[#6CB5D3] items-center transition-colors duration-500 select-none pt-5 flex flex-col"
                                v-for="(s, index) in diArr"
                                :key="index"
                            >
                                <div class="w-full h-[25px] text-sm flex text-[13px] gap-2">
                                    <div
                                        class="bg-[#1B4569] h-full min-w-[44px] px-[10px] pt-1 rounded-r flex justify-center text-[#8DC5F6]"
                                    >
                                        {{ s.dev }}
                                    </div>
                                    <div class="text-[#ADEBFF] pt-1">
                                        {{ curMbDevLabels[s.dev - 1] }}
                                    </div>
                                </div>
                                <div class="w-full flex mt-3 mb-[18px] gap-1 px-[18px]">
                                    <div
                                        class="w-[90px] h-10 flex items-center justify-between text-[#35FED0] text-xs rounded px-[6px]"
                                        :class="el.val ? 'bg-[#176F6F]' : 'bg-[#0D424D]'"
                                        v-for="(el, i) in s.vals"
                                        :key="i"
                                    >
                                        <span>RO</span>
                                        <span>{{
                                            curNumberingSystem === 'dec'
                                                ? el.reg_addr
                                                : el.reg_addr.toString(16)
                                        }}</span>
                                    </div>
                                    <AddIcon
                                        class="cursor-pointer w-[90px] h-10 rounded-[3px] border border-[#148EF8] py-[10px] active:bg-[#148EF8]"
                                        :class="{ disabled: notConnected }"
                                    />
                                </div>
                            </div>
                        </div>
                        <div class="flex flex-col items-center flex-none w-full">
                            <div
                                class="w-full h-[50px] border-y border-[#1D4162] pl-5 pt-5 sticky top-0 bg-[#092740] text-base font-semibold"
                            >
                                Coils
                            </div>
                            <div
                                class="w-full flex text-[#6CB5D3] items-center transition-colors duration-500 select-none pt-5 flex flex-col"
                                v-for="(s, index) in coilArr"
                                :key="index"
                            >
                                <div class="w-full h-[25px] text-sm flex text-[13px] gap-2">
                                    <div
                                        class="bg-[#1B4569] h-full min-w-[44px] px-[10px] pt-1 rounded-r flex justify-center text-[#8DC5F6]"
                                    >
                                        {{ s.dev }}
                                    </div>
                                    <div class="text-[#ADEBFF] pt-1">
                                        {{ curMbDevLabels[s.dev - 1] }}
                                    </div>
                                </div>
                                <div class="w-full flex mt-3 mb-[18px] gap-1 px-[18px]">
                                    <div
                                        class="w-[90px] h-10 flex items-center justify-between text-[#35FED0] text-xs rounded px-[6px] cursor-pointer"
                                        :class="el.val ? 'bg-[#176F6F]' : 'bg-[#0D424D]'"
                                        v-for="(el, i) in s.vals"
                                        :key="i"
                                        @click="handleCoilClick(el)"
                                    >
                                        <div class="flex flex-col justify-end gap-[6px]">
                                            <div class="h-[12px]"></div>
                                            <div class="h-[12px]">RW</div>
                                        </div>
                                        <div class="flex flex-col items-end justify-end gap-[6px]">
                                            <div class="h-[12px] text-[#97FFE7]">
                                                {{ el.val ? t('on') : t('off') }}
                                            </div>
                                            <div class="h-[12px]">
                                                {{
                                                    curNumberingSystem === 'dec'
                                                        ? el.reg_addr
                                                        : el.reg_addr.toString(16)
                                                }}
                                            </div>
                                        </div>
                                    </div>
                                    <AddIcon
                                        class="cursor-pointer w-[90px] h-10 rounded-[3px] border border-[#148EF8] py-[10px] active:bg-[#148EF8]"
                                        :class="{ disabled: notConnected }"
                                    />
                                </div>
                            </div>
                        </div>
                        <div class="flex flex-col items-center flex-none w-full">
                            <div
                                class="w-full h-[50px] border-y border-[#1D4162] pl-5 pt-5 sticky top-0 bg-[#092740] text-base font-semibold"
                            >
                                Input registers
                            </div>
                            <div
                                class="w-full flex text-[#6CB5D3] items-center transition-colors duration-500 select-none pt-5 flex flex-col"
                                v-for="(s, index) in irArr"
                                :key="index"
                            >
                                <div class="w-full h-[25px] text-sm flex text-[13px] gap-2">
                                    <div
                                        class="bg-[#1B4569] h-full min-w-[44px] px-[10px] pt-1 rounded-r flex justify-center text-[#8DC5F6]"
                                    >
                                        {{ s.dev }}
                                    </div>
                                    <div class="text-[#ADEBFF] pt-1">
                                        {{ curMbDevLabels[s.dev - 1] }}
                                    </div>
                                </div>
                                <div class="w-full flex mt-3 mb-[18px] gap-1 px-[18px]">
                                    <div
                                        class="w-[90px] h-10 flex items-center justify-between text-[#35FED0] text-xs rounded px-[6px] bg-[#006B83]"
                                        v-for="(el, i) in s.vals"
                                        :key="i"
                                    >
                                        <div class="flex flex-col justify-end gap-[6px]">
                                            <div class="h-[12px]"></div>
                                            <div class="h-[12px] text-[#01F0FF]">RO</div>
                                        </div>
                                        <div class="flex flex-col items-end justify-end gap-[6px]">
                                            <div class="h-[12px] text-[#9BE7FF]">
                                                {{
                                                    curNumberingSystem === 'dec'
                                                        ? el.val
                                                        : el.val.toString(16)
                                                }}
                                            </div>
                                            <div class="h-[12px] text-[#01F0FF]">
                                                {{
                                                    curNumberingSystem === 'dec'
                                                        ? el.reg_addr
                                                        : el.reg_addr.toString(16)
                                                }}
                                            </div>
                                        </div>
                                    </div>
                                    <AddIcon
                                        class="cursor-pointer w-[90px] h-10 rounded-[3px] border border-[#148EF8] py-[10px] active:bg-[#148EF8]"
                                        :class="{ disabled: notConnected }"
                                    />
                                </div>
                            </div>
                        </div>
                        <div class="flex flex-col items-center flex-none w-full">
                            <div
                                class="w-full h-[50px] border-y border-[#1D4162] pl-5 pt-5 sticky top-0 bg-[#092740] text-base font-semibold"
                            >
                                Holding registers
                            </div>
                            <div
                                class="w-full flex text-[#6CB5D3] items-center transition-colors duration-500 select-none pt-5 flex flex-col"
                                v-for="(s, index) in hrArr"
                                :key="index"
                            >
                                <div class="w-full h-[25px] text-sm flex text-[13px] gap-2">
                                    <div
                                        class="bg-[#1B4569] h-full min-w-[44px] px-[10px] pt-1 rounded-r flex justify-center text-[#8DC5F6]"
                                    >
                                        {{ s.dev }}
                                    </div>
                                    <div class="text-[#ADEBFF] pt-1">
                                        {{ curMbDevLabels[s.dev - 1] }}
                                    </div>
                                </div>
                                <div class="w-full flex mt-3 mb-[18px] gap-1 px-[18px]">
                                    <div
                                        class="w-[90px] h-10 flex items-center justify-between text-[#35FED0] text-xs rounded px-[6px] bg-[#006B83]"
                                        v-for="(el, i) in s.vals"
                                        :key="i"
                                    >
                                        <div class="flex flex-col justify-end gap-[6px]">
                                            <div class="h-[12px]"></div>
                                            <div class="h-[12px] text-[#01F0FF]">RW</div>
                                        </div>
                                        <div class="flex flex-col items-end justify-end gap-[6px]">
                                            <div class="h-[12px] text-[#9BE7FF]">
                                                {{
                                                    curNumberingSystem === 'dec'
                                                        ? el.val
                                                        : el.val.toString(16)
                                                }}
                                            </div>
                                            <div class="h-[12px] text-[#01F0FF]">
                                                {{
                                                    curNumberingSystem === 'dec'
                                                        ? el.reg_addr
                                                        : el.reg_addr.toString(16)
                                                }}
                                            </div>
                                        </div>
                                    </div>
                                    <AddIcon
                                        class="cursor-pointer w-[90px] h-10 rounded-[3px] border border-[#148EF8] py-[10px] active:bg-[#148EF8]"
                                        :class="{ disabled: notConnected }"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="w-[42%] h-full border-l border-[#1D4162]">
                <div class="flex overflow-y-hidden rounded-l-lg w-full">
                    <div
                        v-dragscroll.y
                        class="flex overflow-y-auto w-full scrollbar-4 flex-1 flex-col relative"
                        :style="{ height: 'calc(100vh - 460px)' }"
                    >
                        <div class="flex flex-col items-center flex-none w-full">
                            <div
                                v-if="showTableDeviceLabel"
                                class="absolute bg-[#1B4569] rounded-[6px] p-3 flex items-center z-[1] max-w-[192px] shadow-[0_0_11px_0_rgba(27,69,105,1)]"
                                :style="[
                                    { width: 'fit-content' },
                                    { left: deviceTableLabelLeft + 'px' },
                                    { top: deviceTableLabelTop + 'px' },
                                ]"
                            >
                                {{ curMbDevLabels[showTableDeviceLabelNum - 1] || '\u2013' }}
                            </div>
                            <div
                                class="w-full h-[70px] border-y border-[#1D4162] text-sm pl-[18px] pt-[12px] sticky top-0 bg-[#092740] flex flex-col"
                            >
                                <div class="text-base mb-1 font-semibold">Discrete inputs</div>
                                <div class="flex gap-5 pr-10 text-[13px]">
                                    <div class="flex-1">{{ t('columnsNames.name') }}</div>
                                    <div class="w-[50px]">{{ t('columnsNames.device') }}</div>
                                    <div class="w-[50px]">{{ t('columnsNames.reg') }}</div>
                                    <div class="w-[50px]">{{ t('columnsNames.status') }}</div>
                                </div>
                            </div>
                            <div
                                class="w-full flex flex-col text-[#6CB5D3] items-center px-2"
                                v-for="(s, index) in diArr"
                                :key="index"
                            >
                                <div
                                    class="label group w-full text-[#6CB5D3] select-none"
                                    v-for="(el, i) in s.vals"
                                    :key="i"
                                    @dblclick="handleDblClick(el, i)"
                                >
                                    <div
                                        v-if="
                                            activeLabel?.i === i &&
                                            JSON.stringify(activeLabel.state) === JSON.stringify(el)
                                        "
                                        class="activeLabel h-[68px] bg-[#092E4B] -ml-2 pl-4 pr-[18px] flex items-center justify-center"
                                        :style="{ width: 'calc(100% + 16px)' }"
                                    >
                                        <input
                                            class="w-full h-9 bg-[#183A58] rounded-[6px] px-[14px]"
                                            type="text"
                                            :value="String(activeLabelInputVal)"
                                            @input="(event) => handleInput(event as InputEvent)"
                                        />
                                    </div>
                                    <div
                                        v-else
                                        class="h-[30px] flex items-center pl-[10px] pr-2 hover:bg-[#0C2F4D] transition-colors duration-500 rounded"
                                    >
                                        <div class="flex-1">Название регистра</div>
                                        <div
                                            class="w-[50px] ml-5 flex justify-end text-[#ADEBFF] hover:text-[#58B1FF] transition-colors duration-500"
                                            @mouseenter="
                                                (e) =>
                                                    handleTableDeviceEnter(s.dev, e as MouseEvent)
                                            "
                                            @mouseleave="handleTableDeviceLeave"
                                        >
                                            {{ el.dev_addr }}
                                        </div>
                                        <div class="w-[50px] ml-5 flex justify-end text-[#ADEBFF]">
                                            {{
                                                curNumberingSystem === 'dec'
                                                    ? el.reg_addr
                                                    : el.reg_addr.toString(16)
                                            }}
                                        </div>
                                        <div class="w-[50px] ml-5 mr-3 flex justify-end">
                                            <div
                                                class="w-[9px] h-[9px] rounded-[2px]"
                                                :class="
                                                    notConnected
                                                        ? 'bg-[#193E60]'
                                                        : el.val
                                                        ? 'bg-[#35FED0]'
                                                        : 'bg-[#176F6F]'
                                                "
                                            ></div>
                                        </div>
                                        <CloseIcon
                                            class="label-close cursor-pointer"
                                            @click="deleteItem(el)"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="flex flex-col items-center flex-none w-full">
                            <div
                                class="w-full h-[70px] border-y border-[#1D4162] text-sm pl-[18px] pt-[12px] sticky top-0 bg-[#092740] flex flex-col"
                            >
                                <div class="text-base mb-1 font-semibold">Coils</div>
                                <div class="flex gap-5 pr-10 text-[13px]">
                                    <div class="flex-1">{{ t('columnsNames.name') }}</div>
                                    <div class="w-[50px]">{{ t('columnsNames.device') }}</div>
                                    <div class="w-[50px]">{{ t('columnsNames.reg') }}</div>
                                    <div class="w-[50px]">{{ t('columnsNames.status') }}</div>
                                </div>
                            </div>
                            <div
                                class="w-full flex flex-col text-[#6CB5D3] items-center px-2"
                                v-for="(s, index) in coilArr"
                                :key="index"
                            >
                                <div
                                    class="label group w-full text-[#6CB5D3] select-none"
                                    v-for="(el, i) in s.vals"
                                    :key="i"
                                    @dblclick="handleDblClick(el, i)"
                                >
                                    <div
                                        v-if="
                                            activeLabel?.i === i &&
                                            JSON.stringify(activeLabel.state) === JSON.stringify(el)
                                        "
                                        class="activeLabel h-[68px] bg-[#092E4B] -ml-2 pl-4 pr-[18px] flex items-center justify-center flex gap-2"
                                        :style="{ width: 'calc(100% + 16px)' }"
                                    >
                                        <input
                                            class="flex-1 h-9 bg-[#183A58] rounded-[6px] px-[14px]"
                                            type="text"
                                            :value="String(activeLabelInputVal)"
                                            @input="(event) => handleInput(event as InputEvent)"
                                        />
                                        <div
                                            class="h-9 pl-[10px] w-[88px] rounded-[6px] flex items-center justify-start gap-[6px] bg-[#0D424D] text-xs"
                                        >
                                            <IButtonOutIcon
                                                class="cursor-pointer"
                                                :isHovered="
                                                    hoveredBinOutItem?.i === i &&
                                                    JSON.stringify(hoveredBinOutItem.state) ===
                                                        JSON.stringify(el)
                                                "
                                                :isActive="!!el.val"
                                                @mouseenter="handleBinOutMouseEnter(i, el)"
                                                @mouseleave="handleBinOutMouseLeave"
                                                @click="handleCoilClick(el)"
                                            />
                                            {{ el.val ? t('on') : t('off') }}
                                        </div>
                                    </div>
                                    <div
                                        v-else
                                        class="h-[30px] flex items-center pl-[10px] pr-2 hover:bg-[#0C2F4D] transition-colors duration-500 rounded"
                                    >
                                        <div class="flex-1">Название регистра</div>
                                        <div
                                            class="w-[50px] ml-5 flex justify-end text-[#ADEBFF] hover:text-[#58B1FF] transition-colors duration-500"
                                            @mouseenter="
                                                (e) =>
                                                    handleTableDeviceEnter(s.dev, e as MouseEvent)
                                            "
                                            @mouseleave="handleTableDeviceLeave"
                                        >
                                            {{ el.dev_addr }}
                                        </div>
                                        <div class="w-[50px] ml-5 flex justify-end text-[#ADEBFF]">
                                            {{
                                                curNumberingSystem === 'dec'
                                                    ? el.reg_addr
                                                    : el.reg_addr.toString(16)
                                            }}
                                        </div>
                                        <div class="w-[50px] ml-5 mr-3 flex justify-end">
                                            <div
                                                :class="
                                                    notConnected
                                                        ? 'text-[#3E688E]'
                                                        : el.val
                                                        ? 'text-[#35FED0]'
                                                        : 'text-[#176F6F]'
                                                "
                                            >
                                                {{
                                                    notConnected
                                                        ? '\u2013'
                                                        : el.val
                                                        ? t('on')
                                                        : t('off')
                                                }}
                                            </div>
                                        </div>
                                        <CloseIcon
                                            class="label-close cursor-pointer"
                                            @click="deleteItem(el)"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="flex flex-col items-center flex-none w-full">
                            <div
                                class="w-full h-[70px] border-y border-[#1D4162] text-sm pl-[18px] pt-[12px] sticky top-0 bg-[#092740] flex flex-col"
                            >
                                <div class="text-base mb-1 font-semibold">Input registers</div>
                                <div class="flex gap-5 pr-10 text-[13px]">
                                    <div class="flex-1">{{ t('columnsNames.name') }}</div>
                                    <div class="w-[50px]">{{ t('columnsNames.device') }}</div>
                                    <div class="w-[50px]">{{ t('columnsNames.reg') }}</div>
                                    <div class="w-[50px]">{{ t('columnsNames.value') }}</div>
                                </div>
                            </div>
                            <div
                                class="w-full flex flex-col text-[#6CB5D3] items-center px-2"
                                v-for="(s, index) in irArr"
                                :key="index"
                            >
                                <div
                                    class="label group w-full text-[#6CB5D3] select-none"
                                    v-for="(el, i) in s.vals"
                                    :key="i"
                                    @dblclick="handleDblClick(el, i)"
                                >
                                    <div
                                        v-if="
                                            activeLabel?.i === i &&
                                            JSON.stringify(activeLabel.state) === JSON.stringify(el)
                                        "
                                        class="activeLabel h-[68px] bg-[#092E4B] -ml-2 pl-4 pr-[28px] flex items-center justify-center flex gap-4"
                                        :style="{ width: 'calc(100% + 16px)' }"
                                    >
                                        <input
                                            class="flex-1 h-9 bg-[#183A58] rounded-[6px] px-[14px]"
                                            type="text"
                                            :value="activeLabelInputVal"
                                            @input="(event) => handleInput(event as InputEvent)"
                                        />
                                        <div class="text-[15px] text-[#01F0FF]">
                                            {{
                                                curNumberingSystem === 'dec'
                                                    ? el.val
                                                    : el.val.toString(16)
                                            }}
                                        </div>
                                    </div>
                                    <div
                                        v-else
                                        class="h-[30px] flex items-center pl-[10px] pr-2 hover:bg-[#0C2F4D] transition-colors duration-500 rounded"
                                    >
                                        <div class="flex-1">Название регистра</div>
                                        <div
                                            class="w-[50px] ml-5 flex justify-end text-[#ADEBFF] hover:text-[#58B1FF] transition-colors duration-500"
                                            @mouseenter="
                                                (e) =>
                                                    handleTableDeviceEnter(s.dev, e as MouseEvent)
                                            "
                                            @mouseleave="handleTableDeviceLeave"
                                        >
                                            {{ el.dev_addr }}
                                        </div>
                                        <div class="w-[50px] ml-5 flex justify-end text-[#ADEBFF]">
                                            {{
                                                curNumberingSystem === 'dec'
                                                    ? el.dev_addr
                                                    : el.dev_addr.toString(16)
                                            }}
                                        </div>
                                        <div class="w-[50px] ml-5 mr-3 flex justify-end">
                                            <div
                                                :class="
                                                    notConnected
                                                        ? 'text-[#3E688E]'
                                                        : 'text-[#ADEBFF]'
                                                "
                                            >
                                                {{
                                                    notConnected
                                                        ? '\u2013'
                                                        : curNumberingSystem === 'dec'
                                                        ? el.dev_addr
                                                        : el.dev_addr.toString(16)
                                                }}
                                            </div>
                                        </div>
                                        <CloseIcon
                                            class="label-close cursor-pointer"
                                            @click="deleteItem(el)"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="flex flex-col items-center flex-none w-full">
                            <div
                                class="w-full h-[70px] border-y border-[#1D4162] text-sm pl-[18px] pt-[12px] sticky top-0 bg-[#092740] flex flex-col"
                            >
                                <div class="text-base mb-1 font-semibold">Holding registers</div>
                                <div class="flex gap-5 pr-10 text-[13px]">
                                    <div class="flex-1">{{ t('columnsNames.name') }}</div>
                                    <div class="w-[50px]">{{ t('columnsNames.device') }}</div>
                                    <div class="w-[50px]">{{ t('columnsNames.reg') }}</div>
                                    <div class="w-[50px]">{{ t('columnsNames.value') }}</div>
                                </div>
                            </div>
                            <div
                                class="w-full flex flex-col text-[#6CB5D3] items-center px-2"
                                v-for="(s, index) in hrArr"
                                :key="index"
                            >
                                <div
                                    class="label group w-full text-[#6CB5D3] select-none"
                                    v-for="(el, i) in s.vals"
                                    :key="i"
                                    @dblclick="handleDblClick(el, i)"
                                >
                                    <div
                                        v-if="
                                            activeLabel?.i === i &&
                                            JSON.stringify(activeLabel.state) === JSON.stringify(el)
                                        "
                                        class="activeLabel bg-[#092E4B] -ml-2 pl-4 pr-[18px] flex flex-col items-center justify-center gap-[6px]"
                                        :class="isInvalidData ? 'h-[88px]' : 'h-[68px]'"
                                        :style="{ width: 'calc(100% + 16px)' }"
                                    >
                                        <div class="w-full flex items-center justify-center">
                                            <input
                                                class="flex-1 h-9 bg-[#183A58] rounded-l-[6px] px-[14px]"
                                                type="text"
                                                :value="String(activeLabelInputVal)"
                                                @input="(event) => handleInput(event as InputEvent)"
                                            />
                                            <input
                                                class="h-9 bg-[#04586F] rounded-r-[6px] px-2 w-[72px] text-[#01F0FF] text-center"
                                                :class="{
                                                    'bg-[#5C2345] text-[#F83068]': isInvalidData,
                                                }"
                                                type="text"
                                                :value="
                                                    String(
                                                        curNumberingSystem === 'dec'
                                                            ? Number(activeLabelInputValue)
                                                            : Number(
                                                                  activeLabelInputValue,
                                                              ).toString(16),
                                                    )
                                                "
                                                @input="
                                                    (event) => handleValInput(event as InputEvent)
                                                "
                                            />
                                        </div>
                                        <div
                                            v-if="isInvalidData"
                                            class="w-full text-sm h-[14px] text-[#F83068]"
                                        >
                                            {{ t('error.text') + 0 + t('error.separator') + 65535 }}
                                        </div>
                                    </div>
                                    <div
                                        v-else
                                        class="h-[30px] flex items-center pl-[10px] pr-2 hover:bg-[#0C2F4D] transition-colors duration-500 rounded"
                                    >
                                        <div class="flex-1">Название регистра</div>
                                        <div
                                            class="w-[50px] ml-5 flex justify-end text-[#ADEBFF] hover:text-[#58B1FF] transition-colors duration-500"
                                            @mouseenter="
                                                (e) =>
                                                    handleTableDeviceEnter(s.dev, e as MouseEvent)
                                            "
                                            @mouseleave="handleTableDeviceLeave"
                                        >
                                            {{ el.dev_addr }}
                                        </div>
                                        <div class="w-[50px] ml-5 flex justify-end text-[#ADEBFF]">
                                            {{
                                                curNumberingSystem === 'dec'
                                                    ? el.reg_addr
                                                    : el.reg_addr.toString(16)
                                            }}
                                        </div>
                                        <div class="w-[50px] ml-5 mr-3 flex justify-end">
                                            <div
                                                :class="
                                                    notConnected
                                                        ? 'text-[#3E688E]'
                                                        : 'text-[#ADEBFF]'
                                                "
                                            >
                                                {{
                                                    notConnected
                                                        ? '\u2013'
                                                        : curNumberingSystem === 'dec'
                                                        ? el.val
                                                        : el.val.toString(16)
                                                }}
                                            </div>
                                        </div>
                                        <CloseIcon
                                            class="label-close cursor-pointer"
                                            @click="deleteItem(el)"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <ModbusPopUp
            v-if="showPopUp"
            :el="popUpEl"
            :command="popUpCommand"
            :state="fullState"
            :w="w"
            @close="closePopUp"
        />
    </div>
</template>
<script lang="ts" setup>
import ArrowIcon from '@/assets/ArrowIcon.vue';
import AddIcon from '@/assets/AddIcon.vue';
import UpdateIcon from '@/assets/UpdateIcon.vue';
import CloseIcon from '@/assets/CloseIcon.vue';
import IButtonOutIcon from '@/assets/IButtonOutIcon.vue';
import ModbusPopUp from '@/components/views/widgets/bigWidgets/ModbusPopUp.vue';
import type { Widget } from '@/stores';

const indexStore = useIndexStore();

const { curNumberingSystem, devicesState, notConnected, choosenMbDevices, mbDevs, mbDevsLabels } =
    storeToRefs(indexStore);

const api = indexStore.getApi().api;

const isAborted = indexStore.getApi().isAborted;

let getMbInfoTimer: ReturnType<typeof setTimeout> | undefined;

const isStartScrollEl = ref(true);

const isEndScrollEl = ref(false);

const scrollWrapper = ref<HTMLElement | undefined>();

const scrollEl = ref<HTMLElement | undefined>();

const curChoosenDevs = ref<number[]>([]);

const showDeviceLabel = ref(false);

const showDeviceLabelNum = ref(0);

const deviceLabelLeft = ref(28);

const showTableDeviceLabel = ref(false);

const showTableDeviceLabelNum = ref(0);

const deviceTableLabelLeft = ref(0);

const deviceTableLabelTop = ref(70);

const activeLabelInputVal = ref('');

const activeLabelInputValue = ref('0');

const isInvalidData = ref(false);

const showPopUp = ref(false);

const popUpCommand = ref<'delete' | 'create' | 'update' | undefined>(undefined);

const popUpEl = ref<{
    type?: 'hr' | 'ir' | 'coil' | 'di';
    reg_addr: number;
    dev_addr: number;
    val: number;
} | null>(null);

const hoveredBinOutItem = ref<{
    i: number;
    state: { type?: 'hr' | 'ir' | 'coil' | 'di'; reg_addr: number; dev_addr: number; val: number };
} | null>(null);

const activeLabel = ref<{
    i: number;
    state: { type?: 'hr' | 'ir' | 'coil' | 'di'; reg_addr: number; dev_addr: number; val: number };
} | null>(null);

const mouseupX = ref<number>(0);

const props = defineProps<{
    w: { w: Widget; state: number[] };
}>();

const curMbDevLabels = computed<string[]>(() => {
    return mbDevsLabels.value[props.w.w.d][props.w.w.bus || 0];
});

const state = ref<number[]>([...props.w.state]);

const fullState = ref<
    { type?: 'hr' | 'ir' | 'coil' | 'di'; reg_addr: number; dev_addr: number; val: number }[]
>([]);

const curState = computed<
    { type?: 'hr' | 'ir' | 'coil' | 'di'; reg_addr: number; dev_addr: number; val: number }[] | []
>(() => {
    return fullState.value.filter((el) => el.val !== null);
});

const diArr = computed<
    | {
          dev: number;
          vals: { type: 'di'; reg_addr: number; dev_addr: number; val: number }[];
      }[]
    | []
>(() => {
    const arr = curState.value.filter(
        (el) => el.type === 'di' && curChoosenDevs.value.includes(el.dev_addr),
    ) as {
        type: 'di';
        reg_addr: number;
        dev_addr: number;
        val: number;
    }[];
    const res: {
        dev: number;
        vals: { type: 'di'; reg_addr: number; dev_addr: number; val: number }[];
    }[] = [];
    arr.forEach((el) => {
        const index = res.findIndex((elem) => elem.dev === el.dev_addr);
        if (index !== -1) {
            res[index].vals.push(el);
        } else {
            res.push({ dev: el.dev_addr, vals: [el] });
        }
    });
    const curDevAddr = Array.from(new Set(arr.map((el) => el.dev_addr)));
    curChoosenDevs.value.forEach((el) => {
        if (!curDevAddr.includes(el)) {
            res.push({ dev: el, vals: [] });
        }
    });
    return res.sort((a, b) => a.dev - b.dev);
});

const coilArr = computed<
    | {
          dev: number;
          vals: { type: 'coil'; reg_addr: number; dev_addr: number; val: number }[];
      }[]
    | []
>(() => {
    const arr = curState.value.filter(
        (el) => el.type === 'coil' && curChoosenDevs.value.includes(el.dev_addr),
    ) as {
        type: 'coil';
        reg_addr: number;
        dev_addr: number;
        val: number;
    }[];
    const res: {
        dev: number;
        vals: { type: 'coil'; reg_addr: number; dev_addr: number; val: number }[];
    }[] = [];
    arr.forEach((el) => {
        const index = res.findIndex((elem) => elem.dev === el.dev_addr);
        if (index !== -1) {
            res[index].vals.push(el);
        } else {
            res.push({ dev: el.dev_addr, vals: [el] });
        }
    });
    const curDevAddr = Array.from(new Set(arr.map((el) => el.dev_addr)));
    curChoosenDevs.value.forEach((el) => {
        if (!curDevAddr.includes(el)) {
            res.push({ dev: el, vals: [] });
        }
    });
    return res.sort((a, b) => a.dev - b.dev);
});

const irArr = computed<
    | {
          dev: number;
          vals: { type: 'ir'; reg_addr: number; dev_addr: number; val: number }[];
      }[]
    | []
>(() => {
    const arr = curState.value.filter(
        (el) => el.type === 'ir' && curChoosenDevs.value.includes(el.dev_addr),
    ) as {
        type: 'ir';
        reg_addr: number;
        dev_addr: number;
        val: number;
    }[];
    const res: {
        dev: number;
        vals: { type: 'ir'; reg_addr: number; dev_addr: number; val: number }[];
    }[] = [];
    arr.forEach((el) => {
        const index = res.findIndex((elem) => elem.dev === el.dev_addr);
        if (index !== -1) {
            res[index].vals.push(el);
        } else {
            res.push({ dev: el.dev_addr, vals: [el] });
        }
    });
    const curDevAddr = Array.from(new Set(arr.map((el) => el.dev_addr)));
    curChoosenDevs.value.forEach((el) => {
        if (!curDevAddr.includes(el)) {
            res.push({ dev: el, vals: [] });
        }
    });
    return res.sort((a, b) => a.dev - b.dev);
});

const hrArr = computed<
    | {
          dev: number;
          vals: { type: 'hr'; reg_addr: number; dev_addr: number; val: number }[];
      }[]
    | []
>(() => {
    const arr = curState.value.filter(
        (el) => el.type === 'hr' && curChoosenDevs.value.includes(el.dev_addr),
    ) as {
        type: 'hr';
        reg_addr: number;
        dev_addr: number;
        val: number;
    }[];
    const res: {
        dev: number;
        vals: { type: 'hr'; reg_addr: number; dev_addr: number; val: number }[];
    }[] = [];
    arr.forEach((el) => {
        const index = res.findIndex((elem) => elem.dev === el.dev_addr);
        if (index !== -1) {
            res[index].vals.push(el);
        } else {
            res.push({ dev: el.dev_addr, vals: [el] });
        }
    });
    const curDevAddr = Array.from(new Set(arr.map((el) => el.dev_addr)));
    curChoosenDevs.value.forEach((el) => {
        if (!curDevAddr.includes(el)) {
            res.push({ dev: el, vals: [] });
        }
    });
    return res.sort((a, b) => a.dev - b.dev);
});

const curDevs = computed<number[]>(() => {
    return [...new Set(curState.value.map((el) => el.dev_addr))].sort((a, b) => a - b);
});

async function getMbInfo() {
    try {
        const r = await api.post('get_mb_info', {
            device: props.w.w.d,
            bus: 0,
        });
        const data = (await r.data) as {
            type: ['hr' | 'di' | 'coil' | 'ir'];
            dev_addr: number[];
            reg_addr: number[];
        };
        const arr = [];
        for (let i = 0; i < state.value.length; i += 1) {
            if (mbDevs.value[props.w.w.d][props.w.w.bus || 0].includes(data.dev_addr[i])) {
                arr.push({
                    type: data.type[i],
                    reg_addr: data.reg_addr[i] as number,
                    dev_addr: data.dev_addr[i] as number,
                    val: state.value[i],
                });
            }
        }
        fullState.value = [...arr];
    } catch (error) {
        if (isAborted.value) {
            return;
        }
        return new Promise((resolve) =>
            setTimeout(() => {
                getMbInfo();
            }, 5),
        );
    }
    getMbInfoTimer = setTimeout(getMbInfo, 3000);
}

function handleArrowClick(direction: 'toStart' | 'toEnd') {
    const el = scrollEl.value;
    const wrapper = scrollWrapper.value;
    if (!el || !wrapper) return;
    if (direction === 'toStart') {
        wrapper.scrollTo({ left: wrapper.scrollLeft - wrapper.offsetWidth, behavior: 'smooth' });
        isStartScrollEl.value = wrapper.scrollLeft - wrapper.offsetWidth < 20;
        isEndScrollEl.value = false;
    } else {
        wrapper.scrollTo({ left: wrapper.scrollLeft + wrapper.offsetWidth, behavior: 'smooth' });
        isStartScrollEl.value = false;
        isEndScrollEl.value =
            wrapper.scrollWidth - wrapper.offsetWidth - 20 <=
            wrapper.scrollLeft + wrapper.offsetWidth;
    }
}

function handleScrollMove() {
    const wrapper = scrollWrapper.value;
    const el = scrollEl.value;
    if (!el || !wrapper || wrapper.offsetWidth === el.offsetWidth) return;
    isStartScrollEl.value = wrapper.scrollLeft < 20 ? true : false;
    isEndScrollEl.value =
        Math.round(wrapper.scrollLeft) > el.offsetWidth - wrapper.offsetWidth - 20 ? true : false;
}

function mousedown(e: MouseEvent) {
    mouseupX.value = e.screenX;
}

function mouseup(d: number, e: MouseEvent) {
    if (mouseupX.value) {
        if (Math.abs(e.screenX - mouseupX.value) < 20) {
            const prevArr = [...curChoosenDevs.value];
            const index = prevArr.findIndex((el) => el === d);
            if (index !== -1) {
                prevArr.splice(index, 1);
            } else {
                prevArr.push(d);
            }
            curChoosenDevs.value = [...prevArr].sort((a, b) => a - b);
            indexStore.setChoosenMbDevices(props.w.w.d, curChoosenDevs.value);
        }
        mouseupX.value = 0;
    }
}

function handleDeviceEnter(d: number, e: MouseEvent) {
    showDeviceLabel.value = true;
    showDeviceLabelNum.value = d;
    const target = e.target as HTMLElement;
    const parent = target.parentElement?.parentElement as HTMLElement;
    if (target && parent) {
        deviceLabelLeft.value = target.offsetLeft - parent.offsetLeft - parent.scrollLeft + 28;
    }
}

function handleDeviceLeave() {
    showDeviceLabel.value = false;
}

function handleTableDeviceEnter(d: number, e: MouseEvent) {
    showTableDeviceLabel.value = true;
    showTableDeviceLabelNum.value = d;
    const target = e.target as HTMLElement;
    const parent = target.parentElement?.parentElement as HTMLElement;
    if (target && parent) {
        deviceTableLabelLeft.value =
            target.offsetLeft - parent.offsetLeft + target.offsetWidth + 18;
        deviceTableLabelTop.value = parent.offsetTop - 5;
    }
}

function handleTableDeviceLeave() {
    showTableDeviceLabel.value = false;
}

function handleDblClick(
    s: { type?: 'hr' | 'ir' | 'coil' | 'di'; reg_addr: number; dev_addr: number; val: number },
    index: number,
) {
    activeLabel.value = { i: index, state: s };
    activeLabelInputVal.value = 'Название регистра';
    if (s.type === 'hr') activeLabelInputValue.value = s.val.toString();
    window.addEventListener('click', saveData);
    window.addEventListener('keypress', saveData);
}

function saveData(e: KeyboardEvent | MouseEvent) {
    if (!activeLabel.value) return;
    if (e.type === 'keypress') {
        const event: KeyboardEvent = e as KeyboardEvent;
        if (event.key === 'Enter') {
            //функция замены названия регистра
            if (!isInvalidData.value && activeLabel.value.state.type === 'hr') {
                setData(activeLabel.value.state, +activeLabelInputValue.value);
            }
            isInvalidData.value = false;
            activeLabelInputValue.value = '0';
            activeLabel.value = null;
            activeLabelInputVal.value = '';
        }
    } else if (e.type === 'click') {
        const target = e.target as HTMLElement;
        if (target.closest('.activeLabel')) return;
        //функция замены названия регистра
        if (!isInvalidData.value && activeLabel.value.state.type === 'hr') {
            setData(activeLabel.value.state, +activeLabelInputValue.value);
        }
        isInvalidData.value = false;
        activeLabelInputValue.value = '0';
        activeLabel.value = null;
        activeLabelInputVal.value = '';
    }
}

async function setData(
    el: {
        type?: 'hr' | 'ir' | 'coil' | 'di';
        reg_addr: number;
        dev_addr: number;
        val: number;
    },
    val: number,
) {
    try {
        let newIndex;
        for (let i = 0; i < fullState.value.length; i += 1) {
            if (JSON.stringify(fullState.value[i]) === JSON.stringify(el)) {
                newIndex = i;
            }
        }
        if (newIndex === undefined) return;
        const r = await api.post('set_ent_value', {
            type: props.w.w.i,
            device: props.w.w.d,
            index: newIndex,
            bus: 0,
            value: val,
        });
        if (r.data.status === 'ok') {
            const devStates = [...devicesState.value][props.w.w.d];
            const prevStateIndex = devStates.findIndex((el) => el.type === props.w.w.i);
            if (prevStateIndex !== -1 && devStates[prevStateIndex].value[newIndex] !== undefined)
                devStates[prevStateIndex].value[newIndex] = val;
            indexStore.setDevicesState(props.w.w.d, [...devStates]);
        }
    } catch (error) {
        if (isAborted.value) {
            return;
        }
        setTimeout(() => {
            setData(el, val);
        }, 5);
    }
}

function handleInput(e: InputEvent) {
    const target = e.target as HTMLInputElement;
    if (!target) return;
    activeLabelInputVal.value = target.value;
}

function handleValInput(e: InputEvent) {
    const target = e.target as HTMLInputElement;
    if (!target) return;
    if (!(+target.value >= 0 && +target.value <= 65535)) {
        isInvalidData.value = true;
    } else {
        isInvalidData.value = false;
    }
    activeLabelInputValue.value = target.value;
}

function handleBinOutMouseEnter(
    i: number,
    el: { type?: 'hr' | 'ir' | 'coil' | 'di'; reg_addr: number; dev_addr: number; val: number },
) {
    hoveredBinOutItem.value = { i: i, state: el };
}

function handleBinOutMouseLeave() {
    hoveredBinOutItem.value = null;
}

async function handleCoilClick(el: {
    type?: 'hr' | 'ir' | 'coil' | 'di';
    reg_addr: number;
    dev_addr: number;
    val: number;
}) {
    try {
        let newIndex;
        for (let i = 0; i < fullState.value.length; i += 1) {
            if (JSON.stringify(fullState.value[i]) === JSON.stringify(el)) {
                newIndex = i;
            }
        }
        if (newIndex === undefined) return;
        const r = await api.post('set_ent_value', {
            type: props.w.w.i,
            device: props.w.w.d,
            index: newIndex,
            bus: 0,
            value: el.val ? 0 : 1,
        });
        if (r.data.status === 'ok') {
            const devStates = [...devicesState.value][props.w.w.d];
            const prevStateIndex = devStates.findIndex((el) => el.type === props.w.w.i);
            if (prevStateIndex !== -1 && devStates[prevStateIndex].value[newIndex] !== undefined)
                devStates[prevStateIndex].value[newIndex] = el.val ? 0 : 1;
            indexStore.setDevicesState(props.w.w.d, [...devStates]);
        }
    } catch (error) {
        if (isAborted.value) {
            return;
        }
        setTimeout(() => {
            handleCoilClick(el);
        }, 5);
    }
}

function deleteItem(el: {
    type?: 'hr' | 'ir' | 'coil' | 'di';
    reg_addr: number;
    dev_addr: number;
    val: number;
}) {
    showPopUp.value = true;
    popUpEl.value = el;
    popUpCommand.value = 'delete';
}

function updateItem() {
    showPopUp.value = true;
    popUpCommand.value = 'update';
}

function closePopUp() {
    showPopUp.value = false;
    popUpEl.value = null;
    popUpCommand.value = undefined;
}

watch(
    () => devicesState.value,
    () => {
        const newState = devicesState.value[props.w.w.d].find((obj) => obj.type === props.w.w.i)
            ?.value as number[];
        state.value = newState ? newState : [...props.w.state];
    },
);

watch(
    () => curDevs.value,
    () => {
        if (choosenMbDevices.value[props.w.w.d] === undefined) {
            curChoosenDevs.value = curDevs.value;
            indexStore.setChoosenMbDevices(props.w.w.d, curChoosenDevs.value);
        }
    },
);

onMounted(() => {
    getMbInfo();
    const wrapper = scrollWrapper.value;
    const el = scrollEl.value;
    if (!wrapper || !el) return;
    isEndScrollEl.value = !(wrapper.offsetWidth <= el.offsetWidth);
    if (choosenMbDevices.value[props.w.w.d])
        curChoosenDevs.value = choosenMbDevices.value[props.w.w.d];
});

onBeforeUnmount(() => {
    clearTimeout(getMbInfoTimer);
    getMbInfoTimer = undefined;
});

const { t } = useI18n({
    messages: {
        ru: {
            noObj: 'Объекты отсутствуют',
            on: 'ВКЛ',
            off: 'ВЫКЛ',
            columnsNames: {
                name: 'Название регистра',
                device: 'Уст-во',
                reg: 'Регистр',
                status: 'Статус',
                value: 'Значение',
            },
            error: {
                text: 'Введите значение от ',
                separator: ' до ',
            },
        },
        en: {
            noObj: 'Objects disabled',
            on: 'ON',
            off: 'OFF',
            columnsNames: {
                name: 'Register name',
                device: 'Device',
                reg: 'Register',
                status: 'Status',
                value: 'Value',
            },
            error: {
                text: 'Enter a value between ',
                separator: ' and ',
            },
        },
    },
});

// watch(labels, () => {
//     console.log(labels.value);
// });
</script>
