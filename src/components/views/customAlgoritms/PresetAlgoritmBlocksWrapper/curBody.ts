import type { Body } from '@/typings/funcs';
import type { UDF } from './types';

export const getInitCurBody = (val: UDF, device?: number): Body => {
    switch (val) {
        case 'udf-act':
            return {
                type: 'invert',
                entity: {
                    type: 'pwm-out',
                    device: 0, // для ngc может быть не 0, для нгио всегда 0
                    index: 0,
                },
                delay: {
                    type: 'tim-const',
                    value: 5000,
                },
                'cond-idx': 1,
                'cond-qty': 1,
                'start-on-cond': true,
                'cond-logic': 'or',
                'init-state': 0,
                value: {
                    type: 'int-const',
                    value: 0,
                },
                time: {
                    type: 'tim-const',
                    value: 5000,
                },
                'stop-val': {
                    type: 'pwm-out',
                    device: 0,
                    index: 0,
                },
                'stop-on-trig': true,
                'stop-on-cond': true,
            };
        case 'udf-cond':
            return {
                operation: 'less',
                entity: {
                    type: '1w-sens',
                    bus: 1,
                    index: 0,
                    device: 0,
                    io: 0,
                },
                value: {
                    type: 'int-const',
                    value: 0,
                },
                time: {
                    type: 'tim-const',
                    value: 3000,
                },
                'init-state': 1,
            } as Body;
        case 'udf-trans':
            return {
                operation: '+',
                result: {
                    type: 'pwm-out',
                    device: 1, // для ngc может быть не 0, для нгио всегда 0
                    index: 0,
                },
                left: {
                    type: 'adc-in',
                    device: 0,
                    index: 0,
                },
                right: {
                    type: 'bin-out',
                    device: 0,
                    index: 0,
                },
                'init-state': 0,
            } as Body;
        case 'udf-trig':
        default:
            return {
                'act-idx': 0,
                'act-qty': 1,
                type: 'compare',
                entity: {
                    type: '1w-rom',
                    device: 0,
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
