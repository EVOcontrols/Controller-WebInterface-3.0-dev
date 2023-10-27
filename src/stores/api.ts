type Method = 'get' | 'post';
type Query = { method: Method; url: string; params?: any };

export const useApiStore = defineStore('apiStore', () => {
  const indexStore = useIndexStore();

  const { notConnected, rebootingDeviceAddr, extDeviceInInitState } = storeToRefs(indexStore);

  const { api: apiInstance } = useApi();

  const route = useRoute();

  const directQueriesIds: Set<number> = new Set([]);

  const timeout = import.meta.env.DEV ? 5000 : 1000;

  const bgQueries = computed(() => {
    const queries: Query[] = [];
    if (route.name === 'devices-settings') {
      queries.push({ method: 'get', url: 'get_ext_devs' });
    }
    return queries;
  });

  async function query<T = any>(method: Method, url: string, params?: any, isQueryBg = false) {
    let queryId: number | undefined;
    if (!isQueryBg) {
      queryId = Math.random();
      directQueriesIds.add(queryId);
    }
    try {
      const r = await apiInstance[method]<T>(url, params);
      return r;
    } catch (error) {
      return Promise.reject(error);
    } finally {
      if (queryId) {
        directQueriesIds.delete(queryId);
      }
    }
  }

  async function getBgData(lastBgQuery?: string) {
    if (
      !bgQueries.value.length ||
      directQueriesIds.size ||
      notConnected.value ||
      rebootingDeviceAddr.value !== undefined
    ) {
      setTimeout(() => getBgData(lastBgQuery), 1000);
      return;
    }
    let nextBgQuery: Query;
    if (extDeviceInInitState.value !== undefined) {
      nextBgQuery = { method: 'get', url: 'get_ext_devs' };
      await new Promise((res) => setTimeout(res, timeout));
    } else {
      const lastBgQueryIndex = lastBgQuery
        ? bgQueries.value.findIndex((q) => q.url === lastBgQuery)
        : -1;
      let nextBgQueryIndex = lastBgQueryIndex === -1 ? 0 : lastBgQueryIndex + 1;
      if (nextBgQueryIndex >= bgQueries.value.length - 1) {
        nextBgQueryIndex = 0;
      }
      nextBgQuery = bgQueries.value[nextBgQueryIndex];
      if (nextBgQueryIndex === 0) {
        await new Promise((res) => setTimeout(res, timeout));
      }
    }
    try {
      const r = await query(nextBgQuery.method, nextBgQuery.url, nextBgQuery.params, true);
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
    getBgData(nextBgQuery.url);
  }

  const api = {
    async get<T = any>(url: string, params?: any) {
      return await query<T>('get', url, params);
    },
    async post<T = any>(url: string, params?: any) {
      return await query<T>('post', url, params);
    },
  };

  getBgData();

  return { api };
});
