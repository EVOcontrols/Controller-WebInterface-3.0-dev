import { Config, CurKeyMap } from './types';
import type { Device } from '@/stores';

type InterfProp = { interf: string; bus: number };

const validValuesWithBus = ['mb-var', '1w-rom', '1w-sens', '1w-gpio'];

function createObjUdfAct(config: Config[], propDevice?: Device) {
    const statusStart = config.find((el) => el.curKey === CurKeyMap.StatusStartSystem);
    const interfType = config.find((el) => el.curKey === CurKeyMap.Interface);
    const device = config.find((el) => el.curKey === CurKeyMap.Device);
    const object = config.find((el) => el.curKey === CurKeyMap.Object);
    const bus = config.find((el) => el.curKey === CurKeyMap.Bus);
    const typeUdf = config.find((el) => el.curKey === CurKeyMap.TypeUdf);
    const comparisonOperation = config.find((el) => el.curKey === CurKeyMap.ComparisonOperation);
    const time = config.find((el) => el.curKey === CurKeyMap.Time);
    const delay = config.find((el) => el.curKey === CurKeyMap.Delay);
    const multiSelect = config.find((el) => el.curKey === CurKeyMap.MultiSelect);
    const startStopMode = config.find((el) => el.curKey === CurKeyMap.StartStopMode);
    const cyclicMode = config.find((el) => el.curKey === CurKeyMap.CyclicMode);
    const comparisonVal = config.find((el) => el.curKey === CurKeyMap.ComparisonValue);
    const valInterfType = config.find((el) => el.curKey === CurKeyMap.ValueInterface);
    const valDevice = config.find((el) => el.curKey === CurKeyMap.ValueDevice);
    const valObject = config.find((el) => el.curKey === CurKeyMap.ValueObject);
    const select = config.find((el) => el.curKey === CurKeyMap.Select);
    const enter = config.find((el) => el.curKey === CurKeyMap.Enter);
    const stopValConfig = config.find((el) => el.curKey === CurKeyMap.StopValue);
    const stopValEnter = config.find((el) => el.curKey === CurKeyMap.StopValueEnter);
    const stopValInterfType = config.find((el) => el.curKey === CurKeyMap.StopValueInterface);
    const stopValDevice = config.find((el) => el.curKey === CurKeyMap.StopValueDevice);
    const stopValObject = config.find((el) => el.curKey === CurKeyMap.StopValueObject);

    const c14 = config.find((el) => el.curKey === 14);
    const c20 = config.find((el) => el.curKey === 20);

    let ent = {
        type: interfType?.tabs[0].val,
        device: device?.tabs[0].val,
        index: object?.dropDowns[0].vals[0],
    };

    if (interfType && validValuesWithBus.includes(interfType.tabs[0].val as string)) {
        const interfProp = propDevice?.interf.find(
            (i) => typeof i === 'object' && i.interf === interfType.tabs[0].val,
        ) as InterfProp;
        const busProp = interfProp ? interfProp.bus : 0;
        ent = Object.assign(
            ent,
            interfType?.tabs[0].val === '1w-sens'
                ? { bus: bus?.tabs[0].val || busProp, io: 0 }
                : { bus: bus?.tabs[0].val || busProp },
        );
    }

    let obj = {
        type: typeUdf?.radioBtns[0].val,
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

    if (typeUdf?.radioBtns[0].val === 'set' || typeUdf?.radioBtns[0].val === 'invert') {
        let ent = {};
        if (comparisonVal?.btns[0].val === 'obj') {
            ent = {
                type: valInterfType?.tabs[0].val || 'bin-in',
                device: valDevice?.tabs[0].val || 0,
                index: valObject?.dropDowns[0].vals[0] || 0,
            };
            if (valInterfType && validValuesWithBus.includes(valInterfType.tabs[0].val as string)) {
                const interfProp = propDevice?.interf.find(
                    (i) => typeof i === 'object' && i.interf === valInterfType.tabs[0].val,
                ) as InterfProp;
                const busProp = interfProp ? interfProp.bus : 0;
                ent = Object.assign(
                    ent,
                    valInterfType?.tabs[0].val === '1w-sens'
                        ? { bus: c14?.tabs[0].val || busProp, io: 0 }
                        : { bus: c14?.tabs[0].val || busProp },
                );
            }
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
                index: stopValObject?.dropDowns[0].vals[0] || 2,
            };
            if (stopValInterfType && validValuesWithBus.includes(stopValInterfType.tabs[0].val as string)) {
                const interfProp = propDevice?.interf.find(
                    (i) => typeof i === 'object' && i.interf === stopValInterfType.tabs[0].val,
                ) as InterfProp;
                const busProp = interfProp ? interfProp.bus : 0;
                stopVal = Object.assign(
                    stopVal,
                    stopValInterfType?.tabs[0].val === '1w-sens'
                        ? { bus: c20?.tabs[0].val || busProp, io: 0 }
                        : { bus: c20?.tabs[0].val || busProp },
                );
            }
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
    } else if (typeUdf?.radioBtns[0].val === 'modify') {
        let ent = {};
        if (comparisonVal?.btns[0].val === 'obj') {
            ent = {
                type: valInterfType?.tabs[0].val || 'bin-in',
                device: valDevice?.tabs[0].val || 0,
                index: valObject?.dropDowns[0].vals[0] || 0,
            };
            if (valInterfType && validValuesWithBus.includes(valInterfType.tabs[0].val as string)) {
                const interfProp = propDevice?.interf.find(
                    (i) => typeof i === 'object' && i.interf === valInterfType.tabs[0].val,
                ) as InterfProp;
                const busProp = interfProp ? interfProp.bus : 0;
                ent = Object.assign(
                    ent,
                    valInterfType?.tabs[0].val === '1w-sens'
                        ? { bus: c14?.tabs[0].val || busProp, io: 0 }
                        : { bus: c14?.tabs[0].val || busProp },
                );
            }
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
                index: stopValObject?.dropDowns[0].vals[0] || 2,
            };
            if (stopValInterfType && validValuesWithBus.includes(stopValInterfType.tabs[0].val as string)) {
                const interfProp = propDevice?.interf.find(
                    (i) => typeof i === 'object' && i.interf === stopValInterfType.tabs[0].val,
                ) as InterfProp;
                const busProp = interfProp ? interfProp.bus : 0;
                stopVal = Object.assign(
                    stopVal,
                    stopValInterfType?.tabs[0].val === '1w-sens'
                        ? { bus: c20?.tabs[0].val || busProp, io: 0 }
                        : { bus: c20?.tabs[0].val || busProp },
                );
            }
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
            operation: comparisonOperation?.radioBtns[0].val,
            unsigned: false,
            'stop-on-trig': startStopMode?.checkBoxes[0][2].valsArr.includes('triggerNoMatches'),
            'stop-on-cond': startStopMode?.checkBoxes[0][2].valsArr.includes('conditionNoMatches'),
        };
        obj = Object.assign(obj, curObj);
    } else if (typeUdf?.radioBtns[0].val === 'change') {
        let ent = {};
        if (comparisonVal?.btns[0].val === 'obj') {
            ent = {
                type: valInterfType?.tabs[0].val || 'bin-in',
                device: valDevice?.tabs[0].val || 0,
                index: valObject?.dropDowns[0].vals[0] || 0,
            };
            if (valInterfType && validValuesWithBus.includes(valInterfType.tabs[0].val as string)) {
                const interfProp = propDevice?.interf.find(
                    (i) => typeof i === 'object' && i.interf === valInterfType.tabs[0].val,
                ) as InterfProp;
                const busProp = interfProp ? interfProp.bus : 0;
                ent = Object.assign(
                    ent,
                    valInterfType?.tabs[0].val === '1w-sens'
                        ? { bus: c14?.tabs[0].val || busProp, io: 0 }
                        : { bus: c14?.tabs[0].val || busProp },
                );
            }
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
    } else if (typeUdf?.radioBtns[0].val === 'cycle') {
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
            direction: cyclicMode?.btns[1].val,
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
    const comparisonVal = config.find((el) => el.curKey === CurKeyMap.ComparisonValue);
    const valInterfType = config.find((el) => el.curKey === CurKeyMap.ValueInterface);
    const valDevice = config.find((el) => el.curKey === CurKeyMap.ValueDevice);
    const valObject = config.find((el) => el.curKey === CurKeyMap.ValueObject);
    const select = config.find((el) => el.curKey === CurKeyMap.Select);
    const enter = config.find((el) => el.curKey === CurKeyMap.Enter);

    const c14 = config.find((el) => el.curKey === 14);

    let ent = {
        type: interfType?.tabs[0].val,
        device: device?.tabs[0].val,
        index: object?.dropDowns[0].vals[0],
    };
    if (interfType && validValuesWithBus.includes(interfType.tabs[0].val as string)) {
        const interfProp = propDevice?.interf.find(
            (i) => typeof i === 'object' && i.interf === interfType.tabs[0].val,
        ) as InterfProp;
        const busProp = interfProp ? interfProp.bus : 0;
        ent = Object.assign(
            ent,
            interfType?.tabs[0].val === '1w-sens'
                ? { bus: bus?.tabs[0].val || busProp, io: 0 }
                : { bus: bus?.tabs[0].val || busProp },
        );
    }
    let val = {};
    if (comparisonVal?.btns[0].val === 'obj') {
        val = {
            type: valInterfType?.tabs[0].val || 'bin-in',
            device: valDevice?.tabs[0].val || 0,
            index: valObject?.dropDowns[0].vals[0] || 0,
        };
        if (valInterfType && validValuesWithBus.includes(valInterfType.tabs[0].val as string)) {
            const interfProp = propDevice?.interf.find(
                (i) => typeof i === 'object' && i.interf === valInterfType.tabs[0].val,
            ) as InterfProp;
            const busProp = interfProp ? interfProp.bus : 0;
            val = Object.assign(
                val,
                valInterfType?.tabs[0].val === '1w-sens'
                    ? { bus: c14?.tabs[0].val || busProp, io: 0 }
                    : { bus: c14?.tabs[0].val || busProp },
            );
        }
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
    const typeUdf = config.find((el) => el.curKey === CurKeyMap.TypeUdf);
    const comparisonOperation = config.find((el) => el.curKey === CurKeyMap.ComparisonOperation);
    const comparisonVal = config.find((el) => el.curKey === CurKeyMap.ComparisonValue);
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
    if (interfType && validValuesWithBus.includes(interfType.tabs[0].val as string)) {
        const interfProp = propDevice?.interf.find(
            (i) => typeof i === 'object' && i.interf === interfType.tabs[0].val,
        ) as InterfProp;
        const busProp = interfProp ? interfProp.bus : 0;
        left = Object.assign(
            left,
            interfType?.tabs[0].val === '1w-sens'
                ? { bus: bus?.tabs[0].val || busProp, io: 0 }
                : { bus: bus?.tabs[0].val || busProp },
        );
    }
    let right = {
        type: typeUdf?.tabs[0].val,
        device: comparisonOperation?.tabs[0].val,
        index: comparisonVal?.dropDowns[0].vals[0],
    };
    if (typeUdf && validValuesWithBus.includes(typeUdf.tabs[0].val as string)) {
        const interfProp = propDevice?.interf.find(
            (i) => typeof i === 'object' && i.interf === typeUdf.tabs[0].val,
        ) as InterfProp;
        const busProp = interfProp ? interfProp.bus : 0;
        right = Object.assign(
            right,
            typeUdf?.tabs[0].val === '1w-sens'
                ? { bus: select?.tabs[0].val || busProp, io: 0 }
                : { bus: select?.tabs[0].val || busProp },
        );
    }
    let result = {
        type: enter?.tabs[0].val,
        device: valInterfType?.tabs[0].val,
        index: valDevice?.dropDowns[0].vals[0],
    };
    if (enter && validValuesWithBus.includes(enter.tabs[0].val as string)) {
        const interfProp = propDevice?.interf.find(
            (i) => typeof i === 'object' && i.interf === enter.tabs[0].val,
        ) as InterfProp;
        const busProp = interfProp ? interfProp.bus : 0;
        result = Object.assign(
            result,
            enter?.tabs[0].val === '1w-sens'
                ? { bus: valObject?.tabs[0].val || busProp, io: 0 }
                : { bus: valObject?.tabs[0].val || busProp },
        );
    }
    return {
        'init-state': statusStart?.btns[0].val === 'on' ? 1 : 0,
        operation: comparisonOperation?.radioBtns[0].val,
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
    const typeUdf = config.find((el) => el.curKey === CurKeyMap.TypeUdf);
    const comparisonOperation = config.find((el) => el.curKey === CurKeyMap.ComparisonOperation);
    const time = config.find((el) => el.curKey === CurKeyMap.Time);
    const minTime = config.find((el) => el.curKey === CurKeyMap.MinTime);
    const maxTime = config.find((el) => el.curKey === CurKeyMap.MaxTime);
    const multiSelect = config.find((el) => el.curKey === CurKeyMap.MultiSelect);
    const comparisonVal = config.find((el) => el.curKey === CurKeyMap.ComparisonValue);
    const valInterfType = config.find((el) => el.curKey === CurKeyMap.ValueInterface);
    const valDevice = config.find((el) => el.curKey === CurKeyMap.ValueDevice);
    const valObject = config.find((el) => el.curKey === CurKeyMap.ValueObject);
    const select = config.find((el) => el.curKey === CurKeyMap.Select);
    const enter = config.find((el) => el.curKey === CurKeyMap.Enter);

    const c14 = config.find((el) => el.curKey === 14);

    let ent = {
        type: interfType?.tabs[0].val,
        device: device?.tabs[0].val,
        index: object?.dropDowns[0].vals[0],
    };

    if (interfType && validValuesWithBus.includes(interfType.tabs[0].val as string)) {
        const interfProp = propDevice?.interf.find(
            (i) => typeof i === 'object' && i.interf === interfType.tabs[0].val,
        ) as InterfProp;
        const busProp = interfProp ? interfProp.bus : 0;
        ent = Object.assign(
            ent,
            interfType?.tabs[0].val === '1w-sens'
                ? { bus: bus?.tabs[0].val || busProp, io: 0 }
                : { bus: bus?.tabs[0].val || busProp },
        );
    }
    let obj = {
        type: typeUdf?.radioBtns[0].val,
        entity: ent,
        'act-idx': multiSelect?.dropDowns[0].vals[0] || 0,
        'act-qty': multiSelect?.dropDowns[0].vals.length || 0,
        'init-state': statusStart?.btns[0].val === 'on' ? 1 : 0,
    };
    if (typeUdf?.radioBtns[0].val === 'hold') {
        let ent = {};
        if (comparisonVal?.btns[0].val === 'obj') {
            ent = {
                type: valInterfType?.tabs[0].val || 'bin-in',
                device: valDevice?.tabs[0].val || 0,
                index: valObject?.dropDowns[0].vals[0] || 0,
            };
            if (valInterfType && validValuesWithBus.includes(valInterfType.tabs[0].val as string)) {
                const interfProp = propDevice?.interf.find(
                    (i) => typeof i === 'object' && i.interf === valInterfType.tabs[0].val,
                ) as InterfProp;
                const busProp = interfProp ? interfProp.bus : 0;
                ent = Object.assign(
                    ent,
                    valInterfType?.tabs[0].val === '1w-sens'
                        ? { bus: c14?.tabs[0].val || busProp, io: 0 }
                        : { bus: c14?.tabs[0].val || busProp },
                );
            }
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
    } else if (typeUdf?.radioBtns[0].val === 'compare' || typeUdf?.radioBtns[0].val === 'hold') {
        let ent = {};
        if (comparisonVal?.btns[0].val === 'obj') {
            ent = {
                type: valInterfType?.tabs[0].val || 'bin-in',
                device: valDevice?.tabs[0].val || 0,
                index: valObject?.dropDowns[0].vals[0] || 0,
            };
            if (valInterfType && validValuesWithBus.includes(valInterfType.tabs[0].val as string)) {
                const interfProp = propDevice?.interf.find(
                    (i) => typeof i === 'object' && i.interf === valInterfType.tabs[0].val,
                ) as InterfProp;
                const busProp = interfProp ? interfProp.bus : 0;
                ent = Object.assign(
                    ent,
                    valInterfType?.tabs[0].val === '1w-sens'
                        ? { bus: c14?.tabs[0].val || busProp, io: 0 }
                        : { bus: c14?.tabs[0].val || busProp },
                );
            }
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
