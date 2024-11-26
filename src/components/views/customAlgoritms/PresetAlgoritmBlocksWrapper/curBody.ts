import type { Body } from '@/typings/funcs';
import type { UDF } from './types';

export const getInitCurBody = (val: UDF, device: number): Body => {
    switch (val) {
        case 'udf-act':
            return {
                type: 'invert',
                entity: {
                    type: 'pwm-out',
                    device, // для ngc может быть не 0, для нгио всегда 0
                    index: 0,
                },
                delay: {
                    type: 'tim-const',
                    value: 0,
                },
                'cond-idx': 0,
                'cond-qty': 0,
                'start-on-cond': false,
                'cond-logic': 'or',
                'init-state': 1,
                value: {
                    type: 'int-const',
                    value: 0,
                },
                time: {
                    type: 'tim-const',
                    value: 0,
                },
                'stop-val': {
                    type: 'prev-value',
                },
                'stop-on-trig': false,
                'stop-on-cond': false,
            };
        case 'udf-cond':
            return {
                operation: 'equal',
                entity: {
                    type: 'bin-in',
                    index: 0,
                    device,
                },
                value: {
                    type: 'int-const',
                    value: 0,
                },
                time: {
                    type: 'tim-const',
                    value: 0,
                },
                'init-state': 1,
            } as Body;
        case 'udf-trans':
            return {
                operation: '+',
                result: {
                    type: 'pwm-out',
                    device, // для ngc может быть не 0, для нгио всегда 0
                    index: 0,
                },
                left: {
                    type: 'adc-in',
                    device,
                    index: 0,
                },
                right: {
                    type: 'bin-out',
                    device,
                    index: 0,
                },
                'init-state': 1,
            } as Body;
        case 'udf-trig':
        default:
            return {
                'act-idx': 0,
                'act-qty': 0,
                type: 'compare',
                entity: {
                    type: '1w-rom',
                    device,
                    bus: 0,
                    index: 0,
                },
                value: { type: 'int-const', value: 1 },
                time: { type: 'tim-const', value: 0 },
                operation: 'bin-equal',
                hysteresis: 0,
                'init-state': 1,
            };
    }
};
