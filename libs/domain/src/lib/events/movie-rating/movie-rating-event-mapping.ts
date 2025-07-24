import { MovieRatingCreatedEvent } from './movie-rating-created.event';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const movieRatingEventMapping: Record<string, any> = {
    [MovieRatingCreatedEvent.name]: MovieRatingCreatedEvent,
};
