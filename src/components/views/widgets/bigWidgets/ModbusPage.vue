<template>
    <div class="flex-1 relative w-full overflow-hidden">
        <div
            v-if="showDeviceLabel"
            class="absolute bg-[#1B4569] rounded-[6px] min-h-10 p-3 top-[41px] flex items-left z-[3] flex-col gap-3"
            :style="[{ width: 'fit-content' }, { left: deviceLabelLeft + 'px' }]"
        >
            {{ curMbDevLabels[showDeviceLabelNum - 1] || '\u2013' }}
            <div
                v-if="errArr.includes(showDeviceLabelNum) || initArr.includes(showDeviceLabelNum)"
                class="flex items-center justify-center"
            >
                <div
                    class="w-[5px] h-[5px] left-3 top-[50%] -translate-y-[50%] rounded-[50%] mr-[6px] mt-[5px]"
                    :class="
                        errArr.includes(showDeviceLabelNum)
                            ? curChoosenDevs.includes(showDeviceLabelNum)
                                ? 'bg-[#F83068]'
                                : 'bg-[#FF5A88]'
                            : curChoosenDevs.includes(showDeviceLabelNum)
                            ? 'bg-[#ADEBFF]'
                            : 'bg-[#84AFBD]'
                    "
                ></div>
                {{ initArr.includes(showDeviceLabelNum) ? t('mbDevsInit') : t('mbDevsErr') }}
            </div>
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
                                    class="relative device h-6 min-w-[4rem] flex items-center mr-[6px] rounded text-0.81 font-roboto text-[#ADEBFF] cursor-pointer transition-all duration-300 justify-center select-none"
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
                                    <div
                                        v-if="errArr.includes(device) || initArr.includes(device)"
                                        class="absolute w-[5px] h-[5px] left-3 top-[50%] -translate-y-[50%] rounded-[50%]"
                                        :class="
                                            errArr.includes(device)
                                                ? curChoosenDevs.includes(device)
                                                    ? 'bg-[#F83068]'
                                                    : 'bg-[#FF5A88]'
                                                : curChoosenDevs.includes(device)
                                                ? 'bg-[#ADEBFF]'
                                                : 'bg-[#84AFBD]'
                                        "
                                    ></div>
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
                            @click="createItem"
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
        <div
            class="w-full flex"
            :style="{
                height: props.isInit ? 'calc(100% - 95px)' : '100%',
            }"
        >
            <div
                v-if="props.isInit"
                class="flex-1 flex overflow-y-hidden rounded-l-lg w-full pb-3"
            >
                <div
                    v-dragscroll.y
                    class="flex overflow-y-auto w-full scrollbar-4 flex-1 flex-col px-4 items-center flex-none"
                    :style="{
                        height: 'calc(100vh - 460px)',
                    }"
                >
                    <div
                        class="w-full h-[70px] border-y border-[#1D4162] text-sm pl-[18px] pt-[12px] sticky top-0 bg-[#092740] flex flex-col"
                    >
                        <div class="text-base mb-1 font-semibold">Coils</div>
                        <div class="flex gap-5 pr-10 text-[13px]">
                            <div class="w-[260px]">{{ t('columnsNames.name') }}</div>
                            <div class="w-[50px]">{{ t('columnsNames.device') }}</div>
                            <div class="w-[50px]">{{ t('columnsNames.reg') }}</div>
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
                                    :class="[
                                        {
                                            'text-[#F83068]': activeLabel.state.val === 'err',
                                        },
                                        {
                                            'text-[#3E688E]': activeLabel.state.val === null,
                                        },
                                    ]"
                                    type="text"
                                    :value="activeLabelInputVal"
                                    :maxlength="32"
                                    @input="(event) => handleInput(event as InputEvent)"
                                />
                                <div
                                    class="h-9 pl-[10px] w-[88px] rounded-[6px] flex items-center justify-start gap-[6px] text-xs"
                                    :class="[
                                        el.val === null || el.val === 'err'
                                            ? 'justify-center'
                                            : 'justify-start bg-[#0D424D]',
                                        { 'text-[#3E688E]': el.val === null },
                                        { 'text-[#F83068]': el.val === 'err' },
                                    ]"
                                >
                                    <IButtonOutIcon
                                        v-if="
                                            el.val !== null &&
                                            el.val !== 'err' &&
                                            !el.type.includes('w')
                                        "
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
                                    {{
                                        el.val === null || el.val === 'err'
                                            ? '\u2013'
                                            : el.val
                                            ? t('on')
                                            : t('off')
                                    }}
                                </div>
                            </div>
                            <div
                                v-else
                                class="h-[30px] flex items-center pl-[10px] pr-2 hover:bg-[#0C2F4D] transition-colors duration-500 rounded"
                                :class="[
                                    { 'text-[#3E688E]': el.val === null },
                                    { 'text-[#F83068]': el.val === 'err' },
                                ]"
                            >
                                <div class="flex-1">{{ el.label }}</div>
                                <div
                                    class="w-[50px] ml-5 flex justify-end transition-colors duration-500"
                                    :class="
                                        el.val === 'err'
                                            ? 'text-[#F83068]'
                                            : el.val === null
                                            ? 'text-[#3E688E]'
                                            : 'text-[#ADEBFF] hover:text-[#58B1FF]'
                                    "
                                    @mouseenter="
                                        (e) => handleTableDeviceEnter(s.dev, e as MouseEvent)
                                    "
                                    @mouseleave="handleTableDeviceLeave"
                                >
                                    {{ el['dev-addr'] }}
                                </div>
                                <div class="w-[50px] ml-5 flex justify-end uppercase">
                                    {{
                                        curNumberingSystem === 'dec'
                                            ? el['reg-addr']
                                            : el['reg-addr'].toString(16)
                                    }}
                                </div>
                                <div class="w-[50px] ml-5 mr-3 flex justify-end">
                                    <div
                                        :class="
                                            el.val === 'err'
                                                ? 'text-[#F83068]'
                                                : el.val === null
                                                ? 'text-[#3E688E]'
                                                : el.val
                                                ? 'text-[#35FED0]'
                                                : 'text-[#176F6F]'
                                        "
                                    >
                                        {{
                                            el.val === 'err' || el.val === null
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
            </div>
            <div
                v-if="!props.isInit"
                class="w-[58%] h-full"
            >
                <div class="flex overflow-y-hidden rounded-l-lg w-full">
                    <div
                        v-dragscroll.y
                        class="flex overflow-y-auto w-full scrollbar-4 flex-1 flex-col"
                        :style="{
                            height: 'calc(100vh - 460px)',
                        }"
                        ref="varsWrapper"
                    >
                        <div class="flex flex-col items-center flex-none w-full">
                            <div
                                class="w-full h-[50px] border-y border-[#1D4162] pl-5 pt-5 sticky z-[2] top-0 bg-[#092740] text-base font-semibold"
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
                                        class="relative select-none rounded group inline-flex flex-col items-end w-[90px] h-10 justify-center gap-[6px] transition-all duration-300 border border-transparent px-[6px]"
                                        :class="[
                                            { 'bg-[#193550] text-[#F83068]': el.val === 'err' },
                                            { 'bg-[#183C5E] text-[#3E688E]': el.val === null },
                                            {
                                                'bg-[#176F6F] text-[#35FED0]':
                                                    el.val && el.val !== 'err',
                                            },
                                            {
                                                'bg-[#0D424D] text-[#35FED0]':
                                                    !el.val && el.val !== null,
                                            },
                                        ]"
                                        v-for="(el, i) in s.vals"
                                        :key="i"
                                        @mouseenter="
                                            (e: MouseEvent) => handleMouseEnter(e as MouseEvent)
                                        "
                                    >
                                        <div
                                            v-if="el.val === 'err'"
                                            class="w-full flex justify-end uppercase"
                                        >
                                            {{ t('err') }}
                                        </div>
                                        <div class="w-full flex items-center justify-between">
                                            <span>RO</span>
                                            <span class="uppercase">{{
                                                curNumberingSystem === 'dec'
                                                    ? el['reg-addr']
                                                    : el['reg-addr'].toString(16)
                                            }}</span>
                                        </div>
                                        <div
                                            class="absolute max-w-[192px] w-max left-0 invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-[visibility,opacity] z-[3]"
                                            :class="
                                                labelPosition === 'top'
                                                    ? 'bottom-[100%] pb-1'
                                                    : 'top-[100%] pt-1'
                                            "
                                        >
                                            <div
                                                class="bg-[#1B4569] p-3 rounded-[6px] text-[#A0D5FF] text-[13px] shadow-[0_0_11px_0_rgba(160,213,255,1) hover:underline cursor-pointer"
                                                @click="handleRegLabelClick('di', index, i)"
                                            >
                                                {{ el.label || '\u2013' }}
                                            </div>
                                        </div>
                                    </div>
                                    <AddIcon
                                        v-if="
                                            !fullState.length ||
                                            fullState.length !== curState.length
                                        "
                                        class="cursor-pointer w-[90px] h-10 rounded-[3px] border border-[#148EF8] py-[10px] active:bg-[#148EF8]"
                                        :class="{ disabled: notConnected }"
                                        @click="createReg(s.dev, 'di')"
                                    />
                                </div>
                            </div>
                        </div>
                        <div class="flex flex-col items-center flex-none w-full">
                            <div
                                class="w-full h-[50px] border-y border-[#1D4162] pl-5 pt-5 sticky z-[2] top-0 bg-[#092740] text-base font-semibold"
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
                                        class="relative select-none rounded group flex items-center w-[90px] h-10 gap-[6px] transition-all duration-300 border border-transparent px-[6px]"
                                        :class="[
                                            {
                                                'bg-[#193550] text-[#F83068] justify-center':
                                                    el.val === 'err',
                                            },
                                            {
                                                'bg-[#183C5E] text-[#3E688E] justify-between':
                                                    el.val === null,
                                            },
                                            {
                                                'bg-[#176F6F] text-[#35FED0] justify-between cursor-pointer hover:border-[#35FED0]':
                                                    el.val && el.val !== 'err',
                                            },
                                            {
                                                'bg-[#0D424D] text-[#35FED0] justify-between cursor-pointer hover:border-[#35FED0]':
                                                    !el.val && el.val !== null,
                                            },
                                        ]"
                                        v-for="(el, i) in s.vals"
                                        :key="i"
                                        @click="handleCoilClick(el)"
                                        @mouseenter="
                                            (e: MouseEvent) => handleMouseEnter(e as MouseEvent)
                                        "
                                    >
                                        <div
                                            v-if="el.val !== 'err'"
                                            class="flex flex-col justify-end gap-[6px]"
                                        >
                                            <div class="h-[12px]">
                                                {{
                                                    el.type === 'wm-coil' || el.type === 'm-coil'
                                                        ? 'M'
                                                        : ''
                                                }}
                                            </div>
                                            <div class="h-[12px]">
                                                {{
                                                    el.type === 'wm-coil' || el.type === 'w-coil'
                                                        ? 'WO'
                                                        : 'RW'
                                                }}
                                            </div>
                                        </div>
                                        <div
                                            v-if="el.val !== 'err'"
                                            class="flex flex-col items-end justify-end gap-[6px]"
                                        >
                                            <div
                                                class="h-[12px]"
                                                :class="{ 'text-[#97FFE7]': el.val !== null }"
                                            >
                                                {{ el.val ? t('on') : t('off') }}
                                            </div>
                                            <div class="h-[12px] uppercase">
                                                {{
                                                    curNumberingSystem === 'dec'
                                                        ? el['reg-addr']
                                                        : el['reg-addr'].toString(16)
                                                }}
                                            </div>
                                        </div>
                                        <div
                                            v-if="el.val === 'err'"
                                            class="flex flex-col justify-end gap-[6px]"
                                        >
                                            <div class="h-[12px]">
                                                {{
                                                    el.type === 'wm-coil'
                                                        ? 'WM'
                                                        : el.type === 'w-coil'
                                                        ? 'W'
                                                        : el.type === 'm-coil'
                                                        ? 'M'
                                                        : ''
                                                }}
                                            </div>
                                            <div class="h-[12px]">RW</div>
                                        </div>
                                        <div
                                            v-if="el.val === 'err'"
                                            class="flex flex-col items-end justify-end gap-[6px]"
                                        >
                                            <div class="h-[12px] uppercase">
                                                {{ t('err') }}
                                            </div>
                                            <div class="h-[12px] uppercase">
                                                {{
                                                    curNumberingSystem === 'dec'
                                                        ? el['reg-addr']
                                                        : el['reg-addr'].toString(16)
                                                }}
                                            </div>
                                        </div>
                                        <div
                                            class="absolute max-w-[192px] w-max left-0 invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-[visibility,opacity] z-[3]"
                                            :class="
                                                labelPosition === 'top'
                                                    ? 'bottom-[100%] pb-1'
                                                    : 'top-[100%] pt-1'
                                            "
                                        >
                                            <div
                                                class="bg-[#1B4569] p-3 rounded-[6px] text-[#A0D5FF] text-[13px] shadow-[0_0_11px_0_rgba(160,213,255,1) hover:underline cursor-pointer"
                                                @click="handleRegLabelClick('coil', index, i)"
                                            >
                                                {{ el.label || '\u2013' }}
                                            </div>
                                        </div>
                                    </div>
                                    <AddIcon
                                        v-if="
                                            !fullState.length ||
                                            fullState.length !== curState.length
                                        "
                                        class="cursor-pointer w-[90px] h-10 rounded-[3px] border border-[#148EF8] py-[10px] active:bg-[#148EF8]"
                                        :class="{ disabled: notConnected }"
                                        @click="createReg(s.dev, 'coil')"
                                    />
                                </div>
                            </div>
                        </div>
                        <div class="flex flex-col items-center flex-none w-full">
                            <div
                                class="w-full h-[50px] border-y border-[#1D4162] pl-5 pt-5 sticky z-[2] top-0 bg-[#092740] text-base font-semibold"
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
                                        class="w-[90px] h-10 flex items-center justify-between text-[#35FED0] text-xs rounded px-[6px] bg-[#006B83] relative group"
                                        :class="[
                                            {
                                                'bg-[#193550] text-[#F83068]': el.val === 'err',
                                            },
                                            {
                                                'bg-[#183C5E] text-[#3E688E]': el.val === null,
                                            },
                                            {
                                                'bg-[#006B83] text-[#01F0FF]':
                                                    el.val !== null && el.val !== 'err',
                                            },
                                            {
                                                'hover:border-[#01F0FF]':
                                                    el.val !== null && el.val !== 'err',
                                            },
                                        ]"
                                        v-for="(el, i) in s.vals"
                                        :key="i"
                                        @mouseenter="
                                            (e: MouseEvent) => handleMouseEnter(e as MouseEvent)
                                        "
                                    >
                                        <div class="flex flex-col justify-end gap-[6px]">
                                            <div class="h-[12px]"></div>
                                            <div class="h-[12px]">RO</div>
                                        </div>
                                        <div class="flex flex-col items-end justify-end gap-[6px]">
                                            <div
                                                v-if="el.val !== null && el.val !== 'err'"
                                                class="h-[12px] text-[#9BE7FF] uppercase"
                                            >
                                                {{
                                                    curNumberingSystem === 'dec'
                                                        ? el.val
                                                        : el.val.toString(16)
                                                }}
                                            </div>
                                            <div
                                                v-else-if="el.val === 'err'"
                                                class="h-[12px] text-[#F83068] uppercase"
                                            >
                                                {{ t('err') }}
                                            </div>
                                            <div
                                                v-else
                                                class="h-[12px] text-[#3E688E]"
                                            >
                                                -
                                            </div>
                                            <div class="h-[12px] uppercase">
                                                {{
                                                    curNumberingSystem === 'dec'
                                                        ? el['reg-addr']
                                                        : el['reg-addr'].toString(16)
                                                }}
                                            </div>
                                        </div>
                                        <div
                                            class="absolute max-w-[192px] w-max left-0 invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-[visibility,opacity] z-[3]"
                                            :class="
                                                labelPosition === 'top'
                                                    ? 'bottom-[100%] pb-1'
                                                    : 'top-[100%] pt-1'
                                            "
                                        >
                                            <div
                                                class="bg-[#1B4569] p-3 rounded-[6px] text-[#A0D5FF] text-[13px] shadow-[0_0_11px_0_rgba(160,213,255,1) hover:underline cursor-pointer"
                                                @click="handleRegLabelClick('ir', index, i)"
                                            >
                                                {{ el.label || '\u2013' }}
                                            </div>
                                        </div>
                                    </div>
                                    <AddIcon
                                        v-if="
                                            !fullState.length ||
                                            fullState.length !== curState.length
                                        "
                                        class="cursor-pointer w-[90px] h-10 rounded-[3px] border border-[#148EF8] py-[10px] active:bg-[#148EF8]"
                                        :class="{ disabled: notConnected }"
                                        @click="createReg(s.dev, 'ir')"
                                    />
                                </div>
                            </div>
                        </div>
                        <div class="flex flex-col items-center flex-none w-full">
                            <div
                                class="w-full h-[50px] border-y border-[#1D4162] pl-5 pt-5 sticky z-[2] top-0 bg-[#092740] text-base font-semibold"
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
                                        class="w-[90px] h-10 flex items-center justify-between text-[#35FED0] text-xs rounded px-[6px] bg-[#006B83] relative group"
                                        :class="[
                                            {
                                                'bg-[#193550] text-[#F83068]': el.val === 'err',
                                            },
                                            {
                                                'bg-[#183C5E] text-[#3E688E]': el.val === null,
                                            },
                                            {
                                                'bg-[#006B83] text-[#01F0FF]':
                                                    el.val !== null && el.val !== 'err',
                                            },
                                            {
                                                'hover:border-[#01F0FF]':
                                                    el.val !== null && el.val !== 'err',
                                            },
                                        ]"
                                        v-for="(el, i) in s.vals"
                                        :key="i"
                                        @mouseenter="
                                            (e: MouseEvent) => handleMouseEnter(e as MouseEvent)
                                        "
                                    >
                                        <div class="flex flex-col justify-end gap-[6px]">
                                            <div class="h-[12px]">
                                                {{
                                                    el.type === 'm-hr' || el.type === 'wm-hr'
                                                        ? 'M'
                                                        : ''
                                                }}
                                            </div>
                                            <div class="h-[12px]">
                                                {{
                                                    el.type === 'w-hr' || el.type === 'wm-hr'
                                                        ? 'WO'
                                                        : 'RW'
                                                }}
                                            </div>
                                        </div>
                                        <div class="flex flex-col items-end justify-end gap-[6px]">
                                            <div
                                                v-if="el.val !== null && el.val !== 'err'"
                                                class="h-[12px] text-[#9BE7FF] uppercase"
                                            >
                                                {{
                                                    curNumberingSystem === 'dec'
                                                        ? el.val
                                                        : el.val.toString(16)
                                                }}
                                            </div>
                                            <div
                                                v-else-if="el.val === 'err'"
                                                class="h-[12px] text-[#F83068] uppercase"
                                            >
                                                {{ t('err') }}
                                            </div>
                                            <div
                                                v-else
                                                class="h-[12px] text-[#3E688E]"
                                            >
                                                -
                                            </div>
                                            <div class="h-[12px] uppercase">
                                                {{
                                                    curNumberingSystem === 'dec'
                                                        ? el['reg-addr']
                                                        : el['reg-addr'].toString(16)
                                                }}
                                            </div>
                                        </div>
                                        <div
                                            class="absolute max-w-[192px] w-max left-0 invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-[visibility,opacity] z-[3]"
                                            :class="
                                                labelPosition === 'top'
                                                    ? 'bottom-[100%] pb-1'
                                                    : 'top-[100%] pt-1'
                                            "
                                        >
                                            <div
                                                class="bg-[#1B4569] p-3 rounded-[6px] text-[#A0D5FF] text-[13px] shadow-[0_0_11px_0_rgba(160,213,255,1) hover:underline cursor-pointer"
                                                @click="handleRegLabelClick('hr', index, i)"
                                            >
                                                {{ el.label || '\u2013' }}
                                            </div>
                                        </div>
                                    </div>
                                    <AddIcon
                                        v-if="
                                            !fullState.length ||
                                            fullState.length !== curState.length
                                        "
                                        class="cursor-pointer w-[90px] h-10 rounded-[3px] border border-[#148EF8] py-[10px] active:bg-[#148EF8]"
                                        :class="{ disabled: notConnected }"
                                        @click="createReg(s.dev, 'hr')"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div
                v-if="!props.isInit"
                class="w-[42%] h-full border-l border-[#1D4162]"
            >
                <div class="flex overflow-y-hidden rounded-l-lg w-full">
                    <div
                        class="flex overflow-y-auto w-full scrollbar-4 flex-1 flex-col relative"
                        :style="{
                            height: 'calc(100vh - 460px)',
                        }"
                        ref="tableWrapper"
                    >
                        <div
                            class="flex flex-col items-center flex-none w-full"
                            ref="di"
                        >
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
                                            :class="[
                                                {
                                                    'text-[#F83068]':
                                                        activeLabel.state.val === 'err',
                                                },
                                                {
                                                    'text-[#3E688E]':
                                                        activeLabel.state.val === null,
                                                },
                                            ]"
                                            type="text"
                                            :value="activeLabelInputVal"
                                            :maxlength="32"
                                            @input="(event) => handleInput(event as InputEvent)"
                                        />
                                    </div>
                                    <div
                                        v-else
                                        class="h-[30px] flex items-center pl-[10px] pr-2 hover:bg-[#0C2F4D] transition-colors duration-500 rounded"
                                        :class="[
                                            { 'text-[#3E688E]': el.val === null },
                                            { 'text-[#F83068]': el.val === 'err' },
                                        ]"
                                    >
                                        <div class="flex-1">{{ el.label }}</div>
                                        <div
                                            :class="
                                                el.val === 'err'
                                                    ? 'text-[#F83068]'
                                                    : el.val === null
                                                    ? 'text-[#3E688E]'
                                                    : 'text-[#ADEBFF] hover:text-[#58B1FF]'
                                            "
                                            @mouseenter="
                                                (e) =>
                                                    handleTableDeviceEnter(s.dev, e as MouseEvent)
                                            "
                                            @mouseleave="handleTableDeviceLeave"
                                        >
                                            {{ el['dev-addr'] }}
                                        </div>
                                        <div
                                            class="w-[50px] ml-5 flex justify-end uppercase"
                                            :class="[
                                                { 'text-[#3E688E]': el.val === null },
                                                { 'text-[#F83068]': el.val === 'err' },
                                            ]"
                                        >
                                            {{
                                                curNumberingSystem === 'dec'
                                                    ? el['reg-addr']
                                                    : el['reg-addr'].toString(16)
                                            }}
                                        </div>
                                        <div class="w-[50px] ml-5 mr-3 flex justify-end">
                                            <div
                                                class="w-[9px] h-[9px] rounded-[2px]"
                                                :class="
                                                    el.val === null
                                                        ? 'bg-[#193E60]'
                                                        : el.val === 'err'
                                                        ? 'bg-[#F83068]'
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
                        <div
                            class="flex flex-col items-center flex-none w-full"
                            ref="coil"
                        >
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
                                            :class="[
                                                {
                                                    'text-[#F83068]':
                                                        activeLabel.state.val === 'err',
                                                },
                                                {
                                                    'text-[#3E688E]':
                                                        activeLabel.state.val === null,
                                                },
                                            ]"
                                            type="text"
                                            :value="activeLabelInputVal"
                                            :maxlength="32"
                                            @input="(event) => handleInput(event as InputEvent)"
                                        />
                                        <div
                                            class="h-9 pl-[10px] w-[88px] rounded-[6px] flex items-center justify-start gap-[6px] text-xs"
                                            :class="[
                                                el.val === null || el.val === 'err'
                                                    ? 'justify-center'
                                                    : 'justify-start bg-[#0D424D]',
                                                { 'text-[#3E688E]': el.val === null },
                                                { 'text-[#F83068]': el.val === 'err' },
                                            ]"
                                        >
                                            <IButtonOutIcon
                                                v-if="
                                                    el.val !== null &&
                                                    el.val !== 'err' &&
                                                    !el.type.includes('w')
                                                "
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
                                            {{
                                                el.val === null || el.val === 'err'
                                                    ? '\u2013'
                                                    : el.val
                                                    ? t('on')
                                                    : t('off')
                                            }}
                                        </div>
                                    </div>
                                    <div
                                        v-else
                                        class="h-[30px] flex items-center pl-[10px] pr-2 hover:bg-[#0C2F4D] transition-colors duration-500 rounded"
                                        :class="[
                                            { 'text-[#3E688E]': el.val === null },
                                            { 'text-[#F83068]': el.val === 'err' },
                                        ]"
                                    >
                                        <div class="flex-1">{{ el.label }}</div>
                                        <div
                                            class="w-[50px] ml-5 flex justify-end transition-colors duration-500"
                                            :class="
                                                el.val === 'err'
                                                    ? 'text-[#F83068]'
                                                    : el.val === null
                                                    ? 'text-[#3E688E]'
                                                    : 'text-[#ADEBFF] hover:text-[#58B1FF]'
                                            "
                                            @mouseenter="
                                                (e) =>
                                                    handleTableDeviceEnter(s.dev, e as MouseEvent)
                                            "
                                            @mouseleave="handleTableDeviceLeave"
                                        >
                                            {{ el['dev-addr'] }}
                                        </div>
                                        <div class="w-[50px] ml-5 flex justify-end uppercase">
                                            {{
                                                curNumberingSystem === 'dec'
                                                    ? el['reg-addr']
                                                    : el['reg-addr'].toString(16)
                                            }}
                                        </div>
                                        <div class="w-[50px] ml-5 mr-3 flex justify-end">
                                            <div
                                                :class="
                                                    el.val === 'err'
                                                        ? 'text-[#F83068]'
                                                        : el.val === null
                                                        ? 'text-[#3E688E]'
                                                        : el.val
                                                        ? 'text-[#35FED0]'
                                                        : 'text-[#176F6F]'
                                                "
                                            >
                                                {{
                                                    el.val === 'err' || el.val === null
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
                        <div
                            class="flex flex-col items-center flex-none w-full"
                            ref="ir"
                        >
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
                                            :class="[
                                                {
                                                    'text-[#F83068]':
                                                        activeLabel.state.val === 'err',
                                                },
                                                {
                                                    'text-[#3E688E]':
                                                        activeLabel.state.val === null,
                                                },
                                            ]"
                                            type="text"
                                            :value="activeLabelInputVal"
                                            :maxlength="32"
                                            @input="(event) => handleInput(event as InputEvent)"
                                        />
                                        <div
                                            class="text-[15px] uppercase"
                                            :class="
                                                el.val === 'err'
                                                    ? 'text-[#F83068]'
                                                    : el.val === null
                                                    ? 'text-[#3E688E]'
                                                    : 'text-[#01F0FF]'
                                            "
                                        >
                                            {{
                                                el.val === 'err' || el.val === null
                                                    ? '\u2013'
                                                    : curNumberingSystem === 'dec'
                                                    ? el.val
                                                    : el.val.toString(16)
                                            }}
                                        </div>
                                    </div>
                                    <div
                                        v-else
                                        class="h-[30px] flex items-center pl-[10px] pr-2 hover:bg-[#0C2F4D] transition-colors duration-500 rounded"
                                        :class="[
                                            {
                                                'text-[#F83068]': el.val === 'err',
                                            },
                                            {
                                                'text-[#3E688E]': el.val === null,
                                            },
                                        ]"
                                    >
                                        <div class="flex-1">{{ el.label }}</div>
                                        <div
                                            class="w-[50px] ml-5 flex justify-end transition-colors duration-500"
                                            :class="
                                                el.val === 'err'
                                                    ? 'text-[#F83068]'
                                                    : el.val === null
                                                    ? 'text-[#3E688E]'
                                                    : 'text-[#ADEBFF] hover:text-[#58B1FF]'
                                            "
                                            @mouseenter="
                                                (e) =>
                                                    handleTableDeviceEnter(s.dev, e as MouseEvent)
                                            "
                                            @mouseleave="handleTableDeviceLeave"
                                        >
                                            {{ el['dev-addr'] }}
                                        </div>
                                        <div class="w-[50px] ml-5 flex justify-end uppercase">
                                            {{
                                                curNumberingSystem === 'dec'
                                                    ? el['reg-addr']
                                                    : el['reg-addr'].toString(16)
                                            }}
                                        </div>
                                        <div class="w-[50px] ml-5 mr-3 flex justify-end uppercase">
                                            <div
                                                :class="
                                                    el.val === 'err'
                                                        ? 'text-[#F83068]'
                                                        : el.val === null
                                                        ? 'text-[#3E688E]'
                                                        : 'text-[#ADEBFF]'
                                                "
                                            >
                                                {{
                                                    el.val === 'err' || el.val === null
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
                        <div
                            class="flex flex-col items-center flex-none w-full"
                            ref="hr"
                        >
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
                                                :class="[
                                                    {
                                                        'text-[#F83068] rounded-[6px]':
                                                            activeLabel.state.val === 'err',
                                                    },
                                                    {
                                                        'text-[#3E688E] rounded-[6px]':
                                                            activeLabel.state.val === null,
                                                    },
                                                ]"
                                                type="text"
                                                :value="activeLabelInputVal"
                                                :maxlength="32"
                                                @input="(event) => handleInput(event as InputEvent)"
                                            />
                                            <div
                                                v-if="
                                                    activeLabel.state.val === 'err' ||
                                                    activeLabel.state.val === null ||
                                                    activeLabel.state.type.includes('w')
                                                "
                                                class="ml-4"
                                                :class="[
                                                    {
                                                        'text-[#F83068] rounded-[6px]':
                                                            activeLabel.state.val === 'err',
                                                    },
                                                    {
                                                        'text-[#3E688E] rounded-[6px]':
                                                            activeLabel.state.val === null,
                                                    },
                                                ]"
                                            >
                                                {{
                                                    activeLabel.state.val === 'err' ||
                                                    activeLabel.state.val === null
                                                        ? '\u2013'
                                                        : activeLabel.state.val
                                                }}
                                            </div>
                                            <input
                                                v-else
                                                class="h-9 rounded-r-[6px] px-2 w-[72px] text-center uppercase"
                                                :class="
                                                    isInvalidData
                                                        ? 'bg-[#5C2345] text-[#F83068]'
                                                        : 'bg-[#04586F] text-[#01F0FF]'
                                                "
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
                                        :class="[
                                            {
                                                'text-[#F83068]': el.val === 'err',
                                            },
                                            {
                                                'text-[#3E688E]': el.val === null,
                                            },
                                        ]"
                                    >
                                        <div class="flex-1">{{ el.label }}</div>
                                        <div
                                            class="w-[50px] ml-5 flex justify-end transition-colors duration-500"
                                            :class="
                                                el.val === 'err'
                                                    ? 'text-[#F83068]'
                                                    : el.val === null
                                                    ? 'text-[#3E688E]'
                                                    : 'text-[#ADEBFF] hover:text-[#58B1FF]'
                                            "
                                            @mouseenter="
                                                (e) =>
                                                    handleTableDeviceEnter(s.dev, e as MouseEvent)
                                            "
                                            @mouseleave="handleTableDeviceLeave"
                                        >
                                            {{ el['dev-addr'] }}
                                        </div>
                                        <div class="w-[50px] ml-5 flex justify-end uppercase">
                                            {{
                                                curNumberingSystem === 'dec'
                                                    ? el['reg-addr']
                                                    : el['reg-addr'].toString(16)
                                            }}
                                        </div>
                                        <div class="w-[50px] ml-5 mr-3 flex justify-end uppercase">
                                            <div
                                                :class="
                                                    el.val === 'err'
                                                        ? 'text-[#F83068]'
                                                        : el.val === null
                                                        ? 'text-[#3E688E]'
                                                        : 'text-[#ADEBFF]'
                                                "
                                            >
                                                {{
                                                    el.val === 'err' || el.val === null
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
        <div
            v-if="props.isInit"
            class="h-[3.125rem] border-t border-[#1D4162] px-4 flex items-center justify-between"
        >
            <div class="flex">
                <span
                    class="select-none h-[22px] w-16 text-sm font-Roboto flex items-center rounded-l-[8px] flex items-center justify-center"
                    :class="
                        curNumberingSystem === 'dec'
                            ? 'bg-[#023E71] text-[#2B9BFF] select-none'
                            : 'bg-[#0F304B] text-[#5F93C2] cursor-pointer'
                    "
                    @click="indexStore.setCurNumberingSystem('dec')"
                    >DEC</span
                >
                <span
                    class="select-none h-[22px] w-16 text-sm font-Roboto flex items-center rounded-r-[8px] flex items-center justify-center"
                    :class="
                        curNumberingSystem === 'hex'
                            ? 'bg-[#023E71] text-[#2B9BFF] select-none'
                            : 'bg-[#0F304B] text-[#5F93C2] cursor-pointer'
                    "
                    @click="indexStore.setCurNumberingSystem('hex')"
                    >HEX</span
                >
            </div>
            <div class="flex">
                <OutlinedButton
                    class="mr-2 min-w-[104px]"
                    @click="$emit('init')"
                    >{{ t('back') }}</OutlinedButton
                >
                <PrimaryButton
                    class="min-w-[84px]"
                    @click="handleSaveClick"
                    >{{ t('save') }}</PrimaryButton
                >
            </div>
        </div>
        <ModbusPopUp
            v-if="showPopUp"
            :el="popUpEl"
            :command="popUpCommand"
            :state="fullState"
            :w="w"
            :newReg="newReg"
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
import PrimaryButton from '@/components/Ui/PrimaryButton.vue';
import OutlinedButton from '@/components/Ui/OutlinedButton.vue';
import type { Widget } from '@/stores';

const props = defineProps<{
    w: { w: Widget; state: number[] };
    isInit: boolean;
}>();

const emit = defineEmits<{
    (e: 'init'): void;
}>();

const indexStore = useIndexStore();

const {
    curNumberingSystem,
    devicesState,
    notConnected,
    choosenMbDevices,
    mbDevs,
    mbDevsLabels,
    labels,
} = storeToRefs(indexStore);

const { saveToFile } = useReadWriteFiles();

const api = indexStore.getApi().api;

const isAborted = indexStore.getApi().isAborted;

let getMbInfoTimer: ReturnType<typeof setTimeout> | undefined | null = null;

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

const popUpCommand = ref<'delete' | 'create' | 'update' | 'createReg' | undefined>(undefined);

const tableWrapper = ref<HTMLElement | undefined>();

const di = ref<HTMLElement | undefined>();

const coil = ref<HTMLElement | undefined>();

const ir = ref<HTMLElement | undefined>();

const hr = ref<HTMLElement | undefined>();

const varsWrapper = ref<HTMLElement | undefined>();

const labelPosition = ref<'top' | 'bottom'>('bottom');

const itemsStatuses = ref<[string | number | null] | []>([]);

const popUpEl = ref<{
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
    'reg-addr': number;
    'dev-addr': number;
    val: number | null | 'err';
} | null>(null);

const hoveredBinOutItem = ref<{
    i: number;
    state: {
        type?: 'hr' | 'ir' | 'coil' | 'di';
        'reg-addr': number;
        'dev-addr': number;
        val: number | null | 'err';
    };
} | null>(null);

const activeLabel = ref<{
    i: number;
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
            | 'di';
        'reg-addr': number;
        'dev-addr': number;
        val: number | null | 'err';
    };
} | null>(null);

const mouseupX = ref<number>(0);

const newReg = ref<{ dev: number; type: 'hr' | 'ir' | 'coil' | 'di' } | null>(null);

const curMbDevLabels = computed<string[]>(() => {
    return mbDevsLabels.value[props.w.w.d][props.w.w.bus || 0];
});

const state = ref<(number | null | 'err')[]>([...props.w.state]);

const fullState = ref<
    {
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
        'reg-addr': number;
        'dev-addr': number;
        val: number | null | 'err';
        label: string;
    }[]
>([]);

const curState = computed<
    | {
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
              | 'di';
          'reg-addr': number;
          'dev-addr': number;
          val: number | null | 'err';
          label: string;
      }[]
    | []
>(() => {
    return fullState.value.filter((el) => el.type !== 'none') as {
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
            | 'di';
        'reg-addr': number;
        'dev-addr': number;
        val: number | null | 'err';
        label: string;
    }[];
});

const errArr = computed<number[]>(() => {
    return curState.value.filter((el) => el.val === 'err').map((el) => el['dev-addr']);
});

const initArr = computed<number[]>(() => {
    return curState.value
        .filter((el) => el.val === null && !el.type.includes('w'))
        .map((el) => el['dev-addr']);
});

const diArr = computed<
    | {
          dev: number;
          vals: {
              type: 'di';
              'reg-addr': number;
              'dev-addr': number;
              val: number | null | 'err';
              label: string;
          }[];
      }[]
    | []
>(() => {
    const arr = curState.value.filter(
        (el) => el.type === 'di' && curChoosenDevs.value.includes(el['dev-addr']),
    ) as {
        type: 'di';
        'reg-addr': number;
        'dev-addr': number;
        val: number;
        label: string;
    }[];
    const res: {
        dev: number;
        vals: { type: 'di'; 'reg-addr': number; 'dev-addr': number; val: number; label: string }[];
    }[] = [];
    arr.forEach((el) => {
        const index = res.findIndex((elem) => elem.dev === el['dev-addr']);
        if (index !== -1) {
            res[index].vals.push(el);
        } else {
            res.push({ dev: el['dev-addr'], vals: [el] });
        }
    });
    const curDevAddr = Array.from(new Set(arr.map((el) => el['dev-addr'])));
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
          vals: {
              type: 'coil' | 'wm-coil' | 'w-coil' | 'm-coil';
              'reg-addr': number;
              'dev-addr': number;
              val: number | null | 'err';
              label: string;
          }[];
      }[]
    | []
>(() => {
    const arr = curState.value.filter(
        (el) =>
            (el.type === 'coil' ||
                el.type === 'wm-coil' ||
                el.type === 'w-coil' ||
                el.type === 'm-coil') &&
            curChoosenDevs.value.includes(el['dev-addr']),
    ) as {
        type: 'coil' | 'wm-coil' | 'w-coil' | 'm-coil';
        'reg-addr': number;
        'dev-addr': number;
        val: number;
        label: string;
    }[];
    const res: {
        dev: number;
        vals: {
            type: 'coil' | 'wm-coil' | 'w-coil' | 'm-coil';
            'reg-addr': number;
            'dev-addr': number;
            val: number;
            label: string;
        }[];
    }[] = [];
    arr.forEach((el) => {
        const index = res.findIndex((elem) => elem.dev === el['dev-addr']);
        if (index !== -1) {
            res[index].vals.push(el);
        } else {
            res.push({ dev: el['dev-addr'], vals: [el] });
        }
    });
    const curDevAddr = Array.from(new Set(arr.map((el) => el['dev-addr'])));
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
          vals: {
              type: 'ir';
              'reg-addr': number;
              'dev-addr': number;
              val: number | null | 'err';
              label: string;
          }[];
      }[]
    | []
>(() => {
    const arr = curState.value.filter(
        (el) => el.type === 'ir' && curChoosenDevs.value.includes(el['dev-addr']),
    ) as {
        type: 'ir';
        'reg-addr': number;
        'dev-addr': number;
        val: number;
        label: string;
    }[];
    const res: {
        dev: number;
        vals: { type: 'ir'; 'reg-addr': number; 'dev-addr': number; val: number; label: string }[];
    }[] = [];
    arr.forEach((el) => {
        const index = res.findIndex((elem) => elem.dev === el['dev-addr']);
        if (index !== -1) {
            res[index].vals.push(el);
        } else {
            res.push({ dev: el['dev-addr'], vals: [el] });
        }
    });
    const curDevAddr = Array.from(new Set(arr.map((el) => el['dev-addr'])));
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
          vals: {
              type: 'hr' | 'wm-hr' | 'w-hr' | 'm-hr';
              'reg-addr': number;
              'dev-addr': number;
              val: number | null | 'err';
              label: string;
          }[];
      }[]
    | []
>(() => {
    const arr = curState.value.filter(
        (el) =>
            (el.type === 'hr' || el.type === 'wm-hr' || el.type === 'w-hr' || el.type === 'm-hr') &&
            curChoosenDevs.value.includes(el['dev-addr']),
    ) as {
        type: 'hr' | 'wm-hr' | 'w-hr' | 'm-hr';
        'reg-addr': number;
        'dev-addr': number;
        val: number;
        label: string;
    }[];
    const res: {
        dev: number;
        vals: {
            type: 'hr' | 'wm-hr' | 'w-hr' | 'm-hr';
            'reg-addr': number;
            'dev-addr': number;
            val: number;
            label: string;
        }[];
    }[] = [];
    arr.forEach((el) => {
        const index = res.findIndex((elem) => elem.dev === el['dev-addr']);
        if (index !== -1) {
            res[index].vals.push(el);
        } else {
            res.push({ dev: el['dev-addr'], vals: [el] });
        }
    });
    const curDevAddr = Array.from(new Set(arr.map((el) => el['dev-addr'])));
    curChoosenDevs.value.forEach((el) => {
        if (!curDevAddr.includes(el)) {
            res.push({ dev: el, vals: [] });
        }
    });
    return res.sort((a, b) => a.dev - b.dev);
});

const curDevs = computed<number[]>(() => {
    let res: number[] = [];
    if (mbDevs.value.length && mbDevs.value[props.w.w.d]) {
        res = mbDevs.value[props.w.w.d][props.w.w.bus || 0];
    }
    return res;
});

async function getMbInfo() {
    try {
        const r = await api.post('get_mb_info', {
            device: props.w.w.d,
            bus: 0,
        });
        const data = (await r.data) as {
            type: ['hr' | 'di' | 'coil' | 'wm-coil' | 'w-coil' | 'm-coil' | 'ir'];
            'dev-addr': number[];
            'reg-addr': number[];
        };
        const arr: {
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
            'reg-addr': number;
            'dev-addr': number;
            val: number | null | 'err';
            label: string;
        }[] = [];
        const curLabels =
            labels.value[props.w.w.d]?.find((el) => el.interf === props.w.w.i)?.val[
                props.w.w.bus || 0
            ] || [];
        for (let i = 0; i < state.value.length; i++) {
            if (
                mbDevs.value.length &&
                mbDevs.value[props.w.w.d][props.w.w.bus || 0].includes(data['dev-addr'][i])
            ) {
                arr.push({
                    type: data.type[i],
                    'reg-addr': data['reg-addr'][i] as number,
                    'dev-addr': data['dev-addr'][i] as number,
                    val: state.value[i],
                    label: curLabels[i] || '\u2013',
                });
            }
        }
        fullState.value = [...arr];
        if (getMbInfoTimer !== undefined) {
            getMbInfoTimer = setTimeout(getMbInfo, 3000);
        }
    } catch (error) {
        if (isAborted.value) {
            return;
        }
        if (getMbInfoTimer !== undefined) {
            getMbInfoTimer = setTimeout(getMbInfo, 20);
        }
    }
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
    s: {
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
            | 'di';
        'reg-addr': number;
        'dev-addr': number;
        val: number | null | 'err';
        label: string;
    },
    index: number,
) {
    activeLabel.value = { i: index, state: s };
    activeLabelInputVal.value = s.label === '\u2013' ? '' : s.label;
    if (s.type === 'hr' || s.type === 'wm-hr' || s.type === 'w-hr' || s.type === 'm-hr')
        activeLabelInputValue.value = s.val === null ? '\u2013' : s.val.toString();
    window.addEventListener('click', saveData);
    window.addEventListener('keypress', saveData);
}

function saveData(e: KeyboardEvent | MouseEvent) {
    if (!activeLabel.value) return;
    if (e.type === 'keypress') {
        const event: KeyboardEvent = e as KeyboardEvent;
        if (event.key === 'Enter') {
            setLabel(
                activeLabel.value.state as {
                    type?: 'hr' | 'ir' | 'coil' | 'di';
                    'reg-addr': number;
                    'dev-addr': number;
                    val: number;
                    label: string;
                },
                activeLabelInputVal.value,
            );
            if (!isInvalidData.value && activeLabel.value.state.type.includes('hr')) {
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
        setLabel(
            activeLabel.value.state as {
                type?: 'hr' | 'ir' | 'coil' | 'di';
                'reg-addr': number;
                'dev-addr': number;
                val: number;
                label: string;
            },
            activeLabelInputVal.value,
        );
        if (!isInvalidData.value && activeLabel.value.state.type.includes('hr')) {
            setData(activeLabel.value.state, +activeLabelInputValue.value);
        }
        isInvalidData.value = false;
        activeLabelInputValue.value = '0';
        activeLabel.value = null;
        activeLabelInputVal.value = '';
    }
}

async function setLabel(
    s: {
        type?: 'hr' | 'ir' | 'coil' | 'di';
        'reg-addr': number;
        'dev-addr': number;
        val: number;
        label: string;
    },
    label: string,
) {
    const vals = [...fullState.value.map((el) => el.label)];
    const newLabels = [...vals];
    const index = fullState.value.findIndex((el) => JSON.stringify(el) === JSON.stringify(s));
    if (index === -1) return;
    newLabels[index] = label;
    saveLabel(newLabels);
}

async function saveLabel(labels: string[]) {
    const isSavingError = await saveToFile(
        {
            type: 'labels',
            device: props.w.w.d,
            bus: props.w.w.bus || 0,
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
        { labels: labels },
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
            labels,
            props.w.w.bus,
        );
    }
}

async function setData(
    el: {
        type:
            | 'hr'
            | 'ir'
            | 'coil'
            | 'di'
            | 'wm-hr'
            | 'w-hr'
            | 'm-hr'
            | 'wm-coil'
            | 'w-coil'
            | 'm-coil';
        'reg-addr': number;
        'dev-addr': number;
        val: number | null | 'err';
    },
    val: number,
) {
    if ((el.type !== 'hr' && el.type !== 'm-hr') || el.val === 'err' || el.val === null) return;
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
            if (prevStateIndex !== -1 && devStates[prevStateIndex].state[newIndex] !== undefined)
                devStates[prevStateIndex].state[newIndex] = val;
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

    if (curNumberingSystem.value === 'dec') {
        if (isNaN(+target.value)) return;
        if (+target.value < 0) {
            activeLabelInputValue.value = String(0);
        } else if (+target.value > 65535) {
            activeLabelInputValue.value = String(65535);
        } else {
            activeLabelInputValue.value = target.value;
        }
    } else {
        const val = parseInt(target.value, 16);
        if (isNaN(val)) return;
        if (val < 0) {
            activeLabelInputValue.value = String(0);
        } else if (val > 65535) {
            activeLabelInputValue.value = String(65535);
        } else {
            activeLabelInputValue.value = String(val);
        }
    }
}

function handleBinOutMouseEnter(
    i: number,
    el: {
        type: 'hr' | 'ir' | 'coil' | 'wm-coil' | 'w-coil' | 'm-coil' | 'di';
        'reg-addr': number;
        'dev-addr': number;
        val: number | null | 'err';
    },
) {
    hoveredBinOutItem.value = {
        i: i,
        state: {
            type: (el.type.includes('hr') ? 'hr' : el.type.includes('coil') ? 'coil' : el.type) as
                | 'hr'
                | 'ir'
                | 'coil'
                | 'di',
            'reg-addr': el['reg-addr'],
            'dev-addr': el['dev-addr'],
            val: el.val,
        },
    };
}

function handleBinOutMouseLeave() {
    hoveredBinOutItem.value = null;
}

async function handleCoilClick(el: {
    type: 'hr' | 'ir' | 'coil' | 'wm-coil' | 'w-coil' | 'm-coil' | 'di';
    'reg-addr': number;
    'dev-addr': number;
    val: number | null | 'err';
}) {
    if (
        (el.type !== 'coil' &&
            el.type !== 'wm-coil' &&
            el.type !== 'w-coil' &&
            el.type !== 'm-coil') ||
        el.val === null ||
        el.val === 'err'
    )
        return;
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
            if (prevStateIndex !== -1 && devStates[prevStateIndex].state[newIndex] !== undefined)
                devStates[prevStateIndex].state[newIndex] = el.val ? 0 : 1;
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
    type: 'hr' | 'wm-hr' | 'w-hr' | 'm-hr' | 'ir' | 'coil' | 'wm-coil' | 'w-coil' | 'm-coil' | 'di';
    'reg-addr': number;
    'dev-addr': number;
    val: number | null | 'err';
}) {
    showPopUp.value = true;
    popUpEl.value = {
        type: el.type,
        'reg-addr': el['reg-addr'],
        'dev-addr': el['dev-addr'],
        val: el.val,
    };
    popUpCommand.value = 'delete';
}

function updateItem() {
    showPopUp.value = true;
    popUpCommand.value = 'update';
}

function createItem() {
    showPopUp.value = true;
    popUpCommand.value = 'create';
}

function createReg(dev: number, type: 'hr' | 'ir' | 'coil' | 'di') {
    showPopUp.value = true;
    newReg.value = { dev: dev, type: type };
    popUpCommand.value = 'createReg';
}

function closePopUp() {
    showPopUp.value = false;
    newReg.value = null;
    popUpEl.value = null;
    popUpCommand.value = undefined;
}

function handleRegLabelClick(type: 'di' | 'coil' | 'ir' | 'hr', index: number, i: number) {
    if (!tableWrapper.value || !di.value || !coil.value || !ir.value || !hr.value) return;
    let top = 0; // 70 - height of table header; 30 - hight of table line;
    let n = i;
    if (type === 'di') {
        for (let j = 0; j < index; j++) {
            n += diArr.value[j].vals.length;
        }
        top = n * 30;
    } else if (type === 'coil') {
        for (let j = 0; j < index; j++) {
            n += coilArr.value[j].vals.length;
        }
        top = di.value.offsetHeight + n * 30;
    } else if (type === 'ir') {
        for (let j = 0; j < index; j++) {
            n += irArr.value[j].vals.length;
        }
        top = di.value.offsetHeight + coil.value.offsetHeight + n * 30;
    } else {
        for (let j = 0; j < index; j++) {
            n += hrArr.value[j].vals.length;
        }
        top = di.value.offsetHeight + coil.value.offsetHeight + ir.value.offsetHeight + n * 30;
    }
    tableWrapper.value.scrollTo({
        top: top,
        behavior: 'smooth',
    });
}

function handleMouseEnter(e: MouseEvent) {
    const target = e.target as HTMLElement;
    if (!target || !varsWrapper.value) return;
    // 56 - max label height
    labelPosition.value =
        target.offsetTop - varsWrapper.value.scrollTop + 56 >= varsWrapper.value.offsetHeight
            ? 'top'
            : 'bottom';
}

async function handleSaveClick() {
    if (isInvalidData.value !== null) return;
    try {
        const r = await api.post('set_ent_init', {
            type: props.w.w.i,
            device: props.w.w.d,
            index: 0,
            state: itemsStatuses.value,
        });
        if (r.data.status === 'ok') {
            emit('init');
        } else {
            console.log(r.data.status);
            throw new Error();
        }
    } catch (error) {
        if (isAborted.value) {
            return;
        }
        setTimeout(() => {
            handleSaveClick();
        }, 5);
    }
}

async function getEntInit() {
    try {
        const quant = devicesState.value[props.w.w.d].find((el) => el.type === props.w.w.i)?.state
            .length;
        if (!quant) return;
        const r = await api.post('get_ent_init', {
            type: props.w.w.i,
            device: props.w.w.d,
            index: 0,
            quantity: quant,
        });
        const res = await r.data.state;
        itemsStatuses.value = res;
    } catch (error) {
        if (isAborted.value) {
            return;
        }
        setTimeout(() => {
            getEntInit();
        }, 20);
    }
}

watch(
    () => devicesState.value,
    () => {
        const newState = devicesState.value[props.w.w.d].find((obj) => obj.type === props.w.w.i)
            ?.state as number[];
        state.value = newState ? newState : [...props.w.state];
    },
);

watch(
    () => curDevs.value,
    () => {
        curChoosenDevs.value = [...curChoosenDevs.value].filter((el) => curDevs.value.includes(el));
    },
);

watch(
    () => props.isInit,
    () => {
        if (props.isInit) getEntInit();
    },
);

onMounted(() => {
    getMbInfo();
    const wrapper = scrollWrapper.value;
    const el = scrollEl.value;
    if (!wrapper || !el) return;
    isEndScrollEl.value = !(wrapper.offsetWidth <= el.offsetWidth);
    if (choosenMbDevices.value[props.w.w.d]) {
        curChoosenDevs.value = choosenMbDevices.value[props.w.w.d];
    } else {
        curChoosenDevs.value = curDevs.value;
    }
});

onBeforeUnmount(() => {
    clearTimeout(getMbInfoTimer as number | undefined);
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
            err: 'ошибка',
            mbDevsInit: 'Есть регистры в состоянии инициализации',
            mbDevsErr: 'Есть регистры в состоянии ошибки',
            back: 'Назад',
            save: 'Сохранить',
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
            err: 'error',
            mbDevsInit: 'There are registers in initialization state',
            mbDevsErr: 'There are registers in an error state',
            back: 'Back',
            save: 'Save',
        },
    },
});
</script>
