import { Query, SortDirection } from '@backend-monorepo/boilerplate';
import { AccountId, Title } from '@backend-monorepo/domain';

export class GetMovieRatingsQuery extends Query {
    constructor(
        private readonly accountId?: AccountId,
        private readonly title?: Title,
        private readonly skip?: number,
        private readonly take?: number,
        private readonly sortField?: string,
        private readonly sortDirection?: SortDirection,
    ) {
        super();
    }

    public getAccountId(): AccountId|undefined {
        return this.accountId;
    }

    public getTitle(): Title|undefined {
        return this.title;
    }

    public getSkip(): number|undefined {
        return this.skip;
    }

    public getTake(): number|undefined {
        return this.take;
    }

    public getSortField(): string|undefined {
        return this.sortField;
    }

    public getSortDirection(): SortDirection|undefined {
        return this.sortDirection;
    }
}
