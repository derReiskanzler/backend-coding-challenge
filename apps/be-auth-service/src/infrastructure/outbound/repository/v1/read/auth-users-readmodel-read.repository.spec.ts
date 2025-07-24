import { Test, TestingModule } from '@nestjs/testing';
import { AuthUsersV1ReadmodelReadRepository } from './auth-users-readmodel-read.repository';
import { AuthUserDocument } from '../../../../../application/documents/auth-user.document';

jest.mock('@backend-monorepo/boilerplate', () => ({
    ...jest.requireActual('@backend-monorepo/boilerplate'),
    ReadmodelReadRepository: class MockReadmodelReadRepository {
        protected getDocument = jest.fn();
    },
}));

describe('AuthUsersV1ReadmodelReadRepository', () => {
    let repository: AuthUsersV1ReadmodelReadRepository;
    let mockGetDocument: jest.Mock;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [AuthUsersV1ReadmodelReadRepository],
        }).compile();

        repository = module.get<AuthUsersV1ReadmodelReadRepository>(AuthUsersV1ReadmodelReadRepository);
        mockGetDocument = (repository as any).getDocument;
        
        jest.clearAllMocks();
    });

    describe('getById', () => {
        const testUserId = '123e4567-e89b-12d3-a456-426614174000';

        it('should return user document when found', async () => {
            const mockUserDocument = new AuthUserDocument(testUserId, 'testuser');
            mockGetDocument.mockResolvedValue(mockUserDocument);

            const result = await repository.getById(testUserId);

            expect(result).toBe(mockUserDocument);
            expect(result).toBeInstanceOf(AuthUserDocument);
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

    describe('getByUsername', () => {
        const testUsername = 'testuser';
        const testUserId = '123e4567-e89b-12d3-a456-426614174000';

        it('should return user document when found', async () => {
            const mockUserDocument = new AuthUserDocument(testUserId, testUsername);
            mockGetDocument.mockResolvedValue(mockUserDocument);

            const result = await repository.getByUsername(testUsername);

            expect(result).toBe(mockUserDocument);
            expect(result).toBeInstanceOf(AuthUserDocument);
            expect(mockGetDocument).toHaveBeenCalledWith({ body: { username: testUsername } });
            expect(mockGetDocument).toHaveBeenCalledTimes(1);
        });

        it('should return null when user not found', async () => {
            mockGetDocument.mockResolvedValue(null);

            const result = await repository.getByUsername(testUsername);

            expect(result).toBeNull();
            expect(mockGetDocument).toHaveBeenCalledWith({ body: { username: testUsername } });
            expect(mockGetDocument).toHaveBeenCalledTimes(1);
        });

        it('should propagate errors from parent getDocument method', async () => {
            const testError = new Error('Query execution failed');
            mockGetDocument.mockRejectedValue(testError);

            await expect(repository.getByUsername(testUsername)).rejects.toThrow(
                'Query execution failed'
            );
            expect(mockGetDocument).toHaveBeenCalledWith({ body: { username: testUsername } });
        });

        it('should handle edge case inputs gracefully', async () => {
            const edgeCases = ['', '   ', '\n', '\t'];

            for (const edgeCase of edgeCases) {
                mockGetDocument.mockResolvedValue(null);

                const result = await repository.getByUsername(edgeCase);

                expect(result).toBeNull();
                expect(mockGetDocument).toHaveBeenCalledWith({ body: { username: edgeCase } });
            }
        });
    });

    it('should handle multiple consecutive read operations', async () => {
        const testUserId1 = '123e4567-e89b-12d3-a456-426614174000';
        const testUserId2 = '123e4567-e89b-12d3-a456-426614174001';
        const userDoc1 = new AuthUserDocument(testUserId1, 'username1');
        const userDoc2 = new AuthUserDocument(testUserId2, 'username2');

        mockGetDocument.mockResolvedValueOnce(userDoc1);
        mockGetDocument.mockResolvedValueOnce(userDoc2);
        mockGetDocument.mockResolvedValueOnce(null);

        const result1 = await repository.getById(testUserId1);
        const result2 = await repository.getByUsername('username2');
        const result3 = await repository.getById('non-existent');

        expect(result1).toBe(userDoc1);
        expect(result2).toBe(userDoc2);
        expect(result3).toBeNull();

        expect(mockGetDocument).toHaveBeenCalledTimes(3);
        expect(mockGetDocument).toHaveBeenNthCalledWith(1, { id: testUserId1 });
        expect(mockGetDocument).toHaveBeenNthCalledWith(2, { body: { username: 'username2' } });
        expect(mockGetDocument).toHaveBeenNthCalledWith(3, { id: 'non-existent' });
    });
});
