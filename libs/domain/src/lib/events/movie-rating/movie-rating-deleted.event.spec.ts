import { MovieRatingDeletedEvent } from './movie-rating-deleted.event';

describe('MovieRatingDeletedEvent', () => {
    const validEventData = {
        id: '123e4567-e89b-12d3-a456-426614174000',
    };

    describe('create', () => {
        it('should create a MovieRatingDeletedEvent instance with valid data', () => {
            const event = MovieRatingDeletedEvent.create(
                validEventData.id,
            );

            expect(event).toBeInstanceOf(MovieRatingDeletedEvent);
            expect(event.getId()).toBe(validEventData.id);
            expect(event.getCreatedAt()).toBeInstanceOf(Date);
            expect(event.getEventName()).toBe('MovieRatingDeletedEvent');
        });
    });

    describe('immutability', () => {
        it('should maintain immutable state - multiple getter calls return same values', () => {
            const event = MovieRatingDeletedEvent.create(
                validEventData.id,
            );

            const id1 = event.getId();
            const id2 = event.getId();

            expect(id1).toBe(id2);
        });

        it('should be independent instances with same data', () => {
                const event1 = MovieRatingDeletedEvent.create(
                validEventData.id,
            );

            const event2 = MovieRatingDeletedEvent.create(
                validEventData.id,
            );

            // Different instances
            expect(event1).not.toBe(event2);
            
            // Same data
            expect(event1.getId()).toBe(event2.getId());
        });
    });

    describe('normalize (inherited from DomainEvent)', () => {
        it('should normalize the event to a plain object', () => {
            const event = MovieRatingDeletedEvent.create(
                validEventData.id,
            );

            const normalized = event.normalize();

            expect(normalized).toEqual({
                id: validEventData.id,
                createdAt: event.getCreatedAt().toISOString()
            });
        });

        it('should convert Date objects to ISO strings', () => {
            const event = MovieRatingDeletedEvent.create(
                validEventData.id,
            );

            const normalized = event.normalize();

            expect(typeof normalized['createdAt']).toBe('string');
            expect(normalized['createdAt']).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
            expect(new Date(normalized['createdAt'])).toEqual(event.getCreatedAt());
        });

        it('should return consistent normalized data on multiple calls', () => {
            const event = MovieRatingDeletedEvent.create(
                validEventData.id,
            );

            const normalized1 = event.normalize();
            const normalized2 = event.normalize();

            expect(normalized1).toEqual(normalized2);
        });
    });

    describe('denormalize (static method inherited from DomainEvent)', () => {
        it('should denormalize a plain object back to a MovieRatingCreatedEvent-like object', () => {
            const event = MovieRatingDeletedEvent.create(
                validEventData.id,
            );

            const normalized = event.normalize();
            const denormalized = MovieRatingDeletedEvent.denormalize(normalized) as any;

            expect(denormalized.id).toBe(validEventData.id);
            expect(denormalized.createdAt).toBe(normalized['createdAt']);
        });

        it('should handle ISO date strings in denormalization', () => {
            const testData = {
                id: validEventData.id,
                createdAt: '2023-07-23T10:30:45.123Z'
            };

            const denormalized = MovieRatingDeletedEvent.denormalize(testData) as any;

            expect(denormalized.id).toBe(testData.id);
            expect(denormalized.createdAt).toBe(testData.createdAt);
        });

        it('should handle partial data in denormalization', () => {
            const partialData = {
                id: validEventData.id,
            };

            const denormalized = MovieRatingDeletedEvent.denormalize(partialData) as any;

            expect(denormalized.id).toBe(partialData.id);
        });
    });
});