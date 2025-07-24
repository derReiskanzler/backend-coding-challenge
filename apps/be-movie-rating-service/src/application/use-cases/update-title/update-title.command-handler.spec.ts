import { MovieRatingId, Title } from '@backend-monorepo/domain';
import { UpdateTitleCommand } from './update-title.command';
import { UpdateTitleCommandHandler } from './update-title.command-handler';
import { MovieRatingRepositoryInterface } from './movie-rating.repository.interface';
import { MovieRatingReadRepositoryInterface } from './movie-rating-read.repository.interface';
import { MovieRatingNotFoundException } from '../../exceptions/movie-rating-not-found.exception';
import { MovieRating } from '../../../domain/aggregates/movie-rating.aggregate';

describe('UpdateTitleCommandHandler', () => {
    let handler: UpdateTitleCommandHandler;
    let mockWriteRepository: jest.Mocked<MovieRatingRepositoryInterface>;
    let mockReadRepository: jest.Mocked<MovieRatingReadRepositoryInterface>;

    beforeEach(() => {
        mockWriteRepository = {
            save: jest.fn(),
        };
        mockReadRepository = {
            getById: jest.fn(),
        };

        handler = new UpdateTitleCommandHandler(
            mockReadRepository,
            mockWriteRepository,
        );
    });

    describe('execute', () => {
        const movieRatingId = MovieRatingId.fromString('123e4567-e89b-12d3-a456-426614174000');
        const oldTitle = Title.fromString('old.title');
        const newTitle = Title.fromString('new.title');
        const validCommand = new UpdateTitleCommand(movieRatingId, newTitle);

        describe('when movie rating exists', () => {
            let mockMovieRating: jest.Mocked<MovieRating>;

            beforeEach(() => {
                mockMovieRating = {
                    updateTitle: jest.fn(),
                    getState: jest.fn().mockReturnValue({
                        getTitle: () => oldTitle.toString(),
                    }),
                    getPendingEvents: jest.fn().mockReturnValue([]),
                } as any;
                mockReadRepository.getById.mockResolvedValue(mockMovieRating);
            });

            it('should update title successfully', async () => {
                await handler.execute(validCommand);

                expect(mockReadRepository.getById).toHaveBeenCalledWith(movieRatingId.toString());
                expect(mockMovieRating.updateTitle).toHaveBeenCalledWith(newTitle);
                expect(mockWriteRepository.save).toHaveBeenCalledWith(mockMovieRating, validCommand);
            });

            it('should call updateTitle with correct parameters', async () => {
                await handler.execute(validCommand);

                expect(mockMovieRating.updateTitle).toHaveBeenCalledTimes(1);
                expect(mockMovieRating.updateTitle).toHaveBeenCalledWith(newTitle);
            });

            it('should save the movie rating with command after updating title', async () => {
                await handler.execute(validCommand);

                expect(mockWriteRepository.save).toHaveBeenCalledTimes(1);
                expect(mockWriteRepository.save).toHaveBeenCalledWith(mockMovieRating, validCommand);
            });

            it('should handle same title update', async () => {
                const sameTitleCommand = new UpdateTitleCommand(movieRatingId, oldTitle);
                mockMovieRating.getState.mockReturnValue({
                    getTitle: () => oldTitle.toString(),
                } as any);

                await handler.execute(sameTitleCommand);

                expect(mockMovieRating.updateTitle).toHaveBeenCalledWith(oldTitle);
                expect(mockWriteRepository.save).toHaveBeenCalledWith(mockMovieRating, sameTitleCommand);
            });
        });

        describe('when movie rating does not exist', () => {
            beforeEach(() => {
                mockReadRepository.getById.mockResolvedValue(null);
            });

            it('should throw not found exception with correct id', async () => {
                await expect(handler.execute(validCommand)).rejects.toThrow(
                    MovieRatingNotFoundException.withId(movieRatingId.toString())
                );
            });

            it('should call read repository before throwing exception', async () => {
                try {
                    await handler.execute(validCommand);
                    expect(true).toBe(false);
                } catch (error: any) {
                    expect(error).toBeInstanceOf(MovieRatingNotFoundException);
                    expect(mockReadRepository.getById).toHaveBeenCalledWith(movieRatingId.toString());
                    expect(mockWriteRepository.save).not.toHaveBeenCalled();
                }
            });

            it('should not call write repository when movie rating not found', async () => {
                try {
                    await handler.execute(validCommand);
                    expect(true).toBe(false);
                } catch (error: any) {
                    expect(error).toBeInstanceOf(MovieRatingNotFoundException);
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
                const mockMovieRating = {
                    updateTitle: jest.fn(),
                } as any;
                mockReadRepository.getById.mockResolvedValue(mockMovieRating);
                mockWriteRepository.save.mockRejectedValue(new Error('Failed to save movie rating') as never);

                await expect(handler.execute(validCommand)).rejects.toThrow('Failed to save movie rating');
                expect(mockReadRepository.getById).toHaveBeenCalledTimes(1);
                expect(mockMovieRating.updateTitle).toHaveBeenCalledTimes(1);
                expect(mockWriteRepository.save).toHaveBeenCalledTimes(1);
            });
        });

        describe('edge cases', () => {
            it('should handle undefined movie rating from repository', async () => {
                mockReadRepository.getById.mockResolvedValue(undefined as any);

                await expect(handler.execute(validCommand)).rejects.toThrow(
                    MovieRatingNotFoundException.withId(movieRatingId.toString())
                );
            });

            it('should handle concurrent title updates for different movie ratings', async () => {
                const movieRatingId1 = MovieRatingId.fromString('111e4567-e89b-12d3-a456-426614174000');
                const movieRatingId2 = MovieRatingId.fromString('222e4567-e89b-12d3-a456-426614174000');
                const title1 = Title.fromString('title1');
                const title2 = Title.fromString('title2');
                
                const command1 = new UpdateTitleCommand(movieRatingId1, title1);
                const command2 = new UpdateTitleCommand(movieRatingId2, title2);
                
                const mockMovieRating1 = { updateTitle: jest.fn() } as any;
                const mockMovieRating2 = { updateTitle: jest.fn() } as any;
                
                mockReadRepository.getById
                    .mockResolvedValueOnce(mockMovieRating1)
                    .mockResolvedValueOnce(mockMovieRating2);

                await Promise.all([
                    handler.execute(command1),
                    handler.execute(command2)
                ]);

                expect(mockReadRepository.getById).toHaveBeenCalledTimes(2);
                expect(mockWriteRepository.save).toHaveBeenCalledTimes(2);
                expect(mockMovieRating1.updateTitle).toHaveBeenCalledWith(title1);
                expect(mockMovieRating2.updateTitle).toHaveBeenCalledWith(title2);
            });
        });
    });
});
