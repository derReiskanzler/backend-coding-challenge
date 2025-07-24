import { MovieRatingCreatedEvent, MovieRatingId, MovieRatingStars, Title, Description, AccountId, MovieRatingTitleUpdatedEvent } from '@backend-monorepo/domain';
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

    describe('updateTitle', () => {
        let movieRating: MovieRating;
        const initialTitle = Title.fromString('Original Title');

        beforeEach(() => {
            movieRating = MovieRating.create(
                validMovieRatingId,
                initialTitle,
                validDescription,
                validStars,
                validAccountId,
            );
            movieRating.commitEvents();
        });

        it('should record MovieRatingTitleUpdatedEvent when title is different', () => {
            const newTitle = Title.fromString('Updated Title');

            movieRating.updateTitle(newTitle);

            const pendingEvents = movieRating.getPendingEvents();
            expect(pendingEvents).toHaveLength(1);
            
            const event = pendingEvents[0] as MovieRatingTitleUpdatedEvent;
            expect(event).toBeInstanceOf(MovieRatingTitleUpdatedEvent);
            expect(event.getId()).toBe(validMovieRatingId.toString());
            expect(event.getTitle()).toBe(newTitle.toString());
        });

        it('should not record event when title is the same', () => {
            movieRating.updateTitle(initialTitle);

            const pendingEvents = movieRating.getPendingEvents();
            expect(pendingEvents).toHaveLength(0);
        });

        it('should not record event when title string value is the same', () => {
            const sameTitle = Title.fromString('Original Title');

            movieRating.updateTitle(sameTitle);

            const pendingEvents = movieRating.getPendingEvents();
            expect(pendingEvents).toHaveLength(0);
        });

        it('should record multiple different title updates', () => {
            const firstNewTitle = Title.fromString('First Update');
            const secondNewTitle = Title.fromString('Second Update');

            movieRating.updateTitle(firstNewTitle);
            movieRating.updateTitle(secondNewTitle);

            const pendingEvents = movieRating.getPendingEvents();
            expect(pendingEvents).toHaveLength(2);
            
            const firstEvent = pendingEvents[0] as MovieRatingTitleUpdatedEvent;
            const secondEvent = pendingEvents[1] as MovieRatingTitleUpdatedEvent;
            
            expect(firstEvent.getTitle()).toBe('First Update');
            expect(secondEvent.getTitle()).toBe('Second Update');
        });

        it('should handle single character title updates', () => {
            const singleCharTitle = Title.fromString('A');

            movieRating.updateTitle(singleCharTitle);

            const pendingEvents = movieRating.getPendingEvents();
            expect(pendingEvents).toHaveLength(1);
            
            const event = pendingEvents[0] as MovieRatingTitleUpdatedEvent;
            expect(event.getTitle()).toBe('A');
        });

        it('should handle whitespace title updates', () => {
            const whitespaceTitle = Title.fromString('   Updated Title   ');

            movieRating.updateTitle(whitespaceTitle);

            const pendingEvents = movieRating.getPendingEvents();
            expect(pendingEvents).toHaveLength(1);
            
            const event = pendingEvents[0] as MovieRatingTitleUpdatedEvent;
            expect(event.getTitle()).toBe('Updated Title');
        });

        it('should handle title update after same title attempt', () => {
            const newTitle = Title.fromString('Different Title');

            // First try with same title (should not record event)
            movieRating.updateTitle(initialTitle);
            expect(movieRating.getPendingEvents()).toHaveLength(0);

            // Then try with different title (should record event)
            movieRating.updateTitle(newTitle);
            expect(movieRating.getPendingEvents()).toHaveLength(1);
            
            const event = movieRating.getPendingEvents()[0] as MovieRatingTitleUpdatedEvent;
            expect(event.getTitle()).toBe('Different Title');
        });
    });

    describe('onMovieRatingTitleUpdatedEvent', () => {
        let movieRating: MovieRating;
        const initialTitle = Title.fromString('Initial Title');

        beforeEach(() => {
            movieRating = MovieRating.create(
                validMovieRatingId,
                initialTitle,
                validDescription,
                validStars,
                validAccountId,
            );
        });

        it('should update title in state', () => {
            const newTitle = 'Updated Title';
            const event = MovieRatingTitleUpdatedEvent.create(validMovieRatingId.toString(), newTitle);

            movieRating.onMovieRatingTitleUpdatedEvent(event);

            const state = movieRating.getState();
            expect(state.getTitle()).toBe(newTitle);
        });

        it('should preserve other state properties when updating title', () => {
            const originalState = movieRating.getState();
            const originalId = originalState.getId();
            const originalDescription = originalState.getDescription();
            const originalStars = originalState.getStars();
            const originalAccountId = originalState.getAccountId();
            const originalCreatedAt = originalState.getCreatedAt();

            const newTitle = 'Updated Title';
            const event = MovieRatingTitleUpdatedEvent.create(validMovieRatingId.toString(), newTitle);

            movieRating.onMovieRatingTitleUpdatedEvent(event);

            const updatedState = movieRating.getState();
            expect(updatedState.getId()).toBe(originalId);
            expect(updatedState.getDescription()).toBe(originalDescription);
            expect(updatedState.getStars()).toBe(originalStars);
            expect(updatedState.getAccountId()).toBe(originalAccountId);
            expect(updatedState.getCreatedAt()).toBe(originalCreatedAt);
            expect(updatedState.getTitle()).toBe(newTitle);
        });

        it('should handle multiple title updates sequentially', () => {
            const firstTitle = 'First Update';
            const secondTitle = 'Second Update';

            const firstEvent = MovieRatingTitleUpdatedEvent.create(validMovieRatingId.toString(), firstTitle);
            const secondEvent = MovieRatingTitleUpdatedEvent.create(validMovieRatingId.toString(), secondTitle);

            movieRating.onMovieRatingTitleUpdatedEvent(firstEvent);
            expect(movieRating.getState().getTitle()).toBe(firstTitle);

            movieRating.onMovieRatingTitleUpdatedEvent(secondEvent);
            expect(movieRating.getState().getTitle()).toBe(secondTitle);
        });

        it('should create new state instance when updating title', () => {
            const originalState = movieRating.getState();
            const newTitle = 'Updated Title';
            const event = MovieRatingTitleUpdatedEvent.create(validMovieRatingId.toString(), newTitle);

            movieRating.onMovieRatingTitleUpdatedEvent(event);

            const updatedState = movieRating.getState();
            expect(updatedState).not.toBe(originalState);
            expect(updatedState.getTitle()).toBe(newTitle);
        });
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

        it('should properly record and handle title update workflow', () => {
            const initialTitle = Title.fromString('Initial Title');
            const updatedTitle = Title.fromString('Updated Title');
            
            const movieRating = MovieRating.create(
                validMovieRatingId,
                initialTitle,
                validDescription,
                validStars,
                validAccountId,
            );

            movieRating.commitEvents();

            movieRating.updateTitle(updatedTitle);

            expect(movieRating.getPendingEvents()).toHaveLength(1);
            const event = movieRating.getPendingEvents()[0] as MovieRatingTitleUpdatedEvent;
            expect(event.getTitle()).toBe(updatedTitle.toString());

            const state = movieRating.getState() as MovieRatingState;
            expect(state.getTitle()).toBe(updatedTitle.toString());
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