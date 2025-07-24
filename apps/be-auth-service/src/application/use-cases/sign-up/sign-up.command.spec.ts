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

    it('should return the username passed in constructor', () => {
        const command = new SignUpCommand(validUsername, validPassword);

        expect(command.getUsername()).toBe(validUsername);
        expect(command.getUsername().toString()).toBe('john.doe');
    });
    it('should return the password passed in constructor', () => {
        const command = new SignUpCommand(validUsername, validPassword);

        expect(command.getPassword()).toBe(validPassword);
        expect(command.getPassword().toString()).toBe('ValidPW1!');
    });

    it('should extend Command class', () => {
        const command = new SignUpCommand(validUsername, validPassword);

        expect(command).toBeInstanceOf(Command);
    });
});