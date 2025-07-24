import {
    CommandHandler,
    ICommandHandler,
    UuidGenerator,
} from '@backend-monorepo/boilerplate';
import { SignUpCommand } from './sign-up.command';
import { Account } from '../../../domain/aggregates/account.aggregate';
import { AccountId, Username } from '@backend-monorepo/domain';
import { AccountRepositoryInterface } from './account.repository.interface';
import { UsersReadmodelReadRepositoryInterface } from './users-readmodel-read.repository.interface';

@CommandHandler(SignUpCommand)
export class SignUpCommandHandler extends ICommandHandler<SignUpCommand,string> {
    constructor(
        private readonly accountWriteRepository: AccountRepositoryInterface,
        private readonly accountReadRepository: UsersReadmodelReadRepositoryInterface,
    ) {
        super();
    }

    public async execute(command: SignUpCommand): Promise<string> {
        const accountId = AccountId.fromString(UuidGenerator.generate());
        const existingAccount = await this.accountReadRepository.getByUsername(command.getUsername().toString());

        const account = Account.signUp(
            existingAccount?.username ? Username.fromString(existingAccount.username) : null,
            {
                accountId,
                username: command.getUsername(),
                password: command.getPassword(),
            },
        );

        await this.accountWriteRepository.save(account, command);
        
        return accountId.toString();
    }
}