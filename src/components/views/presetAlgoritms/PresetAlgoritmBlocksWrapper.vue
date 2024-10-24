<template>
    <div
        class="bg-[#0A2B47] rounded-t-[8px] overflow-hidden flex-1"
        :style="{ width: 'calc(50% - 10px)' }"
    >
        <div class="h-[80px] flex items-center justify-between px-6">
            <div class="flex flex-col gap-2">
                <div class="text-lg font-semibold leading-[120%] text-[#ADEBFF] select-none">
                    Название алгоритма
                </div>
                <div class="text-sm font-semibold leading-[120%] text-[#6CB5D3] select-none">
                    Группа / Шаблон
                </div>
            </div>
            <SaveButton
                :isSaving="isSaving"
                :is-disabled="isSaveBtnDisabled"
                class="w-[7.563rem]"
                @click="save"
            />
        </div>
        <div class="w-full h-[1px] bg-[#2C5982]"></div>
        <div
            class="overflow-y-auto scrollbar-4 flex flex-col pb-1"
            :style="{ height: 'calc(100vh - 188px)' }"
        >
            <div class="flex-1 flex">
                <div class="pl-[1.875rem] pr-6 pt-7">
                    <div class="w-[1px] h-full bg-[#158EF8]"></div>
                </div>
                <div :style="{ width: 'calc(100% - 55px)' }">
                    <PresetAlgoritmBlock
                        v-for="(item, i) in config"
                        :key="i"
                        :numb="i"
                        :queue="item.queue"
                        :isFirst="!i"
                        :isLast="!!(config && i === config.length - 1)"
                        :titles="item.titles"
                        :btns="item.btns"
                        :tabs="item.tabs"
                        :radioBtns="item.radioBtns"
                        :checkBoxes="item.checkBoxes"
                        :inputs="item.inputs"
                        @handleBtnClick="
                            (btnsItemIndex: number, val: string | number) => {
                                handleBtnClick(i, btnsItemIndex, val);
                            }
                        "
                        @handleTabClick="
                            (tabsItemIndex: number, val: string | number) => {
                                handleTabClick(i, tabsItemIndex, val);
                            }
                        "
                        @handleRadioBtnClick="
                            (radioBtnsItemIndex: number, val: string) => {
                                handleRadioBtnClick(i, radioBtnsItemIndex, val);
                            }
                        "
                        @handleCheckboxClick="
                            (
                                checkboxItemIndex: number,
                                val: string,
                                status: boolean,
                                part: 1 | 2,
                            ) => {
                                handleCheckboxClick(i, checkboxItemIndex, val, status, part);
                            }
                        "
                        @handleInput="
                            (inputItemIndex: number, val: number) => {
                                handleInput(i, inputItemIndex, val);
                            }
                        "
                        @setInputError="
                            (inputItemIndex: number, res: boolean) => {
                                setInputError(i, inputItemIndex, res);
                            }
                        "
                    />
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import PresetAlgoritmBlock from '@/components/views/presetAlgoritms/PresetAlgoritmBlock.vue';
import SaveButton from '@/components/Ui/SaveButton.vue';

const indexStore = useIndexStore();

const { devices } = storeToRefs(indexStore);

const isSaving = ref(false);

const isSaveBtnDisabled = ref(true);

const initConfig = ref<string>();

const inputErrors = new Set();

const config = ref<
    {
        queue: {
            name: 'title' | 'btns' | 'tabs' | 'dropDown' | 'radioBtns' | 'input' | 'checkBox';
            index: number;
        }[];
        titles: string[];
        btns: {
            subtitle?: string;
            isGreen?: boolean;
            vals: { label: string | number; val: string | number; class?: string }[];
            val: string | number;
            inline?: boolean;
        }[];
        tabs: {
            vals: { label: string; val: string | number }[];
            val: string | number;
        }[];
        radioBtns: {
            vals: { label: string; val: string }[];
            val: string;
            groupName: string;
            wrap?: boolean;
        }[];
        checkBoxes: {
            1: {
                title: string;
                vals: { label: string; val: string }[];
                valsArr: string[];
            };
            2: {
                title: string;
                vals: { label: string; val: string }[];
                valsArr: string[];
            };
        }[];
        inputs: {
            val: number;
            min: number;
            max?: number;
            subtitle?: string;
            isError: boolean;
            inline?: boolean;
        }[];
    }[]
>();

function save() {
    // TODO
    // isSaving
}

function checkConfigToSave() {
    if (inputErrors.size) {
        isSaveBtnDisabled.value = true;
    } else {
        isSaveBtnDisabled.value = initConfig.value === JSON.stringify(config.value);
    }
}

function handleBtnClick(configItemIndex: number, btnsItemIndex: number, val: string | number) {
    if (!config.value) return;
    const prevConfig = [...config.value];
    if (prevConfig[configItemIndex] && prevConfig[configItemIndex].btns[btnsItemIndex]) {
        prevConfig[configItemIndex].btns[btnsItemIndex].val = val;
        config.value = prevConfig;
    }
    checkConfigToSave();
}

function handleTabClick(configItemIndex: number, tabsItemIndex: number, val: string | number) {
    if (!config.value) return;
    const prevConfig = [...config.value];
    if (prevConfig[configItemIndex] && prevConfig[configItemIndex].tabs[tabsItemIndex]) {
        prevConfig[configItemIndex].tabs[tabsItemIndex].val = val;
        config.value = prevConfig;
    }
    checkConfigToSave();
}

function handleRadioBtnClick(configItemIndex: number, radioBtnsItemIndex: number, val: string) {
    if (!config.value) return;
    const prevConfig = [...config.value];
    if (prevConfig[configItemIndex] && prevConfig[configItemIndex].radioBtns[radioBtnsItemIndex]) {
        prevConfig[configItemIndex].radioBtns[radioBtnsItemIndex].val = val;
        config.value = prevConfig;
    }
    checkConfigToSave();
}

function handleCheckboxClick(
    configItemIndex: number,
    checkboxItemIndex: number,
    val: string,
    status: boolean,
    part: 1 | 2,
) {
    if (!config.value) return;
    const prevConfig = [...config.value];
    if (prevConfig[configItemIndex] && prevConfig[configItemIndex].checkBoxes[checkboxItemIndex]) {
        if (status) {
            prevConfig[configItemIndex].checkBoxes[checkboxItemIndex][part].valsArr = [
                ...prevConfig[configItemIndex].checkBoxes[checkboxItemIndex][part].valsArr,
                val,
            ].sort();
        } else {
            prevConfig[configItemIndex].checkBoxes[checkboxItemIndex][part].valsArr = [
                ...prevConfig[configItemIndex].checkBoxes[checkboxItemIndex][part].valsArr.filter(
                    (el) => el !== val,
                ),
            ];
        }
        config.value = prevConfig;
    }
    checkConfigToSave();
}

function handleInput(configItemIndex: number, inputItemIndex: number, val: number) {
    if (!config.value) return;
    const prevConfig = [...config.value];
    if (prevConfig[configItemIndex] && prevConfig[configItemIndex].inputs[inputItemIndex]) {
        prevConfig[configItemIndex].inputs[inputItemIndex].val = val;
        config.value = prevConfig;
    }
    checkConfigToSave();
}

function setInputError(configItemIndex: number, inputItemIndex: number, res: boolean) {
    if (res) {
        inputErrors.add(configItemIndex + '-' + inputItemIndex);
    } else {
        inputErrors.delete(configItemIndex + '-' + inputItemIndex);
    }
    if (!config.value) return;
    const prevConfig = [...config.value];
    if (prevConfig[configItemIndex] && prevConfig[configItemIndex].inputs[inputItemIndex]) {
        prevConfig[configItemIndex].inputs[inputItemIndex].isError = res;
        config.value = prevConfig;
    }
    checkConfigToSave();
}

const { t } = useI18n({
    messages: {
        en: {
            titles: {
                startStatus: 'Status at system startup',
                triggerInterf: 'Trigger Interface',
                triggerDev: 'Trigger device',
                triggerObj: 'Trigger object',
                triggerBus: 'Trigger digital bus number:',
                triggerType: 'Trigger type',
                comparisonOperation: 'Comparison operation',
                comparisonVal: 'Comparison value',
                enter: 'Enter',
                select: 'Select',
                comparisonObjInterf: 'Comparison object interface',
                comparisonDevStatus: 'Device structure for comparison',
                comparisonObjBus: 'Digital bus number of the object for comparison',
                compareObj: 'Object to compare',
                hysteresis: 'Hysteresis',
                during: 'During',
                device: 'Device',
                object: 'Object',
                selectActions: 'Select actions',
                actionType: 'Action type',
                value: 'Value',
                endValue: 'End value',
                selectConditions: 'Select conditions',
                startMode: 'Startup mode',
                stop: 'Stop',
                cyclicMode: 'Cyclic operation mode',
                operation: 'Operation',
                endless: 'Endless',
                initDir: 'Initial direction',
            },
            btns: {
                on: 'ON',
                off: 'OFF',
                const: 'CONSTANT',
                obj: 'OBJECT',
                timVar: 'TIME VARIABLE',
                ms: 'x1 MS',
                s: 'x1 SEC',
                min: 'x1 MIN',
                prev: 'PREVIOUS',
                anyCond: 'ANY OF THE CONDITIONS',
                allCond: 'ALL CONDITIONS',
                yes: 'YES',
                no: 'NO',
                toMin: 'TO A MINIMUM',
                toMax: 'TO THE MAXIMUM',
            },
            tabs: {
                '1w-rom': '1-wire ID',
                '1w-sens': '1-wire Thermometers',
                'bin-in': 'Discrete inputs',
                'adc-in': 'Analog inputs',
                'bin-out': 'Discrete outputs',
                'pwm-out': 'PWM outputs',
                'mb-co': 'MODBUS CO',
                'mb-ir': 'MODBUS IR',
                'mb-hr': 'MODBUS HR',
                'mb-di': 'MODBUS DI',
                'bin-var': 'Binary variables',
                'int-var': 'Integer variables',
                'tim-var': 'Time variables',
                bus: 'Bus ',
            },
            radioBtns: {
                comparison: 'Comparison',
                retention: 'Retention',
                anyChange: 'Any change',
                less: 'Less',
                lessEqual: 'Less or equal',
                more: 'More',
                moreEqual: 'More or equal',
                equal: 'Equal',
                notEqual: 'Not equal',
                binaryEqual: 'Binary equals',
                binaryNotEqual: 'Binary is not equal',
                install: 'Install',
                invert: 'Invert',
                increase: 'Increase',
                smoothChange: 'Change smoothly',
                cyclicChange: 'Cyclic change',
                stop: 'Stop',
                add: 'Add',
                subtract: 'Subtract',
                multiply: 'Multiply',
                divide: 'Divide',
                divideRemainder: 'Remainder of the division',
                takeMax: 'Take the maximum',
                takeMin: 'Take the minimum',
                shiftLeft: 'Bitwise shift left',
                shiftRight: 'Bitwise shift right',
            },
            checkBoxes: {
                conditionsOccur: 'When conditions occur',
                triggerNoMatches: 'Trigger no longer matches',
                conditionNoMatches: 'Condition no longer matches',
            },
        },
        ru: {
            titles: {
                startStatus: 'Статус при запуске системы',
                triggerInterf: 'Интерфейс триггера',
                triggerDev: 'Устройство триггера',
                triggerObj: 'Объект триггера',
                triggerBus: 'Номер цифровой шины триггера',
                triggerType: 'Тип триггера',
                comparisonOperation: 'Операция сравнения',
                comparisonVal: 'Значение для сравнения',
                enter: 'Введите',
                select: 'Выберите',
                comparisonObjInterf: 'Интерфейс объекта для сравнения',
                comparisonDevStatus: 'Устройство объекта для сравнения',
                comparisonObjBus: 'Номер цифровой шины объекта для сравнения',
                compareObj: 'Объект для сравнения',
                hysteresis: 'Гистерезис',
                during: 'В течение',
                device: 'Устройство',
                object: 'Объект',
                selectActions: 'Выберите действия',
                actionType: 'Тип действия',
                value: 'Значение',
                endValue: 'Значение по окончанию действия',
                selectConditions: 'Выберите условия',
                startMode: 'Режим запуска',
                stop: 'Остановка',
                cyclicMode: 'Режим работы циклического изменения',
                operation: 'Операция',
                endless: 'Бесконечный',
                initDir: 'Начальное направление',
            },
            btns: {
                on: 'ВКЛЮЧЕНО',
                off: 'ВЫКЛЮЧЕНО',
                const: 'КОНСТАНТА',
                obj: 'ОБЪЕКТ',
                timVar: 'ПЕРЕМЕННАЯ ВРЕМЕНИ',
                ms: 'х1 МС',
                s: 'х1 СЕК',
                min: 'х1 МИН',
                prev: 'ПРЕДЫДУЩЕЕ',
                anyCond: 'ЛЮБОЕ ИЗ УСЛОВИЙ',
                allCond: 'ВСЕ УСЛОВИЯ',
                yes: 'ДА',
                no: 'НЕТ',
                toMin: 'К МИНИМУМУ',
                toMax: 'К МАКСИМУМУ',
            },
            tabs: {
                '1w-rom': '1-wire ID',
                '1w-sens': '1-wire термометры',
                'bin-in': 'Дискретные входы',
                'adc-in': 'Аналоговые входы',
                'bin-out': 'Дискретные выходы',
                'pwm-out': 'ШИМ-выходы',
                'mb-co': 'MODBUS CO',
                'mb-ir': 'MODBUS IR',
                'mb-hr': 'MODBUS HR',
                'mb-di': 'MODBUS DI',
                'bin-var': 'Бинарные переменные',
                'int-var': 'Целочисленные переменные',
                'tim-var': 'Переменные времени',
                bus: 'Шина ',
            },
            radioBtns: {
                comparison: 'Сравнение',
                retention: 'Удержание',
                anyChange: 'Любое изменение',
                less: 'Меньше',
                lessEqual: 'Меньше или равно',
                more: 'Больше',
                moreEqual: 'Больше или равно',
                equal: 'Равно',
                notEqual: 'Не равно',
                binaryEqual: 'Бинарное равно',
                binaryNotEqual: 'Бинарное не равно',
                install: 'Установить',
                invert: 'Инвертировать',
                increase: 'Увеличить',
                smoothChange: 'Плавно изменить',
                cyclicChange: 'Циклическое изменение',
                stop: 'Остановить',
                add: 'Сложить',
                subtract: 'Вычесть',
                multiply: 'Умножить',
                divide: 'Разделить',
                divideRemainder: 'Остаток от деления',
                takeMax: 'Взять максимальное',
                takeMin: 'Взять минимальное',
                shiftLeft: 'Побитовый сдвиг влево',
                shiftRight: 'Побитовый сдвиг вправо',
            },
            checkBoxes: {
                conditionsOccur: 'При наступлении условий',
                triggerNoMatches: 'Триггер больше не соответствует',
                conditionNoMatches: 'Условие больше не соответствует',
            },
        },
    },
});

function setConfig() {
    const devVals: { label: string; val: string | number }[] = [];
    [...new Set(devices.value)].map((el) => {
        const res = el.addr ? `IO ${el.addr}` : 'NGC';
        devVals.push({ label: res, val: res });
    });
    const interfVals: { label: string; val: string | number }[] = [];
    [...new Set(devices.value)].forEach((el) => {
        el.interf.forEach((interf) => {
            if (typeof interf === 'string') {
                const val = {
                    label: t(`tabs.${interf}`),
                    val: interf,
                };
                if (!interfVals.find((elem) => elem.val === interf)) {
                    interfVals.push(val);
                }
            } else {
                if (interf.interf === 'mb-var') {
                    const co = {
                        label: t('tabs.mb-co'),
                        val: 'mb-co',
                    };
                    const ir = {
                        label: t('tabs.mb-ir'),
                        val: 'mb-ir',
                    };
                    const hr = {
                        label: t('tabs.mb-hr'),
                        val: 'mb-hr',
                    };
                    const di = {
                        label: t('tabs.mb-di'),
                        val: 'mb-di',
                    };
                    if (
                        !interfVals.find(
                            (elem) => typeof elem.val === 'string' && elem.val.includes('mb'),
                        )
                    ) {
                        interfVals.push(co, ir, hr, di);
                    }
                } else {
                    const val = {
                        label: t(`tabs.${interf.interf}`),
                        val: interf.interf,
                    };
                    if (!interfVals.find((elem) => elem.val === interf.interf)) {
                        interfVals.push(val);
                    }
                }
            }
        });
    });
    const buses = [
        { label: t('tabs.bus') + 1, val: 1 },
        { label: t('tabs.bus') + 2, val: 2 },
        { label: t('tabs.bus') + 3, val: 3 },
    ];
    if (devVals.length && interfVals.length) {
        interfVals.sort(function (a, b) {
            const order = [
                '1w-rom',
                '1w-sens',
                'bin-in',
                'adc-in',
                'bin-out',
                'pwm-out',
                'mb-co',
                'mb-ir',
                'mb-hr',
                'mb-di',
                'bin-var',
                'int-var',
                'tim-var',
            ];
            return order.indexOf(a.val as string) - order.indexOf(b.val as string);
        });
        config.value = [
            {
                queue: [
                    { name: 'title', index: 0 },
                    { name: 'btns', index: 0 },
                ],
                titles: [t('titles.startStatus')],
                btns: [
                    {
                        isGreen: true,
                        vals: [
                            { label: t('btns.on'), val: 'on' },
                            { label: t('btns.off'), val: 'off' },
                        ],
                        val: 'on',
                    },
                ],
                tabs: [],
                radioBtns: [],
                checkBoxes: [],
                inputs: [],
            },
            {
                queue: [
                    { name: 'title', index: 0 },
                    { name: 'tabs', index: 0 },
                ],
                titles: [t('titles.triggerInterf')],
                btns: [],
                tabs: [{ vals: interfVals, val: interfVals[0].val }],
                radioBtns: [],
                checkBoxes: [],
                inputs: [],
            },
            {
                queue: [
                    { name: 'title', index: 0 },
                    { name: 'tabs', index: 0 },
                ],
                titles: [t('titles.triggerDev')],
                btns: [],
                tabs: [{ vals: devVals, val: 'NGC' }],
                radioBtns: [],
                checkBoxes: [],
                inputs: [],
            },
            {
                queue: [
                    { name: 'title', index: 0 },
                    { name: 'dropDown', index: 0 },
                ],
                titles: [t('titles.triggerObj')],
                btns: [],
                tabs: [],
                radioBtns: [],
                checkBoxes: [],
                inputs: [],
            },
            {
                queue: [
                    { name: 'title', index: 0 },
                    { name: 'tabs', index: 0 },
                ],
                titles: [t('titles.triggerBus')],
                btns: [],
                tabs: [{ vals: buses, val: 1 }],
                radioBtns: [],
                checkBoxes: [],
                inputs: [],
            },
            {
                queue: [
                    { name: 'title', index: 0 },
                    { name: 'radioBtns', index: 0 },
                ],
                titles: [t('titles.triggerType')],
                btns: [],
                tabs: [],
                radioBtns: [
                    {
                        vals: [
                            { label: t('radioBtns.comparison'), val: 'comparison' },
                            { label: t('radioBtns.retention'), val: 'retention' },
                            { label: t('radioBtns.anyChange'), val: 'any' },
                        ],
                        val: 'comparison',
                        groupName: 'comparison',
                    },
                ],
                checkBoxes: [],
                inputs: [],
            },
            {
                queue: [
                    { name: 'title', index: 0 },
                    { name: 'radioBtns', index: 0 },
                ],
                titles: [t('titles.comparisonOperation')],
                btns: [],
                tabs: [],
                radioBtns: [
                    {
                        vals: [
                            { label: t('radioBtns.less'), val: 'less' },
                            { label: t('radioBtns.equal'), val: 'equal' },
                            { label: t('radioBtns.lessEqual'), val: 'lessEqual' },
                            { label: t('radioBtns.notEqual'), val: 'notEqual' },
                            { label: t('radioBtns.more'), val: 'more' },
                            { label: t('radioBtns.binaryEqual'), val: 'binaryEqual' },
                            { label: t('radioBtns.moreEqual'), val: 'moreEqual' },
                            { label: t('radioBtns.binaryNotEqual'), val: 'binaryNotEqual' },
                        ],
                        val: 'less',
                        groupName: 'less',
                        wrap: true,
                    },
                ],
                checkBoxes: [],
                inputs: [],
            },
            {
                queue: [
                    { name: 'title', index: 0 },
                    { name: 'btns', index: 0 },
                ],
                titles: [t('titles.comparisonVal')],
                btns: [
                    {
                        vals: [
                            { label: t('btns.const'), val: 'const', class: 'w-[109px]' },
                            { label: t('btns.obj'), val: 'obj', class: 'w-[109px]' },
                        ],
                        val: 'const',
                    },
                ],
                tabs: [],
                radioBtns: [],
                checkBoxes: [],
                inputs: [],
            },
            {
                queue: [
                    { name: 'title', index: 0 },
                    { name: 'input', index: 0 },
                ],
                titles: [t('titles.enter')],
                btns: [],
                tabs: [],
                radioBtns: [],
                checkBoxes: [],
                inputs: [
                    {
                        subtitle: t('titles.value'),
                        val: 0,
                        min: -32768,
                        max: 32767,
                        isError: false,
                    },
                ],
            },
            {
                queue: [
                    { name: 'title', index: 0 },
                    { name: 'btns', index: 0 },
                ],
                titles: [t('titles.select')],
                btns: [
                    {
                        vals: [
                            { label: 0, val: 0, class: 'w-[80px]' },
                            { label: 1, val: 1, class: 'w-[80px]' },
                        ],
                        val: 1,
                    },
                ],
                tabs: [],
                radioBtns: [],
                checkBoxes: [],
                inputs: [],
            },
            {
                queue: [
                    { name: 'title', index: 0 },
                    { name: 'tabs', index: 0 },
                ],
                titles: [t('titles.comparisonObjInterf')],
                btns: [],
                tabs: [{ vals: interfVals, val: interfVals[0].val }],
                radioBtns: [],
                checkBoxes: [],
                inputs: [],
            },
            {
                queue: [
                    { name: 'title', index: 0 },
                    { name: 'tabs', index: 0 },
                ],
                titles: [t('titles.comparisonDevStatus')],
                btns: [],
                tabs: [{ vals: devVals, val: 'NGC' }],
                radioBtns: [],
                checkBoxes: [],
                inputs: [],
            },
            {
                queue: [
                    { name: 'title', index: 0 },
                    { name: 'tabs', index: 0 },
                ],
                titles: [t('titles.comparisonObjBus')],
                btns: [],
                tabs: [{ vals: buses, val: 1 }],
                radioBtns: [],
                checkBoxes: [],
                inputs: [],
            },
            {
                queue: [
                    { name: 'title', index: 0 },
                    { name: 'dropDown', index: 0 },
                ],
                titles: [t('titles.compareObj')],
                btns: [],
                tabs: [],
                radioBtns: [],
                checkBoxes: [],
                inputs: [],
            },
            {
                queue: [
                    { name: 'title', index: 0 },
                    { name: 'input', index: 0 },
                ],
                titles: [t('titles.hysteresis')],
                btns: [],
                tabs: [],
                radioBtns: [],
                checkBoxes: [],
                inputs: [{ val: 0, min: -32768, max: 32767, isError: false }],
            },
            {
                queue: [
                    { name: 'title', index: 0 },
                    { name: 'btns', index: 0 },
                    { name: 'input', index: 0 },
                    { name: 'btns', index: 1 },
                ],
                titles: [t('titles.during')],
                btns: [
                    {
                        vals: [
                            { label: t('btns.const'), val: 'const' },
                            { label: t('btns.timVar'), val: 'tim-var' },
                        ],
                        val: 'const',
                    },
                    {
                        vals: [
                            { label: t('btns.ms'), val: 'ms', class: 'w-[66px] !px-2 !h-8' },
                            { label: t('btns.s'), val: 's', class: 'w-[66px] !px-2 !h-8' },
                            { label: t('btns.min'), val: 'min', class: 'w-[66px] !px-2 !h-8' },
                        ],
                        val: 'ms',
                        inline: true,
                    },
                ],
                tabs: [],
                radioBtns: [],
                checkBoxes: [],
                inputs: [{ val: 0, min: 0, isError: false, inline: true }],
            },
            {
                queue: [
                    { name: 'title', index: 0 },
                    { name: 'btns', index: 0 },
                    { name: 'title', index: 1 },
                    { name: 'tabs', index: 0 },
                    { name: 'title', index: 2 },
                    { name: 'dropDown', index: 0 },
                ],
                titles: [t('titles.during'), t('titles.device'), t('titles.object')],
                btns: [
                    {
                        vals: [
                            { label: t('btns.const'), val: 'const' },
                            { label: t('btns.timVar'), val: 'tim-var' },
                        ],
                        val: 'const',
                    },
                ],
                tabs: [{ vals: devVals, val: 'NGC' }],
                radioBtns: [],
                checkBoxes: [],
                inputs: [],
            },
            {
                queue: [
                    { name: 'title', index: 0 },
                    { name: 'btns', index: 0 },
                    { name: 'title', index: 1 },
                    { name: 'dropDown', index: 0 },
                ],
                titles: [t('titles.during'), t('titles.object')],
                btns: [
                    {
                        vals: [
                            { label: t('btns.const'), val: 'const' },
                            { label: t('btns.timVar'), val: 'tim-var' },
                        ],
                        val: 'tim-var',
                    },
                ],
                tabs: [],
                radioBtns: [],
                checkBoxes: [],
                inputs: [],
            },
            {
                queue: [
                    { name: 'title', index: 0 },
                    { name: 'dropDown', index: 0 },
                ],
                titles: [t('titles.selectActions')],
                btns: [],
                tabs: [],
                radioBtns: [],
                checkBoxes: [],
                inputs: [],
            },
            {
                queue: [
                    { name: 'title', index: 0 },
                    { name: 'radioBtns', index: 0 },
                ],
                titles: [t('titles.actionType')],
                btns: [],
                tabs: [],
                radioBtns: [
                    {
                        vals: [
                            { label: t('radioBtns.install'), val: 'install' },
                            { label: t('radioBtns.invert'), val: 'invert' },
                            { label: t('radioBtns.increase'), val: 'increase' },
                            { label: t('radioBtns.smoothChange'), val: 'smoothChange' },
                            { label: t('radioBtns.cyclicChange'), val: 'cyclicChange' },
                            { label: t('radioBtns.stop'), val: 'stop' },
                        ],
                        val: 'install',
                        groupName: 'install',
                    },
                ],
                checkBoxes: [],
                inputs: [],
            },
            {
                queue: [
                    { name: 'title', index: 0 },
                    { name: 'btns', index: 0 },
                ],
                titles: [t('titles.value')],
                btns: [
                    {
                        vals: [
                            { label: t('btns.const'), val: 'const', class: 'w-[109px]' },
                            { label: t('btns.obj'), val: 'obj', class: 'w-[109px]' },
                        ],
                        val: 'const',
                    },
                ],
                tabs: [],
                radioBtns: [],
                checkBoxes: [],
                inputs: [],
            },
            {
                queue: [
                    { name: 'title', index: 0 },
                    { name: 'btns', index: 0 },
                ],
                titles: [t('titles.endValue')],
                btns: [
                    {
                        vals: [
                            { label: t('btns.prev'), val: 'prev', class: 'w-[109px]' },
                            { label: t('btns.const'), val: 'const', class: 'w-[109px]' },
                            { label: t('btns.obj'), val: 'obj' },
                        ],
                        val: 'const',
                    },
                ],
                tabs: [],
                radioBtns: [],
                checkBoxes: [],
                inputs: [],
            },
            {
                queue: [
                    { name: 'title', index: 0 },
                    { name: 'btns', index: 0 },
                    { name: 'dropDown', index: 0 },
                ],
                titles: [t('titles.selectConditions')],
                btns: [
                    {
                        vals: [
                            { label: t('btns.anyCond'), val: 'any' },
                            { label: t('btns.allCond'), val: 'and' },
                        ],
                        val: 'and',
                    },
                ],
                tabs: [],
                radioBtns: [],
                checkBoxes: [],
                inputs: [],
            },
            {
                queue: [{ name: 'checkBox', index: 0 }],
                titles: [],
                btns: [],
                tabs: [],
                radioBtns: [],
                checkBoxes: [
                    {
                        1: {
                            title: t('titles.startMode'),
                            vals: [
                                { label: t('checkBoxes.conditionsOccur'), val: 'conditionsOccur' },
                            ],
                            valsArr: ['conditionsOccur'].sort(),
                        },
                        2: {
                            title: t('titles.stop'),
                            vals: [
                                {
                                    label: t('checkBoxes.triggerNoMatches'),
                                    val: 'triggerNoMatches',
                                },
                                {
                                    label: t('checkBoxes.conditionNoMatches'),
                                    val: 'conditionNoMatches',
                                },
                            ],
                            valsArr: ['triggerNoMatches'].sort(),
                        },
                    },
                ],
                inputs: [],
            },
            {
                queue: [
                    { name: 'title', index: 0 },
                    { name: 'btns', index: 0 },
                    { name: 'btns', index: 1 },
                ],
                titles: [t('titles.cyclicMode')],
                btns: [
                    {
                        subtitle: t('titles.endless'),
                        vals: [
                            { label: t('btns.yes'), val: 'yes', class: 'w-[80px]' },
                            { label: t('btns.no'), val: 'no', class: 'w-[80px]' },
                        ],
                        val: 'no',
                    },
                    {
                        subtitle: t('titles.initDir'),
                        vals: [
                            { label: t('btns.toMin'), val: 'toMin' },
                            { label: t('btns.toMax'), val: 'toMax' },
                        ],
                        val: 'toMax',
                    },
                ],
                tabs: [],
                radioBtns: [],
                checkBoxes: [],
                inputs: [],
            },
            {
                queue: [
                    { name: 'title', index: 0 },
                    { name: 'radioBtns', index: 0 },
                ],
                titles: [t('titles.operation')],
                btns: [],
                tabs: [],
                radioBtns: [
                    {
                        vals: [
                            { label: t('radioBtns.add'), val: 'add' },
                            { label: t('radioBtns.subtract'), val: 'subtract' },
                            { label: t('radioBtns.multiply'), val: 'multiply' },
                            { label: t('radioBtns.divide'), val: 'divide' },
                            { label: t('radioBtns.divideRemainder'), val: 'divideRemainder' },
                            { label: t('radioBtns.takeMax'), val: 'takeMax' },
                            { label: t('radioBtns.takeMin'), val: 'takeMin' },
                            { label: t('radioBtns.shiftLeft'), val: 'shiftLeft' },
                            { label: t('radioBtns.shiftRight'), val: 'shiftRight' },
                        ],
                        val: 'add',
                        groupName: 'add',
                    },
                ],
                checkBoxes: [],
                inputs: [],
            },
        ];
        initConfig.value = JSON.stringify(config.value);
    } else {
        setTimeout(setConfig, 200);
    }
}

onMounted(() => {
    setConfig();
});

watch(devices, () => {
    setConfig();
});
</script>
