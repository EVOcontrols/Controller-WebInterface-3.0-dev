import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';

export function useApi() {
    const indexStore = useIndexStore();

    const { authToken, notConnected, rebootingDeviceAddr } = storeToRefs(indexStore);

    const route = useRoute();

    const router = useRouter();

    let abortController: AbortController | undefined;

    let signal: AbortSignal | undefined;

    const isAborted = ref(false);

    const time = 0;

    function createNewAbortController() {
        isAborted.value = false;
        abortController = new AbortController();
        signal = abortController.signal;
        signal.onabort = () => {
            isAborted.value = true;
        };
    }

    const api = axios.create({
        timeout: 5000,
        transitional: {
            clarifyTimeoutError: true,
        },
    });

    api.interceptors.request.use(
        (config) => {
            const isMisc = config.url?.startsWith('/misc/');
            if (!signal || signal.aborted) {
                createNewAbortController();
            }
            // const currentTime = Date.now();
            // console.log(currentTime - time, config.url);
            // time = currentTime;
            return {
                ...config,
                // url: isMisc ? config.url : `/api/${config.url}`,
                // url: isMisc ? config.url : `http://192.168.1.30/api/${config.url}`,
                url: isMisc ? config.url : `http://65.21.176.66:49163/api/${config.url}`,
                data: isMisc ? config.data : JSON.stringify(config.data),
                headers: isMisc
                    ? {
                          'Content-Type': 'text/plain; charset=utf-8',
                          'Auth-Token': authToken.value,
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
                    throw new Error();
                }
            } else if (notConnected.value) {
                indexStore.setIsNotConnected(false);
            }
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
