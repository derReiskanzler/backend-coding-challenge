import { AggregateStateTableField } from '../decorators/aggregate-state-table.decorator';

export abstract class BaseAggregateState {
    @AggregateStateTableField({
        type: 'uuid',
        primary: true,
        unique: true,
        nullable: false,
    })
    id: string;

    @AggregateStateTableField({
        type: 'jsonb',
        nullable: false,
    })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    state: Record<string, any>;

    @AggregateStateTableField({
        type: 'int',
        nullable: false,
    })
    version: number;

    @AggregateStateTableField({
        type: 'timestamptz',
        nullable: false,
    })
    createdAt: Date;
}