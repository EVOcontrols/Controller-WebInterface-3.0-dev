import type { FuncsNumberPerPage } from '@/typings/funcs';

export const useFuncsStore = defineStore('funcsStore', () => {
    const funcsNumberPerPage = ref<FuncsNumberPerPage>(funcsNumbersPerPage[0]);

    const funcLabels = ref<
        { name: 'udf-act' | 'udf-cond' | 'udf-trans' | 'udf-trig'; val: string[] }[][]
    >([]);

    function setFuncsNumberPerPage(value: FuncsNumberPerPage) {
        funcsNumberPerPage.value = value;
    }

    function setLabels(
        device: number,
        type: 'udf-act' | 'udf-cond' | 'udf-trans' | 'udf-trig',
        labelsArr: string[],
    ) {
        if (!funcLabels.value[device]) {
            const prev = [...funcLabels.value];
            const res = [];
            for (let i = funcLabels.value.length; i < device; i++) {
                res.push([]);
            }
            res.push([{ name: type, val: labelsArr }]);
            funcLabels.value = [...prev, ...res];
        } else {
            const res = [...funcLabels.value];
            const obj = res[device].find((el) => el.name === type);
            if (obj) {
                obj.val = labelsArr;
            } else {
                res[device].push({ name: type, val: labelsArr });
            }
            funcLabels.value = [...res];
        }
    }

    return {
        funcsNumberPerPage,
        funcLabels,
        setLabels,
        setFuncsNumberPerPage,
    };
});
