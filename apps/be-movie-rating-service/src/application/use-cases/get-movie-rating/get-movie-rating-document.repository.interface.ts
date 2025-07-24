import { MovieRatingDocument } from '../../documents/movie-rating.document';

export abstract class GetMovieRatingDocumentRepositoryInterface {
    public abstract getById(id: string): Promise<MovieRatingDocument|null>
}