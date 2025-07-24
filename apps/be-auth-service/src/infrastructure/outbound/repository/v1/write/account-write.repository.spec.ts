import { Test, TestingModule } from '@nestjs/testing';
import { AccountV1WriteRepository } from './account-write.repository';
import { Account } from '../../../../../domain/aggregates/account.aggregate';
import { Command } from '@backend-monorepo/boilerplate';

class MockCommand extends Command {
    constructor(public readonly name = 'TestCommand') {
        super();
    }
}

jest.mock('@backend-monorepo/boilerplate', () => ({
    ...jest.requireActual('@backend-monorepo/boilerplate'),
    AggregateWriteRepository: class MockAggregateWriteRepository {
        protected saveAggregate = jest.fn();
    },
}));

describe('AccountV1WriteRepository', () => {
    let repository: AccountV1WriteRepository;
    let mockSaveAggregate: jest.Mock;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [AccountV1WriteRepository],
        }).compile();

        repository = module.get<AccountV1WriteRepository>(AccountV1WriteRepository);
        mockSaveAggregate = (repository as any).saveAggregate;
        
        jest.clearAllMocks();
    });

    describe('save', () => {
        let mockAccount: Account;
        let mockCommand: MockCommand;

        beforeEach(() => {
            mockAccount = new Account();
            mockCommand = new MockCommand('TestCommand');
        });

        it('should save account successfully', async () => {
            mockSaveAggregate.mockResolvedValue(undefined);

            await repository.save(mockAccount, mockCommand);

            expect(mockSaveAggregate).toHaveBeenCalledWith(mockAccount, mockCommand);
            expect(mockSaveAggregate).toHaveBeenCalledTimes(1);
        });

        it('should call saveAggregate with correct parameters', async () => {
            mockSaveAggregate.mockResolvedValue(undefined);

            await repository.save(mockAccount, mockCommand);

            expect(mockSaveAggregate).toHaveBeenCalledWith(
                expect.any(Account),
                expect.any(Command)
            );
            expect(mockSaveAggregate.mock.calls[0][0]).toBe(mockAccount);
            expect(mockSaveAggregate.mock.calls[0][1]).toBe(mockCommand);
        });

        it('should propagate errors from parent saveAggregate method', async () => {
            const testError = new Error('Database connection failed');
            mockSaveAggregate.mockRejectedValue(testError);

            await expect(repository.save(mockAccount, mockCommand)).rejects.toThrow(
                'Database connection failed'
            );
            expect(mockSaveAggregate).toHaveBeenCalledWith(mockAccount, mockCommand);
        });

        it('should handle multiple consecutive save operations', async () => {
            const account1 = new Account();
            const account2 = new Account();
            const command1 = new MockCommand('Command1');
            const command2 = new MockCommand('Command2');

            mockSaveAggregate.mockResolvedValue(undefined);

            await repository.save(account1, command1);
            await repository.save(account2, command2);

            expect(mockSaveAggregate).toHaveBeenCalledTimes(2);
            expect(mockSaveAggregate).toHaveBeenNthCalledWith(1, account1, command1);
            expect(mockSaveAggregate).toHaveBeenNthCalledWith(2, account2, command2);
        });
    });
});
