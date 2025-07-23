import { EventStreamEnum } from '../../config';
import { BaseStreamEvent } from '../../event-sourcing/database-abstractions/base-stream-event';
import { EventStreamTable } from '../../event-sourcing/decorators/event-stream-table.decorator';

@EventStreamTable({
    name: EventStreamEnum.AUTH_ACCOUNTS_V1_STREAM,
})
export class AuthAccountsV1Stream extends BaseStreamEvent {

}
