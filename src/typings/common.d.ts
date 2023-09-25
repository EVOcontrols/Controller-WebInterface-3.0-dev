import { toastTypes } from '@/data/common';

export type TwoDimensionalArray<T> = (T[] | undefined)[];

export type ThreeDimensionalArray<T> = ((T[] | undefined)[] | undefined)[];

export type IsAnyTrue<T extends boolean, U extends boolean> = T extends true
  ? true
  : U extends true
  ? true
  : false;

export type Lang = (typeof langs)[number];

export type UserRole = (typeof userRoles)[number];

export type TempUnit = (typeof tempUnits)[number];

export type ControllerDateTime = {
  hour: number;
  min: number;
  sec: number;
  day: number;
  mon: number;
  year: number;
};

export type Toast = {
  id: number;
  type: (typeof toastTypes)[number];
  header: string;
  text: string;
  timeout: number;
  widthInRem: number;
};

export type InputFieldStatus = 'valid' | 'invalid' | 'empty' | 'not-allowed';

export type InputFieldParams =
  | {
      valueType: 'string';
      value?: string;
    }
  | {
      valueType: 'number';
      value?: number;
    };

export type NumberingSystem = (typeof numberingSystems)[number];
