import { PagingDto, SortDirectionEnum } from '@backend-monorepo/boilerplate';
import { AccountId, Title } from '@backend-monorepo/domain';
import { GetMovieRatingsDocumentRepositoryInterface } from './get-movie-ratings-document.repository.interface';
import { GetMovieRatingsQueryHandler } from './get-movie-ratings.query-handler';
import { GetMovieRatingsQuery } from './get-movie-ratings.query';
import { MovieRatingDocument } from '../../documents/movie-rating.document';

describe('GetMovieRatingsQueryHandler', () => {
    let handler: GetMovieRatingsQueryHandler;
    let mockReadRepository: jest.Mocked<GetMovieRatingsDocumentRepositoryInterface>;

    beforeEach(() => {
        mockReadRepository = {
            getMany: jest.fn(),
        };

        handler = new GetMovieRatingsQueryHandler(
            mockReadRepository,
        );
    });

    describe('execute', () => {
        const mockAccountId = '123e4567-e89b-12d3-a456-426614174000';
        const mockMovieRatings = [
            new MovieRatingDocument(
                '111e4567-e89b-12d3-a456-426614174111',
                'First Movie',
                'Great movie',
                5,
                mockAccountId,
                new Date(),
            ),
            new MovieRatingDocument(
                '222e4567-e89b-12d3-a456-426614174222',
                'Second Movie',
                'Good movie',
                4,
                mockAccountId,
                new Date(),
            ),
        ];

        const mockPagingResult: PagingDto<MovieRatingDocument> = {
            data: mockMovieRatings,
            meta: {
                skip: 0,
                take: 10,
                count: 2,
            },
        };

        it('should get movie ratings successfully with all parameters', async () => {
            const validQuery = new GetMovieRatingsQuery(
                AccountId.fromString(mockAccountId),
                Title.fromString('Movie'),
                0,
                10,
                'title',
                SortDirectionEnum.ASC
            );

            mockReadRepository.getMany.mockResolvedValue(mockPagingResult);

            const result = await handler.execute(validQuery);

            expect(result).toEqual(mockPagingResult);
            expect(mockReadRepository.getMany).toHaveBeenCalledWith(
                {
                    accountId: mockAccountId,
                    title: 'Movie',
                },
                {
                    skip: 0,
                    take: 10,
                },
                {
                    field: 'title',
                    direction: SortDirectionEnum.ASC,
                }
            );
            expect(mockReadRepository.getMany).toHaveBeenCalledTimes(1);
        });

        it('should get movie ratings with minimal parameters', async () => {
            const validQuery = new GetMovieRatingsQuery(
                AccountId.fromString(mockAccountId)
            );

            mockReadRepository.getMany.mockResolvedValue(mockPagingResult);

            const result = await handler.execute(validQuery);

            expect(result).toEqual(mockPagingResult);
            expect(mockReadRepository.getMany).toHaveBeenCalledWith(
                {
                    accountId: mockAccountId,
                    title: undefined,
                },
                {
                    skip: undefined,
                    take: undefined,
                },
                {
                    field: undefined,
                    direction: undefined,
                }
            );
        });

        it('should handle different account IDs correctly', async () => {
            const differentAccountId = '987e4567-e89b-12d3-a456-426614174999';
            const validQuery = new GetMovieRatingsQuery(
                AccountId.fromString(differentAccountId)
            );

            mockReadRepository.getMany.mockResolvedValue(mockPagingResult);

            await handler.execute(validQuery);

            expect(mockReadRepository.getMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    accountId: differentAccountId,
                }),
                expect.any(Object),
                expect.any(Object)
            );
        });

        it('should handle different title filters', async () => {
            const titleFilters = ['Action', 'Comedy', 'Drama'];

            for (const title of titleFilters) {
                const validQuery = new GetMovieRatingsQuery(
                    AccountId.fromString(mockAccountId),
                    Title.fromString(title)
                );

                mockReadRepository.getMany.mockResolvedValue(mockPagingResult);

                await handler.execute(validQuery);

                expect(mockReadRepository.getMany).toHaveBeenCalledWith(
                    expect.objectContaining({
                        title: title,
                    }),
                    expect.any(Object),
                    expect.any(Object)
                );
            }
        });

        it('should handle empty results', async () => {
            const emptyPagingResult: PagingDto<MovieRatingDocument> = {
                data: [],
                meta: {
                    skip: 0,
                    take: 10,
                    count: 0,
                },
            };

            const validQuery = new GetMovieRatingsQuery(
                AccountId.fromString(mockAccountId)
            );

            mockReadRepository.getMany.mockResolvedValue(emptyPagingResult);

            const result = await handler.execute(validQuery);

            expect(result).toEqual(emptyPagingResult);
            expect(result.data).toHaveLength(0);
            expect(result.meta.count).toBe(0);
        });
    });

    describe('repository error handling', () => {
        const validQuery = new GetMovieRatingsQuery(
            AccountId.fromString('123e4567-e89b-12d3-a456-426614174000')
        );

        it('should propagate read repository errors', async () => {
            const errorMsg = 'Database connection failed';
            mockReadRepository.getMany.mockRejectedValue(new Error(errorMsg));

            await expect(handler.execute(validQuery)).rejects.toThrow(errorMsg);
            expect(mockReadRepository.getMany).toHaveBeenCalledTimes(1);
        });
    });

    describe('edge cases', () => {
        it('should handle concurrent get movie ratings requests', async () => {
            const accountIds = [
                '123e4567-e89b-12d3-a456-426614174000',
                '456e4567-e89b-12d3-a456-426614174001',
                '789e4567-e89b-12d3-a456-426614174002',
            ];

            const queries = accountIds.map(id => 
                new GetMovieRatingsQuery(AccountId.fromString(id))
            );

            const mockResults = accountIds.map((_, index) => ({
                data: [
                    new MovieRatingDocument(
                        `${index}11e4567-e89b-12d3-a456-426614174111`,
                        `Movie ${index}`,
                        `Description ${index}`,
                        5,
                        accountIds[index],
                        new Date(),
                    ),
                ],
                meta: {
                    skip: 0,
                    take: 10,
                    count: 1,
                },
            }));

            mockResults.forEach(result => {
                mockReadRepository.getMany.mockResolvedValueOnce(result);
            });

            const results = await Promise.all(
                queries.map(query => handler.execute(query))
            );

            expect(results).toHaveLength(3);
            expect(mockReadRepository.getMany).toHaveBeenCalledTimes(3);
            
            results.forEach((result, index) => {
                expect(result.data).toHaveLength(1);
                expect(result.data[0].title).toBe(`Movie ${index}`);
            });
        });
    });
});
