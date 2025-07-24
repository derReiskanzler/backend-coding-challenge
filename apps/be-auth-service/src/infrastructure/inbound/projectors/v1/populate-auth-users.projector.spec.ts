import { Test, TestingModule } from '@nestjs/testing';
import { Logger } from '@nestjs/common';
import { PopulateAuthUsersProjector } from './populate-auth-users.projector';
import { AuthUsersV1ReadmodelWriteRepository } from '../../../outbound/repository/v1/write/auth-users-readmodel-write.repository';
import { AuthUserDocument } from '../../../../application/documents/auth-user.document';
import { BaseStreamEvent, Metadata } from '@backend-monorepo/boilerplate';
import { UserSignedUpEvent, UsernameUpdatedEvent } from '@backend-monorepo/domain';

describe('PopulateAuthUsersProjector', () => {
    let projector: PopulateAuthUsersProjector;
    let mockWriteRepository: jest.Mocked<AuthUsersV1ReadmodelWriteRepository>;
    let mockLogger: jest.Mocked<Logger>;

    beforeEach(async () => {
        const mockRepository = {
            upsert: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                PopulateAuthUsersProjector,
                {
                    provide: AuthUsersV1ReadmodelWriteRepository,
                    useValue: mockRepository,
                },
            ],
        }).compile();

        projector = module.get<PopulateAuthUsersProjector>(PopulateAuthUsersProjector);
        mockWriteRepository = module.get(AuthUsersV1ReadmodelWriteRepository);

        mockLogger = {
            log: jest.fn(),
            error: jest.fn(),
            warn: jest.fn(),
            debug: jest.fn(),
            verbose: jest.fn(),
            fatal: jest.fn(),
            setContext: jest.fn(),
            localInstance: jest.fn(),
        } as any;
        (projector as any).logger = mockLogger;

        jest.clearAllMocks();
    });

    describe('handleAccountsStreamEvents', () => {
        const testEventId = '123e4567-e89b-12d3-a456-426614174000';
        const testCausationId = '123e4567-e89b-12d3-a456-426614174001';
        const testUserId = '123e4567-e89b-12d3-a456-426614174002';
        const createMockEvent = (eventName: string, payload: any): BaseStreamEvent => ({
            eventId: testEventId,
            eventName,
            payload,
            meta: {
                causationId: testCausationId,
                causationName: 'TestCommand',
            } as Metadata,
            createdAt: new Date(),
            version: 1,
        });

        describe('UserSignedUpEvent handling', () => {
            const mockPayload = {
                id: testUserId,
                username: 'testuser',
                passwordHash: 'hashed-password',
                salt: 'salt-value',
            };

            it('should handle UserSignedUpEvent successfully', async () => {
                const mockEvent = createMockEvent(UserSignedUpEvent.name, mockPayload);
                mockWriteRepository.upsert.mockResolvedValue(undefined);

                await projector.handleAccountsStreamEvents(mockEvent);

                expect(mockLogger.log).toHaveBeenCalledWith(`Received: '${UserSignedUpEvent.name}'`);
                expect(mockWriteRepository.upsert).toHaveBeenCalledWith(
                    expect.any(AuthUserDocument),
                    mockEvent.eventId,
                    mockEvent.meta
                );
                expect(mockWriteRepository.upsert).toHaveBeenCalledTimes(1);

                const calledDocument = mockWriteRepository.upsert.mock.calls[0][0] as AuthUserDocument;
                expect(calledDocument.id).toBe(mockPayload.id);
                expect(calledDocument.username).toBe(mockPayload.username);
            });

            it('should propagate errors from repository', async () => {
                const mockEvent = createMockEvent(UserSignedUpEvent.name, mockPayload);
                const testError = new Error('Update failed');
                mockWriteRepository.upsert.mockRejectedValue(testError);

                await expect(projector.handleAccountsStreamEvents(mockEvent)).rejects.toThrow(
                    testError.message
                );
                expect(mockWriteRepository.upsert).toHaveBeenCalledTimes(1);
            });
        });

        describe('UsernameUpdatedEvent handling', () => {
            const mockPayload = {
                id: testUserId,
                username: 'updatedusername',
            };

            it('should handle UsernameUpdatedEvent successfully', async () => {
                const mockEvent = createMockEvent(UsernameUpdatedEvent.name, mockPayload);
                mockWriteRepository.upsert.mockResolvedValue(undefined);

                await projector.handleAccountsStreamEvents(mockEvent);

                expect(mockLogger.log).toHaveBeenCalledWith(`Received: '${UsernameUpdatedEvent.name}'`);
                expect(mockWriteRepository.upsert).toHaveBeenCalledWith(
                    expect.any(AuthUserDocument),
                    mockEvent.eventId,
                    mockEvent.meta
                );
                expect(mockWriteRepository.upsert).toHaveBeenCalledTimes(1);

                const calledDocument = mockWriteRepository.upsert.mock.calls[0][0] as AuthUserDocument;
                expect(calledDocument.id).toBe(mockPayload.id);
                expect(calledDocument.username).toBe(mockPayload.username);
            });

            it('should propagate errors from repository', async () => {
                const mockEvent = createMockEvent(UsernameUpdatedEvent.name, mockPayload);
                const testError = new Error('Update failed');
                mockWriteRepository.upsert.mockRejectedValue(testError);

                await expect(projector.handleAccountsStreamEvents(mockEvent)).rejects.toThrow(
                    testError.message
                );
                expect(mockWriteRepository.upsert).toHaveBeenCalledTimes(1);
            });
        });

        describe('unknown event handling', () => {
            it('should ignore unknown event types', async () => {
                const unknownEvent = createMockEvent('UnknownEvent', { some: 'data' });

                await projector.handleAccountsStreamEvents(unknownEvent);

                expect(mockLogger.log).not.toHaveBeenCalled();
                expect(mockWriteRepository.upsert).not.toHaveBeenCalled();
            });
        });

        describe('event metadata handling', () => {
            it('should pass complete event metadata to repository', async () => {
                const mockEvent = createMockEvent(UserSignedUpEvent.name, {
                    id: testUserId,
                    username: 'test-user',
                });
                mockEvent.meta = {
                    causationId: testCausationId,
                    causationName: 'SpecificCommand',
                };

                mockWriteRepository.upsert.mockResolvedValue(undefined);

                await projector.handleAccountsStreamEvents(mockEvent);

                expect(mockWriteRepository.upsert).toHaveBeenCalledWith(
                    expect.any(AuthUserDocument),
                    mockEvent.eventId,
                    mockEvent.meta
                );

                const calledMeta = mockWriteRepository.upsert.mock.calls[0][2];
                expect(calledMeta).toEqual({
                    causationId: testCausationId,
                    causationName: 'SpecificCommand',
                });
            });
        });

        it('should handle multiple consecutive events', async () => {
            const events = [
                createMockEvent(UserSignedUpEvent.name, { id: 'user-1', username: 'user1' }),
                createMockEvent(UsernameUpdatedEvent.name, { id: 'user-1', username: 'updateduser1' }),
                createMockEvent(UserSignedUpEvent.name, { id: 'user-2', username: 'user2' }),
            ];

            mockWriteRepository.upsert.mockResolvedValue(undefined);

            for (const event of events) {
                await projector.handleAccountsStreamEvents(event);
            }

            expect(mockWriteRepository.upsert).toHaveBeenCalledTimes(3);
            expect(mockLogger.log).toHaveBeenCalledTimes(3);
            expect(mockLogger.log).toHaveBeenNthCalledWith(1, "Received: 'UserSignedUpEvent'");
            expect(mockLogger.log).toHaveBeenNthCalledWith(2, "Received: 'UsernameUpdatedEvent'");
            expect(mockLogger.log).toHaveBeenNthCalledWith(3, "Received: 'UserSignedUpEvent'");
        });
    });
});
