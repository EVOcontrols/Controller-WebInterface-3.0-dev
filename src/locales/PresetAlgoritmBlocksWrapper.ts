export const translate = {
    messages: {
        en: {
            titles: {
                startStatus: 'Status at system startup',
                trigInterf: 'Trigger Interface',
                actInterf: 'Action Interface',
                condInterf: 'Condition Interface',
                transInterf: 'Transform Interface',
                actDev: 'Action device',
                condDev: 'Condition device',
                transDev: 'Transform device',
                trigDev: 'Trigger device',
                actObj: 'Action object',
                condObj: 'Condition object',
                transObj: 'Transform object',
                trigObj: 'Trigger object',
                actBus: 'Action digital bus number',
                condBus: 'Condition digital bus number',
                transBus: 'Transform digital bus number',
                trigBus: 'Trigger digital bus number',
                triggerType: 'Trigger type',
                comparisonOperation: 'Comparison operation',
                comparisonVal: 'Comparison value',
                comparisonValLeft: 'Left argument',
                comparisonValRight: 'Right argument',
                enter: 'Enter',
                select: 'Select',
                comparisonObjInterf: 'Comparison object interface',
                comparisonDevStatus: 'Device structure for comparison',
                comparisonObjBus: 'Digital bus number of the object for comparison',
                compareObj: 'Object to compare',
                hysteresis: 'Hysteresis',
                during: 'During',
                minTime: 'Min time',
                maxTime: 'Max time',
                device: 'Device',
                object: 'Object',
                selectActions: 'Select actions',
                actionType: 'Action type',
                value: 'Value',
                endValue: 'End value',
                stopValue: 'Stop value',
                selectConditions: 'Select conditions',
                startMode: 'Startup mode',
                stop: 'Stop',
                cyclicMode: 'Cyclic operation mode',
                operation: 'Operation',
                infinite: 'Infinite',
                initDir: 'Initial direction',
                delay: 'Delay',
                pause: 'Pause (not work correct WIP)',
            },
            btns: {
                on: 'ON',
                off: 'OFF',
                const: 'CONSTANT',
                obj: 'OBJECT',
                timVar: 'TIME VARIABLE',
                ms: 'x1 MS',
                s: 'x1 SEC',
                min: 'x1 MIN',
                prev: 'PREVIOUS',
                anyCond: 'ANY OF THE CONDITIONS',
                allCond: 'ALL CONDITIONS',
                yes: 'YES',
                no: 'NO',
                toMin: 'TO A MINIMUM',
                toMax: 'TO THE MAXIMUM',
            },
            tabs: {
                '1w-rom': '1-wire ID',
                '1w-sens': '1-wire Thermometers',
                'bin-in': 'Discrete inputs',
                'adc-in': 'Analog inputs',
                'bin-out': 'Discrete outputs',
                'pwm-out': 'PWM outputs',
                'mb-var': 'MODBUS variables',
                'bin-var': 'Binary variables',
                'int-var': 'Integer variables',
                'tim-var': 'Time variables',
                bus: 'Bus ',
            },
            radioBtns: {
                compare: 'Comparison',
                hold: 'Holding',
                any: 'Any change',
                less: 'Less',
                lessEqual: 'Less or equal',
                more: 'More',
                moreEqual: 'More or equal',
                error: 'Error',
                equal: 'Equal',
                notEqual: 'Not equal',
                binaryEqual: 'Binary equals',
                binaryNotEqual: 'Binary is not equal',
                nonError: 'Not error',
                set: 'Set',
                invert: 'Invert',
                increase: 'Increase',
                smoothChange: 'Change smoothly',
                cyclicChange: 'Cyclic change',
                stop: 'Stop',
                add: 'Add',
                subtract: 'Subtract',
                multiply: 'Multiply',
                divide: 'Divide',
                divideRemainder: 'Remainder of the division',
                takeMax: 'Take the maximum',
                takeMin: 'Take the minimum',
                shiftLeft: 'Bitwise shift left',
                shiftRight: 'Bitwise shift right',
            },
            checkBoxes: {
                conditionsOccur: 'When conditions occur',
                triggerNoMatches: 'Trigger no longer matches',
                conditionNoMatches: 'Condition no longer matches',
            },
            popUp: {
                select: 'Select ',
                obj: 'object',
                actions: 'actions',
                conditions: 'conditions',
                btns: {
                    cancel: 'Cancel',
                    confirm: 'Select',
                },
                placeholder: 'Function name',
                info: 'Several consecutive actions can be selected.',
            },
        },
        ru: {
            titles: {
                startStatus: 'Статус при запуске системы',
                trigInterf: 'Интерфейс триггера',
                actInterf: 'Интерфейс действия',
                condInterf: 'Интерфейс условия',
                transInterf: 'Интерфейс преобразования',
                actDev: 'Устройство действия',
                condDev: 'Устройство условия',
                transDev: 'Устройство преобразования',
                trigDev: 'Устройство триггера',
                actObj: 'Объект действия',
                condObj: 'Объект условия',
                transObj: 'Объект преобразования',
                trigObj: 'Объект триггера',
                actBus: 'Номер цифровой шины действия',
                condBus: 'Номер цифровой шины условия',
                transBus: 'Номер цифровой шины преобразования',
                trigBus: 'Номер цифровой шины триггера',
                triggerType: 'Тип триггера',
                comparisonOperation: 'Операция сравнения',
                comparisonVal: 'Значение для сравнения',
                comparisonValLeft: 'Левый аргумент',
                comparisonValRight: 'Правый аргумент',
                enter: 'Введите',
                select: 'Выберите',
                comparisonObjInterf: 'Интерфейс объекта для сравнения',
                comparisonDevStatus: 'Устройство объекта для сравнения',
                comparisonObjBus: 'Номер цифровой шины объекта для сравнения',
                compareObj: 'Объект для сравнения',
                hysteresis: 'Гистерезис',
                during: 'В течение',
                minTime: 'Минимальное время',
                maxTime: 'Максимальное время',
                device: 'Устройство',
                object: 'Объект',
                selectActions: 'Выберите действия',
                actionType: 'Тип действия',
                value: 'Значение',
                endValue: 'Значение по окончанию действия',
                stopValue: 'Значение для остановки',
                selectConditions: 'Выберите условия',
                startMode: 'Режим запуска',
                stop: 'Остановка',
                cyclicMode: 'Режим работы циклического изменения',
                operation: 'Операция',
                infinite: 'Бесконечный',
                initDir: 'Начальное направление',
                delay: 'Задержка',
                pause: 'Пауза (не работает правильно WIP)',
            },
            btns: {
                on: 'ВКЛЮЧЕНО',
                off: 'ВЫКЛЮЧЕНО',
                const: 'КОНСТАНТА',
                obj: 'ОБЪЕКТ',
                timVar: 'ПЕРЕМЕННАЯ ВРЕМЕНИ',
                ms: 'х1 МС',
                s: 'х1 СЕК',
                min: 'х1 МИН',
                prev: 'ПРЕДЫДУЩЕЕ',
                anyCond: 'ЛЮБОЕ ИЗ УСЛОВИЙ',
                allCond: 'ВСЕ УСЛОВИЯ',
                yes: 'ДА',
                no: 'НЕТ',
                toMin: 'К МИНИМУМУ',
                toMax: 'К МАКСИМУМУ',
            },
            tabs: {
                '1w-rom': '1-wire ID',
                '1w-sens': '1-wire термометры',
                'bin-in': 'Дискретные входы',
                'adc-in': 'Аналоговые входы',
                'bin-out': 'Дискретные выходы',
                'pwm-out': 'ШИМ-выходы',
                'mb-var': 'MODBUS переменные',
                'bin-var': 'Бинарные переменные',
                'int-var': 'Целочисленные переменные',
                'tim-var': 'Переменные времени',
                bus: 'Шина ',
            },
            radioBtns: {
                compare: 'Сравнение',
                hold: 'Удержание',
                any: 'Любое изменение',
                less: 'Меньше',
                lessEqual: 'Меньше или равно',
                more: 'Больше',
                moreEqual: 'Больше или равно',
                error: 'Ошибка',
                equal: 'Равно',
                notEqual: 'Не равно',
                binaryEqual: 'Бинарное равно',
                binaryNotEqual: 'Бинарное не равно',
                nonError: 'Не ошибка',
                set: 'Установить',
                invert: 'Инвертировать',
                increase: 'Увеличить',
                smoothChange: 'Плавно изменить',
                cyclicChange: 'Циклическое изменение',
                stop: 'Остановить',
                add: 'Сложить',
                subtract: 'Вычесть',
                multiply: 'Умножить',
                divide: 'Разделить',
                divideRemainder: 'Остаток от деления',
                takeMax: 'Взять максимальное',
                takeMin: 'Взять минимальное',
                shiftLeft: 'Побитовый сдвиг влево',
                shiftRight: 'Побитовый сдвиг вправо',
            },
            checkBoxes: {
                conditionsOccur: 'При наступлении условий',
                triggerNoMatches: 'Триггер больше не соответствует',
                conditionNoMatches: 'Условие больше не соответствует',
            },
            popUp: {
                select: 'Выберите ',
                obj: 'объект',
                actions: 'действия',
                conditions: 'условия',
                btns: {
                    cancel: 'Отменить',
                    confirm: 'Выбрать',
                },
                placeholder: 'Название функции',
                info: 'Может быть выбрано несколько действий идущих подряд.',
            },
        },
    },
};
