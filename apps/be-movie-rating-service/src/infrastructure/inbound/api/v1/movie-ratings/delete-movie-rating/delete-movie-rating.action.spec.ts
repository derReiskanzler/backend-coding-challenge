import { Test, TestingModule } from '@nestjs/testing';
import { AUTH_SERVICE, AuthenticatedUser, CommandBusService } from '@backend-monorepo/boilerplate';
import { MovieRatingId } from '@backend-monorepo/domain';
import { DeleteMovieRatingV1Action } from './delete-movie-rating.action';
import { of } from 'rxjs';
import { OwnMovieRatingGuard } from '../../../../../utils/guards/own-movie-rating.guard';
import { MovieRatingV1ReadmodelReadRepository } from '../../../../../outbound/repository/v1/read/movie-rating-readmodel-read.repository';
import { DeleteMovieRatingCommand } from '../../../../../../application/use-cases/delete-movie-rating/delete-movie-rating.command';

describe('DeleteMovieRatingV1Action', () => {
    let action: DeleteMovieRatingV1Action;
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
            controllers: [DeleteMovieRatingV1Action],
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

        action = module.get<DeleteMovieRatingV1Action>(DeleteMovieRatingV1Action);
        mockCommandBus = module.get(CommandBusService);

        jest.clearAllMocks();
    });

    describe('index', () => {
        const validMovieRatingId = '123e4567-e89b-12d3-a456-426614174000';

        it('should delete movie rating successfully', async () => {
            mockCommandBus.dispatch.mockResolvedValue(undefined);

            await action.index(validMovieRatingId);

            expect(mockCommandBus.dispatch).toHaveBeenCalledWith(
                expect.any(DeleteMovieRatingCommand)
            );
            expect(mockCommandBus.dispatch).toHaveBeenCalledTimes(1);
        });

        it('should create DeleteMovieRatingCommand with correct parameters', async () => {
            mockCommandBus.dispatch.mockResolvedValue(undefined);

            await action.index(validMovieRatingId);

            const dispatchedCommand = mockCommandBus.dispatch.mock.calls[0][0] as DeleteMovieRatingCommand;
            expect(dispatchedCommand).toBeInstanceOf(DeleteMovieRatingCommand);
            expect(dispatchedCommand.getId()).toBeInstanceOf(MovieRatingId);
            expect(dispatchedCommand.getId().toString()).toBe(validMovieRatingId);
        });

        it('should propagate errors from command bus', async () => {
            const errorMsg = 'Movie rating not found';
            mockCommandBus.dispatch.mockRejectedValue(new Error(errorMsg));

            await expect(action.index(validMovieRatingId)).rejects.toThrow(
                errorMsg
            );

            expect(mockCommandBus.dispatch).toHaveBeenCalledTimes(1);
        });

        it('should handle movie rating not found error', async () => {
            const errorMsg = 'Movie rating not found';
            mockCommandBus.dispatch.mockRejectedValue(new Error(errorMsg));

            await expect(action.index(validMovieRatingId)).rejects.toThrow(
                errorMsg
            );

            expect(mockCommandBus.dispatch).toHaveBeenCalledWith(expect.any(DeleteMovieRatingCommand));
        });

        it('should return void when command succeeds', async () => {
            mockCommandBus.dispatch.mockResolvedValue(undefined);

            const result = await action.index(validMovieRatingId);

            expect(result).toBeUndefined();
        });

        it('should handle multiple consecutive requests for different movie ratings', async () => {
            const requests = [
                { id: '111e4567-e89b-12d3-a456-426614174111' },
                { id: '222e4567-e89b-12d3-a456-426614174222' },
                { id: '333e4567-e89b-12d3-a456-426614174333' },
            ];

            for (let i = 0; i < requests.length; i++) {
                mockCommandBus.dispatch.mockResolvedValue(undefined);

                await action.index(requests[i].id);

                expect(mockCommandBus.dispatch).toHaveBeenCalledWith(expect.any(DeleteMovieRatingCommand));
            }

            expect(mockCommandBus.dispatch).toHaveBeenCalledTimes(3);
        });
    });
});
