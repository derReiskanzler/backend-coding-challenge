import { MovieRatingDescriptionUpdatedEvent } from './movie-rating-description-updated.event';

describe('MovieRatingDescriptionUpdatedEvent', () => {
    const validEventData = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        description: 'testdescription',
    };

    describe('create', () => {
        it('should create a MovieRatingDescriptionUpdatedEvent instance with valid data', () => {
            const event = MovieRatingDescriptionUpdatedEvent.create(
                validEventData.id,
                validEventData.description,
            );

            expect(event).toBeInstanceOf(MovieRatingDescriptionUpdatedEvent);
            expect(event.getId()).toBe(validEventData.id);
            expect(event.getDescription()).toBe(validEventData.description);
            expect(event.getCreatedAt()).toBeInstanceOf(Date);
            expect(event.getEventName()).toBe('MovieRatingDescriptionUpdatedEvent');
        });
    });

    describe('immutability', () => {
        it('should maintain immutable state - multiple getter calls return same values', () => {
            const event = MovieRatingDescriptionUpdatedEvent.create(
                validEventData.id,
                validEventData.description,
            );

            const id1 = event.getId();
            const id2 = event.getId();
            const description1 = event.getDescription();
            const description2 = event.getDescription();

            expect(id1).toBe(id2);
            expect(description1).toBe(description2);
        });

        it('should be independent instances with same data', () => {
            const event1 = MovieRatingDescriptionUpdatedEvent.create(
                validEventData.id,
                validEventData.description,
            );

            const event2 = MovieRatingDescriptionUpdatedEvent.create(
                validEventData.id,
                validEventData.description,
            );

            // Different instances
            expect(event1).not.toBe(event2);
            
            // Same data
            expect(event1.getId()).toBe(event2.getId());
            expect(event1.getDescription()).toBe(event2.getDescription());
        });
    });

    describe('normalize (inherited from DomainEvent)', () => {
        it('should normalize the event to a plain object', () => {
            const event = MovieRatingDescriptionUpdatedEvent.create(
                validEventData.id,
                validEventData.description,
            );

            const normalized = event.normalize();

            expect(normalized).toEqual({
                id: validEventData.id,
                description: validEventData.description,
                createdAt: event.getCreatedAt().toISOString()
            });
        });

        it('should convert Date objects to ISO strings', () => {
            const event = MovieRatingDescriptionUpdatedEvent.create(
                validEventData.id,
                validEventData.description,
            );

            const normalized = event.normalize();

            expect(typeof normalized['createdAt']).toBe('string');
            expect(normalized['createdAt']).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
            expect(new Date(normalized['createdAt'])).toEqual(event.getCreatedAt());
        });

        it('should return consistent normalized data on multiple calls', () => {
            const event = MovieRatingDescriptionUpdatedEvent.create(
                validEventData.id,
                validEventData.description,
            );

            const normalized1 = event.normalize();
            const normalized2 = event.normalize();

            expect(normalized1).toEqual(normalized2);
        });
    });

    describe('denormalize (static method inherited from DomainEvent)', () => {
        it('should denormalize a plain object back to a MovieRatingCreatedEvent-like object', () => {
            const event = MovieRatingDescriptionUpdatedEvent.create(
                validEventData.id,
                validEventData.description,
            );

            const normalized = event.normalize();
            const denormalized = MovieRatingDescriptionUpdatedEvent.denormalize(normalized) as any;

            expect(denormalized.id).toBe(validEventData.id);
            expect(denormalized.description).toBe(validEventData.description);
            expect(denormalized.createdAt).toBe(normalized['createdAt']);
        });

        it('should handle ISO date strings in denormalization', () => {
            const testData = {
                id: validEventData.id,
                description: validEventData.description,
                createdAt: '2023-07-23T10:30:45.123Z'
            };

            const denormalized = MovieRatingDescriptionUpdatedEvent.denormalize(testData) as any;

            expect(denormalized.id).toBe(testData.id);
            expect(denormalized.description).toBe(testData.description);
            expect(denormalized.createdAt).toBe(testData.createdAt);
        });

        it('should handle partial data in denormalization', () => {
            const partialData = {
                id: validEventData.id,
                description: validEventData.description,
            };

            const denormalized = MovieRatingDescriptionUpdatedEvent.denormalize(partialData) as any;

            expect(denormalized.id).toBe(partialData.id);
            expect(denormalized.description).toBe(partialData.description);
        });
    });
});