import { Injectable } from '@nestjs/common';
import {
    AggregateWriteRepository,
    AggregateRoot,
    Command,
    EventStreamRepository,
    AggregateStateRepository,
    EventStreamEnum,
    AggregateStateEnum,
} from '@backend-monorepo/boilerplate';
import { MovieRatingState } from '../../../../../domain/aggregates/movie-rating.state';
import { MovieRatingRepositoryInterface as CreateMovieRatingRepositoryInterface } from '../../../../../application/use-cases/create-movie-rating/movie-rating.repository.interface';
import { MovieRatingRepositoryInterface as UpdateTitleRepositoryInterface } from '../../../../../application/use-cases/update-title/movie-rating.repository.interface';
import { MovieRatingRepositoryInterface as UpdateDescriptionRepositoryInterface } from '../../../../../application/use-cases/update-description/movie-rating.repository.interface';
import { MovieRatingRepositoryInterface as UpdateStarsRepositoryInterface } from '../../../../../application/use-cases/update-stars/movie-rating.repository.interface';
import { MovieRatingRepositoryInterface as DeleteMovieRatingRepositoryInterface } from '../../../../../application/use-cases/delete-movie-rating/movie-rating.repository.interface';

@Injectable()
@EventStreamRepository(EventStreamEnum.MOVIE_RATING_MOVIE_RATINGS_V1_STREAM)
@AggregateStateRepository(AggregateStateEnum.MOVIE_RATING_MOVIE_RATINGS_V1_STATE, MovieRatingState)
export class MovieRatingV1WriteRepository extends AggregateWriteRepository implements
    CreateMovieRatingRepositoryInterface,
    UpdateTitleRepositoryInterface,
    UpdateDescriptionRepositoryInterface,
    UpdateStarsRepositoryInterface,
    DeleteMovieRatingRepositoryInterface
{
    public async save(aggregate: AggregateRoot, command: Command): Promise<void> {
        await this.saveAggregate(aggregate, command);
    }
}
