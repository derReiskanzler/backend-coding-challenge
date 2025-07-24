import { Query } from '@backend-monorepo/boilerplate';
import { MovieRatingId } from '@backend-monorepo/domain';
import { GetMovieRatingQuery } from './get-movie-rating.query';

describe('GetMovieRatingQuery', () => {
    let validMovieRatingId: MovieRatingId;

    beforeEach(() => {
        validMovieRatingId = MovieRatingId.fromString('123e4567-e89b-12d3-a456-426614174000');
    });

    it('should create instance with valid movie rating id', () => {
        const query = new GetMovieRatingQuery(validMovieRatingId);

        expect(query).toBeInstanceOf(GetMovieRatingQuery);
        expect(query).toBeInstanceOf(Query);
    });

    it('should return the movie rating id passed in constructor', () => {
        const query = new GetMovieRatingQuery(validMovieRatingId);

        expect(query.getId()).toBe(validMovieRatingId);
    });

    it('should extend Query class', () => {
        const query = new GetMovieRatingQuery(validMovieRatingId);

        expect(query).toBeInstanceOf(Query);
    });
});