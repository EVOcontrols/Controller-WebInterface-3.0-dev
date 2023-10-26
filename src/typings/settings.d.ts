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
  login: {
    'user-name': string;
    'user-pass': string;
    'root-name': string;
    'root-pass': string;
  };
  '1-wire': {
    mode: (typeof oneWiresModes)[number];
    'cycle-pause': number;
    'db-time': number;
    'ct-time': number;
  }[];
  modbus: ({
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
        'cycle-pause'?: number;
      }
    | {
        mode: 'ext-devs';
        'get-tmo'?: number;
        'set-tmo'?: number;
        'ow-scan-tmo'?: number;
        'set-cfg-tmo'?: number;
        'cycle-pause'?: number;
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
  'pwm-out': {
    frequency: (number | null)[];
  };
  'bin-out': {
    'min-delay': number;
  };
  'reboot-req': boolean;
};

export type CommonControllerSettings = Pick<
  ControllerSettings,
  'lan' | 'cloud' | 'rtc' | 'gnss'
> & {
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
          validationType?: ('ip' | 'url')[] | ['int'] | ['latitude'] | ['longitude'];
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

export type NGCSettings = Pick<
  ControllerSettings,
  '1-wire' | 'modbus' | 'pwm-out' | 'bin-out' | 'adc-in'
> & {
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

export type ExtDevsList = {
  index: number;
  type: 'NG3-EDIO';
  addr: Exclude<DeviceAddr, 0>;
  state: DeviceWorkState;
  serial: string;
  version: string;
}[];
