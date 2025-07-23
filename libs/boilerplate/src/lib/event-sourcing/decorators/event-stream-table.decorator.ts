import { applyDecorators } from '@nestjs/common';
import { Column, ColumnOptions, Entity, EntityOptions, Generated } from 'typeorm';

export const EventStreamTable = (options: EntityOptions) => {
    return applyDecorators(
        Entity(options)
    );
}

export const EventStreamTableField = (options: ColumnOptions) => {
    return applyDecorators(
        Column(options)
    );
}

export const AutoIncrement = (strategy?: AutoIncrementStrategyEnum) => {
    return applyDecorators(
        Generated(strategy)
    );
}

export enum AutoIncrementStrategyEnum {
    INCREMENT = 'increment',
    UUID = 'uuid',
    ROWID = 'rowid',
}