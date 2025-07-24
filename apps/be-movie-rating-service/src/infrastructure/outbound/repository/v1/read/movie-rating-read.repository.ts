import { Injectable } from '@nestjs/common';
import {
    AggregateReadMode,
    AggregateReadRepository,
    AggregateStateEnum,
    AggregateStateRepository,
    EventStreamEnum,
    EventStreamRepository,
    ReadModeEnum,
} from '@backend-monorepo/boilerplate';
import { MovieRatingState } from '../../../../../domain/aggregates/movie-rating.state';
import { MovieRating } from '../../../../../domain/aggregates/movie-rating.aggregate';
import { MovieRatingReadRepositoryInterface as GetUpdateTitleRepositoryInterface } from '../../../../../application/use-cases/update-title/movie-rating-read.repository.interface';
import { MovieRatingReadRepositoryInterface as GetUpdateDescriptionRepositoryInterface } from '../../../../../application/use-cases/update-description/movie-rating-read.repository.interface';
import { MovieRatingReadRepositoryInterface as GetUpdateStarsRepositoryInterface } from '../../../../../application/use-cases/update-stars/movie-rating-read.repository.interface';
import { MovieRatingReadRepositoryInterface as GetDeleteMovieRatingRepositoryInterface } from '../../../../../application/use-cases/delete-movie-rating/movie-rating-read.repository.interface';

@Injectable()
@EventStreamRepository(EventStreamEnum.MOVIE_RATING_MOVIE_RATINGS_V1_STREAM)
@AggregateStateRepository(AggregateStateEnum.MOVIE_RATING_MOVIE_RATINGS_V1_STATE, MovieRatingState, MovieRating)
@AggregateReadMode(ReadModeEnum.FROM_STATE)
export class MovieRatingV1ReadRepository extends AggregateReadRepository implements
    GetUpdateTitleRepositoryInterface,
    GetUpdateDescriptionRepositoryInterface,
    GetUpdateStarsRepositoryInterface,
    GetDeleteMovieRatingRepositoryInterface
{
    public async getById(id: string): Promise<MovieRating|null> {
        return await this.getAggregate<MovieRating>(id);
    }
}
