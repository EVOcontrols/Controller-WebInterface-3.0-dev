import type { Lang, TempUnit, NumberingSystem } from '@/typings/common';
import type { CommonSettingsFileType } from '@/typings/files';
import type { FuncsNumberPerPage } from '@/typings/funcs';

export function useStoreCommonSettingsFile() {
    const indexStore = useIndexStore();

    const { userRole } = storeToRefs(indexStore);

    const funcsStore = useFuncsStore();

    const { readFile, saveToFile } = useReadWriteFiles();

    async function storeCommonSettingsFile(
        lang?: Lang,
        tempUnit?: TempUnit,
        funcsNumberPerPage?: FuncsNumberPerPage,
        numberingSystem?: NumberingSystem,
    ) {
        const commonFileSettingsInit = await readFile({
            type: 'settings',
            subType: 'common',
            user: userRole.value,
        });
        if (commonFileSettingsInit === 'error') return 'error';
        const init = commonFileSettingsInit === 'notFound' ? undefined : commonFileSettingsInit;
        const commonFileSettings: CommonSettingsFileType = {
            lang: lang || init?.lang || indexStore.lang,
            funcsNumberPerPage:
                funcsNumberPerPage || init?.funcsNumberPerPage || funcsStore.funcsNumberPerPage,
            tempUnit: tempUnit || init?.tempUnit || indexStore.tempUnit,
            numberingSystem: numberingSystem || init?.numberingSystem || indexStore.numberingSystem,
        };
        const isSavingError = await saveToFile(
            {
                type: 'settings',
                subType: 'common',
                user: userRole.value,
            },
            commonFileSettings,
        );
        if (!isSavingError) {
            if (lang) indexStore.setLang(lang);
            if (tempUnit) indexStore.setTempUnit(tempUnit);
            if (funcsNumberPerPage) funcsStore.setFuncsNumberPerPage(funcsNumberPerPage);
            if (numberingSystem) indexStore.setNumberingSystem(numberingSystem);
        }
        return isSavingError ? 'error' : 'success';
    }

    return { storeCommonSettingsFile };
}
