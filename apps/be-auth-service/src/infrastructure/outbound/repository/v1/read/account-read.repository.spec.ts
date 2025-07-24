import { Test, TestingModule } from '@nestjs/testing';
import { AccountV1ReadRepository } from './account-read.repository';
import { Account } from '../../../../../domain/aggregates/account.aggregate';

jest.mock('@backend-monorepo/boilerplate', () => ({
    ...jest.requireActual('@backend-monorepo/boilerplate'),
    AggregateReadRepository: class MockAggregateReadRepository {
        protected getAggregate = jest.fn();
    },
}));

describe('AccountV1ReadRepository', () => {
    let repository: AccountV1ReadRepository;
    let mockGetAggregate: jest.Mock;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [AccountV1ReadRepository],
        }).compile();

        repository = module.get<AccountV1ReadRepository>(AccountV1ReadRepository);
        mockGetAggregate = (repository as any).getAggregate;
        
        jest.clearAllMocks();
    });
    describe('getById', () => {
        const testAccountId = '123e4567-e89b-12d3-a456-426614174000';

        it('should return the account when found', async () => {
            const mockAccount = new Account();
            mockGetAggregate.mockResolvedValue(mockAccount);

            const result = await repository.getById(testAccountId);

            expect(result).toBe(mockAccount);
            expect(result).toBeInstanceOf(Account);
            expect(mockGetAggregate).toHaveBeenCalledWith(testAccountId);
            expect(mockGetAggregate).toHaveBeenCalledTimes(1);
        });

        it('should return null when account is not found', async () => {
            mockGetAggregate.mockResolvedValue(null);

            const result = await repository.getById(testAccountId);

            expect(result).toBeNull();
            expect(mockGetAggregate).toHaveBeenCalledWith(testAccountId);
            expect(mockGetAggregate).toHaveBeenCalledTimes(1);
        });

        it('should return null for non-existent account ID', async () => {
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
        const account1 = new Account();
        const account2 = new Account();
        const testAccountId1 = '123e4567-e89b-12d3-a456-426614174000';
        const testAccountId2 = '123e4567-e89b-12d3-a456-426614174001';

        mockGetAggregate.mockResolvedValueOnce(account1);
        mockGetAggregate.mockResolvedValueOnce(account2);
        mockGetAggregate.mockResolvedValueOnce(null);

        const result1 = await repository.getById(testAccountId1);
        const result2 = await repository.getById(testAccountId2);
        const result3 = await repository.getById('non-existent');

        expect(result1).toBe(account1);
        expect(result2).toBe(account2);
        expect(result3).toBeNull();

        expect(mockGetAggregate).toHaveBeenCalledTimes(3);
        expect(mockGetAggregate).toHaveBeenNthCalledWith(1, testAccountId1);
        expect(mockGetAggregate).toHaveBeenNthCalledWith(2, testAccountId2);
        expect(mockGetAggregate).toHaveBeenNthCalledWith(3, 'non-existent');
    });
});
