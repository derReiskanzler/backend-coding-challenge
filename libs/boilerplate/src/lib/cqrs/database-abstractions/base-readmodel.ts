import { Metadata } from '../../event-sourcing';
import { ReadmodelTableField } from '../decorators/readmodel-table.decorator';

export abstract class BaseReadmodel {
    @ReadmodelTableField({
        type: 'uuid',
        primary: true,
        unique: true,
        nullable: false,
    })
    id: string;

    @ReadmodelTableField({
        type: 'jsonb',
        nullable: false,
    })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    document: Record<string, any>;

    @ReadmodelTableField({
        type: 'jsonb',
        nullable: true,
    })
    meta: Metadata;

    @ReadmodelTableField({
        type: 'timestamptz',
        nullable: false,
        default: () => 'CURRENT_TIMESTAMP',
    })
    createdAt: Date;
}