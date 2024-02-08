import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';

export function useApi() {
    const indexStore = useIndexStore();

    const { authToken, notConnected, rebootingDeviceAddr } = storeToRefs(indexStore);

    const route = useRoute();

    const router = useRouter();

    let abortController: AbortController | undefined;

    let signal: AbortSignal | undefined;

    const isAborted = ref(false);

    let isFree = true;

    function createNewAbortController() {
        isAborted.value = false;
        abortController = new AbortController();
        signal = abortController.signal;
        signal.onabort = () => {
            isAborted.value = true;
        };
    }

    const api = axios.create({
        transitional: {
            clarifyTimeoutError: true,
        },
    });

    api.interceptors.request.use(
        (config) => {
            if (!isFree) {
                throw new Error('isBusy');
            }
            const isMisc = config.url?.startsWith('/misc/');
            if (!signal || signal.aborted) {
                createNewAbortController();
            }
            isFree = false;
            return {
                ...config,
                // url: isMisc ? config.url : `/api/${config.url}`,
                // url: isMisc ? config.url : `http://192.168.1.99/api/${config.url}`,
                // url: isMisc ? config.url : `http://65.21.176.66:49163/api/${config.url}`,
                url: isMisc
                    ? `http://65.21.176.66:49163${config.url}`
                    : `http://65.21.176.66:49163/api/${config.url}`,
                data: isMisc ? config.data : JSON.stringify(config.data),
                timeout: config.url === 'calibr_adc_in' ? 10000 : 5000,
                headers: isMisc
                    ? {
                          'Content-Type': 'text/plain; charset=utf-8',
                          //   'Auth-Token': authToken.value,
                      }
                    : {},
                signal,
            } as InternalAxiosRequestConfig;
        },
        (error) => Promise.reject(error),
    );

    api.interceptors.response.use(
        (response) => {
            if (response.data.status === 'error') {
                if (response.data.code === 18 && route.name !== 'login') {
                    indexStore.setIsAuth(undefined);
                    router.push({ name: 'login' });
                } else {
                    isFree = true;
                    throw new Error();
                }
            } else if (notConnected.value) {
                indexStore.setIsNotConnected(false);
            }
            isFree = true;
            return response;
        },
        async (error: AxiosError) => {
            if (
                error.code === 'ETIMEDOUT' ||
                error.code === 'ERR_NETWORK' ||
                error.response?.status === 500
            ) {
                if (!notConnected.value && rebootingDeviceAddr.value !== 0) {
                    indexStore.setIsNotConnected(true);
                } else {
                    await new Promise((res) => {
                        setTimeout(res, 1000);
                    });
                }
                isFree = true;
            } else {
                if (error.message !== 'isBusy') {
                    isFree = true;
                }
            }
            return Promise.reject(error);
        },
    );

    function abort() {
        abortController?.abort();
    }

    watch(notConnected, () => {
        if (notConnected.value) {
            abort();
        }
    });

    onBeforeUnmount(() => {
        abort();
    });

    return { api, abort, isAborted };
}
