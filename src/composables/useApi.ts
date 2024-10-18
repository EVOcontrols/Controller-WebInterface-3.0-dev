import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';

export function useApi() {
    const indexStore = useIndexStore();

    const { authToken, notConnected, rebootingDeviceAddr, ip } = storeToRefs(indexStore);

    const route = useRoute();

    const router = useRouter();

    let abortController: AbortController | undefined;

    let signal: AbortSignal | undefined;

    const isAborted = ref(false);

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
            const isUser = config.url?.startsWith('/user/');
            if (!signal || signal.aborted) {
                createNewAbortController();
            }
            return {
                ...config,
                // url: isUser ? config.url : `/api/${config.url}`,
                // url: isUser ? config.url : `http://192.168.1.99/api/${config.url}`,
                // url: isUser ? config.url : `http://65.21.176.66:49163/api/${config.url}`,
                // url: isUser
                //     ? `http://192.168.1.99${config.url}`
                //     : `http://192.168.1.99/api/v3/${config.url}`,
                url: isUser
                    ? `http://${ip.value}${config.url}`
                    : `http://${ip.value}/api/v3/${config.url}`,
                // url: isUser
                //     ? `http://10.8.0.1:49163${config.url}`
                //     : `http://10.8.0.1:49163/api/v3/${config.url}`,
                // url: isUser
                //     ? `http://65.21.176.66:49163${config.url}`
                //     : `http://65.21.176.66:49163/api/${config.url}`,
                data: isUser ? config.data : JSON.stringify(config.data),
                timeout:
                    config.url && config.url === 'scan_ext_devs'
                        ? 60000
                        : (config.url && ['calibr_adc_in', 'get_config'].includes(config.url)) ||
                          config.url?.includes('user')
                        ? 10000
                        : 5000,
                headers: isUser
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
