import type { LabelsFileType, FileType, FileContent } from '@/typings/files';

export function useReadWriteFiles() {
    const indexStore = useIndexStore();

    const api = indexStore.getApi().api;

    // function processLabelsChunk(receivedLabels: unknown, params: LabelsFileType) {
    //     const isMbDevicesLabels = params.subType === 'mbDevices';
    //     let labels = (Array.isArray(receivedLabels) ? receivedLabels : []).map((l: unknown) => {
    //         if (typeof l === 'number') return l.toString();
    //         if (typeof l !== 'string') return isMbDevicesLabels ? null : '';
    //         return l;
    //     });
    //     if (labels.length > labelsFileLength) {
    //         labels.splice(labelsFileLength);
    //     } else if (labels.length < labelsFileLength) {
    //         labels = labels.concat(
    //             new Array(labelsFileLength - labels.length).fill(isMbDevicesLabels ? null : ''),
    //         );
    //     }
    //     return labels;
    // }

    async function saveToFile<T extends FileType>(
        params: T,
        content: FileContent<T>,
        part?: number,
    ) {
        let hasErrors = false;
        let name = params.subType ? `${params.type}.${params.subType}` : `${params.type}`;
        if (params.type === 'labels') {
            if (params.subType === 'mbDevices' || params.subType === 'mbVars') {
                name += `.d${params.device}.b${params.bus}`;
            } else {
                name +=
                    params.bus !== undefined
                        ? `.d${params.device}.i${params.interf}${params.bus}`
                        : `.d${params.device}.i${params.interf}`;
            }
        } else if (params.type === 'settings' && params.subType === 'common') {
            name += `.${params.user}`;
        } else if (params.type === 'mb') {
            name += `.d${params.device}.b${params.bus}`;
        }
        if (part !== undefined) name += `.p${part}`;
        try {
            const r = await api.post(`/misc/${name}.json`, JSON.stringify(content));
            if (r.status !== 201) throw new Error();
        } catch (error) {
            hasErrors = true;
        }
        return hasErrors;
    }

    async function readFile<T extends FileType>(
        params: T,
        part?: number,
    ): Promise<FileContent<T> | 'error' | 'notFound'> {
        let name = params.subType ? `${params.type}.${params.subType}` : `${params.type}`;
        const isLabels = params.type === 'labels';
        if (isLabels) {
            if (params.subType === 'mbDevices' || params.subType === 'mbVars') {
                name += `.d${params.device}.b${params.bus}`;
            } else {
                name +=
                    params.bus !== undefined
                        ? `.d${params.device}.i${params.interf}${params.bus}`
                        : `.d${params.device}.i${params.interf}`;
            }
        } else if (params.type === 'settings' && params.subType === 'common') {
            name += `.${params.user}`;
        } else if (params.type === 'mb') {
            name += `.d${params.device}.b${params.bus}`;
        }
        if (part !== undefined) {
            name += `.p${part}`;
        }
        try {
            const r = await api.get(`/misc/${name}.json`);
            return r.data;
        } catch (e: any) {
            if (e.response?.status === 404) {
                return 'notFound';
            }
            return 'error';
        }
    }

    // async function readLabelsFiles<T extends LabelsFileType>(
    //     params: T,
    //     parts: number[],
    // ): Promise<FileContent<T> | 'error'> {
    //     const labels = new Array(0) as FileContent<T>;
    //     let isError = false;
    //     await parts.reduce(
    //         (acc, part) =>
    //             acc.then(
    //                 () =>
    //                     new Promise((res) => {
    //                         if (isError) {
    //                             res();
    //                             return;
    //                         }
    //                         readFile(params, part).then((r) => {
    //                             if (r === 'error') {
    //                                 isError = true;
    //                             } else {
    //                                 labels.splice(
    //                                     part * labelsFileLength,
    //                                     (part + 1) * labelsFileLength,
    //                                     ...r,
    //                                 );
    //                             }
    //                             res();
    //                         });
    //                     }),
    //             ),
    //         Promise.resolve(),
    //     );
    //     return isError ? 'error' : labels;
    // }

    return {
        saveToFile,
        readFile,
        // readLabelsFiles,
    };
}
