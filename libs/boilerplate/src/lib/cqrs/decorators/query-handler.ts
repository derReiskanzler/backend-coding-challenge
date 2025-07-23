import { IQuery, IQueryHandler as INestQueryHandler, QueryHandler as NestQueryHander } from '@nestjs/cqrs';
import { applyDecorators } from '@nestjs/common';

export const QueryHandler = (command: IQuery) => {
    return applyDecorators(
        NestQueryHander(command)
    );
}

export abstract class IQueryHandler<TCommand extends IQuery, ReturnType> implements INestQueryHandler<IQuery> {
    public abstract execute(command: TCommand): Promise<ReturnType>;
}