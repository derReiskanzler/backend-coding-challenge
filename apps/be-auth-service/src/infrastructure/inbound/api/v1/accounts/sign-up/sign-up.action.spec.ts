import { Test, TestingModule } from '@nestjs/testing';
import { Response } from 'express';
import { SignUpV1Action } from './sign-up.action';
import { CommandBusService } from '@backend-monorepo/boilerplate';
import { SignUpDto } from '../../../dtos/request/sign-up.dto';
import { SignUpCommand } from '../../../../../../application/use-cases/sign-up/sign-up.command';
import { Username, Password } from '@backend-monorepo/domain';

describe('SignUpV1Action', () => {
    let action: SignUpV1Action;
    let mockCommandBus: jest.Mocked<CommandBusService>;
    let mockResponse: jest.Mocked<Response>;

    beforeEach(async () => {
        const mockCommandBusService = {
            dispatch: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            controllers: [SignUpV1Action],
            providers: [
                {
                    provide: CommandBusService,
                    useValue: mockCommandBusService,
                },
            ],
        }).compile();

        action = module.get<SignUpV1Action>(SignUpV1Action);
        mockCommandBus = module.get(CommandBusService);

        mockResponse = {
            setHeader: jest.fn(),
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        } as any;

        jest.clearAllMocks();
    });

    describe('index', () => {
        const validDto: SignUpDto = {
            username: 'testuser',
            password: 'ValidPass123!',
        };

        const mockAccountId = '123e4567-e89b-12d3-a456-426614174000';

        it('should create account successfully', async () => {
            mockCommandBus.dispatch.mockResolvedValue(mockAccountId);

            await action.index(validDto, mockResponse);

            expect(mockCommandBus.dispatch).toHaveBeenCalledWith(
                expect.any(SignUpCommand)
            );
            expect(mockCommandBus.dispatch).toHaveBeenCalledTimes(1);

            expect(mockResponse.setHeader).toHaveBeenCalledWith('id', mockAccountId);
            expect(mockResponse.status).toHaveBeenCalledWith(201);
            expect(mockResponse.json).toHaveBeenCalledWith({
                message: 'Account created successfully'
            });
        });

        it('should create SignUpCommand with correct parameters', async () => {
            mockCommandBus.dispatch.mockResolvedValue(mockAccountId);

            await action.index(validDto, mockResponse);

            const dispatchedCommand = mockCommandBus.dispatch.mock.calls[0][0] as SignUpCommand;
            expect(dispatchedCommand).toBeInstanceOf(SignUpCommand);
            expect(dispatchedCommand.getUsername()).toBeInstanceOf(Username);
            expect(dispatchedCommand.getPassword()).toBeInstanceOf(Password);
            expect(dispatchedCommand.getUsername().toString()).toBe('testuser');
            expect(dispatchedCommand.getPassword().toString()).toBe('ValidPass123!');
        });

        it('should set response headers and status correctly', async () => {
            const customAccountId = '987e4567-e89b-12d3-a456-426514174999';
            mockCommandBus.dispatch.mockResolvedValue(customAccountId);

            await action.index(validDto, mockResponse);

            expect(mockResponse.setHeader).toHaveBeenCalledWith('id', customAccountId);
            expect(mockResponse.status).toHaveBeenCalledWith(201);
            expect(mockResponse.json).toHaveBeenCalledWith({
                message: 'Account created successfully'
            });
        });

        it('should handle different valid usernames and passwords', async () => {
            const testCases = [
                { username: 'user.with.dots', password: 'AnotherValid1!' },
                { username: 'user_with_underscores', password: 'SecurePass2@' },
                { username: 'UserWithCamelCase', password: 'MyPassword3#' },
            ];

            for (const testCase of testCases) {
                mockCommandBus.dispatch.mockResolvedValue(mockAccountId);

                await action.index(testCase, mockResponse);

                const dispatchedCommand = mockCommandBus.dispatch.mock.calls[
                    mockCommandBus.dispatch.mock.calls.length - 1
                ][0] as SignUpCommand;
                expect(dispatchedCommand.getUsername().toString()).toBe(testCase.username);
                expect(dispatchedCommand.getPassword().toString()).toBe(testCase.password);
            }
        });

        it('should propagate errors from command bus', async () => {
            const errorMsg = 'Account already exists';
            mockCommandBus.dispatch.mockRejectedValue(new Error(errorMsg));

            await expect(action.index(validDto, mockResponse)).rejects.toThrow(
                errorMsg
            );

            expect(mockCommandBus.dispatch).toHaveBeenCalledTimes(1);
            expect(mockResponse.setHeader).not.toHaveBeenCalled();
            expect(mockResponse.status).not.toHaveBeenCalled();
            expect(mockResponse.json).not.toHaveBeenCalled();
        });

        it('should not call response methods when command fails', async () => {
            mockCommandBus.dispatch.mockRejectedValue(new Error('Command failed'));

            try {
                await action.index(validDto, mockResponse);
            } catch (error) {
                // Expected to throw
            }

            expect(mockResponse.setHeader).not.toHaveBeenCalled();
            expect(mockResponse.status).not.toHaveBeenCalled();
            expect(mockResponse.json).not.toHaveBeenCalled();
        });
    });

    describe('response handling', () => {
        const testUserId = '123e4567-e89b-12d3-a456-426614174000';
        const validDto: SignUpDto = {
            username: 'testuser',
            password: 'ValidPass123!',
        };

        it('should return void from index method', async () => {
            mockCommandBus.dispatch.mockResolvedValue(testUserId);

            const result = await action.index(validDto, mockResponse);

            expect(result).toBeUndefined();
        });
    });

    it('should handle multiple consecutive requests', async () => {
        const requests = [
            { username: 'user1', password: 'Password1!' },
            { username: 'user2', password: 'Password2@' },
            { username: 'user3', password: 'Password3#' },
        ];
        const accountIds = ['id-1', 'id-2', 'id-3'];

        for (let i = 0; i < requests.length; i++) {
            mockCommandBus.dispatch.mockResolvedValue(accountIds[i]);

            await action.index(requests[i], mockResponse);

            expect(mockCommandBus.dispatch).toHaveBeenCalledWith(expect.any(SignUpCommand));
            expect(mockResponse.setHeader).toHaveBeenCalledWith('id', accountIds[i]);
        }

        expect(mockCommandBus.dispatch).toHaveBeenCalledTimes(3);
        expect(mockResponse.setHeader).toHaveBeenCalledTimes(3);
        expect(mockResponse.status).toHaveBeenCalledTimes(3);
        expect(mockResponse.json).toHaveBeenCalledTimes(3);
    });
});
