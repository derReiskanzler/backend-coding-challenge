import { Test, TestingModule } from '@nestjs/testing';
import { MovieRatingV1ReadRepository } from './movie-rating-read.repository';
import { MovieRating } from '../../../../../domain/aggregates/movie-rating.aggregate';

jest.mock('@backend-monorepo/boilerplate', () => ({
    ...jest.requireActual('@backend-monorepo/boilerplate'),
    AggregateReadRepository: class MockAggregateReadRepository {
        protected getAggregate = jest.fn();
    },
}));

describe('MovieRatingV1ReadRepository', () => {
    let repository: MovieRatingV1ReadRepository;
    let mockGetAggregate: jest.Mock;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [MovieRatingV1ReadRepository],
        }).compile();

        repository = module.get<MovieRatingV1ReadRepository>(MovieRatingV1ReadRepository);
        mockGetAggregate = (repository as any).getAggregate;
        
        jest.clearAllMocks();
    });
    describe('getById', () => {
        const testAccountId = '123e4567-e89b-12d3-a456-426614174000';

        it('should return the movie rating when found', async () => {
            const mockMovieRating = new MovieRating();
            mockGetAggregate.mockResolvedValue(mockMovieRating);

            const result = await repository.getById(testAccountId);

            expect(result).toBe(mockMovieRating);
            expect(result).toBeInstanceOf(MovieRating);
            expect(mockGetAggregate).toHaveBeenCalledWith(testAccountId);
            expect(mockGetAggregate).toHaveBeenCalledTimes(1);
        });

        it('should return null when movie rating is not found', async () => {
            mockGetAggregate.mockResolvedValue(null);

            const result = await repository.getById(testAccountId);

            expect(result).toBeNull();
            expect(mockGetAggregate).toHaveBeenCalledWith(testAccountId);
            expect(mockGetAggregate).toHaveBeenCalledTimes(1);
        });

        it('should return null for non-existent movie rating ID', async () => {
            mockGetAggregate.mockResolvedValue(null);

            const result = await repository.getById('non-existent-id');

            expect(result).toBeNull();
            expect(mockGetAggregate).toHaveBeenCalledWith('non-existent-id');
        });

        it('should propagate errors from parent getAggregate method', async () => {
            const testError = new Error('Database connection failed');
            mockGetAggregate.mockRejectedValue(testError);

            await expect(repository.getById(testAccountId)).rejects.toThrow(
                'Database connection failed'
            );
            expect(mockGetAggregate).toHaveBeenCalledWith(testAccountId);
        });

        it('should handle edge case inputs gracefully', async () => {
            const edgeCases = ['', '   ', '\n', '\t'];

            for (const edgeCase of edgeCases) {
                mockGetAggregate.mockResolvedValue(null);

                const result = await repository.getById(edgeCase);

                expect(result).toBeNull();
                expect(mockGetAggregate).toHaveBeenCalledWith(edgeCase);
            }
        });
    });

    it('should handle multiple consecutive read operations', async () => {
        const movieRating1 = new MovieRating();
        const movieRating2 = new MovieRating();
        const testAccountId1 = '123e4567-e89b-12d3-a456-426614174000';
        const testAccountId2 = '123e4567-e89b-12d3-a456-426614174001';

        mockGetAggregate.mockResolvedValueOnce(movieRating1);
        mockGetAggregate.mockResolvedValueOnce(movieRating2);
        mockGetAggregate.mockResolvedValueOnce(null);

        const result1 = await repository.getById(testAccountId1);
        const result2 = await repository.getById(testAccountId2);
        const result3 = await repository.getById('non-existent');

        expect(result1).toBe(movieRating1);
        expect(result2).toBe(movieRating2);
        expect(result3).toBeNull();

        expect(mockGetAggregate).toHaveBeenCalledTimes(3);
        expect(mockGetAggregate).toHaveBeenNthCalledWith(1, testAccountId1);
        expect(mockGetAggregate).toHaveBeenNthCalledWith(2, testAccountId2);
        expect(mockGetAggregate).toHaveBeenNthCalledWith(3, 'non-existent');
    });
});
