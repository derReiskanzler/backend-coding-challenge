import {
    CommandHandler,
    ICommandHandler,
} from '@backend-monorepo/boilerplate';
import { UpdateDescriptionCommand } from './update-description.command';
import { MovieRatingRepositoryInterface } from './movie-rating.repository.interface';
import { MovieRatingReadRepositoryInterface } from './movie-rating-read.repository.interface';
import { MovieRatingNotFoundException } from '../../exceptions/movie-rating-not-found.exception';

@CommandHandler(UpdateDescriptionCommand)
export class UpdateDescriptionCommandHandler extends ICommandHandler<UpdateDescriptionCommand,void> {
    constructor(
        private readonly movieRatingReadRepository: MovieRatingReadRepositoryInterface,
        private readonly movieRatingWriteRepository: MovieRatingRepositoryInterface,
    ) {
        super();
    }

    public async execute(command: UpdateDescriptionCommand): Promise<void> {
        const movieRating = await this.movieRatingReadRepository.getById(command.getId().toString());
        if (!movieRating) {
            throw MovieRatingNotFoundException.withId(command.getId().toString());
        }

        movieRating.updateDescription(command.getDescription());

        await this.movieRatingWriteRepository.save(movieRating, command);
    }
}