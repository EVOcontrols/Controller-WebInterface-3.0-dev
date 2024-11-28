import { FuncsNumberPerPage } from './funcs';
import { TempUnit, Lang, InputFieldStatus, NumberingSystem, type DeviceAddr } from './common';
import { IsStringLiteral } from 'type-fest';
export type ControllerSettings = {
    lan: {
        'addr-mode': (typeof lanAddrModes)[number];
        'ip-addr': string;
        'ip-mask': string;
        'ip-gate': string;
        'serv-port': number;
    };
    cloud: {
        mode: (typeof cloudModes)[number];
        interval: number;
        'main-url': string;
        'main-port': number;
    };
    gsm: {
        mode: (typeof gsmModes)[number];
        apn: string;
        user: string;
        password: string;
    };
    rtc: {
        source: (typeof rtcSources)[number];
        'ntp1-url': string;
        'time-zone': number;
        interval: number;
    };
    gnss: {
        latitude: string;
        longitude: string;
    };
    // login: {
    //     login: string;
    //     password: string;
    //     // 'user-name': string;
    //     // 'user-pass': string;
    //     // 'root-name': string;
    //     // 'root-pass': string;
    // };
    'root-acc': {
        login: string;
        password: string;
    };
    'user-acc': {
        login: string;
        password: string;
    };
    '1-wire': {
        mode: (typeof oneWiresModes)[number];
        [key: string]: any;
    }[];
    'rs-485': ({
        rate: number;
        parity: (typeof modbusParities)[number];
        stop: 1 | 2;
    } & (
        | {
              mode: 'variables';
              'rd-tmo'?: number;
              'wr-tmo'?: number;
              'rd-pause'?: number;
              'wr-pause'?: number;
              'cycle-delay'?: number;
          }
        | {
              mode: 'ext-devs';
              'get-tmo'?: number;
              'set-tmo'?: number;
              '1w-scan-tmo'?: number;
              'set-cfg-tmo'?: number;
              'cycle-delay'?: number;
          }
        | {
              mode: 'off';
          }
    ))[];
    'adc-in': {
        'avg-size': (number | null)[];
        'clbr-min': (number | null)[];
        'clbr-max': (number | null)[];
        'lim-min': (number | null)[];
        'lim-max': (number | null)[];
    };
    pwm: {
        freq: (number | null)[];
    };
    'bin-out': {
        'min-delay': number;
    };
    'reboot-req': boolean;
};

export type CommonControllerSettings = Pick<ControllerSettings, 'lan' | 'cloud' | 'gsm' | 'rtc' | 'gnss'> & {
    'root-login': Pick<ControllerSettings['login'], 'root-name' | 'root-pass'> & {
        'root-pass-repeat': string;
    };
    'user-login': Pick<ControllerSettings['login'], 'user-name' | 'user-pass'> & {
        'user-pass-repeat': string;
    };
    funcsNumberPerPage: {
        funcsNumberPerPage: `${FuncsNumberPerPage}`;
    };
    tempUnit: {
        tempUnit: TempUnit;
    };
    lang: {
        lang: Lang;
    };
};

export type PasswordFieldName = `${'root' | 'user'}-pass${'-repeat' | ''}`;

export type CommonSettingsFields = {
    [P in keyof CommonControllerSettings]: {
        [P2 in keyof CommonControllerSettings[P]]: {
            orientation: 'v' | 'h';
            param: P2;
            value: CommonControllerSettings[P][P2] | undefined;
        } & (IsStringLiteral<CommonControllerSettings[P][P2]> extends false
            ? (P2 extends PasswordFieldName
                  ? {
                        type: 'password';
                    }
                  : {
                        type: 'string' | 'number';
                    }) & {
                  widthClass: string;
                  status: InputFieldStatus;
                  validationType?: ('ip' | 'url')[] | ['int'] | ['latitude'] | ['longitude'] | ['string'];
                  isRequired?: boolean;
              }
            : {
                  type: 'btn-group';
                  values: Readonly<
                      {
                          text: string;
                          value: CommonControllerSettings[P][P2];
                      }[]
                  >;
              });
    }[keyof CommonControllerSettings[P]][][];
};

export type NGCSettings = Pick<ControllerSettings, '1-wire' | 'pwm' | 'bin-out' | 'adc-in'> & {
    modbus: Pick<ControllerSettings['modbus'][number], 'rate' | 'parity' | 'stop' | 'mode'> & {
        advanced: {
            variables: Omit<
                Extract<ControllerSettings['modbus'][number], { mode: 'variables' }>,
                'rate' | 'parity' | 'stop' | 'mode'
            >;
            'ext-devs': Omit<
                Extract<ControllerSettings['modbus'][number], { mode: 'ext-devs' }>,
                'rate' | 'parity' | 'stop' | 'mode'
            >;
        };
    };
    numberingSystem: NumberingSystem;
};

export type DeviceWorkState = 'on' | 'off' | 'init' | 'no-conn' | 'error';

export type ExtDevsListRaw = (
    | {
          type: 'NG3-EDIO';
          addr: Exclude<DeviceAddr, 0>;
          state: DeviceWorkState;
          serial: string;
          version: string;
      }
    | {
          type: 'none';
      }
)[];

export type ExtDev = {
    index: number;
    type: 'NG3-EDIO';
    addr: Exclude<DeviceAddr, 0>;
    state: DeviceWorkState;
    serial: string;
    version: string;
};

export type ExtDevsList = ExtDev[];

export type ExtDeviceSettings = {
    slave: {
        addr: number;
        rate: number;
        parity: (typeof modbusParities)[number];
        stop: 1 | 2;
    };
    'rs-485': (
        | {
              mode: 'variables';
              parity: (typeof modbusParities)[number];
              rate: number;
              stop: 1 | 2;
              'read-tmo': number;
              'write-tmo': number;
              'read-delay': number;
              'write-delay': number;
              'cycle-delay': number;
          }
        | { mode: 'off' }
    )[];
    '1-wire': {
        mode: (typeof oneWiresModes)[number];
        [key: string]: any;
    }[];
};
