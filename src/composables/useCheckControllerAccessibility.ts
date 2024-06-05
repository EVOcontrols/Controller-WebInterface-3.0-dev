import { useApi } from './useApi';

export function useCheckControllerAccessibility() {
    const indexStore = useIndexStore();

    const { notConnected, isInterfaceStarted, rebootingDeviceAddr } = storeToRefs(indexStore);

    const { api } = useApi();

    watch([notConnected, rebootingDeviceAddr], () => {
        if ((notConnected.value || rebootingDeviceAddr.value === 0) && isInterfaceStarted.value) {
            setTimeout(checkAccessibility, 5000);
        }
    });

    async function checkAccessibility() {
        try {
            await api.get('get_id');
            if (notConnected.value) {
                indexStore.setIsNotConnected(false);
            } else if (rebootingDeviceAddr.value === 0) {
                indexStore.setDevicesToInitState();
                indexStore.setDevicesStateToInitState();
                indexStore.setOWIdsToInitState();
                indexStore.setCalibrValsToInitState();
                indexStore.setMbDevsToInitState();
                indexStore.setRebootingDeviceAddr(undefined);
                indexStore.setNeedToReqData(true);
            }
        } catch (error) {
            setTimeout(checkAccessibility, 1000);
        }
    }
}
