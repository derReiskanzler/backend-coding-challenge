import { IQueryHandler, PagingDto, QueryHandler } from '@backend-monorepo/boilerplate';
import { GetMovieRatingsQuery } from './get-movie-ratings.query';
import { GetMovieRatingsDocumentRepositoryInterface } from './get-movie-ratings-document.repository.interface';
import { MovieRatingDocument } from '../../documents/movie-rating.document';

@QueryHandler(GetMovieRatingsQuery)
export class GetMovieRatingsQueryHandler extends IQueryHandler<GetMovieRatingsQuery, PagingDto<MovieRatingDocument>> {
    constructor(
        private readonly movieRatingReadRepository: GetMovieRatingsDocumentRepositoryInterface,
    ) {
        super();
    }

    public async execute(query: GetMovieRatingsQuery): Promise<PagingDto<MovieRatingDocument>> {
        return await this.movieRatingReadRepository.getMany(
            {
                accountId: query.getAccountId()?.toString(),
                title: query.getTitle()?.toString(),
            },
            {
                skip: query.getSkip(),
                take: query.getTake(),
            },
            {
                field: query.getSortField(),
                direction: query.getSortDirection(),
            },
        );
    }
}
