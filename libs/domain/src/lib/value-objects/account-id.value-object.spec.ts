import { AccountId } from './account-id.value-object';

describe('AccountId Value Object', () => {
    describe('fromString', () => {
        it('should create an AccountId instance from a valid UUID string', () => {
            const validUuid = '123e4567-e89b-12d3-a456-426614174000';

            const accountId = AccountId.fromString(validUuid);

            expect(accountId).toBeInstanceOf(AccountId);
            expect(accountId.toString()).toBe(validUuid);
        });


        it('should create AccountId with uppercase UUID', () => {
            const validUuid = 'F47AC10B-58CC-4372-A567-0E02B2C3D479';

            const accountId = AccountId.fromString(validUuid);

            expect(accountId.toString()).toBe(validUuid);
        });

        it('should throw error for non-UUID string', () => {
            const invalidId = 'account_12345';

            expect(() => AccountId.fromString(invalidId)).toThrow(Error);
        });

        it('should throw error for malformed UUID-like strings, e.g. missing one character', () => {
            const malformedUuid = '123e4567-e89b-12d3-a456-42661417400';

            expect(() => AccountId.fromString(malformedUuid)).toThrow(Error);
        });

        it('should throw error for empty string', () => {
            const accountIdValue = '';

            expect(() => AccountId.fromString(accountIdValue)).toThrow(Error);
        });
    });

    describe('toString', () => {
        it('should return the original UUID string value', () => {
            const originalValue = '550e8400-e29b-41d4-a716-446655440000';
            const accountId = AccountId.fromString(originalValue);

            const result = accountId.toString();

            expect(result).toBe(originalValue);
        });

        it('should preserve the exact UUID string including case', () => {
            const originalValue = 'F47AC10B-58CC-4372-A567-0E02B2C3D479';
            const accountId = AccountId.fromString(originalValue);

            const result = accountId.toString();

            expect(result).toBe(originalValue);
        });
    });

    describe('immutability', () => {
        it('should be immutable - multiple toString calls return same value', () => {
            const accountIdValue = '6ba7b810-9dad-11d1-80b4-00c04fd430c8';
            const accountId = AccountId.fromString(accountIdValue);

            const result1 = accountId.toString();
            const result2 = accountId.toString();

            expect(result1).toBe(result2);
            expect(result1).toBe(accountIdValue);
        });
    });

    describe('equality', () => {
        it('should treat account IDs with same UUID value as equal in content', () => {
            const accountIdValue = '6ba7b811-9dad-11d1-80b4-00c04fd430c8';
            const accountId1 = AccountId.fromString(accountIdValue);
            const accountId2 = AccountId.fromString(accountIdValue);

            expect(accountId1.toString()).toBe(accountId2.toString());
        });

        it('should be different instances even with same UUID value', () => {
            const accountIdValue = '6ba7b812-9dad-11d1-80b4-00c04fd430c8';
            const accountId1 = AccountId.fromString(accountIdValue);
            const accountId2 = AccountId.fromString(accountIdValue);

            expect(accountId1).not.toBe(accountId2);
            expect(accountId1.toString()).toBe(accountId2.toString());
        });
    });
});