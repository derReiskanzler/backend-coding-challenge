import { AggregateStateTable, AggregateStateEnum, BaseAggregateState } from '@backend-monorepo/boilerplate';

@AggregateStateTable({
    name: AggregateStateEnum.AUTH_ACCOUNTS_V1_STATE,
})
export class AuthAccountsV1StateTable extends BaseAggregateState {

}
