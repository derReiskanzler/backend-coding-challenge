import { Test, TestingModule } from '@nestjs/testing';
import { Logger } from '@nestjs/common';
import { PopulateMovieRatingMovieRatingsProjector } from './populate-movie-rating-movie-ratings.projector';
import { MovieRatingMovieRatingsV1ReadmodelWriteRepository } from '../../../outbound/repository/v1/write/movie-rating-movie-ratings-readmodel-write.repository';
import { MovieRatingDocument } from '../../../../application/documents/movie-rating.document';
import { BaseStreamEvent, Metadata } from '@backend-monorepo/boilerplate';
import { MovieRatingCreatedEvent } from '@backend-monorepo/domain';

describe('PopulateMovieRatingMovieRatingsProjector', () => {
    let projector: PopulateMovieRatingMovieRatingsProjector;
    let mockWriteRepository: jest.Mocked<MovieRatingMovieRatingsV1ReadmodelWriteRepository>;
    let mockLogger: jest.Mocked<Logger>;

    beforeEach(async () => {
        const mockRepository = {
            upsert: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                PopulateMovieRatingMovieRatingsProjector,
                {
                    provide: MovieRatingMovieRatingsV1ReadmodelWriteRepository,
                    useValue: mockRepository,
                },
            ],
        }).compile();

        projector = module.get<PopulateMovieRatingMovieRatingsProjector>(PopulateMovieRatingMovieRatingsProjector);
        mockWriteRepository = module.get(MovieRatingMovieRatingsV1ReadmodelWriteRepository);

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

    describe('handleMovieRatingMovieRatingsStreamEvents', () => {
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

        describe('MovieRatingCreatedEvent handling', () => {
            const mockPayload = {
                id: testUserId,
                title: 'testtitle',
                description: 'testdescription',
                stars: 5,
                accountId: 'testaccountId',
            };

            it('should handle MovieRatingCreatedEvent successfully', async () => {
                const mockEvent = createMockEvent(MovieRatingCreatedEvent.name, mockPayload);
                mockWriteRepository.upsert.mockResolvedValue(undefined);

                await projector.handleMovieRatingMovieRatingsStreamEvents(mockEvent);

                expect(mockLogger.log).toHaveBeenCalledWith(`Received: '${MovieRatingCreatedEvent.name}'`);
                expect(mockWriteRepository.upsert).toHaveBeenCalledWith(
                    expect.any(MovieRatingDocument),
                    mockEvent.eventId,
                    mockEvent.meta
                );
                expect(mockWriteRepository.upsert).toHaveBeenCalledTimes(1);

                const calledDocument = mockWriteRepository.upsert.mock.calls[0][0] as MovieRatingDocument;
                expect(calledDocument.id).toBe(mockPayload.id);
                expect(calledDocument.title).toBe(mockPayload.title);
                expect(calledDocument.description).toBe(mockPayload.description);
                expect(calledDocument.stars).toBe(mockPayload.stars);
                expect(calledDocument.accountId).toBe(mockPayload.accountId);
            });

            it('should propagate errors from repository', async () => {
                const mockEvent = createMockEvent(MovieRatingCreatedEvent.name, mockPayload);
                const testError = new Error('Update failed');
                mockWriteRepository.upsert.mockRejectedValue(testError);

                await expect(projector.handleMovieRatingMovieRatingsStreamEvents(mockEvent)).rejects.toThrow(
                    testError.message
                );
                expect(mockWriteRepository.upsert).toHaveBeenCalledTimes(1);
            });
        });

        describe('unknown event handling', () => {
            it('should ignore unknown event types', async () => {
                const unknownEvent = createMockEvent('UnknownEvent', { some: 'data' });

                await projector.handleMovieRatingMovieRatingsStreamEvents(unknownEvent);

                expect(mockLogger.log).not.toHaveBeenCalled();
                expect(mockWriteRepository.upsert).not.toHaveBeenCalled();
            });
        });

        describe('event metadata handling', () => {
            it('should pass complete event metadata to repository', async () => {
                const mockEvent = createMockEvent(MovieRatingCreatedEvent.name, {
                    id: testUserId,
                    title: 'test-title',
                    description: 'test-description',
                    stars: 5,
                    accountId: 'test-accountId',
                });
                mockEvent.meta = {
                    causationId: testCausationId,
                    causationName: 'SpecificCommand',
                };

                mockWriteRepository.upsert.mockResolvedValue(undefined);

                await projector.handleMovieRatingMovieRatingsStreamEvents(mockEvent);

                expect(mockWriteRepository.upsert).toHaveBeenCalledWith(
                    expect.any(MovieRatingDocument),
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
    });
});
