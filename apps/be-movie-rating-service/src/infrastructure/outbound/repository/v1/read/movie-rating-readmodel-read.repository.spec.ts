import { Test, TestingModule } from '@nestjs/testing';
import { MovieRatingV1ReadmodelReadRepository } from './movie-rating-readmodel-read.repository';
import { MovieRatingDocument } from '../../../../../application/documents/movie-rating.document';

jest.mock('@backend-monorepo/boilerplate', () => ({
    ...jest.requireActual('@backend-monorepo/boilerplate'),
    ReadmodelReadRepository: class MockReadmodelReadRepository {
        protected getDocument = jest.fn();
    },
}));

describe('MovieRatingV1ReadmodelReadRepository', () => {
    let repository: MovieRatingV1ReadmodelReadRepository;
    let mockGetDocument: jest.Mock;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [MovieRatingV1ReadmodelReadRepository],
        }).compile();

        repository = module.get<MovieRatingV1ReadmodelReadRepository>(MovieRatingV1ReadmodelReadRepository);
        mockGetDocument = (repository as any).getDocument;
        
        jest.clearAllMocks();
    });

    describe('getById', () => {
        const testUserId = '123e4567-e89b-12d3-a456-426614174000';

        it('should return user document when found', async () => {
            const mockUserDocument = new MovieRatingDocument(testUserId, 'testtitle', 'testdescription', 1, 'testaccountId');
            mockGetDocument.mockResolvedValue(mockUserDocument);

            const result = await repository.getById(testUserId);

            expect(result).toBe(mockUserDocument);
            expect(result).toBeInstanceOf(MovieRatingDocument);
            expect(mockGetDocument).toHaveBeenCalledWith({ id: testUserId });
            expect(mockGetDocument).toHaveBeenCalledTimes(1);
        });

        it('should return null when user not found', async () => {
            mockGetDocument.mockResolvedValue(null);

            const result = await repository.getById(testUserId);

            expect(result).toBeNull();
            expect(mockGetDocument).toHaveBeenCalledWith({ id: testUserId });
            expect(mockGetDocument).toHaveBeenCalledTimes(1);
        });

        it('should propagate errors from parent getDocument method', async () => {
            const testError = new Error('Database connection failed');
            mockGetDocument.mockRejectedValue(testError);

            await expect(repository.getById(testUserId)).rejects.toThrow(
                'Database connection failed'
            );
            expect(mockGetDocument).toHaveBeenCalledWith({ id: testUserId });
        });

        it('should handle edge case inputs gracefully', async () => {
            const edgeCases = ['', '   ', '\n', '\t'];

            for (const edgeCase of edgeCases) {
                mockGetDocument.mockResolvedValue(null);

                const result = await repository.getById(edgeCase);

                expect(result).toBeNull();
                expect(mockGetDocument).toHaveBeenCalledWith({ id: edgeCase });
            }
        });
    });

    it('should handle multiple consecutive read operations', async () => {
        const testMovieRatingId1 = '123e4567-e89b-12d3-a456-426614174000';
        const testMovieRatingId2 = '123e4567-e89b-12d3-a456-426614174001';
        const userDoc1 = new MovieRatingDocument(testMovieRatingId1, 'title1', 'description1', 1, 'accountId1');
        const userDoc2 = new MovieRatingDocument(testMovieRatingId2, 'title2', 'description2', 2, 'accountId2');

        mockGetDocument.mockResolvedValueOnce(userDoc1);
        mockGetDocument.mockResolvedValueOnce(userDoc2);
        mockGetDocument.mockResolvedValueOnce(null);

        const result1 = await repository.getById(testMovieRatingId1);
        const result2 = await repository.getById(testMovieRatingId2);
        const result3 = await repository.getById('non-existent');

        expect(result1).toBe(userDoc1);
        expect(result2).toBe(userDoc2);
        expect(result3).toBeNull();

        expect(mockGetDocument).toHaveBeenCalledTimes(3);
        expect(mockGetDocument).toHaveBeenNthCalledWith(1, { id: testMovieRatingId1 });
        expect(mockGetDocument).toHaveBeenNthCalledWith(2, { id: testMovieRatingId2 });
        expect(mockGetDocument).toHaveBeenNthCalledWith(3, { id: 'non-existent' });
    });
});
