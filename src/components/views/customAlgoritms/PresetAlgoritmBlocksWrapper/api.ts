import type { BodySave, EntityForBody, UDF } from './types';
import type { LabelsType } from '@/typings/files';

const { readFile } = useReadWriteFiles();
const { api } = useApiStore();

const TIMEOUT_DEFAULT = 50;
const RETRIES_DEFAULT = 1000;

const fetchWithRetries = async <T>(
    fetchFn: () => Promise<T>,
    retries = RETRIES_DEFAULT,
    timeout = TIMEOUT_DEFAULT,
): Promise<T | null> => {
    try {
        return await fetchFn();
    } catch (error) {
        if (retries > 0) {
            return new Promise((resolve) => {
                setTimeout(async () => {
                    const data = await fetchWithRetries(fetchFn, retries - 1);
                    resolve(data);
                }, timeout);
            });
        } else {
            console.error('ERR: Failed to fetch data after multiple attempts');
            return null;
        }
    }
};

export const $apiGetConfig = async (device?: number) => {
    return fetchWithRetries(async () => {
        const url = device ? 'get_ext_cfg' : 'get_config';
        const params = device ? { device } : undefined;
        const { data } = await api.post(url, params);
        return data;
    });
};

export const $apiGetUdfConfig = async (typeVal: string, device: number, indexRow: number) => {
    return fetchWithRetries(async () => {
        const params = { type: typeVal, device, index: indexRow };
        const { data } = await api.post('get_udf_cfg', params);
        return data;
    });
};

export const $apiGetMbInfo = async (device: number) => {
    return fetchWithRetries(async () => {
        const { data } = await api.post('get_mb_info', { device, bus: 0 });
        return data;
    });
};

export const $apiReadFile = async (addr: number, type: UDF): Promise<LabelsType | 'notFound' | null> => {
    return fetchWithRetries(async () => {
        return await $apiReadFileData(addr, type);
    });
};

export const $apiReadFileData = async (addr: number, type: UDF) => {
    const reqLabels = await readFile({ type: 'labels', interf: type, device: addr });
    if (reqLabels === 'error') {
        throw 'Error for retry';
    }

    return reqLabels;
};

export const $apiGetEntState = async (body: { entities: EntityForBody[] }) => {
    return fetchWithRetries(async () => {
        const { data } = await api.post('get_ent_state', body);
        return data;
    });
};

export const $apiSaveUdfConfig = async (body: BodySave) => {
    return fetchWithRetries(async () => {
        const { data } = await api.post('set_udf_cfg', body);
        return data;
    }, 10);
};
