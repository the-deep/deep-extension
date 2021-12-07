import { memo } from 'react';

import {
    compareNumber,
} from '@togglecorp/fujs';

import { EnumEntity } from '../types/common';

export const genericMemo: (<T>(c: T) => T) = memo;

export function sortByOrder<T extends { order: number }>(data: T[]): T[]
export function sortByOrder(data: undefined): undefined
export function sortByOrder<T extends { order: number }>(data: T[] | undefined): T[] | undefined
export function sortByOrder<T extends { order: number }>(data: T[] | undefined) {
    if (!data) {
        return undefined;
    }
    return [...data].sort((a, b) => compareNumber(a.order, b.order));
}

type MonthNameMap = {
    [key: number]: string;
}

export const shortMonthNamesMap: MonthNameMap = {
    0: 'Jan',
    1: 'Feb',
    2: 'Mar',
    3: 'Apr',
    4: 'May',
    5: 'Jun',
    6: 'Jul',
    7: 'Aug',
    8: 'Sept',
    9: 'Oct',
    10: 'Nov',
    11: 'Dec',
};

export const enumKeySelector = <T>(d: EnumEntity<T>) => (
    d.name
);

export const enumLabelSelector = <T extends string | number>(d: EnumEntity<T>) => (
    d.description ?? `${d.name}`
);
