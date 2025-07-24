import { Username } from './username.value-object';

describe('Username Value Object', () => {
    describe('fromString', () => {
        it('should create a Username instance from a valid string', () => {
            const usernameValue = 'john_doe';

            const username = Username.fromString(usernameValue);

            expect(username).toBeInstanceOf(Username);
            expect(username.toString()).toBe(usernameValue);
        });

        it('should handle empty string', () => {
            const usernameValue = '';

            expect(() => Username.fromString(usernameValue)).toThrow(Error);
        });
    });

    describe('toString', () => {
        it('should return the original string value', () => {
            const originalValue = 'test_user';
            const username = Username.fromString(originalValue);

            const result = username.toString();

            expect(result).toBe(originalValue);
        });

        it('should trim the string with whitespace', () => {
            const originalValue = ' username with spaces ';
            const username = Username.fromString(originalValue);

            const result = username.toString();

            expect(result).toBe(originalValue.trim());
        });
    });

    describe('immutability', () => {
        it('should be immutable - multiple toString calls return same value', () => {
            const usernameValue = 'immutable_user';
            const username = Username.fromString(usernameValue);

            const result1 = username.toString();
            const result2 = username.toString();

            expect(result1).toBe(result2);
            expect(result1).toBe(usernameValue);
        });
    });

    describe('equality', () => {
        it('should treat usernames with same string value as equal in content', () => {
            const username1 = Username.fromString('same_user');
            const username2 = Username.fromString('same_user');

            expect(username1.equals(username2)).toBe(true);
        });

        it('should be different instances even with same value', () => {
            const username1 = Username.fromString('same_user');
            const username2 = Username.fromString('same_user');

            expect(username1).not.toBe(username2);
            expect(username1.equals(username2)).toBe(true);
        });
    });
});