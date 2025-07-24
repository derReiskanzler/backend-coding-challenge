import { MovieRatingId } from '@backend-monorepo/domain';
import { GetMovieRatingDocumentRepositoryInterface } from './get-movie-rating-document.repository.interface';
import { GetMovieRatingQueryHandler } from './get-movie-rating.query-handler';
import { GetMovieRatingQuery } from './get-movie-rating.query';
import { MovieRatingDocument } from '../../documents/movie-rating.document';
import { MovieRatingDocumentNotFoundException } from '../../exceptions/movie-rating-document-not-found.exception';

describe('GetMovieRatingQueryHandler', () => {
    let handler: GetMovieRatingQueryHandler;
    let mockReadRepository: jest.Mocked<GetMovieRatingDocumentRepositoryInterface>;

    beforeEach(() => {
        mockReadRepository = {
            getById: jest.fn(),
        };

        handler = new GetMovieRatingQueryHandler(
            mockReadRepository,
        );
    });

    describe('execute', () => {
        const mockMovieRatingId = '123e4567-e89b-12d3-a456-426614174000';
        const validQuery = new GetMovieRatingQuery(
            MovieRatingId.fromString(mockMovieRatingId),
        );

        const mockMovieRating = new MovieRatingDocument(
            mockMovieRatingId,
            'testtitle',
            'testdescription',
            5,
            '123e4567-e89b-12d3-a456-426614174000',
        );

        it('should get movie rating successfully', async () => {
            mockReadRepository.getById.mockResolvedValue(mockMovieRating);

            const result = await handler.execute(validQuery);
            expect(result).toEqual(mockMovieRating);
        });


        describe('repository error handling', () => {
            it('should propagate read repository errors', async () => {
                mockReadRepository.getById.mockRejectedValue(new Error('Database connection failed'));

                await expect(handler.execute(validQuery)).rejects.toThrow('Database connection failed');
            });
        });

        describe('edge cases', () => {
            it('should handle empty movie rating search result', async () => {
                mockReadRepository.getById.mockResolvedValue(null);

                await expect(handler.execute(validQuery)).rejects.toThrow(MovieRatingDocumentNotFoundException.withId(mockMovieRatingId));
            });

            it('should handle concurrent get movie rating', async () => {
                const testMovieRatingId1 = '123e4567-e89b-12d3-a456-426614174000';
                const testMovieRatingId2 = '123e4567-e89b-12d3-a456-426614174001';
                const userDoc1 = new MovieRatingDocument(testMovieRatingId1, 'title1', 'description1', 1, 'accountId1');
                const userDoc2 = new MovieRatingDocument(testMovieRatingId2, 'title2', 'description2', 2, 'accountId2');

                mockReadRepository.getById.mockResolvedValueOnce(userDoc1);
                mockReadRepository.getById.mockResolvedValueOnce(userDoc2);

                const queries = [
                    new GetMovieRatingQuery(MovieRatingId.fromString(testMovieRatingId1)),
                    new GetMovieRatingQuery(MovieRatingId.fromString(testMovieRatingId2)),
                ];

                const results = await Promise.all(
                    queries.map(query => handler.execute(query))
                );

                expect(results).toHaveLength(2);
                expect(mockReadRepository.getById).toHaveBeenCalledTimes(2);
            });
        });
    });
}); 