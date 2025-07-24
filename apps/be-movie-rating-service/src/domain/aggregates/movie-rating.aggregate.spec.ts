import { MovieRatingCreatedEvent, MovieRatingId, MovieRatingStars, Title, Description, AccountId, MovieRatingTitleUpdatedEvent, MovieRatingDescriptionUpdatedEvent, MovieRatingStarsUpdatedEvent, MovieRatingDeletedEvent } from '@backend-monorepo/domain';
import { AggregateId } from '@backend-monorepo/boilerplate';
import { MovieRating } from './movie-rating.aggregate';
import { MovieRatingState } from './movie-rating.state';

describe('MovieRating Aggregate', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    const validMovieRatingId = MovieRatingId.fromString('123e4567-e89b-12d3-a456-426614174000');
    const validTitle = Title.fromString('Test Movie');
    const validDescription = Description.fromString('A great test movie');
    const validStars = MovieRatingStars.fromNumber(5);
    const validAccountId = AccountId.fromString('123e4567-e89b-12d3-a456-426614174000');

    describe('create', () => {
        it('should create a movie rating successfully', () => {
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

        it('should record exactly one event when creating movie rating', () => {
            const movieRating = MovieRating.create(
                validMovieRatingId,
                validTitle,
                validDescription,
                validStars,
                validAccountId,
            );

            expect(movieRating.getPendingEvents()).toHaveLength(1);
        });
    });

    describe('onMovieRatingCreatedEvent', () => {
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
            expect(state.getId()).toBe(validMovieRatingId.toString());
            expect(state.getTitle()).toBe(validTitle.toString());
            expect(state.getDescription()).toBe(validDescription.toString());
            expect(state.getStars()).toBe(validStars.toNumber());
            expect(state.getAccountId()).toBe(validAccountId.toString());
            expect(state.getCreatedAt()).toBeInstanceOf(Date);
        });

        it('should handle multiple event applications correctly', () => {
            const movieRating = new MovieRating();
            
            const firstEvent = MovieRatingCreatedEvent.create(
                validMovieRatingId.toString(),
                'First Title',
                'First Description',
                3,
                validAccountId.toString(),
            );
            
            const secondEvent = MovieRatingCreatedEvent.create(
                validMovieRatingId.toString(),
                'Second Title',
                'Second Description',
                4,
                validAccountId.toString(),
            );

            movieRating.onMovieRatingCreatedEvent(firstEvent);
            movieRating.onMovieRatingCreatedEvent(secondEvent);

            const state = movieRating.getState() as MovieRatingState;
            // The second event should override the first
            expect(state.getTitle()).toBe('Second Title');
            expect(state.getDescription()).toBe('Second Description');
            expect(state.getStars()).toBe(4);
        });
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

    describe('updateDescription', () => {
        let movieRating: MovieRating;
        const initialDescription = Description.fromString('Original Description');

        beforeEach(() => {
            movieRating = MovieRating.create(
                validMovieRatingId,
                validTitle,
                initialDescription,
                validStars,
                validAccountId,
            );
            movieRating.commitEvents();
        });

        it('should record MovieRatingDescriptionUpdatedEvent when description is different', () => {
            const newDescription = Description.fromString('Updated Description');

            movieRating.updateDescription(newDescription);

            const pendingEvents = movieRating.getPendingEvents();
            expect(pendingEvents).toHaveLength(1);
            
            const event = pendingEvents[0] as MovieRatingDescriptionUpdatedEvent;
            expect(event).toBeInstanceOf(MovieRatingDescriptionUpdatedEvent);
            expect(event.getId()).toBe(validMovieRatingId.toString());
            expect(event.getDescription()).toBe(newDescription.toString());
        });

        it('should not record event when description is the same', () => {
            movieRating.updateDescription(initialDescription);

            const pendingEvents = movieRating.getPendingEvents();
            expect(pendingEvents).toHaveLength(0);
        });

        it('should record multiple different description updates', () => {
            const firstNewDescription = Description.fromString('First Update');
            const secondNewDescription = Description.fromString('Second Update');

            movieRating.updateDescription(firstNewDescription);
            movieRating.updateDescription(secondNewDescription);

            const pendingEvents = movieRating.getPendingEvents();
            expect(pendingEvents).toHaveLength(2);
            
            const firstEvent = pendingEvents[0] as MovieRatingDescriptionUpdatedEvent;
            const secondEvent = pendingEvents[1] as MovieRatingDescriptionUpdatedEvent;
            
            expect(firstEvent.getDescription()).toBe('First Update');
            expect(secondEvent.getDescription()).toBe('Second Update');
        });

        it('should preserve whitespace in description updates', () => {
            const whitespaceDescription = Description.fromString('   Updated Description   ');

            movieRating.updateDescription(whitespaceDescription);

            const pendingEvents = movieRating.getPendingEvents();
            expect(pendingEvents).toHaveLength(1);
            
            const event = pendingEvents[0] as MovieRatingDescriptionUpdatedEvent;
            expect(event.getDescription()).toBe('   Updated Description   ');
        });

        it('should handle description update after same description attempt', () => {
            const newDescription = Description.fromString('Different Description');

            // First try with same description (should not record event)
            movieRating.updateDescription(initialDescription);
            expect(movieRating.getPendingEvents()).toHaveLength(0);

            // Then try with different description (should record event)
            movieRating.updateDescription(newDescription);
            expect(movieRating.getPendingEvents()).toHaveLength(1);
            
            const event = movieRating.getPendingEvents()[0] as MovieRatingDescriptionUpdatedEvent;
            expect(event.getDescription()).toBe('Different Description');
        });
    });

    describe('onMovieRatingDescriptionUpdatedEvent', () => {
        let movieRating: MovieRating;
        const initialDescription = Description.fromString('Initial Description');

        beforeEach(() => {
            movieRating = MovieRating.create(
                validMovieRatingId,
                validTitle,
                initialDescription,
                validStars,
                validAccountId,
            );
        });

        it('should update description in state', () => {
            const newDescription = 'Updated Description';
            const event = MovieRatingDescriptionUpdatedEvent.create(validMovieRatingId.toString(), newDescription);

            movieRating.onMovieRatingDescriptionUpdatedEvent(event);

            const state = movieRating.getState();
            expect(state.getDescription()).toBe(newDescription);
        });

        it('should preserve other state properties when updating description', () => {
            const originalState = movieRating.getState();
            const originalId = originalState.getId();
            const originalTitle = originalState.getTitle();
            const originalStars = originalState.getStars();
            const originalAccountId = originalState.getAccountId();
            const originalCreatedAt = originalState.getCreatedAt();

            const newDescription = 'Updated Description';
            const event = MovieRatingDescriptionUpdatedEvent.create(validMovieRatingId.toString(), newDescription);

            movieRating.onMovieRatingDescriptionUpdatedEvent(event);

            const updatedState = movieRating.getState();
            expect(updatedState.getId()).toBe(originalId);
            expect(updatedState.getTitle()).toBe(originalTitle);
            expect(updatedState.getStars()).toBe(originalStars);
            expect(updatedState.getAccountId()).toBe(originalAccountId);
            expect(updatedState.getCreatedAt()).toBe(originalCreatedAt);
            expect(updatedState.getDescription()).toBe(newDescription);
        });

        it('should handle multiple description updates sequentially', () => {
            const firstDescription = 'First Update';
            const secondDescription = 'Second Update';

            const firstEvent = MovieRatingDescriptionUpdatedEvent.create(validMovieRatingId.toString(), firstDescription);
            const secondEvent = MovieRatingDescriptionUpdatedEvent.create(validMovieRatingId.toString(), secondDescription);

            movieRating.onMovieRatingDescriptionUpdatedEvent(firstEvent);
            expect(movieRating.getState().getDescription()).toBe(firstDescription);

            movieRating.onMovieRatingDescriptionUpdatedEvent(secondEvent);
            expect(movieRating.getState().getDescription()).toBe(secondDescription);
        });

        it('should create new state instance when updating description', () => {
            const originalState = movieRating.getState();
            const newDescription = 'Updated Description';
            const event = MovieRatingDescriptionUpdatedEvent.create(validMovieRatingId.toString(), newDescription);

            movieRating.onMovieRatingDescriptionUpdatedEvent(event);

            const updatedState = movieRating.getState();
            expect(updatedState).not.toBe(originalState);
            expect(updatedState.getDescription()).toBe(newDescription);
        });
    });

    describe('updateStars', () => {
        let movieRating: MovieRating;
        const initialStars = MovieRatingStars.fromNumber(3);

        beforeEach(() => {
            movieRating = MovieRating.create(
                validMovieRatingId,
                validTitle,
                validDescription,
                initialStars,
                validAccountId,
            );
            movieRating.commitEvents();
        });

        it('should record MovieRatingStarsUpdatedEvent when stars is different', () => {
            const newStars = MovieRatingStars.fromNumber(5);

            movieRating.updateStars(newStars);

            const pendingEvents = movieRating.getPendingEvents();
            expect(pendingEvents).toHaveLength(1);
            
            const event = pendingEvents[0] as MovieRatingStarsUpdatedEvent;
            expect(event).toBeInstanceOf(MovieRatingStarsUpdatedEvent);
            expect(event.getId()).toBe(validMovieRatingId.toString());
            expect(event.getStars()).toBe(newStars.toNumber());
        });

        it('should not record event when stars is the same', () => {
            movieRating.updateStars(initialStars);

            const pendingEvents = movieRating.getPendingEvents();
            expect(pendingEvents).toHaveLength(0);
        });

        it('should record multiple different stars updates', () => {
            const firstNewStars = MovieRatingStars.fromNumber(1);
            const secondNewStars = MovieRatingStars.fromNumber(5);

            movieRating.updateStars(firstNewStars);
            movieRating.updateStars(secondNewStars);

            const pendingEvents = movieRating.getPendingEvents();
            expect(pendingEvents).toHaveLength(2);
            
            const firstEvent = pendingEvents[0] as MovieRatingStarsUpdatedEvent;
            const secondEvent = pendingEvents[1] as MovieRatingStarsUpdatedEvent;
            
            expect(firstEvent.getStars()).toBe(1);
            expect(secondEvent.getStars()).toBe(5);
        });

        it('should handle decimal number stars update', () => {
            const decimalStars = MovieRatingStars.fromNumber(1);

            movieRating.updateStars(decimalStars);

            const pendingEvents = movieRating.getPendingEvents();
            expect(pendingEvents).toHaveLength(1);
            
            const event = pendingEvents[0] as MovieRatingStarsUpdatedEvent;
            expect(event.getStars()).toBe(1);
        });

        it('should handle double number stars update', () => {
            const doubleStars = MovieRatingStars.fromNumber(4.5);

            movieRating.updateStars(doubleStars);

            const pendingEvents = movieRating.getPendingEvents();
            expect(pendingEvents).toHaveLength(1);
            
            const event = pendingEvents[0] as MovieRatingStarsUpdatedEvent;
            expect(event.getStars()).toBe(4.5);
        });

        it('should handle stars update after same stars attempt', () => {
            const newStars = MovieRatingStars.fromNumber(4);

            // First try with same stars (should not record event)
            movieRating.updateStars(initialStars);
            expect(movieRating.getPendingEvents()).toHaveLength(0);

            // Then try with different stars (should record event)
            movieRating.updateStars(newStars);
            expect(movieRating.getPendingEvents()).toHaveLength(1);
            
            const event = movieRating.getPendingEvents()[0] as MovieRatingStarsUpdatedEvent;
            expect(event.getStars()).toBe(4);
        });
    });

    describe('onMovieRatingStarsUpdatedEvent', () => {
        let movieRating: MovieRating;
        const initialStars = MovieRatingStars.fromNumber(3);

        beforeEach(() => {
            movieRating = MovieRating.create(
                validMovieRatingId,
                validTitle,
                validDescription,
                initialStars,
                validAccountId,
            );
        });

        it('should update stars in state', () => {
            const newStars = 5;
            const event = MovieRatingStarsUpdatedEvent.create(validMovieRatingId.toString(), newStars);

            movieRating.onMovieRatingStarsUpdatedEvent(event);

            const state = movieRating.getState();
            expect(state.getStars()).toBe(newStars);
        });

        it('should preserve other state properties when updating stars', () => {
            const originalState = movieRating.getState();
            const originalId = originalState.getId();
            const originalTitle = originalState.getTitle();
            const originalDescription = originalState.getDescription();
            const originalAccountId = originalState.getAccountId();
            const originalCreatedAt = originalState.getCreatedAt();

            const newStars = 5;
            const event = MovieRatingStarsUpdatedEvent.create(validMovieRatingId.toString(), newStars);

            movieRating.onMovieRatingStarsUpdatedEvent(event);

            const updatedState = movieRating.getState();
            expect(updatedState.getId()).toBe(originalId);
            expect(updatedState.getTitle()).toBe(originalTitle);
            expect(updatedState.getDescription()).toBe(originalDescription);
            expect(updatedState.getAccountId()).toBe(originalAccountId);
            expect(updatedState.getCreatedAt()).toBe(originalCreatedAt);
            expect(updatedState.getStars()).toBe(newStars);
        });

        it('should handle multiple stars updates sequentially', () => {
            const firstStars = 1;
            const secondStars = 5;

            const firstEvent = MovieRatingStarsUpdatedEvent.create(validMovieRatingId.toString(), firstStars);
            const secondEvent = MovieRatingStarsUpdatedEvent.create(validMovieRatingId.toString(), secondStars);

            movieRating.onMovieRatingStarsUpdatedEvent(firstEvent);
            expect(movieRating.getState().getStars()).toBe(firstStars);

            movieRating.onMovieRatingStarsUpdatedEvent(secondEvent);
            expect(movieRating.getState().getStars()).toBe(secondStars);
        });

        it('should create new state instance when updating stars', () => {
            const originalState = movieRating.getState();
            const newStars = 5;
            const event = MovieRatingStarsUpdatedEvent.create(validMovieRatingId.toString(), newStars);

            movieRating.onMovieRatingStarsUpdatedEvent(event);

            const updatedState = movieRating.getState();
            expect(updatedState).not.toBe(originalState);
            expect(updatedState.getStars()).toBe(newStars);
        });
    });

    describe('delete', () => {
        let movieRating: MovieRating;

        beforeEach(() => {
            movieRating = MovieRating.create(
                validMovieRatingId,
                validTitle,
                validDescription,
                validStars,
                validAccountId,
            );
            movieRating.commitEvents();
        });

        it('should record MovieRatingDeletedEvent when delete is called', () => {
            movieRating.delete();

            const pendingEvents = movieRating.getPendingEvents();
            expect(pendingEvents).toHaveLength(1);
            
            const event = pendingEvents[0] as MovieRatingDeletedEvent;
            expect(event).toBeInstanceOf(MovieRatingDeletedEvent);
            expect(event.getId()).toBe(validMovieRatingId.toString());
        });

        it('should work correctly after other operations', () => {
            // Update title first
            const newTitle = Title.fromString('New Title');
            movieRating.updateTitle(newTitle);
            movieRating.commitEvents();

            // Then delete
            movieRating.delete();

            const pendingEvents = movieRating.getPendingEvents();
            expect(pendingEvents).toHaveLength(1);
            
            const event = pendingEvents[0] as MovieRatingDeletedEvent;
            expect(event.getId()).toBe(validMovieRatingId.toString());
        });
    });

    describe('onMovieRatingDeletedEvent', () => {
        let movieRating: MovieRating;

        beforeEach(() => {
            movieRating = MovieRating.create(
                validMovieRatingId,
                validTitle,
                validDescription,
                validStars,
                validAccountId,
            );
        });

        it('should update state to mark as deleted', () => {
            movieRating.onMovieRatingDeletedEvent();

            const state = movieRating.getState();
            expect(state.getTitle()).toBe('DELETED');
            expect(state.getDescription()).toBe('DELETED');
            expect(state.getStars()).toBe(0);
        });

        it('should preserve id, accountId and createdAt when deleting', () => {
            const originalState = movieRating.getState();
            const originalId = originalState.getId();
            const originalAccountId = originalState.getAccountId();
            const originalCreatedAt = originalState.getCreatedAt();

            movieRating.onMovieRatingDeletedEvent();

            const updatedState = movieRating.getState();
            expect(updatedState.getId()).toBe(originalId);
            expect(updatedState.getAccountId()).toBe(originalAccountId);
            expect(updatedState.getCreatedAt()).toBe(originalCreatedAt);
        });

        it('should create new state instance when deleting', () => {
            const originalState = movieRating.getState();

            movieRating.onMovieRatingDeletedEvent();

            const updatedState = movieRating.getState();
            expect(updatedState).not.toBe(originalState);
            expect(updatedState.getTitle()).toBe('DELETED');
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
            expect(aggregateId.toString()).toBe(validMovieRatingId.toString());
        });

        it('should throw error when state is not initialized', () => {
            const movieRating = new MovieRating();

            expect(() => movieRating.getAggregateId()).toThrow();
        });

        it('should return consistent aggregate ID across multiple calls', () => {
            const movieRating = MovieRating.create(
                validMovieRatingId,
                validTitle,
                validDescription,
                validStars,
                validAccountId,
            );

            const id1 = movieRating.getAggregateId();
            const id2 = movieRating.getAggregateId();

            expect(id1.toString()).toBe(id2.toString());
            expect(id1.toString()).toBe(validMovieRatingId.toString());
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
            expect(state.getId()).toBe(validMovieRatingId.toString());
        });

        it('should return undefined when no state is set', () => {
            const movieRating = new MovieRating();
            
            const state = movieRating.getState();
            expect(state).toBeUndefined();
        });

        it('should return consistent state across multiple calls', () => {
            const movieRating = MovieRating.create(
                validMovieRatingId,
                validTitle,
                validDescription,
                validStars,
                validAccountId,
            );

            const state1 = movieRating.getState();
            const state2 = movieRating.getState();

            expect(state1).toBe(state2);
            expect(state1.getId()).toBe(validMovieRatingId.toString());
        });
    });

    describe('integration with event recording', () => {
        it('should properly record and handle MovieRatingCreatedEvent during create', () => {
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

            // Update title - this automatically applies the event and updates state
            movieRating.updateTitle(updatedTitle);

            // Check that title update event was recorded
            expect(movieRating.getPendingEvents()).toHaveLength(1);
            const event = movieRating.getPendingEvents()[0] as MovieRatingTitleUpdatedEvent;
            expect(event.getTitle()).toBe(updatedTitle.toString());

            // Check that state was updated automatically
            const state = movieRating.getState() as MovieRatingState;
            expect(state.getTitle()).toBe(updatedTitle.toString());
        });

        it('should handle complete lifecycle with multiple updates and deletion', () => {
            const movieRating = MovieRating.create(
                validMovieRatingId,
                validTitle,
                validDescription,
                validStars,
                validAccountId,
            );
            movieRating.commitEvents();

            // Update title
            const newTitle = Title.fromString('Updated Title');
            movieRating.updateTitle(newTitle);
            expect(movieRating.getState().getTitle()).toBe(newTitle.toString());
            movieRating.commitEvents();

            // Update description
            const newDescription = Description.fromString('Updated Description');
            movieRating.updateDescription(newDescription);
            expect(movieRating.getState().getDescription()).toBe(newDescription.toString());
            movieRating.commitEvents();

            // Update stars
            const newStars = MovieRatingStars.fromNumber(4);
            movieRating.updateStars(newStars);
            expect(movieRating.getState().getStars()).toBe(newStars.toNumber());
            movieRating.commitEvents();

            // Delete
            movieRating.delete();
            movieRating.onMovieRatingDeletedEvent();
            expect(movieRating.getState().getTitle()).toBe('DELETED');
            expect(movieRating.getState().getDescription()).toBe('DELETED');
            expect(movieRating.getState().getStars()).toBe(0);
        });

        it('should handle mixed update operations', () => {
            const movieRating = MovieRating.create(
                validMovieRatingId,
                validTitle,
                validDescription,
                validStars,
                validAccountId,
            );
            movieRating.commitEvents();

            // Perform multiple updates without committing
            const newTitle = Title.fromString('New Title');
            const newDescription = Description.fromString('New Description');
            const newStars = MovieRatingStars.fromNumber(2);

            movieRating.updateTitle(newTitle);
            movieRating.updateDescription(newDescription);
            movieRating.updateStars(newStars);

            // Should have 3 pending events
            expect(movieRating.getPendingEvents()).toHaveLength(3);

            // State should be updated automatically
            const state = movieRating.getState();
            expect(state.getTitle()).toBe(newTitle.toString());
            expect(state.getDescription()).toBe(newDescription.toString());
            expect(state.getStars()).toBe(newStars.toNumber());
        });
    });

    describe('immutability and state consistency', () => {
        it('should maintain state consistency across multiple operations', () => {
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

        it('should maintain immutability during all update operations', () => {
            const movieRating = MovieRating.create(
                validMovieRatingId,
                validTitle,
                validDescription,
                validStars,
                validAccountId,
            );

            const originalState = movieRating.getState();
            const originalId = originalState.getId();
            const originalTitle = originalState.getTitle();
            const originalDescription = originalState.getDescription();
            const originalStars = originalState.getStars();
            const originalAccountId = originalState.getAccountId();
            const originalCreatedAt = originalState.getCreatedAt();

            // Perform updates
            const newTitle = Title.fromString('New Title');
            const newDescription = Description.fromString('New Description');
            const newStars = MovieRatingStars.fromNumber(1);

            movieRating.updateTitle(newTitle);
            movieRating.updateDescription(newDescription);
            movieRating.updateStars(newStars);

            const updatedState = movieRating.getState();

            // Original state should be unchanged (immutable)
            expect(originalState.getTitle()).toBe(originalTitle);
            expect(originalState.getDescription()).toBe(originalDescription);
            expect(originalState.getStars()).toBe(originalStars);
            expect(originalState.getId()).toBe(originalId);
            expect(originalState.getAccountId()).toBe(originalAccountId);
            expect(originalState.getCreatedAt()).toBe(originalCreatedAt);

            // New state should have updated values
            expect(updatedState.getTitle()).toBe(newTitle.toString());
            expect(updatedState.getDescription()).toBe(newDescription.toString());
            expect(updatedState.getStars()).toBe(newStars.toNumber());
            expect(updatedState.getId()).toBe(originalId);
            expect(updatedState.getAccountId()).toBe(originalAccountId);
            expect(updatedState.getCreatedAt()).toBe(originalCreatedAt);

            // States should be different instances
            expect(updatedState).not.toBe(originalState);
        });

        it('should handle event recording and state updates independently', () => {
            const movieRating = MovieRating.create(
                validMovieRatingId,
                validTitle,
                validDescription,
                validStars,
                validAccountId,
            );

            // Events should be recorded
            expect(movieRating.getPendingEvents()).toHaveLength(1);

            // State should be immediately available
            const state = movieRating.getState();
            expect(state).toBeDefined();
            expect(state.getId()).toBe(validMovieRatingId.toString());

            // Committing events should not affect state
            const stateBeforeCommit = movieRating.getState();
            movieRating.commitEvents();
            const stateAfterCommit = movieRating.getState();

            expect(stateBeforeCommit).toBe(stateAfterCommit);
            expect(movieRating.getPendingEvents()).toHaveLength(0);
        });
    });
});
