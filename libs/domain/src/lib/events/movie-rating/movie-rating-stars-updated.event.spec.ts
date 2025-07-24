import { MovieRatingStarsUpdatedEvent } from './movie-rating-stars-updated.event';

describe('MovieRatingStarsUpdatedEvent', () => {
    const validEventData = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        stars: 5,
    };

    describe('create', () => {
        it('should create a MovieRatingStarsUpdatedEvent instance with valid data', () => {
            const event = MovieRatingStarsUpdatedEvent.create(
                validEventData.id,
                validEventData.stars,
            );

            expect(event).toBeInstanceOf(MovieRatingStarsUpdatedEvent);
            expect(event.getId()).toBe(validEventData.id);
            expect(event.getStars()).toBe(validEventData.stars);
            expect(event.getCreatedAt()).toBeInstanceOf(Date);
            expect(event.getEventName()).toBe('MovieRatingStarsUpdatedEvent');
        });
    });

    describe('immutability', () => {
        it('should maintain immutable state - multiple getter calls return same values', () => {
            const event = MovieRatingStarsUpdatedEvent.create(
                validEventData.id,
                validEventData.stars,
            );

            const id1 = event.getId();
            const id2 = event.getId();
            const stars1 = event.getStars();
            const stars2 = event.getStars();

            expect(id1).toBe(id2);
            expect(stars1).toBe(stars2);
        });

        it('should be independent instances with same data', () => {
            const event1 = MovieRatingStarsUpdatedEvent.create(
                validEventData.id,
                validEventData.stars,
            );

            const event2 = MovieRatingStarsUpdatedEvent.create(
                validEventData.id,
                validEventData.stars,
            );

            // Different instances
            expect(event1).not.toBe(event2);
            
            // Same data
            expect(event1.getId()).toBe(event2.getId());
            expect(event1.getStars()).toBe(event2.getStars());
        });
    });

    describe('normalize (inherited from DomainEvent)', () => {
        it('should normalize the event to a plain object', () => {
            const event = MovieRatingStarsUpdatedEvent.create(
                validEventData.id,
                validEventData.stars,
            );

            const normalized = event.normalize();

            expect(normalized).toEqual({
                id: validEventData.id,
                stars: validEventData.stars,
                createdAt: event.getCreatedAt().toISOString()
            });
        });

        it('should convert Date objects to ISO strings', () => {
            const event = MovieRatingStarsUpdatedEvent.create(
                validEventData.id,
                validEventData.stars,
            );

            const normalized = event.normalize();

            expect(typeof normalized['createdAt']).toBe('string');
            expect(normalized['createdAt']).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
            expect(new Date(normalized['createdAt'])).toEqual(event.getCreatedAt());
        });

        it('should return consistent normalized data on multiple calls', () => {
            const event = MovieRatingStarsUpdatedEvent.create(
                validEventData.id,
                validEventData.stars,
            );

            const normalized1 = event.normalize();
            const normalized2 = event.normalize();

            expect(normalized1).toEqual(normalized2);
        });
    });

    describe('denormalize (static method inherited from DomainEvent)', () => {
        it('should denormalize a plain object back to a MovieRatingCreatedEvent-like object', () => {
            const event = MovieRatingStarsUpdatedEvent.create(
                validEventData.id,
                validEventData.stars,
            );

            const normalized = event.normalize();
            const denormalized = MovieRatingStarsUpdatedEvent.denormalize(normalized) as any;

            expect(denormalized.id).toBe(validEventData.id);
            expect(denormalized.stars).toBe(validEventData.stars);
            expect(denormalized.createdAt).toBe(normalized['createdAt']);
        });

        it('should handle ISO date strings in denormalization', () => {
            const testData = {
                id: validEventData.id,
                stars: validEventData.stars,
                createdAt: '2023-07-23T10:30:45.123Z'
            };

            const denormalized = MovieRatingStarsUpdatedEvent.denormalize(testData) as any;

            expect(denormalized.id).toBe(testData.id);
            expect(denormalized.stars).toBe(testData.stars);
            expect(denormalized.createdAt).toBe(testData.createdAt);
        });

        it('should handle partial data in denormalization', () => {
            const partialData = {
                id: validEventData.id,
                stars: validEventData.stars,
            };

            const denormalized = MovieRatingStarsUpdatedEvent.denormalize(partialData) as any;

            expect(denormalized.id).toBe(partialData.id);
            expect(denormalized.stars).toBe(partialData.stars);
        });
    });
});