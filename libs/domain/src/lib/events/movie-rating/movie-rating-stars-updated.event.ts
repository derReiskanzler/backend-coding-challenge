import { DomainEvent } from '@backend-monorepo/boilerplate';

export class MovieRatingStarsUpdatedEvent extends DomainEvent {
    private constructor(
        private readonly id: string,
        private readonly stars: number,
        private readonly createdAt: Date = new Date(),
    ) { super(); }

    public static create(
        id: string,
        stars: number,
    ): MovieRatingStarsUpdatedEvent {
        return new MovieRatingStarsUpdatedEvent(
            id,
            stars,
        );
    }

    public getEventName(): string {
        return `${MovieRatingStarsUpdatedEvent.name}`;
    }

    public getId(): string {
        return this.id;
    }

    public getStars(): number {
        return this.stars;
    }

    public getCreatedAt(): Date {
        return this.createdAt;
    }
}