import { Command } from '@backend-monorepo/boilerplate';
import { MovieRatingId } from '@backend-monorepo/domain';
import { DeleteMovieRatingCommand } from './delete-movie-rating.command';

describe('DeleteMovieRatingCommand', () => {
    let validId: MovieRatingId;

    beforeEach(() => {
        validId = MovieRatingId.fromString('123e4567-e89b-12d3-a456-426614174000');
    });

    it('should create instance with valid id', () => {
        const command = new DeleteMovieRatingCommand(validId);

        expect(command).toBeInstanceOf(DeleteMovieRatingCommand);
        expect(command).toBeInstanceOf(Command);
    });

    it('should store id correctly', () => {
        const command = new DeleteMovieRatingCommand(validId);

        expect(command.getId()).toBe(validId);
    });

    it('should extend Command class', () => {
        const command = new DeleteMovieRatingCommand(validId);

        expect(command).toBeInstanceOf(Command);
    });
});