import { DomainEvent } from '@backend-monorepo/boilerplate';

export class MovieRatingDescriptionUpdatedEvent extends DomainEvent {
    private constructor(
        private readonly id: string,
        private readonly description: string,
        private readonly createdAt: Date = new Date(),
    ) { super(); }

    public static create(
        id: string,
        description: string,
    ): MovieRatingDescriptionUpdatedEvent {
        return new MovieRatingDescriptionUpdatedEvent(
            id,
            description,
        );
    }

    public getEventName(): string {
        return `${MovieRatingDescriptionUpdatedEvent.name}`;
    }

    public getId(): string {
        return this.id;
    }

    public getDescription(): string {
        return this.description;
    }

    public getCreatedAt(): Date {
        return this.createdAt;
    }
}