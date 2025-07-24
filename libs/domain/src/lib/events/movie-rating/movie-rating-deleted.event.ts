import { DomainEvent } from '@backend-monorepo/boilerplate';

export class MovieRatingDeletedEvent extends DomainEvent {
    private constructor(
        private readonly id: string,
        private readonly createdAt: Date = new Date(),
    ) { super(); }

    public static create(
        id: string,
    ): MovieRatingDeletedEvent {
        return new MovieRatingDeletedEvent(
            id,
        );
    }

    public getEventName(): string {
        return `${MovieRatingDeletedEvent.name}`;
    }

    public getId(): string {
        return this.id;
    }

    public getCreatedAt(): Date {
        return this.createdAt;
    }
}