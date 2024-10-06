import type { UserRole, Lang, NumberingSystem } from './common';

export type LabelsFileType = {
    type: 'labels';
    subType?: 'mbVars' | 'mbDevices' | 'udf' | 'euf';
    device: number;
    bus?: number;
    interf:
        | '1w-rom'
        | '1w-sens'
        | 'bin-in'
        | 'adc-in'
        | 'bin-out'
        | 'pwm-out'
        | 'mb-var'
        | 'bin-var'
        | 'int-var'
        | 'tim-var'
        | 'udf-act'
        | 'udf-cond'
        | 'udf-trig'
        | 'udf-trans'
        | 'euf';
};

export type MbFileType = {
    type: 'mb';
    subType: 'devs';
    device: number;
    bus: number;
};

export type LabelsType = {
    labels: string[];
};

export type MbType = {
    devs: number[];
};

export type CommonSettingsFileType = {
    lang: Lang;
    funcsNumberPerPage: number;
    tempUnit: TempUnit;
    numberingSystem: NumberingSystem;
};

export type FileType =
    | LabelsFileType
    | { type: 'settings'; subType: 'mbNs' }
    | { type: 'settings'; subType: 'common'; user: UserRole }
    | MbFileType;

export type FileContent<T extends FileType> = T extends { type: 'labels' }
    ? LabelsType
    : T extends { type: 'settings'; subType: 'common' }
    ? CommonSettingsFileType
    : T extends { type: 'mb' }
    ? MbType
    : TwoDimensionalArray<NumberingSystem>;
