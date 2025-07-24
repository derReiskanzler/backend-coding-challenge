import { Command } from '@backend-monorepo/boilerplate';
import { Password, Username } from '@backend-monorepo/domain';

export class SignUpCommand extends Command {
    constructor(
        private readonly username: Username,
        private readonly password: Password,
    ) {
        super();
    }

    public getUsername(): Username {
        return this.username;
    }

    public getPassword(): Password {
        return this.password;
    }
}