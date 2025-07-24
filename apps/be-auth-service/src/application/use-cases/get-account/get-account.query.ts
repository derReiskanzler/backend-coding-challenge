import { Query } from '@backend-monorepo/boilerplate';
import { AccountId } from '@backend-monorepo/domain';

export class GetAccountQuery extends Query {
    constructor(
        private readonly id: AccountId,
    ) {
        super();
    }

    public getId(): AccountId {
        return this.id;
    }
}
