import { Injectable } from '@nestjs/common';
import {
    AggregateWriteRepository,
    AggregateRoot,
    Command,
    EventStreamRepository,
    AggregateStateRepository,
    EventStreamEnum,
    AggregateStateEnum,
} from '@backend-monorepo/boilerplate';
import { AccountState } from '../../../../../domain/aggregates/account.state';
import { AccountRepositoryInterface as SignUpRepositoryInterface } from '../../../../../application/use-cases/sign-up/account.repository.interface';
import { AccountRepositoryInterface as UpdateUsernameRepositoryInterface } from '../../../../../application/use-cases/update-username/account.repository.interface';

@Injectable()
@EventStreamRepository(EventStreamEnum.AUTH_ACCOUNTS_V1_STREAM)
@AggregateStateRepository(AggregateStateEnum.AUTH_ACCOUNTS_V1_STATE, AccountState)
export class AccountV1WriteRepository extends AggregateWriteRepository implements
    SignUpRepositoryInterface,
    UpdateUsernameRepositoryInterface
{
    public async save(aggregate: AggregateRoot, command: Command): Promise<void> {
        await this.saveAggregate(aggregate, command);
    }
}
