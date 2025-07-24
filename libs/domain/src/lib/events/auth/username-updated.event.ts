import { DomainEvent } from '@backend-monorepo/boilerplate';

export class UsernameUpdatedEvent extends DomainEvent {
    private constructor(
        private readonly id: string,
        private readonly username: string,
        private readonly createdAt: Date = new Date(),
    ) { super(); }

    public static create(
        id: string,
        username: string,
    ): UsernameUpdatedEvent {
        return new UsernameUpdatedEvent(
            id,
            username,
        );
    }

    public getEventName(): string {
        return `${UsernameUpdatedEvent.name}`;
    }

    public getId(): string {
        return this.id;
    }

    public getUsername(): string {
        return this.username;
    }

    public getCreatedAt(): Date {
        return this.createdAt;
    }
}