import { ICommand } from '@nestjs/cqrs';
import { UuidGenerator } from '../../util/uuid-generator/uuid-generator';

export abstract class Command implements ICommand {
    private readonly commandId: string;
    
    constructor() {
        this.commandId = UuidGenerator.generate();
    }

    public getCommandId(): string {
        return this.commandId;
    }

    public getCommandName(): string {
        return this.constructor.name;
    }
}