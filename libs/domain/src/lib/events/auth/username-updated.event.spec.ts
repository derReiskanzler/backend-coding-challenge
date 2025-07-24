import { UsernameUpdatedEvent } from './username-updated.event';

describe('UsernameUpdatedEvent', () => {
    const validEventData = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        username: 'testuser',
    };

    describe('create', () => {
        it('should create a UsernameUpdatedEvent instance with valid data', () => {
            const event = UsernameUpdatedEvent.create(
                validEventData.id,
                validEventData.username,
            );

            expect(event).toBeInstanceOf(UsernameUpdatedEvent);
            expect(event.getId()).toBe(validEventData.id);
            expect(event.getUsername()).toBe(validEventData.username);
            expect(event.getCreatedAt()).toBeInstanceOf(Date);
            expect(event.getEventName()).toBe('UsernameUpdatedEvent');
        });
    });

    describe('immutability', () => {
        it('should maintain immutable state - multiple getter calls return same values', () => {
            const event = UsernameUpdatedEvent.create(
                validEventData.id,
                validEventData.username,
            );

            const id1 = event.getId();
            const id2 = event.getId();
            const username1 = event.getUsername();
            const username2 = event.getUsername();

            expect(id1).toBe(id2);
            expect(username1).toBe(username2);
        });

        it('should be independent instances with same data', () => {
            const event1 = UsernameUpdatedEvent.create(
                validEventData.id,
                validEventData.username,
            );

            const event2 = UsernameUpdatedEvent.create(
                validEventData.id,
                validEventData.username,
            );

            // Different instances
            expect(event1).not.toBe(event2);
            
            // Same data
            expect(event1.getId()).toBe(event2.getId());
            expect(event1.getUsername()).toBe(event2.getUsername());
        });
    });

    describe('normalize (inherited from DomainEvent)', () => {
        it('should normalize the event to a plain object', () => {
            const event = UsernameUpdatedEvent.create(
                validEventData.id,
                validEventData.username,
            );

            const normalized = event.normalize();

            expect(normalized).toEqual({
                id: validEventData.id,
                username: validEventData.username,
                createdAt: event.getCreatedAt().toISOString()
            });
        });

        it('should convert Date objects to ISO strings', () => {
            const event = UsernameUpdatedEvent.create(
                validEventData.id,
                validEventData.username,
            );

            const normalized = event.normalize();

            expect(typeof normalized['createdAt']).toBe('string');
            expect(normalized['createdAt']).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
            expect(new Date(normalized['createdAt'])).toEqual(event.getCreatedAt());
        });

        it('should return consistent normalized data on multiple calls', () => {
            const event = UsernameUpdatedEvent.create(
                validEventData.id,
                validEventData.username,
            );

            const normalized1 = event.normalize();
            const normalized2 = event.normalize();

            expect(normalized1).toEqual(normalized2);
        });
    });

    describe('denormalize (static method inherited from DomainEvent)', () => {
        it('should denormalize a plain object back to a UsernameUpdatedEvent-like object', () => {
            const event = UsernameUpdatedEvent.create(
                validEventData.id,
                validEventData.username,
            );

            const normalized = event.normalize();
            const denormalized = UsernameUpdatedEvent.denormalize(normalized) as any;

            expect(denormalized.id).toBe(validEventData.id);
            expect(denormalized.username).toBe(validEventData.username);
            expect(denormalized.createdAt).toBe(normalized['createdAt']);
        });

        it('should handle ISO date strings in denormalization', () => {
            const testData = {
                id: validEventData.id,
                username: validEventData.username,
                createdAt: '2023-07-23T10:30:45.123Z'
            };

            const denormalized = UsernameUpdatedEvent.denormalize(testData) as any;

            expect(denormalized.id).toBe(testData.id);
            expect(denormalized.username).toBe(testData.username);
            expect(denormalized.createdAt).toBe(testData.createdAt);
        });

        it('should handle partial data in denormalization', () => {
            const partialData = {
                id: validEventData.id,
                username: validEventData.username
            };

            const denormalized = UsernameUpdatedEvent.denormalize(partialData) as any;

            expect(denormalized.id).toBe(partialData.id);
            expect(denormalized.username).toBe(partialData.username);
            expect(denormalized.passwordHash).toBeUndefined();
            expect(denormalized.salt).toBeUndefined();
        });
    });
});