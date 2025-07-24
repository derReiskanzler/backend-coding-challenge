import { DomainEvent } from '@backend-monorepo/boilerplate';

export class MovieRatingCreatedEvent extends DomainEvent {
    private constructor(
        private readonly id: string,
        private readonly title: string,
        private readonly description: string,
        private readonly stars: number,
        private readonly accountId: string,
        private readonly createdAt: Date = new Date(),
    ) { super(); }

    public static create(
        id: string,
        title: string,
        description: string,
        stars: number,
        accountId: string,
    ): MovieRatingCreatedEvent {
        return new MovieRatingCreatedEvent(
            id,
            title,
            description,
            stars,
            accountId,
        );
    }

    public getEventName(): string {
        return `${MovieRatingCreatedEvent.name}`;
    }

    public getId(): string {
        return this.id;
    }

    public getTitle(): string {
        return this.title;
    }

    public getDescription(): string {
        return this.description;
    }

    public getStars(): number {
        return this.stars;
    }

    public getAccountId(): string {
        return this.accountId;
    }

    public getCreatedAt(): Date {
        return this.createdAt;
    }
}