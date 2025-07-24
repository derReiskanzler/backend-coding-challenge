import { AggregateRoot, Command } from '@backend-monorepo/boilerplate';

export abstract class MovieRatingRepositoryInterface {
  public abstract save(aggregate: AggregateRoot, command: Command): void;
}