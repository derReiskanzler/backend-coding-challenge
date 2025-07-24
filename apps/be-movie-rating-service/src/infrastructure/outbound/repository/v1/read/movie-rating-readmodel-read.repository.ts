import { Injectable } from '@nestjs/common';
import {
    ReadmodelRepository,
    ReadmodelEnum,
    ReadmodelReadRepository,
} from '@backend-monorepo/boilerplate';
import { MovieRatingDocument } from '../../../../../application/documents/movie-rating.document';
import { GetMovieRatingDocumentRepositoryInterface } from '../../../../../application/use-cases/get-movie-rating/get-movie-rating-document.repository.interface';

@Injectable()
@ReadmodelRepository(ReadmodelEnum.MOVIE_RATING_MOVIE_RATINGS_V1_READMODEL, MovieRatingDocument)
export class MovieRatingV1ReadmodelReadRepository extends ReadmodelReadRepository implements GetMovieRatingDocumentRepositoryInterface {
    public async getById(id: string): Promise<MovieRatingDocument|null> {
        return await this.getDocument<MovieRatingDocument>({ id });
    }
}
