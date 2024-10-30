import { type Config, CurKeyMap } from './types';
import type { Device } from '@/stores';

type InterfProp = { interf: string; bus: number };

const validValuesWithBus = ['mb-var', '1w-rom', '1w-sens', '1w-gpio'];

function configureBus(
    ent: any,
    interfaceTypeConfig: Config | undefined,
    busConfig: Config | undefined,
    propDevice: Device | undefined,
) {
    if (interfaceTypeConfig && validValuesWithBus.includes(interfaceTypeConfig.tabs[0].val as string)) {
        const interfaceProp = propDevice?.interf.find(
            (i) => typeof i === 'object' && i.interf === interfaceTypeConfig.tabs[0].val,
        ) as InterfProp;
        const busProp = interfaceProp ? interfaceProp.bus : 0;
        const busNumber = Number(busConfig?.tabs[0].val);
        const busResult = Number.isNaN(busNumber) ? busProp : busNumber;
        ent = {
            ...ent,
            ...(interfaceTypeConfig?.tabs[0].val === '1w-sens' ? { bus: busResult, io: 0 } : { bus: busResult }),
        };
    }
    return ent;
}

function configureTime(timeConfig: Config | undefined) {
    return timeConfig?.btns[0].val === 'tim-var'
        ? {
              type: 'tim-var',
              index: timeConfig?.dropDowns[0].vals[0],
          }
        : {
              type: 'tim-const',
              value: timeConfig?.inputs[0].val,
          };
}

function createObjUdfAct(config: Config[], propDevice?: Device) {
    const statusStart = config.find((el) => el.curKey === CurKeyMap.StatusStartSystem);
    const interfType = config.find((el) => el.curKey === CurKeyMap.Interface);
    const device = config.find((el) => el.curKey === CurKeyMap.Device);
    const object = config.find((el) => el.curKey === CurKeyMap.Object);
    const bus = config.find((el) => el.curKey === CurKeyMap.Bus);
    const interfaceRight = config.find((el) => el.curKey === CurKeyMap.InterfaceRight);
    const comparisonOperation = config.find((el) => el.curKey === CurKeyMap.ComparisonOperation);
    const time = config.find((el) => el.curKey === CurKeyMap.Time);
    const delay = config.find((el) => el.curKey === CurKeyMap.Delay);
    const multiSelect = config.find((el) => el.curKey === CurKeyMap.MultiSelect);
    const startStopMode = config.find((el) => el.curKey === CurKeyMap.StartStopMode);
    const cyclicMode = config.find((el) => el.curKey === CurKeyMap.CyclicMode);
    const objectRight = config.find((el) => el.curKey === CurKeyMap.ObjectRight);
    const valInterfType = config.find((el) => el.curKey === CurKeyMap.ValueInterface);
    const valDevice = config.find((el) => el.curKey === CurKeyMap.ValueDevice);
    const valObject = config.find((el) => el.curKey === CurKeyMap.ValueObject);
    const valBus = config.find((el) => el.curKey === CurKeyMap.ValueBus);
    const select = config.find((el) => el.curKey === CurKeyMap.Select);
    const enter = config.find((el) => el.curKey === CurKeyMap.Enter);
    const stopValConfig = config.find((el) => el.curKey === CurKeyMap.StopValue);
    const stopValEnter = config.find((el) => el.curKey === CurKeyMap.StopValueEnter);
    const stopValInterfType = config.find((el) => el.curKey === CurKeyMap.StopValueInterface);
    const stopValDevice = config.find((el) => el.curKey === CurKeyMap.StopValueDevice);
    const stopValObject = config.find((el) => el.curKey === CurKeyMap.StopValueObject);
    const stopValBus = config.find((el) => el.curKey === CurKeyMap.StopValueBus);

    let ent = {
        type: interfType?.tabs[0].val,
        device: device?.tabs[0].val,
        index: object?.dropDowns[0].vals[0],
    };

    ent = configureBus(ent, interfType, bus, propDevice);

    let obj = {
        type: interfaceRight?.radioBtns[0].val,
        entity: ent,
        delay:
            delay?.btns[0].val === 'tim-var'
                ? {
                      type: 'tim-var',
                      index: delay?.dropDowns[0].vals[0],
                  }
                : {
                      type: 'tim-const',
                      value: delay?.inputs[0].val,
                  },
        'cond-idx': multiSelect?.dropDowns[0].vals[0] || 0,
        'cond-qty': multiSelect?.dropDowns[0].vals.length || 0,
        'start-on-cond': startStopMode?.checkBoxes[0][1].valsArr.includes('conditionsOccur'),
        'cond-logic': multiSelect?.btns[0].val,
        'init-state': statusStart?.btns[0].val === 'on' ? 1 : 0,
    };

    if (interfaceRight?.radioBtns[0].val === 'set' || interfaceRight?.radioBtns[0].val === 'invert') {
        let ent = {};
        if (objectRight?.btns[0].val === 'obj') {
            ent = {
                type: valInterfType?.tabs[0].val || 'bin-in',
                device: valDevice?.tabs[0].val || 0,
                index: valObject?.dropDowns[0].vals[0] || 0,
            };
            ent = configureBus(ent, valInterfType, valBus, propDevice);
        } else {
            ent = {
                type: 'int-const',
                value: enter?.inputs[0].val,
            };
        }

        let stopVal = {};
        if (stopValConfig?.btns[0].val === 'obj') {
            stopVal = {
                type: stopValInterfType?.tabs[0].val || 'pwm-out',
                device: stopValDevice?.tabs[0].val || 0,
                index: stopValObject?.dropDowns[0].vals[0] || 0,
            };
            stopVal = configureBus(stopVal, stopValInterfType, stopValBus, propDevice);
        } else if (stopValConfig?.btns[0].val === 'const') {
            stopVal = {
                type: 'int-const',
                value: stopValEnter?.inputs[0].val,
            };
        } else {
            stopVal = {
                type: 'prev-value',
            };
        }

        const curObj = {
            value: ent,
            time:
                time?.btns[0].val === 'tim-var'
                    ? {
                          type: 'tim-var',
                          index: time?.dropDowns[0].vals[0],
                      }
                    : {
                          type: 'tim-const',
                          value: time?.inputs[0].val,
                      },
            'stop-val': stopVal,
            'stop-on-trig': startStopMode?.checkBoxes[0][2].valsArr.includes('triggerNoMatches'),
            'stop-on-cond': startStopMode?.checkBoxes[0][2].valsArr.includes('conditionNoMatches'),
        };
        obj = Object.assign(obj, curObj);
    } else if (interfaceRight?.radioBtns[0].val === 'modify') {
        let ent = {};
        if (objectRight?.btns[0].val === 'obj') {
            ent = {
                type: valInterfType?.tabs[0].val || 'bin-in',
                device: valDevice?.tabs[0].val || 0,
                index: valObject?.dropDowns[0].vals[0] || 0,
            };
            ent = configureBus(ent, valInterfType, valBus, propDevice);
        } else {
            ent = {
                type: 'int-const',
                value:
                    comparisonOperation?.radioBtns[0].val === 'bin-equal' ||
                    comparisonOperation?.radioBtns[0].val === 'bin-not-equal'
                        ? select?.btns[0].val
                        : enter?.inputs[0].val,
            };
        }
        let stopVal = {};
        if (stopValConfig?.btns[0].val === 'obj') {
            stopVal = {
                type: stopValInterfType?.tabs[0].val || 'pwm-out',
                device: stopValDevice?.tabs[0].val || 0,
                index: stopValObject?.dropDowns[0].vals[0] || 0,
            };
            stopVal = configureBus(stopVal, stopValInterfType, stopValBus, propDevice);
        } else if (stopValConfig?.btns[0].val === 'const') {
            stopVal = {
                type: 'int-const',
                value: stopValEnter?.inputs[0].val,
            };
        } else {
            stopVal = {
                type: 'prev-value',
            };
        }
        const curObj = {
            value: ent,
            time:
                time?.btns[0].val === 'tim-var'
                    ? {
                          type: 'tim-var',
                          index: time?.dropDowns[0].vals[0],
                      }
                    : {
                          type: 'tim-const',
                          value: time?.inputs[0].val,
                      },
            'stop-val': stopVal,
            operation: comparisonOperation?.radioBtns[0].val || '=',
            unsigned: false,
            'stop-on-trig': startStopMode?.checkBoxes[0][2].valsArr.includes('triggerNoMatches'),
            'stop-on-cond': startStopMode?.checkBoxes[0][2].valsArr.includes('conditionNoMatches'),
        };
        obj = Object.assign(obj, curObj);
    } else if (interfaceRight?.radioBtns[0].val === 'change') {
        let ent = {};
        if (objectRight?.btns[0].val === 'obj') {
            ent = {
                type: valInterfType?.tabs[0].val || 'bin-in',
                device: valDevice?.tabs[0].val || 0,
                index: valObject?.dropDowns[0].vals[0] || 0,
            };
            ent = configureBus(ent, valInterfType, valBus, propDevice);
        } else {
            ent = {
                type: 'int-const',
                value:
                    comparisonOperation?.radioBtns[0].val === 'bin-equal' ||
                    comparisonOperation?.radioBtns[0].val === 'bin-not-equal'
                        ? select?.btns[0].val
                        : enter?.inputs[0].val,
            };
        }
        const curObj = {
            value: ent,
            time:
                time?.btns[0].val === 'tim-var'
                    ? {
                          type: 'tim-var',
                          index: time?.dropDowns[0].vals[0],
                      }
                    : {
                          type: 'tim-const',
                          value: time?.inputs[0].val,
                      },
            'stop-on-trig': startStopMode?.checkBoxes[0][2].valsArr.includes('triggerNoMatches'),
            'stop-on-cond': startStopMode?.checkBoxes[0][2].valsArr.includes('conditionNoMatches'),
        };
        obj = Object.assign(obj, curObj);
    } else if (interfaceRight?.radioBtns[0].val === 'cycle') {
        const curObj = {
            time:
                time?.btns[0].val === 'tim-var'
                    ? {
                          type: 'tim-var',
                          index: time?.dropDowns[0].vals[0],
                      }
                    : {
                          type: 'tim-const',
                          value: time?.inputs[0].val,
                      },
            pause:
                time?.btns[0].val === 'tim-var'
                    ? {
                          type: 'tim-var',
                          index: time?.dropDowns[0].vals[0],
                      }
                    : {
                          type: 'tim-const',
                          value: time?.inputs[0].val,
                      },
            direction: cyclicMode?.btns[1].val || 'to-max',
            infinite: cyclicMode?.btns[0].val === 'yes',
            'stop-on-trig': startStopMode?.checkBoxes[0][2].valsArr.includes('triggerNoMatches'),
            'stop-on-cond': startStopMode?.checkBoxes[0][2].valsArr.includes('conditionNoMatches'),
        };
        obj = Object.assign(obj, curObj);
    }

    return obj;
}

function createObjUdfCond(config: Config[], propDevice?: Device) {
    const statusStart = config.find((el) => el.curKey === CurKeyMap.StatusStartSystem);
    const interfType = config.find((el) => el.curKey === CurKeyMap.Interface);
    const device = config.find((el) => el.curKey === CurKeyMap.Device);
    const object = config.find((el) => el.curKey === CurKeyMap.Object);
    const bus = config.find((el) => el.curKey === CurKeyMap.Bus);
    const comparisonOperation = config.find((el) => el.curKey === CurKeyMap.ComparisonOperation);
    const time = config.find((el) => el.curKey === CurKeyMap.Time);
    const objectRight = config.find((el) => el.curKey === CurKeyMap.ObjectRight);
    const valInterfType = config.find((el) => el.curKey === CurKeyMap.ValueInterface);
    const valDevice = config.find((el) => el.curKey === CurKeyMap.ValueDevice);
    const valObject = config.find((el) => el.curKey === CurKeyMap.ValueObject);
    const valBus = config.find((el) => el.curKey === CurKeyMap.ValueBus);
    const select = config.find((el) => el.curKey === CurKeyMap.Select);
    const enter = config.find((el) => el.curKey === CurKeyMap.Enter);

    let ent = {
        type: interfType?.tabs[0].val,
        device: device?.tabs[0].val,
        index: object?.dropDowns[0].vals[0],
    };
    ent = configureBus(ent, interfType, bus, propDevice);
    let val = {};
    if (objectRight?.btns[0].val === 'obj') {
        val = {
            type: valInterfType?.tabs[0].val || 'bin-in',
            device: valDevice?.tabs[0].val || 0,
            index: valObject?.dropDowns[0].vals[0] || 0,
        };
        val = configureBus(val, valInterfType, valBus, propDevice);
    } else {
        val = {
            type: 'int-const',
            value:
                comparisonOperation?.radioBtns[0].val === 'bin-equal' ||
                comparisonOperation?.radioBtns[0].val === 'bin-not-equal'
                    ? select?.btns[0].val
                    : enter?.inputs[0].val,
        };
    }
    let obj = {
        operation: comparisonOperation?.radioBtns[0].val,
        'init-state': statusStart?.btns[0].val === 'on' ? 1 : 0,
        entity: ent,
        value: val,
        time:
            time?.btns[0].val === 'tim-var'
                ? {
                      type: 'tim-var',
                      index: time?.dropDowns[0].vals[0],
                  }
                : {
                      type: 'tim-const',
                      value: time?.inputs[0].val,
                  },
    };
    const operation = comparisonOperation?.radioBtns[0].val;
    if (
        operation === 'less' ||
        operation === 'less-eq' ||
        operation === 'more' ||
        operation === 'more-eq' ||
        operation === 'equal' ||
        operation === 'not-equal'
    ) {
        obj = Object.assign(obj, {
            unsigned: false,
        });
    }
    return obj;
}

function createObjUdfTrans(config: Config[], propDevice?: Device) {
    const statusStart = config.find((el) => el.curKey === CurKeyMap.StatusStartSystem);
    const interfType = config.find((el) => el.curKey === CurKeyMap.Interface);
    const device = config.find((el) => el.curKey === CurKeyMap.Device);
    const object = config.find((el) => el.curKey === CurKeyMap.Object);
    const bus = config.find((el) => el.curKey === CurKeyMap.Bus);
    const interfaceRight = config.find((el) => el.curKey === CurKeyMap.InterfaceRight);
    const deviceRight = config.find((el) => el.curKey === CurKeyMap.DeviceRight);
    const comparisonOperation = config.find((el) => el.curKey === CurKeyMap.ComparisonOperation);
    const objectRight = config.find((el) => el.curKey === CurKeyMap.ObjectRight);
    const valInterfType = config.find((el) => el.curKey === CurKeyMap.ValueInterface);
    const valDevice = config.find((el) => el.curKey === CurKeyMap.ValueDevice);
    const valObject = config.find((el) => el.curKey === CurKeyMap.ValueObject);
    const select = config.find((el) => el.curKey === CurKeyMap.Select);
    const enter = config.find((el) => el.curKey === CurKeyMap.Enter);

    let left = {
        type: interfType?.tabs[0].val,
        device: device?.tabs[0].val,
        index: object?.dropDowns[0].vals[0],
    };
    left = configureBus(left, interfType, bus, propDevice);
    let right = {
        type: interfaceRight?.tabs[0].val,
        device: deviceRight?.tabs[0].val,
        index: objectRight?.dropDowns[0].vals[0],
    };
    right = configureBus(right, interfaceRight, select, propDevice);
    let result = {
        type: enter?.tabs[0].val,
        device: valInterfType?.tabs[0].val,
        index: valDevice?.dropDowns[0].vals[0],
    };
    result = configureBus(result, enter, valObject, propDevice);
    return {
        'init-state': statusStart?.btns[0].val === 'on' ? 1 : 0,
        operation: comparisonOperation?.radioBtns[0].val || '+',
        left: left,
        right: right,
        result: result,
        unsigned: false,
    };
}

function createObjUdfTrig(config: Config[], propDevice?: Device): any {
    const statusStart = config.find((el) => el.curKey === CurKeyMap.StatusStartSystem);
    const interfType = config.find((el) => el.curKey === CurKeyMap.Interface);
    const device = config.find((el) => el.curKey === CurKeyMap.Device);
    const object = config.find((el) => el.curKey === CurKeyMap.Object);
    const bus = config.find((el) => el.curKey === CurKeyMap.Bus);
    const interfaceRight = config.find((el) => el.curKey === CurKeyMap.InterfaceRight);
    const comparisonOperation = config.find((el) => el.curKey === CurKeyMap.ComparisonOperation);
    const time = config.find((el) => el.curKey === CurKeyMap.Time);
    const minTime = config.find((el) => el.curKey === CurKeyMap.MinTime);
    const maxTime = config.find((el) => el.curKey === CurKeyMap.MaxTime);
    const multiSelect = config.find((el) => el.curKey === CurKeyMap.MultiSelect);
    const objectRight = config.find((el) => el.curKey === CurKeyMap.ObjectRight);
    const valInterfType = config.find((el) => el.curKey === CurKeyMap.ValueInterface);
    const valDevice = config.find((el) => el.curKey === CurKeyMap.ValueDevice);
    const valObject = config.find((el) => el.curKey === CurKeyMap.ValueObject);
    const valBus = config.find((el) => el.curKey === CurKeyMap.ValueBus);
    const select = config.find((el) => el.curKey === CurKeyMap.Select);
    const enter = config.find((el) => el.curKey === CurKeyMap.Enter);

    let ent = {
        type: interfType?.tabs[0].val,
        device: device?.tabs[0].val,
        index: object?.dropDowns[0].vals[0],
    };
    ent = configureBus(ent, interfType, bus, propDevice);

    let obj = {
        type: interfaceRight?.radioBtns[0].val,
        entity: ent,
        'act-idx': multiSelect?.dropDowns[0].vals[0] || 0,
        'act-qty': multiSelect?.dropDowns[0].vals.length || 0,
        'init-state': statusStart?.btns[0].val === 'on' ? 1 : 0,
    };
    if (interfaceRight?.radioBtns[0].val === 'hold') {
        let ent = {};
        if (objectRight?.btns[0].val === 'obj') {
            ent = {
                type: valInterfType?.tabs[0].val || 'bin-in',
                device: valDevice?.tabs[0].val || 0,
                index: valObject?.dropDowns[0].vals[0] || 0,
            };
            ent = configureBus(ent, valInterfType, valBus, propDevice);
        } else {
            ent = {
                type: 'int-const',
                value: enter?.inputs[0].val,
            };
        }
        const curObj = {
            value: ent,
            unsigned: false,
            'min-time':
                minTime?.btns[0].val === 'tim-var'
                    ? {
                          type: 'tim-var',
                          index: minTime?.dropDowns[0].vals[0],
                      }
                    : {
                          type: 'tim-const',
                          value: minTime?.inputs[0].val,
                      },
            'max-time':
                maxTime?.btns[0].val === 'tim-var'
                    ? {
                          type: 'tim-var',
                          index: maxTime?.dropDowns[0].vals[0],
                      }
                    : {
                          type: 'tim-const',
                          value: maxTime?.inputs[0].val,
                      },
        };
        obj = Object.assign(obj, curObj);
    } else if (interfaceRight?.radioBtns[0].val === 'compare' || interfaceRight?.radioBtns[0].val === 'hold') {
        let ent = {};
        if (objectRight?.btns[0].val === 'obj') {
            ent = {
                type: valInterfType?.tabs[0].val || 'bin-in',
                device: valDevice?.tabs[0].val || 0,
                index: valObject?.dropDowns[0].vals[0] || 0,
            };
            ent = configureBus(ent, valInterfType, valBus, propDevice);
        } else {
            ent = {
                type: 'int-const',
                value:
                    comparisonOperation?.radioBtns[0].val === 'bin-equal' ||
                    comparisonOperation?.radioBtns[0].val === 'bin-not-equal'
                        ? select?.btns[0].val
                        : enter?.inputs[0].val,
            };
        }
        const curObj = {
            value: ent,
            unsigned: false,
            operation: comparisonOperation?.radioBtns[0].val,
            histeresis: 0,
            time:
                time?.btns[0].val === 'tim-var'
                    ? {
                          type: 'tim-var',
                          index: time?.dropDowns[0].vals[0],
                      }
                    : {
                          type: 'tim-const',
                          value: time?.inputs[0].val,
                      },
        };
        obj = Object.assign(obj, curObj);
    } else {
        obj = Object.assign(obj, {
            time:
                time?.btns[0].val === 'tim-var'
                    ? {
                          type: 'tim-var',
                          index: time?.dropDowns[0].vals[0],
                      }
                    : {
                          type: 'tim-const',
                          value: time?.inputs[0].val,
                      },
        });
    }
    return obj;
}

export function createObjByType(type: string, config: Config[], propDevice?: Device) {
    switch (type) {
        case 'udf-act':
            return createObjUdfAct(config, propDevice);
        case 'udf-cond':
            return createObjUdfCond(config, propDevice);
        case 'udf-trans':
            return createObjUdfTrans(config, propDevice);
        default:
            return createObjUdfTrig(config, propDevice);
    }
}
