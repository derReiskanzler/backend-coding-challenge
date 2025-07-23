export interface Sort {
    field?: string;
    direction?: SortDirection;
}

export type SortDirection = 'ASC' | 'DESC';
export const SortDirectionEnum = {
    ASC: 'ASC' as SortDirection,
    DESC: 'DESC' as SortDirection,
};