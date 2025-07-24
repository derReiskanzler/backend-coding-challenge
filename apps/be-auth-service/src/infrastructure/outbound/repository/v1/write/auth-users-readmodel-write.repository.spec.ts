import { Test, TestingModule } from '@nestjs/testing';
import { AuthUsersV1ReadmodelWriteRepository } from './auth-users-readmodel-write.repository';
import { AuthUserDocument } from '../../../../../application/documents/auth-user.document';
import { Metadata } from '@backend-monorepo/boilerplate';

// Mock the parent class
jest.mock('@backend-monorepo/boilerplate', () => ({
    ...jest.requireActual('@backend-monorepo/boilerplate'),
    ReadmodelWriteRepository: class MockReadmodelWriteRepository {
        protected upsertDocument = jest.fn();
        protected deleteDocument = jest.fn();
    },
}));

describe('AuthUsersV1ReadmodelWriteRepository', () => {
    let repository: AuthUsersV1ReadmodelWriteRepository;
    let mockUpsertDocument: jest.Mock;
    let mockDeleteDocument: jest.Mock;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [AuthUsersV1ReadmodelWriteRepository],
        }).compile();

        repository = module.get<AuthUsersV1ReadmodelWriteRepository>(AuthUsersV1ReadmodelWriteRepository);
        mockUpsertDocument = (repository as any).upsertDocument;
        mockDeleteDocument = (repository as any).deleteDocument;
        
        jest.clearAllMocks();
    });

    describe('upsert', () => {
        let mockUserDocument: AuthUserDocument;
        let mockMetadata: Metadata;
        const testUserId = '123e4567-e89b-12d3-a456-426614174000';
        const testEventId = '123e4567-e89b-12d3-a456-426614174001';
        const testCausationId = '123e4567-e89b-12d3-a456-426614174002';

        beforeEach(() => {
            mockUserDocument = new AuthUserDocument(testUserId, 'testuser');
            mockMetadata = {
                causationId: testCausationId,
                causationName: 'TestCommand',
            };
        });

        it('should upsert document successfully', async () => {
            mockUpsertDocument.mockResolvedValue(undefined);

            await repository.upsert(mockUserDocument, testEventId, mockMetadata);

            expect(mockUpsertDocument).toHaveBeenCalledWith(
                mockUserDocument.id,
                mockUserDocument,
                testEventId,
                mockMetadata
            );
            expect(mockUpsertDocument).toHaveBeenCalledTimes(1);
        });

        it('should call upsertDocument with correct parameters', async () => {
            mockUpsertDocument.mockResolvedValue(undefined);

            await repository.upsert(mockUserDocument, testEventId, mockMetadata);

            expect(mockUpsertDocument).toHaveBeenCalledWith(
                testUserId,
                expect.any(AuthUserDocument),
                testEventId,
                expect.objectContaining({
                    causationId: testCausationId,
                    causationName: 'TestCommand',
                })
            );
            expect(mockUpsertDocument.mock.calls[0][0]).toBe(mockUserDocument.id);
            expect(mockUpsertDocument.mock.calls[0][1]).toBe(mockUserDocument);
            expect(mockUpsertDocument.mock.calls[0][2]).toBe(testEventId);
            expect(mockUpsertDocument.mock.calls[0][3]).toBe(mockMetadata);
        });

        it('should propagate errors from parent upsertDocument method', async () => {
            const errorMsg = 'Database connection failed';
            mockUpsertDocument.mockRejectedValue(new Error(errorMsg));

            await expect(repository.upsert(mockUserDocument, testEventId, mockMetadata)).rejects.toThrow(
                errorMsg
            );
            expect(mockUpsertDocument).toHaveBeenCalledWith(
                mockUserDocument.id,
                mockUserDocument,
                testEventId,
                mockMetadata
            );
        });
    });

    describe('deleteById', () => {
        const testUserId = '123e4567-e89b-12d3-a456-426614174000';
        const testEventId = '123e4567-e89b-12d3-a456-426614174001';

        it('should delete document successfully', async () => {
            mockDeleteDocument.mockResolvedValue(undefined);

            await repository.deleteById(testUserId, testEventId);

            expect(mockDeleteDocument).toHaveBeenCalledWith(testUserId, testEventId);
            expect(mockDeleteDocument).toHaveBeenCalledTimes(1);
        });

        it('should call deleteDocument with correct parameters', async () => {
            mockDeleteDocument.mockResolvedValue(undefined);

            await repository.deleteById(testUserId, testEventId);

            expect(mockDeleteDocument).toHaveBeenCalledWith(testUserId, testEventId);
            expect(mockDeleteDocument.mock.calls[0][0]).toBe(testUserId);
            expect(mockDeleteDocument.mock.calls[0][1]).toBe(testEventId);
        });

        it('should propagate errors from parent deleteDocument method', async () => {
            const testError = new Error('Document not found');
            mockDeleteDocument.mockRejectedValue(testError);

            await expect(repository.deleteById(testUserId, testEventId)).rejects.toThrow(
                'Document not found'
            );
            expect(mockDeleteDocument).toHaveBeenCalledWith(testUserId, testEventId);
        });
    });

    it('should handle multiple consecutive operations', async () => {
        const userDoc1 = new AuthUserDocument('user-1', 'username1');
        const userDoc2 = new AuthUserDocument('user-2', 'username2');
        const metadata = { causationId: 'cmd-123', causationName: 'TestCommand' };

        mockUpsertDocument.mockResolvedValue(undefined);
        mockDeleteDocument.mockResolvedValue(undefined);

        await repository.upsert(userDoc1, 'event-1', metadata);
        await repository.upsert(userDoc2, 'event-2', metadata);
        await repository.deleteById('user-1', 'event-3');

        expect(mockUpsertDocument).toHaveBeenCalledTimes(2);
        expect(mockDeleteDocument).toHaveBeenCalledTimes(1);
        expect(mockUpsertDocument).toHaveBeenNthCalledWith(1, userDoc1.id, userDoc1, 'event-1', metadata);
        expect(mockUpsertDocument).toHaveBeenNthCalledWith(2, userDoc2.id, userDoc2, 'event-2', metadata);
        expect(mockDeleteDocument).toHaveBeenNthCalledWith(1, 'user-1', 'event-3');
    });
});
