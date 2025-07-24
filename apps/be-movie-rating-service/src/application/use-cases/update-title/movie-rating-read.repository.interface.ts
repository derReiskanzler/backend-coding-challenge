import { MovieRating } from '../../../domain/aggregates/movie-rating.aggregate';

export abstract class MovieRatingReadRepositoryInterface {
  public abstract getById(id: string): Promise<MovieRating|null>
}