import {
    CommandHandler,
    ICommandHandler,
} from '@backend-monorepo/boilerplate';
import { UpdateStarsCommand } from './update-stars.command';
import { MovieRatingRepositoryInterface } from './movie-rating.repository.interface';
import { MovieRatingReadRepositoryInterface } from './movie-rating-read.repository.interface';
import { MovieRatingNotFoundException } from '../../exceptions/movie-rating-not-found.exception';

@CommandHandler(UpdateStarsCommand)
export class UpdateStarsCommandHandler extends ICommandHandler<UpdateStarsCommand,void> {
    constructor(
        private readonly movieRatingReadRepository: MovieRatingReadRepositoryInterface,
        private readonly movieRatingWriteRepository: MovieRatingRepositoryInterface,
    ) {
        super();
    }

    public async execute(command: UpdateStarsCommand): Promise<void> {
        const movieRating = await this.movieRatingReadRepository.getById(command.getId().toString());
        if (!movieRating) {
            throw MovieRatingNotFoundException.withId(command.getId().toString());
        }

        movieRating.updateStars(command.getStars());

        await this.movieRatingWriteRepository.save(movieRating, command);
    }
}