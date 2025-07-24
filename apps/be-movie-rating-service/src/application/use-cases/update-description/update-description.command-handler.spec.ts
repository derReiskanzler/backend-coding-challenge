import { Description, MovieRatingId, Title } from '@backend-monorepo/domain';
import { UpdateDescriptionCommand } from './update-description.command';
import { UpdateDescriptionCommandHandler } from './update-description.command-handler';
import { MovieRatingRepositoryInterface } from './movie-rating.repository.interface';
import { MovieRatingReadRepositoryInterface } from './movie-rating-read.repository.interface';
import { MovieRatingNotFoundException } from '../../exceptions/movie-rating-not-found.exception';
import { MovieRating } from '../../../domain/aggregates/movie-rating.aggregate';

describe('UpdateDescriptionCommandHandler', () => {
    let handler: UpdateDescriptionCommandHandler;
    let mockWriteRepository: jest.Mocked<MovieRatingRepositoryInterface>;
    let mockReadRepository: jest.Mocked<MovieRatingReadRepositoryInterface>;

    beforeEach(() => {
        mockWriteRepository = {
            save: jest.fn(),
        };
        mockReadRepository = {
            getById: jest.fn(),
        };

        handler = new UpdateDescriptionCommandHandler(
            mockReadRepository,
            mockWriteRepository,
        );
    });

    describe('execute', () => {
        const movieRatingId = MovieRatingId.fromString('123e4567-e89b-12d3-a456-426614174000');
        const oldDescription = Description.fromString('old.description');
        const newDescription = Description.fromString('new.description');
        const validCommand = new UpdateDescriptionCommand(movieRatingId, newDescription);

        describe('when movie rating exists', () => {
            let mockMovieRating: jest.Mocked<MovieRating>;

            beforeEach(() => {
                mockMovieRating = {
                    updateDescription: jest.fn(),
                    getState: jest.fn().mockReturnValue({
                        getDescription: () => oldDescription.toString(),
                    }),
                    getPendingEvents: jest.fn().mockReturnValue([]),
                } as any;
                mockReadRepository.getById.mockResolvedValue(mockMovieRating);
            });

            it('should update description successfully', async () => {
                await handler.execute(validCommand);

                expect(mockReadRepository.getById).toHaveBeenCalledWith(movieRatingId.toString());
                expect(mockMovieRating.updateDescription).toHaveBeenCalledWith(newDescription);
                expect(mockWriteRepository.save).toHaveBeenCalledWith(mockMovieRating, validCommand);
            });

            it('should call updateDescription with correct parameters', async () => {
                await handler.execute(validCommand);

                expect(mockMovieRating.updateDescription).toHaveBeenCalledTimes(1);
                expect(mockMovieRating.updateDescription).toHaveBeenCalledWith(newDescription);
            });

            it('should save the movie rating with command after updating description', async () => {
                await handler.execute(validCommand);

                expect(mockWriteRepository.save).toHaveBeenCalledTimes(1);
                expect(mockWriteRepository.save).toHaveBeenCalledWith(mockMovieRating, validCommand);
            });

            it('should handle same description update', async () => {
                const sameDescriptionCommand = new UpdateDescriptionCommand(movieRatingId, oldDescription);
                mockMovieRating.getState.mockReturnValue({
                    getDescription: () => oldDescription.toString(),
                } as any);

                await handler.execute(sameDescriptionCommand);

                expect(mockMovieRating.updateDescription).toHaveBeenCalledWith(oldDescription);
                expect(mockWriteRepository.save).toHaveBeenCalledWith(mockMovieRating, sameDescriptionCommand);
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
                    updateDescription: jest.fn(),
                } as any;
                mockReadRepository.getById.mockResolvedValue(mockMovieRating);
                mockWriteRepository.save.mockRejectedValue(new Error('Failed to save movie rating') as never);

                await expect(handler.execute(validCommand)).rejects.toThrow('Failed to save movie rating');
                expect(mockReadRepository.getById).toHaveBeenCalledTimes(1);
                expect(mockMovieRating.updateDescription).toHaveBeenCalledTimes(1);
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

            it('should handle concurrent description updates for different movie ratings', async () => {
                const movieRatingId1 = MovieRatingId.fromString('111e4567-e89b-12d3-a456-426614174000');
                const movieRatingId2 = MovieRatingId.fromString('222e4567-e89b-12d3-a456-426614174000');
                const description1 = Description.fromString('description1');
                const description2 = Description.fromString('description2');
                
                const command1 = new UpdateDescriptionCommand(movieRatingId1, description1);
                const command2 = new UpdateDescriptionCommand(movieRatingId2, description2);
                
                const mockMovieRating1 = { updateDescription: jest.fn() } as any;
                const mockMovieRating2 = { updateDescription: jest.fn() } as any;
                
                mockReadRepository.getById
                    .mockResolvedValueOnce(mockMovieRating1)
                    .mockResolvedValueOnce(mockMovieRating2);

                await Promise.all([
                    handler.execute(command1),
                    handler.execute(command2)
                ]);

                expect(mockReadRepository.getById).toHaveBeenCalledTimes(2);
                expect(mockWriteRepository.save).toHaveBeenCalledTimes(2);
                expect(mockMovieRating1.updateDescription).toHaveBeenCalledWith(description1);
                expect(mockMovieRating2.updateDescription).toHaveBeenCalledWith(description2);
            });
        });
    });
});
