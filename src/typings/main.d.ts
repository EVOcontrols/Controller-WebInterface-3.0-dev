import type { InterfEntType } from '@/typings/funcs';

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

export interface Device {
    addr: number;
    realAddr: number;
    type: string;
    interf: Array<DeviceInterf>;
    state: 'on' | 'off' | 'init' | 'no-conn' | 'error';
    serial: string;
    version: string;
}

export type DeviceInterf =
    | { interf: '1w-gpio'; bus: number }
    | { interf: '1w-rom'; bus: number }
    | { interf: '1w-sens'; bus: number }
    | '1w-gpio'
    | { interf: 'mb-var'; bus: number }
    | InterfEntType;

export interface Interf {
    value:
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
        | 'tim-var';
    label: {
        ru: string;
        en: string;
    };
}

export interface Widget {
    d: number;
    i: string;
    deviceName: string;
    component: any;
    bus?: number;
}

export interface InterfVal {
    type: string;
    device: number;
    index: number;
    state: number[] | null[] | [number | null][];
    bus?: number;
}
