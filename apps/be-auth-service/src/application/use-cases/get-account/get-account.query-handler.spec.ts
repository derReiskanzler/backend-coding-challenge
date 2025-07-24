import { AccountId } from '@backend-monorepo/domain';
import { GetAccountQueryHandler } from './get-account.query-handler';
import { GetAccountQuery } from './get-account.query';
import { GetAccountDocumentRepositoryInterface } from './get-account-document.repository.interface';
import { AuthUserDocument } from '../../documents/auth-user.document';
import { AuthUserDocumentNotFoundException } from '../../exceptions/auth-user-document-not-found.exception';

describe('GetAccountQueryHandler', () => {
    let handler: GetAccountQueryHandler;
    let mockReadRepository: jest.Mocked<GetAccountDocumentRepositoryInterface>;

    beforeEach(() => {
        mockReadRepository = {
            getById: jest.fn(),
        };

        handler = new GetAccountQueryHandler(
            mockReadRepository,
        );
    });

    describe('execute', () => {
        const mockAccountId = '123e4567-e89b-12d3-a456-426614174000';
        const validQuery = new GetAccountQuery(
            AccountId.fromString(mockAccountId),
        );

        const mockAccount = new AuthUserDocument(
            mockAccountId,
            'testusername',
            new Date(),
        );

        it('should get account successfully', async () => {
            mockReadRepository.getById.mockResolvedValue(mockAccount);

            const result = await handler.execute(validQuery);
            expect(result).toEqual(mockAccount);
        });


        describe('repository error handling', () => {
            it('should propagate read repository errors', async () => {
                mockReadRepository.getById.mockRejectedValue(new Error('Database connection failed'));

                await expect(handler.execute(validQuery)).rejects.toThrow('Database connection failed');
            });
        });

        describe('edge cases', () => {
            it('should handle empty account search result', async () => {
                mockReadRepository.getById.mockResolvedValue(null);

                await expect(handler.execute(validQuery)).rejects.toThrow(AuthUserDocumentNotFoundException.withId(mockAccountId));
            });

            it('should handle concurrent get account', async () => {
                const testAccountId1 = '123e4567-e89b-12d3-a456-426614174000';
                const testAccountId2 = '123e4567-e89b-12d3-a456-426614174001';
                const userDoc1 = new AuthUserDocument(testAccountId1, 'title1', new Date());
                const userDoc2 = new AuthUserDocument(testAccountId2, 'title2', new Date());

                mockReadRepository.getById.mockResolvedValueOnce(userDoc1);
                mockReadRepository.getById.mockResolvedValueOnce(userDoc2);

                const queries = [
                    new GetAccountQuery(AccountId.fromString(testAccountId1)),
                    new GetAccountQuery(AccountId.fromString(testAccountId2)),
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