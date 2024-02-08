import type { UserRole, Lang, NumberingSystem } from './common';

export type LabelsFileType = {
    type: 'labels';
    subType?: 'mbVars' | 'mbDevices';
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
        | 'tim-var';
};

export type LabelsType = {
    labels: string[];
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
    | { type: 'settings'; subType: 'common'; user: UserRole };

export type FileContent<T extends FileType> = T extends { type: 'labels'; subType: 'mbDevices' }
    ? (string | null)[]
    : T extends { type: 'labels' }
    ? LabelsType
    : T extends { type: 'settings'; subType: 'common' }
    ? CommonSettingsFileType
    : TwoDimensionalArray<NumberingSystem>;
