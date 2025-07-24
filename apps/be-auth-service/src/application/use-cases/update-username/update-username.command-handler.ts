import {
    CommandHandler,
    ICommandHandler,
} from '@backend-monorepo/boilerplate';
import { UpdateUsernameCommand } from './update-username.command';
import { AccountRepositoryInterface } from './account.repository.interface';
import { AccountReadRepositoryInterface } from './account-read.repository.interface';
import { AccountNotFoundException } from '../../exceptions/account-not-found.exception';

@CommandHandler(UpdateUsernameCommand)
export class UpdateUsernameCommandHandler extends ICommandHandler<UpdateUsernameCommand,void> {
    constructor(
        private readonly accountWriteRepository: AccountRepositoryInterface,
        private readonly accountReadRepository: AccountReadRepositoryInterface,
    ) {
        super();
    }

    public async execute(command: UpdateUsernameCommand): Promise<void> {
        const account = await this.accountReadRepository.getById(command.getId().toString());
        if (!account) {
            throw AccountNotFoundException.withId(command.getId().toString());
        }

        account.updateUsername(command.getUsername());

        await this.accountWriteRepository.save(account, command);
    }
}