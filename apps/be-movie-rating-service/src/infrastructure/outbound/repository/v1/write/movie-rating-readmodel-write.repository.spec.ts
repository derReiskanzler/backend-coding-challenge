import { Test, TestingModule } from '@nestjs/testing';
import { MovieRatingV1ReadmodelWriteRepository } from './movie-rating-readmodel-write.repository';
import { MovieRatingDocument } from '../../../../../application/documents/movie-rating.document';
import { Metadata } from '@backend-monorepo/boilerplate';

// Mock the parent class
jest.mock('@backend-monorepo/boilerplate', () => ({
    ...jest.requireActual('@backend-monorepo/boilerplate'),
    ReadmodelWriteRepository: class MockReadmodelWriteRepository {
        protected upsertDocument = jest.fn();
        protected deleteDocument = jest.fn();
    },
}));

describe('MovieRatingV1ReadmodelWriteRepository', () => {
    let repository: MovieRatingV1ReadmodelWriteRepository;
    let mockUpsertDocument: jest.Mock;
    let mockDeleteDocument: jest.Mock;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [MovieRatingV1ReadmodelWriteRepository],
        }).compile();

        repository = module.get<MovieRatingV1ReadmodelWriteRepository>(MovieRatingV1ReadmodelWriteRepository);
        mockUpsertDocument = (repository as any).upsertDocument;
        mockDeleteDocument = (repository as any).deleteDocument;
        
        jest.clearAllMocks();
    });

    describe('upsert', () => {
        let mockMovieRatingDocument: MovieRatingDocument;
        let mockMetadata: Metadata;
        const testMovieRatingId = '123e4567-e89b-12d3-a456-426614174000';
        const testEventId = '123e4567-e89b-12d3-a456-426614174001';
        const testCausationId = '123e4567-e89b-12d3-a456-426614174002';

        beforeEach(() => {
            mockMovieRatingDocument = new MovieRatingDocument(testMovieRatingId, 'testtitle', 'testdescription', 5, 'testaccountId');
            mockMetadata = {
                causationId: testCausationId,
                causationName: 'TestCommand',
            };
        });

        it('should upsert document successfully', async () => {
            mockUpsertDocument.mockResolvedValue(undefined);

            await repository.upsert(mockMovieRatingDocument, testEventId, mockMetadata);

            expect(mockUpsertDocument).toHaveBeenCalledWith(
                mockMovieRatingDocument.id,
                mockMovieRatingDocument,
                testEventId,
                mockMetadata
            );
            expect(mockUpsertDocument).toHaveBeenCalledTimes(1);
        });

        it('should call upsertDocument with correct parameters', async () => {
            mockUpsertDocument.mockResolvedValue(undefined);

            await repository.upsert(mockMovieRatingDocument, testEventId, mockMetadata);

            expect(mockUpsertDocument).toHaveBeenCalledWith(
                testMovieRatingId,
                expect.any(MovieRatingDocument),
                testEventId,
                expect.objectContaining({
                    causationId: testCausationId,
                    causationName: 'TestCommand',
                })
            );
            expect(mockUpsertDocument.mock.calls[0][0]).toBe(mockMovieRatingDocument.id);
            expect(mockUpsertDocument.mock.calls[0][1]).toBe(mockMovieRatingDocument);
            expect(mockUpsertDocument.mock.calls[0][2]).toBe(testEventId);
            expect(mockUpsertDocument.mock.calls[0][3]).toBe(mockMetadata);
        });

        it('should propagate errors from parent upsertDocument method', async () => {
            const errorMsg = 'Database connection failed';
            mockUpsertDocument.mockRejectedValue(new Error(errorMsg));

            await expect(repository.upsert(mockMovieRatingDocument, testEventId, mockMetadata)).rejects.toThrow(
                errorMsg
            );
            expect(mockUpsertDocument).toHaveBeenCalledWith(
                mockMovieRatingDocument.id,
                mockMovieRatingDocument,
                testEventId,
                mockMetadata
            );
        });
    });

    describe('deleteById', () => {
        const testMovieRatingId = '123e4567-e89b-12d3-a456-426614174000';
        const testEventId = '123e4567-e89b-12d3-a456-426614174001';

        it('should delete document successfully', async () => {
            mockDeleteDocument.mockResolvedValue(undefined);

            await repository.deleteById(testMovieRatingId, testEventId);

            expect(mockDeleteDocument).toHaveBeenCalledWith(testMovieRatingId, testEventId);
            expect(mockDeleteDocument).toHaveBeenCalledTimes(1);
        });

        it('should call deleteDocument with correct parameters', async () => {
            mockDeleteDocument.mockResolvedValue(undefined);

            await repository.deleteById(testMovieRatingId, testEventId);

            expect(mockDeleteDocument).toHaveBeenCalledWith(testMovieRatingId, testEventId);
            expect(mockDeleteDocument.mock.calls[0][0]).toBe(testMovieRatingId);
            expect(mockDeleteDocument.mock.calls[0][1]).toBe(testEventId);
        });

        it('should propagate errors from parent deleteDocument method', async () => {
            const testError = new Error('Document not found');
            mockDeleteDocument.mockRejectedValue(testError);

            await expect(repository.deleteById(testMovieRatingId, testEventId)).rejects.toThrow(
                'Document not found'
            );
            expect(mockDeleteDocument).toHaveBeenCalledWith(testMovieRatingId, testEventId);
        });
    });

    it('should handle multiple consecutive operations', async () => {
        const movieRatingDoc1 = new MovieRatingDocument('movie-rating-1', 'title1', 'description1', 5, 'accountId1');
        const movieRatingDoc2 = new MovieRatingDocument('movie-rating-2', 'title2', 'description2', 5, 'accountId2');
        const metadata = { causationId: 'cmd-123', causationName: 'TestCommand' };

        mockUpsertDocument.mockResolvedValue(undefined);
        mockDeleteDocument.mockResolvedValue(undefined);

        await repository.upsert(movieRatingDoc1, 'event-1', metadata);
        await repository.upsert(movieRatingDoc2, 'event-2', metadata);
        await repository.deleteById('movie-rating-1', 'event-3');

        expect(mockUpsertDocument).toHaveBeenCalledTimes(2);
        expect(mockDeleteDocument).toHaveBeenCalledTimes(1);
        expect(mockUpsertDocument).toHaveBeenNthCalledWith(1, movieRatingDoc1.id, movieRatingDoc1, 'event-1', metadata);
        expect(mockUpsertDocument).toHaveBeenNthCalledWith(2, movieRatingDoc2.id, movieRatingDoc2, 'event-2', metadata);
        expect(mockDeleteDocument).toHaveBeenNthCalledWith(1, 'movie-rating-1', 'event-3');
    });
});
