import { Test, TestingModule } from '@nestjs/testing';
import { AUTH_SERVICE, AuthenticatedUser, CommandBusService } from '@backend-monorepo/boilerplate';
import { MovieRatingId, MovieRatingStars } from '@backend-monorepo/domain';
import { UpdateStarsV1Action } from './update-stars.action';
import { of } from 'rxjs';
import { OwnMovieRatingGuard } from '../../../../../utils/guards/own-movie-rating.guard';
import { MovieRatingV1ReadmodelReadRepository } from '../../../../../outbound/repository/v1/read/movie-rating-readmodel-read.repository';
import { UpdateStarsCommand } from '../../../../../../application/use-cases/update-stars/update-stars.command';

describe('UpdateStarsV1Action', () => {
    let action: UpdateStarsV1Action;
    let mockCommandBus: jest.Mocked<CommandBusService>;

    const mockUser: AuthenticatedUser = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        username: 'testuser',
    };
    
    beforeEach(async () => {
        const mockCommandBusService = {
            dispatch: jest.fn(),
        };

        const mockAuthService = {
            send: jest.fn().mockReturnValue(of(mockUser)),
        };

        const mockMovieRatingReadRepository = {
            getById: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            controllers: [UpdateStarsV1Action],
            providers: [
                {
                    provide: CommandBusService,
                    useValue: mockCommandBusService,
                },
                {
                    provide: AUTH_SERVICE,
                    useValue: mockAuthService,
                },
                {
                    provide: MovieRatingV1ReadmodelReadRepository,
                    useValue: mockMovieRatingReadRepository,
                },
                OwnMovieRatingGuard, // Add the guard as a provider
            ],
        }).compile();

        action = module.get<UpdateStarsV1Action>(UpdateStarsV1Action);
        mockCommandBus = module.get(CommandBusService);

        jest.clearAllMocks();
    });

    describe('index', () => {
        const validMovieRatingId = '123e4567-e89b-12d3-a456-426614174000';
        const validStars = 5;

        it('should update stars successfully', async () => {
            mockCommandBus.dispatch.mockResolvedValue(undefined);

            await action.index(validMovieRatingId, validStars);

            expect(mockCommandBus.dispatch).toHaveBeenCalledWith(
                expect.any(UpdateStarsCommand)
            );
            expect(mockCommandBus.dispatch).toHaveBeenCalledTimes(1);
        });

        it('should create UpdateStarsCommand with correct parameters', async () => {
            mockCommandBus.dispatch.mockResolvedValue(undefined);

            await action.index(validMovieRatingId, validStars);

            const dispatchedCommand = mockCommandBus.dispatch.mock.calls[0][0] as UpdateStarsCommand;
            expect(dispatchedCommand).toBeInstanceOf(UpdateStarsCommand);
            expect(dispatchedCommand.getId()).toBeInstanceOf(MovieRatingId);
            expect(dispatchedCommand.getStars()).toBeInstanceOf(MovieRatingStars);
            expect(dispatchedCommand.getId().toString()).toBe(validMovieRatingId);
            expect(dispatchedCommand.getStars().toNumber()).toBe(validStars);
        });

        it('should propagate errors from command bus', async () => {
            const errorMsg = 'Movie rating not found';
            mockCommandBus.dispatch.mockRejectedValue(new Error(errorMsg));

            await expect(action.index(validMovieRatingId, validStars)).rejects.toThrow(
                errorMsg
            );

            expect(mockCommandBus.dispatch).toHaveBeenCalledTimes(1);
        });

        it('should handle movie rating not found error', async () => {
            const errorMsg = 'Movie rating not found';
            mockCommandBus.dispatch.mockRejectedValue(new Error(errorMsg));

            await expect(action.index(validMovieRatingId, validStars)).rejects.toThrow(
                errorMsg
            );

            expect(mockCommandBus.dispatch).toHaveBeenCalledWith(expect.any(UpdateStarsCommand));
        });

        it('should return void when command succeeds', async () => {
            mockCommandBus.dispatch.mockResolvedValue(undefined);

            const result = await action.index(validMovieRatingId, validStars);

            expect(result).toBeUndefined();
        });

        it('should handle multiple consecutive requests for different movie ratings', async () => {
            const requests = [
                { id: '111e4567-e89b-12d3-a456-426614174111', stars: 1 },
                { id: '222e4567-e89b-12d3-a456-426614174222', stars: 2 },
                { id: '333e4567-e89b-12d3-a456-426614174333', stars: 3 },
            ];

            for (let i = 0; i < requests.length; i++) {
                mockCommandBus.dispatch.mockResolvedValue(undefined);

                await action.index(requests[i].id, requests[i].stars);

                expect(mockCommandBus.dispatch).toHaveBeenCalledWith(expect.any(UpdateStarsCommand));
            }

            expect(mockCommandBus.dispatch).toHaveBeenCalledTimes(3);
        });

        it('should handle multiple consecutive requests for the same movie rating', async () => {
            const requests = [
                { id: '111e4567-e89b-12d3-a456-426614174111', stars: 1 },
                { id: '111e4567-e89b-12d3-a456-426614174111', stars: 2 },
                { id: '111e4567-e89b-12d3-a456-426614174111', stars: 3 },
            ];

            for (let i = 0; i < requests.length; i++) {
                mockCommandBus.dispatch.mockResolvedValue(undefined);

                await action.index(requests[i].id, requests[i].stars);

                expect(mockCommandBus.dispatch).toHaveBeenCalledWith(expect.any(UpdateStarsCommand));
            }

            expect(mockCommandBus.dispatch).toHaveBeenCalledTimes(3);
        });
    });
});
