import { EventStreamEnum } from '../../config';
import { EventStreamTable } from '../../event-sourcing/decorators/event-stream-table.decorator';
import { BaseStreamEvent } from '../../event-sourcing/database-abstractions/base-stream-event';

@EventStreamTable({
    name: EventStreamEnum.MOVIE_RATING_MOVIE_RATINGS_V1_STREAM,
})
export class MovieRatingMovieRatingsV1Stream extends BaseStreamEvent {

}
