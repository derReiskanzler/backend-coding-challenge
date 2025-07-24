import { MovieRatingCreatedEvent } from './movie-rating-created.event';
import { MovieRatingTitleUpdatedEvent } from './movie-rating-title-updated.event';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const movieRatingEventMapping: Record<string, any> = {
    [MovieRatingCreatedEvent.name]: MovieRatingCreatedEvent,
    [MovieRatingTitleUpdatedEvent.name]: MovieRatingTitleUpdatedEvent,
};
