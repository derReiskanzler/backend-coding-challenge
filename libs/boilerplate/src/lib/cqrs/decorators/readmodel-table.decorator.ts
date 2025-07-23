import { applyDecorators } from '@nestjs/common';
import { Column, ColumnOptions, Entity, EntityOptions } from 'typeorm';

export const ReadmodelTable = (options: EntityOptions) => {
    return applyDecorators(
        Entity(options)
    );
}

export const ReadmodelTableField = (options: ColumnOptions) => {
    return applyDecorators(
        Column(options)
    );
}
