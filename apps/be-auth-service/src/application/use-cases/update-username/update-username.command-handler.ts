import {
    CommandHandler,
    ICommandHandler,
} from '@backend-monorepo/boilerplate';
import { UpdateUsernameCommand } from './update-username.command';
import { AccountRepositoryInterface } from './account.repository.interface';
import { AccountReadRepositoryInterface } from './account-read.repository.interface';
import { AccountNotFoundException } from '../../exceptions/account-not-found.exception';
import { GetUsersDocumentRepositoryInterface } from './get-users-document.repository.interface';
import { AccountAlreadyExistsException } from '../../../domain/exceptions/account-already-exists.exception';

@CommandHandler(UpdateUsernameCommand)
export class UpdateUsernameCommandHandler extends ICommandHandler<UpdateUsernameCommand,void> {
    constructor(
        private readonly accountWriteRepository: AccountRepositoryInterface,
        private readonly accountReadRepository: AccountReadRepositoryInterface,
        private readonly getUsersDocumentRepository: GetUsersDocumentRepositoryInterface,
    ) {
        super();
    }

    public async execute(command: UpdateUsernameCommand): Promise<void> {
        const user = await this.getUsersDocumentRepository.getByUsername(command.getUsername().toString());
        if (user) {
            throw AccountAlreadyExistsException.withUsername(command.getUsername().toString());
        }

        const account = await this.accountReadRepository.getById(command.getId().toString());
        if (!account) {
            throw AccountNotFoundException.withId(command.getId().toString());
        }

        account.updateUsername(command.getUsername());

        await this.accountWriteRepository.save(account, command);
    }
}