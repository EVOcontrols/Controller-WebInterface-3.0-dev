import axios from 'axios';
import { Capab, EntityForBody, UDF } from './types';
import { LabelsType } from '@/typings/files';

const indexStore = useIndexStore();
const { ip } = storeToRefs(indexStore);
const { readFile } = useReadWriteFiles();

const TIMEOUT_DEFAULT = 500;
const RETRIES_DEFAULT = 3;

// todo использовать очередь

export const $apiGetDevConfig = async (
    device?: number,
    retries = RETRIES_DEFAULT,
    timeout = TIMEOUT_DEFAULT,
) => {
    try {
        if (device) {
            const { data } = await axios.post(
                `http://${ip.value}/api/v3/get_ext_cfg`,
                JSON.stringify({ device }),
            );
            return data;
        } else {
            const { data } = await axios.get(`http://${ip.value}/api/v3/get_config`);
            return data;
        }
    } catch (error) {
        if (retries > 0) {
            return new Promise((resolve) => {
                setTimeout(async () => {
                    const data = await $apiGetDevConfig(device, retries - 1);
                    resolve(data);
                }, timeout);
            });
        } else {
            throw new Error('Failed to fetch data after multiple attempts');
        }
    }
};

export const $apiGetUdfConfig = async (
    typeVal: string,
    device: number,
    indexRow: number,
    retries = RETRIES_DEFAULT,
    timeout = TIMEOUT_DEFAULT,
) => {
    try {
        const response = await axios.post(
            `http://${ip.value}/api/v3/get_udf_cfg`,
            JSON.stringify({
                type: typeVal,
                device,
                index: indexRow,
            }),
        );
        const { data } = response;

        return data;
    } catch (error) {
        if (retries > 0) {
            return new Promise((resolve) => {
                setTimeout(async () => {
                    const data = await $apiGetUdfConfig(typeVal, device, indexRow, retries - 1);
                    resolve(data);
                }, timeout);
            });
        } else {
            throw new Error('Failed to fetch get_udf_cfg data after multiple attempts');
        }
    }
};

export const $apiGetDevCapab = async (
    device: number,
    retries = RETRIES_DEFAULT,
    timeout = TIMEOUT_DEFAULT,
): Promise<Capab> => {
    try {
        const { data } = await axios.post(
            `http://${ip.value}/api/v3/get_dev_capab`,
            JSON.stringify({ device }),
        );
        return data as Capab;
    } catch (error) {
        if (retries > 0) {
            return new Promise((resolve) => {
                setTimeout(async () => {
                    const data = await $apiGetDevCapab(device, retries);
                    resolve(data);
                }, timeout);
            });
        } else {
            throw new Error('Failed to fetch get_dev_capab data after multiple attempts');
        }
    }
};

export const $apiGetMbInfo = async (
    device: number,
    retries = RETRIES_DEFAULT,
    timeout = TIMEOUT_DEFAULT,
) => {
    try {
        const { data } = await axios.post(
            `http://${ip.value}/api/v3/get_mb_info`,
            JSON.stringify({ device, bus: 0 }),
        );
        return data;
    } catch (error) {
        if (retries > 0) {
            return new Promise((resolve) => {
                setTimeout(async () => {
                    const data = await $apiGetMbInfo(device, retries);
                    resolve(data);
                }, timeout);
            });
        } else {
            throw new Error('Failed to fetch get_mb_info data after multiple attempts');
        }
    }
};

export const $apiGetEntConfig = async (
    device: number,
    retries = RETRIES_DEFAULT,
    timeout = TIMEOUT_DEFAULT,
) => {
    try {
        const url = device ? 'get_ext_cfg' : 'get_config';
        const { data } = await axios.post(
            `http://${ip.value}/api/v3/${url}`,
            JSON.stringify({ device }),
        );
        return data;
    } catch (error) {
        if (retries > 0) {
            return new Promise((resolve) => {
                setTimeout(async () => {
                    const data = await $apiGetEntConfig(device, retries - 1);
                    resolve(data);
                }, timeout);
            });
        } else {
            throw new Error('Failed to fetch ent data after multiple attempts');
        }
    }
};

export const $apiReadFile = async (
    addr: number,
    type: UDF,
    retries = RETRIES_DEFAULT,
    timeout = TIMEOUT_DEFAULT,
): Promise<LabelsType | 'notFound'> => {
    try {
        const data = await $apiReadFileData(addr, type);
        return data;
    } catch (error) {
        if (retries > 0) {
            return new Promise((resolve) => {
                setTimeout(async () => {
                    const data = await $apiReadFile(addr, type, retries - 1);
                    resolve(data);
                }, timeout);
            });
        } else {
            throw new Error('Failed to fetch read file data after multiple attempts');
        }
    }
};

export const $apiReadFileData = async (addr: number, type: UDF) => {
    const reqLabels = await readFile({
        type: 'labels',
        interf: type,
        device: addr,
    });

    if (reqLabels === 'error') {
        throw 'Error for retry';
    }

    return reqLabels;
};

export const $apiGetEntState = async (
    body: { entities: EntityForBody[] },
    retries = RETRIES_DEFAULT,
    timeout = TIMEOUT_DEFAULT,
) => {
    try {
        const { data } = await axios.post(
            `http://${ip.value}/api/v3/get_ent_state`,
            JSON.stringify({ body }),
        );
        return data;
    } catch (error) {
        if (retries > 0) {
            return new Promise((resolve) => {
                setTimeout(async () => {
                    const data = await $apiGetEntState(body, retries - 1);
                    resolve(data);
                }, timeout);
            });
        } else {
            throw new Error('Failed to fetch ent data after multiple attempts');
        }
    }
};
