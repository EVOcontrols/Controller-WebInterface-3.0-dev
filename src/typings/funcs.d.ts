export type FuncsNumberPerPage = (typeof funcsNumbersPerPage)[number];

export type InterfEntType =
    | '1w-rom'
    | '1w-sens'
    | 'bin-in'
    | 'adc-in'
    | 'bin-out'
    | 'pwm-out'
    | 'mb-var'
    | 'bin-var'
    | 'int-var'
    | 'tim-var';

export type Ent = {
    type: EntType;
    value?: number;
    device?: number;
    index?: number;
    io?: number;
    bus?: number;
};

export type EntType =
    | 'none'
    | 'error'
    | 'prev-value'
    | 'int-const'
    | 'udf-trig'
    | 'udf-cond'
    | 'udf-act'
    | 'udf-trans'
    | '1w-gpio'
    | 'mb-ir'
    | 'mb-hr'
    | 'mb-di'
    | 'mb-coil'
    | InterfEntType;

export type Time = {
    type: 'tim-const' | 'tim-var';
    index?: number;
    value?: number;
};

export type Body = {
    type: 'none' | 'hold' | 'compare' | 'any' | 'set' | 'invert' | 'modify' | 'change' | 'cycle' | 'stop' | 'save';
    entity?: Ent;
    'act-idx'?: number;
    'act-qty'?: number;
    'init-state'?: 0 | 1;
    value?: Ent | { type: 'int-const'; value: number };
    unsigned?: boolean;
    'min-time'?: Time;
    'max-time'?: Time;
    operation?:
        | 'less'
        | 'less-eq'
        | 'more'
        | 'more-eq'
        | 'equal'
        | 'not-equal'
        | 'bin-equal'
        | 'bin-not-equal'
        | 'error'
        | 'nor-equal'
        | 'non-error'
        | '='
        | '+='
        | '-='
        | '=-'
        | '*='
        | '/='
        | '%='
        | '<<='
        | '>>='
        | '&='
        | '|='
        | '~'
        | '!'
        | 'min'
        | 'max'
        | '&&'
        | '||'
        | '+'
        | '-'
        | '*'
        | '/'
        | '%'
        | '<<'
        | '>>'
        | '>'
        | '<'
        | '>='
        | '<=';
    time?: Time;
    hysteresis?: 0;
    delay?: Time;
    'cond-idx'?: number;
    'cond-qty'?: number;
    'start-on-cond'?: boolean;
    'cond-logic'?: 'and' | 'or';
    'stop-val'?: Ent;
    'stop-on-trig'?: boolean;
    'stop-on-cond'?: boolean;
    pause?: Time;
    direction?: 'to-max' | 'to-min';
    infinite?: boolean;
    left?: Ent;
    right?: Ent;
    result?: Ent;
};
