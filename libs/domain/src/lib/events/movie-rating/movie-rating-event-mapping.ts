import { MovieRatingCreatedEvent } from './movie-rating-created.event';
import { MovieRatingTitleUpdatedEvent } from './movie-rating-title-updated.event';
import { MovieRatingDescriptionUpdatedEvent } from './movie-rating-description-updated.event';
import { MovieRatingStarsUpdatedEvent } from './movie-rating-stars-updated.event';
import { MovieRatingDeletedEvent } from './movie-rating-deleted.event';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const movieRatingEventMapping: Record<string, any> = {
    [MovieRatingCreatedEvent.name]: MovieRatingCreatedEvent,
    [MovieRatingDeletedEvent.name]: MovieRatingDeletedEvent,
    [MovieRatingDescriptionUpdatedEvent.name]: MovieRatingDescriptionUpdatedEvent,
    [MovieRatingStarsUpdatedEvent.name]: MovieRatingStarsUpdatedEvent,
    [MovieRatingTitleUpdatedEvent.name]: MovieRatingTitleUpdatedEvent,
};
