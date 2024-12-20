import type { Body, Ent, Time } from '@/typings/funcs';
import { type Config, CurKeyMap, binaryInterfaces, type UDF } from './types';
import type { Device } from '@/stores';

const readonlyInterfaces = ['1w-rom', '1w-sens', 'bin-in', 'adc-in', 'mb-ir', 'mb-di'];

export const createConfig = async (
    curBodyVal: Body,
    typeVal: UDF,
    t: (key: string) => string,
    cbParseEntity: (ent: Ent) => Promise<Config[]>,
    cbParseTime: (time: Time, title: string) => Promise<Config[] | undefined>,
    cbParseMultiSelect: (
        type: 'udf-act' | 'udf-cond',
        idx: number,
        quant: number,
        logic?: 'and' | 'or',
    ) => Promise<Config[] | undefined>,
    propDevice?: Device,
): Promise<Config[]> => {
    const generators = [
        (curBody: Body) => createInitStateConfig(curBody, t),
        (curBody: Body) => createEntityConfig(curBody, typeVal, cbParseEntity),
        (curBody: Body) => createLeftConfigChoose(curBody, typeVal, t),
        (curBody: Body) => createLeftConfig(curBody, typeVal, cbParseEntity),
        (curBody: Body) => createLeftConfigEnter(curBody, typeVal, t),
        (curBody: Body) => createRightConfigChoose(curBody, typeVal, t),
        (curBody: Body) => createRightConfig(curBody, typeVal, cbParseEntity),
        (curBody: Body) => createRightConfigEnter(curBody, typeVal, t),
        (curBody: Body) => createResultConfig(curBody, typeVal, cbParseEntity),
        (curBody: Body) => createCompareConfig(curBody, typeVal, t),
        (curBody: Body) => createComparisonOperationConfig(curBody, typeVal, t),
        (curBody: Body) => createMathOperationConfig(curBody, typeVal, t),
        (curBody: Body) => createBitOperationConfig(curBody, typeVal, t),
        (curBody: Body) => createActionConfig(curBody, typeVal, t, propDevice),
        (curBody: Body) => createComparisonValConfig(curBody, typeVal, t),
        (curBody: Body) => createOperationBinConfig(curBody, typeVal, t),
        (curBody: Body) => createValueConfig(curBody, cbParseEntity),
        (curBody: Body) => createStopValueConfig(curBody, typeVal, t),
        (curBody: Body) => createIntConstStopValConfig(curBody, typeVal, t),
        (curBody: Body) => createStopValConfig(curBody, typeVal, cbParseEntity),
        (curBody: Body) => createHysteresisConfig(curBody, typeVal, t),
        (curBody: Body) => createTimeConfig(curBody, cbParseTime, t),
        (curBody: Body) => createDelayConfig(curBody, cbParseTime, t),
        (curBody: Body) => createPauseConfig(curBody, cbParseTime, t),
        (curBody: Body) => createActionMultiSelectConfig(curBody, typeVal, cbParseMultiSelect),
        (curBody: Body) => createConditionMultiSelectConfig(curBody, typeVal, cbParseMultiSelect),
        (curBody: Body) => createStartStopModeConfig(curBody, typeVal, t),
        (curBody: Body) => createCycleModeConfig(curBody, typeVal, t),
        (curBody: Body) => createMinTimeConfig(curBody, cbParseTime, t),
        (curBody: Body) => createMaxTimeConfig(curBody, cbParseTime, t),
    ];

    const allConfigs: Config[] = [];
    for (const generator of generators) {
        const result = await generator(curBodyVal);

        if (Array.isArray(result)) {
            allConfigs.push(...result);
        }

        if (!Array.isArray(result) && result) {
            allConfigs.push(result);
        }
    }
    return allConfigs;
};

function createInitStateConfig(curBodyVal: Body, t: (key: string) => string): Config | null {
    if (curBodyVal['init-state'] === undefined) {
        return null;
    }

    return {
        curKey: CurKeyMap.StatusStartSystem,
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
                val: curBodyVal['init-state'] ? 'on' : 'off',
            },
        ],
        tabs: [],
        radioBtns: [],
        checkBoxes: [],
        inputs: [],
        dropDowns: [],
    };
}

async function createEntityConfig(
    curBodyVal: Body,
    typeVal: UDF,
    cbParseEntity: (ent: Ent) => Promise<Config[]>,
): Promise<Config[] | null> {
    if (!curBodyVal.entity || curBodyVal.entity.type === 'prev-value') {
        return null;
    }

    const configs = await cbParseEntity(curBodyVal.entity);
    if (!configs || !configs.length) return null;

    if (typeVal === 'udf-act') {
        return configs.map((config) => {
            if (config.curKey === CurKeyMap.Interface) {
                return {
                    ...config,
                    tabs: config.tabs.map((tab) => ({
                        ...tab,
                        vals: tab.vals.filter((v) => !readonlyInterfaces.includes(String(v.val))),
                    })),
                };
            }
            return config;
        });
    }

    return configs;
}

function createLeftConfigChoose(curBodyVal: Body, typeVal: UDF, t: (key: string) => string): Config | null {
    if (typeVal !== 'udf-trans' || !curBodyVal.left || curBodyVal.left.type === 'prev-value') {
        return null;
    }

    return {
        curKey: CurKeyMap.ComparisonValueLeft,
        queue: [
            { name: 'title', index: 0 },
            { name: 'btns', index: 0 },
        ],
        titles: [t('titles.comparisonValLeft')],
        btns: [
            {
                vals: [
                    { label: t('btns.const'), val: 'const', class: 'w-[109px]' },
                    { label: t('btns.obj'), val: 'obj', class: 'w-[109px]' },
                ],
                val: curBodyVal['left'].type === 'int-const' ? 'const' : 'obj',
                disabled: false,
            },
        ],
        tabs: [],
        radioBtns: [],
        checkBoxes: [],
        inputs: [],
        dropDowns: [],
    };
}

async function createLeftConfig(
    curBodyVal: Body,
    typeVal: UDF,
    cbParseEntity: (ent: Ent) => Promise<Config[]>,
): Promise<Config[] | null> {
    if (typeVal !== 'udf-trans' || !curBodyVal.left || curBodyVal.left.type === 'prev-value') {
        return null;
    }

    const configs = await cbParseEntity(curBodyVal.left);
    if (!configs || !configs.length) return null;

    return configs.map((el) => ({ ...el, titles: replaceTitlesLeft(el.titles) }));
}

function createLeftConfigEnter(curBodyVal: Body, typeVal: UDF, t: (key: string) => string): Config | null {
    if (typeVal !== 'udf-trans' || !curBodyVal.left || curBodyVal.left.type !== 'int-const') {
        return null;
    }

    return {
        curKey: CurKeyMap.EnterLeft,
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
                val: curBodyVal['left'].value || 0,
                min: -32768,
                max: 32767,
                isError: false,
            },
        ],
        dropDowns: [],
    };
}

function createRightConfigChoose(curBodyVal: Body, typeVal: UDF, t: (key: string) => string): Config | null {
    if (typeVal !== 'udf-trans' || !curBodyVal.right || curBodyVal.right.type === 'prev-value') {
        return null;
    }

    return {
        curKey: CurKeyMap.ComparisonValueRight,
        queue: [
            { name: 'title', index: 0 },
            { name: 'btns', index: 0 },
        ],
        titles: [t('titles.comparisonValRight')],
        btns: [
            {
                vals: [
                    { label: t('btns.const'), val: 'const', class: 'w-[109px]' },
                    { label: t('btns.obj'), val: 'obj', class: 'w-[109px]' },
                ],
                val: curBodyVal['right'].type === 'int-const' ? 'const' : 'obj',
                disabled: false,
            },
        ],
        tabs: [],
        radioBtns: [],
        checkBoxes: [],
        inputs: [],
        dropDowns: [],
    };
}

async function createRightConfig(
    curBodyVal: Body,
    typeVal: UDF,
    cbParseEntity: (ent: Ent) => Promise<Config[]>,
): Promise<Config[] | null> {
    if (typeVal !== 'udf-trans' || !curBodyVal.right || curBodyVal.right.type === 'prev-value') {
        return null;
    }

    const configs = await cbParseEntity(curBodyVal.right);
    if (!configs || !configs.length) return null;

    return configs.map((el) => ({ ...el, curKey: el.curKey + 4, titles: replaceTitlesRight(el.titles) }));
}

function createRightConfigEnter(curBodyVal: Body, typeVal: UDF, t: (key: string) => string): Config | null {
    if (typeVal !== 'udf-trans' || !curBodyVal.right || curBodyVal.right.type !== 'int-const') {
        return null;
    }

    return {
        curKey: CurKeyMap.EnterRight,
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
                val: curBodyVal['right'].value || 0,
                min: -32768,
                max: 32767,
                isError: false,
            },
        ],
        dropDowns: [],
    };
}

async function createResultConfig(
    curBodyVal: Body,
    typeVal: UDF,
    cbParseEntity: (ent: Ent) => Promise<Config[]>,
): Promise<Config[] | null> {
    if (typeVal !== 'udf-trans' || !curBodyVal.result || curBodyVal.result.type === 'prev-value') {
        return null;
    }

    const configs = await cbParseEntity(curBodyVal.result);
    if (!configs || !configs.length) return null;

    return configs.map((config) => {
        const updatedConfig = {
            ...config,
            curKey: config.curKey + 8,
            titles: replaceTitlesResult(config.titles),
        };

        if (config.curKey === CurKeyMap.Interface) {
            updatedConfig.tabs = config.tabs.map((tab) => ({
                ...tab,
                vals: tab.vals.filter((v) => !readonlyInterfaces.includes(String(v.val))),
            }));
        }

        return updatedConfig;
    });
}

function createCompareConfig(curBodyVal: Body, typeVal: UDF, t: (key: string) => string): Config | null {
    if (typeVal !== 'udf-trig' || !curBodyVal['type']) {
        return null;
    }

    return {
        curKey: CurKeyMap.InterfaceRight,
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
                    { label: t('radioBtns.compare'), val: 'compare' },
                    { label: t('radioBtns.hold'), val: 'hold' },
                    { label: t('radioBtns.any'), val: 'any' },
                ],
                val: curBodyVal['type'],
                groupName: 'comparison',
            },
        ],
        checkBoxes: [],
        inputs: [],
        dropDowns: [],
    };
}

function createComparisonOperationConfig(curBodyVal: Body, typeVal: UDF, t: (key: string) => string): Config | null {
    if (
        (typeVal === 'udf-trig' &&
            (curBodyVal['type'] === 'compare' || curBodyVal['type'] === 'hold') &&
            curBodyVal['operation']) ||
        (typeVal === 'udf-cond' && curBodyVal['operation'])
    ) {
        return {
            curKey: CurKeyMap.ComparisonOperation,
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
                        { label: t('radioBtns.lessEqual'), val: 'less-eq' },
                        { label: t('radioBtns.notEqual'), val: 'not-equal' },
                        { label: t('radioBtns.more'), val: 'more' },
                        { label: t('radioBtns.binaryEqual'), val: 'bin-equal' },
                        { label: t('radioBtns.moreEqual'), val: 'more-eq' },
                        { label: t('radioBtns.error'), val: 'error' },
                        { label: t('radioBtns.binaryNotEqual'), val: 'bin-not-equal' },
                        { label: t('radioBtns.nonError'), val: 'non-error' },
                    ],
                    val: curBodyVal['operation'],
                    groupName: 'less',
                    wrap: true,
                },
            ],
            checkBoxes: [],
            inputs: [],
            dropDowns: [],
        };
    } else {
        return null;
    }
}

function createMathOperationConfig(curBodyVal: Body, typeVal: UDF, t: (key: string) => string): Config | null {
    if (typeVal !== 'udf-trans' || !curBodyVal['operation']) {
        return null;
    }

    return {
        curKey: CurKeyMap.ComparisonOperation,
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
                    { label: '+', val: '+' },
                    { label: '/=', val: '/=' },
                    { label: '-', val: '-' },
                    { label: '&=', val: '&=' },
                    { label: '*', val: '*' },
                    { label: '|=', val: '|=' },
                    { label: '/', val: '/' },
                    { label: '~', val: '~' },
                    { label: '%', val: '%' },
                    { label: '!', val: '!' },
                    { label: '<<', val: '<<' },
                    { label: 'min', val: 'min' },
                    { label: '>>', val: '>>' },
                    { label: 'max', val: 'max' },
                    { label: '=', val: '=' },
                    { label: '%=', val: '%=' },
                    { label: '+=', val: '+=' },
                    { label: '&&', val: '&&' },
                    { label: '-=', val: '-=' },
                    { label: '<<=', val: '<<=' },
                    { label: '=-', val: '=-' },
                    { label: '||', val: '||' },
                    { label: '*=', val: '*=' },
                    { label: '>>=', val: '>>=' },
                    { label: '>', val: '>' },
                    { label: '<', val: '<' },
                    { label: '>=', val: '>=' },
                    { label: '<=', val: '<=' },
                ],
                val: curBodyVal['operation'],
                groupName: 'less',
                wrap: true,
            },
        ],
        checkBoxes: [],
        inputs: [],
        dropDowns: [],
    };
}

function createBitOperationConfig(curBodyVal: Body, typeVal: UDF, t: (key: string) => string): Config | null {
    if (typeVal !== 'udf-act' || curBodyVal['type'] !== 'modify' || !curBodyVal['operation']) {
        return null;
    }

    return {
        curKey: CurKeyMap.ComparisonOperation,
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
                    { label: '=', val: '=' },
                    { label: '&=', val: '&=' },
                    { label: '+=', val: '+=' },
                    { label: '|=', val: '|=' },
                    { label: '-=', val: '-=' },
                    { label: '~', val: '~' },
                    { label: '=-', val: '=-' },
                    { label: '!', val: '!' },
                    { label: '*=', val: '*=' },
                    { label: 'min', val: 'min' },
                    { label: '/=', val: '/=' },
                    { label: 'max', val: 'max' },
                    { label: '%=', val: '%=' },
                    { label: '&&', val: '&&' },
                    { label: '<<=', val: '<<=' },
                    { label: '||', val: '||' },
                    { label: '>>=', val: '>>=' },
                ],
                val: curBodyVal['operation'],
                groupName: 'less',
                wrap: true,
            },
        ],
        checkBoxes: [],
        inputs: [],
        dropDowns: [],
    };
}

function createActionConfig(
    curBodyVal: Body,
    typeVal: UDF,
    t: (key: string) => string,
    propDevice?: Device,
): Config | null {
    if (typeVal !== 'udf-act' || curBodyVal['type'] === undefined) {
        return null;
    }

    const radioOptions = [
        { label: t('radioBtns.set'), val: 'set' },
        { label: t('radioBtns.invert'), val: 'invert' },
        { label: 'modify', val: 'modify' },
        { label: 'change', val: 'change' },
        { label: t('radioBtns.cyclicChange'), val: 'cycle' },
        { label: `${t('radioBtns.stop')} WIP`, val: 'stop', disabled: true },
    ];
    if (!propDevice || !propDevice.addr) {
        radioOptions.push({ label: 'save WIP', val: 'save', disabled: true });
    }

    return {
        curKey: CurKeyMap.InterfaceRight,
        queue: [
            { name: 'title', index: 0 },
            { name: 'radioBtns', index: 0 },
        ],
        titles: [t('titles.actionType')],
        btns: [],
        tabs: [],
        radioBtns: [
            {
                vals: radioOptions,
                val: curBodyVal['type'],
                groupName: 'set',
            },
        ],
        checkBoxes: [],
        inputs: [],
        dropDowns: [],
    };
}

function createComparisonValConfig(curBodyVal: Body, typeVal: UDF, t: (key: string) => string): Config | null {
    if (!curBodyVal['value']) {
        return null;
    }
    if (shouldHideValue(curBodyVal, typeVal)) {
        return null;
    }

    return {
        curKey: CurKeyMap.ObjectRight,
        queue: [
            { name: 'title', index: 0 },
            { name: 'btns', index: 0 },
        ],
        titles: typeVal !== 'udf-act' ? [t('titles.comparisonVal')] : [t('titles.value')],
        btns: [
            {
                vals: [
                    { label: t('btns.const'), val: 'const', class: 'w-[109px]' },
                    { label: t('btns.obj'), val: 'obj', class: 'w-[109px]' },
                ],
                val: curBodyVal['value'].type === 'int-const' ? 'const' : 'obj',
                disabled: false,
            },
        ],
        tabs: [],
        radioBtns: [],
        checkBoxes: [],
        inputs: [],
        dropDowns: [],
    };
}

function createOperationBinConfig(curBodyVal: Body, typeVal: UDF, t: (key: string) => string): Config | null {
    if (!curBodyVal['value'] || curBodyVal['value']['type'] !== 'int-const' || !curBodyVal.entity) {
        return null;
    }
    if (shouldHideValue(curBodyVal, typeVal)) {
        return null;
    }

    const isBinary =
        curBodyVal['operation'] === 'bin-equal' ||
        curBodyVal['operation'] === 'bin-not-equal' ||
        binaryInterfaces.includes(curBodyVal.entity.type);

    return isBinary
        ? {
              curKey: CurKeyMap.Select,
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
                      val: curBodyVal['value'].value || 0,
                  },
              ],
              tabs: [],
              radioBtns: [],
              checkBoxes: [],
              inputs: [],
              dropDowns: [],
          }
        : {
              curKey: CurKeyMap.Enter,
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
                      val: curBodyVal['value'].value || 0,
                      min: -32768,
                      max: 32767,
                      isError: false,
                  },
              ],
              dropDowns: [],
          };
}

async function createValueConfig(
    curBodyVal: Body,
    cbParseEntity: (ent: Ent) => Promise<Config[]>,
): Promise<Config[] | null> {
    if (!curBodyVal['value'] || curBodyVal['value']['type'] === 'int-const') {
        return null;
    }
    if (!curBodyVal.entity) {
        return null;
    }

    const configs = await cbParseEntity(curBodyVal.value);
    if (!configs || !configs.length) return null;

    return configs.map((config) => {
        const updatedConfig = {
            ...config,
            curKey: config.curKey + 9,
            titles: replaceTitlesValue(config.titles),
        };

        if (config.curKey === CurKeyMap.Device) {
            updatedConfig.tabs = config.tabs.map((tab) => ({
                ...tab,
                vals: [tab.vals[0]],
            }));
        }

        return updatedConfig;
    });
}

function createStopValueConfig(curBodyVal: Body, typeVal: UDF, t: (key: string) => string): Config | null {
    if (typeVal !== 'udf-act' || !curBodyVal['stop-val']) {
        return null;
    }

    return {
        curKey: CurKeyMap.StopValue,
        queue: [
            { name: 'title', index: 0 },
            { name: 'btns', index: 0 },
        ],
        titles: [t('titles.stopValue')],
        btns: [
            {
                vals: [
                    { label: t('btns.prev'), val: 'prev', class: 'w-[109px]' },
                    { label: t('btns.const'), val: 'const', class: 'w-[109px]' },
                    { label: t('btns.obj'), val: 'obj' },
                ],
                val:
                    curBodyVal['stop-val'].type === 'int-const'
                        ? 'const'
                        : curBodyVal['stop-val'].type === 'prev-value'
                        ? 'prev'
                        : 'obj',
            },
        ],
        tabs: [],
        radioBtns: [],
        checkBoxes: [],
        inputs: [],
        dropDowns: [],
    };
}

function createIntConstStopValConfig(curBodyVal: Body, typeVal: UDF, t: (key: string) => string): Config | null {
    if (typeVal !== 'udf-act' || !curBodyVal['stop-val'] || curBodyVal['stop-val']['type'] !== 'int-const') {
        return null;
    }

    return {
        curKey: CurKeyMap.StopValueEnter,
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
                val: curBodyVal['stop-val'].value || 0,
                min: -32768,
                max: 32767,
                isError: false,
            },
        ],
        dropDowns: [],
    };
}

async function createStopValConfig(
    curBodyVal: Body,
    typeVal: UDF,
    cbParseEntity: (ent: Ent) => Promise<Config[]>,
): Promise<Config[] | null> {
    if (
        typeVal !== 'udf-act' ||
        !curBodyVal['stop-val'] ||
        curBodyVal['stop-val']['type'] === 'int-const' ||
        curBodyVal['stop-val']['type'] === 'prev-value' ||
        !curBodyVal.entity
    ) {
        return null;
    }

    const configs = await cbParseEntity(curBodyVal['stop-val']);
    if (!configs || !configs.length) return null;

    return configs.map((config) => {
        const updatedConfig = {
            ...config,
            curKey: config.curKey + 15,
            titles: replaceTitlesStopValue(config.titles),
        };

        if (config.curKey === CurKeyMap.Device) {
            updatedConfig.tabs = config.tabs.map((tab) => ({
                ...tab,
                vals: [tab.vals[0]],
            }));
        }

        return updatedConfig;
    });
}

function createHysteresisConfig(curBodyVal: Body, typeVal: UDF, t: (key: string) => string): Config | null {
    if (typeVal !== 'udf-trig' || curBodyVal['hysteresis'] === undefined) {
        return null;
    }

    return {
        curKey: CurKeyMap.Hysteresis,
        queue: [
            { name: 'title', index: 0 },
            { name: 'input', index: 0 },
        ],
        titles: [t('titles.hysteresis')],
        btns: [],
        tabs: [],
        radioBtns: [],
        checkBoxes: [],
        inputs: [{ val: curBodyVal['hysteresis'], min: -32768, max: 32767, isError: false, disabled: true }],
        dropDowns: [],
    };
}

async function createTimeConfig(
    curBodyVal: Body,
    cbParseTime: (time: Time, title: string) => Promise<Config[] | undefined>,
    t: (key: string) => string,
): Promise<Config[] | null> {
    if (!curBodyVal['time']) {
        return null;
    }

    const configs = await cbParseTime(curBodyVal['time'], t('titles.during'));
    if (!configs || !configs.length) return null;

    return configs;
}

async function createDelayConfig(
    curBodyVal: Body,
    cbParseTime: (time: Time, title: string) => Promise<Config[] | undefined>,
    t: (key: string) => string,
): Promise<Config[] | null> {
    if (!curBodyVal['delay']) {
        return null;
    }

    const configs = await cbParseTime(curBodyVal['delay'], t('titles.delay'));
    if (!configs || !configs.length) return null;

    return configs.map((el) => ({ ...el, curKey: CurKeyMap.Delay }));
}

async function createPauseConfig(
    curBodyVal: Body,
    cbParseTime: (time: Time, title: string) => Promise<Config[] | undefined>,
    t: (key: string) => string,
): Promise<Config[] | null> {
    if (!curBodyVal['time'] || curBodyVal.type !== 'cycle') {
        return null;
    }

    //TODO
    const configs = await cbParseTime(curBodyVal['time'], t('titles.pause'));
    if (!configs || !configs.length) return null;

    return configs.map((el) => ({ ...el, curKey: CurKeyMap.Pause }));
}

async function createActionMultiSelectConfig(
    curBodyVal: Body,
    typeVal: UDF,
    cbParseMultiSelect: (
        type: 'udf-act' | 'udf-cond',
        idx: number,
        quant: number,
        logic?: 'and' | 'or',
    ) => Promise<Config[] | undefined>,
): Promise<Config[] | null> {
    if (typeVal !== 'udf-trig') {
        return null;
    }

    const configs = await cbParseMultiSelect('udf-act', curBodyVal['act-idx'] || 0, curBodyVal['act-qty'] || 0);
    if (!configs || !configs.length) return null;
    return configs;
}

async function createConditionMultiSelectConfig(
    curBodyVal: Body,
    typeVal: UDF,
    cbParseMultiSelect: (
        type: 'udf-act' | 'udf-cond',
        idx: number,
        quant: number,
        logic?: 'and' | 'or',
    ) => Promise<Config[] | undefined>,
): Promise<Config[] | null> {
    if (typeVal !== 'udf-act') {
        return null;
    }

    const configs = await cbParseMultiSelect(
        'udf-cond',
        curBodyVal['cond-idx'] || 0,
        curBodyVal['cond-qty'] || 0,
        curBodyVal['cond-logic'],
    );
    if (!configs || !configs.length) return null;
    return configs;
}

function createStartStopModeConfig(curBodyVal: Body, typeVal: UDF, t: (key: string) => string): Config | null {
    if (
        typeVal !== 'udf-act' ||
        curBodyVal['start-on-cond'] === undefined ||
        curBodyVal['stop-on-trig'] === undefined ||
        curBodyVal['stop-on-cond'] === undefined
    ) {
        return null;
    }

    const valArr1 = curBodyVal['start-on-cond'] ? ['conditionsOccur'] : [];
    const valArr2 =
        curBodyVal['stop-on-trig'] && curBodyVal['stop-on-cond']
            ? ['triggerNoMatches', 'conditionNoMatches']
            : !curBodyVal['stop-on-trig'] && !curBodyVal['stop-on-cond']
            ? []
            : curBodyVal['stop-on-trig']
            ? ['triggerNoMatches']
            : ['conditionNoMatches'];
    return {
        curKey: CurKeyMap.StartStopMode,
        queue: [{ name: 'checkBox', index: 0 }],
        titles: [],
        btns: [],
        tabs: [],
        radioBtns: [],
        checkBoxes: [
            {
                1: {
                    title: t('titles.startMode'),
                    vals: [{ label: t('checkBoxes.conditionsOccur'), val: 'conditionsOccur' }],
                    valsArr: valArr1,
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
                    valsArr: valArr2,
                },
            },
        ],
        inputs: [],
        dropDowns: [],
    };
}

function createCycleModeConfig(curBodyVal: Body, typeVal: UDF, t: (key: string) => string): Config | null {
    if (
        typeVal !== 'udf-act' ||
        curBodyVal.type !== 'cycle' ||
        curBodyVal['infinite'] === undefined ||
        curBodyVal['direction'] === undefined
    ) {
        return null;
    }

    return {
        curKey: CurKeyMap.CyclicMode,
        queue: [
            { name: 'title', index: 0 },
            { name: 'btns', index: 0 },
            { name: 'btns', index: 1 },
        ],
        titles: [t('titles.cyclicMode')],
        btns: [
            {
                subtitle: t('titles.infinite'),
                vals: [
                    { label: t('btns.yes'), val: 'yes', class: 'w-[80px]' },
                    { label: t('btns.no'), val: 'no', class: 'w-[80px]' },
                ],
                val: curBodyVal['infinite'] ? 'yes' : 'no',
            },
            {
                subtitle: t('titles.initDir'),
                vals: [
                    { label: t('btns.toMin'), val: 'to-min' },
                    { label: t('btns.toMax'), val: 'to-max' },
                ],
                val: curBodyVal.direction as string,
            },
        ],
        tabs: [],
        radioBtns: [],
        checkBoxes: [],
        inputs: [],
        dropDowns: [],
    };
}

async function createMinTimeConfig(
    curBodyVal: Body,
    cbParseTime: (time: Time, title: string) => Promise<Config[] | undefined>,
    t: (key: string) => string,
): Promise<Config[] | null> {
    if (!curBodyVal['min-time']) {
        return null;
    }

    const configs = await cbParseTime(curBodyVal['min-time'], t('titles.minTime'));
    if (!configs || !configs.length) return null;

    return configs.map((el) => ({ ...el, curKey: CurKeyMap.MinTime }));
}

async function createMaxTimeConfig(
    curBodyVal: Body,
    cbParseTime: (time: Time, title: string) => Promise<Config[] | undefined>,
    t: (key: string) => string,
): Promise<Config[] | null> {
    if (!curBodyVal['max-time']) {
        return null;
    }

    const configs = await cbParseTime(curBodyVal['max-time'], t('titles.maxTime'));
    if (!configs || !configs.length) return null;

    return configs.map((el) => ({ ...el, curKey: CurKeyMap.MaxTime }));
}

function replaceTitlesValue(titles: string[]): string[] {
    return titles.map((title) =>
        title
            .replace(/триггера/i, 'значение')
            .replace(/действия/i, 'значение')
            .replace(/условия/i, 'значение')
            .replace(/trigger/i, 'value')
            .replace(/action/i, 'value')
            .replace(/condition/i, 'value'),
    );
}

function replaceTitlesStopValue(titles: string[]): string[] {
    return titles.map((title) => title.replace(/действия/i, 'значения для остановки').replace(/action/i, 'stop value'));
}

function replaceTitlesLeft(titles: string[]): string[] {
    return titles.map((title) =>
        title.replace(/преобразования/i, 'левого аргумента').replace(/transform/i, 'left argument'),
    );
}

function replaceTitlesRight(titles: string[]): string[] {
    return titles.map((title) =>
        title.replace(/преобразования/i, 'правого аргумента').replace(/transform/i, 'right argument'),
    );
}

function replaceTitlesResult(titles: string[]): string[] {
    return titles.map((title) => title.replace(/преобразования/i, 'результата').replace(/transform/i, 'result'));
}

function shouldHideValue(curBodyVal: Body, typeVal: UDF): boolean {
    return !!(
        (typeVal === 'udf-cond' || typeVal === 'udf-trig') &&
        curBodyVal['operation'] &&
        (curBodyVal['operation'] === 'error' || curBodyVal['operation'] === 'non-error')
    );
}
