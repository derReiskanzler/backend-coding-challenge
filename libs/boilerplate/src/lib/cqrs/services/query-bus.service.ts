import { Injectable } from '@nestjs/common';
import { IQuery, QueryBus } from '@nestjs/cqrs';

@Injectable()
export class QueryBusService {
    constructor(private readonly queryBus: QueryBus) {}

    public async dispatch<ReturnType>(query: IQuery): Promise<ReturnType> {
        return await this.queryBus.execute(query);
    }
}