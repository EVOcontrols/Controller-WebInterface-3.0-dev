import axios from 'axios';
import { Capab, EntityForBody, UDF } from './types';
import { LabelsType } from '@/typings/files';

const indexStore = useIndexStore();
const { ip } = storeToRefs(indexStore);
const { readFile } = useReadWriteFiles();

const TIMEOUT_DEFAULT = 500;
const RETRIES_DEFAULT = 3;

const fetchWithRetries = async <T>(
    fetchFn: () => Promise<T>,
    retries = RETRIES_DEFAULT,
    timeout = TIMEOUT_DEFAULT,
): Promise<T> => {
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
            throw new Error('Failed to fetch data after multiple attempts');
        }
    }
};

export const $apiGetConfig = async (device?: number) => {
    return fetchWithRetries(async () => {
        const url = device ? 'get_ext_cfg' : 'get_config';
        const { data } = await axios.post(
            `http://${ip.value}/api/v3/${url}`,
            JSON.stringify({ device }),
        );
        return data;
    });
};

export const $apiGetUdfConfig = async (typeVal: string, device: number, indexRow: number) => {
    return fetchWithRetries(async () => {
        const { data } = await axios.post(
            `http://${ip.value}/api/v3/get_udf_cfg`,
            JSON.stringify({
                type: typeVal,
                device,
                index: indexRow,
            }),
        );
        return data;
    });
};

export const $apiGetDevCapab = async (device: number): Promise<Capab> => {
    return fetchWithRetries(async () => {
        const { data } = await axios.post(
            `http://${ip.value}/api/v3/get_dev_capab`,
            JSON.stringify({ device }),
        );
        return data as Capab;
    });
};

export const $apiGetMbInfo = async (device: number) => {
    return fetchWithRetries(async () => {
        const { data } = await axios.post(
            `http://${ip.value}/api/v3/get_mb_info`,
            JSON.stringify({ device, bus: 0 }),
        );
        return data;
    });
};

export const $apiReadFile = async (addr: number, type: UDF): Promise<LabelsType | 'notFound'> => {
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
        const { data } = await axios.post(
            `http://${ip.value}/api/v3/get_ent_state`,
            JSON.stringify({ body }),
        );
        return data;
    });
};

export const $apiSaveUdfConfig = async (body: any) => {
    return fetchWithRetries(async () => {
        const { data } = await axios.post(
            `http://${ip.value}/api/v3/set_udf_cfg`,
            JSON.stringify({ body }),
        );
        return data;
    });
};
