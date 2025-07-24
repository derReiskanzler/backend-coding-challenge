import { Command } from '@backend-monorepo/boilerplate';
import { Description, MovieRatingId } from '@backend-monorepo/domain';

export class UpdateDescriptionCommand extends Command {
    constructor(
        private readonly id: MovieRatingId,
        private readonly description: Description,
    ) {
        super();
    }

    public getId(): MovieRatingId {
        return this.id;
    }

    public getDescription(): Description {
        return this.description;
    }
}