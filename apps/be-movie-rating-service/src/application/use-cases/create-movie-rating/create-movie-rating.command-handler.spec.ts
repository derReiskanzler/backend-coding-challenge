import { AccountId, Description, MovieRatingCreatedEvent, MovieRatingStars, Title } from '@backend-monorepo/domain';
import { CreateMovieRatingCommand } from './create-movie-rating.command';
import { CreateMovieRatingCommandHandler } from './create-movie-rating.command-handler';
import { MovieRatingRepositoryInterface } from './movie-rating.repository.interface';
import { MovieRating } from '../../../domain/aggregates/movie-rating.aggregate';


describe('CreateMovieRatingCommandHandler', () => {
    let handler: CreateMovieRatingCommandHandler;
    let mockWriteRepository: jest.Mocked<MovieRatingRepositoryInterface>;

    beforeEach(() => {
        mockWriteRepository = {
            save: jest.fn(),
        };

        handler = new CreateMovieRatingCommandHandler(
            mockWriteRepository,
        );
    });

    describe('execute', () => {
        const validCommand = new CreateMovieRatingCommand(
            Title.fromString('The Matrix'),
            Description.fromString('A computer hacker learns about the true nature of his reality and his role in the war against its controllers.'),
            MovieRatingStars.fromNumber(5),
            AccountId.fromString('123e4567-e89b-12d3-a456-426614174000'),
        );

        describe('when movie rating does not exist', () => {
            it('should create movie rating successfully', async () => {
                await handler.execute(validCommand);

                expect(mockWriteRepository.save).toHaveBeenCalledWith(
                    expect.any(MovieRating),
                    validCommand
                );
            });

            it('should create movie rating with correct data', async () => {
                let capturedMovieRating: MovieRating;
                mockWriteRepository.save.mockImplementation(async (movieRating, command) => {
                    capturedMovieRating = movieRating as MovieRating;
                });

                await handler.execute(validCommand);

                expect(capturedMovieRating!).toBeInstanceOf(MovieRating);
                expect(capturedMovieRating!.getState().getTitle().toString()).toBe(
                    validCommand.getTitle().toString()
                );
            });

            it('should save movie rating aggregate with movie rating created event', async () => {
                let capturedMovieRating: MovieRating;
                mockWriteRepository.save.mockImplementation(async (movieRating, command) => {
                    capturedMovieRating = movieRating as MovieRating;
                });

                await handler.execute(validCommand);

                expect(capturedMovieRating!.getPendingEvents()).toHaveLength(1);
                expect(capturedMovieRating!.getPendingEvents()[0].getEventName()).toBe(MovieRatingCreatedEvent.name);
            });
        });


        describe('repository error handling', () => {
            it('should propagate write repository errors', async () => {
                mockWriteRepository.save.mockRejectedValue(new Error('Failed to save movie rating') as never);

                await expect(handler.execute(validCommand)).rejects.toThrow('Failed to save movie rating');
            });

            it('should call write repository before attempting write', async () => {
                mockWriteRepository.save.mockRejectedValue(new Error('Save failed') as never);

                await expect(handler.execute(validCommand)).rejects.toThrow('Save failed');
                expect(mockWriteRepository.save).toHaveBeenCalledTimes(1);
            });
        });

        describe('edge cases', () => {
            it('should handle concurrent create movie rating', async () => {
                const commands = [
                    new CreateMovieRatingCommand(
                        Title.fromString('The Matrix'),
                        Description.fromString('A computer hacker learns about the true nature of his reality and his role in the war against its controllers.'),
                        MovieRatingStars.fromNumber(5),
                        AccountId.fromString('123e4567-e89b-12d3-a456-426614174000'),
                    ),
                    new CreateMovieRatingCommand(
                        Title.fromString('The Matrix 2'),
                        Description.fromString('A computer hacker learns about the true nature of his reality and his role in the war against its controllers.'),
                        MovieRatingStars.fromNumber(4),
                        AccountId.fromString('123e4567-e89b-12d3-a456-426614174000'),
                    ),
                ];

                const results = await Promise.all(
                    commands.map(command => handler.execute(command))
                );

                expect(results).toHaveLength(2);
                expect(mockWriteRepository.save).toHaveBeenCalledTimes(2);
            });
        });
    });
}); 