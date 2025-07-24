import { Command } from '@backend-monorepo/boilerplate';
import { MovieRatingId, MovieRatingStars } from '@backend-monorepo/domain';

export class UpdateStarsCommand extends Command {
    constructor(
        private readonly id: MovieRatingId,
        private readonly stars: MovieRatingStars,
    ) {
        super();
    }

    public getId(): MovieRatingId {
        return this.id;
    }

    public getStars(): MovieRatingStars {
        return this.stars;
    }
}