import { Command } from '@backend-monorepo/boilerplate';
import { AccountId, Username } from '@backend-monorepo/domain';
import { UpdateUsernameCommand } from './update-username.command';

describe('UpdateUsernameCommand', () => {
    let validId: AccountId;
    let validUsername: Username;

    beforeEach(() => {
        validId = AccountId.fromString('123e4567-e89b-12d3-a456-426614174000');
        validUsername = Username.fromString('john.doe');
    });

    it('should create instance with valid id and username', () => {
        const command = new UpdateUsernameCommand(validId, validUsername);

        expect(command).toBeInstanceOf(UpdateUsernameCommand);
        expect(command).toBeInstanceOf(Command);
    });

    it('should store id and username correctly', () => {
        const command = new UpdateUsernameCommand(validId, validUsername);

        expect(command.getUsername()).toBe(validUsername);
        expect(command.getId()).toBe(validId);
    });

    it('should extend Command class', () => {
        const command = new UpdateUsernameCommand(validId, validUsername);

        expect(command).toBeInstanceOf(Command);
    });
});