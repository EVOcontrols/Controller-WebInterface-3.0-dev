/* eslint-disable */
// @ts-nocheck
export const _ = {
    cloneDeep: async () => (await import('lodash-es/cloneDeep')).default,
    isEmpty: async () => (await import('lodash-es/isEmpty')).default,
    isEqual: async () => (await import('lodash-es/isEqual')).default,
    isEqualWith: async () => (await import('lodash-es/isEqualWith')).default,
    omit: async () => (await import('lodash-es/omit')).default,
    pick: async () => (await import('lodash-es/pick')).default,
};
