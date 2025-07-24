import { Query } from '@backend-monorepo/boilerplate';
import { MovieRatingId } from '@backend-monorepo/domain';

export class GetMovieRatingQuery extends Query {
    constructor(
        private readonly id: MovieRatingId,
    ) {
        super();
    }

    public getId(): MovieRatingId {
        return this.id;
    }
}
