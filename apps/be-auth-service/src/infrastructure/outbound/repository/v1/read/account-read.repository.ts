import { Injectable } from '@nestjs/common';
import {
    AggregateReadMode,
    AggregateReadRepository,
    AggregateStateEnum,
    AggregateStateRepository,
    EventStreamEnum,
    EventStreamRepository,
    ReadModeEnum,
} from '@backend-monorepo/boilerplate';
import { Account } from '../../../../../domain/aggregates/account.aggregate';
import { AccountState } from '../../../../../domain/aggregates/account.state';
import { authEventMapping } from '@backend-monorepo/domain';
import { AccountReadRepositoryInterface as GetUpdateUsernameRepositoryInterface } from '../../../../../application/use-cases/update-username/account-read.repository.interface';

@Injectable()
@EventStreamRepository(EventStreamEnum.AUTH_ACCOUNTS_V1_STREAM, authEventMapping)
@AggregateStateRepository(AggregateStateEnum.AUTH_ACCOUNTS_V1_STATE, AccountState, Account)
@AggregateReadMode(ReadModeEnum.FROM_STATE)
export class AccountV1ReadRepository extends AggregateReadRepository implements GetUpdateUsernameRepositoryInterface {
    public async getById(id: string): Promise<Account|null> {
        return await this.getAggregate<Account>(id);
    }
}
