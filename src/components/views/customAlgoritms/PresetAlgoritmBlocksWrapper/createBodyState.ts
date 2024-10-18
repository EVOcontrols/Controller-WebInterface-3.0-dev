import { DropDownRealType, EntityForBody } from './types';
import type { Device } from '@/stores';

export const createBodyState = (
    type: DropDownRealType,
    quant: number,
    bus?: number,
    device?: number,
    propDevice?: Device,
): { entities: EntityForBody[] } => {
    const mbTypes = ['mb-co', 'mb-ir', 'mb-hr', 'mb-di'];
    const entityType = mbTypes.includes(type) ? 'mb-var' : type;
    const deviceAddr = propDevice
        ? propDevice.addr === 0
            ? device || 0
            : bus === undefined
            ? 0
            : propDevice.addr
        : 0;

    const entity = {
        type: entityType,
        device: deviceAddr,
        index: 0,
        quantity: quant,
        ...(bus !== undefined && { bus: bus || 0 }),
    };

    return {
        entities: [entity],
    };
};
