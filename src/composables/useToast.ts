import { toastTypes } from '@/data/common';
import type { Toast } from '@/typings/common';

export function useToast() {
  const indexStore = useIndexStore();

  const toast = toastTypes.reduce(
    (acc, type) => {
      acc[type] = (header: string, text: string, timeout = 7000, widthInRem = 24) => {
        const id = Math.random();
        indexStore.addNewToast({ id, type, header, text, timeout, widthInRem });
        return id;
      };
      return acc;
    },
    {} as Record<
      Toast['type'],
      (header: string, text: string, timeout?: number, widthInRem?: number) => number
    >,
  );

  return { toast };
}
