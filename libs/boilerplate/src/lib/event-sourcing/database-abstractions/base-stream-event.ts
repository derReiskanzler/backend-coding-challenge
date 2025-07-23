import { EventStreamTableField } from '../decorators/event-stream-table.decorator';
import { Metadata } from '../models/metadata.model';

export abstract class BaseStreamEvent {
    @EventStreamTableField({
        type: 'uuid',
        primary: true,
        unique: true,
        nullable: false,
    })
    eventId: string;

    @EventStreamTableField({
        type: 'text',
        nullable: false,
    })
    eventName: string;

    @EventStreamTableField({
        type: 'jsonb',
        nullable: false,
    })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    payload: Record<string, any>;

    @EventStreamTableField({
        type: 'jsonb',
        nullable: false,
    })
    meta: Metadata;

    @EventStreamTableField({
        type: 'timestamptz',
        nullable: false,
    })
    createdAt: Date;

    @EventStreamTableField({
        type: 'int',
        nullable: false,
    })
    version: number;
}