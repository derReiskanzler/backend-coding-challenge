import { Injectable } from '@nestjs/common';
import { CommandBus, ICommand } from '@nestjs/cqrs';

@Injectable()
export class CommandBusService {
    constructor(private readonly commandBus: CommandBus) {}

    public async dispatch<ReturnType>(command: ICommand): Promise<ReturnType> {
        return await this.commandBus.execute(command);
    }
}