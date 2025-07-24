import { AggregateState } from '@backend-monorepo/boilerplate';

export class MovieRatingState extends AggregateState {
    public static ID = 'id';
    public static TITLE = 'title';
    public static DESCRIPTION = 'description';
    public static STARS = 'stars';
    public static ACCOUNT_ID = 'accountId';
    public static CREATED_AT = 'createdAt';

    private readonly id: string;
    private readonly title: string;
    private readonly description: string;
    private readonly stars: number;
    private readonly accountId: string;
    private readonly createdAt: Date;

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

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    protected initialize(): void {
    }
}
