import { Query, SortDirection, SortDirectionEnum } from '@backend-monorepo/boilerplate';
import { AccountId, Title } from '@backend-monorepo/domain';
import { GetMovieRatingsQuery } from './get-movie-ratings.query';

describe('GetMovieRatingsQuery', () => {
    let validAccountId: AccountId;
    let validTitle: Title;
    let validSkip: number;
    let validTake: number;
    let validSortField: string;
    let validSortDirection: SortDirection;

    beforeEach(() => {
        validAccountId = AccountId.fromString('123e4567-e89b-12d3-a456-426614174000');
        validTitle = Title.fromString('test');
        validSkip = 0;
        validTake = 10;
        validSortField = 'title';
        validSortDirection = SortDirectionEnum.ASC;
    });

    it('should create instance with valid account id', () => {
        const query = new GetMovieRatingsQuery(validAccountId);

        expect(query).toBeInstanceOf(GetMovieRatingsQuery);
        expect(query).toBeInstanceOf(Query);
    });

    it('should store account id, title, skip, take, sortField, sortDirection correctly', () => {
        const query = new GetMovieRatingsQuery(validAccountId, validTitle, validSkip, validTake, validSortField, validSortDirection);

        expect(query.getAccountId()).toBe(validAccountId);
        expect(query.getTitle()).toBe(validTitle);
        expect(query.getSkip()).toBe(validSkip);
        expect(query.getTake()).toBe(validTake);
        expect(query.getSortField()).toBe(validSortField);
        expect(query.getSortDirection()).toBe(validSortDirection);
    });

    it('should extend Query class', () => {
        const query = new GetMovieRatingsQuery(validAccountId);

        expect(query).toBeInstanceOf(Query);
    });
});