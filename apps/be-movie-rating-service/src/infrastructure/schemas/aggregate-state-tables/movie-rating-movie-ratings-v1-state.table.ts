import { AggregateStateTable, AggregateStateEnum, BaseAggregateState } from '@backend-monorepo/boilerplate';

@AggregateStateTable({
    name: AggregateStateEnum.MOVIE_RATING_MOVIE_RATINGS_V1_STATE,
})
export class MovieRatingMovieRatingsV1StateTable extends BaseAggregateState {

}
