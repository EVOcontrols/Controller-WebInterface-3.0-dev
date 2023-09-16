import { toastTypes } from '@/data/common';

export type Toast = {
  id: number;
  type: (typeof toastTypes)[number];
  header: string;
  text: string;
  timeout: number;
  widthInRem: number;
};
