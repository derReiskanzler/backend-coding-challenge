import { SortDirection } from '@backend-monorepo/boilerplate';

export interface GetMovieRatingsQueryDto {
    accountId?: string|undefined;
    title?: string|undefined;
    skip?: number|undefined;
    take?: number|undefined;
    sortField?: string|undefined;
    sortDirection?: SortDirection|undefined;
    }