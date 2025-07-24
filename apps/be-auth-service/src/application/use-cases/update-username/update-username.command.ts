import { Command } from '@backend-monorepo/boilerplate';
import { AccountId, Username } from '@backend-monorepo/domain';

export class UpdateUsernameCommand extends Command {
    constructor(
        private readonly id: AccountId,
        private readonly username: Username,
    ) {
        super();
    }

    public getId(): AccountId {
        return this.id;
    }

    public getUsername(): Username {
        return this.username;
    }
}