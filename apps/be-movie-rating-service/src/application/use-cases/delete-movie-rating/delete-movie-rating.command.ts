import { Command } from '@backend-monorepo/boilerplate';
import { MovieRatingId } from '@backend-monorepo/domain';

export class DeleteMovieRatingCommand extends Command {
    constructor(
        private readonly id: MovieRatingId,
    ) {
        super();
    }

    public getId(): MovieRatingId {
        return this.id;
    }
}