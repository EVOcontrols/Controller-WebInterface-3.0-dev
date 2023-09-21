export const lanAddrModes = ['dhcp', 'static'] as const;

export const cloudModes = ['none', 'ethernet', 'gsm'] as const;

export const rtcSources = ['ntp', 'gsm', 'cloud'] as const;

export const oneWiresModes = ['off', 'rom', 'sens', 'gpio'] as const;

export const modbusModes = ['off', 'variables', 'ext-devs'] as const;

export const modbusParities = ['none', 'even', 'odd'] as const;
