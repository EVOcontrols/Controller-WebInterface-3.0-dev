import { useApi } from './useApi';

export function useCheckControllerAccessibility() {
    const indexStore = useIndexStore();

    const { notConnected, isInterfaceStarted, rebootingDeviceAddr } = storeToRefs(indexStore);

    const { api } = useApi();

    watch([notConnected, rebootingDeviceAddr], () => {
        if ((notConnected.value || rebootingDeviceAddr.value === 0) && isInterfaceStarted.value) {
            checkAccessibility();
        }
    });

    async function checkAccessibility() {
        try {
            await api.get('get_id');
            if (notConnected.value) {
                indexStore.setIsNotConnected(false);
            } else if (rebootingDeviceAddr.value === 0) {
                indexStore.setRebootingDeviceAddr(undefined);
            }
        } catch (error) {
            setTimeout(checkAccessibility, 1000);
        }
    }
}
