import { Command } from '@backend-monorepo/boilerplate';
import { MovieRatingId, Title } from '@backend-monorepo/domain';

export class UpdateTitleCommand extends Command {
    constructor(
        private readonly id: MovieRatingId,
        private readonly title: Title,
    ) {
        super();
    }

    public getId(): MovieRatingId {
        return this.id;
    }

    public getTitle(): Title {
        return this.title;
    }
}