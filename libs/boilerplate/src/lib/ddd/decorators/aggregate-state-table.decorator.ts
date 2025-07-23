import { applyDecorators } from '@nestjs/common';
import { Column, ColumnOptions, Entity, EntityOptions } from 'typeorm';

export const AggregateStateTable = (options: EntityOptions) => {
    return applyDecorators(
        Entity(options)
    );
}

export const AggregateStateTableField = (options: ColumnOptions) => {
    return applyDecorators(
        Column(options)
    );
}
