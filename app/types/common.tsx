// Basic

export interface BasicElement {
    id: string;
    title: string;
}

export interface MultiResponse<T> {
    count: number;
    next?: string;
    previous?: string;
    results: T[];
}

export interface EnumEntity<T> {
    name: T;
    description?: string | null;
}
