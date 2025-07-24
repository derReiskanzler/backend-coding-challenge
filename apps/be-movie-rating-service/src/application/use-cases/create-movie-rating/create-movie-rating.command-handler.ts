import {
    CommandHandler,
    ICommandHandler,
    UuidGenerator,
} from '@backend-monorepo/boilerplate';
import { CreateMovieRatingCommand } from './create-movie-rating.command';
import { MovieRating } from '../../../domain/aggregates/movie-rating.aggregate';
import { MovieRatingId } from '@backend-monorepo/domain';
import { MovieRatingRepositoryInterface } from './movie-rating.repository.interface';

@CommandHandler(CreateMovieRatingCommand)
export class CreateMovieRatingCommandHandler extends ICommandHandler<CreateMovieRatingCommand,string> {
    constructor(
        private readonly movieRatingWriteRepository: MovieRatingRepositoryInterface,
    ) {
        super();
    }

    public async execute(command: CreateMovieRatingCommand): Promise<string> {
        const movieRatingId = MovieRatingId.fromString(UuidGenerator.generate());
        const movieRating = MovieRating.create(
            movieRatingId,
            command.getTitle(),
            command.getDescription(),
            command.getStars(),
            command.getAccountId(),
        );

        await this.movieRatingWriteRepository.save(movieRating, command);
        
        return movieRatingId.toString();
    }
}