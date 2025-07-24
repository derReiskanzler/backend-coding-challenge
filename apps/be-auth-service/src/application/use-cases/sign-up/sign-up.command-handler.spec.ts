import { Password, Username, UserSignedUpEvent } from '@backend-monorepo/domain';
import { GetUsersDocumentRepositoryInterface } from './get-users-document.repository.interface';
import { SignUpCommand } from './sign-up.command';
import { SignUpCommandHandler } from './sign-up.command-handler';
import { AccountRepositoryInterface } from './account.repository.interface';
import { Account } from '../../../domain/aggregates/account.aggregate';
import { AuthUserDocument } from '../../documents/auth-user.document';
import { AccountAlreadyExistsException } from '../../../domain/exceptions/account-already-exists.exception';


describe('SignUpCommandHandler', () => {
    let handler: SignUpCommandHandler;
    let mockWriteRepository: jest.Mocked<AccountRepositoryInterface>;
    let mockReadRepository: jest.Mocked<GetUsersDocumentRepositoryInterface>;

    beforeEach(() => {
        mockWriteRepository = {
            save: jest.fn(),
        };
        mockReadRepository = {
            getByUsername: jest.fn(),
        };

        handler = new SignUpCommandHandler(
            mockWriteRepository,
            mockReadRepository,
        );
    });

    describe('execute', () => {
        const validCommand = new SignUpCommand(
            Username.fromString('john.doe'),
            Password.fromString('ValidPW1!'),
        );

        describe('when account with username does not exist', () => {
            it('should create account successfully', async () => {
                mockReadRepository.getByUsername.mockResolvedValue(null);

                await handler.execute(validCommand);

                expect(mockReadRepository.getByUsername).toHaveBeenCalledWith(
                    validCommand.getUsername().toString()
                );
                expect(mockWriteRepository.save).toHaveBeenCalledWith(
                    expect.any(Account),
                    validCommand
                );
            });

            it('should call repository with correct username parameter', async () => {
                mockReadRepository.getByUsername.mockResolvedValue(null);

                await handler.execute(validCommand);

                expect(mockReadRepository.getByUsername).toHaveBeenCalledTimes(1);
                expect(mockReadRepository.getByUsername).toHaveBeenCalledWith(
                    validCommand.getUsername().toString()
                );
            });

            it('should create account with correct data', async () => {
                mockReadRepository.getByUsername.mockResolvedValue(null);
                let capturedAccount: Account;
                mockWriteRepository.save.mockImplementation(async (account, command) => {
                    capturedAccount = account as Account;
                });

                await handler.execute(validCommand);

                expect(capturedAccount!).toBeInstanceOf(Account);
                expect(capturedAccount!.getState().getUsername().toString()).toBe(
                    validCommand.getUsername().toString()
                );
            });

            it('should save account aggregate with sign up event', async () => {
                mockReadRepository.getByUsername.mockResolvedValue(null);
                let capturedAccount: Account;
                mockWriteRepository.save.mockImplementation(async (account, command) => {
                    capturedAccount = account as Account;
                });

                await handler.execute(validCommand);

                expect(capturedAccount!.getPendingEvents()).toHaveLength(1);
                expect(capturedAccount!.getPendingEvents()[0].getEventName()).toBe(UserSignedUpEvent.name);
            });
        });

        describe('when account with username already exists', () => {
            it('should throw exception with correct username message', async () => {
                const existingUserDocument = new AuthUserDocument(
                    '123e4567-e89b-12d3-a456-426614174000',
                    'john.doe',
                    new Date(),
                );
                mockReadRepository.getByUsername.mockResolvedValue(existingUserDocument);

                await expect(handler.execute(validCommand)).rejects.toThrow(
                    AccountAlreadyExistsException.withUsername(existingUserDocument.username)
                );
            });

            it('should not call write repository when account exists', async () => {
                const existingUserDocument = new AuthUserDocument(
                    '123e4567-e89b-12d3-a456-426614174000',
                    'john.doe',
                    new Date(),
                );
                mockReadRepository.getByUsername.mockResolvedValue(existingUserDocument);

                 try {
                    await handler.execute(validCommand);
                    expect(true).toBe(false); // Should not reach here
                 } catch (error: any) {
                    expect(error).toBeInstanceOf(AccountAlreadyExistsException);
                    expect(mockWriteRepository.save).not.toHaveBeenCalled();
                 }
            });
        });

        describe('repository error handling', () => {
            it('should propagate read repository errors', async () => {
                mockReadRepository.getByUsername.mockRejectedValue(new Error('Database connection failed'));

                await expect(handler.execute(validCommand)).rejects.toThrow('Database connection failed');
            });

            it('should propagate write repository errors', async () => {
                mockReadRepository.getByUsername.mockResolvedValue(null);
                mockWriteRepository.save.mockRejectedValue(new Error('Failed to save account') as never);

                await expect(handler.execute(validCommand)).rejects.toThrow('Failed to save account');
            });

            it('should call read repository before attempting write', async () => {
                mockReadRepository.getByUsername.mockResolvedValue(null);
                mockWriteRepository.save.mockRejectedValue(new Error('Save failed') as never);

                await expect(handler.execute(validCommand)).rejects.toThrow('Save failed');
                expect(mockReadRepository.getByUsername).toHaveBeenCalledTimes(1);
                expect(mockWriteRepository.save).toHaveBeenCalledTimes(1);
            });
        });

        describe('edge cases', () => {
            it('should handle empty username search result', async () => {
                mockReadRepository.getByUsername.mockResolvedValue(undefined as any);

                await handler.execute(validCommand);

                expect(mockWriteRepository.save).toHaveBeenCalledWith(
                    expect.any(Account),
                    validCommand
                );
            });

            it('should handle concurrent sign up', async () => {
                mockReadRepository.getByUsername.mockResolvedValue(null);
                
                const commands = [
                    new SignUpCommand(
                        Username.fromString('user1'),
                        Password.fromString('ValidPW1!'),
                    ),
                    new SignUpCommand(
                        Username.fromString('user2'),
                        Password.fromString('ValidPW2!'),
                    ),
                ];

                const results = await Promise.all(
                    commands.map(command => handler.execute(command))
                );

                expect(results).toHaveLength(2);
                expect(mockWriteRepository.save).toHaveBeenCalledTimes(2);
            });
        });
    });
}); 