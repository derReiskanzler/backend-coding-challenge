import { Command } from '@backend-monorepo/boilerplate';
import { MovieRatingId, MovieRatingStars } from '@backend-monorepo/domain';
import { UpdateStarsCommand } from './update-stars.command';

describe('UpdateStarsCommand', () => {
    let validId: MovieRatingId;
    let validStars: MovieRatingStars;

    beforeEach(() => {
        validId = MovieRatingId.fromString('123e4567-e89b-12d3-a456-426614174000');
        validStars = MovieRatingStars.fromNumber(5);
    });

    it('should create instance with valid id and stars', () => {
        const command = new UpdateStarsCommand(validId, validStars);

        expect(command).toBeInstanceOf(UpdateStarsCommand);
        expect(command).toBeInstanceOf(Command);
    });

    it('should store id and stars correctly', () => {
        const command = new UpdateStarsCommand(validId, validStars);

        expect(command.getId()).toBe(validId);
        expect(command.getStars()).toBe(validStars);
    });

    it('should extend Command class', () => {
        const command = new UpdateStarsCommand(validId, validStars);

        expect(command).toBeInstanceOf(Command);
    });
});