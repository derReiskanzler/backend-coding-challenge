import { ReadmodelProjectionsTable, ReadmodelProjectionsTableField } from '../decorators/readmodel-projections-table.decorator';
import { ReadmodelProjectionsEnum } from '../../config/readmodel-projections.enum';

@ReadmodelProjectionsTable({ name: ReadmodelProjectionsEnum.READMODEL_PROJECTIONS })
export class ReadmodelProjections {
    @ReadmodelProjectionsTableField({
        type: 'text',
        primary: true,
        unique: true,
        nullable: false,
    })
    readmodel: string;

    @ReadmodelProjectionsTableField({
        type: 'uuid',
        default: null,
        nullable: true,
    })
    lastProcessedEventId: string|null;

    @ReadmodelProjectionsTableField({
        type: 'int',
        default: 0,
        nullable: false,
    })
    processedEventCount: number;
}