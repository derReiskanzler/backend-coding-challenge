import { Paging, PagingDto, Sort } from '@backend-monorepo/boilerplate';
import { MovieRatingDocument } from '../../documents/movie-rating.document';
import { GetMovieRatingsQueryDto } from './get-movie-ratings-query.dto';

export abstract class GetMovieRatingsDocumentRepositoryInterface {
    public abstract getMany(dto: GetMovieRatingsQueryDto, paging: Paging, sort?: Sort): Promise<PagingDto<MovieRatingDocument>>
}