import {
    CommandHandler,
    ICommandHandler,
} from '@backend-monorepo/boilerplate';
import { UpdateTitleCommand } from './update-title.command';
import { MovieRatingRepositoryInterface } from './movie-rating.repository.interface';
import { MovieRatingReadRepositoryInterface } from './movie-rating-read.repository.interface';
import { MovieRatingNotFoundException } from '../../exceptions/movie-rating-not-found.exception';

@CommandHandler(UpdateTitleCommand)
export class UpdateTitleCommandHandler extends ICommandHandler<UpdateTitleCommand,void> {
    constructor(
        private readonly movieRatingReadRepository: MovieRatingReadRepositoryInterface,
        private readonly movieRatingWriteRepository: MovieRatingRepositoryInterface,
    ) {
        super();
    }

    public async execute(command: UpdateTitleCommand): Promise<void> {
        const movieRating = await this.movieRatingReadRepository.getById(command.getId().toString());
        if (!movieRating) {
            throw MovieRatingNotFoundException.withId(command.getId().toString());
        }

        movieRating.updateTitle(command.getTitle());

        await this.movieRatingWriteRepository.save(movieRating, command);
    }
}