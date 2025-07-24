import { MovieRatingCreatedEvent, MovieRatingId, MovieRatingStars, Title, Description, AccountId } from '@backend-monorepo/domain';
import { AggregateId } from '@backend-monorepo/boilerplate';
import { MovieRating } from './movie-rating.aggregate';
import { MovieRatingState } from './movie-rating.state';

describe('MovieRating Aggregate', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    const validMovieRatingId = MovieRatingId.fromString('123e4567-e89b-12d3-a456-426614174000');
    const validTitle = Title.fromString('testtitle');
    const validDescription = Description.fromString('testdescription');
    const validStars = MovieRatingStars.fromNumber(1);
    const validAccountId = AccountId.fromString('123e4567-e89b-12d3-a456-426614174000');

    it('should create a movie rating', () => {
        const movieRating = MovieRating.create(
            validMovieRatingId,
            validTitle,
            validDescription,
            validStars,
            validAccountId,
        );

        expect(movieRating).toBeInstanceOf(MovieRating);
        expect(movieRating.getPendingEvents()).toHaveLength(1);
        
        const event = movieRating.getPendingEvents()[0] as MovieRatingCreatedEvent;
        expect(event).toBeInstanceOf(MovieRatingCreatedEvent);
        expect(event.getId()).toBe(validMovieRatingId.toString());
        expect(event.getTitle()).toBe(validTitle.toString());
        expect(event.getDescription()).toBe(validDescription.toString());
        expect(event.getStars()).toBe(validStars.toNumber());
        expect(event.getAccountId()).toBe(validAccountId.toString());
    });

    it('should update the state when handling MovieRatingCreatedEvent', () => {
        const movieRating = new MovieRating();
        const event = MovieRatingCreatedEvent.create(
            validMovieRatingId.toString(),
            validTitle.toString(),
            validDescription.toString(),
            validStars.toNumber(),
            validAccountId.toString(),
        );

        movieRating.onMovieRatingCreatedEvent(event);

        const state = movieRating.getState() as MovieRatingState;
        expect(state.getId()).toBe('123e4567-e89b-12d3-a456-426614174000');
        expect(state.getTitle()).toBe('testtitle');
        expect(state.getDescription()).toBe('testdescription');
        expect(state.getStars()).toBe(1);
        expect(state.getAccountId()).toBe('123e4567-e89b-12d3-a456-426614174000');
    });

    it('should handle multiple event applications correctly', () => {
        const movieRating = new MovieRating();
        
        const firstEvent = MovieRatingCreatedEvent.create(
            validMovieRatingId.toString(),
            validTitle.toString(),
            validDescription.toString(),
            validStars.toNumber(),
            validAccountId.toString(),
        );
        
        const secondEvent = MovieRatingCreatedEvent.create(
            validMovieRatingId.toString(),
            validTitle.toString(),
            validDescription.toString(),
            validStars.toNumber(),
            validAccountId.toString(),
        );

        movieRating.onMovieRatingCreatedEvent(firstEvent);
        movieRating.onMovieRatingCreatedEvent(secondEvent);

        const state = movieRating.getState() as MovieRatingState;
        // The second event should override the first
        expect(state.getId()).toBe(validMovieRatingId.toString());
        expect(state.getTitle()).toBe(validTitle.toString());
        expect(state.getDescription()).toBe(validDescription.toString());
        expect(state.getStars()).toBe(validStars.toNumber());
        expect(state.getAccountId()).toBe(validAccountId.toString());
    });

    describe('getAggregateId', () => {
        it('should return AggregateId from state', () => {
            const movieRating = new MovieRating();
            const event = MovieRatingCreatedEvent.create(
                validMovieRatingId.toString(),
                validTitle.toString(),
                validDescription.toString(),
                validStars.toNumber(),
                validAccountId.toString(),
            );

            movieRating.onMovieRatingCreatedEvent(event);
            
            const aggregateId = movieRating.getAggregateId();
            expect(aggregateId).toBeInstanceOf(AggregateId);
            expect(aggregateId.toString()).toBe('123e4567-e89b-12d3-a456-426614174000');
        });

        it('should throw error when state is not initialized', () => {
            const movieRating = new MovieRating();

            expect(() => movieRating.getAggregateId()).toThrow();
        });
    });

    describe('getState', () => {
        it('should return the current state', () => {
            const movieRating = new MovieRating();
            const event = MovieRatingCreatedEvent.create(
                validMovieRatingId.toString(),
                validTitle.toString(),
                validDescription.toString(),
                validStars.toNumber(),
                validAccountId.toString(),
            );

            movieRating.onMovieRatingCreatedEvent(event);
            
            const state = movieRating.getState();
            expect(state).toBeInstanceOf(MovieRatingState);
            expect(state.getId()).toBe('123e4567-e89b-12d3-a456-426614174000');
        });

        it('should return undefined when no state is set', () => {
            const movieRating = new MovieRating();
            
            const state = movieRating.getState();
            expect(state).toBeUndefined();
        });
    });

    describe('integration with event recording', () => {
        it('should properly record and handle MovieRatingCreatedEvent during create', () => {
            const validMovieRatingId = MovieRatingId.fromString('123e4567-e89b-12d3-a456-426614174000');
            const validTitle = Title.fromString('testtitle');
            const validDescription = Description.fromString('testdescription');
            const validStars = MovieRatingStars.fromNumber(1);
            const validAccountId = AccountId.fromString('123e4567-e89b-12d3-a456-426614174000');
            
            const movieRating = MovieRating.create(
                validMovieRatingId,
                validTitle,
                validDescription,
                validStars,
                validAccountId,
            );

            // Check that the event was recorded and the state was updated
            expect(movieRating.getPendingEvents()).toHaveLength(1);
            
            const state = movieRating.getState() as MovieRatingState;
            expect(state.getId()).toBe(validMovieRatingId.toString());
            expect(state.getTitle()).toBe(validTitle.toString());
            expect(state.getDescription()).toBe(validDescription.toString());
            expect(state.getStars()).toBe(validStars.toNumber());
            expect(state.getAccountId()).toBe(validAccountId.toString());
        });
    });

    describe('immutability and state consistency', () => {
        it('should maintain state consistency across multiple operations', () => {
            const validMovieRatingId = MovieRatingId.fromString('123e4567-e89b-12d3-a456-426614174000');
            const validTitle = Title.fromString('testtitle');
            const validDescription = Description.fromString('testdescription');
            const validStars = MovieRatingStars.fromNumber(1);
            const validAccountId = AccountId.fromString('123e4567-e89b-12d3-a456-426614174000');
            
            const movieRating = MovieRating.create(
                validMovieRatingId,
                validTitle,
                validDescription,
                validStars,
                validAccountId,
            );

            const state1 = movieRating.getState();
            const state2 = movieRating.getState();
            const aggregateId1 = movieRating.getAggregateId();
            const aggregateId2 = movieRating.getAggregateId();

            // Multiple calls should return consistent results
            expect(state1.getId()).toBe(state2.getId());
            expect(aggregateId1.toString()).toBe(aggregateId2.toString());
        });
    });
});