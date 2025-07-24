import { ReadmodelDocument } from '@backend-monorepo/boilerplate';
import { MovieRatingDocument } from './movie-rating.document';

describe('MovieRatingDocument', () => {
    const validId = '123e4567-e89b-12d3-a456-426614174000';
    const validTitle = 'The Matrix';
    const validDescription = 'A computer hacker learns about the true nature of his reality and is drawn into a rebellion against powerful artificial intelligence.';
    const validStars = 5;
    const validAccountId = '123e4567-e89b-12d3-a456-426614174000';

    it('should create instance with valid id and username', () => {
        const document = new MovieRatingDocument(validId, validTitle, validDescription, validStars, validAccountId);

        expect(document).toBeInstanceOf(MovieRatingDocument);
    });

    it('should store id and title, description, stars and accountId correctly', () => {
        const document = new MovieRatingDocument(validId, validTitle, validDescription, validStars, validAccountId);

        expect(document.id).toBe(validId);
        expect(document.title).toBe(validTitle);
        expect(document.description).toBe(validDescription);
        expect(document.stars).toBe(validStars);
        expect(document.accountId).toBe(validAccountId);
    });

    it('should have correct ID constant', () => {
        expect(MovieRatingDocument.ID).toBe('id');
    });

    it('should have correct TITLE constant', () => {
        expect(MovieRatingDocument.TITLE).toBe('title');
    });

    it('should have correct DESCRIPTION constant', () => {
        expect(MovieRatingDocument.DESCRIPTION).toBe('description');
    });

    it('should have correct STARS constant', () => {
        expect(MovieRatingDocument.STARS).toBe('stars');
    });

    it('should extend ReadmodelDocument class', () => {
        const document = new MovieRatingDocument(validId, validTitle, validDescription, validStars, validAccountId);

        expect(document).toBeInstanceOf(ReadmodelDocument);
    });

    it('should call parent constructor with correct mapping', () => {
        const document = new MovieRatingDocument(validId, validTitle, validDescription, validStars, validAccountId);

        expect(document).toHaveProperty('id', validId);
        expect(document).toHaveProperty('title', validTitle);
        expect(document).toHaveProperty('description', validDescription);
        expect(document).toHaveProperty('stars', validStars);
        expect(document).toHaveProperty('accountId', validAccountId);
    });
});
