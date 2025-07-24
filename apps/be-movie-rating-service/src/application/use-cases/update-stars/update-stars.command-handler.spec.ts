import { MovieRatingId, MovieRatingStars } from '@backend-monorepo/domain';
import { UpdateStarsCommand } from './update-stars.command';
import { UpdateStarsCommandHandler } from './update-stars.command-handler';
import { MovieRatingRepositoryInterface } from './movie-rating.repository.interface';
import { MovieRatingReadRepositoryInterface } from './movie-rating-read.repository.interface';
import { MovieRatingNotFoundException } from '../../exceptions/movie-rating-not-found.exception';
import { MovieRating } from '../../../domain/aggregates/movie-rating.aggregate';

describe('UpdateStarsCommandHandler', () => {
    let handler: UpdateStarsCommandHandler;
    let mockWriteRepository: jest.Mocked<MovieRatingRepositoryInterface>;
    let mockReadRepository: jest.Mocked<MovieRatingReadRepositoryInterface>;

    beforeEach(() => {
        mockWriteRepository = {
            save: jest.fn(),
        };
        mockReadRepository = {
            getById: jest.fn(),
        };

        handler = new UpdateStarsCommandHandler(
            mockReadRepository,
            mockWriteRepository,
        );
    });

    describe('execute', () => {
        const movieRatingId = MovieRatingId.fromString('123e4567-e89b-12d3-a456-426614174000');
        const oldStars = MovieRatingStars.fromNumber(5);
        const newStars = MovieRatingStars.fromNumber(4);
        const validCommand = new UpdateStarsCommand(movieRatingId, newStars);

        describe('when movie rating exists', () => {
            let mockMovieRating: jest.Mocked<MovieRating>;

            beforeEach(() => {
                mockMovieRating = {
                    updateStars: jest.fn(),
                    getState: jest.fn().mockReturnValue({
                        getStars: () => oldStars.toNumber(),
                    }),
                    getPendingEvents: jest.fn().mockReturnValue([]),
                } as any;
                mockReadRepository.getById.mockResolvedValue(mockMovieRating);
            });

            it('should update stars successfully', async () => {
                await handler.execute(validCommand);

                expect(mockReadRepository.getById).toHaveBeenCalledWith(movieRatingId.toString());
                expect(mockMovieRating.updateStars).toHaveBeenCalledWith(newStars);
                expect(mockWriteRepository.save).toHaveBeenCalledWith(mockMovieRating, validCommand);
            });

            it('should call updateTitle with correct parameters', async () => {
                await handler.execute(validCommand);

                expect(mockMovieRating.updateStars).toHaveBeenCalledTimes(1);
                expect(mockMovieRating.updateStars).toHaveBeenCalledWith(newStars);
            });

            it('should save the movie rating with command after updating stars', async () => {
                await handler.execute(validCommand);

                expect(mockWriteRepository.save).toHaveBeenCalledTimes(1);
                expect(mockWriteRepository.save).toHaveBeenCalledWith(mockMovieRating, validCommand);
            });

            it('should handle same stars update', async () => {
                const sameStarsCommand = new UpdateStarsCommand(movieRatingId, oldStars);
                mockMovieRating.getState.mockReturnValue({
                    getStars: () => oldStars.toNumber(),
                } as any);

                await handler.execute(sameStarsCommand);

                expect(mockMovieRating.updateStars).toHaveBeenCalledWith(oldStars);
                expect(mockWriteRepository.save).toHaveBeenCalledWith(mockMovieRating, sameStarsCommand);
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
                    updateStars: jest.fn(),
                } as any;
                mockReadRepository.getById.mockResolvedValue(mockMovieRating);
                mockWriteRepository.save.mockRejectedValue(new Error('Failed to save movie rating') as never);

                await expect(handler.execute(validCommand)).rejects.toThrow('Failed to save movie rating');
                expect(mockReadRepository.getById).toHaveBeenCalledTimes(1);
                expect(mockMovieRating.updateStars).toHaveBeenCalledTimes(1);
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

            it('should handle concurrent stars updates for different movie ratings', async () => {
                const movieRatingId1 = MovieRatingId.fromString('111e4567-e89b-12d3-a456-426614174000');
                const movieRatingId2 = MovieRatingId.fromString('222e4567-e89b-12d3-a456-426614174000');
                const stars1 = MovieRatingStars.fromNumber(1);
                const stars2 = MovieRatingStars.fromNumber(2);
                
                const command1 = new UpdateStarsCommand(movieRatingId1, stars1);
                const command2 = new UpdateStarsCommand(movieRatingId2, stars2);
                
                const mockMovieRating1 = { updateStars: jest.fn() } as any;
                const mockMovieRating2 = { updateStars: jest.fn() } as any;
                
                mockReadRepository.getById
                    .mockResolvedValueOnce(mockMovieRating1)
                    .mockResolvedValueOnce(mockMovieRating2);

                await Promise.all([
                    handler.execute(command1),
                    handler.execute(command2)
                ]);

                expect(mockReadRepository.getById).toHaveBeenCalledTimes(2);
                expect(mockWriteRepository.save).toHaveBeenCalledTimes(2);
                expect(mockMovieRating1.updateStars).toHaveBeenCalledWith(stars1);
                expect(mockMovieRating2.updateStars).toHaveBeenCalledWith(stars2);
            });
        });
    });
});
