import { Test, TestingModule } from '@nestjs/testing';
import { GetMovieRatingsV1Action } from './get-movie-ratings.action';
import { AUTH_SERVICE, AuthenticatedUser, QueryBusService, SortDirectionEnum } from '@backend-monorepo/boilerplate';
import { AccountId, Title } from '@backend-monorepo/domain';
import { GetMovieRatingsDto } from '../../../dtos/get-movie-ratings.dto';
import { GetMovieRatingsQuery } from '../../../../../../application/use-cases/get-movie-ratings/get-movie-ratings.query';
import { MovieRatingDocument } from '../../../../../../application/documents/movie-rating.document';
import { of } from 'rxjs';

describe('GetMovieRatingsV1Action', () => {
    let action: GetMovieRatingsV1Action;
    let mockQueryBus: jest.Mocked<QueryBusService>;

    const mockUser: AuthenticatedUser = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        username: 'testuser',
    };
    
    beforeEach(async () => {
        const mockQueryBusService = {
            dispatch: jest.fn(),
        };

        const mockAuthService = {
            send: jest.fn().mockReturnValue(of(mockUser)),
        };
        
        const module: TestingModule = await Test.createTestingModule({
            controllers: [GetMovieRatingsV1Action],
            providers: [
                {
                    provide: QueryBusService,
                    useValue: mockQueryBusService,
                },
                {
                    provide: AUTH_SERVICE,
                    useValue: mockAuthService,
                },
            ],
        }).compile();

        action = module.get<GetMovieRatingsV1Action>(GetMovieRatingsV1Action);
        mockQueryBus = module.get(QueryBusService);

        jest.clearAllMocks();
    });

    describe('index', () => {
        const mockMovieRating = new MovieRatingDocument(
            '123e4567-e89b-12d3-a456-426614174000',
            'Test Movie',
            'Great movie!',
            5,
            '123e4567-e89b-12d3-a456-426614174000',
            new Date(),
        );

        it('should get movie ratings successfully with all parameters', async () => {
            const dto: GetMovieRatingsDto = {
                accountId: '123e4567-e89b-12d3-a456-426614174000',
                title: 'Test Movie',
                skip: 0,
                take: 10,
                sortField: 'title',
                sortDirection: SortDirectionEnum.ASC,
            };

            mockQueryBus.dispatch.mockResolvedValue(mockMovieRating);

            await action.index(dto);

            expect(mockQueryBus.dispatch).toHaveBeenCalledWith(
                expect.any(GetMovieRatingsQuery)
            );
            expect(mockQueryBus.dispatch).toHaveBeenCalledTimes(1);
        });

        it('should create GetMovieRatingsQuery with correct parameters', async () => {
            const dto: GetMovieRatingsDto = {
                accountId: '123e4567-e89b-12d3-a456-426614174000',
                title: 'Test Movie',
                skip: 5,
                take: 20,
                sortField: 'stars',
                sortDirection: SortDirectionEnum.DESC,
            };

            mockQueryBus.dispatch.mockResolvedValue(mockMovieRating);

            await action.index(dto);

            const dispatchedQuery = mockQueryBus.dispatch.mock.calls[0][0] as GetMovieRatingsQuery;
            expect(dispatchedQuery).toBeInstanceOf(GetMovieRatingsQuery);
            expect(dispatchedQuery.getAccountId()).toBeInstanceOf(AccountId);
            expect(dispatchedQuery.getTitle()).toBeInstanceOf(Title);
            expect(dispatchedQuery.getAccountId()?.toString()).toBe('123e4567-e89b-12d3-a456-426614174000');
            expect(dispatchedQuery.getTitle()?.toString()).toBe('Test Movie');
            expect(dispatchedQuery.getSkip()).toBe(5);
            expect(dispatchedQuery.getTake()).toBe(20);
            expect(dispatchedQuery.getSortField()).toBe('stars');
            expect(dispatchedQuery.getSortDirection()).toBe(SortDirectionEnum.DESC);
        });

        it('should handle empty DTO with all undefined values', async () => {
            const dto: GetMovieRatingsDto = {};

            mockQueryBus.dispatch.mockResolvedValue(mockMovieRating);

            await action.index(dto);

            const dispatchedQuery = mockQueryBus.dispatch.mock.calls[0][0] as GetMovieRatingsQuery;
            expect(dispatchedQuery).toBeInstanceOf(GetMovieRatingsQuery);
            expect(dispatchedQuery.getAccountId()).toBeUndefined();
            expect(dispatchedQuery.getTitle()).toBeUndefined();
            expect(dispatchedQuery.getSkip()).toBeUndefined();
            expect(dispatchedQuery.getTake()).toBeUndefined();
            expect(dispatchedQuery.getSortField()).toBeUndefined();
            expect(dispatchedQuery.getSortDirection()).toBeUndefined();
        });

        it('should handle partial DTO with some parameters', async () => {
            const dto: GetMovieRatingsDto = {
                accountId: '123e4567-e89b-12d3-a456-426614174000',
                take: 15,
            };

            mockQueryBus.dispatch.mockResolvedValue(mockMovieRating);

            await action.index(dto);

            const dispatchedQuery = mockQueryBus.dispatch.mock.calls[0][0] as GetMovieRatingsQuery;
            expect(dispatchedQuery.getAccountId()?.toString()).toBe('123e4567-e89b-12d3-a456-426614174000');
            expect(dispatchedQuery.getTitle()).toBeUndefined();
            expect(dispatchedQuery.getSkip()).toBeUndefined();
            expect(dispatchedQuery.getTake()).toBe(15);
            expect(dispatchedQuery.getSortField()).toBeUndefined();
            expect(dispatchedQuery.getSortDirection()).toBeUndefined();
        });

        it('should handle different sort directions', async () => {
            const testCases = [
                { sortDirection: SortDirectionEnum.ASC },
                { sortDirection: SortDirectionEnum.DESC },
            ];

            for (const testCase of testCases) {
                const dto: GetMovieRatingsDto = testCase;
                mockQueryBus.dispatch.mockResolvedValue(mockMovieRating);

                await action.index(dto);

                const dispatchedQuery = mockQueryBus.dispatch.mock.calls[
                    mockQueryBus.dispatch.mock.calls.length - 1
                ][0] as GetMovieRatingsQuery;
                expect(dispatchedQuery.getSortDirection()).toBe(testCase.sortDirection);
            }
        });

        it('should handle different pagination parameters', async () => {
            const testCases = [
                { skip: 0, take: 10 },
                { skip: 20, take: 5 },
                { skip: 100, take: 50 },
            ];

            for (const testCase of testCases) {
                const dto: GetMovieRatingsDto = testCase;
                mockQueryBus.dispatch.mockResolvedValue(mockMovieRating);

                await action.index(dto);

                const dispatchedQuery = mockQueryBus.dispatch.mock.calls[
                    mockQueryBus.dispatch.mock.calls.length - 1
                ][0] as GetMovieRatingsQuery;
                expect(dispatchedQuery.getSkip()).toBe(testCase.skip);
                expect(dispatchedQuery.getTake()).toBe(testCase.take);
            }
        });

        it('should handle different sort fields', async () => {
            const testCases = [
                { sortField: 'title' },
                { sortField: 'stars' },
                { sortField: 'createdAt' },
            ];

            for (const testCase of testCases) {
                const dto: GetMovieRatingsDto = testCase;
                mockQueryBus.dispatch.mockResolvedValue(mockMovieRating);

                await action.index(dto);

                const dispatchedQuery = mockQueryBus.dispatch.mock.calls[
                    mockQueryBus.dispatch.mock.calls.length - 1
                ][0] as GetMovieRatingsQuery;
                expect(dispatchedQuery.getSortField()).toBe(testCase.sortField);
            }
        });

        it('should propagate errors from query bus', async () => {
            const dto: GetMovieRatingsDto = {
                accountId: '123e4567-e89b-12d3-a456-426614174000',
            };
            const errorMsg = 'Error getting movie ratings';
            mockQueryBus.dispatch.mockRejectedValue(new Error(errorMsg));

            await expect(action.index(dto)).rejects.toThrow(errorMsg);

            expect(mockQueryBus.dispatch).toHaveBeenCalledTimes(1);
        });

        it('should return the result from query bus', async () => {
            const dto: GetMovieRatingsDto = {};
            mockQueryBus.dispatch.mockResolvedValue(mockMovieRating);

            const result = await action.index(dto);

            expect(result).toBe(mockMovieRating);
        });
    });

    describe('edge cases', () => {
        const mockMovieRating = new MovieRatingDocument(
            '123e4567-e89b-12d3-a456-426614174000',
            'Test Movie',
            'Great movie!',
            5,
            '123e4567-e89b-12d3-a456-426614174000',
            new Date(),
        );

        it('should handle zero values for pagination', async () => {
            const dto: GetMovieRatingsDto = {
                skip: 0,
                take: 0,
            };

            mockQueryBus.dispatch.mockResolvedValue(mockMovieRating);

            await action.index(dto);

            const dispatchedQuery = mockQueryBus.dispatch.mock.calls[0][0] as GetMovieRatingsQuery;
            expect(dispatchedQuery.getSkip()).toBe(0);
            expect(dispatchedQuery.getTake()).toBe(0);
        });

        it('should handle multiple consecutive requests', async () => {
            const requests = [
                { accountId: '123e4567-e89b-12d3-a456-426614174001', title: 'Movie 1' },
                { accountId: '123e4567-e89b-12d3-a456-426614174002', title: 'Movie 2' },
                { accountId: '123e4567-e89b-12d3-a456-426614174003', title: 'Movie 3' },
            ];

            for (let i = 0; i < requests.length; i++) {
                mockQueryBus.dispatch.mockResolvedValue(mockMovieRating);

                await action.index(requests[i]);

                expect(mockQueryBus.dispatch).toHaveBeenCalledWith(expect.any(GetMovieRatingsQuery));
                expect(mockQueryBus.dispatch).toHaveBeenCalledTimes(i + 1);
            }

            expect(mockQueryBus.dispatch).toHaveBeenCalledTimes(3);
        });

        it('should handle empty string values', async () => {
            const dto: GetMovieRatingsDto = {
                title: '',
                sortField: '',
            };

            mockQueryBus.dispatch.mockResolvedValue(mockMovieRating);

            await action.index(dto);

            const dispatchedQuery = mockQueryBus.dispatch.mock.calls[0][0] as GetMovieRatingsQuery;
            expect(dispatchedQuery.getTitle()?.toString()).toBeUndefined();
            expect(dispatchedQuery.getSortField()).toBe('');
        });
    });
});
