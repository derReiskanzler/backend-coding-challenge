import {
    CommandHandler,
    ICommandHandler,
} from '@backend-monorepo/boilerplate';
import { DeleteMovieRatingCommand } from './delete-movie-rating.command';
import { MovieRatingRepositoryInterface } from './movie-rating.repository.interface';
import { MovieRatingReadRepositoryInterface } from './movie-rating-read.repository.interface';
import { MovieRatingNotFoundException } from '../../exceptions/movie-rating-not-found.exception';

@CommandHandler(DeleteMovieRatingCommand)
export class DeleteMovieRatingCommandHandler extends ICommandHandler<DeleteMovieRatingCommand,void> {
    constructor(
        private readonly movieRatingReadRepository: MovieRatingReadRepositoryInterface,
        private readonly movieRatingWriteRepository: MovieRatingRepositoryInterface,
    ) {
        super();
    }

    public async execute(command: DeleteMovieRatingCommand): Promise<void> {
        const movieRating = await this.movieRatingReadRepository.getById(command.getId().toString());
        if (!movieRating) {
            throw MovieRatingNotFoundException.withId(command.getId().toString());
        }

        movieRating.delete();

        await this.movieRatingWriteRepository.save(movieRating, command);
    }
}