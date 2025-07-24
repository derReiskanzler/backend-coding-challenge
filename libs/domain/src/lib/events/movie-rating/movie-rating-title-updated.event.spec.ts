import { MovieRatingTitleUpdatedEvent } from './movie-rating-title-updated.event';

describe('MovieRatingTitleUpdatedEvent', () => {
    const validEventData = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        title: 'testtitle',
    };

    describe('create', () => {
        it('should create a MovieRatingTitleUpdatedEvent instance with valid data', () => {
            const event = MovieRatingTitleUpdatedEvent.create(
                validEventData.id,
                validEventData.title,
            );

            expect(event).toBeInstanceOf(MovieRatingTitleUpdatedEvent);
            expect(event.getId()).toBe(validEventData.id);
            expect(event.getTitle()).toBe(validEventData.title);
            expect(event.getCreatedAt()).toBeInstanceOf(Date);
            expect(event.getEventName()).toBe('MovieRatingTitleUpdatedEvent');
        });
    });

    describe('immutability', () => {
        it('should maintain immutable state - multiple getter calls return same values', () => {
            const event = MovieRatingTitleUpdatedEvent.create(
                validEventData.id,
                validEventData.title,
            );

            const id1 = event.getId();
            const id2 = event.getId();
            const title1 = event.getTitle();
            const title2 = event.getTitle();

            expect(id1).toBe(id2);
            expect(title1).toBe(title2);
        });

        it('should be independent instances with same data', () => {
                const event1 = MovieRatingTitleUpdatedEvent.create(
                validEventData.id,
                validEventData.title,
            );

            const event2 = MovieRatingTitleUpdatedEvent.create(
                validEventData.id,
                validEventData.title,
            );

            // Different instances
            expect(event1).not.toBe(event2);
            
            // Same data
            expect(event1.getId()).toBe(event2.getId());
            expect(event1.getTitle()).toBe(event2.getTitle());
        });
    });

    describe('normalize (inherited from DomainEvent)', () => {
        it('should normalize the event to a plain object', () => {
            const event = MovieRatingTitleUpdatedEvent.create(
                validEventData.id,
                validEventData.title,
            );

            const normalized = event.normalize();

            expect(normalized).toEqual({
                id: validEventData.id,
                title: validEventData.title,
                createdAt: event.getCreatedAt().toISOString()
            });
        });

        it('should convert Date objects to ISO strings', () => {
            const event = MovieRatingTitleUpdatedEvent.create(
                validEventData.id,
                validEventData.title,
            );

            const normalized = event.normalize();

            expect(typeof normalized['createdAt']).toBe('string');
            expect(normalized['createdAt']).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
            expect(new Date(normalized['createdAt'])).toEqual(event.getCreatedAt());
        });

        it('should return consistent normalized data on multiple calls', () => {
            const event = MovieRatingTitleUpdatedEvent.create(
                validEventData.id,
                validEventData.title,
            );

            const normalized1 = event.normalize();
            const normalized2 = event.normalize();

            expect(normalized1).toEqual(normalized2);
        });
    });

    describe('denormalize (static method inherited from DomainEvent)', () => {
        it('should denormalize a plain object back to a MovieRatingCreatedEvent-like object', () => {
            const event = MovieRatingTitleUpdatedEvent.create(
                validEventData.id,
                validEventData.title,
            );

            const normalized = event.normalize();
            const denormalized = MovieRatingTitleUpdatedEvent.denormalize(normalized) as any;

            expect(denormalized.id).toBe(validEventData.id);
            expect(denormalized.title).toBe(validEventData.title);
            expect(denormalized.createdAt).toBe(normalized['createdAt']);
        });

        it('should handle ISO date strings in denormalization', () => {
            const testData = {
                id: validEventData.id,
                title: validEventData.title,
                createdAt: '2023-07-23T10:30:45.123Z'
            };

            const denormalized = MovieRatingTitleUpdatedEvent.denormalize(testData) as any;

            expect(denormalized.id).toBe(testData.id);
            expect(denormalized.title).toBe(testData.title);
            expect(denormalized.createdAt).toBe(testData.createdAt);
        });

        it('should handle partial data in denormalization', () => {
            const partialData = {
                id: validEventData.id,
                title: validEventData.title,
            };

            const denormalized = MovieRatingTitleUpdatedEvent.denormalize(partialData) as any;

            expect(denormalized.id).toBe(partialData.id);
            expect(denormalized.title).toBe(partialData.title);
        });
    });
});