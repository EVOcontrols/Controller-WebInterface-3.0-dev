import type { DropDownRealType, EntityForBody } from './types';
import type { Device } from '@/stores';

export const createBodyState = (
    type: DropDownRealType,
    quant: number,
    bus?: number,
    device?: number,
    propDevice?: Device,
): { entities: EntityForBody[] } => {
    const deviceAddr = propDevice ? (propDevice.addr === 0 ? device || 0 : propDevice.addr) : 0;

    const entity = {
        type,
        device: deviceAddr,
        index: 0,
        quantity: quant,
        ...(bus !== undefined && { bus: bus || 0 }),
    };

    return {
        entities: [entity],
    };
};
