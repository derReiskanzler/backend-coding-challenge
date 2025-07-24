import { Command } from '@backend-monorepo/boilerplate';
import { Password, Username } from '@backend-monorepo/domain';
import { SignUpCommand } from './sign-up.command';

describe('SignUpCommand', () => {
    let validUsername: Username;
    let validPassword: Password;

    beforeEach(() => {
        validUsername = Username.fromString('john.doe');
        validPassword = Password.fromString('ValidPW1!');
    });

    it('should create instance with valid username and password', () => {
        const command = new SignUpCommand(validUsername, validPassword);

        expect(command).toBeInstanceOf(SignUpCommand);
        expect(command).toBeInstanceOf(Command);
    });

    it('should store username and password correctly', () => {
        const command = new SignUpCommand(validUsername, validPassword);

        expect(command.getUsername()).toBe(validUsername);
        expect(command.getPassword()).toBe(validPassword);
    });

    it('should extend Command class', () => {
        const command = new SignUpCommand(validUsername, validPassword);

        expect(command).toBeInstanceOf(Command);
    });
});