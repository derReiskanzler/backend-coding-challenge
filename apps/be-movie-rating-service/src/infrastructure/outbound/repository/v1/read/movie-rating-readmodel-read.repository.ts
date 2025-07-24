import { Injectable } from '@nestjs/common';
import {
    ReadmodelRepository,
    ReadmodelEnum,
    ReadmodelReadRepository,
    Paging,
    Sort,
    PagingDto,
} from '@backend-monorepo/boilerplate';
import { MovieRatingDocument } from '../../../../../application/documents/movie-rating.document';
import { GetMovieRatingDocumentRepositoryInterface } from '../../../../../application/use-cases/get-movie-rating/get-movie-rating-document.repository.interface';
import { GetMovieRatingsQueryDto } from '../../../../../application/use-cases/get-movie-ratings/get-movie-ratings-query.dto';
import { GetMovieRatingsDocumentRepositoryInterface } from '../../../../../application/use-cases/get-movie-ratings/get-movie-ratings-document.repository.interface';

@Injectable()
@ReadmodelRepository(ReadmodelEnum.MOVIE_RATING_MOVIE_RATINGS_V1_READMODEL, MovieRatingDocument)
export class MovieRatingV1ReadmodelReadRepository extends ReadmodelReadRepository implements
    GetMovieRatingDocumentRepositoryInterface,
    GetMovieRatingsDocumentRepositoryInterface
{
    public async getById(id: string): Promise<MovieRatingDocument|null> {
        return await this.getDocument<MovieRatingDocument>({ id });
    }

    public async getMany(dto: GetMovieRatingsQueryDto, paging: Paging, sort?: Sort): Promise<PagingDto<MovieRatingDocument>> {
        return await this.getDocuments<MovieRatingDocument>(dto, paging, sort);
    }
}
