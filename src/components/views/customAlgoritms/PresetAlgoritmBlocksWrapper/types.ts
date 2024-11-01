export type UDF = 'udf-act' | 'udf-cond' | 'udf-trans' | 'udf-trig';

export type PropsTypes =
    | { label: 'triggers'; val: 'udf-trig' }
    | { label: 'conditions'; val: 'udf-cond' }
    | { label: 'actions'; val: 'udf-act' }
    | { label: 'transformations'; val: 'udf-trans' };

export type DropDown = {
    type: DropDownTypes;
    realType: DropDownRealType;
    items: DropDownItem[];
    vals: number[];
    configItemIndex: number;
    itemIndex: number;
};
type DropDownTypes = 'bin' | 'obj' | '1w-sens' | 'var' | 'act' | 'cond';
export type DropDownRealType =
    | '1w-rom'
    | '1w-sens'
    | '1w-gpio'
    | 'bin-in'
    | 'adc-in'
    | 'bin-out'
    | 'pwm-out'
    | 'mb-coil'
    | 'mb-ir'
    | 'mb-hr'
    | 'mb-di'
    | 'bin-var'
    | 'int-var'
    | 'tim-var'
    | 'udf-act'
    | 'udf-cond'
    | 'udf-trans'
    | 'udf-trig';
export type DropDownItem = {
    val: number | null | (number | null)[];
    name: string;
    i: number;
};

export type Capab = {
    '1w-gpio': number;
    '1w-rom': number;
    '1w-sens': number;
    'adc-in': number;
    'bin-in': number;
    'bin-out': number;
    'bin-var': number;
    'int-var': number;
    'mb-var': number;
    'pwm-out': number;
    'tim-var': number;
    'udf-act': number;
    'udf-cond': number;
    'udf-trans': number;
    'udf-trig': number;
};

export type Mode1W = { mode: 'off' | 'sens' | 'rom' | 'gpio' };
export type ModeMb = { mode: 'off' | 'variables' | 'ext-devs' };

export type Interface =
    | '1w-rom'
    | '1w-sens'
    | '1w-gpio'
    | 'bin-in'
    | 'adc-in'
    | 'bin-out'
    | 'pwm-out'
    | 'mb-coil'
    | 'mb-ir'
    | 'mb-hr'
    | 'mb-di'
    | 'mb-var'
    | 'bin-var'
    | 'int-var'
    | 'tim-var';

export type Config = {
    curKey: number;
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
        disabled?: boolean;
    }[];
    tabs: {
        vals: { label: string; val: string | number }[];
        val: string | number;
        dependentDropDownIndex?: number;
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
        disabled?: boolean;
    }[];
    dropDowns: {
        type: DropDownTypes;
        realType: DropDownRealType;
        items: DropDownItem[];
        vals: number[];
    }[];
};

export type EntNum = 1 | 2 | 3;
export type EntBind = { val: number | null | (number | null)[]; name: string; i: number };
export type EntType =
    | '1w-gpio'
    | '1w-rom'
    | '1w-sens'
    | 'adc-in'
    | 'bin-in'
    | 'bin-out'
    | 'bin-var'
    | 'int-var'
    | 'mb-var'
    | 'pwm-out'
    | 'tim-var'
    | 'udf-act'
    | 'udf-cond'
    | 'udf-trans'
    | 'udf-trig';

export type EntityForBody = {
    type: string;
    device: number;
    index: number;
    quantity: number;
    bus?: number;
};

export type BodySave = {
    type: UDF;
    device: number;
    index: number;
    action?: any;
    condition?: any;
    transform?: any;
    trigger?: any;
};

export const binaryInterfaces = ['bin-in', 'bin-out', 'bin-var', '1w-rom', 'mb-coil', 'mb-di'];
export const analogyInterfaces = ['pwm-out', 'adc-in'];

export const ORDER = [
    '1w-rom',
    '1w-sens',
    'bin-in',
    'adc-in',
    'bin-out',
    'pwm-out',
    'mb-coil',
    'mb-ir',
    'mb-hr',
    'mb-di',
    'bin-var',
    'int-var',
    'tim-var',
];

export const enum CurKeyMap {
    StatusStartSystem = 1,
    Interface = 2,
    Device = 3,
    Object = 4,
    Bus = 5,
    InterfaceRight = 6,
    DeviceRight = 7,
    ObjectRight = 8,
    Select = 9,
    Enter = 10,
    ValueInterface = 11,
    ValueDevice = 12,
    ValueObject = 13,
    ValueBus = 14,
    StopValue = 15,
    StopValueEnter = 16,
    StopValueInterface = 17,
    StopValueDevice = 18,
    StopValueObject = 19,
    StopValueBus = 20,
    // EndValue = 21, // лишнее, снёс
    // BinOperation = 22, // лишнее, снёс
    Hysteresis = 27,
    Time = 28,
    Delay = 29,
    Pause = 29, // todo 29 same delay
    MultiSelect = 30,
    StartStopMode = 31,
    CyclicMode = 32,
    MinTime = 33,
    MaxTime = 34,
    ComparisonOperation = 45,
}
