import { type Config, CurKeyMap, binaryInterfaces } from './types';
import type { Device } from '@/stores';

type InterfProp = { interf: string; bus: number };

const validValuesWithBus = ['mb-var', '1w-rom', '1w-sens', '1w-gpio'];

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

    const ent = createEntity(interfType, device, object, bus, propDevice);
    let obj = {
        type: interfaceRight?.radioBtns[0].val,
        entity: ent,
        delay: configureTime(delay),
        'cond-idx': multiSelect?.dropDowns[0].vals[0] || 0,
        'cond-qty': multiSelect?.dropDowns[0].vals.length || 0,
        'start-on-cond': startStopMode?.checkBoxes[0][1].valsArr.includes('conditionsOccur'),
        'cond-logic': multiSelect?.btns[0].val,
        'init-state': statusStart?.btns[0].val === 'on' ? 1 : 0,
    };

    if (interfaceRight?.radioBtns[0].val === 'set' || interfaceRight?.radioBtns[0].val === 'invert') {
        let ent = {};
        if (objectRight?.btns[0].val === 'obj') {
            ent = createEntity(valInterfType, valDevice, valObject, valBus, propDevice);
        } else {
            ent = createIntConstWithBinary(select, enter, interfType);
        }

        let stopVal = {};
        if (stopValConfig?.btns[0].val === 'obj') {
            stopVal = createEntity(stopValInterfType, stopValDevice, stopValObject, stopValBus, propDevice);
        } else if (stopValConfig?.btns[0].val === 'const') {
            stopVal = createIntConst(stopValEnter);
        } else {
            stopVal = createPrevValue();
        }

        const curObj = {
            value: ent,
            time: configureTime(time),
            'stop-val': stopVal,
            'stop-on-trig': startStopMode?.checkBoxes[0][2].valsArr.includes('triggerNoMatches'),
            'stop-on-cond': startStopMode?.checkBoxes[0][2].valsArr.includes('conditionNoMatches'),
        };
        obj = { ...obj, ...curObj };
    } else if (interfaceRight?.radioBtns[0].val === 'modify') {
        let ent = {};
        if (objectRight?.btns[0].val === 'obj') {
            ent = createEntity(valInterfType, valDevice, valObject, valBus, propDevice);
        } else {
            ent = createIntConstWithCondition(comparisonOperation, select, enter, interfType);
        }
        let stopVal = {};
        if (stopValConfig?.btns[0].val === 'obj') {
            stopVal = createEntity(stopValInterfType, stopValDevice, stopValObject, stopValBus, propDevice);
        } else if (stopValConfig?.btns[0].val === 'const') {
            stopVal = createIntConst(stopValEnter);
        } else {
            stopVal = createPrevValue();
        }
        const curObj = {
            value: ent,
            time: configureTime(time),
            'stop-val': stopVal,
            operation: comparisonOperation?.radioBtns[0].val || '=',
            unsigned: false,
            'stop-on-trig': startStopMode?.checkBoxes[0][2].valsArr.includes('triggerNoMatches'),
            'stop-on-cond': startStopMode?.checkBoxes[0][2].valsArr.includes('conditionNoMatches'),
        };
        obj = { ...obj, ...curObj };
    } else if (interfaceRight?.radioBtns[0].val === 'change') {
        let ent = {};
        if (objectRight?.btns[0].val === 'obj') {
            ent = createEntity(valInterfType, valDevice, valObject, valBus, propDevice);
        } else {
            ent = createIntConstWithCondition(comparisonOperation, select, enter, interfType);
        }
        const curObj = {
            value: ent,
            time: configureTime(time),
            'stop-on-trig': startStopMode?.checkBoxes[0][2].valsArr.includes('triggerNoMatches'),
            'stop-on-cond': startStopMode?.checkBoxes[0][2].valsArr.includes('conditionNoMatches'),
        };
        obj = { ...obj, ...curObj };
    } else if (interfaceRight?.radioBtns[0].val === 'cycle') {
        const curObj = {
            time: configureTime(time),
            pause: configureTime(time),
            direction: cyclicMode?.btns[1].val || 'to-max',
            infinite: cyclicMode?.btns[0].val === 'yes',
            'stop-on-trig': startStopMode?.checkBoxes[0][2].valsArr.includes('triggerNoMatches'),
            'stop-on-cond': startStopMode?.checkBoxes[0][2].valsArr.includes('conditionNoMatches'),
        };
        obj = { ...obj, ...curObj };
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

    const ent = createEntity(interfType, device, object, bus, propDevice);
    let val = {};
    if (objectRight?.btns[0].val === 'obj') {
        val = createEntity(valInterfType, valDevice, valObject, valBus, propDevice);
    } else {
        val = createIntConstWithCondition(comparisonOperation, select, enter, interfType);
    }
    let obj = {
        operation: comparisonOperation?.radioBtns[0].val || 'bin-equal',
        'init-state': statusStart?.btns[0].val === 'on' ? 1 : 0,
        entity: ent,
        value: val,
        time: configureTime(time),
    };
    const operation = comparisonOperation?.radioBtns[0].val || 'bin-equal';
    if (
        operation === 'less' ||
        operation === 'less-eq' ||
        operation === 'more' ||
        operation === 'more-eq' ||
        operation === 'equal' ||
        operation === 'not-equal'
    ) {
        obj = { ...obj, ...{ unsigned: false } };
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
    const valLeft = config.find((el) => el.curKey === CurKeyMap.ComparisonValueLeft);
    const valRight = config.find((el) => el.curKey === CurKeyMap.ComparisonValueRight);
    const enterLeft = config.find((el) => el.curKey === CurKeyMap.EnterLeft);
    const enterRight = config.find((el) => el.curKey === CurKeyMap.EnterRight);

    let left = {};
    if (valLeft?.btns[0].val === 'obj') {
        left = createEntity(interfType, device, object, bus, propDevice);
    } else {
        left = createIntConstEnter(enterLeft);
    }
    let right = {};
    if (valRight?.btns[0].val === 'obj') {
        right = createEntity(interfaceRight, deviceRight, objectRight, select, propDevice);
    } else {
        right = createIntConstEnter(enterRight);
    }
    const result = createEntity(enter, valInterfType, valDevice, valObject, propDevice);

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

    const ent = createEntity(interfType, device, object, bus, propDevice);
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
            ent = createEntity(valInterfType, valDevice, valObject, valBus, propDevice);
        } else {
            ent = createIntConstWithBinary(select, enter, interfType);
        }
        const curObj = {
            value: ent,
            unsigned: false,
            'min-time': configureTime(minTime),
            'max-time': configureTime(maxTime),
        };
        obj = { ...obj, ...curObj };
    } else if (interfaceRight?.radioBtns[0].val === 'compare' || interfaceRight?.radioBtns[0].val === 'hold') {
        let ent = {};
        if (objectRight?.btns[0].val === 'obj') {
            ent = createEntity(valInterfType, valDevice, valObject, valBus, propDevice);
        } else {
            ent = createIntConstWithCondition(comparisonOperation, select, enter, interfType);
        }
        const curObj = {
            value: ent,
            unsigned: false,
            operation: comparisonOperation?.radioBtns[0].val || 'bin-equal',
            hysteresis: 0,
            time: configureTime(time),
        };
        obj = { ...obj, ...curObj };
    } else {
        obj = { ...obj, ...{ time: configureTime(time) } };
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

function createEntity(
    interfaceTypeConfig: Config | undefined,
    deviceConfig: Config | undefined,
    objectConfig: Config | undefined,
    busConfig: Config | undefined,
    propDevice: Device | undefined,
) {
    const entity = {
        type: interfaceTypeConfig?.tabs[0].val || 'bin-in',
        device: deviceConfig?.tabs[0].val || 0,
        index: objectConfig?.dropDowns[0].vals[0] || 0,
    };
    return configureBus(entity, interfaceTypeConfig, busConfig, propDevice);
}

function createIntConst(config: Config | undefined) {
    return {
        type: 'int-const',
        value: config?.inputs[0].val,
    };
}

function createIntConstWithBinary(
    select: Config | undefined,
    enter: Config | undefined,
    interfaceTypeConfig: Config | undefined,
) {
    const entityInterface = interfaceTypeConfig?.tabs[0].val as string;
    return {
        type: 'int-const',
        value: binaryInterfaces.includes(entityInterface) ? select?.btns[0].val : enter?.inputs[0].val,
    };
}

function createIntConstWithCondition(
    comparisonOperation: Config | undefined,
    select: Config | undefined,
    enter: Config | undefined,
    interfaceTypeConfig: Config | undefined,
) {
    const entityInterface = interfaceTypeConfig?.tabs[0].val as string;
    return {
        type: 'int-const',
        value:
            comparisonOperation?.radioBtns[0].val === 'bin-equal' ||
            comparisonOperation?.radioBtns[0].val === 'bin-not-equal' ||
            binaryInterfaces.includes(entityInterface)
                ? select?.btns[0].val
                : enter?.inputs[0].val,
    };
}

function createIntConstEnter(enter: Config | undefined) {
    return {
        type: 'int-const',
        value: enter?.inputs[0].val || 1,
    };
}

function createPrevValue() {
    return { type: 'prev-value' };
}

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
