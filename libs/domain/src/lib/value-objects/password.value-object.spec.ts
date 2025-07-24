import { Password } from './password.value-object';

describe('Password Value Object', () => {
    describe('fromString', () => {
        it('should create a Password instance from a valid password', () => {
            const validPassword = 'ValidPass123!';

            const password = Password.fromString(validPassword);

            expect(password).toBeInstanceOf(Password);
            expect(password.toString()).toBe(validPassword);
        });

        describe('validation errors', () => {
            it('should throw error for empty password', () => {
                const emptyPassword = '';

                expect(() => Password.fromString(emptyPassword)).toThrow(Error);
                expect(() => Password.fromString(emptyPassword)).toThrow('Password cannot be empty');
            });

            it('should throw error for password with spaces', () => {
                const passwordWithSpaces = 'Valid Pass123!';

                expect(() => Password.fromString(passwordWithSpaces)).toThrow(Error);
                expect(() => Password.fromString(passwordWithSpaces)).toThrow('Password cannot contain empty spaces');
            });

            it('should throw error for password shorter than 8 characters', () => {
                const shortPassword = 'Short1!';

                expect(() => Password.fromString(shortPassword)).toThrow(Error);
                expect(() => Password.fromString(shortPassword)).toThrow('Password must be at least 8 characters long');
            });

            it('should throw error for password without lowercase letter', () => {
                const noLowercase = 'ONLY_UPPERCASE123!';

                expect(() => Password.fromString(noLowercase)).toThrow(Error);
                expect(() => Password.fromString(noLowercase)).toThrow('Password must contain at least one lowercase letter');
            });

            it('should throw error for password without uppercase letter', () => {
                const noUppercase = 'no_uppercase123!';

                expect(() => Password.fromString(noUppercase)).toThrow(Error);
                expect(() => Password.fromString(noUppercase)).toThrow('Password must contain at least one uppercase letter');
            });

            it('should throw error for password without special character', () => {
                const noSpecialChar = 'PassWithoutSpecialChar123';

                expect(() => Password.fromString(noSpecialChar)).toThrow(Error);
                expect(() => Password.fromString(noSpecialChar)).toThrow('Password must contain at least one special character');
            });

            it('should throw error for password without number', () => {
                const noNumber = 'PassWithoutNumber!';

                expect(() => Password.fromString(noNumber)).toThrow(Error);
                expect(() => Password.fromString(noNumber)).toThrow('Password must contain at least one number');
            });

            it('should throw error for password with multiple validation failures', () => {
                const invalidPassword = 'abc';

                expect(() => Password.fromString(invalidPassword)).toThrow(Error);
            });
        });
    });

    describe('toString', () => {
        it('should return the original password string', () => {
            const originalPassword = 'MySecureP@ssw0rd!';
            const password = Password.fromString(originalPassword);

            const result = password.toString();

            expect(result).toBe(originalPassword);
        });

        it('should preserve exact password including all special characters', () => {
            const originalPassword = 'C0mplex!P@$$w0rd#2024&';
            const password = Password.fromString(originalPassword);

            const result = password.toString();

            expect(result).toBe(originalPassword);
        });
    });

    describe('immutability', () => {
        it('should be immutable - multiple toString calls return same value', () => {
            const passwordValue = 'ImmutableP@ss123!';
            const password = Password.fromString(passwordValue);

            const result1 = password.toString();
            const result2 = password.toString();

            expect(result1).toBe(result2);
            expect(result1).toBe(passwordValue);
        });
    });

    describe('equality', () => {
        it('should treat passwords with same string value as equal in content', () => {
            const passwordValue = 'SameP@ssw0rd!';
            const password1 = Password.fromString(passwordValue);
            const password2 = Password.fromString(passwordValue);

            expect(password1.toString()).toBe(password2.toString());
        });

        it('should be different instances even with same password value', () => {
            const passwordValue = 'SameP@ssw0rd!';
            const password1 = Password.fromString(passwordValue);
            const password2 = Password.fromString(passwordValue);

            expect(password1).not.toBe(password2);
            expect(password1.toString()).toBe(password2.toString());
        });
    });
});