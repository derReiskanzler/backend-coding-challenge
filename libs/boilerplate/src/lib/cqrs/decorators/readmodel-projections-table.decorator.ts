import { applyDecorators } from '@nestjs/common';
import { Column, ColumnOptions, Entity, EntityOptions } from 'typeorm';

export const ReadmodelProjectionsTable = (options: EntityOptions) => {
    return applyDecorators(
        Entity(options)
    );
}

export const ReadmodelProjectionsTableField = (options: ColumnOptions) => {
    return applyDecorators(
        Column(options)
    );
}
