import { DomainEvent } from '@backend-monorepo/boilerplate';

export class UserSignedUpEvent extends DomainEvent {
    private constructor(
        private readonly id: string,
        private readonly username: string,
        private readonly passwordHash: string,
        private readonly salt: string,
        private readonly createdAt: Date = new Date(),
    ) { super(); }

    public static create(
        id: string,
        username: string,
        passwordHash: string,
        salt: string,
    ): UserSignedUpEvent {
        return new UserSignedUpEvent(
            id,
            username,
            passwordHash,
            salt,
        );
    }

    public getEventName(): string {
        return `${UserSignedUpEvent.name}`;
    }

    public getId(): string {
        return this.id;
    }

    public getUsername(): string {
        return this.username;
    }

    public getPasswordHash(): string {
        return this.passwordHash;
    }

    public getSalt(): string {
        return this.salt;
    }

    public getCreatedAt(): Date {
        return this.createdAt;
    }
}