import { Command } from '@backend-monorepo/boilerplate';
import { AccountId, Description, MovieRatingStars, Title } from '@backend-monorepo/domain';
import { CreateMovieRatingCommand } from './create-movie-rating.command';

describe('CreateMovieRatingCommand', () => {
    let validTitle: Title;
    let validDescription: Description;
    let validStars: MovieRatingStars;
    let validAccountId: AccountId;

    beforeEach(() => {
        validTitle = Title.fromString('The Matrix');
        validDescription = Description.fromString('A computer hacker learns about the true nature of his reality and his role in the war against its controllers.');
        validStars = MovieRatingStars.fromNumber(5);
        validAccountId = AccountId.fromString('123e4567-e89b-12d3-a456-426614174000');
    });

    it('should create instance with valid title, description, stars and accountId', () => {
        const command = new CreateMovieRatingCommand(validTitle, validDescription, validStars, validAccountId);

        expect(command).toBeInstanceOf(CreateMovieRatingCommand);
        expect(command).toBeInstanceOf(Command);
    });

    it('should store title, description, stars and accountId correctly', () => {
        const command = new CreateMovieRatingCommand(validTitle, validDescription, validStars, validAccountId);

        expect(command.getTitle()).toBe(validTitle);
        expect(command.getDescription()).toBe(validDescription);
        expect(command.getStars()).toBe(validStars);
        expect(command.getAccountId()).toBe(validAccountId);
    });

    it('should extend Command class', () => {
        const command = new CreateMovieRatingCommand(validTitle, validDescription, validStars, validAccountId);

        expect(command).toBeInstanceOf(Command);
    });
});