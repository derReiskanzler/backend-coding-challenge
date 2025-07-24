import { authEventMapping } from './auth/auth-event-mapping';
import { movieRatingEventMapping } from './movie-rating/movie-rating-event-mapping';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const eventMapping: Record<string, any> = {
    ...authEventMapping,
    ...movieRatingEventMapping,
};