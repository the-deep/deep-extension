import { EnumEntity } from '#types/common';

export const enumKeySelector = <T>(d: EnumEntity<T>) => (
    d.name
);

export const enumLabelSelector = <T extends string | number>(d: EnumEntity<T>) => (
    d.description ?? `${d.name}`
);

interface BasicEntity {
    id: string;
    name: string;
}
export const basicEntityKeySelector = (d: BasicEntity): string => d.id;
export const basicEntityLabelSelector = (d: BasicEntity) => d.name;
