import {
    Config,
    ORDER,
    UDF,
    Interface,
    Mode1W,
    EntBind,
    DropDownRealType,
    CurKeyMap,
} from './types';
import { EntType } from '@/typings/funcs';
import { Device } from '@/stores';

const invalidType = ['none', 'error', 'udf-trig', 'udf-cond', 'udf-act', 'udf-trans', 'int-const'];
const order = ORDER;

const indexStore = useIndexStore();

const { devices } = storeToRefs(indexStore);

type Bus = {
    val: string;
    label: string;
};

export const createParsedConfig = (
    entType: EntType,
    typeVal: UDF,
    interfaces: Interface[],
    OWConfig: Mode1W[],
    entItems: EntBind[],
    t: (key: string) => string,
    propDevice?: Device,
    entBus?: number,
    entDevice?: number,
    entIndex?: number,
): Config[] => {
    const resultConfig: Config[] = [];

    const titleConfig = createTitleConfig(entType, typeVal, interfaces, t);
    if (titleConfig) {
        resultConfig.push(titleConfig);
    }

    const deviceConfig = createDeviceConfig(typeVal, t, propDevice, entDevice);
    if (deviceConfig) {
        resultConfig.push(deviceConfig);
    }

    const busConfig = createBusConfig(entType, typeVal, OWConfig, t, entBus, entDevice);
    if (busConfig) {
        resultConfig.push(busConfig);
    }

    const objConfig = createObjConfig(entType, typeVal, entItems, t, entIndex);
    if (objConfig) {
        resultConfig.push(objConfig);
    }

    return resultConfig;
};

function createTitleConfig(
    entType: EntType,
    typeVal: UDF,
    interfaces: Interface[],
    t: (key: string) => string,
): Config | null {
    if (invalidType.includes(entType)) return null;

    return {
        curKey: CurKeyMap.Interface,
        queue: [
            { name: 'title', index: 0 },
            { name: 'tabs', index: 0 },
        ],
        titles: [
            typeVal === 'udf-act'
                ? t('titles.actInterf')
                : typeVal === 'udf-cond'
                ? t('titles.condInterf')
                : typeVal === 'udf-trans'
                ? t('titles.transInterf')
                : t('titles.trigInterf'),
        ],
        btns: [],
        tabs: [
            {
                vals: Array.from(new Set(interfaces))
                    .map((inter) => {
                        return { val: inter, label: t(`tabs.${inter}`) };
                    })
                    .sort(function (a, b) {
                        return order.indexOf(a.val as string) - order.indexOf(b.val as string);
                    }),
                val: entType as string,
                dependentDropDownIndex: 4,
            },
        ],
        radioBtns: [],
        checkBoxes: [],
        inputs: [],
        dropDowns: [],
    };
}

function createDeviceConfig(
    typeVal: UDF,
    t: (key: string) => string,
    propDevice?: Device,
    entDevice?: number,
): Config | null {
    if (entDevice === undefined) return null;

    const isActOrTrans =
        (propDevice && propDevice.addr) ||
        ((!propDevice || !propDevice.addr) && (typeVal === 'udf-cond' || typeVal === 'udf-trig'));

    const mainLabel = propDevice?.addr ? `IO ${propDevice?.addr}` : 'NGC';
    const devVals = isActOrTrans
        ? [
              {
                  val: 0,
                  label: mainLabel,
              },
          ]
        : devices.value.map((el) => {
              return { val: el.addr, label: el.addr ? `IO ${el.addr}` : 'NGC' };
          });
    const val = isActOrTrans ? 0 : entDevice;

    return {
        curKey: CurKeyMap.Device,
        queue: [
            { name: 'title', index: 0 },
            { name: 'tabs', index: 0 },
        ],
        titles: [
            typeVal === 'udf-act'
                ? t('titles.actDev')
                : typeVal === 'udf-cond'
                ? t('titles.condDev')
                : typeVal === 'udf-trans'
                ? t('titles.transDev')
                : t('titles.trigDev'),
        ],
        btns: [],
        tabs: [
            {
                vals: devVals,
                val,
            },
        ],
        radioBtns: [],
        checkBoxes: [],
        inputs: [],
        dropDowns: [],
    };
}

function createBusConfig(
    entType: EntType,
    typeVal: UDF,
    OWConfig: Mode1W[],
    t: (key: string) => string,
    entBus?: number,
    entDevice?: number,
): Config | null {
    if (entBus === undefined || entDevice === undefined) return null;

    const buses: Bus[] = [];
    OWConfig.forEach((el, index) => {
        buses.push({ val: `${el.mode}${index}`, label: `${t('tabs.bus')}${index + 1}` });
    });

    return {
        curKey: CurKeyMap.Bus,
        queue: [
            { name: 'title', index: 0 },
            { name: 'tabs', index: 0 },
        ],
        titles: [
            typeVal === 'udf-act'
                ? t('titles.actBus')
                : typeVal === 'udf-cond'
                ? t('titles.condBus')
                : typeVal === 'udf-trans'
                ? t('titles.transBus')
                : t('titles.trigBus'),
        ],
        btns: [],
        tabs: [
            {
                vals: buses
                    .filter((bus) => bus.val.slice(0, bus.val.length - 1) === entType.slice(3))
                    .map((bus) => {
                        return { val: bus.val.slice(bus.val.length - 1), label: bus.label };
                    }),
                val: entBus,
            },
        ],
        radioBtns: [],
        checkBoxes: [],
        inputs: [],
        dropDowns: [],
    };
}

function createObjConfig(
    entType: EntType,
    typeVal: UDF,
    entItems: EntBind[],
    t: (key: string) => string,
    entIndex?: number,
): Config | null {
    if (
        entType === 'none' ||
        entType === 'error' ||
        entType === 'int-const' ||
        entType === 'prev-value'
    ) {
        return null;
    }

    return {
        curKey: CurKeyMap.Object,
        queue: [
            { name: 'title', index: 0 },
            { name: 'dropDown', index: 0 },
        ],
        titles: [
            typeVal === 'udf-act'
                ? t('titles.actObj')
                : typeVal === 'udf-cond'
                ? t('titles.condObj')
                : typeVal === 'udf-trans'
                ? t('titles.transObj')
                : t('titles.trigObj'),
        ],
        btns: [],
        tabs: [],
        radioBtns: [],
        checkBoxes: [],
        inputs: [],
        dropDowns: [
            {
                type:
                    entType === 'bin-out' || entType === 'bin-in'
                        ? 'bin'
                        : entType === '1w-sens'
                        ? '1w-sens'
                        : entType === 'adc-in' || entType === 'pwm-out'
                        ? 'obj'
                        : entType === 'udf-act'
                        ? 'act'
                        : entType === 'udf-cond'
                        ? 'cond'
                        : 'var',
                realType: entType as DropDownRealType,
                items: entItems,
                vals: entIndex !== undefined ? [entIndex] : [],
            },
        ],
    };
}
