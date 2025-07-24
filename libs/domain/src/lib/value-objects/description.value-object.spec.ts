import { Description } from './description.value-object';

describe('Description Value Object', () => {
    describe('fromString', () => {
        it('should create a Description instance from a valid string', () => {
            const descriptionValue = 'john_doe';

            const description = Description.fromString(descriptionValue);

            expect(description).toBeInstanceOf(Description);
            expect(description.toString()).toBe(descriptionValue);
        });

        it('should handle empty string', () => {
            const descriptionValue = '';

            expect(() => Description.fromString(descriptionValue)).toThrow(Error);
        });
    });

    describe('toString', () => {
        it('should return the original string value', () => {
            const originalValue = 'test_user';
            const description = Description.fromString(originalValue);

            const result = description.toString();

            expect(result).toBe(originalValue);
        });
    });

    describe('immutability', () => {
        it('should be immutable - multiple toString calls return same value', () => {
                const descriptionValue = 'immutable_user';
            const description = Description.fromString(descriptionValue);

            const result1 = description.toString();
            const result2 = description.toString();

            expect(result1).toBe(result2);
            expect(result1).toBe(descriptionValue);
        });
    });

    describe('equality', () => {
        it('should treat usernames with same string value as equal in content', () => {
            const description1 = Description.fromString('same_user');
            const description2 = Description.fromString('same_user');

            expect(description1.equals(description2)).toBe(true);
        });

        it('should be different instances even with same value', () => {
            const description1 = Description.fromString('same_user');
            const description2 = Description.fromString('same_user');

            expect(description1).not.toBe(description2);
            expect(description1.equals(description2)).toBe(true);
        });
    });
});