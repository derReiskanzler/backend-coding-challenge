import { MovieRatingCreatedEvent } from './movie-rating-created.event';

describe('MovieRatingCreatedEvent', () => {
    const validEventData = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        title: 'testtitle',
        description: 'testdescription',
        stars: 1,
        accountId: '123e4567-e89b-12d3-a456-426614174000'
    };

    describe('create', () => {
        it('should create a MovieRatingCreatedEvent instance with valid data', () => {
            const event = MovieRatingCreatedEvent.create(
                validEventData.id,
                validEventData.title,
                validEventData.description,
                validEventData.stars,
                validEventData.accountId
            );

            expect(event).toBeInstanceOf(MovieRatingCreatedEvent);
            expect(event.getId()).toBe(validEventData.id);
            expect(event.getTitle()).toBe(validEventData.title);
            expect(event.getDescription()).toBe(validEventData.description);
            expect(event.getStars()).toBe(validEventData.stars);
            expect(event.getAccountId()).toBe(validEventData.accountId);
            expect(event.getCreatedAt()).toBeInstanceOf(Date);
            expect(event.getEventName()).toBe('MovieRatingCreatedEvent');
        });
    });

    describe('immutability', () => {
        it('should maintain immutable state - multiple getter calls return same values', () => {
            const event = MovieRatingCreatedEvent.create(
                validEventData.id,
                validEventData.title,
                validEventData.description,
                validEventData.stars,
                validEventData.accountId
            );

            const id1 = event.getId();
            const id2 = event.getId();
            const title1 = event.getTitle();
            const title2 = event.getTitle();
            const description1 = event.getDescription();
            const description2 = event.getDescription();
            const stars1 = event.getStars();
            const stars2 = event.getStars();
            const accountId1 = event.getAccountId();
            const accountId2 = event.getAccountId();

            expect(id1).toBe(id2);
            expect(title1).toBe(title2);
            expect(description1).toBe(description2);
            expect(stars1).toBe(stars2);
            expect(accountId1).toBe(accountId2);
        });

        it('should be independent instances with same data', () => {
            const event1 = MovieRatingCreatedEvent.create(
                validEventData.id,
                validEventData.title,
                validEventData.description,
                validEventData.stars,
                validEventData.accountId
            );

            const event2 = MovieRatingCreatedEvent.create(
                validEventData.id,
                validEventData.title,
                validEventData.description,
                validEventData.stars,
                validEventData.accountId
            );

            // Different instances
            expect(event1).not.toBe(event2);
            
            // Same data
            expect(event1.getId()).toBe(event2.getId());
            expect(event1.getTitle()).toBe(event2.getTitle());
            expect(event1.getDescription()).toBe(event2.getDescription());
            expect(event1.getStars()).toBe(event2.getStars());
            expect(event1.getAccountId()).toBe(event2.getAccountId());
        });
    });

    describe('normalize (inherited from DomainEvent)', () => {
        it('should normalize the event to a plain object', () => {
            const event = MovieRatingCreatedEvent.create(
                validEventData.id,
                validEventData.title,
                validEventData.description,
                validEventData.stars,
                validEventData.accountId
            );

            const normalized = event.normalize();

            expect(normalized).toEqual({
                id: validEventData.id,
                title: validEventData.title,
                description: validEventData.description,
                stars: validEventData.stars,
                accountId: validEventData.accountId,
                createdAt: event.getCreatedAt().toISOString()
            });
        });

        it('should convert Date objects to ISO strings', () => {
            const event = MovieRatingCreatedEvent.create(
                validEventData.id,
                validEventData.title,
                validEventData.description,
                validEventData.stars,
                validEventData.accountId
            );

            const normalized = event.normalize();

            expect(typeof normalized['createdAt']).toBe('string');
            expect(normalized['createdAt']).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
            expect(new Date(normalized['createdAt'])).toEqual(event.getCreatedAt());
        });

        it('should return consistent normalized data on multiple calls', () => {
            const event = MovieRatingCreatedEvent.create(
                validEventData.id,
                validEventData.title,
                validEventData.description,
                validEventData.stars,
                validEventData.accountId
            );

            const normalized1 = event.normalize();
            const normalized2 = event.normalize();

            expect(normalized1).toEqual(normalized2);
        });
    });

    describe('denormalize (static method inherited from DomainEvent)', () => {
        it('should denormalize a plain object back to a MovieRatingCreatedEvent-like object', () => {
            const event = MovieRatingCreatedEvent.create(
                validEventData.id,
                validEventData.title,
                validEventData.description,
                validEventData.stars,
                validEventData.accountId
            );

            const normalized = event.normalize();
            const denormalized = MovieRatingCreatedEvent.denormalize(normalized) as any;

            expect(denormalized.id).toBe(validEventData.id);
            expect(denormalized.title).toBe(validEventData.title);
            expect(denormalized.description).toBe(validEventData.description);
            expect(denormalized.stars).toBe(validEventData.stars);
            expect(denormalized.accountId).toBe(validEventData.accountId);
            expect(denormalized.createdAt).toBe(normalized['createdAt']);
        });

        it('should handle ISO date strings in denormalization', () => {
            const testData = {
                id: validEventData.id,
                title: validEventData.title,
                description: validEventData.description,
                stars: validEventData.stars,
                accountId: validEventData.accountId,
                createdAt: '2023-07-23T10:30:45.123Z'
            };

            const denormalized = MovieRatingCreatedEvent.denormalize(testData) as any;

            expect(denormalized.id).toBe(testData.id);
            expect(denormalized.title).toBe(testData.title);
            expect(denormalized.description).toBe(testData.description);
            expect(denormalized.stars).toBe(testData.stars);
            expect(denormalized.accountId).toBe(testData.accountId);
            expect(denormalized.createdAt).toBe(testData.createdAt);
        });

        it('should handle partial data in denormalization', () => {
            const partialData = {
                id: validEventData.id,
                title: validEventData.title,
                description: validEventData.description,
                stars: validEventData.stars,
                accountId: validEventData.accountId
            };

            const denormalized = MovieRatingCreatedEvent.denormalize(partialData) as any;

            expect(denormalized.id).toBe(partialData.id);
            expect(denormalized.title).toBe(partialData.title);
            expect(denormalized.description).toBe(partialData.description);
            expect(denormalized.stars).toBe(partialData.stars);
            expect(denormalized.accountId).toBe(partialData.accountId);
        });
    });
});