import { AggregateState } from '@backend-monorepo/boilerplate';

export class AccountState extends AggregateState {
    public static ID = 'id';
    public static USERNAME = 'username';
    public static PASSWORD_HASH = 'passwordHash';
    public static SALT = 'salt';

    private readonly id: string;
    private readonly username: string;
    private readonly passwordHash: string;
    private readonly salt: string;

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

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    protected initialize(): void {
        
    }
}
