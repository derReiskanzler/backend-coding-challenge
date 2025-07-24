import { Command } from '@backend-monorepo/boilerplate';
import { MovieRatingId, Title } from '@backend-monorepo/domain';
import { UpdateTitleCommand } from './update-title.command';

describe('UpdateTitleCommand', () => {
    let validId: MovieRatingId;
    let validTitle: Title;

    beforeEach(() => {
        validId = MovieRatingId.fromString('123e4567-e89b-12d3-a456-426614174000');
        validTitle = Title.fromString('The Matrix');
    });

    it('should create instance with valid id and title', () => {
        const command = new UpdateTitleCommand(validId, validTitle);

        expect(command).toBeInstanceOf(UpdateTitleCommand);
        expect(command).toBeInstanceOf(Command);
    });

    it('should store id and title correctly', () => {
        const command = new UpdateTitleCommand(validId, validTitle);

        expect(command.getId()).toBe(validId);
        expect(command.getTitle()).toBe(validTitle);
    });

    it('should extend Command class', () => {
        const command = new UpdateTitleCommand(validId, validTitle);

        expect(command).toBeInstanceOf(Command);
    });
});