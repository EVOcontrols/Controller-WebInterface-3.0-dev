export const langs = ['ru', 'en'] as const;

export const userRoles = ['admin', 'user'] as const;

export const toastTypes = ['success', 'warning', 'error', 'info'] as const;

export const labelsFileLength = 64;

export const numberingSystems = ['dec', 'hex'] as const;

export const tempUnits = ['°C', '°F'] as const;

export const commonMessages = {
    en: {
        positiveInteger: 'Enter a positive integer',
        integerFromTo: 'Enter an integer from {from} to {to}',
        confirmation: 'Confirmation',
        toast: {
            success: 'Saved',
            error: {
                header: 'Error',
                text: 'Check entered values',
            },
        },
    },
    ru: {
        positiveInteger: 'Введите положительное целое число',
        integerFromTo: 'Введите целое число от {from} до {to}',
        confirmation: 'Подтверждение',
        toast: {
            success: 'Сохранено',
            error: {
                header: 'Ошибка',
                text: 'Проверьте введённые значения',
            },
        },
    },
};
