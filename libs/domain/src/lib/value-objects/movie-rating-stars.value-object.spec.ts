import { MovieRatingStars } from './movie-rating-stars.value-object';

describe('MovieRatingStars Value Object', () => {
    describe('fromString', () => {
        it('should create an MovieRatingStars instance from a valid number', () => {
            const validNumber = 1;

            const movieRatingStars = MovieRatingStars.fromNumber(validNumber);

            expect(movieRatingStars).toBeInstanceOf(MovieRatingStars);
            expect(movieRatingStars.toNumber()).toBe(validNumber);
        });

        it('should create an MovieRatingStars instance from a double number', () => {
            const validNumber = 1.5;

            const movieRatingStars = MovieRatingStars.fromNumber(validNumber);

            expect(movieRatingStars).toBeInstanceOf(MovieRatingStars);
            expect(movieRatingStars.toNumber()).toBe(1.5);
        });

        it('should throw error for number less than 0', () => {
            const invalidNumber = -1;

            expect(() => MovieRatingStars.fromNumber(invalidNumber)).toThrow(Error);
        });

        it('should throw error for number greater than 5', () => {
            const invalidNumber = 6;

            expect(() => MovieRatingStars.fromNumber(invalidNumber)).toThrow(Error);
        });
    });

    describe('toNumber', () => {
        it('should return the original number value', () => {
            const originalValue = 1;
            const movieRatingStars = MovieRatingStars.fromNumber(originalValue);

            const result = movieRatingStars.toNumber();

            expect(result).toBe(originalValue);
        });
    });

    describe('toString', () => {
        it('should return the original number value as string', () => {
            const originalValue = 1;
            const movieRatingStars = MovieRatingStars.fromNumber(originalValue);

            const result = movieRatingStars.toString();

            expect(result).toBe(originalValue.toString());
        });
    });

    describe('immutability', () => {
        it('should be immutable - multiple toString calls return same value', () => {
            const movieRatingStarsValue = 1;
            const movieRatingStars = MovieRatingStars.fromNumber(movieRatingStarsValue);

            const result1 = movieRatingStars.toNumber();
            const result2 = movieRatingStars.toNumber();

            expect(result1).toBe(result2);
            expect(result1).toBe(movieRatingStarsValue);
        });
    });

    describe('equality', () => {
        it('should treat movie rating stars with same number value as equal in content', () => {
            const movieRatingStarsValue = 1;
            const movieRatingStars1 = MovieRatingStars.fromNumber(movieRatingStarsValue);
            const movieRatingStars2 = MovieRatingStars.fromNumber(movieRatingStarsValue);

            expect(movieRatingStars1.equals(movieRatingStars2)).toBe(true);
        });

        it('should be different instances even with same number value', () => {
            const movieRatingStarsValue = 2;
            const movieRatingStars1 = MovieRatingStars.fromNumber(movieRatingStarsValue);
            const movieRatingStars2 = MovieRatingStars.fromNumber(movieRatingStarsValue);

            expect(movieRatingStars1).not.toBe(movieRatingStars2);
            expect(movieRatingStars1.equals(movieRatingStars2)).toBe(true);
        });
    });
});