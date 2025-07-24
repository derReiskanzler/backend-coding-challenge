import { Test, TestingModule } from '@nestjs/testing';
import { UpdateUsernameV1Action } from './update-username.action';
import { CommandBusService } from '@backend-monorepo/boilerplate';
import { UpdateUsernameCommand } from '../../../../../../application/use-cases/update-username/update-username.command';
import { AccountId, Username } from '@backend-monorepo/domain';

describe('UpdateUsernameV1Action', () => {
    let action: UpdateUsernameV1Action;
    let mockCommandBus: jest.Mocked<CommandBusService>;

    beforeEach(async () => {
        const mockCommandBusService = {
            dispatch: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            controllers: [UpdateUsernameV1Action],
            providers: [
                {
                    provide: CommandBusService,
                    useValue: mockCommandBusService,
                },
            ],
        }).compile();

        action = module.get<UpdateUsernameV1Action>(UpdateUsernameV1Action);
        mockCommandBus = module.get(CommandBusService);

        jest.clearAllMocks();
    });

    describe('index', () => {
        const validAccountId = '123e4567-e89b-12d3-a456-426614174000';
        const validUsername = 'newusername';

        it('should update username successfully', async () => {
            mockCommandBus.dispatch.mockResolvedValue(undefined);

            await action.index(validAccountId, {username: validUsername});

            expect(mockCommandBus.dispatch).toHaveBeenCalledWith(
                expect.any(UpdateUsernameCommand)
            );
            expect(mockCommandBus.dispatch).toHaveBeenCalledTimes(1);
        });

        it('should create UpdateUsernameCommand with correct parameters', async () => {
            mockCommandBus.dispatch.mockResolvedValue(undefined);

            await action.index(validAccountId, {username: validUsername});

            const dispatchedCommand = mockCommandBus.dispatch.mock.calls[0][0] as UpdateUsernameCommand;
            expect(dispatchedCommand).toBeInstanceOf(UpdateUsernameCommand);
            expect(dispatchedCommand.getId()).toBeInstanceOf(AccountId);
            expect(dispatchedCommand.getUsername()).toBeInstanceOf(Username);
            expect(dispatchedCommand.getId().toString()).toBe(validAccountId);
            expect(dispatchedCommand.getUsername().toString()).toBe(validUsername);
        });

        it('should propagate errors from command bus', async () => {
            const errorMsg = 'Username already exists';
            mockCommandBus.dispatch.mockRejectedValue(new Error(errorMsg));

            await expect(action.index(validAccountId, {username: validUsername})).rejects.toThrow(
                errorMsg
            );

            expect(mockCommandBus.dispatch).toHaveBeenCalledTimes(1);
        });

        it('should handle account not found error', async () => {
            const errorMsg = 'Account not found';
            mockCommandBus.dispatch.mockRejectedValue(new Error(errorMsg));

            await expect(action.index(validAccountId, {username: validUsername})).rejects.toThrow(
                errorMsg
            );

            expect(mockCommandBus.dispatch).toHaveBeenCalledWith(expect.any(UpdateUsernameCommand));
        });

        it('should return void when command succeeds', async () => {
            mockCommandBus.dispatch.mockResolvedValue(undefined);

            const result = await action.index(validAccountId, {username: validUsername});

            expect(result).toBeUndefined();
        });

        it('should handle multiple consecutive requests for different accounts', async () => {
            const requests = [
                { id: '111e4567-e89b-12d3-a456-426614174111', username: 'user1' },
                { id: '222e4567-e89b-12d3-a456-426614174222', username: 'user2' },
                { id: '333e4567-e89b-12d3-a456-426614174333', username: 'user3' },
            ];

            for (let i = 0; i < requests.length; i++) {
                mockCommandBus.dispatch.mockResolvedValue(undefined);

                await action.index(requests[i].id, {username: requests[i].username});

                expect(mockCommandBus.dispatch).toHaveBeenCalledWith(expect.any(UpdateUsernameCommand));
            }

            expect(mockCommandBus.dispatch).toHaveBeenCalledTimes(3);
        });

        it('should handle multiple consecutive requests for the same account', async () => {
            const requests = [
                { id: '111e4567-e89b-12d3-a456-426614174111', username: 'user1' },
                { id: '111e4567-e89b-12d3-a456-426614174111', username: 'user2' },
                { id: '111e4567-e89b-12d3-a456-426614174111', username: 'user3' },
            ];

            for (let i = 0; i < requests.length; i++) {
                mockCommandBus.dispatch.mockResolvedValue(undefined);

                await action.index(requests[i].id, {username: requests[i].username});

                expect(mockCommandBus.dispatch).toHaveBeenCalledWith(expect.any(UpdateUsernameCommand));
            }

            expect(mockCommandBus.dispatch).toHaveBeenCalledTimes(3);
        });
    });
});
