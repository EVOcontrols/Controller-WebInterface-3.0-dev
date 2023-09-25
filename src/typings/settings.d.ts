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
  modbus: {
    mode: (typeof modbusModes)[number];
    rate: number;
    parity: (typeof modbusParities)[number];
    stop: number;
    var: {
      'rd-tmo': number;
      'wr-tmo': number;
      'rd-pause': number;
      'wr-pause': number;
      'cycle-pause': number;
    };
    ext: {
      'get-tmo': number;
      'set-tmo': number;
      'ow-scan-tmo': number;
      'set-cfg-tmo': number;
      'cycle-pause': number;
    };
  }[];
  'adc-in': {
    'avg-size': number[];
    'clbr-min': number[];
    'clbr-max': number[];
    'lim-min': number[];
    'lim-max': number[];
  };
  'pwm-out': {
    frequency: number[];
  };
  'bin-out': {
    'min-delay': number;
  };
};
