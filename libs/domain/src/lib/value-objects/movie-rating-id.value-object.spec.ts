import { MovieRatingId } from './movie-rating-id.value-object';

describe('MovieRatingId Value Object', () => {
    describe('fromString', () => {
        it('should create an MovieRatingId instance from a valid UUID string', () => {
            const validUuid = '123e4567-e89b-12d3-a456-426614174000';

            const movieRatingId = MovieRatingId.fromString(validUuid);

            expect(movieRatingId).toBeInstanceOf(MovieRatingId);
            expect(movieRatingId.toString()).toBe(validUuid);
        });


        it('should create movieRatingId with uppercase UUID', () => {
            const validUuid = 'F47AC10B-58CC-4372-A567-0E02B2C3D479';

            const movieRatingId = MovieRatingId.fromString(validUuid);

            expect(movieRatingId.toString()).toBe(validUuid);
        });

        it('should throw error for non-UUID string', () => {
            const invalidId = 'account_12345';

            expect(() => MovieRatingId.fromString(invalidId)).toThrow(Error);
        });

        it('should throw error for malformed UUID-like strings, e.g. missing one character', () => {
            const malformedUuid = '123e4567-e89b-12d3-a456-42661417400';

            expect(() => MovieRatingId.fromString(malformedUuid)).toThrow(Error);
        });

        it('should throw error for empty string', () => {
            const movieRatingIdValue = '';

            expect(() => MovieRatingId.fromString(movieRatingIdValue)).toThrow(Error);
        });
    });

    describe('toString', () => {
        it('should return the original UUID string value', () => {
            const originalValue = '550e8400-e29b-41d4-a716-446655440000';
            const movieRatingId = MovieRatingId.fromString(originalValue);

            const result = movieRatingId.toString();

            expect(result).toBe(originalValue);
        });

        it('should preserve the exact UUID string including case', () => {
            const originalValue = 'F47AC10B-58CC-4372-A567-0E02B2C3D479';
            const movieRatingId = MovieRatingId.fromString(originalValue);

            const result = movieRatingId.toString();

            expect(result).toBe(originalValue);
        });
    });

    describe('immutability', () => {
        it('should be immutable - multiple toString calls return same value', () => {
            const movieRatingIdValue = '6ba7b810-9dad-11d1-80b4-00c04fd430c8';
            const movieRatingId = MovieRatingId.fromString(movieRatingIdValue);

            const result1 = movieRatingId.toString();
            const result2 = movieRatingId.toString();

            expect(result1).toBe(result2);
            expect(result1).toBe(movieRatingIdValue);
        });
    });

    describe('equality', () => {
        it('should treat account IDs with same UUID value as equal in content', () => {
            const movieRatingIdValue = '6ba7b811-9dad-11d1-80b4-00c04fd430c8';
            const movieRatingId1 = MovieRatingId.fromString(movieRatingIdValue);
            const movieRatingId2 = MovieRatingId.fromString(movieRatingIdValue);

            expect(movieRatingId1.toString()).toBe(movieRatingId2.toString());
        });

        it('should be different instances even with same UUID value', () => {
            const movieRatingIdValue = '6ba7b812-9dad-11d1-80b4-00c04fd430c8';
            const movieRatingId1 = MovieRatingId.fromString(movieRatingIdValue);
            const movieRatingId2 = MovieRatingId.fromString(movieRatingIdValue);

            expect(movieRatingId1).not.toBe(movieRatingId2);
            expect(movieRatingId1.toString()).toBe(movieRatingId2.toString());
        });
    });
});