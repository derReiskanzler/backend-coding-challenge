import { Test, TestingModule } from '@nestjs/testing';
import { AUTH_SERVICE, AuthenticatedUser, CommandBusService } from '@backend-monorepo/boilerplate';
import { MovieRatingId, Title } from '@backend-monorepo/domain';
import { UpdateTitleV1Action } from './update-title.action';
import { of } from 'rxjs';
import { UpdateTitleCommand } from '../../../../../../application/use-cases/update-title/update-title.command';
import { OwnMovieRatingGuard } from '../../../../../utils/guards/own-movie-rating.guard';
import { MovieRatingV1ReadmodelReadRepository } from '../../../../../outbound/repository/v1/read/movie-rating-readmodel-read.repository';

describe('UpdateTitleV1Action', () => {
    let action: UpdateTitleV1Action;
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
            controllers: [UpdateTitleV1Action],
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

        action = module.get<UpdateTitleV1Action>(UpdateTitleV1Action);
        mockCommandBus = module.get(CommandBusService);

        jest.clearAllMocks();
    });

    describe('index', () => {
        const validMovieRatingId = '123e4567-e89b-12d3-a456-426614174000';
        const validTitle = 'newtitle';

        it('should update title successfully', async () => {
            mockCommandBus.dispatch.mockResolvedValue(undefined);

            await action.index(validMovieRatingId, validTitle);

            expect(mockCommandBus.dispatch).toHaveBeenCalledWith(
                expect.any(UpdateTitleCommand)
            );
            expect(mockCommandBus.dispatch).toHaveBeenCalledTimes(1);
        });

        it('should create UpdateTitleCommand with correct parameters', async () => {
            mockCommandBus.dispatch.mockResolvedValue(undefined);

            await action.index(validMovieRatingId, validTitle);

            const dispatchedCommand = mockCommandBus.dispatch.mock.calls[0][0] as UpdateTitleCommand;
            expect(dispatchedCommand).toBeInstanceOf(UpdateTitleCommand);
            expect(dispatchedCommand.getId()).toBeInstanceOf(MovieRatingId);
            expect(dispatchedCommand.getTitle()).toBeInstanceOf(Title);
            expect(dispatchedCommand.getId().toString()).toBe(validMovieRatingId);
            expect(dispatchedCommand.getTitle().toString()).toBe(validTitle);
        });

        it('should propagate errors from command bus', async () => {
            const errorMsg = 'Movie rating not found';
            mockCommandBus.dispatch.mockRejectedValue(new Error(errorMsg));

            await expect(action.index(validMovieRatingId, validTitle)).rejects.toThrow(
                errorMsg
            );

            expect(mockCommandBus.dispatch).toHaveBeenCalledTimes(1);
        });

        it('should handle movie rating not found error', async () => {
            const errorMsg = 'Movie rating not found';
            mockCommandBus.dispatch.mockRejectedValue(new Error(errorMsg));

            await expect(action.index(validMovieRatingId, validTitle)).rejects.toThrow(
                errorMsg
            );

            expect(mockCommandBus.dispatch).toHaveBeenCalledWith(expect.any(UpdateTitleCommand));
        });

        it('should return void when command succeeds', async () => {
            mockCommandBus.dispatch.mockResolvedValue(undefined);

            const result = await action.index(validMovieRatingId, validTitle);

            expect(result).toBeUndefined();
        });

        it('should handle multiple consecutive requests for different movie ratings', async () => {
            const requests = [
                { id: '111e4567-e89b-12d3-a456-426614174111', title: 'title1' },
                { id: '222e4567-e89b-12d3-a456-426614174222', title: 'title2' },
                { id: '333e4567-e89b-12d3-a456-426614174333', title: 'title3' },
            ];

            for (let i = 0; i < requests.length; i++) {
                mockCommandBus.dispatch.mockResolvedValue(undefined);

                await action.index(requests[i].id, requests[i].title);

                expect(mockCommandBus.dispatch).toHaveBeenCalledWith(expect.any(UpdateTitleCommand));
            }

            expect(mockCommandBus.dispatch).toHaveBeenCalledTimes(3);
        });

        it('should handle multiple consecutive requests for the same movie rating', async () => {
            const requests = [
                { id: '111e4567-e89b-12d3-a456-426614174111', title: 'title1' },
                { id: '111e4567-e89b-12d3-a456-426614174111', title: 'title2' },
                { id: '111e4567-e89b-12d3-a456-426614174111', title: 'title3' },
            ];

            for (let i = 0; i < requests.length; i++) {
                mockCommandBus.dispatch.mockResolvedValue(undefined);

                await action.index(requests[i].id, requests[i].title);

                expect(mockCommandBus.dispatch).toHaveBeenCalledWith(expect.any(UpdateTitleCommand));
            }

            expect(mockCommandBus.dispatch).toHaveBeenCalledTimes(3);
        });
    });
});
