import { useApi } from './useApi';

export function useCheckControllerAccessibility() {
  const indexStore = useIndexStore();

  const { notConnected, isInterfaceStarted } = storeToRefs(indexStore);

  const { api } = useApi();

  watch(notConnected, () => {
    if (notConnected.value && isInterfaceStarted.value) {
      checkAccessibility();
    }
  });

  async function checkAccessibility() {
    try {
      await api.get('get_id');
      indexStore.setIsNotConnected(false);
    } catch (error) {
      setTimeout(checkAccessibility, 1000);
    }
  }
}
