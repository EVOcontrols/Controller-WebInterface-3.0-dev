import type { FuncsNumberPerPage } from '@/typings/funcs';

export const useFuncsStore = defineStore('funcsStore', () => {
    const funcsNumberPerPage = ref<FuncsNumberPerPage>(funcsNumbersPerPage[0]);

    function setFuncsNumberPerPage(value: FuncsNumberPerPage) {
        funcsNumberPerPage.value = value;
    }

    return {
        funcsNumberPerPage,
        setFuncsNumberPerPage,
    };
});
