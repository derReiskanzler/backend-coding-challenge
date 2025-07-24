import { DomainEvent } from '@backend-monorepo/boilerplate';

export class MovieRatingTitleUpdatedEvent extends DomainEvent {
    private constructor(
        private readonly id: string,
        private readonly title: string,
        private readonly createdAt: Date = new Date(),
    ) { super(); }

    public static create(
        id: string,
        title: string,
    ): MovieRatingTitleUpdatedEvent {
        return new MovieRatingTitleUpdatedEvent(
            id,
            title,
        );
    }

    public getEventName(): string {
        return `${MovieRatingTitleUpdatedEvent.name}`;
    }

    public getId(): string {
        return this.id;
    }

    public getTitle(): string {
        return this.title;
    }

    public getCreatedAt(): Date {
        return this.createdAt;
    }
}