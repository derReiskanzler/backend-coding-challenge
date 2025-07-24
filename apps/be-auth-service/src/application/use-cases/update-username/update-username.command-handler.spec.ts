import { AccountId, Username } from '@backend-monorepo/domain';
import { UpdateUsernameCommand } from './update-username.command';
import { UpdateUsernameCommandHandler } from './update-username.command-handler';
import { AccountRepositoryInterface } from './account.repository.interface';
import { AccountReadRepositoryInterface } from './account-read.repository.interface';
import { Account } from '../../../domain/aggregates/account.aggregate';
import { AccountNotFoundException } from '../../exceptions/account-not-found.exception';

describe('UpdateUsernameCommandHandler', () => {
    let handler: UpdateUsernameCommandHandler;
    let mockWriteRepository: jest.Mocked<AccountRepositoryInterface>;
    let mockReadRepository: jest.Mocked<AccountReadRepositoryInterface>;

    beforeEach(() => {
        mockWriteRepository = {
            save: jest.fn(),
        };
        mockReadRepository = {
            getById: jest.fn(),
        };

        handler = new UpdateUsernameCommandHandler(
            mockWriteRepository,
            mockReadRepository,
        );
    });

    describe('execute', () => {
        const accountId = AccountId.fromString('123e4567-e89b-12d3-a456-426614174000');
        const oldUsername = Username.fromString('old.username');
        const newUsername = Username.fromString('new.username');
        const validCommand = new UpdateUsernameCommand(accountId, newUsername);

        describe('when account exists', () => {
            let mockAccount: jest.Mocked<Account>;

            beforeEach(() => {
                mockAccount = {
                    updateUsername: jest.fn(),
                    getState: jest.fn().mockReturnValue({
                        getUsername: () => oldUsername.toString(),
                    }),
                    getPendingEvents: jest.fn().mockReturnValue([]),
                } as any;
                mockReadRepository.getById.mockResolvedValue(mockAccount);
            });

            it('should update username successfully', async () => {
                await handler.execute(validCommand);

                expect(mockReadRepository.getById).toHaveBeenCalledWith(accountId.toString());
                expect(mockAccount.updateUsername).toHaveBeenCalledWith(newUsername);
                expect(mockWriteRepository.save).toHaveBeenCalledWith(mockAccount, validCommand);
            });

            it('should call updateUsername with correct parameters', async () => {
                await handler.execute(validCommand);

                expect(mockAccount.updateUsername).toHaveBeenCalledTimes(1);
                expect(mockAccount.updateUsername).toHaveBeenCalledWith(newUsername);
            });

            it('should save the account with command after updating username', async () => {
                await handler.execute(validCommand);

                expect(mockWriteRepository.save).toHaveBeenCalledTimes(1);
                expect(mockWriteRepository.save).toHaveBeenCalledWith(mockAccount, validCommand);
            });

            it('should handle same username update', async () => {
                const sameUsernameCommand = new UpdateUsernameCommand(accountId, oldUsername);
                mockAccount.getState.mockReturnValue({
                    getUsername: () => oldUsername.toString(),
                } as any);

                await handler.execute(sameUsernameCommand);

                expect(mockAccount.updateUsername).toHaveBeenCalledWith(oldUsername);
                expect(mockWriteRepository.save).toHaveBeenCalledWith(mockAccount, sameUsernameCommand);
            });
        });

        describe('when account does not exist', () => {
            beforeEach(() => {
                mockReadRepository.getById.mockResolvedValue(null);
            });

            it('should throw not found exception with correct id', async () => {
                await expect(handler.execute(validCommand)).rejects.toThrow(
                    AccountNotFoundException.withId(accountId.toString())
                );
            });

            it('should call read repository before throwing exception', async () => {
                try {
                    await handler.execute(validCommand);
                    expect(true).toBe(false);
                } catch (error: any) {
                    expect(error).toBeInstanceOf(AccountNotFoundException);
                    expect(mockReadRepository.getById).toHaveBeenCalledWith(accountId.toString());
                    expect(mockWriteRepository.save).not.toHaveBeenCalled();
                }
            });

            it('should not call write repository when account not found', async () => {
                try {
                    await handler.execute(validCommand);
                    expect(true).toBe(false);
                } catch (error: any) {
                    expect(error).toBeInstanceOf(AccountNotFoundException);
                    expect(mockWriteRepository.save).not.toHaveBeenCalled();
                }
            });
        });

        describe('repository error handling', () => {
            it('should propagate read repository errors', async () => {
                mockReadRepository.getById.mockRejectedValue(new Error('Database connection failed'));

                await expect(handler.execute(validCommand)).rejects.toThrow('Database connection failed');
                expect(mockWriteRepository.save).not.toHaveBeenCalled();
            });

            it('should propagate write repository errors', async () => {
                const mockAccount = {
                    updateUsername: jest.fn(),
                } as any;
                mockReadRepository.getById.mockResolvedValue(mockAccount);
                mockWriteRepository.save.mockRejectedValue(new Error('Failed to save account') as never);

                await expect(handler.execute(validCommand)).rejects.toThrow('Failed to save account');
                expect(mockReadRepository.getById).toHaveBeenCalledTimes(1);
                expect(mockAccount.updateUsername).toHaveBeenCalledTimes(1);
                expect(mockWriteRepository.save).toHaveBeenCalledTimes(1);
            });
        });

        describe('edge cases', () => {
            it('should handle undefined account from repository', async () => {
                mockReadRepository.getById.mockResolvedValue(undefined as any);

                await expect(handler.execute(validCommand)).rejects.toThrow(
                    AccountNotFoundException.withId(accountId.toString())
                );
            });

            it('should handle concurrent username updates for different accounts', async () => {
                const accountId1 = AccountId.fromString('111e4567-e89b-12d3-a456-426614174000');
                const accountId2 = AccountId.fromString('222e4567-e89b-12d3-a456-426614174000');
                const username1 = Username.fromString('user1');
                const username2 = Username.fromString('user2');
                
                const command1 = new UpdateUsernameCommand(accountId1, username1);
                const command2 = new UpdateUsernameCommand(accountId2, username2);
                
                const mockAccount1 = { updateUsername: jest.fn() } as any;
                const mockAccount2 = { updateUsername: jest.fn() } as any;
                
                mockReadRepository.getById
                    .mockResolvedValueOnce(mockAccount1)
                    .mockResolvedValueOnce(mockAccount2);

                await Promise.all([
                    handler.execute(command1),
                    handler.execute(command2)
                ]);

                expect(mockReadRepository.getById).toHaveBeenCalledTimes(2);
                expect(mockWriteRepository.save).toHaveBeenCalledTimes(2);
                expect(mockAccount1.updateUsername).toHaveBeenCalledWith(username1);
                expect(mockAccount2.updateUsername).toHaveBeenCalledWith(username2);
            });
        });
    });
});
