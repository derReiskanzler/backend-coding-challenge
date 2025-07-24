import { Command } from '@backend-monorepo/boilerplate';
import { AccountId, Description, MovieRatingStars, Title } from '@backend-monorepo/domain';

export class CreateMovieRatingCommand extends Command {
    constructor(
        private readonly title: Title,
        private readonly description: Description,
        private readonly stars: MovieRatingStars,
        private readonly accountId: AccountId,
    ) {
        super();
    }

    public getTitle(): Title {
        return this.title;
    }

    public getDescription(): Description {
        return this.description;
    }

    public getStars(): MovieRatingStars {
        return this.stars;
    }

    public getAccountId(): AccountId {
        return this.accountId;
    }
}