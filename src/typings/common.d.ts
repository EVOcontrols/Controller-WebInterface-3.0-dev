import { toastTypes } from '@/data/common';

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
