import { IQueryHandler, QueryHandler } from '@backend-monorepo/boilerplate';
import { GetMovieRatingQuery } from './get-movie-rating.query';
import { MovieRatingDocumentNotFoundException } from '../../exceptions/movie-rating-document-not-found.exception';
import { GetMovieRatingDocumentRepositoryInterface } from './get-movie-rating-document.repository.interface';
import { MovieRatingDocument } from '../../documents/movie-rating.document';

@QueryHandler(GetMovieRatingQuery)
export class GetMovieRatingQueryHandler extends IQueryHandler<GetMovieRatingQuery,MovieRatingDocument> {
    constructor(
        private readonly movieRatingReadRepository: GetMovieRatingDocumentRepositoryInterface,
    ) {
        super();
    }

    public async execute(query: GetMovieRatingQuery): Promise<MovieRatingDocument> {
        const movieRating = await this.movieRatingReadRepository.getById(query.getId().toString());
        if (!movieRating) {
            throw MovieRatingDocumentNotFoundException.withId(query.getId().toString());
        }
        
        return movieRating;
    }
}
