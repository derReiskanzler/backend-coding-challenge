import { UserSignedUpEvent } from './user-signed-up.event';

describe('UserSignedUpEvent', () => {
    const validEventData = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        username: 'testuser',
        passwordHash: 'hashed-password-123',
        salt: 'salt-value-456'
    };

    describe('create', () => {
        it('should create a UserSignedUpEvent instance with valid data', () => {
            const event = UserSignedUpEvent.create(
                validEventData.id,
                validEventData.username,
                validEventData.passwordHash,
                validEventData.salt
            );

            expect(event).toBeInstanceOf(UserSignedUpEvent);
            expect(event.getId()).toBe(validEventData.id);
            expect(event.getUsername()).toBe(validEventData.username);
            expect(event.getPasswordHash()).toBe(validEventData.passwordHash);
            expect(event.getSalt()).toBe(validEventData.salt);
            expect(event.getCreatedAt()).toBeInstanceOf(Date);
            expect(event.getEventName()).toBe('UserSignedUpEvent');
        });
    });

    describe('immutability', () => {
        it('should maintain immutable state - multiple getter calls return same values', () => {
            const event = UserSignedUpEvent.create(
                validEventData.id,
                validEventData.username,
                validEventData.passwordHash,
                validEventData.salt
            );

            const id1 = event.getId();
            const id2 = event.getId();
            const username1 = event.getUsername();
            const username2 = event.getUsername();
            const hash1 = event.getPasswordHash();
            const hash2 = event.getPasswordHash();
            const salt1 = event.getSalt();
            const salt2 = event.getSalt();

            expect(id1).toBe(id2);
            expect(username1).toBe(username2);
            expect(hash1).toBe(hash2);
            expect(salt1).toBe(salt2);
        });

        it('should be independent instances with same data', () => {
            const event1 = UserSignedUpEvent.create(
                validEventData.id,
                validEventData.username,
                validEventData.passwordHash,
                validEventData.salt
            );

            const event2 = UserSignedUpEvent.create(
                validEventData.id,
                validEventData.username,
                validEventData.passwordHash,
                validEventData.salt
            );

            // Different instances
            expect(event1).not.toBe(event2);
            
            // Same data
            expect(event1.getId()).toBe(event2.getId());
            expect(event1.getUsername()).toBe(event2.getUsername());
            expect(event1.getPasswordHash()).toBe(event2.getPasswordHash());
            expect(event1.getSalt()).toBe(event2.getSalt());
        });
    });

    describe('normalize (inherited from DomainEvent)', () => {
        it('should normalize the event to a plain object', () => {
            const event = UserSignedUpEvent.create(
                validEventData.id,
                validEventData.username,
                validEventData.passwordHash,
                validEventData.salt
            );

            const normalized = event.normalize();

            expect(normalized).toEqual({
                id: validEventData.id,
                username: validEventData.username,
                passwordHash: validEventData.passwordHash,
                salt: validEventData.salt,
                createdAt: event.getCreatedAt().toISOString()
            });
        });

        it('should convert Date objects to ISO strings', () => {
            const event = UserSignedUpEvent.create(
                validEventData.id,
                validEventData.username,
                validEventData.passwordHash,
                validEventData.salt
            );

            const normalized = event.normalize();

            expect(typeof normalized['createdAt']).toBe('string');
            expect(normalized['createdAt']).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
            expect(new Date(normalized['createdAt'])).toEqual(event.getCreatedAt());
        });

        it('should return consistent normalized data on multiple calls', () => {
            const event = UserSignedUpEvent.create(
                validEventData.id,
                validEventData.username,
                validEventData.passwordHash,
                validEventData.salt
            );

            const normalized1 = event.normalize();
            const normalized2 = event.normalize();

            expect(normalized1).toEqual(normalized2);
        });
    });

    describe('denormalize (static method inherited from DomainEvent)', () => {
        it('should denormalize a plain object back to a UserSignedUpEvent-like object', () => {
            const event = UserSignedUpEvent.create(
                validEventData.id,
                validEventData.username,
                validEventData.passwordHash,
                validEventData.salt
            );

            const normalized = event.normalize();
            const denormalized = UserSignedUpEvent.denormalize(normalized) as any;

            expect(denormalized.id).toBe(validEventData.id);
            expect(denormalized.username).toBe(validEventData.username);
            expect(denormalized.passwordHash).toBe(validEventData.passwordHash);
            expect(denormalized.salt).toBe(validEventData.salt);
            expect(denormalized.createdAt).toBe(normalized['createdAt']);
        });

        it('should handle ISO date strings in denormalization', () => {
            const testData = {
                id: validEventData.id,
                username: validEventData.username,
                passwordHash: validEventData.passwordHash,
                salt: validEventData.salt,
                createdAt: '2023-07-23T10:30:45.123Z'
            };

            const denormalized = UserSignedUpEvent.denormalize(testData) as any;

            expect(denormalized.id).toBe(testData.id);
            expect(denormalized.username).toBe(testData.username);
            expect(denormalized.passwordHash).toBe(testData.passwordHash);
            expect(denormalized.salt).toBe(testData.salt);
            expect(denormalized.createdAt).toBe(testData.createdAt);
        });

        it('should handle partial data in denormalization', () => {
            const partialData = {
                id: validEventData.id,
                username: validEventData.username
            };

            const denormalized = UserSignedUpEvent.denormalize(partialData) as any;

            expect(denormalized.id).toBe(partialData.id);
            expect(denormalized.username).toBe(partialData.username);
            expect(denormalized.passwordHash).toBeUndefined();
            expect(denormalized.salt).toBeUndefined();
        });
    });
});