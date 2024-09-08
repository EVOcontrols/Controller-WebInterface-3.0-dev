import type { LabelsFileType, FileType, FileContent } from '@/typings/files';

export function useReadWriteFiles() {
    const indexStore = useIndexStore();

    const api = indexStore.getApi().api;

    async function saveToFile<T extends FileType>(params: T, content: FileContent<T>) {
        let hasErrors = false;
        let name = params.subType ? `${params.type}.${params.subType}` : `${params.type}`;
        if (params.type === 'labels') {
            if (params.subType === 'mbDevices' || params.subType === 'mbVars') {
                name += `.d${params.device}.b${params.bus}`;
            } else {
                name +=
                    params.bus !== undefined
                        ? `.d${params.device}.i${params.interf}.b${params.bus}`
                        : `.d${params.device}.i${params.interf}`;
            }
        } else if (params.type === 'settings' && params.subType === 'common') {
            name += `.${params.user}`;
        } else if (params.type === 'mb') {
            name += `.d${params.device}.b${params.bus}`;
        }
        try {
            const r = await api.post(`/user/${name}.json`, JSON.stringify(content));
            if (r.status !== 201) throw new Error();
        } catch (error) {
            hasErrors = true;
        }
        return hasErrors;
    }

    async function readFile<T extends FileType>(
        params: T,
    ): Promise<FileContent<T> | 'error' | 'notFound'> {
        let name = params.subType ? `${params.type}.${params.subType}` : `${params.type}`;
        const isLabels = params.type === 'labels';
        if (isLabels) {
            if (params.subType === 'mbDevices' || params.subType === 'mbVars') {
                name += `.d${params.device}.b${params.bus}`;
            } else {
                name +=
                    params.bus !== undefined
                        ? `.d${params.device}.i${params.interf}.b${params.bus}`
                        : `.d${params.device}.i${params.interf}`;
            }
        } else if (params.type === 'settings' && params.subType === 'common') {
            name += `.${params.user}`;
        } else if (params.type === 'mb') {
            name += `.d${params.device}.b${params.bus}`;
        }
        try {
            const r = await api.get(`/user/${name}.json`);
            return r.data;
        } catch (e: any) {
            if (e.response?.status === 404) {
                return 'notFound';
            }
            return 'error';
        }
    }

    return {
        saveToFile,
        readFile,
        // readLabelsFiles,
    };
}
