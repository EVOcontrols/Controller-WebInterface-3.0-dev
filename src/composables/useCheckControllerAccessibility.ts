import { useApi } from './useApi';

export function useCheckControllerAccessibility() {
  const indexStore = useIndexStore();

  const { notConnected, isInterfaceStarted, isControllerRebooting } = storeToRefs(indexStore);

  const { api } = useApi();

  watch([notConnected, isControllerRebooting], () => {
    if ((notConnected.value || isControllerRebooting) && isInterfaceStarted.value) {
      checkAccessibility();
    }
  });

  async function checkAccessibility() {
    try {
      await api.get('get_id');
      if (notConnected.value) {
        indexStore.setIsNotConnected(false);
      } else if (isControllerRebooting.value) {
        indexStore.setIsControllerRebooting(false);
      }
    } catch (error) {
      setTimeout(checkAccessibility, 1000);
    }
  }
}
