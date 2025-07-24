import { Command } from '@backend-monorepo/boilerplate';
import { Description, MovieRatingId } from '@backend-monorepo/domain';
import { UpdateDescriptionCommand } from './update-description.command';

describe('UpdateDescriptionCommand', () => {
    let validId: MovieRatingId;
    let validDescription: Description;

    beforeEach(() => {
        validId = MovieRatingId.fromString('123e4567-e89b-12d3-a456-426614174000');
        validDescription = Description.fromString('Matrix Description');
    });

    it('should create instance with valid id and description', () => {
        const command = new UpdateDescriptionCommand(validId, validDescription);

        expect(command).toBeInstanceOf(UpdateDescriptionCommand);
        expect(command).toBeInstanceOf(Command);
    });

    it('should store id and description correctly', () => {
        const command = new UpdateDescriptionCommand(validId, validDescription);

        expect(command.getId()).toBe(validId);
        expect(command.getDescription()).toBe(validDescription);
    });

    it('should extend Command class', () => {
        const command = new UpdateDescriptionCommand(validId, validDescription);

        expect(command).toBeInstanceOf(Command);
    });
});