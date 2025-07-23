import { applyDecorators, SetMetadata } from '@nestjs/common';
import { ObjectTypeEnum } from '../../config/object-type.enum';
import { AggregateStateEnum } from '../../config/aggregate-state.enum';

/**
 * Decorator to set the aggregate state repository metadata
 * for an aggregate state repository to enable database communication
 * 
 * @param normalizedAggregateStateClass aggregate state class name used to access corresponding table in the database
 * @param denormalizedAggregateStateClass aggregate state class name used to parse the state from the database
 * @param aggregateClass aggregate class name to reconstitute the aggregate based on the normalized & denormalized state class names
 * @returns 
*/
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const AggregateStateRepository = (normalizedAggregateStateClass: AggregateStateEnum, denormalizedAggregateStateClass: any, aggregateClass?: any) => {
    const decorators = [
        SetMetadata(ObjectTypeEnum.AGGREGATE_STATE_TABLE, normalizedAggregateStateClass),
        SetMetadata(ObjectTypeEnum.AGGREGATE_STATE_CLASS, denormalizedAggregateStateClass),
    ];

    if (aggregateClass) {
        decorators.push(SetMetadata(ObjectTypeEnum.AGGREGATE_CLASS, aggregateClass),);
    }

    return applyDecorators(...decorators);
}
