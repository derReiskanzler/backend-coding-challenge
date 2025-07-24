import { Title } from './title.value-object';

describe('Title Value Object', () => {
    describe('fromString', () => {
        it('should create a Title instance from a valid string', () => {
            const titleValue = 'john_doe';

            const title = Title.fromString(titleValue);

            expect(title).toBeInstanceOf(Title);
            expect(title.toString()).toBe(titleValue);
        });

        it('should handle empty string', () => {
            const titleValue = '';

            expect(() => Title.fromString(titleValue)).toThrow(Error);
        });
    });

    describe('toString', () => {
        it('should return the original string value', () => {
            const originalValue = 'test_user';
            const title = Title.fromString(originalValue);

            const result = title.toString();

            expect(result).toBe(originalValue);
        });

        it('should trim the string with whitespace', () => {
            const originalValue = ' username with spaces ';
            const title = Title.fromString(originalValue);

            const result = title.toString();

            expect(result).toBe(originalValue.trim());
        });
    });

    describe('immutability', () => {
        it('should be immutable - multiple toString calls return same value', () => {
            const titleValue = 'immutable_user';
            const title = Title.fromString(titleValue);

            const result1 = title.toString();
            const result2 = title.toString();

            expect(result1).toBe(result2);
            expect(result1).toBe(titleValue);
        });
    });

    describe('equality', () => {
        it('should treat usernames with same string value as equal in content', () => {
            const title1 = Title.fromString('same_user');
            const title2 = Title.fromString('same_user');

            expect(title1.equals(title2)).toBe(true);
        });

        it('should be different instances even with same value', () => {
            const title1 = Title.fromString('same_user');
            const title2 = Title.fromString('same_user');

            expect(title1).not.toBe(title2);
            expect(title1.equals(title2)).toBe(true);
        });
    });
});