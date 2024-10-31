import type { AxiosRequestConfig } from 'axios';

type Method = 'get' | 'post';
type Query = { method: Method; url: string; params?: any; axiosParams?: AxiosRequestConfig };

export const useApiStore = defineStore('apiStore', () => {
    const indexStore = useIndexStore();

    const { notConnected, rebootingDeviceAddr, extDeviceInInitState, ngcModbusMode } = storeToRefs(indexStore);

    const { api: apiInstance } = useApi();

    const route = useRoute();

    const directQueriesIds: Set<number> = new Set([]);

    const timeout = import.meta.env.DEV ? 5000 : 1000;

    const longQueries: Set<string> = new Set(['set_config']);

    const bgQueries = computed(() => {
        const queries: Query[] = [];
        if (
            ngcModbusMode.value === 'ext-devs' &&
            route.matched.find((r) => ['devices-settings', 'panel', 'functions'].includes(r.name as string))
        ) {
            queries.push({ method: 'get', url: 'get_ext_devs' });
        }
        return queries;
    });

    const lastBgQueryIndex = computed(() => bgQueries.value.length - 1);

    function delay(ms: number) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    async function query<T = any>(
        method: Method,
        url: string,
        params?: any,
        axiosParams?: AxiosRequestConfig,
        isQueryBg = false,
    ) {
        let queryId: number | undefined;

        const isDev = import.meta.env.DEV;
        await delay(isDev ? 50 : 20);

        if (!isQueryBg) {
            queryId = Math.random();
            // console.log('directQueriesIds', bgQueries.value);
            directQueriesIds.add(queryId);
            if (longQueries.has(url)) {
                indexStore.setLongQueryRunning(true);
            }
        }

        try {
            const r = await apiInstance[method]<T>(url, params, axiosParams);
            return r;
        } catch (error) {
            return Promise.reject(error);
        } finally {
            if (queryId) {
                directQueriesIds.delete(queryId);
                if (longQueries.has(url)) {
                    indexStore.setLongQueryRunning(false);
                }
            }
        }
    }

    async function getBgData(prevBgQuery?: string) {
        if (
            !bgQueries.value.length ||
            directQueriesIds.size ||
            notConnected.value ||
            rebootingDeviceAddr.value !== undefined
        ) {
            setTimeout(() => getBgData(prevBgQuery), timeout);
            return;
        }
        let isNeedPause = false;
        let nextBgQuery: Query;
        if (extDeviceInInitState.value !== undefined) {
            nextBgQuery = { method: 'get', url: 'get_ext_devs' };
            await new Promise((res) => setTimeout(res, timeout));
        } else {
            const prevBgQueryIndex = prevBgQuery ? bgQueries.value.findIndex((q) => q.url === prevBgQuery) : -1;
            let nextBgQueryIndex = prevBgQueryIndex === -1 ? 0 : prevBgQueryIndex + 1;
            if (nextBgQueryIndex > lastBgQueryIndex.value) {
                nextBgQueryIndex = 0;
            }
            if (nextBgQueryIndex === lastBgQueryIndex.value) {
                isNeedPause = true;
            }
            nextBgQuery = bgQueries.value[nextBgQueryIndex];
        }
        try {
            const r = await query(
                nextBgQuery.method,
                nextBgQuery.url,
                nextBgQuery.params,
                nextBgQuery.axiosParams,
                true,
            );
            switch (nextBgQuery.url) {
                case 'get_ext_devs':
                    indexStore.setExtDevsList(r.data.list);
                    break;
                default:
                    break;
            }
        } catch (error) {
            //
        }
        if (isNeedPause) {
            await new Promise((res) => setTimeout(res, timeout));
        }
        getBgData(nextBgQuery.url);
    }

    const api = {
        async get<T = any>(url: string, params?: any, axiosParams?: AxiosRequestConfig) {
            return await query<T>('get', url, params, axiosParams);
        },
        async post<T = any>(url: string, params?: any, axiosParams?: AxiosRequestConfig) {
            return await query<T>('post', url, params, axiosParams);
        },
    };

    getBgData();

    return { api };
});
