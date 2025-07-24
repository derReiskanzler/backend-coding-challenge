import { Injectable } from '@nestjs/common';
import {
    ReadmodelWriteRepository,
    ReadmodelRepository,
    ReadmodelEnum,
    Metadata,
} from '@backend-monorepo/boilerplate';
import { MovieRatingDocument } from '../../../../../application/documents/movie-rating.document';

@Injectable()
@ReadmodelRepository(ReadmodelEnum.MOVIE_RATING_MOVIE_RATINGS_V1_READMODEL, MovieRatingDocument)
export class MovieRatingMovieRatingsV1ReadmodelWriteRepository extends ReadmodelWriteRepository {
    public async upsert(movieRating: MovieRatingDocument, eventId: string, metadata: Metadata): Promise<void> {
        await this.upsertDocument(movieRating.id, movieRating, eventId, metadata);
    }

    public async deleteById(id: string, eventId: string): Promise<void> {
        await this.deleteDocument(id, eventId);
    }
}
