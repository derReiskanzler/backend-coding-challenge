import { ICommand, ICommandHandler as INestCommandHandler, CommandHandler as NestCommandHander } from '@nestjs/cqrs';
import { applyDecorators } from '@nestjs/common';

export const CommandHandler = (command: ICommand) => {
    return applyDecorators(
        NestCommandHander(command)
    );
}

export abstract class ICommandHandler<TCommand extends ICommand, ReturnType> implements INestCommandHandler<ICommand> {
    public abstract execute(command: TCommand): Promise<ReturnType>;
}