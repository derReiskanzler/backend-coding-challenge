import { AggregateRoot, Command } from '@backend-monorepo/boilerplate';

export abstract class AccountRepositoryInterface {
    public abstract save(aggregate: AggregateRoot, command: Command): void;
}